import { Router, type IRouter } from "express";
import { eq, or } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import bcrypt from "bcryptjs";

const router: IRouter = Router();

router.post("/auth/register", async (req, res): Promise<void> => {
  const { name, email, password, phone, username, role } = req.body;

  if (!name || !password) {
    res.status(400).json({ error: "الاسم وكلمة المرور مطلوبان" });
    return;
  }

  const usernameNum = username ? parseInt(username) : null;
  const finalEmail = email || (usernameNum ? `user${usernameNum}@hakeemi.internal` : `user${Date.now()}@hakeemi.internal`);

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, finalEmail));
  if (existing.length > 0) {
    res.status(400).json({ error: "المستخدم موجود بالفعل" });
    return;
  }

  if (usernameNum) {
    const existingUsername = await db.select().from(usersTable).where(eq(usersTable.username, usernameNum));
    if (existingUsername.length > 0) {
      res.status(400).json({ error: "رقم المستخدم مستخدم بالفعل" });
      return;
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const [user] = await db.insert(usersTable).values({
    name,
    email: finalEmail,
    password: hashedPassword,
    phone: phone || null,
    role: role || "customer",
    username: usernameNum,
    permissions: role === "admin" ? '["all"]' : '[]',
  }).returning();

  (req.session as any).userId = user.id;

  res.status(201).json({
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      permissions: user.permissions,
      createdAt: user.createdAt.toISOString(),
    },
    message: "تم انشاء الحساب بنجاح",
  });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const { email, password, username } = req.body;

  if (!password) {
    res.status(400).json({ error: "كلمة المرور مطلوبة" });
    return;
  }

  let user: any = null;

  if (username !== undefined) {
    const usernameNum = parseInt(String(username));
    if (!isNaN(usernameNum)) {
      const rows = await db.select().from(usersTable).where(eq(usersTable.username, usernameNum));
      user = rows[0] || null;
    }
  }

  if (!user && email) {
    const rows = await db.select().from(usersTable).where(eq(usersTable.email, email));
    user = rows[0] || null;
  }

  if (!user) {
    res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
    return;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
    return;
  }

  (req.session as any).userId = user.id;

  res.json({
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      permissions: user.permissions,
      createdAt: user.createdAt.toISOString(),
    },
    message: "تم تسجيل الدخول بنجاح",
  });
});

router.post("/auth/clerk-sync", async (req, res): Promise<void> => {
  const { email, name, clerkId } = req.body;

  if (!email) {
    res.status(400).json({ error: "البريد الالكتروني مطلوب" });
    return;
  }

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));

  let user;
  if (existing.length > 0) {
    user = existing[0];
  } else {
    const randomPassword = await bcrypt.hash(clerkId || Math.random().toString(), 10);
    const [newUser] = await db.insert(usersTable).values({
      name: name || email.split("@")[0],
      email,
      password: randomPassword,
      phone: null,
      role: "customer",
    }).returning();
    user = newUser;
  }

  (req.session as any).userId = user.id;

  res.json({
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      permissions: user.permissions,
      createdAt: user.createdAt.toISOString(),
    },
    message: "تم تسجيل الدخول بنجاح",
  });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const userId = (req.session as any)?.userId;
  if (!userId) {
    res.status(401).json({ error: "غير مسجل الدخول" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    res.status(401).json({ error: "المستخدم غير موجود" });
    return;
  }

  res.json({
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    permissions: user.permissions,
    createdAt: user.createdAt.toISOString(),
  });
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  req.session.destroy(() => {});
  res.json({ message: "تم تسجيل الخروج" });
});

export default router;
