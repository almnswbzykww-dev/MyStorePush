import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/customers", async (req, res): Promise<void> => {
  const userId = (req.session as any)?.userId;
  if (!userId) {
    res.status(401).json({ error: "غير مصرح" });
    return;
  }

  const [currentUser] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!currentUser || currentUser.role !== "admin") {
    res.status(403).json({ error: "للمدير فقط" });
    return;
  }
  if (currentUser.mustChangePassword) {
    res.status(403).json({ error: "يجب تغيير كلمة المرور قبل استخدام لوحة الإدارة" });
    return;
  }

  const customers = await db.select().from(usersTable).orderBy(usersTable.createdAt);

  res.json(customers.map(c => ({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    role: c.role,
    createdAt: c.createdAt.toISOString(),
  })));
});

export default router;
