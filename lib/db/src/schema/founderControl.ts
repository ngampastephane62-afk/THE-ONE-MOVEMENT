import { pgTable, text, timestamp, serial, integer, boolean, jsonb, uniqueIndex, index } from "drizzle-orm/pg-core";

// Clerk identities, rather than ecosystem profile IDs: accounts without a
// profile must remain administratively addressable. Never store credentials.
export const founderAccountObservations = pgTable("founder_account_observations", {
  clerkId: text("clerk_id").primaryKey(),
  verified: boolean("verified").notNull(),
  complete: boolean("complete").notNull(),
  observedAt: timestamp("observed_at", { withTimezone: true }).notNull().defaultNow(),
});
export const founderControlSettings = pgTable("founder_control_settings", {
  key: text("key").primaryKey(),
  enabledKinds: text("enabled_kinds").array().notNull().default([]),
  readThrough: integer("read_through").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
export const founderNotifications = pgTable("founder_notifications", {
  id: serial("id").primaryKey(),
  eventKey: text("event_key").notNull(),
  kind: text("kind").notNull(),
  targetClerkId: text("target_clerk_id"),
  title: text("title").notNull(),
  detail: jsonb("detail").$type<Record<string, unknown>>().notNull().default({}),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, t => [uniqueIndex("founder_notifications_event_key").on(t.eventKey), index("founder_notifications_date").on(t.createdAt)]);
export const founderServiceMessages = pgTable("founder_service_messages", {
  id: serial("id").primaryKey(),
  requestId: text("request_id").notNull(),
  recipientClerkId: text("recipient_clerk_id").notNull(),
  senderClerkId: text("sender_clerk_id").notNull(),
  fromAdministration: boolean("from_administration").notNull(),
  text: text("text").notNull(),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, t => [
  uniqueIndex("founder_service_messages_request").on(t.requestId),
  index("founder_service_messages_recipient").on(t.recipientClerkId, t.id),
]);
