import { sql } from "drizzle-orm";
import { check, index, integer, pgTable, text, timestamp, uuid, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { communityEmailRuns } from "./communityEmailRuns";

export const communityEmailDeliveries = pgTable("community_email_deliveries", {
  id: uuid("id").primaryKey().defaultRandom(),
  runId: uuid("run_id").references(() => communityEmailRuns.id, { onDelete: "restrict" }),
  clerkId: text("clerk_id").notNull(),
  kind: text("kind").notNull(),
  dedupeKey: text("dedupe_key").notNull(),
  idempotencyKey: text("idempotency_key").notNull(),
  status: text("status").notNull().default("queued"),
  providerId: text("provider_id"),
  attempts: integer("attempts").notNull().default(0),
  claimExpiresAt: timestamp("claim_expires_at", { withTimezone: true }),
  nextAttemptAt: timestamp("next_attempt_at", { withTimezone: true }),
  lastErrorCode: text("last_error_code"),
  providerEventAt: timestamp("provider_event_at", { withTimezone: true }),
  providerEventId: text("provider_event_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, t => [
  uniqueIndex("community_email_deliveries_dedupe").on(t.dedupeKey),
  uniqueIndex("community_email_deliveries_idempotency").on(t.idempotencyKey),
  uniqueIndex("community_email_deliveries_provider").on(t.providerId),
  index("community_email_deliveries_work").on(t.status, t.nextAttemptAt),
  index("community_email_deliveries_member_date").on(t.clerkId, t.createdAt),
  check("community_email_deliveries_kind", sql`${t.kind} IN ('welcome', 'daily', 'weekly')`),
  check("community_email_deliveries_status", sql`${t.status} IN ('queued', 'claimed', 'accepted', 'delivered', 'bounced', 'complained', 'suppressed', 'failed', 'unknown')`),
  check("community_email_deliveries_attempts", sql`${t.attempts} >= 0`),
  check("community_email_deliveries_run", sql`(${t.kind} = 'welcome' AND ${t.runId} IS NULL) OR (${t.kind} IN ('daily', 'weekly') AND ${t.runId} IS NOT NULL)`),
]);
export const insertCommunityEmailDeliverySchema = createInsertSchema(communityEmailDeliveries).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCommunityEmailDelivery = z.infer<typeof insertCommunityEmailDeliverySchema>;
export type CommunityEmailDelivery = typeof communityEmailDeliveries.$inferSelect;
