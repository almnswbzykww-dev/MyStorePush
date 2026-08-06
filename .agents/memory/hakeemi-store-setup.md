---
name: Hakeemi Store Setup
description: Key decisions and constraints for the Hakeemi Store full-stack project.
---

## Project
Arabic e-commerce store (متجر الحكيمي للتخفيضات). Full-stack: React/Vite frontend + Express 5 API + PostgreSQL/Drizzle.

## Artifacts
- `artifacts/store` (id: "artifacts/store") — React/Vite frontend, previewPath "/", port 24964
- `artifacts/api-server` (id: "3B4_FFSkEVBkAeYMFRJ2e") — Express API, paths ["/api"], port 8080

## Critical rules
- `DATABASE_URL` is runtime-managed by Replit — never set manually.
- `SESSION_SECRET` and `SERPAPI_API_KEY` are Replit Secrets.
- Self-registration always assigns `role: "customer"` — role injection blocked server-side.
- Admin routes use `requireAdmin()` which verifies role in DB, not just session presence.
- `lib/api-zod/src/index.ts` must only export `./generated/api` — NOT `./generated/types`. The type files collide with Zod schema names (same names exported twice causes TS2308).
- Codegen (orval v8.5.3 from Hakeemi-EStore) used pre-generated files; running fresh orval v8.20.0 codegen with the current openapi.yaml causes TS2308 collisions.

**Why:** OpenAPI spec uses operation-shaped names (RegisterBody, LoginBody, etc.) which collide when Orval generates both Zod schemas in api.ts AND TypeScript interfaces in types/. Fix: don't re-export types/, only export ./generated/api.

## Packages
- `artifacts/store` uses `@workspace/api-client-react` (workspace:*) for typed React Query hooks
- `lib/api-client-react/src/generated/api.ts` — full generated hooks (1427 lines, from Hakeemi-EStore extract)
- `lib/api-zod/src/generated/api.ts` — full Zod validators (from Hakeemi-EStore extract)
- Store also depends on: framer-motion, wouter, @clerk/react (peer warning: react 19.1.0 OK)
- Extra packages in api-server: express-session, bcryptjs, http-proxy-middleware, @clerk/express

## Schema tables
- `users` — id, username (int unique), name, email, password, phone, role, permissions, createdAt
- `products` — id, name, nameAr, description, descriptionAr, price, originalPrice, category, imageUrl, inStock, createdAt
- `orders` — id, userId (FK→users), customerName, customerEmail, customerPhone, customerAddress, currency, paymentMethod, status, totalAmount, createdAt
- `order_items` — id, orderId (FK→orders), productId (FK→products), productName, quantity, price

## Push command
`pnpm --filter @workspace/db run push` — applies schema changes to DB.

## CSS theme
`artifacts/store/src/index.css` uses dark purple/gold theme. Variables use HSL not "red" placeholders. Fonts: Tajawal, Amiri, Scheherazade New (loaded from Google Fonts in index.html).

## Production-readiness lessons
- Vite config that throws on missing `PORT`/`BASE_PATH` must special-case `vite build` (`process.argv.includes("build")`) — build has no dev-server PORT and needs a default `BASE_PATH="/"`, or the build fails outright.
- Express behind Replit's proxy needs `app.set("trust proxy", 1)` or `secure` cookies silently never get set in production.
- CORS `origin: true` + `credentials: true` is a session-hijack risk (reflects any Origin with cookies) — restrict to the actual deploy domain(s) instead.
- Never trust client-submitted line-item prices in order/checkout endpoints — always recompute totals server-side from the authoritative product price.
- An unauthenticated "clerk-sync" or social-login-bridge endpoint that binds a session to a client-supplied email is an account-takeover vector — remove it until real token verification is wired up, even if the frontend UI still shows (disabled) social buttons.
