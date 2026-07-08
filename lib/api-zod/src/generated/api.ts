/**
 * Zod schemas for the Hakeemi Store API
 */
import * as zod from "zod";

// ============================================================
// Health
// ============================================================
export const HealthCheckResponse = zod.object({
  status: zod.string(),
});

// ============================================================
// Products
// ============================================================
export const CreateProductBody = zod.object({
  name: zod.string().min(1),
  nameAr: zod.string().min(1),
  description: zod.string().optional(),
  descriptionAr: zod.string().optional(),
  price: zod.string(),
  originalPrice: zod.string().optional(),
  category: zod.string().min(1),
  imageUrl: zod.string().optional(),
  inStock: zod.boolean().optional().default(true),
});

export const UpdateProductBody = CreateProductBody.partial();

export const GetProductParams = zod.object({
  id: zod.string(),
});

export const ListProductsQueryParams = zod.object({
  category: zod.string().optional(),
  search: zod.string().optional(),
});

// ============================================================
// Orders
// ============================================================
export const OrderItemBody = zod.object({
  productId: zod.number().int().positive(),
  quantity: zod.number().int().positive(),
  price: zod.number().nonnegative(),
});

export const CreateOrderBody = zod.object({
  customerName: zod.string().min(1),
  customerEmail: zod.string().email().optional(),
  customerPhone: zod.string().optional(),
  customerAddress: zod.string().optional(),
  currency: zod.string().optional().default("SAR"),
  paymentMethod: zod.string().optional().default("cash"),
  items: zod.array(OrderItemBody).min(1),
});

export const UpdateOrderStatusBody = zod.object({
  status: zod.enum(["pending", "processing", "shipped", "completed", "cancelled"]),
});
