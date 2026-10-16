CREATE TABLE "humanitarian_offers" (
	"id" serial PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"country" text NOT NULL,
	"description" text NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"consent_version" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "humanitarian_payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"member_id" integer,
	"kind" text NOT NULL,
	"amount" integer NOT NULL,
	"currency" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"grants_archive" boolean DEFAULT false NOT NULL,
	"stripe_session_id" text,
	"payment_intent_id" text,
	"refunded_amount" integer DEFAULT 0 NOT NULL,
	"consent_version" text NOT NULL,
	"request_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "humanitarian_payments_stripe_session_id_unique" UNIQUE("stripe_session_id"),
	CONSTRAINT "humanitarian_payments_payment_intent_id_unique" UNIQUE("payment_intent_id"),
	CONSTRAINT "humanitarian_payments_request_id_unique" UNIQUE("request_id")
);
--> statement-breakpoint
ALTER TABLE "humanitarian_payments" ADD CONSTRAINT "humanitarian_payments_member_id_ecosystem_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "humanitarian_member_access_idx" ON "humanitarian_payments" USING btree ("member_id","status");