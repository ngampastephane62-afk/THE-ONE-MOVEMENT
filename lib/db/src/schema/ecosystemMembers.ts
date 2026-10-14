import { boolean, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

// Clerk owns identity and verified-email authentication. This table contains
// only the member's chosen ecosystem profile, private unless explicitly listed.
export const ecosystemMembersTable = pgTable("ecosystem_members", {
  id: serial("id").primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  fullName: text("full_name").notNull(),
  profession: text("profession").notNull(),
  organization: text("organization").notNull().default(""),
  country: text("country").notNull().default(""),
  bio: text("bio").notNull().default(""),
  offering: text("offering").notNull().default(""),
  lookingFor: text("looking_for").notNull().default(""),
  website: text("website").notNull().default(""),
  sectors: text("sectors").array().notNull().default([]),
  savedItems: text("saved_items").array().notNull().default([]),
  isPublic: boolean("is_public").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
