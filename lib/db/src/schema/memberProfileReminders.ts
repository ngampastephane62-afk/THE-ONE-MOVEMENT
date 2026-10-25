import { sql } from "drizzle-orm";
import { check, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * Last profile-reminder state per Clerk account, not a second identity store.
 * No recipient address, email content or provider credentials are stored here.
 * `accepted` means the provider accepted the request, not confirmed delivery.
 * Application-level locking and provider idempotency must enforce the seven-day
 * interval and safely reconcile an interrupted or ambiguous send.
 */
export const memberProfileRemindersTable = pgTable("member_profile_reminders", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: text("clerk_id").notNull().unique(),
  requestedBy: text("requested_by").notNull(),
  attemptId: uuid("attempt_id").notNull().defaultRandom(),
  status: text("status").$type<"sending" | "accepted" | "failed" | "unknown">().notNull().default("sending"),
  providerMessageId: varchar("provider_message_id", { length: 255 }),
  lastAttemptAt: timestamp("last_attempt_at", { withTimezone: true }).notNull().defaultNow(),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  optOutAt: timestamp("opt_out_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  check("member_profile_reminders_status_check", sql`${table.status} IN ('sending', 'accepted', 'failed', 'unknown')`),
]);

export const insertMemberProfileReminderSchema = createInsertSchema(memberProfileRemindersTable)
  .omit({ id: true, attemptId: true, createdAt: true, updatedAt: true });
export type InsertMemberProfileReminder = z.infer<typeof insertMemberProfileReminderSchema>;
export type MemberProfileReminder = typeof memberProfileRemindersTable.$inferSelect;
