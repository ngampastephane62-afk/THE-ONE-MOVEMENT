import { sql } from "drizzle-orm";
import { check, date, integer, pgTable, primaryKey, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * Proposed consent-based, first-party visit measurement.
 * Deliberately excludes IP addresses, account IDs, URLs and raw session tokens.
 * The application must derive a different session hash per UTC day and enforce
 * the 90-day retention policy before collection is enabled.
 */
export const siteVisitSessionsTable = pgTable("site_visit_sessions", {
  day: date("day", { mode: "string" }).notNull(),
  sessionHash: varchar("session_hash", { length: 64 }).notNull(),
  pageViews: integer("page_views").notNull().default(1),
  firstSeenAt: timestamp("first_seen_at", { withTimezone: true }).notNull().defaultNow(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.day, table.sessionHash] }),
  check("site_visit_sessions_hash_check", sql`${table.sessionHash} ~ '^[a-f0-9]{64}$'`),
  check("site_visit_sessions_views_check", sql`${table.pageViews} > 0`),
  check("site_visit_sessions_times_check", sql`${table.lastSeenAt} >= ${table.firstSeenAt}`),
]);

export const insertSiteVisitSessionSchema = createInsertSchema(siteVisitSessionsTable)
  .omit({ firstSeenAt: true, lastSeenAt: true });
export type InsertSiteVisitSession = z.infer<typeof insertSiteVisitSessionSchema>;
export type SiteVisitSession = typeof siteVisitSessionsTable.$inferSelect;
