ALTER TABLE "ecosystem_members" ADD COLUMN "profile_layout" text DEFAULT 'immersive' NOT NULL;--> statement-breakpoint
ALTER TABLE "ecosystem_members" ADD COLUMN "cover_position" integer DEFAULT 50 NOT NULL;--> statement-breakpoint
ALTER TABLE "ecosystem_members" ADD COLUMN "posts_layout" text DEFAULT 'grid' NOT NULL;