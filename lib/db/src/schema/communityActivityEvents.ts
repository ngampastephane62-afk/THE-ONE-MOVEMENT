import { pgTable, text, timestamp, uuid, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// Store identity references only. Recheck discoverability when rendering.
export const communityActivityEvents = pgTable("community_activity_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventKey: text("event_key").notNull(),
  kind: text("kind").notNull(),
  subjectClerkId: text("subject_clerk_id").notNull(),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, t => [uniqueIndex("community_activity_event_key").on(t.eventKey)]);
export const insertCommunityActivityEventSchema = createInsertSchema(communityActivityEvents).omit({ id: true, createdAt: true });
export type InsertCommunityActivityEvent = z.infer<typeof insertCommunityActivityEventSchema>;
export type CommunityActivityEvent = typeof communityActivityEvents.$inferSelect;
