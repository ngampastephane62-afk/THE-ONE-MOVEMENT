CREATE TABLE "business_attestations" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner_id" integer NOT NULL,
	"attester_id" integer NOT NULL,
	"statement" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "editorial_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"video_id" text NOT NULL,
	"member_id" integer NOT NULL,
	"text" text NOT NULL,
	"hidden" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "editorial_likes" (
	"id" serial PRIMARY KEY NOT NULL,
	"video_id" text NOT NULL,
	"member_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "monthly_memberships" (
	"member_id" integer PRIMARY KEY NOT NULL,
	"tier" text DEFAULT 'professional' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"subscription_id" text,
	"checkout_session_id" text,
	"live_mode" boolean DEFAULT false NOT NULL,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"current_period_end" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "monthly_memberships_subscription_id_unique" UNIQUE("subscription_id")
);
--> statement-breakpoint
CREATE TABLE "professional_businesses" (
	"member_id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"website" text NOT NULL,
	"registration_reference" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"decision_note" text DEFAULT '' NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "professional_introductions" (
	"id" serial PRIMARY KEY NOT NULL,
	"member_id" integer NOT NULL,
	"target_slug" text NOT NULL,
	"message" text NOT NULL,
	"status" text DEFAULT 'received' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "business_attestations" ADD CONSTRAINT "business_attestations_owner_id_professional_businesses_member_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."professional_businesses"("member_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_attestations" ADD CONSTRAINT "business_attestations_attester_id_ecosystem_members_id_fk" FOREIGN KEY ("attester_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "editorial_comments" ADD CONSTRAINT "editorial_comments_member_id_ecosystem_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "editorial_likes" ADD CONSTRAINT "editorial_likes_member_id_ecosystem_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monthly_memberships" ADD CONSTRAINT "monthly_memberships_member_id_ecosystem_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_businesses" ADD CONSTRAINT "professional_businesses_member_id_ecosystem_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_introductions" ADD CONSTRAINT "professional_introductions_member_id_ecosystem_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "business_attestation_unique" ON "business_attestations" USING btree ("owner_id","attester_id");--> statement-breakpoint
CREATE UNIQUE INDEX "editorial_like_unique" ON "editorial_likes" USING btree ("video_id","member_id");