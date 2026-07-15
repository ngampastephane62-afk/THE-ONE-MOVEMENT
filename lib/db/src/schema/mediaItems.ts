import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const mediaItemsTable = pgTable("media_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category"),
  type: text("type"),
  body: text("body"),
  mediaUrl: text("media_url"),
  status: text("status").notNull().default("draft"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertMediaItemSchema = createInsertSchema(mediaItemsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertMediaItem = z.infer<typeof insertMediaItemSchema>;
export type MediaItem = typeof mediaItemsTable.$inferSelect;
