import { Router } from "express";
import { createHash } from "node:crypto";
import { and, eq, sql } from "drizzle-orm";
import { db, magazineReadingEvents as events } from "@workspace/db";
import { RecordMagazineReadingEventBody } from "@workspace/api-zod";
import { NetworkError } from "../services/networkAuth";
import { createRateLimiter } from "../lib/inMemoryRateLimiter";

const router = Router();
const editionId = "tropik-editorial-2026";
const writes = createRateLimiter({ maxRequests: 60, windowMs: 60_000 });

router.get("/magazine/statistics", async (_req, res) => {
  const [row] = await db.select({
    opens: sql<number>`count(*) filter (where ${events.eventKey} = 'open')::integer`,
    pagesViewed: sql<number>`count(*) filter (where ${events.eventKey} like 'page:%')::integer`,
    engagedSessions: sql<number>`count(*) filter (where ${events.eventKey} = 'engaged')::integer`,
    startedAt: sql<string | null>`min(${events.createdAt})::text`,
  }).from(events).where(eq(events.editionId, editionId));
  res.set("Cache-Control", "no-store").json({
    editionId, opens: row.opens, pagesViewed: row.pagesViewed,
    engagedSessions: row.engagedSessions, startedAt: row.startedAt ? new Date(row.startedAt).toISOString() : null,
    updatedAt: new Date().toISOString(),
  });
});

router.post("/magazine/reading-events", writes, async (req, res) => {
  const parsed = RecordMagazineReadingEventBody.strict().safeParse(req.body);
  if (!parsed.success) throw new NetworkError(400, "Invalid magazine reading event.");
  const input = parsed.data;
  if ((input.event === "page") !== (input.page !== undefined))
    throw new NetworkError(400, "A page number is required only for a page event.");
  // Exclude known automated clients; these counters are not a verified-people census.
  if (/bot\b|spider|crawler|HeadlessChrome|Playwright|curl\/|wget\//i.test(req.get("user-agent") ?? ""))
    return void res.set("Cache-Control", "no-store").json({ recorded: false });
  const sessionHash = createHash("sha256").update(input.sessionId.toLowerCase()).digest("hex");
  const session = and(eq(events.editionId, editionId), eq(events.sessionHash, sessionHash));
  if (input.event !== "open") {
    const [open] = await db.select({ at: events.createdAt }).from(events)
      .where(and(session, eq(events.eventKey, "open"))).limit(1);
    if (!open) throw new NetworkError(400, "Open the magazine before recording reading activity.");
    if (input.event === "engaged") {
      const [pages] = await db.select({ count: sql<number>`count(*)::integer` }).from(events)
        .where(and(session, sql`${events.eventKey} like 'page:%'`));
      if (Date.now() - open.at.getTime() < 30_000 || pages.count < 2)
        throw new NetworkError(400, "An engaged session requires at least thirty seconds and two different pages.");
    }
  }
  await db.insert(events).values({
    editionId, sessionHash, eventKey: input.event === "page" ? `page:${input.page}` : input.event,
  }).onConflictDoNothing();
  res.set("Cache-Control", "no-store").json({ recorded: true });
});

export default router;
