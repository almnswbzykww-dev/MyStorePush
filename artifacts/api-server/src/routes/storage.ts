import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { getObjectFile, requestImageUpload, streamObject } from "../lib/objectStorage";

const router: IRouter = Router();

async function isAdmin(req: any) {
  const userId = req.session?.userId;
  if (!userId) return false;
  const [user] = await db.select({ role: usersTable.role, mustChangePassword: usersTable.mustChangePassword })
    .from(usersTable).where(eq(usersTable.id, userId));
  return user?.role === "admin" && !user.mustChangePassword;
}

router.post("/storage/uploads/request-url", async (req, res): Promise<void> => {
  if (!(await isAdmin(req))) {
    res.status(401).json({ error: "يجب تسجيل الدخول كمدير" });
    return;
  }
  const { contentType, size } = req.body ?? {};
  if (typeof contentType !== "string" || !contentType.startsWith("image/") || !Number.isInteger(size) || size < 1 || size > 5 * 1024 * 1024) {
    res.status(400).json({ error: "يسمح بصور حتى 5 ميجابايت فقط" });
    return;
  }
  try {
    res.json(await requestImageUpload(contentType));
  } catch (error: any) {
    res.status(503).json({ error: error?.message || "تعذر تجهيز رفع الصورة" });
  }
});

router.get("/storage/objects/*path", async (req, res): Promise<void> => {
  try {
    const raw = req.params.path;
    const objectPath = `/objects/${Array.isArray(raw) ? raw.join("/") : raw}`;
    const file = await getObjectFile(objectPath);
    await streamObject(file, res);
  } catch {
    res.status(404).json({ error: "الملف غير موجود" });
  }
});

export default router;