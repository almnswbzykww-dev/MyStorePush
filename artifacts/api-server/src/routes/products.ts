import { Router, type IRouter } from "express";
import { eq, ilike, and, type SQL } from "drizzle-orm";
import { db, productsTable, usersTable } from "@workspace/db";
import {
  CreateProductBody, UpdateProductBody, GetProductParams,
  ListProductsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function requireAdmin(req: any, res: any, next: any) {
  const userId = req.session?.userId;
  if (!userId) {
    res.status(401).json({ error: "غير مصرح" });
    return;
  }
  db.select().from(usersTable).where(eq(usersTable.id, userId)).then(([user]) => {
    if (!user || user.role !== "admin") {
      res.status(403).json({ error: "للمدير فقط" });
      return;
    }
    next();
  });
}

router.get("/products", async (req, res): Promise<void> => {
  const params = ListProductsQueryParams.safeParse(req.query);
  const conditions: SQL[] = [];

  if (params.success) {
    if (params.data.category) {
      conditions.push(eq(productsTable.category, params.data.category));
    }
    if (params.data.search) {
      conditions.push(ilike(productsTable.nameAr, `%${params.data.search}%`));
    }
  }

  const products = conditions.length > 0
    ? await db.select().from(productsTable).where(and(...conditions)).orderBy(productsTable.createdAt)
    : await db.select().from(productsTable).orderBy(productsTable.createdAt);

  res.json(products.map(p => ({
    id: p.id,
    name: p.name,
    nameAr: p.nameAr,
    description: p.description,
    descriptionAr: p.descriptionAr,
    price: p.price,
    originalPrice: p.originalPrice,
    category: p.category,
    imageUrl: p.imageUrl,
    inStock: p.inStock,
    createdAt: p.createdAt.toISOString(),
  })));
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "معرف غير صالح" });
    return;
  }

  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, id));
  if (!product) {
    res.status(404).json({ error: "المنتج غير موجود" });
    return;
  }

  res.json({
    id: product.id,
    name: product.name,
    nameAr: product.nameAr,
    description: product.description,
    descriptionAr: product.descriptionAr,
    price: product.price,
    originalPrice: product.originalPrice,
    category: product.category,
    imageUrl: product.imageUrl,
    inStock: product.inStock,
    createdAt: product.createdAt.toISOString(),
  });
});

router.post("/products", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [product] = await db.insert(productsTable).values({
    ...parsed.data,
    price: String(parsed.data.price),
    originalPrice: parsed.data.originalPrice != null ? String(parsed.data.originalPrice) : null,
  }).returning();

  res.status(201).json({
    id: product.id,
    name: product.name,
    nameAr: product.nameAr,
    description: product.description,
    descriptionAr: product.descriptionAr,
    price: product.price,
    originalPrice: product.originalPrice,
    category: product.category,
    imageUrl: product.imageUrl,
    inStock: product.inStock,
    createdAt: product.createdAt.toISOString(),
  });
});

router.patch("/products/:id", requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "معرف غير صالح" });
    return;
  }

  const parsed = UpdateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { price, originalPrice, ...rest } = parsed.data;
  const updateValues: Record<string, unknown> = { ...rest };
  if (price != null) updateValues.price = String(price);
  if (originalPrice !== undefined) {
    updateValues.originalPrice = originalPrice != null ? String(originalPrice) : null;
  }

  const [product] = await db.update(productsTable).set(updateValues).where(eq(productsTable.id, id)).returning();
  if (!product) {
    res.status(404).json({ error: "المنتج غير موجود" });
    return;
  }

  res.json({
    id: product.id,
    name: product.name,
    nameAr: product.nameAr,
    description: product.description,
    descriptionAr: product.descriptionAr,
    price: product.price,
    originalPrice: product.originalPrice,
    category: product.category,
    imageUrl: product.imageUrl,
    inStock: product.inStock,
    createdAt: product.createdAt.toISOString(),
  });
});

router.delete("/products/:id", requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "معرف غير صالح" });
    return;
  }

  const [product] = await db.delete(productsTable).where(eq(productsTable.id, id)).returning();
  if (!product) {
    res.status(404).json({ error: "المنتج غير موجود" });
    return;
  }

  res.sendStatus(204);
});

export default router;
