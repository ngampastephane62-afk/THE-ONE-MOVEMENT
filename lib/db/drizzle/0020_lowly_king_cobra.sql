CREATE TABLE "founder_account_observations" (
	"clerk_id" text PRIMARY KEY NOT NULL,
	"verified" boolean NOT NULL,
	"complete" boolean NOT NULL,
	"observed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "founder_control_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"enabled_kinds" text[] DEFAULT '{}' NOT NULL,
	"read_through" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "founder_notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_key" text NOT NULL,
	"kind" text NOT NULL,
	"target_clerk_id" text,
	"title" text NOT NULL,
	"detail" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "founder_service_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"request_id" text NOT NULL,
	"recipient_clerk_id" text NOT NULL,
	"sender_clerk_id" text NOT NULL,
	"from_administration" boolean NOT NULL,
	"text" text NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "founder_notifications_event_key" ON "founder_notifications" USING btree ("event_key");--> statement-breakpoint
CREATE INDEX "founder_notifications_date" ON "founder_notifications" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "founder_service_messages_request" ON "founder_service_messages" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX "founder_service_messages_recipient" ON "founder_service_messages" USING btree ("recipient_clerk_id","id");