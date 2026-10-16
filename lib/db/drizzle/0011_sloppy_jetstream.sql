CREATE TABLE "magazine_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"member_id" integer NOT NULL,
	"format" text NOT NULL,
	"status" text NOT NULL,
	"item_amount" integer NOT NULL,
	"shipping_amount" integer,
	"currency" text DEFAULT 'usd' NOT NULL,
	"full_name" text,
	"address" text,
	"country" text,
	"phone" text,
	"email" text NOT NULL,
	"request_id" text NOT NULL,
	"stripe_session_id" text,
	"payment_intent_id" text,
	"live_mode" boolean DEFAULT false NOT NULL,
	"refunded_amount" integer DEFAULT 0 NOT NULL,
	"consent_version" text NOT NULL,
	"quoted_at" timestamp with time zone,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "magazine_orders_request_id_unique" UNIQUE("request_id"),
	CONSTRAINT "magazine_orders_stripe_session_id_unique" UNIQUE("stripe_session_id"),
	CONSTRAINT "magazine_orders_payment_intent_id_unique" UNIQUE("payment_intent_id")
);
--> statement-breakpoint
ALTER TABLE "magazine_orders" ADD CONSTRAINT "magazine_orders_member_id_ecosystem_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "magazine_orders_member_idx" ON "magazine_orders" USING btree ("member_id","created_at");