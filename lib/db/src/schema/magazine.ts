import { pgTable, serial, text, integer, boolean, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { ecosystemMembersTable } from "./ecosystemMembers";

/** Anonymous reading sessions, not people. No IP, email or account identity is stored. */
export const magazineReadingEvents = pgTable("magazine_reading_events", {
  id: serial("id").primaryKey(),
  editionId: text("edition_id").notNull(),
  sessionHash: text("session_hash").notNull(),
  eventKey: text("event_key").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex("magazine_reading_event_unique").on(t.editionId, t.sessionHash, t.eventKey),
  index("magazine_reading_edition_idx").on(t.editionId, t.createdAt),
]);

export const magazineOrders = pgTable("magazine_orders", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull().references(() => ecosystemMembersTable.id),
  format: text("format").$type<"digital" | "print" | "feature">().notNull(),
  status: text("status").notNull(),
  itemAmount: integer("item_amount").notNull(),
  shippingAmount: integer("shipping_amount"),
  currency: text("currency").notNull().default("usd"),
  fullName: text("full_name"),
  address: text("address"),
  country: text("country"),
  phone: text("phone"),
  email: text("email").notNull(),
  requestId: text("request_id").notNull().unique(),
  stripeSessionId: text("stripe_session_id").unique(),
  paymentIntentId: text("payment_intent_id").unique(),
  liveMode: boolean("live_mode").notNull().default(false),
  refundedAmount: integer("refunded_amount").notNull().default(0),
  consentVersion: text("consent_version").notNull(),
  quotedAt: timestamp("quoted_at", { withTimezone: true }),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("magazine_orders_member_idx").on(t.memberId, t.createdAt)]);
export type MagazineOrderRow = typeof magazineOrders.$inferSelect;

export const magazineSubmissions = pgTable("magazine_submissions", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().unique().references(() => magazineOrders.id),
  title: text("title").notNull(),
  body: text("body").notNull(),
  photoUrl: text("photo_url").notNull().default(""),
  reviewNote: text("review_note").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
