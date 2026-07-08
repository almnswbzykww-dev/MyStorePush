import { Router, type IRouter } from "express";
import { eq, ne } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import bcrypt from "bcryptjs";

const router: IRouter = Router();

function isAdmin(req: any, res: any): boolean {
  const userId = req.session?.userId;
  if (!userId) {
    res.status(401).json({ error: "غير مصرح" });
    return false;
  }
  return true;
}

router.get("/admin/users", async (req, res): Promise<void> => {
  if (!isAdmin(req, res)) return;
  const users = await db.select({
    id: usersTable.id,
    username: usersTable.username,
    name: usersTable.name,
    email: usersTable.email,
    role: usersTable.role,
    permissions: usersTable.permissions,
    createdAt: usersTable.createdAt,
  }).from(usersTable).orderBy(usersTable.id);

  res.json(users.map(u => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
  })));
});

router.post("/admin/users", async (req, res): Promise<void> => {
  if (!isAdmin(req, res)) return;

  const { username, name, password, role, permissions } = req.body;

  if (!username || !name || !password) {
    res.status(400).json({ error: "رقم المستخدم والاسم وكلمة المرور مطلوبة" });
    return;
  }

  const usernameNum = parseInt(String(username));
  if (isNaN(usernameNum) || usernameNum <= 0) {
    res.status(400).json({ error: "رقم المستخدم يجب أن يكون رقماً صحيحاً موجباً" });
    return;
  }

  const existing = await db.select().from(usersTable).where(eq(usersTable.username, usernameNum));
  if (existing.length > 0) {
    res.status(400).json({ error: "رقم المستخدم مستخدم بالفعل" });
    return;
  }

  const email = `user${usernameNum}@hakeemi.internal`;
  const hashedPassword = await bcrypt.hash(password, 10);

  const [user] = await db.insert(usersTable).values({
    username: usernameNum,
    name,
    email,
    password: hashedPassword,
    role: role || "admin",
    permissions: permissions || (role === "admin" ? '["all"]' : '[]'),
  }).returning();

  res.status(201).json({
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    permissions: user.permissions,
    createdAt: user.createdAt.toISOString(),
  });
});

router.delete("/admin/users/:id", async (req, res): Promise<void> => {
  if (!isAdmin(req, res)) return;

  const sessionUserId = (req.session as any)?.userId;
  const id = parseInt(req.params.id);

  if (id === sessionUserId) {
    res.status(400).json({ error: "لا يمكن حذف حسابك الحالي" });
    return;
  }

  const existing = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (existing.length === 0) {
    res.status(404).json({ error: "المستخدم غير موجود" });
    return;
  }

  await db.delete(usersTable).where(eq(usersTable.id, id));
  res.json({ message: "تم حذف المستخدم بنجاح" });
});

router.patch("/admin/users/:id/permissions", async (req, res): Promise<void> => {
  if (!isAdmin(req, res)) return;

  const id = parseInt(req.params.id);
  const { permissions } = req.body;

  await db.update(usersTable).set({ permissions: JSON.stringify(permissions) }).where(eq(usersTable.id, id));
  res.json({ message: "تم تحديث الصلاحيات" });
});

router.patch("/admin/users/:id/password", async (req, res): Promise<void> => {
  if (!isAdmin(req, res)) return;

  const id = parseInt(req.params.id);
  const { password } = req.body;

  if (!password || password.length < 4) {
    res.status(400).json({ error: "كلمة المرور يجب أن تكون 4 أحرف على الأقل" });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await db.update(usersTable).set({ password: hashedPassword }).where(eq(usersTable.id, id));
  res.json({ message: "تم تغيير كلمة المرور" });
});

export default router;
