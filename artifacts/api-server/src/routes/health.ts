import { Router, type IRouter } from "express";
import { sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { HealthCheckResponse, GetHealthResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

// Detailed health check: confirms the API is up AND the database is reachable.
router.get("/health", async (req, res): Promise<void> => {
  try {
    await db.execute(sql`select 1`);
    const data = GetHealthResponse.parse({
      status: "ok",
      database: "connected",
    });
    res.json(data);
  } catch (err) {
    req.log.error({ err }, "Database connectivity check failed");
    const data = GetHealthResponse.parse({
      status: "ok",
      database: "unavailable",
    });
    res.status(503).json(data);
  }
});

export default router;
