import { Router, type IRouter } from "express";
import { eq, desc, and, gte, sql } from "drizzle-orm";
import { db, ordersTable, orderItemsTable, productsTable, usersTable } from "@workspace/db";
import { CreateOrderBody, UpdateOrderStatusBody } from "@workspace/api-zod";
import { notifyAdmins } from "../lib/notifications";

const router: IRouter = Router();

/** Returns the session user or sends 401. */
async function requireAuth(req: any, res: any): Promise<{ id: number; role: string } | null> {
  const userId = req.session?.userId;
  if (!userId) {
    res.status(401).json({ error: "يجب تسجيل الدخول أولاً" });
    return null;
  }
  const [user] = await db.select({
    id: usersTable.id,
    role: usersTable.role,
    mustChangePassword: usersTable.mustChangePassword,
  })
    .from(usersTable)
    .where(eq(usersTable.id, userId));
  if (!user) {
    res.status(401).json({ error: "المستخدم غير موجود" });
    return null;
  }
  if (user.role === "admin" && user.mustChangePassword) {
    res.status(403).json({ error: "يجب تغيير كلمة المرور قبل استخدام لوحة الإدارة" });
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
    totalAmount: Number(order.totalAmount),
    items: items.map(i => ({
      id: i.id,
      productId: i.productId,
      productName: i.productName,
      quantity: i.quantity,
      price: Number(i.price),
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

  if (items.length === 0) {
    res.status(400).json({ error: "لا يمكن إنشاء طلب بدون منتجات" });
    return;
  }

  const quantities = new Map<number, number>();
  for (const item of items) {
    quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
  }

  let created: { order: any; orderItems: any[]; totalAmount: number };
  try {
    created = await db.transaction(async (tx) => {
      const resolvedItems = await Promise.all(
        [...quantities.entries()].map(async ([productId, quantity]) => {
          const [product] = await tx.select().from(productsTable).where(eq(productsTable.id, productId));
          return { productId, quantity, product };
        }),
      );

      const missing = resolvedItems.find((item) => !item.product);
      if (missing) {
        throw Object.assign(new Error(`المنتج رقم ${missing.productId} غير موجود`), { statusCode: 400 });
      }

      const reservedItems: Array<{ productId: number; quantity: number; product: any }> = [];
      for (const item of resolvedItems) {
        if (item.quantity > item.product!.stockQuantity || !item.product!.inStock) {
          throw Object.assign(new Error(`الكمية المطلوبة من "${item.product!.nameAr}" غير متوفرة`), { statusCode: 409 });
        }
        const [reserved] = await tx.update(productsTable)
          .set({
            stockQuantity: sql`${productsTable.stockQuantity} - ${item.quantity}`,
            inStock: sql`${productsTable.stockQuantity} - ${item.quantity} > 0`,
          })
          .where(and(
            eq(productsTable.id, item.productId),
            gte(productsTable.stockQuantity, item.quantity),
            eq(productsTable.inStock, true),
          ))
          .returning();
        if (!reserved) {
          throw Object.assign(new Error(`تعذر حجز مخزون "${item.product!.nameAr}"، حاول مرة أخرى`), { statusCode: 409 });
        }
        reservedItems.push({ ...item, product: reserved });
      }

      const totalAmount = reservedItems.reduce(
        (sum, item) => sum + Number(item.product.price) * item.quantity,
        0,
      );
      const [order] = await tx.insert(ordersTable).values({
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

      const orderItems = [];
      for (const item of reservedItems) {
        const [orderItem] = await tx.insert(orderItemsTable).values({
          orderId: order.id,
          productId: item.productId,
          productName: item.product.nameAr,
          quantity: item.quantity,
          price: item.product.price,
        }).returning();
        orderItems.push(orderItem);
      }
      return { order, orderItems, totalAmount };
    });
  } catch (error: any) {
    if (error?.statusCode) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    throw error;
  }

  await notifyAdmins({
    type: "new_order",
    title: "طلب جديد",
    message: `طلب جديد من ${customerName} بقيمة ${created.totalAmount.toFixed(2)}`,
    entityId: created.order.id,
  });

  res.status(201).json(formatOrder(created.order, created.orderItems));
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

// Edit quantities on an existing invoice. Prices and names always come from
// the current product records; the endpoint also returns/restocks inventory
// inside the same transaction to prevent drift.
router.patch("/orders/:id/items", async (req, res): Promise<void> => {
  const user = await requireAuth(req, res);
  if (!user) return;
  const id = Number.parseInt(String(req.params.id), 10);
  const input = req.body?.items;
  if (!Number.isInteger(id) || !Array.isArray(input) || input.length === 0) {
    res.status(400).json({ error: "بيانات الفاتورة غير صالحة" });
    return;
  }

  const requested = new Map<number, number>();
  for (const item of input) {
    const productId = Number(item?.productId);
    const quantity = Number(item?.quantity);
    if (!Number.isInteger(productId) || productId <= 0 || !Number.isInteger(quantity) || quantity < 1 || quantity > 1000) {
      res.status(400).json({ error: "يجب أن تكون كميات الفاتورة أعدادًا صحيحة موجبة" });
      return;
    }
    requested.set(productId, (requested.get(productId) ?? 0) + quantity);
  }

  const [existingOrder] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
  if (!existingOrder) {
    res.status(404).json({ error: "الطلب غير موجود" });
    return;
  }
  if (user.role !== "admin" && existingOrder.userId !== user.id) {
    res.status(403).json({ error: "غير مصرح" });
    return;
  }
  if (["completed", "cancelled"].includes(existingOrder.status)) {
    res.status(409).json({ error: "لا يمكن تعديل طلب مكتمل أو ملغى" });
    return;
  }

  try {
    const updated = await db.transaction(async (tx) => {
      const oldItems = await tx.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, id));
      const oldQuantities = new Map<number, number>();
      for (const item of oldItems) {
        if (item.productId) oldQuantities.set(item.productId, (oldQuantities.get(item.productId) ?? 0) + item.quantity);
      }
      const productIds = new Set([...oldQuantities.keys(), ...requested.keys()]);
      const products = new Map<number, any>();
      for (const productId of productIds) {
        const [product] = await tx.select().from(productsTable).where(eq(productsTable.id, productId));
        if (!product) throw Object.assign(new Error(`المنتج رقم ${productId} غير موجود`), { statusCode: 400 });
        products.set(productId, product);
      }

      for (const productId of productIds) {
        const delta = (requested.get(productId) ?? 0) - (oldQuantities.get(productId) ?? 0);
        if (delta > 0) {
          const [reserved] = await tx.update(productsTable).set({
            stockQuantity: sql`${productsTable.stockQuantity} - ${delta}`,
            inStock: sql`${productsTable.stockQuantity} - ${delta} > 0`,
          }).where(and(
            eq(productsTable.id, productId),
            eq(productsTable.inStock, true),
            gte(productsTable.stockQuantity, delta),
          )).returning();
          if (!reserved) throw Object.assign(new Error(`المخزون غير كافٍ للمنتج "${products.get(productId).nameAr}"`), { statusCode: 409 });
        } else if (delta < 0) {
          await tx.update(productsTable).set({
            stockQuantity: sql`${productsTable.stockQuantity} + ${Math.abs(delta)}`,
            inStock: true,
          }).where(eq(productsTable.id, productId));
        }
      }

      await tx.delete(orderItemsTable).where(eq(orderItemsTable.orderId, id));
      const nextItems = [];
      for (const [productId, quantity] of requested) {
        const product = products.get(productId);
        const [item] = await tx.insert(orderItemsTable).values({
          orderId: id,
          productId,
          productName: product.nameAr,
          quantity,
          price: product.price,
        }).returning();
        nextItems.push(item);
      }
      const totalAmount = nextItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
      const [order] = await tx.update(ordersTable).set({ totalAmount: String(totalAmount) }).where(eq(ordersTable.id, id)).returning();
      return { order, items: nextItems };
    });
    res.json(formatOrder(updated.order, updated.items));
  } catch (error: any) {
    if (error?.statusCode) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    throw error;
  }
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

  const previousStatus = (await db.select({ status: ordersTable.status }).from(ordersTable).where(eq(ordersTable.id, id)))[0]?.status;
  const allowedTransitions: Record<string, string[]> = {
    pending: ["processing", "cancelled"],
    processing: ["shipped", "cancelled"],
    shipped: ["completed", "cancelled"],
    delivered: ["completed", "cancelled"],
    completed: [],
    cancelled: [],
  };
  if (!previousStatus || (!allowedTransitions[previousStatus]?.includes(parsed.data.status) && previousStatus !== parsed.data.status)) {
    res.status(409).json({ error: "انتقال حالة الطلب غير مسموح" });
    return;
  }
  const { order, items } = await db.transaction(async (tx) => {
    if (parsed.data.status === "cancelled" && previousStatus !== "cancelled") {
      const orderItems = await tx.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, id));
      for (const item of orderItems) {
        if (item.productId) {
          await tx.update(productsTable).set({
            stockQuantity: sql`${productsTable.stockQuantity} + ${item.quantity}`,
            inStock: true,
          }).where(eq(productsTable.id, item.productId));
        }
      }
    }
    const [updatedOrder] = await tx.update(ordersTable).set({ status: parsed.data.status }).where(eq(ordersTable.id, id)).returning();
    if (!updatedOrder) throw Object.assign(new Error("الطلب غير موجود"), { statusCode: 404 });
    const updatedItems = await tx.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, updatedOrder.id));
    return { order: updatedOrder, items: updatedItems };
  });
  if (parsed.data.status === "cancelled" && previousStatus !== "cancelled") {
    await notifyAdmins({
      type: "cancelled_order",
      title: "تم إلغاء طلب",
      message: `تم إلغاء الطلب رقم #${order.id}`,
      entityId: order.id,
    });
  }
  res.json(formatOrder(order, items));
});

export default router;
