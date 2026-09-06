import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import bcrypt from "bcryptjs";
import { notifyAdmins } from "../lib/notifications";
import { randomUUID } from "node:crypto";

const router: IRouter = Router();

router.post("/auth/register", async (req, res): Promise<void> => {
  const { name, email, password, phone, username } = req.body;
  // Never trust `role` from client — customers only via self-registration
  const role = "customer";

  if (typeof name !== "string" || !name.trim() || typeof password !== "string" || password.length < 8) {
    res.status(400).json({ error: "الاسم وكلمة المرور مطلوبان" });
    return;
  }

  const usernameText = username === undefined || username === null ? "" : String(username).trim();
  const usernameNum = usernameText
    ? (/^\d+$/.test(usernameText) ? Number(usernameText) : NaN)
    : null;
  if (usernameNum !== null && (!Number.isSafeInteger(usernameNum) || usernameNum <= 0)) {
    res.status(400).json({ error: "رقم المستخدم يجب أن يكون رقماً صحيحاً موجباً" });
    return;
  }

  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const finalEmail = normalizedEmail || `user-${randomUUID()}@hakeemi.internal`;
  const hashedPassword = await bcrypt.hash(password, 12);

  let user: typeof usersTable.$inferSelect;
  try {
    user = await db.transaction(async (tx) => {
      const existingEmail = await tx.select({ id: usersTable.id }).from(usersTable)
        .where(eq(usersTable.email, finalEmail));
      if (existingEmail.length > 0) {
        throw new Error("EMAIL_ALREADY_EXISTS");
      }

      if (usernameNum !== null) {
        const existingUsername = await tx.select({ id: usersTable.id }).from(usersTable)
          .where(eq(usersTable.username, usernameNum));
        if (existingUsername.length > 0) {
          throw new Error("USERNAME_ALREADY_EXISTS");
        }
      }

      const [created] = await tx.insert(usersTable).values({
        name: name.trim(),
        email: finalEmail,
        password: hashedPassword,
        phone: typeof phone === "string" && phone.trim() ? phone.trim() : null,
        role,
        username: usernameNum,
        permissions: '[]',
      }).returning();

      if (usernameNum !== null) return created;

      const [assigned] = await tx.update(usersTable)
        .set({ username: created.id })
        .where(eq(usersTable.id, created.id))
        .returning();
      return assigned;
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "EMAIL_ALREADY_EXISTS") {
      res.status(409).json({ error: "البريد الإلكتروني مستخدم بالفعل" });
      return;
    }
    if (code === "USERNAME_ALREADY_EXISTS") {
      res.status(409).json({ error: "رقم المستخدم مستخدم بالفعل" });
      return;
    }
    throw error;
  }

  (req.session as any).userId = user.id;
  await notifyAdmins({
    type: "new_customer",
    title: "عميل جديد",
    message: `تم إنشاء حساب جديد باسم ${user.name}`,
    entityId: user.id,
  });

  res.status(201).json({
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      permissions: user.permissions,
      mustChangePassword: user.mustChangePassword,
      createdAt: user.createdAt.toISOString(),
    },
    message: "تم انشاء الحساب بنجاح",
  });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const { email, password, username, userId } = req.body;

  if (!password) {
    res.status(400).json({ error: "كلمة المرور مطلوبة" });
    return;
  }

  let user: any = null;

  if (username !== undefined) {
    const usernameText = String(username).trim().toLowerCase();
    const usernameNum = /^\d+$/.test(usernameText) ? Number(usernameText) : NaN;
    if (Number.isSafeInteger(usernameNum) && usernameNum > 0) {
      const rows = await db.select().from(usersTable).where(eq(usersTable.username, usernameNum));
      user = rows[0] || null;
    } else if (usernameText === "admin") {
      const rows = await db.select().from(usersTable).where(eq(usersTable.role, "admin"));
      user = rows[0] || null;
    } else if (usernameText) {
      const rows = await db.select().from(usersTable).where(and(
        eq(usersTable.name, String(username).trim()),
        eq(usersTable.role, "admin"),
      ));
      user = rows[0] || null;
    }
  }

  if (!user && userId !== undefined) {
    const numericUserId = Number(userId);
    if (Number.isInteger(numericUserId) && numericUserId > 0) {
      const rows = await db.select().from(usersTable).where(eq(usersTable.id, numericUserId));
      user = rows[0] || null;
    }
    // Keep userId=1 as the first-admin login alias for existing databases
    // where the serial users table already contains another row with id=1.
    if (!user && String(userId).trim().toLowerCase() === "admin") {
      const rows = await db.select().from(usersTable).where(eq(usersTable.role, "admin"));
      user = rows[0] || null;
    }
  }

  if (!user && email) {
    const rows = await db.select().from(usersTable).where(eq(usersTable.email, String(email).trim().toLowerCase()));
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
      mustChangePassword: user.mustChangePassword,
      createdAt: user.createdAt.toISOString(),
    },
    message: "تم تسجيل الدخول بنجاح",
  });
});

// NOTE: Clerk sign-in is not wired up in this store yet (no ClerkProvider on
// the frontend, no CLERK_* keys configured). A `/auth/clerk-sync` endpoint
// that trusts a client-supplied email to bind a session is a session-fixation
// / account-takeover vector, so it is intentionally omitted until real Clerk
// token verification (via @clerk/express `requireAuth()`) is added.

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
    mustChangePassword: user.mustChangePassword,
    createdAt: user.createdAt.toISOString(),
  });
});

router.post("/auth/change-password", async (req, res): Promise<void> => {
  const userId = (req.session as any)?.userId;
  if (!userId) {
    res.status(401).json({ error: "غير مسجل الدخول" });
    return;
  }

  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || typeof newPassword !== "string" || newPassword.length < 8) {
    res.status(400).json({ error: "كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
    res.status(401).json({ error: "كلمة المرور الحالية غير صحيحة" });
    return;
  }

  const password = await bcrypt.hash(newPassword, 12);
  await db.update(usersTable)
    .set({ password, mustChangePassword: false })
    .where(eq(usersTable.id, user.id));

  res.json({ message: "تم تغيير كلمة المرور بنجاح", mustChangePassword: false });
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  req.session.destroy(() => {});
  res.json({ message: "تم تسجيل الخروج" });
});

export default router;
