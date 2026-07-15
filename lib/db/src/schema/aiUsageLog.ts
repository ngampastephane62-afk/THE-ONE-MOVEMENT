import {
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const aiUsageLogTable = pgTable("ai_usage_log", {
  id: serial("id").primaryKey(),
  feature: text("feature").notNull(),
  tokensUsed: integer("tokens_used"),
  costEstimate: numeric("cost_estimate", { precision: 10, scale: 4 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertAiUsageLogSchema = createInsertSchema(
  aiUsageLogTable,
).omit({ id: true, createdAt: true });
export type InsertAiUsageLog = z.infer<typeof insertAiUsageLogSchema>;
export type AiUsageLog = typeof aiUsageLogTable.$inferSelect;
