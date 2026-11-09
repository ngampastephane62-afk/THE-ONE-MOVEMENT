import { sql } from "drizzle-orm";
import { boolean, check, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// Absence of a record never implies email consent. Resolve verified email
// from Clerk at delivery time rather than persisting a second address list.
export const communityCommunicationPreferences = pgTable("community_communication_preferences", {
  clerkId: text("clerk_id").primaryKey(),
  frequency: text("frequency").notNull().default("in_app"),
  welcomeAllowed: boolean("welcome_allowed").notNull().default(false),
  consentedAt: timestamp("consented_at", { withTimezone: true }),
  consentVersion: text("consent_version"),
  suppressedAt: timestamp("suppressed_at", { withTimezone: true }),
  suppressionReason: text("suppression_reason"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, t => [
  check("community_preferences_frequency", sql`${t.frequency} IN ('daily', 'weekly', 'in_app', 'off')`),
  check("community_preferences_email_consent", sql`(${t.frequency} NOT IN ('daily', 'weekly') AND NOT ${t.welcomeAllowed}) OR (${t.consentedAt} IS NOT NULL AND ${t.consentVersion} IS NOT NULL)`),
]);
export const insertCommunityCommunicationPreferenceSchema = createInsertSchema(communityCommunicationPreferences).omit({ updatedAt: true });
export type InsertCommunityCommunicationPreference = z.infer<typeof insertCommunityCommunicationPreferenceSchema>;
export type CommunityCommunicationPreference = typeof communityCommunicationPreferences.$inferSelect;
