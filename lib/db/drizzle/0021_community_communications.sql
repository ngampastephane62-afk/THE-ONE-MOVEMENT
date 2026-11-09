CREATE TABLE "community_communication_preferences" (
	"clerk_id" text PRIMARY KEY NOT NULL,
	"frequency" text DEFAULT 'in_app' NOT NULL,
	"welcome_allowed" boolean DEFAULT false NOT NULL,
	"consented_at" timestamp with time zone,
	"consent_version" text,
	"suppressed_at" timestamp with time zone,
	"suppression_reason" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "community_preferences_frequency" CHECK ("community_communication_preferences"."frequency" IN ('daily', 'weekly', 'in_app', 'off')),
	CONSTRAINT "community_preferences_email_consent" CHECK (("community_communication_preferences"."frequency" NOT IN ('daily', 'weekly') AND NOT "community_communication_preferences"."welcome_allowed") OR ("community_communication_preferences"."consented_at" IS NOT NULL AND "community_communication_preferences"."consent_version" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "community_activity_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_key" text NOT NULL,
	"kind" text NOT NULL,
	"subject_clerk_id" text NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "community_email_settings" (
	"id" integer PRIMARY KEY NOT NULL,
	"paused" boolean DEFAULT true NOT NULL,
	"timezone" text NOT NULL,
	"send_hour" integer NOT NULL,
	"weekly_day" integer NOT NULL,
	"introduction" text DEFAULT '' NOT NULL,
	"first_approved_at" timestamp with time zone,
	"approved_by_clerk_id" text,
	"baseline_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "community_email_settings_singleton" CHECK ("community_email_settings"."id" = 1),
	CONSTRAINT "community_email_settings_hour" CHECK ("community_email_settings"."send_hour" BETWEEN 0 AND 23),
	CONSTRAINT "community_email_settings_day" CHECK ("community_email_settings"."weekly_day" BETWEEN 0 AND 6),
	CONSTRAINT "community_email_settings_approval" CHECK ("community_email_settings"."paused" OR ("community_email_settings"."first_approved_at" IS NOT NULL AND "community_email_settings"."approved_by_clerk_id" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "community_email_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" text NOT NULL,
	"period_key" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"period_start" timestamp with time zone NOT NULL,
	"period_end" timestamp with time zone NOT NULL,
	"featured_article_ids" integer[] DEFAULT '{}' NOT NULL,
	"approved_content_hash" text,
	"approved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "community_email_runs_kind" CHECK ("community_email_runs"."kind" IN ('daily', 'weekly')),
	CONSTRAINT "community_email_runs_status" CHECK ("community_email_runs"."status" IN ('draft', 'approved', 'running', 'completed', 'paused')),
	CONSTRAINT "community_email_runs_range" CHECK ("community_email_runs"."period_end" > "community_email_runs"."period_start"),
	CONSTRAINT "community_email_runs_approval" CHECK ("community_email_runs"."status" NOT IN ('approved', 'running', 'completed') OR ("community_email_runs"."approved_content_hash" IS NOT NULL AND "community_email_runs"."approved_at" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "community_email_deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"run_id" uuid,
	"clerk_id" text NOT NULL,
	"kind" text NOT NULL,
	"dedupe_key" text NOT NULL,
	"idempotency_key" text NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"provider_id" text,
	"attempts" integer DEFAULT 0 NOT NULL,
	"claim_expires_at" timestamp with time zone,
	"next_attempt_at" timestamp with time zone,
	"last_error_code" text,
	"provider_event_at" timestamp with time zone,
	"provider_event_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "community_email_deliveries_kind" CHECK ("community_email_deliveries"."kind" IN ('welcome', 'daily', 'weekly')),
	CONSTRAINT "community_email_deliveries_status" CHECK ("community_email_deliveries"."status" IN ('queued', 'claimed', 'accepted', 'delivered', 'bounced', 'complained', 'suppressed', 'failed', 'unknown')),
	CONSTRAINT "community_email_deliveries_attempts" CHECK ("community_email_deliveries"."attempts" >= 0),
	CONSTRAINT "community_email_deliveries_run" CHECK (("community_email_deliveries"."kind" = 'welcome' AND "community_email_deliveries"."run_id" IS NULL) OR ("community_email_deliveries"."kind" IN ('daily', 'weekly') AND "community_email_deliveries"."run_id" IS NOT NULL))
);
--> statement-breakpoint
ALTER TABLE "community_email_deliveries" ADD CONSTRAINT "community_email_deliveries_run_id_community_email_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."community_email_runs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "community_activity_event_key" ON "community_activity_events" USING btree ("event_key");--> statement-breakpoint
CREATE UNIQUE INDEX "community_email_runs_period" ON "community_email_runs" USING btree ("kind","period_key");--> statement-breakpoint
CREATE UNIQUE INDEX "community_email_deliveries_dedupe" ON "community_email_deliveries" USING btree ("dedupe_key");--> statement-breakpoint
CREATE UNIQUE INDEX "community_email_deliveries_idempotency" ON "community_email_deliveries" USING btree ("idempotency_key");--> statement-breakpoint
CREATE UNIQUE INDEX "community_email_deliveries_provider" ON "community_email_deliveries" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "community_email_deliveries_work" ON "community_email_deliveries" USING btree ("status","next_attempt_at");--> statement-breakpoint
CREATE INDEX "community_email_deliveries_member_date" ON "community_email_deliveries" USING btree ("clerk_id","created_at");