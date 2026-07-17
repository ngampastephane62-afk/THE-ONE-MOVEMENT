import {
  boolean,
  index,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const institutionalInquiriesTable = pgTable(
  "institutional_inquiries",
  {
    id: serial("id").primaryKey(),
    organizationName: text("organization_name").notNull(),
    organizationType: text("organization_type").notNull(), // ORGANIZATION_TYPES
    country: text("country").notNull(),
    city: text("city"),
    website: text("website"),
    contactName: text("contact_name").notNull(),
    contactRole: text("contact_role").notNull(),
    emailNormalized: text("email_normalized").notNull(),
    message: text("message").notNull(),
    consentAccepted: boolean("consent_accepted").notNull(),
    consentTextVersion: text("consent_text_version").notNull(),
    status: text("status").notNull().default("new"), // "new" | "in_progress" | "closed"
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("institutional_inquiries_email_idx").on(table.emailNormalized),
  ],
);

export const insertInstitutionalInquirySchema = createInsertSchema(
  institutionalInquiriesTable,
).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertInstitutionalInquiry = z.infer<
  typeof insertInstitutionalInquirySchema
>;
export type InstitutionalInquiry =
  typeof institutionalInquiriesTable.$inferSelect;
