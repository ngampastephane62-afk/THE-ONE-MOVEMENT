CREATE TABLE "connect_call_budgets" (
	"month_utc" text PRIMARY KEY NOT NULL,
	"provider_domain_id" text NOT NULL,
	"limit_micro_usd" integer DEFAULT 20000000 NOT NULL,
	"admission_limit_micro_usd" integer DEFAULT 18000000 NOT NULL,
	"reserved_micro_usd" integer DEFAULT 0 NOT NULL,
	"committed_micro_usd" integer DEFAULT 0 NOT NULL,
	"provider_observed_micro_usd" integer,
	"provider_checked_at" timestamp with time zone,
	"paused" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "connect_call_budget_month" CHECK ("connect_call_budgets"."month_utc" ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
	CONSTRAINT "connect_call_budget_domain" CHECK (length(btrim("connect_call_budgets"."provider_domain_id")) > 0),
	CONSTRAINT "connect_call_budget_limits" CHECK ("connect_call_budgets"."limit_micro_usd" BETWEEN 0 AND 20000000 AND "connect_call_budgets"."admission_limit_micro_usd" BETWEEN 0 AND "connect_call_budgets"."limit_micro_usd"),
	CONSTRAINT "connect_call_budget_nonnegative" CHECK ("connect_call_budgets"."reserved_micro_usd" >= 0 AND "connect_call_budgets"."committed_micro_usd" >= 0 AND ("connect_call_budgets"."provider_observed_micro_usd" IS NULL OR "connect_call_budgets"."provider_observed_micro_usd" >= 0)),
	CONSTRAINT "connect_call_budget_reservations" CHECK ("connect_call_budgets"."reserved_micro_usd" + "connect_call_budgets"."committed_micro_usd" <= "connect_call_budgets"."admission_limit_micro_usd")
);
--> statement-breakpoint
CREATE TABLE "connect_call_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"budget_month_utc" text NOT NULL,
	"thread_id" integer NOT NULL,
	"initiator_id" integer NOT NULL,
	"recipient_id" integer NOT NULL,
	"mode" text NOT NULL,
	"status" text DEFAULT 'ringing' NOT NULL,
	"client_request_id" uuid NOT NULL,
	"provider_room_name" text,
	"reserved_micro_usd" integer NOT NULL,
	"reservation_state" text DEFAULT 'reserved' NOT NULL,
	"ring_expires_at" timestamp with time zone NOT NULL,
	"provider_expires_at" timestamp with time zone NOT NULL,
	"answered_at" timestamp with time zone,
	"ended_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "connect_call_members" CHECK ("connect_call_sessions"."initiator_id" <> "connect_call_sessions"."recipient_id"),
	CONSTRAINT "connect_call_mode" CHECK ("connect_call_sessions"."mode" IN ('audio', 'video')),
	CONSTRAINT "connect_call_status" CHECK ("connect_call_sessions"."status" IN ('ringing', 'provisioning', 'active', 'declined', 'missed', 'cancelled', 'ended', 'failed', 'uncertain')),
	CONSTRAINT "connect_call_reservation" CHECK ("connect_call_sessions"."reserved_micro_usd" > 0 AND "connect_call_sessions"."reservation_state" IN ('reserved', 'committed', 'released')),
	CONSTRAINT "connect_call_deadlines" CHECK ("connect_call_sessions"."ring_expires_at" > "connect_call_sessions"."created_at" AND "connect_call_sessions"."provider_expires_at" > "connect_call_sessions"."ring_expires_at" AND "connect_call_sessions"."provider_expires_at" <= "connect_call_sessions"."created_at" + interval '15 minutes')
);
--> statement-breakpoint
ALTER TABLE "connect_call_sessions" ADD CONSTRAINT "connect_call_sessions_budget_month_utc_connect_call_budgets_month_utc_fk" FOREIGN KEY ("budget_month_utc") REFERENCES "public"."connect_call_budgets"("month_utc") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connect_call_sessions" ADD CONSTRAINT "connect_call_sessions_thread_id_network_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."network_threads"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connect_call_sessions" ADD CONSTRAINT "connect_call_sessions_initiator_id_ecosystem_members_id_fk" FOREIGN KEY ("initiator_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connect_call_sessions" ADD CONSTRAINT "connect_call_sessions_recipient_id_ecosystem_members_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "connect_call_request" ON "connect_call_sessions" USING btree ("initiator_id","client_request_id");--> statement-breakpoint
CREATE UNIQUE INDEX "connect_call_room" ON "connect_call_sessions" USING btree ("provider_room_name");--> statement-breakpoint
CREATE UNIQUE INDEX "connect_call_active_thread" ON "connect_call_sessions" USING btree ("thread_id") WHERE "connect_call_sessions"."status" IN ('ringing', 'provisioning', 'active', 'uncertain');--> statement-breakpoint
CREATE INDEX "connect_call_incoming" ON "connect_call_sessions" USING btree ("recipient_id","status","created_at");--> statement-breakpoint
CREATE INDEX "connect_call_outgoing" ON "connect_call_sessions" USING btree ("initiator_id","status","created_at");--> statement-breakpoint
CREATE INDEX "connect_call_month" ON "connect_call_sessions" USING btree ("budget_month_utc","reservation_state");