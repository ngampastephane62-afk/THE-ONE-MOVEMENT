import { sql } from "drizzle-orm";
import { check, integer, pgTable, text, timestamp, uuid, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const communityEmailRuns = pgTable("community_email_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  kind: text("kind").notNull(),
  periodKey: text("period_key").notNull(),
  status: text("status").notNull().default("draft"),
  periodStart: timestamp("period_start", { withTimezone: true }).notNull(),
  periodEnd: timestamp("period_end", { withTimezone: true }).notNull(),
  featuredArticleIds: integer("featured_article_ids").array().notNull().default([]),
  approvedContentHash: text("approved_content_hash"),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, t => [
  uniqueIndex("community_email_runs_period").on(t.kind, t.periodKey),
  check("community_email_runs_kind", sql`${t.kind} IN ('daily', 'weekly')`),
  check("community_email_runs_status", sql`${t.status} IN ('draft', 'approved', 'running', 'completed', 'paused')`),
  check("community_email_runs_range", sql`${t.periodEnd} > ${t.periodStart}`),
  check("community_email_runs_approval", sql`${t.status} NOT IN ('approved', 'running', 'completed') OR (${t.approvedContentHash} IS NOT NULL AND ${t.approvedAt} IS NOT NULL)`),
]);
export const insertCommunityEmailRunSchema = createInsertSchema(communityEmailRuns).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCommunityEmailRun = z.infer<typeof insertCommunityEmailRunSchema>;
export type CommunityEmailRun = typeof communityEmailRuns.$inferSelect;
