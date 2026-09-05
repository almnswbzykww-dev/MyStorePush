import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, storeSettingsTable, usersTable } from "@workspace/db";

const router: IRouter = Router();

function cleanSettings(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const settings = { ...(value as Record<string, unknown>) };
  delete settings.adminPassword;
  delete settings.adminEmail;
  return settings;
}

router.get("/store-settings", async (_req, res): Promise<void> => {
  const [record] = await db.select().from(storeSettingsTable).where(eq(storeSettingsTable.id, 1));
  if (!record) {
    res.json({});
    return;
  }
  try {
    res.json(cleanSettings(JSON.parse(record.data)));
  } catch {
    res.json({});
  }
});

router.put("/store-settings", async (req, res): Promise<void> => {
  const userId = req.session?.userId;
  if (!userId) {
    res.status(401).json({ error: "يجب تسجيل الدخول أولاً" });
    return;
  }
  const [user] = await db.select({ role: usersTable.role, mustChangePassword: usersTable.mustChangePassword })
    .from(usersTable)
    .where(eq(usersTable.id, userId));
  if (!user || user.role !== "admin") {
    res.status(403).json({ error: "للمدير فقط" });
    return;
  }
  if (user.mustChangePassword) {
    res.status(403).json({ error: "يجب تغيير كلمة المرور أولاً" });
    return;
  }

  const settings = cleanSettings(req.body);
  if (JSON.stringify(settings).length > 500_000) {
    res.status(413).json({ error: "حجم إعدادات المتجر كبير جدًا" });
    return;
  }
  const [record] = await db.insert(storeSettingsTable)
    .values({ id: 1, data: JSON.stringify(settings) })
    .onConflictDoUpdate({
      target: storeSettingsTable.id,
      set: { data: JSON.stringify(settings), updatedAt: new Date() },
    })
    .returning();
  res.json(cleanSettings(JSON.parse(record.data)));
});

export default router;