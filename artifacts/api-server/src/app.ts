import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { clerkMiddleware } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";
import { CLERK_PROXY_PATH, clerkProxyMiddleware, getClerkProxyHost } from "./middlewares/clerkProxyMiddleware";
import { processStripeWebhook } from "./services/networkPayments";
import { networkErrors } from "./routes/network";

const app: Express = express();

app.disable("x-powered-by");

/**
 * Trust proxy — Replit runs all traffic through a reverse proxy that sets
 * X-Forwarded-For. Setting trust proxy = 1 tells Express to resolve req.ip
 * from the first entry in X-Forwarded-For (the real client IP) rather than
 * the proxy's loopback address. This is required for per-client IP rate
 * limiting to work correctly. Without it, all requests share the same "IP"
 * key and rate limiting is effectively disabled for everyone or triggers
 * incorrectly for the first few requests.
 */
app.set("trust proxy", 1);

app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), geolocation=(), microphone=(), payment=(), usb=()",
  );
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  next();
});

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
/**
 * Same-origin requests work without CORS. Cross-origin browser requests are
 * opt-in through CORS_ORIGINS, a comma-separated allowlist supplied by the
 * deployment environment. No unverified public origin is allowed by default.
 */
const configuredCorsOrigins = new Set(
  (process.env["CORS_ORIGINS"] ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);

app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, false);
        return;
      }

      if (configuredCorsOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      // Same-origin browser requests do not need CORS headers. Allowing them
      // through keeps the API usable behind the platform's path proxy.
      callback(null, false);
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    optionsSuccessStatus: 204,
  }),
);
app.post("/api/stripe/webhook", express.raw({ type: "application/json", limit: "1mb" }), async (req, res) => {
  const signature = req.get("stripe-signature");
  if (!signature || !Buffer.isBuffer(req.body)) return void res.status(400).json({ error: "Invalid webhook signature or body." });
  try {
    await processStripeWebhook(req.body, signature);
    res.json({ received: true });
  } catch {
    res.status(400).json({ error: "Webhook verification or processing failed." });
  }
});
// Editorial structured text is bounded separately; all other APIs retain 32 KiB.
app.use("/api/founder/news/actions", express.json({ limit: "768kb" }));
app.use(express.json({ limit: "32kb" }));
app.use(express.urlencoded({ extended: false, limit: "16kb" }));

app.use(
  clerkMiddleware((req) => ({
    publishableKey: publishableKeyFromHost(
      getClerkProxyHost(req) ?? "",
      process.env.CLERK_PUBLISHABLE_KEY,
    ),
  })),
);
app.use("/api", router);
app.use(networkErrors);

// Generic error handler: never leak raw database/internal errors to the client.
app.use(
  (err: unknown, req: Request, res: Response, _next: NextFunction): void => {
    req.log.error({ err }, "Unhandled request error");
    if (res.headersSent) {
      return;
    }
    if (
      typeof err === "object" &&
      err !== null &&
      "status" in err &&
      (err as { status?: unknown }).status === 413
    ) {
      res.status(413).json({ error: "Request body too large" });
      return;
    }
    res.status(500).json({ error: "Internal server error" });
  },
);

export default app;
