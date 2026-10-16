import { pgTable, serial, integer, text, boolean, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { ecosystemMembersTable as members } from "./ecosystemMembers";

export const monthlyMemberships = pgTable("monthly_memberships", {
  memberId: integer("member_id").primaryKey().references(() => members.id, { onDelete: "cascade" }),
  tier: text("tier").notNull().default("professional"),
  status: text("status").notNull().default("pending"),
  subscriptionId: text("subscription_id").unique(),
  checkoutSessionId: text("checkout_session_id"),
  liveMode: boolean("live_mode").notNull().default(false),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
export const professionalBusinesses = pgTable("professional_businesses", {
  memberId: integer("member_id").primaryKey().references(() => members.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  website: text("website").notNull(),
  registrationReference: text("registration_reference").notNull(),
  status: text("status").notNull().default("pending"),
  decisionNote: text("decision_note").notNull().default(""),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
});
export const businessAttestations = pgTable("business_attestations", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").notNull().references(() => professionalBusinesses.memberId, { onDelete: "cascade" }),
  attesterId: integer("attester_id").notNull().references(() => members.id, { onDelete: "cascade" }),
  statement: text("statement").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, t => [uniqueIndex("business_attestation_unique").on(t.ownerId, t.attesterId)]);
export const professionalIntroductions = pgTable("professional_introductions", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull().references(() => members.id, { onDelete: "cascade" }),
  targetSlug: text("target_slug").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("received"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
export const editorialLikes = pgTable("editorial_likes", {
  id: serial("id").primaryKey(),
  videoId: text("video_id").notNull(),
  memberId: integer("member_id").notNull().references(() => members.id, { onDelete: "cascade" }),
}, t => [uniqueIndex("editorial_like_unique").on(t.videoId, t.memberId)]);
export const editorialComments = pgTable("editorial_comments", {
  id: serial("id").primaryKey(),
  videoId: text("video_id").notNull(),
  memberId: integer("member_id").notNull().references(() => members.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  hidden: boolean("hidden").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
