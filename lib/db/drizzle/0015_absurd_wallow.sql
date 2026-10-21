CREATE TABLE "gratitude_campaigns" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"parent_id" integer,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"identity" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_by" integer NOT NULL,
	"updated_by" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gratitude_campaigns_slug_unique" UNIQUE("slug"),
	CONSTRAINT "gratitude_campaigns_slug" CHECK ("gratitude_campaigns"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	CONSTRAINT "gratitude_campaigns_name" CHECK (char_length("gratitude_campaigns"."name") BETWEEN 1 AND 120),
	CONSTRAINT "gratitude_campaigns_description" CHECK (char_length("gratitude_campaigns"."description") <= 4000),
	CONSTRAINT "gratitude_campaigns_status" CHECK ("gratitude_campaigns"."status" IN ('draft', 'active', 'paused', 'archived')),
	CONSTRAINT "gratitude_campaigns_identity" CHECK (jsonb_typeof("gratitude_campaigns"."identity") = 'object'),
	CONSTRAINT "gratitude_campaigns_parent" CHECK ("gratitude_campaigns"."parent_id" IS NULL OR "gratitude_campaigns"."parent_id" <> "gratitude_campaigns"."id")
);
--> statement-breakpoint
CREATE TABLE "gratitude_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"contribution_id" integer NOT NULL,
	"author_id" integer NOT NULL,
	"body" text NOT NULL,
	"hidden" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gratitude_comments_body" CHECK (char_length(btrim("gratitude_comments"."body")) BETWEEN 1 AND 2000)
);
--> statement-breakpoint
CREATE TABLE "gratitude_contributions" (
	"id" serial PRIMARY KEY NOT NULL,
	"author_id" integer NOT NULL,
	"campaign_id" integer NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"country_code" text,
	"theme" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"approved_version" integer,
	"public_consent_at" timestamp with time zone,
	"consent_version" text,
	"rights_confirmed_at" timestamp with time zone,
	"featured" boolean DEFAULT false NOT NULL,
	"decision_reason" text DEFAULT '' NOT NULL,
	"reviewed_by" integer,
	"reviewed_at" timestamp with time zone,
	"submitted_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gratitude_contributions_title" CHECK (char_length("gratitude_contributions"."title") <= 160),
	CONSTRAINT "gratitude_contributions_body" CHECK (char_length("gratitude_contributions"."body") <= 5000),
	CONSTRAINT "gratitude_contributions_country" CHECK ("gratitude_contributions"."country_code" IS NULL OR "gratitude_contributions"."country_code" ~ '^[A-Z]{2}$'),
	CONSTRAINT "gratitude_contributions_theme" CHECK ("gratitude_contributions"."theme" IS NULL OR "gratitude_contributions"."theme" IN ('country', 'community', 'culture', 'inspiration', 'peace-unity', 'positive-leadership', 'humanitarian-action', 'journey')),
	CONSTRAINT "gratitude_contributions_status" CHECK ("gratitude_contributions"."status" IN ('draft', 'pending_review', 'published', 'rejected', 'hidden', 'archived')),
	CONSTRAINT "gratitude_contributions_version" CHECK ("gratitude_contributions"."version" > 0),
	CONSTRAINT "gratitude_contributions_approved_version" CHECK ("gratitude_contributions"."approved_version" IS NULL OR ("gratitude_contributions"."approved_version" > 0 AND "gratitude_contributions"."approved_version" <= "gratitude_contributions"."version")),
	CONSTRAINT "gratitude_contributions_consent_version" CHECK ("gratitude_contributions"."consent_version" IS NULL OR char_length("gratitude_contributions"."consent_version") <= 80),
	CONSTRAINT "gratitude_contributions_reason" CHECK (char_length("gratitude_contributions"."decision_reason") <= 2000),
	CONSTRAINT "gratitude_contributions_publication" CHECK ("gratitude_contributions"."status" <> 'published' OR (
    "gratitude_contributions"."approved_version" IS NOT NULL AND "gratitude_contributions"."approved_version" = "gratitude_contributions"."version"
    AND "gratitude_contributions"."public_consent_at" IS NOT NULL AND "gratitude_contributions"."rights_confirmed_at" IS NOT NULL
    AND "gratitude_contributions"."reviewed_at" IS NOT NULL AND char_length(btrim("gratitude_contributions"."title")) > 0
    AND "gratitude_contributions"."country_code" IS NOT NULL AND "gratitude_contributions"."theme" IS NOT NULL
  )),
	CONSTRAINT "gratitude_contributions_featured" CHECK (NOT "gratitude_contributions"."featured" OR "gratitude_contributions"."status" = 'published')
);
--> statement-breakpoint
CREATE TABLE "gratitude_engagement" (
	"id" serial PRIMARY KEY NOT NULL,
	"contribution_id" integer NOT NULL,
	"member_id" integer NOT NULL,
	"kind" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gratitude_engagement_member_kind" UNIQUE("contribution_id","member_id","kind"),
	CONSTRAINT "gratitude_engagement_kind" CHECK ("gratitude_engagement"."kind" IN ('view', 'like', 'share_intent'))
);
--> statement-breakpoint
CREATE TABLE "gratitude_media" (
	"id" serial PRIMARY KEY NOT NULL,
	"contribution_id" integer NOT NULL,
	"original_upload_id" text NOT NULL,
	"playback_upload_id" text,
	"thumbnail_upload_id" text,
	"kind" text NOT NULL,
	"processing_status" text DEFAULT 'pending' NOT NULL,
	"duration_ms" integer,
	"width" integer,
	"height" integer,
	"position" integer DEFAULT 0 NOT NULL,
	"alt_text" text DEFAULT '' NOT NULL,
	"captions_upload_id" text,
	"failure_code" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gratitude_media_original_upload_id_unique" UNIQUE("original_upload_id"),
	CONSTRAINT "gratitude_media_playback_upload_id_unique" UNIQUE("playback_upload_id"),
	CONSTRAINT "gratitude_media_contribution_position" UNIQUE("contribution_id","position"),
	CONSTRAINT "gratitude_media_kind" CHECK ("gratitude_media"."kind" IN ('image', 'video')),
	CONSTRAINT "gratitude_media_processing" CHECK ("gratitude_media"."processing_status" IN ('pending', 'processing', 'ready', 'failed')),
	CONSTRAINT "gratitude_media_duration" CHECK ("gratitude_media"."duration_ms" IS NULL OR ("gratitude_media"."duration_ms" > 0 AND "gratitude_media"."duration_ms" <= 180000)),
	CONSTRAINT "gratitude_media_width" CHECK ("gratitude_media"."width" IS NULL OR "gratitude_media"."width" > 0),
	CONSTRAINT "gratitude_media_height" CHECK ("gratitude_media"."height" IS NULL OR "gratitude_media"."height" > 0),
	CONSTRAINT "gratitude_media_position" CHECK ("gratitude_media"."position" >= 0),
	CONSTRAINT "gratitude_media_alt" CHECK (char_length("gratitude_media"."alt_text") <= 500),
	CONSTRAINT "gratitude_media_failure" CHECK ("gratitude_media"."failure_code" IS NULL OR char_length("gratitude_media"."failure_code") <= 80),
	CONSTRAINT "gratitude_media_ready_video" CHECK ("gratitude_media"."kind" <> 'video' OR "gratitude_media"."processing_status" <> 'ready' OR (
    "gratitude_media"."duration_ms" IS NOT NULL AND "gratitude_media"."playback_upload_id" IS NOT NULL
  ))
);
--> statement-breakpoint
CREATE TABLE "gratitude_rate_windows" (
	"member_id" integer NOT NULL,
	"action" text NOT NULL,
	"window_start" timestamp with time zone NOT NULL,
	"count" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "gratitude_rate_windows_member_id_action_window_start_pk" PRIMARY KEY("member_id","action","window_start"),
	CONSTRAINT "gratitude_rate_windows_action" CHECK ("gratitude_rate_windows"."action" IN ('submit', 'upload', 'comment', 'like', 'view', 'share_intent')),
	CONSTRAINT "gratitude_rate_windows_count" CHECK ("gratitude_rate_windows"."count" > 0)
);
--> statement-breakpoint
CREATE TABLE "gratitude_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"contribution_id" integer NOT NULL,
	"comment_id" integer,
	"reporter_id" integer NOT NULL,
	"reason" text NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"resolved_by" integer,
	"resolution_reason" text DEFAULT '' NOT NULL,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gratitude_reports_reason" CHECK (char_length(btrim("gratitude_reports"."reason")) BETWEEN 3 AND 2000),
	CONSTRAINT "gratitude_reports_status" CHECK ("gratitude_reports"."status" IN ('open', 'resolved', 'dismissed')),
	CONSTRAINT "gratitude_reports_resolution_reason" CHECK (char_length("gratitude_reports"."resolution_reason") <= 2000)
);
--> statement-breakpoint
ALTER TABLE "gratitude_campaigns" ADD CONSTRAINT "gratitude_campaigns_parent_id_gratitude_campaigns_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."gratitude_campaigns"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gratitude_campaigns" ADD CONSTRAINT "gratitude_campaigns_created_by_ecosystem_members_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."ecosystem_members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gratitude_campaigns" ADD CONSTRAINT "gratitude_campaigns_updated_by_ecosystem_members_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."ecosystem_members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gratitude_comments" ADD CONSTRAINT "gratitude_comments_contribution_id_gratitude_contributions_id_fk" FOREIGN KEY ("contribution_id") REFERENCES "public"."gratitude_contributions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gratitude_comments" ADD CONSTRAINT "gratitude_comments_author_id_ecosystem_members_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gratitude_contributions" ADD CONSTRAINT "gratitude_contributions_author_id_ecosystem_members_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gratitude_contributions" ADD CONSTRAINT "gratitude_contributions_campaign_id_gratitude_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."gratitude_campaigns"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gratitude_contributions" ADD CONSTRAINT "gratitude_contributions_reviewed_by_ecosystem_members_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."ecosystem_members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gratitude_engagement" ADD CONSTRAINT "gratitude_engagement_contribution_id_gratitude_contributions_id_fk" FOREIGN KEY ("contribution_id") REFERENCES "public"."gratitude_contributions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gratitude_engagement" ADD CONSTRAINT "gratitude_engagement_member_id_ecosystem_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gratitude_media" ADD CONSTRAINT "gratitude_media_contribution_id_gratitude_contributions_id_fk" FOREIGN KEY ("contribution_id") REFERENCES "public"."gratitude_contributions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gratitude_media" ADD CONSTRAINT "gratitude_media_original_upload_id_network_uploads_id_fk" FOREIGN KEY ("original_upload_id") REFERENCES "public"."network_uploads"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gratitude_media" ADD CONSTRAINT "gratitude_media_playback_upload_id_network_uploads_id_fk" FOREIGN KEY ("playback_upload_id") REFERENCES "public"."network_uploads"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gratitude_media" ADD CONSTRAINT "gratitude_media_thumbnail_upload_id_network_uploads_id_fk" FOREIGN KEY ("thumbnail_upload_id") REFERENCES "public"."network_uploads"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gratitude_media" ADD CONSTRAINT "gratitude_media_captions_upload_id_network_uploads_id_fk" FOREIGN KEY ("captions_upload_id") REFERENCES "public"."network_uploads"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gratitude_rate_windows" ADD CONSTRAINT "gratitude_rate_windows_member_id_ecosystem_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gratitude_reports" ADD CONSTRAINT "gratitude_reports_contribution_id_gratitude_contributions_id_fk" FOREIGN KEY ("contribution_id") REFERENCES "public"."gratitude_contributions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gratitude_reports" ADD CONSTRAINT "gratitude_reports_comment_id_gratitude_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."gratitude_comments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gratitude_reports" ADD CONSTRAINT "gratitude_reports_reporter_id_ecosystem_members_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gratitude_reports" ADD CONSTRAINT "gratitude_reports_resolved_by_ecosystem_members_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."ecosystem_members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "gratitude_campaigns_parent_status_idx" ON "gratitude_campaigns" USING btree ("parent_id","status");--> statement-breakpoint
CREATE INDEX "gratitude_comments_feed_idx" ON "gratitude_comments" USING btree ("contribution_id","hidden","created_at","id");--> statement-breakpoint
CREATE INDEX "gratitude_contributions_feed_idx" ON "gratitude_contributions" USING btree ("campaign_id","status","published_at" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "gratitude_contributions_country_idx" ON "gratitude_contributions" USING btree ("country_code","status","published_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "gratitude_contributions_author_idx" ON "gratitude_contributions" USING btree ("author_id","updated_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "gratitude_contributions_review_idx" ON "gratitude_contributions" USING btree ("status","submitted_at");--> statement-breakpoint
CREATE INDEX "gratitude_engagement_counts_idx" ON "gratitude_engagement" USING btree ("contribution_id","kind");--> statement-breakpoint
CREATE INDEX "gratitude_media_processing_idx" ON "gratitude_media" USING btree ("processing_status","updated_at");--> statement-breakpoint
CREATE INDEX "gratitude_rate_windows_cleanup_idx" ON "gratitude_rate_windows" USING btree ("window_start");--> statement-breakpoint
CREATE INDEX "gratitude_reports_queue_idx" ON "gratitude_reports" USING btree ("status","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "gratitude_reports_open_story_unique" ON "gratitude_reports" USING btree ("contribution_id","reporter_id") WHERE "gratitude_reports"."status" = 'open' AND "gratitude_reports"."comment_id" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "gratitude_reports_open_comment_unique" ON "gratitude_reports" USING btree ("comment_id","reporter_id") WHERE "gratitude_reports"."status" = 'open' AND "gratitude_reports"."comment_id" IS NOT NULL;