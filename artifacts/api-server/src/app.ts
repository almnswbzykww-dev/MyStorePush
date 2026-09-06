import express, { type Express } from "express";
import cors from "cors";
import connectPgSimple from "connect-pg-simple";
import pinoHttp from "pino-http";
import session from "express-session";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { CLERK_PROXY_PATH, clerkProxyMiddleware } from "./middlewares/clerkProxyMiddleware";
import router from "./routes";
import { logger } from "./lib/logger";
import { pool } from "@workspace/db";

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET environment variable is required");
}

const isProduction = process.env.NODE_ENV === "production";
const PgStore = connectPgSimple(session);

const app: Express = express();

// Trust the hosting platform / reverse-proxy "X-Forwarded-*" headers so that
// req.secure is correct and Set-Cookie: Secure works in production.
app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

// Same-origin app (frontend and API are served under the same domain via the
// hosting proxy / production host), so restrict CORS to that origin instead of
// reflecting any Origin header — avoids exposing session cookies cross-site.
const configuredOrigins = process.env.APP_ORIGIN
  ?.split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean) ?? [];
const allowedOrigins = [
  ...configuredOrigins,
  process.env.REPLIT_DEV_DOMAIN && `https://${process.env.REPLIT_DEV_DOMAIN}`,
  process.env.REPLIT_DOMAINS?.split(",").map((d) => `https://${d.trim()}`),
].flat().filter((v): v is string => Boolean(v));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || !isProduction || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Origin غير مسموح"));
    },
    credentials: true,
  }),
);
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (isProduction) {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
});
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());
app.use(
  session({
    secret: sessionSecret,
    store: new PgStore({
      pool,
      tableName: "user_sessions",
      createTableIfMissing: true,
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "lax",
      path: "/",
    },
  }),
);

if (process.env.CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY) {
  const { clerkMiddleware } = await import("@clerk/express");
  app.use(clerkMiddleware());
} else {
  logger.info("Clerk keys not configured — running in session-only auth mode");
}

app.use("/api", router);

// ── Production: serve the built React frontend from the same Express process ──
// This lets everything run on a single port (3000) with no separate Vite server.
if (isProduction) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  // In a single-process production build the public dir sits next to the server bundle.
  const publicDir = path.join(__dirname, "public");

  if (fs.existsSync(publicDir)) {
    app.use(express.static(publicDir, { maxAge: "1d" }));
    // SPA fallback — any non-API route returns index.html
    app.use((req, res, next) => {
      if (req.path.startsWith("/api")) {
        next();
        return;
      }
      res.sendFile(path.join(publicDir, "index.html"));
    });
    logger.info({ publicDir }, "✅ Frontend static files are being served");
  } else {
    logger.warn({ publicDir }, "⚠️  public/ directory not found — frontend not served");
  }
}

app.use((_req, res) => {
  res.status(404).json({ error: "المسار غير موجود" });
});

app.use((error: any, _req: any, res: any, _next: any) => {
  logger.error({ err: error }, "Unhandled request error");
  if (res.headersSent) return;
  res.status(error?.statusCode ?? 500).json({
    error: isProduction ? "حدث خطأ في الخادم" : (error?.message ?? "حدث خطأ في الخادم"),
  });
});

export default app;
