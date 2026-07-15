import { pgTable, serial, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const profileCategoriesTable = pgTable("profile_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  groupName: text("group_name").notNull(),
});

export const insertProfileCategorySchema = createInsertSchema(
  profileCategoriesTable,
).omit({ id: true });
export type InsertProfileCategory = z.infer<
  typeof insertProfileCategorySchema
>;
export type ProfileCategory = typeof profileCategoriesTable.$inferSelect;
