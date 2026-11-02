ALTER TABLE "network_posts" ADD COLUMN "visibility" text DEFAULT 'community' NOT NULL;--> statement-breakpoint
ALTER TABLE "network_posts" ADD COLUMN "visibility_sector" text;--> statement-breakpoint
CREATE INDEX "network_posts_visibility_feed_idx" ON "network_posts" USING btree ("visibility","visibility_sector","id");--> statement-breakpoint
ALTER TABLE "network_posts" ADD CONSTRAINT "network_posts_visibility_check" CHECK ("network_posts"."visibility" IN ('community', 'followers', 'sector', 'draft'));--> statement-breakpoint
ALTER TABLE "network_posts" ADD CONSTRAINT "network_posts_visibility_sector_check" CHECK ((
    ("network_posts"."visibility" = 'sector' AND "network_posts"."visibility_sector" IS NOT NULL AND "network_posts"."visibility_sector" IN ('fashion', 'music', 'dance', 'film', 'art', 'business', 'investment', 'tourism', 'diplomacy', 'innovation', 'technology', 'ngos', 'media', 'education', 'real-estate', 'health-care', 'humanitarian-action'))
    OR ("network_posts"."visibility" <> 'sector' AND "network_posts"."visibility_sector" IS NULL)
  ));