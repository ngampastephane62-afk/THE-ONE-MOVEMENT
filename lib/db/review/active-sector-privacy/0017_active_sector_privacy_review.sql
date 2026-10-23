ALTER TABLE "ecosystem_members" ADD COLUMN "active_sectors" text[];--> statement-breakpoint
ALTER TABLE "ecosystem_members" ADD COLUMN "location_visibility" text DEFAULT 'hidden' NOT NULL;--> statement-breakpoint
ALTER TABLE "ecosystem_members" ADD COLUMN "other_professional_activity" varchar(300);--> statement-breakpoint
ALTER TABLE "ecosystem_members" ADD CONSTRAINT "ecosystem_members_location_visibility_check" CHECK ("ecosystem_members"."location_visibility" IN ('hidden', 'country', 'country_city'));--> statement-breakpoint
ALTER TABLE "ecosystem_members" ADD CONSTRAINT "ecosystem_members_active_sectors_check" CHECK ("ecosystem_members"."active_sectors" IS NULL OR (
    cardinality("ecosystem_members"."active_sectors") BETWEEN 1 AND 3
    AND array_ndims("ecosystem_members"."active_sectors") = 1
    AND array_lower("ecosystem_members"."active_sectors", 1) = 1
    AND array_position("ecosystem_members"."active_sectors", NULL) IS NULL
    AND "ecosystem_members"."active_sectors" <@ ARRAY['fashion', 'music', 'dance', 'film', 'art', 'business', 'investment', 'tourism', 'diplomacy', 'innovation', 'technology', 'ngos', 'media', 'education', 'real-estate', 'health-care', 'humanitarian-action']::text[]
    AND (cardinality("ecosystem_members"."active_sectors") < 2 OR "ecosystem_members"."active_sectors"[1] <> "ecosystem_members"."active_sectors"[2])
    AND (cardinality("ecosystem_members"."active_sectors") < 3 OR ("ecosystem_members"."active_sectors"[1] <> "ecosystem_members"."active_sectors"[3] AND "ecosystem_members"."active_sectors"[2] <> "ecosystem_members"."active_sectors"[3]))
    AND "ecosystem_members"."main_sector" IS NOT NULL
    AND "ecosystem_members"."main_sector" = ANY("ecosystem_members"."active_sectors")
  ));
