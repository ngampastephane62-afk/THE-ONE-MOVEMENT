import { sql } from "drizzle-orm";
import { pgTable, uuid, text, integer, timestamp, index, uniqueIndex, check } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { ecosystemMembersTable as members } from "./ecosystemMembers";
import { networkThreads } from "./network";
import { connectCallBudgets } from "./connectCallBudgets";

export const connectCallSessions = pgTable("connect_call_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  budgetMonthUtc: text("budget_month_utc").notNull().references(() => connectCallBudgets.monthUtc, { onDelete: "restrict" }),
  threadId: integer("thread_id").notNull().references(() => networkThreads.id, { onDelete: "restrict" }),
  initiatorId: integer("initiator_id").notNull().references(() => members.id, { onDelete: "restrict" }),
  recipientId: integer("recipient_id").notNull().references(() => members.id, { onDelete: "restrict" }),
  mode: text("mode").notNull(),
  status: text("status").notNull().default("ringing"),
  clientRequestId: uuid("client_request_id").notNull(),
  providerRoomName: text("provider_room_name"),
  reservedMicroUsd: integer("reserved_micro_usd").notNull(),
  reservationState: text("reservation_state").notNull().default("reserved"),
  ringExpiresAt: timestamp("ring_expires_at", { withTimezone: true }).notNull(),
  providerExpiresAt: timestamp("provider_expires_at", { withTimezone: true }).notNull(),
  answeredAt: timestamp("answered_at", { withTimezone: true }),
  endedAt: timestamp("ended_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, t => [
  uniqueIndex("connect_call_request").on(t.initiatorId, t.clientRequestId),
  uniqueIndex("connect_call_room").on(t.providerRoomName),
  uniqueIndex("connect_call_active_thread").on(t.threadId).where(sql`${t.status} IN ('ringing', 'provisioning', 'active', 'uncertain')`),
  index("connect_call_incoming").on(t.recipientId, t.status, t.createdAt),
  index("connect_call_outgoing").on(t.initiatorId, t.status, t.createdAt),
  index("connect_call_month").on(t.budgetMonthUtc, t.reservationState),
  check("connect_call_members", sql`${t.initiatorId} <> ${t.recipientId}`),
  check("connect_call_mode", sql`${t.mode} IN ('audio', 'video')`),
  check("connect_call_status", sql`${t.status} IN ('ringing', 'provisioning', 'active', 'declined', 'missed', 'cancelled', 'ended', 'failed', 'uncertain')`),
  check("connect_call_reservation", sql`${t.reservedMicroUsd} > 0 AND ${t.reservationState} IN ('reserved', 'committed', 'released')`),
  check("connect_call_deadlines", sql`${t.ringExpiresAt} > ${t.createdAt} AND ${t.providerExpiresAt} > ${t.ringExpiresAt} AND ${t.providerExpiresAt} <= ${t.createdAt} + interval '15 minutes'`),
]);
export const insertConnectCallSessionSchema = createInsertSchema(connectCallSessions);
export type ConnectCallSession = typeof connectCallSessions.$inferSelect;
export type InsertConnectCallSession = z.infer<typeof insertConnectCallSessionSchema>;
