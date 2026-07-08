import { Router, type IRouter } from "express";
import { eq, desc, count, sum } from "drizzle-orm";
import { db, ordersTable, orderItemsTable, productsTable, usersTable } from "@workspace/db";
import { CreateOrderBody, UpdateOrderStatusBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/orders", async (req, res): Promise<void> => {
  const orders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt));

  const result = await Promise.all(
    orders.map(async (order) => {
      const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, order.id));
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

  res.status(201).json({
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
    items: orderItems,
    createdAt: order.createdAt.toISOString(),
  });
});

router.get("/orders/:id", async (req, res): Promise<void> => {
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

  const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, order.id));

  res.json({
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
  });
});

router.patch("/orders/:id", async (req, res): Promise<void> => {
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

  res.json({
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
  });
});

export default router;
