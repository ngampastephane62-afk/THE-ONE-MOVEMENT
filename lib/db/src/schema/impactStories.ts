import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const impactStoriesTable = pgTable("impact_stories", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  country: text("country"),
  summary: text("summary"),
  body: text("body"),
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertImpactStorySchema = createInsertSchema(
  impactStoriesTable,
).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertImpactStory = z.infer<typeof insertImpactStorySchema>;
export type ImpactStory = typeof impactStoriesTable.$inferSelect;
