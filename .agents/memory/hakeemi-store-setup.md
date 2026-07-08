---
name: Hakeemi Store Setup
description: Key decisions and constraints for the Hakeemi Store API project.
---

## Project
Arabic e-commerce API (متجر الحكيمي للتخفيضات). Express 5, Drizzle ORM, PostgreSQL, session auth.

## Critical rules
- `DATABASE_URL` is runtime-managed by Replit — never set it manually or ask the user for it.
- `SESSION_SECRET` and `SERPAPI_API_KEY` are saved as Replit Secrets.
- `.env` is in `.gitignore` — secrets never reach GitHub.
- Self-registration via `/api/auth/register` always assigns `role: "customer"` — role injection is blocked.
- Admin routes use `requireAdmin()` which verifies role in DB, not just session presence.

## Schema tables
- `users` — id, username (int, unique), name, email, password, phone, role, permissions, createdAt
- `products` — id, name, nameAr, description, descriptionAr, price, originalPrice, category, imageUrl, inStock, createdAt
- `orders` — id, userId (FK→users), customerName, customerEmail, customerPhone, customerAddress, currency, paymentMethod, status, totalAmount, createdAt
- `order_items` — id, orderId (FK→orders), productId (FK→products), productName, quantity, price

## Push command
`pnpm --filter @workspace/db run push` — applies schema changes to DB. Run after schema edits.

## Packages added beyond scaffold
`express-session`, `bcryptjs`, `http-proxy-middleware`, `@clerk/express` added to `@workspace/api-server`.

**Why:** These were in the zip's package.json but not in the workspace's pnpm-lock, causing build failures.
