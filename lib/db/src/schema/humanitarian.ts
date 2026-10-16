import { pgTable, serial, text, integer, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { ecosystemMembersTable } from "./ecosystemMembers";

export const humanitarianPayments = pgTable("humanitarian_payments", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").references(() => ecosystemMembersTable.id, { onDelete: "set null" }),
  kind: text("kind").notNull(),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull(),
  status: text("status").notNull().default("pending"),
  grantsArchive: boolean("grants_archive").notNull().default(false),
  liveMode: boolean("live_mode").notNull().default(false),
  stripeSessionId: text("stripe_session_id").unique(),
  paymentIntentId: text("payment_intent_id").unique(),
  refundedAmount: integer("refunded_amount").notNull().default(0),
  consentVersion: text("consent_version").notNull(),
  requestId: text("request_id").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, table => [index("humanitarian_member_access_idx").on(table.memberId, table.status)]);
export const humanitarianOffers = pgTable("humanitarian_offers", {
  id: serial("id").primaryKey(),
  kind: text("kind").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  country: text("country").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("new"),
  consentVersion: text("consent_version").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
export const insertHumanitarianPaymentSchema = createInsertSchema(humanitarianPayments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertHumanitarianOfferSchema = createInsertSchema(humanitarianOffers).omit({ id: true, createdAt: true });
export type HumanitarianPayment = typeof humanitarianPayments.$inferSelect;
export type InsertHumanitarianPayment = z.infer<typeof insertHumanitarianPaymentSchema>;
export type HumanitarianOffer = typeof humanitarianOffers.$inferSelect;
