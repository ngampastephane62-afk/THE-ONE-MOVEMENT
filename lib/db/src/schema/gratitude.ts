import { sql } from "drizzle-orm";
import {
  boolean, check, index, integer, jsonb, pgTable, primaryKey, serial,
  text, timestamp, unique, uniqueIndex, type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { ecosystemMembersTable as members } from "./ecosystemMembers";
import { networkUploads } from "./network";

// Schema preparation only. These tables must not be used before an explicitly
// approved migration and the campaign's authorization/media services are ready.
export const gratitudeCampaigns = pgTable("gratitude_campaigns", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  parentId: integer("parent_id").references((): AnyPgColumn => gratitudeCampaigns.id, { onDelete: "restrict" }),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  status: text("status").notNull().default("draft"),
  identity: jsonb("identity").$type<Record<string, unknown>>().notNull().default({}),
  createdBy: integer("created_by").notNull().references(() => members.id, { onDelete: "restrict" }),
  updatedBy: integer("updated_by").notNull().references(() => members.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, t => [
  check("gratitude_campaigns_slug", sql`${t.slug} ~ '^[a-z0-9]+(-[a-z0-9]+)*$'`),
  check("gratitude_campaigns_name", sql`char_length(${t.name}) BETWEEN 1 AND 120`),
  check("gratitude_campaigns_description", sql`char_length(${t.description}) <= 4000`),
  check("gratitude_campaigns_status", sql`${t.status} IN ('draft', 'active', 'paused', 'archived')`),
  check("gratitude_campaigns_identity", sql`jsonb_typeof(${t.identity}) = 'object'`),
  check("gratitude_campaigns_parent", sql`${t.parentId} IS NULL OR ${t.parentId} <> ${t.id}`),
  index("gratitude_campaigns_parent_status_idx").on(t.parentId, t.status),
]);

export const gratitudeContributions = pgTable("gratitude_contributions", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").notNull().references(() => members.id, { onDelete: "cascade" }),
  campaignId: integer("campaign_id").notNull().references(() => gratitudeCampaigns.id, { onDelete: "restrict" }),
  title: text("title").notNull().default(""),
  body: text("body").notNull().default(""),
  countryCode: text("country_code"),
  theme: text("theme"),
  status: text("status").notNull().default("draft"),
  version: integer("version").notNull().default(1),
  approvedVersion: integer("approved_version"),
  publicConsentAt: timestamp("public_consent_at", { withTimezone: true }),
  consentVersion: text("consent_version"),
  rightsConfirmedAt: timestamp("rights_confirmed_at", { withTimezone: true }),
  featured: boolean("featured").notNull().default(false),
  decisionReason: text("decision_reason").notNull().default(""),
  reviewedBy: integer("reviewed_by").references(() => members.id, { onDelete: "set null" }),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, t => [
  check("gratitude_contributions_title", sql`char_length(${t.title}) <= 160`),
  check("gratitude_contributions_body", sql`char_length(${t.body}) <= 5000`),
  check("gratitude_contributions_country", sql`${t.countryCode} IS NULL OR ${t.countryCode} ~ '^[A-Z]{2}$'`),
  check("gratitude_contributions_theme", sql`${t.theme} IS NULL OR ${t.theme} IN ('country', 'community', 'culture', 'inspiration', 'peace-unity', 'positive-leadership', 'humanitarian-action', 'journey')`),
  check("gratitude_contributions_status", sql`${t.status} IN ('draft', 'pending_review', 'published', 'rejected', 'hidden', 'archived')`),
  check("gratitude_contributions_version", sql`${t.version} > 0`),
  check("gratitude_contributions_approved_version", sql`${t.approvedVersion} IS NULL OR (${t.approvedVersion} > 0 AND ${t.approvedVersion} <= ${t.version})`),
  check("gratitude_contributions_consent_version", sql`${t.consentVersion} IS NULL OR char_length(${t.consentVersion}) <= 80`),
  check("gratitude_contributions_reason", sql`char_length(${t.decisionReason}) <= 2000`),
  check("gratitude_contributions_publication", sql`${t.status} <> 'published' OR (
    ${t.approvedVersion} IS NOT NULL AND ${t.approvedVersion} = ${t.version}
    AND ${t.publicConsentAt} IS NOT NULL AND ${t.rightsConfirmedAt} IS NOT NULL
    AND ${t.reviewedAt} IS NOT NULL AND char_length(btrim(${t.title})) > 0
    AND ${t.countryCode} IS NOT NULL AND ${t.theme} IS NOT NULL
  )`),
  check("gratitude_contributions_featured", sql`NOT ${t.featured} OR ${t.status} = 'published'`),
  index("gratitude_contributions_feed_idx").on(t.campaignId, t.status, t.publishedAt.desc(), t.id.desc()),
  index("gratitude_contributions_country_idx").on(t.countryCode, t.status, t.publishedAt.desc()),
  index("gratitude_contributions_author_idx").on(t.authorId, t.updatedAt.desc()),
  index("gratitude_contributions_review_idx").on(t.status, t.submittedAt),
]);

export const gratitudeMedia = pgTable("gratitude_media", {
  id: serial("id").primaryKey(),
  contributionId: integer("contribution_id").notNull().references(() => gratitudeContributions.id, { onDelete: "cascade" }),
  originalUploadId: text("original_upload_id").notNull().unique().references(() => networkUploads.id, { onDelete: "restrict" }),
  playbackUploadId: text("playback_upload_id").unique().references(() => networkUploads.id, { onDelete: "restrict" }),
  thumbnailUploadId: text("thumbnail_upload_id").references(() => networkUploads.id, { onDelete: "restrict" }),
  kind: text("kind").notNull(),
  processingStatus: text("processing_status").notNull().default("pending"),
  durationMs: integer("duration_ms"),
  width: integer("width"),
  height: integer("height"),
  position: integer("position").notNull().default(0),
  altText: text("alt_text").notNull().default(""),
  captionsUploadId: text("captions_upload_id").references(() => networkUploads.id, { onDelete: "restrict" }),
  failureCode: text("failure_code"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, t => [
  check("gratitude_media_kind", sql`${t.kind} IN ('image', 'video')`),
  check("gratitude_media_processing", sql`${t.processingStatus} IN ('pending', 'processing', 'ready', 'failed')`),
  check("gratitude_media_duration", sql`${t.durationMs} IS NULL OR (${t.durationMs} > 0 AND ${t.durationMs} <= 180000)`),
  check("gratitude_media_width", sql`${t.width} IS NULL OR ${t.width} > 0`),
  check("gratitude_media_height", sql`${t.height} IS NULL OR ${t.height} > 0`),
  check("gratitude_media_position", sql`${t.position} >= 0`),
  check("gratitude_media_alt", sql`char_length(${t.altText}) <= 500`),
  check("gratitude_media_failure", sql`${t.failureCode} IS NULL OR char_length(${t.failureCode}) <= 80`),
  check("gratitude_media_ready_video", sql`${t.kind} <> 'video' OR ${t.processingStatus} <> 'ready' OR (
    ${t.durationMs} IS NOT NULL AND ${t.playbackUploadId} IS NOT NULL
  )`),
  unique("gratitude_media_contribution_position").on(t.contributionId, t.position),
  index("gratitude_media_processing_idx").on(t.processingStatus, t.updatedAt),
]);

export const gratitudeEngagement = pgTable("gratitude_engagement", {
  id: serial("id").primaryKey(),
  contributionId: integer("contribution_id").notNull().references(() => gratitudeContributions.id, { onDelete: "cascade" }),
  memberId: integer("member_id").notNull().references(() => members.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, t => [
  check("gratitude_engagement_kind", sql`${t.kind} IN ('view', 'like', 'share_intent')`),
  unique("gratitude_engagement_member_kind").on(t.contributionId, t.memberId, t.kind),
  index("gratitude_engagement_counts_idx").on(t.contributionId, t.kind),
]);

export const gratitudeComments = pgTable("gratitude_comments", {
  id: serial("id").primaryKey(),
  contributionId: integer("contribution_id").notNull().references(() => gratitudeContributions.id, { onDelete: "cascade" }),
  authorId: integer("author_id").notNull().references(() => members.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  hidden: boolean("hidden").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, t => [
  check("gratitude_comments_body", sql`char_length(btrim(${t.body})) BETWEEN 1 AND 2000`),
  index("gratitude_comments_feed_idx").on(t.contributionId, t.hidden, t.createdAt, t.id),
]);

export const gratitudeReports = pgTable("gratitude_reports", {
  id: serial("id").primaryKey(),
  contributionId: integer("contribution_id").notNull().references(() => gratitudeContributions.id, { onDelete: "cascade" }),
  commentId: integer("comment_id").references(() => gratitudeComments.id, { onDelete: "set null" }),
  reporterId: integer("reporter_id").notNull().references(() => members.id, { onDelete: "cascade" }),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("open"),
  resolvedBy: integer("resolved_by").references(() => members.id, { onDelete: "set null" }),
  resolutionReason: text("resolution_reason").notNull().default(""),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, t => [
  check("gratitude_reports_reason", sql`char_length(btrim(${t.reason})) BETWEEN 3 AND 2000`),
  check("gratitude_reports_status", sql`${t.status} IN ('open', 'resolved', 'dismissed')`),
  check("gratitude_reports_resolution_reason", sql`char_length(${t.resolutionReason}) <= 2000`),
  index("gratitude_reports_queue_idx").on(t.status, t.createdAt),
  uniqueIndex("gratitude_reports_open_story_unique").on(t.contributionId, t.reporterId)
    .where(sql`${t.status} = 'open' AND ${t.commentId} IS NULL`),
  uniqueIndex("gratitude_reports_open_comment_unique").on(t.commentId, t.reporterId)
    .where(sql`${t.status} = 'open' AND ${t.commentId} IS NOT NULL`),
]);

export const gratitudeRateWindows = pgTable("gratitude_rate_windows", {
  memberId: integer("member_id").notNull().references(() => members.id, { onDelete: "cascade" }),
  action: text("action").notNull(),
  windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
  count: integer("count").notNull().default(1),
}, t => [
  primaryKey({ columns: [t.memberId, t.action, t.windowStart] }),
  check("gratitude_rate_windows_action", sql`${t.action} IN ('submit', 'upload', 'comment', 'like', 'view', 'share_intent')`),
  check("gratitude_rate_windows_count", sql`${t.count} > 0`),
  index("gratitude_rate_windows_cleanup_idx").on(t.windowStart),
]);
