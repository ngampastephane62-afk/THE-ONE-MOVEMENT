import { createHmac } from "node:crypto";
import { db, siteVisitSessionsTable as visits } from "@workspace/db";
import { lt, sql } from "drizzle-orm";

export function visitDay(now = new Date()) { return now.toISOString().slice(0, 10); }
export function visitSessionHash(sessionId: string, now = new Date()) {
  if (!process.env.SESSION_SECRET) throw new Error("Visit measurement requires the configured server secret.");
  return createHmac("sha256", process.env.SESSION_SECRET).update(`visit:${visitDay(now)}:${sessionId}`).digest("hex");
}
export function visitRetentionDay(now = new Date()) {
  const cutoff = new Date(now);
  cutoff.setUTCDate(cutoff.getUTCDate() - 89);
  return visitDay(cutoff);
}
export async function pruneVisits() {
  await db.delete(visits).where(lt(visits.day, visitRetentionDay()));
}
export async function recordVisit(sessionId: string) {
  const now = new Date();
  const day = visitDay(now);
  await db.insert(visits).values({ day, sessionHash: visitSessionHash(sessionId, now), firstSeenAt: now, lastSeenAt: now })
    .onConflictDoUpdate({ target: [visits.day, visits.sessionHash],
      set: { pageViews: sql`${visits.pageViews} + 1`, lastSeenAt: sql`greatest(${visits.lastSeenAt}, ${now})` } });
}

/** Runs only when the server explicitly starts this module. No network service,
 * financial initialization or schema migration is performed. */
export function startVisitRetention(onError: (error: unknown) => void) {
  const purge = () => { void pruneVisits().catch(onError); };
  purge();
  const timer = setInterval(purge, 60 * 60 * 1000);
  timer.unref();
  return () => clearInterval(timer);
}
