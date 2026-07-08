# متجر الحكيمي للتخفيضات

متجر إلكتروني عربي متكامل مع API للمنتجات والطلبات وإدارة المستخدمين.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — تشغيل API Server (port 8080)
- `pnpm --filter @workspace/db run push` — تطبيق التغييرات على قاعدة البيانات
- `pnpm run typecheck` — فحص TypeScript
- `pnpm run build` — بناء المشروع

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- Auth: session-based (express-session + bcryptjs)

## Where things live

- `artifacts/api-server/src/routes/` — مسارات API (auth, products, orders, customers, dashboard, admin-users)
- `lib/db/src/schema/index.ts` — مخطط قاعدة البيانات (users, products, orders, order_items)
- `lib/api-zod/src/generated/api.ts` — Zod schemas للـ API
- `lib/db/src/setup.ts` — دالة autoSetup للاتصال بقاعدة البيانات عند البدء

## API Endpoints

- `GET /api/healthz` — فحص صحة السيرفر
- `POST /api/auth/register` — تسجيل مستخدم جديد
- `POST /api/auth/login` — تسجيل الدخول
- `GET /api/auth/me` — بيانات المستخدم الحالي
- `POST /api/auth/logout` — تسجيل الخروج
- `GET /api/products` — قائمة المنتجات
- `POST/PATCH/DELETE /api/products` — إدارة المنتجات (للمدير)
- `GET/POST /api/orders` — الطلبات
- `PATCH /api/orders/:id` — تحديث حالة طلب
- `GET /api/customers` — العملاء (للمدير)
- `GET /api/dashboard/stats` — إحصائيات اللوحة
- `GET /api/dashboard/recent-orders` — آخر الطلبات

## Environment Variables & Secrets

- `DATABASE_URL` — يُدار تلقائياً بواسطة Replit (لا تضعه يدوياً)
- `SESSION_SECRET` — مفتاح الجلسة (محفوظ كـ Secret)
- `SERPAPI_API_KEY` — مفتاح SERP API (محفوظ كـ Secret)
- `.env` لا يُرفع على GitHub (موجود في .gitignore)

## Architecture decisions

- Session-based auth بدون Clerk (Clerk اختياري إذا أضفت مفاتيحه)
- قاعدة البيانات تُنشأ تلقائياً بـ `drizzle push` عند البدء
- جميع الـ Secrets محفوظة في Replit Secrets (لا تظهر في GitHub)

## User preferences

- المشروع عربي — متجر الحكيمي للتخفيضات
- لا تستخدم قاعدة بيانات جديدة — استخدم قاعدة Replit المدارة
- SERPAPI_API_KEY محفوظ كـ Secret آمن
