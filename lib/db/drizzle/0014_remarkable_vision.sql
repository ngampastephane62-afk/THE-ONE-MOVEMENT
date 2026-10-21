CREATE TABLE "news_article_revisions" (
	"id" serial PRIMARY KEY NOT NULL,
	"article_id" integer NOT NULL,
	"revision_no" integer NOT NULL,
	"snapshot" jsonb NOT NULL,
	"created_by_member_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "news_article_revisions_article_number" UNIQUE("article_id","revision_no"),
	CONSTRAINT "news_article_revisions_article_id" UNIQUE("article_id","id"),
	CONSTRAINT "news_article_revisions_revision_no" CHECK ("news_article_revisions"."revision_no" > 0),
	CONSTRAINT "news_article_revisions_snapshot_object" CHECK (jsonb_typeof("news_article_revisions"."snapshot") = 'object'),
	CONSTRAINT "news_article_revisions_snapshot_version" CHECK (("news_article_revisions"."snapshot" -> 'schemaVersion') IS NOT DISTINCT FROM '1'::jsonb)
);
--> statement-breakpoint
CREATE TABLE "news_articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(160) NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"version" integer DEFAULT 0 NOT NULL,
	"draft_revision_id" integer,
	"published_revision_id" integer,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "news_articles_slug_unique" UNIQUE("slug"),
	CONSTRAINT "news_articles_slug_format" CHECK ("news_articles"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	CONSTRAINT "news_articles_status" CHECK ("news_articles"."status" IN ('draft', 'published', 'archived')),
	CONSTRAINT "news_articles_version" CHECK ("news_articles"."version" >= 0),
	CONSTRAINT "news_articles_publication_reference" CHECK ("news_articles"."status" <> 'published' OR ("news_articles"."published_revision_id" IS NOT NULL AND "news_articles"."published_at" IS NOT NULL))
);
--> statement-breakpoint
ALTER TABLE "news_article_revisions" ADD CONSTRAINT "news_article_revisions_article_id_news_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."news_articles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_article_revisions" ADD CONSTRAINT "news_article_revisions_created_by_member_id_ecosystem_members_id_fk" FOREIGN KEY ("created_by_member_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_articles" ADD CONSTRAINT "news_articles_draft_revision_fk" FOREIGN KEY ("id","draft_revision_id") REFERENCES "public"."news_article_revisions"("article_id","id") ON DELETE restrict ON UPDATE no action DEFERRABLE INITIALLY DEFERRED;--> statement-breakpoint
ALTER TABLE "news_articles" ADD CONSTRAINT "news_articles_published_revision_fk" FOREIGN KEY ("id","published_revision_id") REFERENCES "public"."news_article_revisions"("article_id","id") ON DELETE restrict ON UPDATE no action DEFERRABLE INITIALLY DEFERRED;--> statement-breakpoint
CREATE INDEX "news_articles_public_listing_idx" ON "news_articles" USING btree ("published_at" DESC NULLS LAST,"id" DESC NULLS LAST) WHERE "news_articles"."status" = 'published';