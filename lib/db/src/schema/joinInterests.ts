import {
  boolean,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const joinInterestsTable = pgTable("join_interests", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  emailNormalized: text("email_normalized").notNull().unique(),
  country: text("country").notNull(),
  city: text("city"),
  joiningAs: text("joining_as").notNull(), // "individual" | "organization"
  audienceGroup: text("audience_group").notNull(), // JOINABLE_GROUPS
  category: text("category").notNull(), // CATEGORIES_BY_GROUP value
  organizationName: text("organization_name"),
  contactRole: text("contact_role"),
  sectorSlugs: text("sector_slugs").array(),
  programSlugs: text("program_slugs").array(),
  notifyOpportunities: boolean("notify_opportunities").notNull().default(false),
  lookingFor: text("looking_for"),
  consentAccepted: boolean("consent_accepted").notNull(),
  consentTextVersion: text("consent_text_version").notNull(),
  status: text("status").notNull().default("pending"), // "pending" | "reviewed" | "converted" | "archived"
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertJoinInterestSchema = createInsertSchema(
  joinInterestsTable,
).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertJoinInterest = z.infer<typeof insertJoinInterestSchema>;
export type JoinInterest = typeof joinInterestsTable.$inferSelect;
