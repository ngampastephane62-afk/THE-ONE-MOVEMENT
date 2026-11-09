import { sql } from "drizzle-orm";
import { pgTable, text, integer, boolean, timestamp, check } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const connectCallBudgets = pgTable("connect_call_budgets", {
  monthUtc: text("month_utc").primaryKey(),
  providerDomainId: text("provider_domain_id").notNull(),
  limitMicroUsd: integer("limit_micro_usd").notNull().default(20_000_000),
  admissionLimitMicroUsd: integer("admission_limit_micro_usd").notNull().default(18_000_000),
  reservedMicroUsd: integer("reserved_micro_usd").notNull().default(0),
  committedMicroUsd: integer("committed_micro_usd").notNull().default(0),
  providerObservedMicroUsd: integer("provider_observed_micro_usd"),
  providerCheckedAt: timestamp("provider_checked_at", { withTimezone: true }),
  paused: boolean("paused").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, t => [
  check("connect_call_budget_month", sql`${t.monthUtc} ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'`),
  check("connect_call_budget_domain", sql`length(btrim(${t.providerDomainId})) > 0`),
  check("connect_call_budget_limits", sql`${t.limitMicroUsd} BETWEEN 0 AND 20000000 AND ${t.admissionLimitMicroUsd} BETWEEN 0 AND ${t.limitMicroUsd}`),
  check("connect_call_budget_nonnegative", sql`${t.reservedMicroUsd} >= 0 AND ${t.committedMicroUsd} >= 0 AND (${t.providerObservedMicroUsd} IS NULL OR ${t.providerObservedMicroUsd} >= 0)`),
  check("connect_call_budget_reservations", sql`${t.reservedMicroUsd} + ${t.committedMicroUsd} <= ${t.admissionLimitMicroUsd}`),
]);
export const insertConnectCallBudgetSchema = createInsertSchema(connectCallBudgets);
export type ConnectCallBudget = typeof connectCallBudgets.$inferSelect;
export type InsertConnectCallBudget = z.infer<typeof insertConnectCallBudgetSchema>;
