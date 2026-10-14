CREATE TABLE "ecosystem_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"clerk_id" text NOT NULL,
	"full_name" text NOT NULL,
	"profession" text NOT NULL,
	"organization" text DEFAULT '' NOT NULL,
	"country" text DEFAULT '' NOT NULL,
	"bio" text DEFAULT '' NOT NULL,
	"offering" text DEFAULT '' NOT NULL,
	"looking_for" text DEFAULT '' NOT NULL,
	"website" text DEFAULT '' NOT NULL,
	"sectors" text[] DEFAULT '{}' NOT NULL,
	"saved_items" text[] DEFAULT '{}' NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ecosystem_members_clerk_id_unique" UNIQUE("clerk_id")
);
