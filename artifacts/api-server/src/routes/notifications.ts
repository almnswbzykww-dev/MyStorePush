import { Router, type IRouter } from "express";
import { and, desc, eq } from "drizzle-orm";
import { db, notificationsTable, usersTable } from "@workspace/db";

const router: IRouter = Router();

async function requireAdminId(req: any, res: any): Promise<number | null> {
  const userId = req.session?.userId;
  if (!userId) {
    res.status(401).json({ error: "غير مصرح — يجب تسجيل الدخول" });
    return null;
  }

  const [user] = await db
    .select({
      id: usersTable.id,
      role: usersTable.role,
      mustChangePassword: usersTable.mustChangePassword,
    })
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  if (!user || user.role !== "admin") {
    res.status(403).json({ error: "للمدير فقط" });
    return null;
  }
  if (user.mustChangePassword) {
    res.status(403).json({ error: "يجب تغيير كلمة المرور قبل استخدام لوحة الإدارة" });
    return null;
  }

  return user.id;
}

router.get("/admin/notifications", async (req, res): Promise<void> => {
  const adminId = await requireAdminId(req, res);
  if (!adminId) return;

  const notifications = await db
    .select()
    .from(notificationsTable)
    .where(eq(notificationsTable.adminId, adminId))
    .orderBy(desc(notificationsTable.createdAt))
    .limit(100);

  res.json({
    notifications: notifications.map((notification) => ({
      ...notification,
      createdAt: notification.createdAt.toISOString(),
    })),
    unreadCount: notifications.filter((notification) => !notification.isRead).length,
  });
});

router.post("/admin/notifications/read-all", async (req, res): Promise<void> => {
  const adminId = await requireAdminId(req, res);
  if (!adminId) return;

  await db
    .update(notificationsTable)
    .set({ isRead: true })
    .where(and(eq(notificationsTable.adminId, adminId), eq(notificationsTable.isRead, false)));

  res.json({ message: "تم تعليم الإشعارات كمقروءة" });
});

router.delete("/admin/notifications", async (req, res): Promise<void> => {
  const adminId = await requireAdminId(req, res);
  if (!adminId) return;

  await db.delete(notificationsTable).where(eq(notificationsTable.adminId, adminId));
  res.sendStatus(204);
});

export default router;