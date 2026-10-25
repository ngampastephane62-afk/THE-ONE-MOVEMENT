CREATE TABLE "site_visit_sessions" (
	"day" date NOT NULL,
	"session_hash" varchar(64) NOT NULL,
	"page_views" integer DEFAULT 1 NOT NULL,
	"first_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "site_visit_sessions_day_session_hash_pk" PRIMARY KEY("day","session_hash"),
	CONSTRAINT "site_visit_sessions_hash_check" CHECK ("site_visit_sessions"."session_hash" ~ '^[a-f0-9]{64}$'),
	CONSTRAINT "site_visit_sessions_views_check" CHECK ("site_visit_sessions"."page_views" > 0),
	CONSTRAINT "site_visit_sessions_times_check" CHECK ("site_visit_sessions"."last_seen_at" >= "site_visit_sessions"."first_seen_at")
);
--> statement-breakpoint
CREATE TABLE "member_profile_reminders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" text NOT NULL,
	"requested_by" text NOT NULL,
	"attempt_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"status" text DEFAULT 'sending' NOT NULL,
	"provider_message_id" varchar(255),
	"last_attempt_at" timestamp with time zone DEFAULT now() NOT NULL,
	"accepted_at" timestamp with time zone,
	"opt_out_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "member_profile_reminders_clerk_id_unique" UNIQUE("clerk_id"),
	CONSTRAINT "member_profile_reminders_status_check" CHECK ("member_profile_reminders"."status" IN ('sending', 'accepted', 'failed', 'unknown'))
);
