import { pgTable, serial, text, timestamp, integer, boolean, uniqueIndex, index } from "drizzle-orm/pg-core";
import { ecosystemMembersTable as members } from "./ecosystemMembers";

export const networkProfiles = pgTable("network_profiles", {
  memberId: integer("member_id").primaryKey().references(() => members.id, { onDelete: "cascade" }),
  enabled: boolean("enabled").notNull().default(false),
  founder: boolean("founder").notNull().default(false),
  stripeCustomerId: text("stripe_customer_id"),
  avatarId: text("avatar_id"),
  coverId: text("cover_id"),
  suspended: boolean("suspended").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
export const networkUploads = pgTable("network_uploads", {
  id: text("id").primaryKey(),
  ownerId: integer("owner_id").notNull().references(() => members.id, { onDelete: "cascade" }),
  objectPath: text("object_path").notNull(),
  filename: text("filename").notNull(),
  contentType: text("content_type").notNull(),
  size: integer("size").notNull(),
  ready: boolean("ready").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
export const networkPosts = pgTable("network_posts", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").notNull().references(() => members.id, { onDelete: "cascade" }),
  text: text("text").notNull().default(""),
  kind: text("kind").notNull().default("post"),
  mediaIds: text("media_ids").array().notNull().default([]),
  hidden: boolean("hidden").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, t => [index("network_posts_feed_idx").on(t.id), index("network_posts_author_idx").on(t.authorId)]);
export const networkLikes = pgTable("network_likes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => networkPosts.id, { onDelete: "cascade" }),
  memberId: integer("member_id").notNull().references(() => members.id, { onDelete: "cascade" }),
}, t => [uniqueIndex("network_likes_unique").on(t.postId, t.memberId)]);
export const networkViews = pgTable("network_views", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => networkPosts.id, { onDelete: "cascade" }),
  memberId: integer("member_id").notNull().references(() => members.id, { onDelete: "cascade" }),
}, t => [uniqueIndex("network_views_unique").on(t.postId, t.memberId)]);
export const networkComments = pgTable("network_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => networkPosts.id, { onDelete: "cascade" }),
  authorId: integer("author_id").notNull().references(() => members.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
export const networkFollows = pgTable("network_follows", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").notNull().references(() => members.id, { onDelete: "cascade" }),
  followingId: integer("following_id").notNull().references(() => members.id, { onDelete: "cascade" }),
}, t => [uniqueIndex("network_follow_unique").on(t.followerId, t.followingId)]);
export const networkBlocks = pgTable("network_blocks", {
  id: serial("id").primaryKey(),
  blockerId: integer("blocker_id").notNull().references(() => members.id, { onDelete: "cascade" }),
  blockedId: integer("blocked_id").notNull().references(() => members.id, { onDelete: "cascade" }),
}, t => [uniqueIndex("network_block_unique").on(t.blockerId, t.blockedId)]);
export const networkThreads = pgTable("network_threads", {
  id: serial("id").primaryKey(),
  memberA: integer("member_a").notNull().references(() => members.id, { onDelete: "cascade" }),
  memberB: integer("member_b").notNull().references(() => members.id, { onDelete: "cascade" }),
  requestedBy: integer("requested_by").notNull().references(() => members.id, { onDelete: "cascade" }),
  accepted: boolean("accepted").notNull().default(false),
  declined: boolean("declined").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, t => [uniqueIndex("network_thread_pair").on(t.memberA, t.memberB)]);
export const networkMessages = pgTable("network_messages", {
  id: serial("id").primaryKey(),
  threadId: integer("thread_id").notNull().references(() => networkThreads.id, { onDelete: "cascade" }),
  senderId: integer("sender_id").notNull().references(() => members.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, t => [index("network_messages_thread_idx").on(t.threadId, t.id)]);
export const networkCertifications = pgTable("network_certifications", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull().references(() => members.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  program: text("program").notNull(),
  packageSlug: text("package_slug").notNull().default(""),
  note: text("note").notNull().default(""),
  evidenceIds: text("evidence_ids").array().notNull().default([]),
  status: text("status").notNull().default("pending"),
  decisionNote: text("decision_note").notNull().default(""),
  agreementConfirmed: boolean("agreement_confirmed").notNull().default(false),
  paymentConfirmed: boolean("payment_confirmed").notNull().default(false),
  stripeSessionId: text("stripe_session_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
export const networkReports = pgTable("network_reports", {
  id: serial("id").primaryKey(),
  reporterId: integer("reporter_id").notNull().references(() => members.id, { onDelete: "cascade" }),
  postId: integer("post_id").references(() => networkPosts.id, { onDelete: "set null" }),
  memberId: integer("member_id").references(() => members.id, { onDelete: "set null" }),
  reason: text("reason").notNull(),
  resolved: boolean("resolved").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
export const networkAudit = pgTable("network_audit", {
  id: serial("id").primaryKey(),
  actorId: integer("actor_id").notNull().references(() => members.id),
  action: text("action").notNull(),
  targetId: integer("target_id").notNull(),
  detail: text("detail").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
