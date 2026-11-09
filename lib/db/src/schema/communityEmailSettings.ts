import { sql } from "drizzle-orm";
import { boolean, check, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// No seed: Founder must choose timezone/hour before any activation.
export const communityEmailSettings = pgTable("community_email_settings", {
  id: integer("id").primaryKey(),
  paused: boolean("paused").notNull().default(true),
  timezone: text("timezone").notNull(),
  sendHour: integer("send_hour").notNull(),
  weeklyDay: integer("weekly_day").notNull(),
  introduction: text("introduction").notNull().default(""),
  firstApprovedAt: timestamp("first_approved_at", { withTimezone: true }),
  approvedByClerkId: text("approved_by_clerk_id"),
  baselineAt: timestamp("baseline_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, t => [
  check("community_email_settings_singleton", sql`${t.id} = 1`),
  check("community_email_settings_hour", sql`${t.sendHour} BETWEEN 0 AND 23`),
  check("community_email_settings_day", sql`${t.weeklyDay} BETWEEN 0 AND 6`),
  check("community_email_settings_approval", sql`${t.paused} OR (${t.firstApprovedAt} IS NOT NULL AND ${t.approvedByClerkId} IS NOT NULL)`),
]);
export const insertCommunityEmailSettingSchema = createInsertSchema(communityEmailSettings).omit({ updatedAt: true });
export type InsertCommunityEmailSetting = z.infer<typeof insertCommunityEmailSettingSchema>;
export type CommunityEmailSetting = typeof communityEmailSettings.$inferSelect;
