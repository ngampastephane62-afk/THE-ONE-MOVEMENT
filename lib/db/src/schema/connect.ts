import { sql } from "drizzle-orm";
import {
  pgTable, uuid, integer, text, boolean, timestamp, index, uniqueIndex,
  primaryKey, check, foreignKey, unique, type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { ecosystemMembersTable as members } from "./ecosystemMembers";
import { networkThreads, networkMessages } from "./network";

// Additive extension only: the legacy tables and their IDs remain unchanged.
// These declarations do not enable routes or migrate the database.
export const connectPreferences = pgTable("connect_preferences", {
  memberId: integer("member_id").primaryKey().references(() => members.id, { onDelete: "cascade" }),
  theme: text("theme").notNull().default("original"),
  showPresence: boolean("show_presence").notNull().default(false),
  notificationPreviews: boolean("notification_previews").notNull().default(false),
  inAppNotifications: boolean("in_app_notifications").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, t => [
  check("connect_preferences_theme", sql`${t.theme} IN ('emerald-gold', 'midnight', 'ivory', 'dark-professional', 'original')`),
]);

export const connectConversations = pgTable("connect_conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  kind: text("kind").notNull(),
  // A direct chat extends exactly one existing thread, never replaces it.
  legacyThreadId: integer("legacy_thread_id").references(() => networkThreads.id, { onDelete: "restrict" }),
  title: text("title").notNull().default(""),
  createdBy: integer("created_by").references(() => members.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, t => [
  uniqueIndex("connect_conversations_legacy_thread").on(t.legacyThreadId),
  check("connect_conversations_kind", sql`${t.kind} IN ('direct', 'group')`),
  check("connect_conversations_legacy_kind", sql`(${t.kind} = 'direct' AND ${t.legacyThreadId} IS NOT NULL) OR (${t.kind} = 'group' AND ${t.legacyThreadId} IS NULL)`),
  check("connect_conversations_title", sql`char_length(${t.title}) <= 160 AND (${t.kind} <> 'group' OR char_length(btrim(${t.title})) > 0)`),
]);

export const connectParticipants = pgTable("connect_participants", {
  conversationId: uuid("conversation_id").notNull().references(() => connectConversations.id, { onDelete: "restrict" }),
  memberId: integer("member_id").notNull().references(() => members.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("member"),
  status: text("status").notNull().default("invited"),
  invitedBy: integer("invited_by").references(() => members.id, { onDelete: "set null" }),
  invitedAt: timestamp("invited_at", { withTimezone: true }).notNull().defaultNow(),
  joinedAt: timestamp("joined_at", { withTimezone: true }),
  historyFrom: timestamp("history_from", { withTimezone: true }),
  // For new messages use a server-set timestamp + ID cursor, never a client clock.
  lastReadAt: timestamp("last_read_at", { withTimezone: true }),
  lastReadMessageId: uuid("last_read_message_id"),
  muted: boolean("muted").notNull().default(false),
  archived: boolean("archived").notNull().default(false),
  leftAt: timestamp("left_at", { withTimezone: true }),
}, t => [
  primaryKey({ columns: [t.conversationId, t.memberId] }),
  index("connect_participants_inbox").on(t.memberId, t.status, t.archived),
  check("connect_participants_role", sql`${t.role} IN ('owner', 'admin', 'member')`),
  check("connect_participants_status", sql`${t.status} IN ('invited', 'active', 'declined', 'left', 'removed')`),
  check("connect_participants_active", sql`${t.status} <> 'active' OR (${t.joinedAt} IS NOT NULL AND ${t.historyFrom} IS NOT NULL AND ${t.leftAt} IS NULL)`),
  foreignKey({
    name: "connect_participants_read_message_scope",
    columns: [t.lastReadMessageId, t.conversationId],
    foreignColumns: [connectMessages.id, connectMessages.conversationId],
  }).onDelete("restrict"),
]);

export const connectMessages = pgTable("connect_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id").notNull().references(() => connectConversations.id, { onDelete: "restrict" }),
  senderId: integer("sender_id").references(() => members.id, { onDelete: "set null" }),
  // A mapped legacy message is read from network_messages, not copied.
  legacyMessageId: integer("legacy_message_id").references(() => networkMessages.id, { onDelete: "restrict" }),
  text: text("text"),
  kind: text("kind").notNull().default("text"),
  replyToId: uuid("reply_to_id").references((): AnyPgColumn => connectMessages.id, { onDelete: "restrict" }),
  clientNonce: uuid("client_nonce").notNull(),
  version: integer("version").notNull().default(1),
  editedAt: timestamp("edited_at", { withTimezone: true }),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, t => [
  uniqueIndex("connect_messages_legacy").on(t.legacyMessageId),
  // A table-level unique constraint is created before dependent foreign keys.
  // drizzle-kit emits unique indexes after foreign keys in a fresh migration.
  unique("connect_messages_identity_scope").on(t.id, t.conversationId),
  uniqueIndex("connect_messages_nonce").on(t.conversationId, t.senderId, t.clientNonce),
  index("connect_messages_page").on(t.conversationId, t.createdAt, t.id),
  check("connect_messages_kind", sql`${t.kind} IN ('text', 'attachment', 'voice')`),
  check("connect_messages_version", sql`${t.version} > 0`),
  check("connect_messages_source", sql`(${t.legacyMessageId} IS NOT NULL AND ${t.text} IS NULL) OR (${t.legacyMessageId} IS NULL AND ${t.text} IS NOT NULL)`),
  check("connect_messages_text", sql`${t.text} IS NULL OR (char_length(${t.text}) <= 3000 AND (${t.kind} <> 'text' OR char_length(btrim(${t.text})) > 0))`),
  check("connect_messages_reply", sql`${t.replyToId} IS NULL OR ${t.replyToId} <> ${t.id}`),
]);

// Never reuse a Feed/News upload ID for a confidential chat attachment.
export const connectAttachments = pgTable("connect_attachments", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id").notNull().references(() => connectConversations.id, { onDelete: "restrict" }),
  messageId: uuid("message_id"),
  ownerId: integer("owner_id").references(() => members.id, { onDelete: "set null" }),
  objectPath: text("object_path").notNull(),
  filename: text("filename").notNull(),
  contentType: text("content_type").notNull(),
  size: integer("size").notNull(),
  status: text("status").notNull().default("pending"),
  scanStatus: text("scan_status").notNull().default("not_supported"),
  durationMs: integer("duration_ms"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
}, t => [
  uniqueIndex("connect_attachments_object").on(t.objectPath),
  index("connect_attachments_message").on(t.messageId),
  index("connect_attachments_owner_date").on(t.ownerId, t.createdAt),
  index("connect_attachments_expiry").on(t.status, t.expiresAt),
  check("connect_attachments_status", sql`${t.status} IN ('pending', 'uploaded', 'ready', 'rejected')`),
  check("connect_attachments_scan", sql`${t.scanStatus} IN ('not_supported', 'pending', 'clean', 'infected', 'failed')`),
  check("connect_attachments_size", sql`${t.size} > 0 AND ${t.size} <= CASE WHEN ${t.contentType} LIKE 'video/%' THEN 524288000 ELSE 20971520 END`),
  check("connect_attachments_duration", sql`${t.durationMs} IS NULL OR ${t.durationMs} > 0`),
  check("connect_attachments_bound", sql`${t.messageId} IS NULL OR ${t.status} = 'ready'`),
  check("connect_attachments_scan_ready", sql`${t.status} <> 'ready' OR ${t.scanStatus} IN ('not_supported', 'clean')`),
  foreignKey({
    name: "connect_attachments_message_scope",
    columns: [t.messageId, t.conversationId],
    foreignColumns: [connectMessages.id, connectMessages.conversationId],
  }).onDelete("restrict"),
]);

export const connectReactions = pgTable("connect_reactions", {
  messageId: uuid("message_id").notNull().references(() => connectMessages.id, { onDelete: "cascade" }),
  memberId: integer("member_id").notNull().references(() => members.id, { onDelete: "cascade" }),
  emoji: text("emoji").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, t => [
  primaryKey({ columns: [t.messageId, t.memberId, t.emoji] }),
  check("connect_reactions_emoji", sql`char_length(${t.emoji}) BETWEEN 1 AND 32`),
]);

export const connectPins = pgTable("connect_pins", {
  messageId: uuid("message_id").primaryKey().references(() => connectMessages.id, { onDelete: "cascade" }),
  pinnedBy: integer("pinned_by").references(() => members.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Payload-free events for differential refresh and private unread indicators.
export const connectEvents = pgTable("connect_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id").notNull().references(() => connectConversations.id, { onDelete: "restrict" }),
  kind: text("kind").notNull(),
  subjectMemberId: integer("subject_member_id").references(() => members.id, { onDelete: "set null" }),
  messageId: uuid("message_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, t => [
  index("connect_events_cursor").on(t.conversationId, t.createdAt, t.id),
  check("connect_events_kind", sql`${t.kind} IN ('message', 'edit', 'delete', 'reaction', 'pin', 'invitation', 'membership', 'read')`),
  foreignKey({
    name: "connect_events_message_scope",
    columns: [t.messageId, t.conversationId],
    foreignColumns: [connectMessages.id, connectMessages.conversationId],
  }).onDelete("restrict"),
]);

// TTL-based transient state, never a permanent last-seen activity history.
export const connectSignals = pgTable("connect_signals", {
  conversationId: uuid("conversation_id").notNull().references(() => connectConversations.id, { onDelete: "cascade" }),
  memberId: integer("member_id").notNull().references(() => members.id, { onDelete: "cascade" }),
  typingUntil: timestamp("typing_until", { withTimezone: true }),
  onlineUntil: timestamp("online_until", { withTimezone: true }),
}, t => [primaryKey({ columns: [t.conversationId, t.memberId] })]);

export const insertConnectPreferenceSchema = createInsertSchema(connectPreferences).omit({ updatedAt: true });
export const insertConnectConversationSchema = createInsertSchema(connectConversations).omit({ id: true, createdAt: true, updatedAt: true });
export const insertConnectParticipantSchema = createInsertSchema(connectParticipants);
export const insertConnectMessageSchema = createInsertSchema(connectMessages).omit({ id: true, createdAt: true });
export const insertConnectAttachmentSchema = createInsertSchema(connectAttachments).omit({ id: true, createdAt: true });
export const insertConnectReactionSchema = createInsertSchema(connectReactions).omit({ createdAt: true });
export const insertConnectPinSchema = createInsertSchema(connectPins).omit({ createdAt: true });
export const insertConnectEventSchema = createInsertSchema(connectEvents).omit({ id: true, createdAt: true });
export const insertConnectSignalSchema = createInsertSchema(connectSignals);
export type InsertConnectMessage = z.infer<typeof insertConnectMessageSchema>;
export type ConnectMessage = typeof connectMessages.$inferSelect;
