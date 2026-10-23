ALTER TABLE "ecosystem_members" ADD COLUMN "account_type" text;--> statement-breakpoint
ALTER TABLE "ecosystem_members" ADD COLUMN "city_region" varchar(120);--> statement-breakpoint
ALTER TABLE "ecosystem_members" ADD COLUMN "organization_type" varchar(100);--> statement-breakpoint
ALTER TABLE "ecosystem_members" ADD COLUMN "contact_name" varchar(100);--> statement-breakpoint
ALTER TABLE "ecosystem_members" ADD COLUMN "main_sector" text;--> statement-breakpoint
ALTER TABLE "ecosystem_members" ADD CONSTRAINT "ecosystem_members_account_type_check" CHECK ("ecosystem_members"."account_type" IS NULL OR "ecosystem_members"."account_type" IN ('individual', 'organization'));--> statement-breakpoint
ALTER TABLE "ecosystem_members" ADD CONSTRAINT "ecosystem_members_main_sector_check" CHECK ("ecosystem_members"."main_sector" IS NULL OR "ecosystem_members"."main_sector" IN ('fashion', 'music', 'dance', 'film', 'art', 'business', 'investment', 'tourism', 'diplomacy', 'innovation', 'technology', 'ngos', 'media', 'education', 'real-estate', 'health-care', 'humanitarian-action'));