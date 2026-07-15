// Placeholder for future rate limiting middleware.
//
// FUTURE PURPOSE: Once authentication and public write endpoints (e.g.
// applications, notifications) are live in later stages, this middleware
// will throttle requests per IP/user to protect the API from abuse and
// brute-force attempts. It is intentionally a no-op in Stage 0 — the
// foundation stage does not implement authentication or rate limiting.
//
// When implemented, wire it up in `app.ts` before the route handlers:
//   app.use("/api", rateLimit(), router);

import type { NextFunction, Request, Response } from "express";

export function rateLimit() {
  return (_req: Request, _res: Response, next: NextFunction): void => {
    next();
  };
}
