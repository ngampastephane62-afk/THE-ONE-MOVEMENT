import { pgTable, serial, text, integer, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { ecosystemMembersTable } from "./ecosystemMembers";

export const magazineOrders = pgTable("magazine_orders", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull().references(() => ecosystemMembersTable.id),
  format: text("format").$type<"digital" | "print">().notNull(),
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
