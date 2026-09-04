import { Router, type IRouter } from "express";
import multer from "multer";
import XLSX from "xlsx";
import { eq } from "drizzle-orm";
import { db, productsTable, usersTable } from "@workspace/db";
import { notifyAdmins } from "../lib/notifications";

const router: IRouter = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    const valid = /\.(xlsx|xls)$/i.test(file.originalname);
    if (valid) {
      callback(null, true);
    } else {
      callback(new Error("يسمح فقط بملفات Excel بصيغة .xlsx أو .xls"));
    }
  },
});

const requiredColumns = ["sku", "nameAr", "price", "category", "stockQuantity"];
const aliases: Record<string, string> = {
  sku: "sku",
  SKU: "sku",
  "الرمز": "sku",
  "كود المنتج": "sku",
  name: "name",
  nameEn: "name",
  "الاسم بالانجليزية": "name",
  nameAr: "nameAr",
  "الاسم العربي": "nameAr",
  "اسم المنتج": "nameAr",
  description: "description",
  descriptionAr: "descriptionAr",
  price: "price",
  "السعر": "price",
  originalPrice: "originalPrice",
  "السعر الأصلي": "originalPrice",
  category: "category",
  "التصنيف": "category",
  imageUrl: "imageUrl",
  "رابط الصورة": "imageUrl",
  stockQuantity: "stockQuantity",
  stock: "stockQuantity",
  "الكمية": "stockQuantity",
  inStock: "inStock",
};

function normalizeHeader(value: unknown): string {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

function normalizeBoolean(value: unknown, fallback: boolean): boolean {
  if (value === undefined || value === null || value === "") return fallback;
  const normalized = String(value).trim().toLowerCase();
  return ["true", "1", "yes", "نعم", "متوفر"].includes(normalized);
}

function parseSheet(file: Express.Multer.File) {
  const workbook = XLSX.read(file.buffer, { type: "buffer", cellDates: false });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!firstSheet) {
    return { rows: [], errors: [{ row: 1, field: "file", message: "الملف لا يحتوي على ورقة عمل" }] };
  }

  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, {
    defval: "",
    raw: true,
  });
  const rawHeaders = rawRows.length > 0 ? Object.keys(rawRows[0]) : [];
  const mappedHeaders = new Map<string, string>();
  for (const header of rawHeaders) {
    const normalized = normalizeHeader(header);
    const mapped = aliases[normalized] ?? normalized;
    mappedHeaders.set(header, mapped);
  }

  const missingColumns = requiredColumns.filter((column) => !Array.from(mappedHeaders.values()).includes(column));
  const errors: Array<{ row: number; field: string; message: string }> = missingColumns.map((column) => ({
    row: 1,
    field: column,
    message: `العمود الإلزامي مفقود: ${column}`,
  }));

  const rows = rawRows.map((raw, index) => {
    const rowNumber = index + 2;
    const row: Record<string, unknown> = {};
    for (const [originalHeader, mappedHeader] of mappedHeaders) {
      row[mappedHeader] = raw[originalHeader];
    }

    const sku = normalizeHeader(row.sku);
    const nameAr = normalizeHeader(row.nameAr);
    const name = normalizeHeader(row.name) || nameAr;
    const category = normalizeHeader(row.category);
    const price = Number(row.price);
    const originalPrice = row.originalPrice === "" || row.originalPrice == null ? null : Number(row.originalPrice);
    const stockQuantity = Number(row.stockQuantity);

    const parsed = {
      sku,
      name,
      nameAr,
      description: normalizeHeader(row.description),
      descriptionAr: normalizeHeader(row.descriptionAr) || normalizeHeader(row.description),
      price,
      originalPrice,
      category,
      imageUrl: normalizeHeader(row.imageUrl),
      stockQuantity,
      inStock: normalizeBoolean(row.inStock, stockQuantity > 0),
    };

    if (!sku) errors.push({ row: rowNumber, field: "sku", message: "SKU مطلوب" });
    if (!nameAr) errors.push({ row: rowNumber, field: "nameAr", message: "اسم المنتج بالعربية مطلوب" });
    if (!category) errors.push({ row: rowNumber, field: "category", message: "التصنيف مطلوب" });
    if (!Number.isFinite(price) || price < 0) errors.push({ row: rowNumber, field: "price", message: "السعر يجب أن يكون رقماً موجباً أو صفراً" });
    if (originalPrice !== null && (!Number.isFinite(originalPrice) || originalPrice < 0)) {
      errors.push({ row: rowNumber, field: "originalPrice", message: "السعر الأصلي غير صالح" });
    }
    if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
      errors.push({ row: rowNumber, field: "stockQuantity", message: "المخزون يجب أن يكون رقماً صحيحاً غير سالب" });
    }
    if (originalPrice !== null && Number.isFinite(price) && originalPrice < price) {
      errors.push({ row: rowNumber, field: "originalPrice", message: "السعر الأصلي لا يمكن أن يكون أقل من السعر" });
    }

    return { rowNumber, data: parsed };
  });

  const seen = new Map<string, number>();
  for (const row of rows) {
    if (!row.data.sku) continue;
    const previous = seen.get(row.data.sku);
    if (previous) {
      errors.push({ row: row.rowNumber, field: "sku", message: `SKU مكرر داخل الملف (الصف ${previous})` });
    } else {
      seen.set(row.data.sku, row.rowNumber);
    }
  }

  return { rows, errors };
}

async function requireAdmin(req: any, res: any): Promise<boolean> {
  const userId = req.session?.userId;
  if (!userId) {
    res.status(401).json({ error: "غير مصرح — يجب تسجيل الدخول" });
    return false;
  }
  const [user] = await db.select({
    role: usersTable.role,
    mustChangePassword: usersTable.mustChangePassword,
  }).from(usersTable).where(eq(usersTable.id, userId));
  if (!user || user.role !== "admin") {
    res.status(403).json({ error: "للمدير فقط" });
    return false;
  }
  if (user.mustChangePassword) {
    res.status(403).json({ error: "يجب تغيير كلمة المرور قبل استخدام لوحة الإدارة" });
    return false;
  }
  return true;
}

router.get("/products/import/template", async (req, res): Promise<void> => {
  if (!(await requireAdmin(req, res))) return;

  const worksheet = XLSX.utils.aoa_to_sheet([
    ["sku", "name", "nameAr", "description", "descriptionAr", "price", "originalPrice", "category", "imageUrl", "stockQuantity", "inStock"],
    ["SHOE-001", "Classic Shoe", "حذاء كلاسيكي", "English description", "وصف المنتج", 120, 180, "men", "", 10, true],
  ]);
  worksheet["!cols"] = [
    { wch: 16 }, { wch: 24 }, { wch: 28 }, { wch: 30 }, { wch: 30 },
    { wch: 12 }, { wch: 16 }, { wch: 16 }, { wch: 36 }, { wch: 16 }, { wch: 12 },
  ];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  res.setHeader("Content-Disposition", 'attachment; filename="products-template.xlsx"');
  res.type("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet").send(buffer);
});

router.post("/products/import", upload.single("file"), async (req, res): Promise<void> => {
  if (!(await requireAdmin(req, res))) return;
  if (!req.file) {
    res.status(400).json({ error: "ملف Excel مطلوب" });
    return;
  }

  try {
    const parsed = parseSheet(req.file);
    const skus = parsed.rows.map((row) => row.data.sku).filter(Boolean);
    const existingProducts = skus.length
      ? await db.select({ sku: productsTable.sku }).from(productsTable)
      : [];
    const existingSkus = new Set(existingProducts.map((product) => product.sku).filter(Boolean));
    for (const row of parsed.rows) {
      if (row.data.sku && existingSkus.has(row.data.sku)) {
        parsed.errors.push({ row: row.rowNumber, field: "sku", message: "SKU موجود مسبقاً في قاعدة البيانات" });
      }
    }

    const preview = parsed.rows.map((row) => ({ row: row.rowNumber, ...row.data }));
    if (req.query.commit !== "true" || parsed.errors.length > 0) {
      res.json({ preview, errors: parsed.errors, imported: 0, canImport: parsed.errors.length === 0 });
      return;
    }

    const inserted = await db.transaction(async (tx) => {
      const values = parsed.rows.map((row) => ({
        sku: row.data.sku,
        name: row.data.name,
        nameAr: row.data.nameAr,
        description: row.data.description,
        descriptionAr: row.data.descriptionAr,
        price: String(row.data.price),
        originalPrice: row.data.originalPrice === null ? null : String(row.data.originalPrice),
        category: row.data.category,
        imageUrl: row.data.imageUrl,
        stockQuantity: row.data.stockQuantity,
        inStock: row.data.inStock && row.data.stockQuantity > 0,
      }));
      return tx.insert(productsTable).values(values).returning({ id: productsTable.id, sku: productsTable.sku });
    });

    await Promise.all(parsed.rows.map((row) => {
      if (row.data.stockQuantity === 0) {
        return notifyAdmins({
          type: "out_of_stock",
          title: "منتج نافد",
          message: `المنتج "${row.data.nameAr}" نافد من المخزون`,
          entityId: inserted.find((product) => product.sku === row.data.sku)?.id,
        });
      }
      if (row.data.stockQuantity <= 5) {
        return notifyAdmins({
          type: "low_stock",
          title: "مخزون منخفض",
          message: `مخزون المنتج "${row.data.nameAr}" منخفض (${row.data.stockQuantity})`,
          entityId: inserted.find((product) => product.sku === row.data.sku)?.id,
        });
      }
      return Promise.resolve();
    }));

    res.status(201).json({
      preview,
      errors: [],
      imported: inserted.length,
      canImport: false,
    });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "تعذر قراءة ملف Excel" });
  }
});

export default router;