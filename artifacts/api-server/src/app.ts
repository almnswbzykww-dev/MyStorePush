import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import session from "express-session";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { CLERK_PROXY_PATH, clerkProxyMiddleware } from "./middlewares/clerkProxyMiddleware";
import router from "./routes";
import { logger } from "./lib/logger";

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET environment variable is required");
}

const isProduction = process.env.NODE_ENV === "production";

const app: Express = express();

// Trust the Replit / reverse-proxy "X-Forwarded-*" headers so that
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
// Replit proxy / production host), so restrict CORS to that origin instead of
// reflecting any Origin header — avoids exposing session cookies cross-site.
const allowedOrigins = [
  process.env.REPLIT_DEV_DOMAIN && `https://${process.env.REPLIT_DEV_DOMAIN}`,
  process.env.REPLIT_DOMAINS?.split(",").map((d) => `https://${d.trim()}`),
].flat().filter((v): v is string => Boolean(v));

app.use(
  cors({
    origin: isProduction
      ? allowedOrigins.length > 0
        ? allowedOrigins
        : false
      : true,
    credentials: true,
  }),
);
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use(cookieParser());
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "lax",
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
  // When packaged for Windows the public dir sits next to the server bundle
  const publicDir = path.join(__dirname, "public");

  if (fs.existsSync(publicDir)) {
    app.use(express.static(publicDir, { maxAge: "1d" }));
    // SPA fallback — any non-API route returns index.html
    app.use((_req, res) => {
      res.sendFile(path.join(publicDir, "index.html"));
    });
    logger.info({ publicDir }, "✅ Frontend static files are being served");
  } else {
    logger.warn({ publicDir }, "⚠️  public/ directory not found — frontend not served");
  }
}

export default app;
