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
	"live_mode" boolean DEFAULT false NOT NULL,
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
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"full_name" text NOT NULL,
	"country" text,
	"city" text,
	"profession" text,
	"organization_name" text,
	"bio" text,
	"languages" text[],
	"links" jsonb,
	"looking_for" text,
	"offering" text,
	"privacy_settings" jsonb,
	"is_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text,
	"country" text,
	"description" text,
	"responsible_user_id" integer,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"group_name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "programs" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"tagline" text,
	"description" text,
	"city" text,
	"country" text,
	"start_date" date,
	"end_date" date,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"program_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"date" timestamp with time zone,
	"venue" text,
	"status" text DEFAULT 'scheduled' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opportunities" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"category" text,
	"country" text,
	"city" text,
	"description" text,
	"requirements" text,
	"deadline" timestamp with time zone,
	"status" text DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"opportunity_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"note" text,
	"status" text DEFAULT 'submitted' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partners" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text,
	"country" text,
	"description" text,
	"logo_url" text,
	"authorization_on_file" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"category" text,
	"type" text,
	"body" text,
	"media_url" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "impact_stories" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"country" text,
	"summary" text,
	"body" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"actor_user_id" integer,
	"action" text NOT NULL,
	"target_type" text,
	"target_id" integer,
	"details" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_usage_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"feature" text NOT NULL,
	"tokens_used" integer,
	"cost_estimate" numeric(10, 4),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "join_interests" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"email_normalized" text NOT NULL,
	"country" text NOT NULL,
	"city" text,
	"joining_as" text NOT NULL,
	"audience_group" text NOT NULL,
	"category" text NOT NULL,
	"organization_name" text,
	"contact_role" text,
	"sector_slugs" text[],
	"primary_sector_slug" text,
	"program_slugs" text[],
	"notify_opportunities" boolean DEFAULT false NOT NULL,
	"looking_for" text,
	"consent_accepted" boolean NOT NULL,
	"consent_text_version" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "join_interests_email_normalized_unique" UNIQUE("email_normalized")
);
--> statement-breakpoint
CREATE TABLE "institutional_inquiries" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_name" text NOT NULL,
	"organization_type" text NOT NULL,
	"country" text NOT NULL,
	"city" text,
	"website" text,
	"contact_name" text NOT NULL,
	"contact_role" text NOT NULL,
	"email_normalized" text NOT NULL,
	"message" text NOT NULL,
	"consent_accepted" boolean NOT NULL,
	"consent_text_version" text NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ecosystem_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"clerk_id" text NOT NULL,
	"account_type" text,
	"city_region" varchar(120),
	"organization_type" varchar(100),
	"contact_name" varchar(100),
	"main_sector" text,
	"active_sectors" text[],
	"location_visibility" text DEFAULT 'hidden' NOT NULL,
	"other_professional_activity" varchar(300),
	"full_name" text NOT NULL,
	"profession" text NOT NULL,
	"organization" text DEFAULT '' NOT NULL,
	"country" text DEFAULT '' NOT NULL,
	"bio" text DEFAULT '' NOT NULL,
	"offering" text DEFAULT '' NOT NULL,
	"looking_for" text DEFAULT '' NOT NULL,
	"website" text DEFAULT '' NOT NULL,
	"instagram_url" text DEFAULT '' NOT NULL,
	"facebook_url" text DEFAULT '' NOT NULL,
	"tiktok_url" text DEFAULT '' NOT NULL,
	"linkedin_url" text DEFAULT '' NOT NULL,
	"sectors" text[] DEFAULT '{}' NOT NULL,
	"saved_items" text[] DEFAULT '{}' NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"public_media" boolean DEFAULT false NOT NULL,
	"profile_layout" text DEFAULT 'immersive' NOT NULL,
	"cover_position" integer DEFAULT 50 NOT NULL,
	"posts_layout" text DEFAULT 'grid' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ecosystem_members_clerk_id_unique" UNIQUE("clerk_id"),
	CONSTRAINT "ecosystem_members_account_type_check" CHECK ("ecosystem_members"."account_type" IS NULL OR "ecosystem_members"."account_type" IN ('individual', 'organization')),
	CONSTRAINT "ecosystem_members_main_sector_check" CHECK ("ecosystem_members"."main_sector" IS NULL OR "ecosystem_members"."main_sector" IN ('fashion', 'music', 'dance', 'film', 'art', 'business', 'investment', 'tourism', 'diplomacy', 'innovation', 'technology', 'ngos', 'media', 'education', 'real-estate', 'health-care', 'humanitarian-action')),
	CONSTRAINT "ecosystem_members_location_visibility_check" CHECK ("ecosystem_members"."location_visibility" IN ('hidden', 'country', 'country_city')),
	CONSTRAINT "ecosystem_members_active_sectors_check" CHECK ("ecosystem_members"."active_sectors" IS NULL OR (
    cardinality("ecosystem_members"."active_sectors") BETWEEN 1 AND 3
    AND array_ndims("ecosystem_members"."active_sectors") = 1
    AND array_lower("ecosystem_members"."active_sectors", 1) = 1
    AND array_position("ecosystem_members"."active_sectors", NULL) IS NULL
    AND "ecosystem_members"."active_sectors" <@ ARRAY['fashion', 'music', 'dance', 'film', 'art', 'business', 'investment', 'tourism', 'diplomacy', 'innovation', 'technology', 'ngos', 'media', 'education', 'real-estate', 'health-care', 'humanitarian-action']::text[]
    AND (cardinality("ecosystem_members"."active_sectors") < 2 OR "ecosystem_members"."active_sectors"[1] <> "ecosystem_members"."active_sectors"[2])
    AND (cardinality("ecosystem_members"."active_sectors") < 3 OR ("ecosystem_members"."active_sectors"[1] <> "ecosystem_members"."active_sectors"[3] AND "ecosystem_members"."active_sectors"[2] <> "ecosystem_members"."active_sectors"[3]))
    AND "ecosystem_members"."main_sector" IS NOT NULL
    AND "ecosystem_members"."main_sector" = ANY("ecosystem_members"."active_sectors")
  ))
);
--> statement-breakpoint
CREATE TABLE "network_audit" (
	"id" serial PRIMARY KEY NOT NULL,
	"actor_id" integer NOT NULL,
	"action" text NOT NULL,
	"target_id" integer NOT NULL,
	"detail" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "network_blocks" (
	"id" serial PRIMARY KEY NOT NULL,
	"blocker_id" integer NOT NULL,
	"blocked_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "network_certifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"member_id" integer NOT NULL,
	"role" text NOT NULL,
	"program" text NOT NULL,
	"package_slug" text DEFAULT '' NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"evidence_ids" text[] DEFAULT '{}' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"decision_note" text DEFAULT '' NOT NULL,
	"agreement_confirmed" boolean DEFAULT false NOT NULL,
	"payment_confirmed" boolean DEFAULT false NOT NULL,
	"stripe_session_id" text,
	"stripe_payment_intent_id" text,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "network_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"author_id" integer NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "network_follows" (
	"id" serial PRIMARY KEY NOT NULL,
	"follower_id" integer NOT NULL,
	"following_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "network_likes" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"member_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "network_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"thread_id" integer NOT NULL,
	"sender_id" integer NOT NULL,
	"text" text NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "network_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"author_id" integer NOT NULL,
	"text" text DEFAULT '' NOT NULL,
	"kind" text DEFAULT 'post' NOT NULL,
	"media_ids" text[] DEFAULT '{}' NOT NULL,
	"visibility" text DEFAULT 'community' NOT NULL,
	"visibility_sector" text,
	"hidden" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "network_posts_visibility_check" CHECK ("network_posts"."visibility" IN ('community', 'followers', 'sector', 'draft')),
	CONSTRAINT "network_posts_visibility_sector_check" CHECK ((
    ("network_posts"."visibility" = 'sector' AND "network_posts"."visibility_sector" IS NOT NULL AND "network_posts"."visibility_sector" IN ('fashion', 'music', 'dance', 'film', 'art', 'business', 'investment', 'tourism', 'diplomacy', 'innovation', 'technology', 'ngos', 'media', 'education', 'real-estate', 'health-care', 'humanitarian-action'))
    OR ("network_posts"."visibility" <> 'sector' AND "network_posts"."visibility_sector" IS NULL)
  ))
);
--> statement-breakpoint
CREATE TABLE "network_profiles" (
	"member_id" integer PRIMARY KEY NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"founder" boolean DEFAULT false NOT NULL,
	"invite_code" uuid DEFAULT gen_random_uuid() NOT NULL,
	"referred_by" integer,
	"stripe_customer_id" text,
	"avatar_id" text,
	"cover_id" text,
	"suspended" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "network_profiles_invite_code_unique" UNIQUE("invite_code")
);
--> statement-breakpoint
CREATE TABLE "network_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"reporter_id" integer NOT NULL,
	"post_id" integer,
	"member_id" integer,
	"reason" text NOT NULL,
	"resolved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "network_threads" (
	"id" serial PRIMARY KEY NOT NULL,
	"member_a" integer NOT NULL,
	"member_b" integer NOT NULL,
	"requested_by" integer NOT NULL,
	"accepted" boolean DEFAULT false NOT NULL,
	"declined" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "network_uploads" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" integer NOT NULL,
	"object_path" text NOT NULL,
	"filename" text NOT NULL,
	"content_type" text NOT NULL,
	"size" integer NOT NULL,
	"ready" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "network_views" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"member_id" integer NOT NULL
);
--> statement-breakpoint
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
CREATE TABLE "magazine_reading_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"edition_id" text NOT NULL,
	"session_hash" text NOT NULL,
	"event_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "magazine_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"photo_url" text DEFAULT '' NOT NULL,
	"review_note" text DEFAULT '' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "magazine_submissions_order_id_unique" UNIQUE("order_id")
);
--> statement-breakpoint
CREATE TABLE "news_article_revisions" (
	"id" serial PRIMARY KEY NOT NULL,
	"article_id" integer NOT NULL,
	"revision_no" integer NOT NULL,
	"snapshot" jsonb NOT NULL,
	"created_by_member_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "news_article_revisions_article_number" UNIQUE("article_id","revision_no"),
	CONSTRAINT "news_article_revisions_article_id" UNIQUE("article_id","id"),
	CONSTRAINT "news_article_revisions_revision_no" CHECK ("news_article_revisions"."revision_no" > 0),
	CONSTRAINT "news_article_revisions_snapshot_object" CHECK (jsonb_typeof("news_article_revisions"."snapshot") = 'object'),
	CONSTRAINT "news_article_revisions_snapshot_version" CHECK (("news_article_revisions"."snapshot" -> 'schemaVersion') IS NOT DISTINCT FROM '1'::jsonb)
);
--> statement-breakpoint
CREATE TABLE "news_articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(160) NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"version" integer DEFAULT 0 NOT NULL,
	"draft_revision_id" integer,
	"published_revision_id" integer,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "news_articles_slug_unique" UNIQUE("slug"),
	CONSTRAINT "news_articles_slug_format" CHECK ("news_articles"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	CONSTRAINT "news_articles_status" CHECK ("news_articles"."status" IN ('draft', 'published', 'archived')),
	CONSTRAINT "news_articles_version" CHECK ("news_articles"."version" >= 0),
	CONSTRAINT "news_articles_publication_reference" CHECK ("news_articles"."status" <> 'published' OR ("news_articles"."published_revision_id" IS NOT NULL AND "news_articles"."published_at" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "gratitude_campaigns" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"parent_id" integer,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"identity" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_by" integer NOT NULL,
	"updated_by" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gratitude_campaigns_slug_unique" UNIQUE("slug"),
	CONSTRAINT "gratitude_campaigns_slug" CHECK ("gratitude_campaigns"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	CONSTRAINT "gratitude_campaigns_name" CHECK (char_length("gratitude_campaigns"."name") BETWEEN 1 AND 120),
	CONSTRAINT "gratitude_campaigns_description" CHECK (char_length("gratitude_campaigns"."description") <= 4000),
	CONSTRAINT "gratitude_campaigns_status" CHECK ("gratitude_campaigns"."status" IN ('draft', 'active', 'paused', 'archived')),
	CONSTRAINT "gratitude_campaigns_identity" CHECK (jsonb_typeof("gratitude_campaigns"."identity") = 'object'),
	CONSTRAINT "gratitude_campaigns_parent" CHECK ("gratitude_campaigns"."parent_id" IS NULL OR "gratitude_campaigns"."parent_id" <> "gratitude_campaigns"."id")
);
--> statement-breakpoint
CREATE TABLE "gratitude_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"contribution_id" integer NOT NULL,
	"author_id" integer NOT NULL,
	"body" text NOT NULL,
	"hidden" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gratitude_comments_body" CHECK (char_length(btrim("gratitude_comments"."body")) BETWEEN 1 AND 2000)
);
--> statement-breakpoint
CREATE TABLE "gratitude_contributions" (
	"id" serial PRIMARY KEY NOT NULL,
	"author_id" integer NOT NULL,
	"campaign_id" integer NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"country_code" text,
	"theme" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"approved_version" integer,
	"public_consent_at" timestamp with time zone,
	"consent_version" text,
	"rights_confirmed_at" timestamp with time zone,
	"featured" boolean DEFAULT false NOT NULL,
	"decision_reason" text DEFAULT '' NOT NULL,
	"reviewed_by" integer,
	"reviewed_at" timestamp with time zone,
	"submitted_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gratitude_contributions_title" CHECK (char_length("gratitude_contributions"."title") <= 160),
	CONSTRAINT "gratitude_contributions_body" CHECK (char_length("gratitude_contributions"."body") <= 5000),
	CONSTRAINT "gratitude_contributions_country" CHECK ("gratitude_contributions"."country_code" IS NULL OR "gratitude_contributions"."country_code" ~ '^[A-Z]{2}$'),
	CONSTRAINT "gratitude_contributions_theme" CHECK ("gratitude_contributions"."theme" IS NULL OR "gratitude_contributions"."theme" IN ('country', 'community', 'culture', 'inspiration', 'peace-unity', 'positive-leadership', 'humanitarian-action', 'journey')),
	CONSTRAINT "gratitude_contributions_status" CHECK ("gratitude_contributions"."status" IN ('draft', 'pending_review', 'published', 'rejected', 'hidden', 'archived')),
	CONSTRAINT "gratitude_contributions_version" CHECK ("gratitude_contributions"."version" > 0),
	CONSTRAINT "gratitude_contributions_approved_version" CHECK ("gratitude_contributions"."approved_version" IS NULL OR ("gratitude_contributions"."approved_version" > 0 AND "gratitude_contributions"."approved_version" <= "gratitude_contributions"."version")),
	CONSTRAINT "gratitude_contributions_consent_version" CHECK ("gratitude_contributions"."consent_version" IS NULL OR char_length("gratitude_contributions"."consent_version") <= 80),
	CONSTRAINT "gratitude_contributions_reason" CHECK (char_length("gratitude_contributions"."decision_reason") <= 2000),
	CONSTRAINT "gratitude_contributions_publication" CHECK ("gratitude_contributions"."status" <> 'published' OR (
    "gratitude_contributions"."approved_version" IS NOT NULL AND "gratitude_contributions"."approved_version" = "gratitude_contributions"."version"
    AND "gratitude_contributions"."public_consent_at" IS NOT NULL AND "gratitude_contributions"."rights_confirmed_at" IS NOT NULL
    AND "gratitude_contributions"."reviewed_at" IS NOT NULL AND char_length(btrim("gratitude_contributions"."title")) > 0
    AND "gratitude_contributions"."country_code" IS NOT NULL AND "gratitude_contributions"."theme" IS NOT NULL
  )),
	CONSTRAINT "gratitude_contributions_featured" CHECK (NOT "gratitude_contributions"."featured" OR "gratitude_contributions"."status" = 'published')
);
--> statement-breakpoint
CREATE TABLE "gratitude_engagement" (
	"id" serial PRIMARY KEY NOT NULL,
	"contribution_id" integer NOT NULL,
	"member_id" integer NOT NULL,
	"kind" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gratitude_engagement_member_kind" UNIQUE("contribution_id","member_id","kind"),
	CONSTRAINT "gratitude_engagement_kind" CHECK ("gratitude_engagement"."kind" IN ('view', 'like', 'share_intent'))
);
--> statement-breakpoint
CREATE TABLE "gratitude_media" (
	"id" serial PRIMARY KEY NOT NULL,
	"contribution_id" integer NOT NULL,
	"original_upload_id" text NOT NULL,
	"playback_upload_id" text,
	"thumbnail_upload_id" text,
	"kind" text NOT NULL,
	"processing_status" text DEFAULT 'pending' NOT NULL,
	"duration_ms" integer,
	"width" integer,
	"height" integer,
	"position" integer DEFAULT 0 NOT NULL,
	"alt_text" text DEFAULT '' NOT NULL,
	"captions_upload_id" text,
	"failure_code" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gratitude_media_original_upload_id_unique" UNIQUE("original_upload_id"),
	CONSTRAINT "gratitude_media_playback_upload_id_unique" UNIQUE("playback_upload_id"),
	CONSTRAINT "gratitude_media_contribution_position" UNIQUE("contribution_id","position"),
	CONSTRAINT "gratitude_media_kind" CHECK ("gratitude_media"."kind" IN ('image', 'video')),
	CONSTRAINT "gratitude_media_processing" CHECK ("gratitude_media"."processing_status" IN ('pending', 'processing', 'ready', 'failed')),
	CONSTRAINT "gratitude_media_duration" CHECK ("gratitude_media"."duration_ms" IS NULL OR ("gratitude_media"."duration_ms" > 0 AND "gratitude_media"."duration_ms" <= 180000)),
	CONSTRAINT "gratitude_media_width" CHECK ("gratitude_media"."width" IS NULL OR "gratitude_media"."width" > 0),
	CONSTRAINT "gratitude_media_height" CHECK ("gratitude_media"."height" IS NULL OR "gratitude_media"."height" > 0),
	CONSTRAINT "gratitude_media_position" CHECK ("gratitude_media"."position" >= 0),
	CONSTRAINT "gratitude_media_alt" CHECK (char_length("gratitude_media"."alt_text") <= 500),
	CONSTRAINT "gratitude_media_failure" CHECK ("gratitude_media"."failure_code" IS NULL OR char_length("gratitude_media"."failure_code") <= 80),
	CONSTRAINT "gratitude_media_ready_video" CHECK ("gratitude_media"."kind" <> 'video' OR "gratitude_media"."processing_status" <> 'ready' OR (
    "gratitude_media"."duration_ms" IS NOT NULL AND "gratitude_media"."playback_upload_id" IS NOT NULL
  ))
);
--> statement-breakpoint
CREATE TABLE "gratitude_rate_windows" (
	"member_id" integer NOT NULL,
	"action" text NOT NULL,
	"window_start" timestamp with time zone NOT NULL,
	"count" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "gratitude_rate_windows_member_id_action_window_start_pk" PRIMARY KEY("member_id","action","window_start"),
	CONSTRAINT "gratitude_rate_windows_action" CHECK ("gratitude_rate_windows"."action" IN ('submit', 'upload', 'comment', 'like', 'view', 'share_intent')),
	CONSTRAINT "gratitude_rate_windows_count" CHECK ("gratitude_rate_windows"."count" > 0)
);
--> statement-breakpoint
CREATE TABLE "gratitude_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"contribution_id" integer NOT NULL,
	"comment_id" integer,
	"reporter_id" integer NOT NULL,
	"reason" text NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"resolved_by" integer,
	"resolution_reason" text DEFAULT '' NOT NULL,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gratitude_reports_reason" CHECK (char_length(btrim("gratitude_reports"."reason")) BETWEEN 3 AND 2000),
	CONSTRAINT "gratitude_reports_status" CHECK ("gratitude_reports"."status" IN ('open', 'resolved', 'dismissed')),
	CONSTRAINT "gratitude_reports_resolution_reason" CHECK (char_length("gratitude_reports"."resolution_reason") <= 2000)
);
--> statement-breakpoint
CREATE TABLE "site_visit_sessions" (
	"day" date NOT NULL,
	"session_hash" varchar(64) NOT NULL,
	"page_views" integer DEFAULT 1 NOT NULL,
	"first_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "site_visit_sessions_day_session_hash_pk" PRIMARY KEY("day","session_hash"),
	CONSTRAINT "site_visit_sessions_hash_check" CHECK ("site_visit_sessions"."session_hash" ~ '^[a-f0-9]{64}$'),
	CONSTRAINT "site_visit_sessions_views_check" CHECK ("site_visit_sessions"."page_views" > 0),
	CONSTRAINT "site_visit_sessions_times_check" CHECK ("site_visit_sessions"."last_seen_at" >= "site_visit_sessions"."first_seen_at")
);
--> statement-breakpoint
CREATE TABLE "member_profile_reminders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" text NOT NULL,
	"requested_by" text NOT NULL,
	"attempt_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"status" text DEFAULT 'sending' NOT NULL,
	"provider_message_id" varchar(255),
	"last_attempt_at" timestamp with time zone DEFAULT now() NOT NULL,
	"accepted_at" timestamp with time zone,
	"opt_out_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "member_profile_reminders_clerk_id_unique" UNIQUE("clerk_id"),
	CONSTRAINT "member_profile_reminders_status_check" CHECK ("member_profile_reminders"."status" IN ('sending', 'accepted', 'failed', 'unknown'))
);
--> statement-breakpoint
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
CREATE TABLE "community_communication_preferences" (
	"clerk_id" text PRIMARY KEY NOT NULL,
	"frequency" text DEFAULT 'in_app' NOT NULL,
	"welcome_allowed" boolean DEFAULT false NOT NULL,
	"consented_at" timestamp with time zone,
	"consent_version" text,
	"suppressed_at" timestamp with time zone,
	"suppression_reason" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "community_preferences_frequency" CHECK ("community_communication_preferences"."frequency" IN ('daily', 'weekly', 'in_app', 'off')),
	CONSTRAINT "community_preferences_email_consent" CHECK (("community_communication_preferences"."frequency" NOT IN ('daily', 'weekly') AND NOT "community_communication_preferences"."welcome_allowed") OR ("community_communication_preferences"."consented_at" IS NOT NULL AND "community_communication_preferences"."consent_version" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "community_activity_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_key" text NOT NULL,
	"kind" text NOT NULL,
	"subject_clerk_id" text NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "community_email_settings" (
	"id" integer PRIMARY KEY NOT NULL,
	"paused" boolean DEFAULT true NOT NULL,
	"timezone" text NOT NULL,
	"send_hour" integer NOT NULL,
	"weekly_day" integer NOT NULL,
	"introduction" text DEFAULT '' NOT NULL,
	"first_approved_at" timestamp with time zone,
	"approved_by_clerk_id" text,
	"baseline_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "community_email_settings_singleton" CHECK ("community_email_settings"."id" = 1),
	CONSTRAINT "community_email_settings_hour" CHECK ("community_email_settings"."send_hour" BETWEEN 0 AND 23),
	CONSTRAINT "community_email_settings_day" CHECK ("community_email_settings"."weekly_day" BETWEEN 0 AND 6),
	CONSTRAINT "community_email_settings_approval" CHECK ("community_email_settings"."paused" OR ("community_email_settings"."first_approved_at" IS NOT NULL AND "community_email_settings"."approved_by_clerk_id" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "community_email_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" text NOT NULL,
	"period_key" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"period_start" timestamp with time zone NOT NULL,
	"period_end" timestamp with time zone NOT NULL,
	"featured_article_ids" integer[] DEFAULT '{}' NOT NULL,
	"approved_content_hash" text,
	"approved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "community_email_runs_kind" CHECK ("community_email_runs"."kind" IN ('daily', 'weekly')),
	CONSTRAINT "community_email_runs_status" CHECK ("community_email_runs"."status" IN ('draft', 'approved', 'running', 'completed', 'paused')),
	CONSTRAINT "community_email_runs_range" CHECK ("community_email_runs"."period_end" > "community_email_runs"."period_start"),
	CONSTRAINT "community_email_runs_approval" CHECK ("community_email_runs"."status" NOT IN ('approved', 'running', 'completed') OR ("community_email_runs"."approved_content_hash" IS NOT NULL AND "community_email_runs"."approved_at" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "community_email_deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"run_id" uuid,
	"clerk_id" text NOT NULL,
	"kind" text NOT NULL,
	"dedupe_key" text NOT NULL,
	"idempotency_key" text NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"provider_id" text,
	"attempts" integer DEFAULT 0 NOT NULL,
	"claim_expires_at" timestamp with time zone,
	"next_attempt_at" timestamp with time zone,
	"last_error_code" text,
	"provider_event_at" timestamp with time zone,
	"provider_event_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "community_email_deliveries_kind" CHECK ("community_email_deliveries"."kind" IN ('welcome', 'daily', 'weekly')),
	CONSTRAINT "community_email_deliveries_status" CHECK ("community_email_deliveries"."status" IN ('queued', 'claimed', 'accepted', 'delivered', 'bounced', 'complained', 'suppressed', 'failed', 'unknown')),
	CONSTRAINT "community_email_deliveries_attempts" CHECK ("community_email_deliveries"."attempts" >= 0),
	CONSTRAINT "community_email_deliveries_run" CHECK (("community_email_deliveries"."kind" = 'welcome' AND "community_email_deliveries"."run_id" IS NULL) OR ("community_email_deliveries"."kind" IN ('daily', 'weekly') AND "community_email_deliveries"."run_id" IS NOT NULL))
);
--> statement-breakpoint
ALTER TABLE "humanitarian_payments" ADD CONSTRAINT "humanitarian_payments_member_id_ecosystem_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_responsible_user_id_users_id_fk" FOREIGN KEY ("responsible_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_audit" ADD CONSTRAINT "network_audit_actor_id_ecosystem_members_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_blocks" ADD CONSTRAINT "network_blocks_blocker_id_ecosystem_members_id_fk" FOREIGN KEY ("blocker_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_blocks" ADD CONSTRAINT "network_blocks_blocked_id_ecosystem_members_id_fk" FOREIGN KEY ("blocked_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_certifications" ADD CONSTRAINT "network_certifications_member_id_ecosystem_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_comments" ADD CONSTRAINT "network_comments_post_id_network_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."network_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_comments" ADD CONSTRAINT "network_comments_author_id_ecosystem_members_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_follows" ADD CONSTRAINT "network_follows_follower_id_ecosystem_members_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_follows" ADD CONSTRAINT "network_follows_following_id_ecosystem_members_id_fk" FOREIGN KEY ("following_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_likes" ADD CONSTRAINT "network_likes_post_id_network_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."network_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_likes" ADD CONSTRAINT "network_likes_member_id_ecosystem_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_messages" ADD CONSTRAINT "network_messages_thread_id_network_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."network_threads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_messages" ADD CONSTRAINT "network_messages_sender_id_ecosystem_members_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_posts" ADD CONSTRAINT "network_posts_author_id_ecosystem_members_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_profiles" ADD CONSTRAINT "network_profiles_member_id_ecosystem_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_profiles" ADD CONSTRAINT "network_profiles_referred_by_ecosystem_members_id_fk" FOREIGN KEY ("referred_by") REFERENCES "public"."ecosystem_members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_reports" ADD CONSTRAINT "network_reports_reporter_id_ecosystem_members_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_reports" ADD CONSTRAINT "network_reports_post_id_network_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."network_posts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_reports" ADD CONSTRAINT "network_reports_member_id_ecosystem_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_threads" ADD CONSTRAINT "network_threads_member_a_ecosystem_members_id_fk" FOREIGN KEY ("member_a") REFERENCES "public"."ecosystem_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_threads" ADD CONSTRAINT "network_threads_member_b_ecosystem_members_id_fk" FOREIGN KEY ("member_b") REFERENCES "public"."ecosystem_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_threads" ADD CONSTRAINT "network_threads_requested_by_ecosystem_members_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."ecosystem_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_uploads" ADD CONSTRAINT "network_uploads_owner_id_ecosystem_members_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_views" ADD CONSTRAINT "network_views_post_id_network_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."network_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_views" ADD CONSTRAINT "network_views_member_id_ecosystem_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_attestations" ADD CONSTRAINT "business_attestations_owner_id_professional_businesses_member_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."professional_businesses"("member_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_attestations" ADD CONSTRAINT "business_attestations_attester_id_ecosystem_members_id_fk" FOREIGN KEY ("attester_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "editorial_comments" ADD CONSTRAINT "editorial_comments_member_id_ecosystem_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "editorial_likes" ADD CONSTRAINT "editorial_likes_member_id_ecosystem_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monthly_memberships" ADD CONSTRAINT "monthly_memberships_member_id_ecosystem_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_businesses" ADD CONSTRAINT "professional_businesses_member_id_ecosystem_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_introductions" ADD CONSTRAINT "professional_introductions_member_id_ecosystem_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "magazine_orders" ADD CONSTRAINT "magazine_orders_member_id_ecosystem_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "magazine_submissions" ADD CONSTRAINT "magazine_submissions_order_id_magazine_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."magazine_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_article_revisions" ADD CONSTRAINT "news_article_revisions_article_id_news_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."news_articles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_article_revisions" ADD CONSTRAINT "news_article_revisions_created_by_member_id_ecosystem_members_id_fk" FOREIGN KEY ("created_by_member_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_articles" ADD CONSTRAINT "news_articles_draft_revision_fk" FOREIGN KEY ("id","draft_revision_id") REFERENCES "public"."news_article_revisions"("article_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_articles" ADD CONSTRAINT "news_articles_published_revision_fk" FOREIGN KEY ("id","published_revision_id") REFERENCES "public"."news_article_revisions"("article_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gratitude_campaigns" ADD CONSTRAINT "gratitude_campaigns_parent_id_gratitude_campaigns_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."gratitude_campaigns"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gratitude_campaigns" ADD CONSTRAINT "gratitude_campaigns_created_by_ecosystem_members_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."ecosystem_members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gratitude_campaigns" ADD CONSTRAINT "gratitude_campaigns_updated_by_ecosystem_members_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."ecosystem_members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gratitude_comments" ADD CONSTRAINT "gratitude_comments_contribution_id_gratitude_contributions_id_fk" FOREIGN KEY ("contribution_id") REFERENCES "public"."gratitude_contributions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gratitude_comments" ADD CONSTRAINT "gratitude_comments_author_id_ecosystem_members_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gratitude_contributions" ADD CONSTRAINT "gratitude_contributions_author_id_ecosystem_members_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gratitude_contributions" ADD CONSTRAINT "gratitude_contributions_campaign_id_gratitude_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."gratitude_campaigns"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gratitude_contributions" ADD CONSTRAINT "gratitude_contributions_reviewed_by_ecosystem_members_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."ecosystem_members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gratitude_engagement" ADD CONSTRAINT "gratitude_engagement_contribution_id_gratitude_contributions_id_fk" FOREIGN KEY ("contribution_id") REFERENCES "public"."gratitude_contributions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gratitude_engagement" ADD CONSTRAINT "gratitude_engagement_member_id_ecosystem_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gratitude_media" ADD CONSTRAINT "gratitude_media_contribution_id_gratitude_contributions_id_fk" FOREIGN KEY ("contribution_id") REFERENCES "public"."gratitude_contributions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gratitude_media" ADD CONSTRAINT "gratitude_media_original_upload_id_network_uploads_id_fk" FOREIGN KEY ("original_upload_id") REFERENCES "public"."network_uploads"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gratitude_media" ADD CONSTRAINT "gratitude_media_playback_upload_id_network_uploads_id_fk" FOREIGN KEY ("playback_upload_id") REFERENCES "public"."network_uploads"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gratitude_media" ADD CONSTRAINT "gratitude_media_thumbnail_upload_id_network_uploads_id_fk" FOREIGN KEY ("thumbnail_upload_id") REFERENCES "public"."network_uploads"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gratitude_media" ADD CONSTRAINT "gratitude_media_captions_upload_id_network_uploads_id_fk" FOREIGN KEY ("captions_upload_id") REFERENCES "public"."network_uploads"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gratitude_rate_windows" ADD CONSTRAINT "gratitude_rate_windows_member_id_ecosystem_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gratitude_reports" ADD CONSTRAINT "gratitude_reports_contribution_id_gratitude_contributions_id_fk" FOREIGN KEY ("contribution_id") REFERENCES "public"."gratitude_contributions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gratitude_reports" ADD CONSTRAINT "gratitude_reports_comment_id_gratitude_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."gratitude_comments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gratitude_reports" ADD CONSTRAINT "gratitude_reports_reporter_id_ecosystem_members_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gratitude_reports" ADD CONSTRAINT "gratitude_reports_resolved_by_ecosystem_members_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."ecosystem_members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_email_deliveries" ADD CONSTRAINT "community_email_deliveries_run_id_community_email_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."community_email_runs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "humanitarian_member_access_idx" ON "humanitarian_payments" USING btree ("member_id","status");--> statement-breakpoint
CREATE INDEX "institutional_inquiries_email_idx" ON "institutional_inquiries" USING btree ("email_normalized");--> statement-breakpoint
CREATE UNIQUE INDEX "network_block_unique" ON "network_blocks" USING btree ("blocker_id","blocked_id");--> statement-breakpoint
CREATE UNIQUE INDEX "network_follow_unique" ON "network_follows" USING btree ("follower_id","following_id");--> statement-breakpoint
CREATE UNIQUE INDEX "network_likes_unique" ON "network_likes" USING btree ("post_id","member_id");--> statement-breakpoint
CREATE INDEX "network_messages_thread_idx" ON "network_messages" USING btree ("thread_id","id");--> statement-breakpoint
CREATE INDEX "network_posts_feed_idx" ON "network_posts" USING btree ("id");--> statement-breakpoint
CREATE INDEX "network_posts_author_idx" ON "network_posts" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "network_posts_visibility_feed_idx" ON "network_posts" USING btree ("visibility","visibility_sector","id");--> statement-breakpoint
CREATE INDEX "network_profiles_referrer_idx" ON "network_profiles" USING btree ("referred_by");--> statement-breakpoint
CREATE UNIQUE INDEX "network_thread_pair" ON "network_threads" USING btree ("member_a","member_b");--> statement-breakpoint
CREATE UNIQUE INDEX "network_views_unique" ON "network_views" USING btree ("post_id","member_id");--> statement-breakpoint
CREATE UNIQUE INDEX "business_attestation_unique" ON "business_attestations" USING btree ("owner_id","attester_id");--> statement-breakpoint
CREATE UNIQUE INDEX "editorial_like_unique" ON "editorial_likes" USING btree ("video_id","member_id");--> statement-breakpoint
CREATE INDEX "magazine_orders_member_idx" ON "magazine_orders" USING btree ("member_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "magazine_reading_event_unique" ON "magazine_reading_events" USING btree ("edition_id","session_hash","event_key");--> statement-breakpoint
CREATE INDEX "magazine_reading_edition_idx" ON "magazine_reading_events" USING btree ("edition_id","created_at");--> statement-breakpoint
CREATE INDEX "news_articles_public_listing_idx" ON "news_articles" USING btree ("published_at" DESC NULLS LAST,"id" DESC NULLS LAST) WHERE "news_articles"."status" = 'published';--> statement-breakpoint
CREATE INDEX "gratitude_campaigns_parent_status_idx" ON "gratitude_campaigns" USING btree ("parent_id","status");--> statement-breakpoint
CREATE INDEX "gratitude_comments_feed_idx" ON "gratitude_comments" USING btree ("contribution_id","hidden","created_at","id");--> statement-breakpoint
CREATE INDEX "gratitude_contributions_feed_idx" ON "gratitude_contributions" USING btree ("campaign_id","status","published_at" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "gratitude_contributions_country_idx" ON "gratitude_contributions" USING btree ("country_code","status","published_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "gratitude_contributions_author_idx" ON "gratitude_contributions" USING btree ("author_id","updated_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "gratitude_contributions_review_idx" ON "gratitude_contributions" USING btree ("status","submitted_at");--> statement-breakpoint
CREATE INDEX "gratitude_engagement_counts_idx" ON "gratitude_engagement" USING btree ("contribution_id","kind");--> statement-breakpoint
CREATE INDEX "gratitude_media_processing_idx" ON "gratitude_media" USING btree ("processing_status","updated_at");--> statement-breakpoint
CREATE INDEX "gratitude_rate_windows_cleanup_idx" ON "gratitude_rate_windows" USING btree ("window_start");--> statement-breakpoint
CREATE INDEX "gratitude_reports_queue_idx" ON "gratitude_reports" USING btree ("status","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "gratitude_reports_open_story_unique" ON "gratitude_reports" USING btree ("contribution_id","reporter_id") WHERE "gratitude_reports"."status" = 'open' AND "gratitude_reports"."comment_id" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "gratitude_reports_open_comment_unique" ON "gratitude_reports" USING btree ("comment_id","reporter_id") WHERE "gratitude_reports"."status" = 'open' AND "gratitude_reports"."comment_id" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "founder_notifications_event_key" ON "founder_notifications" USING btree ("event_key");--> statement-breakpoint
CREATE INDEX "founder_notifications_date" ON "founder_notifications" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "founder_service_messages_request" ON "founder_service_messages" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX "founder_service_messages_recipient" ON "founder_service_messages" USING btree ("recipient_clerk_id","id");--> statement-breakpoint
CREATE UNIQUE INDEX "community_activity_event_key" ON "community_activity_events" USING btree ("event_key");--> statement-breakpoint
CREATE UNIQUE INDEX "community_email_runs_period" ON "community_email_runs" USING btree ("kind","period_key");--> statement-breakpoint
CREATE UNIQUE INDEX "community_email_deliveries_dedupe" ON "community_email_deliveries" USING btree ("dedupe_key");--> statement-breakpoint
CREATE UNIQUE INDEX "community_email_deliveries_idempotency" ON "community_email_deliveries" USING btree ("idempotency_key");--> statement-breakpoint
CREATE UNIQUE INDEX "community_email_deliveries_provider" ON "community_email_deliveries" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "community_email_deliveries_work" ON "community_email_deliveries" USING btree ("status","next_attempt_at");--> statement-breakpoint
CREATE INDEX "community_email_deliveries_member_date" ON "community_email_deliveries" USING btree ("clerk_id","created_at");