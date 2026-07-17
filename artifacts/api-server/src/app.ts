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

const app: Express = express();

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
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Generic error handler: never leak raw database/internal errors to the client.
app.use(
  (err: unknown, req: Request, res: Response, _next: NextFunction): void => {
    req.log.error({ err }, "Unhandled request error");
    if (res.headersSent) {
      return;
    }
    res.status(500).json({ error: "Internal server error" });
  },
);

export default app;
