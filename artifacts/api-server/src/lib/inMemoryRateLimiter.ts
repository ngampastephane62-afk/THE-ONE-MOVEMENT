/**
 * In-memory fixed-window rate limiter.
 *
 * Configuration: 5 requests per IP per 10 minutes per route.
 * Each call to createRateLimiter() returns an independent middleware with its
 * own bucket map — callers use separate instances per route so buckets never
 * bleed across endpoints.
 *
 * Keying: req.ip (resolved after app.set("trust proxy", 1) in app.ts).
 * Trust-proxy note: Replit runs behind a reverse proxy that sets
 * X-Forwarded-For. With trust proxy = 1, Express resolves req.ip to the
 * first left-most entry in X-Forwarded-For, which is the real client IP.
 * Without trust proxy, req.ip would be the proxy's loopback address and
 * every request would share one bucket — effectively disabling per-client
 * limiting. This is why trust proxy MUST be set before mounting these
 * middlewares (see app.ts).
 *
 * Restart-reset limitation: bucket state lives in process memory. A server
 * restart clears all windows. Acceptable at Stage 1; revisit at deployment
 * hardening with a shared store (Redis, etc.).
 *
 * Headers emitted: none (no Retry-After, no X-RateLimit-* headers at Stage 1;
 * avoids leaking window size/count to clients).
 *
 * Response on limit exceeded: HTTP 429 in unified error shape.
 */

import type { NextFunction, Request, Response } from "express";
import { sendError } from "./errorResponse";

interface Bucket {
  count: number;
  windowStart: number; // epoch ms
}

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS = 5;

export function createRateLimiter(): (
  req: Request,
  res: Response,
  next: NextFunction,
) => void {
  const buckets = new Map<string, Bucket>();

  return (req: Request, res: Response, next: NextFunction): void => {
    // req.ip is reliable only after trust proxy is set in app.ts
    const ip = req.ip ?? "unknown";
    const now = Date.now();

    const existing = buckets.get(ip);

    if (!existing || now - existing.windowStart > WINDOW_MS) {
      // New window
      buckets.set(ip, { count: 1, windowStart: now });
      next();
      return;
    }

    if (existing.count >= MAX_REQUESTS) {
      sendError(
        res,
        429,
        "RATE_LIMITED",
        "Too many requests. Please try again later.",
      );
      return;
    }

    existing.count += 1;
    next();
  };
}
