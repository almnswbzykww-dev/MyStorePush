import { Router, type IRouter } from "express";
import { eq, count, sum, desc } from "drizzle-orm";
import { db, productsTable, ordersTable, orderItemsTable, usersTable } from "@workspace/db";

const router: IRouter = Router();

/** Require admin role — returns user or sends 401/403. */
async function requireAdmin(req: any, res: any): Promise<boolean> {
  const userId = req.session?.userId;
  if (!userId) {
    res.status(401).json({ error: "غير مصرح — يجب تسجيل الدخول" });
    return false;
  }
  const [user] = await db.select({ role: usersTable.role }).from(usersTable).where(eq(usersTable.id, userId));
  if (!user || user.role !== "admin") {
    res.status(403).json({ error: "للمدير فقط" });
    return false;
  }
  return true;
}

router.get("/dashboard/stats", async (req, res): Promise<void> => {
  if (!(await requireAdmin(req, res))) return;

  const [productCount] = await db.select({ count: count() }).from(productsTable);
  const [orderCount] = await db.select({ count: count() }).from(ordersTable);
  const [customerCount] = await db.select({ count: count() }).from(usersTable);
  const [revenue] = await db.select({ total: sum(ordersTable.totalAmount) }).from(ordersTable);
  const [pendingCount] = await db.select({ count: count() }).from(ordersTable).where(eq(ordersTable.status, "pending"));
  const [completedCount] = await db.select({ count: count() }).from(ordersTable).where(eq(ordersTable.status, "completed"));

  res.json({
    totalProducts: productCount.count,
    totalOrders: orderCount.count,
    totalCustomers: customerCount.count,
    totalRevenue: parseFloat(String(revenue.total || 0)),
    pendingOrders: pendingCount.count,
    completedOrders: completedCount.count,
  });
});

router.get("/dashboard/recent-orders", async (req, res): Promise<void> => {
  if (!(await requireAdmin(req, res))) return;

  const orders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)).limit(10);

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

export default router;
