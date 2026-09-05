# متجر الحكيمي للتخفيضات

تطبيق متجر عربي RTL مبني على React/Vite وExpress وPostgreSQL/Drizzle. يستخدم
المشروع `pnpm` فقط، وملف `pnpm-lock.yaml` هو ملف القفل الوحيد المعتمد.

## المتطلبات

- Node.js `24.12.x`
- pnpm `10.26.1`
- PostgreSQL

ثبّت الاعتماديات ثم شغّل فحص الأنواع:

```bash
pnpm install
pnpm run typecheck
```

## التطوير المحلي

تحتاج Secrets/متغيرات البيئة التالية:

```text
DATABASE_URL
SESSION_SECRET
```

يمكن استخدام `.env.example` كمرجع. لا تضع القيم الحقيقية في GitHub.

شغّل الواجهتين والخادم من خلال workflows الموجودة في المشروع:

```bash
pnpm --filter @workspace/store run dev
pnpm --filter @workspace/api-server run dev
```

يُنشئ الخادم جدول جلسات PostgreSQL وجدول إعدادات المتجر تلقائيًا بطريقة
idempotent عند التشغيل. لا يستخدم Express MemoryStore في الإنتاج.

## البناء

```bash
pnpm run typecheck
pnpm run build
```

يبني `@workspace/api-server` حزمة Express، ويبني `@workspace/store` إلى
`artifacts/store/dist/public`.

## النشر على Vercel

الملف `vercel.json` يضبط بناء الواجهة كملفات static وتمرير `/api/*` إلى
`api/index.ts`. أضف متغيرات البيئة في Vercel:

- `DATABASE_URL`
- `SESSION_SECRET` طويل وعشوائي
- `APP_ORIGIN` — أصل الواجهة، مثل `https://store.example.com`
- `NODE_ENV=production`
- `DATABASE_SSL=true` عند استخدام مزود PostgreSQL يتطلب SSL
- `DB_POOL_MAX` — يفضل رقمًا صغيرًا مع Serverless، مثل `5`

بعد ربط المستودع:

```bash
pnpm run build:vercel
```

يجب أن يكون `APP_ORIGIN` مساويًا للنطاق الفعلي للواجهة حتى تعمل CORS وCookies
بشكل صحيح. الجلسة HttpOnly وSecure في الإنتاج، وتُحفظ في PostgreSQL حتى لا
تضيع عند إعادة تشغيل دالة Serverless.

## الصور

صور المنتجات والشعار والخلفية تُرفع عبر Presigned URLs إلى Replit App
Storage، ثم يُحفظ مسارها في قاعدة البيانات/إعدادات المتجر. يرفض الخادم
الملفات غير الصورية أو الأكبر من 5MB، ولا يعتمد على Base64 أو القرص المحلي.

## الوظائف الإنتاجية المهمة

- بحث المنتجات في الاسم العربي والإنجليزي والوصف وSKU.
- Pagination للمنتجات بحد أقصى 100 عنصر للطلب مع `X-Total-Count`.
- تحقق مخزون ذري داخل Transaction لمنع overselling.
- إعادة حساب الأسعار من قاعدة البيانات، وحماية فواتير المستخدمين.
- تعديل كميات الفاتورة محفوظ في PostgreSQL مع إعادة ضبط المخزون.
- انتقالات حالات الطلب مقيدة، وإلغاء/تعديل الطلبات محميان في Backend.
- إعدادات المتجر مشتركة عبر الأجهزة ومخزنة في PostgreSQL.
- رؤوس أمان، CORS مضبوط، رسائل أخطاء عربية، وFallback للـ SPA.

## فحوصات قبل النشر

```bash
pnpm run typecheck
pnpm run build
pnpm --filter @workspace/api-server run build
pnpm --filter @workspace/store run build
```

اختبر يدويًا: تسجيل المدير وتغيير كلمة المرور، منع العميل من الإدارة، إنشاء
طلب بكمية أكبر من المخزون، فتح الفاتورة وتعديلها وطباعتها، ورفع صورة من لوحة
الإدارة.