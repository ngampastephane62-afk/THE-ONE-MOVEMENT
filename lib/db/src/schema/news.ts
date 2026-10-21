import { sql } from "drizzle-orm";
import { pgTable, serial, integer, varchar, text, timestamp, jsonb, check, unique, index, foreignKey, type AnyPgColumn } from "drizzle-orm/pg-core";
import { ecosystemMembersTable } from "./ecosystemMembers";
import type { NewsArticleSnapshotV1 } from "./news-content";
export type { NewsArticleSnapshotV1, NewsCategory, NewsContentBlock, NewsImageReference, NewsVideoReference } from "./news-content";

// Break circular type inference for the two composite foreign keys.
// Drizzle does not encode FK deferrability; the reviewed SQL migration sets it.
function revisionColumns(): [AnyPgColumn, AnyPgColumn] {
  return [newsArticleRevisions.articleId, newsArticleRevisions.id];
}

export const newsArticles = pgTable("news_articles", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  status: text("status").notNull().default("draft"),
  version: integer("version").notNull().default(0),
  draftRevisionId: integer("draft_revision_id"),
  publishedRevisionId: integer("published_revision_id"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, t => [
  check("news_articles_slug_format", sql`${t.slug} ~ '^[a-z0-9]+(-[a-z0-9]+)*$'`),
  check("news_articles_status", sql`${t.status} IN ('draft', 'published', 'archived')`),
  check("news_articles_version", sql`${t.version} >= 0`),
  check("news_articles_publication_reference", sql`${t.status} <> 'published' OR (${t.publishedRevisionId} IS NOT NULL AND ${t.publishedAt} IS NOT NULL)`),
  foreignKey({ name: "news_articles_draft_revision_fk", columns: [t.id, t.draftRevisionId], foreignColumns: revisionColumns() }).onDelete("restrict"),
  foreignKey({ name: "news_articles_published_revision_fk", columns: [t.id, t.publishedRevisionId], foreignColumns: revisionColumns() }).onDelete("restrict"),
  index("news_articles_public_listing_idx").on(t.publishedAt.desc(), t.id.desc()).where(sql`${t.status} = 'published'`),
]);

export const newsArticleRevisions = pgTable("news_article_revisions", {
  id: serial("id").primaryKey(),
  articleId: integer("article_id").notNull().references((): AnyPgColumn => newsArticles.id, { onDelete: "restrict" }),
  revisionNo: integer("revision_no").notNull(),
  snapshot: jsonb("snapshot").$type<NewsArticleSnapshotV1>().notNull(),
  createdByMemberId: integer("created_by_member_id").references(() => ecosystemMembersTable.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, t => [
  check("news_article_revisions_revision_no", sql`${t.revisionNo} > 0`),
  unique("news_article_revisions_article_number").on(t.articleId, t.revisionNo),
  unique("news_article_revisions_article_id").on(t.articleId, t.id),
  check("news_article_revisions_snapshot_object", sql`jsonb_typeof(${t.snapshot}) = 'object'`),
  check("news_article_revisions_snapshot_version", sql`(${t.snapshot} -> 'schemaVersion') IS NOT DISTINCT FROM '1'::jsonb`),
]);
