import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, ordersTable, orderItemsTable, productsTable, usersTable } from "@workspace/db";
import { CreateOrderBody, UpdateOrderStatusBody } from "@workspace/api-zod";

const router: IRouter = Router();

/** Returns the session user or sends 401. */
async function requireAuth(req: any, res: any): Promise<{ id: number; role: string } | null> {
  const userId = req.session?.userId;
  if (!userId) {
    res.status(401).json({ error: "يجب تسجيل الدخول أولاً" });
    return null;
  }
  const [user] = await db.select({ id: usersTable.id, role: usersTable.role })
    .from(usersTable)
    .where(eq(usersTable.id, userId));
  if (!user) {
    res.status(401).json({ error: "المستخدم غير موجود" });
    return null;
  }
  return user;
}

function formatOrder(order: any, items: any[]) {
  return {
    id: order.id,
    userId: order.userId,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    customerAddress: order.customerAddress,
    currency: order.currency,
    paymentMethod: order.paymentMethod,
    status: order.status,
    totalAmount: order.totalAmount,
    items: items.map(i => ({
      id: i.id,
      productId: i.productId,
      productName: i.productName,
      quantity: i.quantity,
      price: i.price,
    })),
    createdAt: order.createdAt.toISOString(),
  };
}

// Admin sees all orders; regular user sees only their own
router.get("/orders", async (req, res): Promise<void> => {
  const user = await requireAuth(req, res);
  if (!user) return;

  const orders = user.role === "admin"
    ? await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt))
    : await db.select().from(ordersTable)
        .where(eq(ordersTable.userId, user.id))
        .orderBy(desc(ordersTable.createdAt));

  const result = await Promise.all(
    orders.map(async (order) => {
      const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, order.id));
      return formatOrder(order, items);
    })
  );

  res.json(result);
});

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { customerName, customerEmail, customerPhone, customerAddress, currency, paymentMethod, items } = parsed.data;
  const userId = (req.session as any)?.userId || null;

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const [order] = await db.insert(ordersTable).values({
    userId,
    customerName,
    customerEmail,
    customerPhone,
    customerAddress,
    currency,
    paymentMethod,
    totalAmount: String(totalAmount),
    status: "pending",
  }).returning();

  const orderItems = await Promise.all(
    items.map(async (item) => {
      const [product] = await db.select().from(productsTable).where(eq(productsTable.id, item.productId));
      const productName = product?.nameAr || "منتج غير معروف";

      const [orderItem] = await db.insert(orderItemsTable).values({
        orderId: order.id,
        productId: item.productId,
        productName,
        quantity: item.quantity,
        price: String(item.price),
      }).returning();

      return {
        id: orderItem.id,
        productId: orderItem.productId,
        productName: orderItem.productName,
        quantity: orderItem.quantity,
        price: orderItem.price,
      };
    })
  );

  res.status(201).json(formatOrder(order, orderItems));
});

// Only admin or order owner can view a specific order
router.get("/orders/:id", async (req, res): Promise<void> => {
  const user = await requireAuth(req, res);
  if (!user) return;

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "معرف غير صالح" });
    return;
  }

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
  if (!order) {
    res.status(404).json({ error: "الطلب غير موجود" });
    return;
  }

  // Non-admins can only see their own orders
  if (user.role !== "admin" && order.userId !== user.id) {
    res.status(403).json({ error: "غير مصرح" });
    return;
  }

  const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, order.id));
  res.json(formatOrder(order, items));
});

// Only admins can update order status
router.patch("/orders/:id", async (req, res): Promise<void> => {
  const user = await requireAuth(req, res);
  if (!user) return;

  if (user.role !== "admin") {
    res.status(403).json({ error: "للمدير فقط" });
    return;
  }

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "معرف غير صالح" });
    return;
  }

  const parsed = UpdateOrderStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [order] = await db.update(ordersTable).set({ status: parsed.data.status }).where(eq(ordersTable.id, id)).returning();
  if (!order) {
    res.status(404).json({ error: "الطلب غير موجود" });
    return;
  }

  const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, order.id));
  res.json(formatOrder(order, items));
});

export default router;
