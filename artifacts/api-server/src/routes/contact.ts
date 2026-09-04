import { Router, type IRouter } from "express";
import { notifyAdmins } from "../lib/notifications";

const router: IRouter = Router();

router.post("/contact/report", async (req, res): Promise<void> => {
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  const phone = typeof req.body?.phone === "string" ? req.body.phone.trim() : "";
  const problem = typeof req.body?.problem === "string" ? req.body.problem.trim() : "";

  if (!problem) {
    res.status(400).json({ error: "وصف المشكلة مطلوب" });
    return;
  }

  if (problem.length > 2000 || name.length > 120 || phone.length > 40) {
    res.status(400).json({ error: "بيانات البلاغ طويلة جداً" });
    return;
  }

  await notifyAdmins({
    type: "problem_report",
    title: "بلاغ جديد من المتجر",
    message: `بلاغ من ${name || "زائر"}: ${problem}${phone ? ` — الهاتف: ${phone}` : ""}`,
  });

  res.status(201).json({ message: "تم إرسال البلاغ بنجاح" });
});

export default router;