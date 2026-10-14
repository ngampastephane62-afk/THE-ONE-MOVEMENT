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
	"hidden" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "network_profiles" (
	"member_id" integer PRIMARY KEY NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"avatar_id" text,
	"cover_id" text,
	"suspended" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
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
ALTER TABLE "network_reports" ADD CONSTRAINT "network_reports_reporter_id_ecosystem_members_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_reports" ADD CONSTRAINT "network_reports_post_id_network_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."network_posts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_reports" ADD CONSTRAINT "network_reports_member_id_ecosystem_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_threads" ADD CONSTRAINT "network_threads_member_a_ecosystem_members_id_fk" FOREIGN KEY ("member_a") REFERENCES "public"."ecosystem_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_threads" ADD CONSTRAINT "network_threads_member_b_ecosystem_members_id_fk" FOREIGN KEY ("member_b") REFERENCES "public"."ecosystem_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_threads" ADD CONSTRAINT "network_threads_requested_by_ecosystem_members_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."ecosystem_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_uploads" ADD CONSTRAINT "network_uploads_owner_id_ecosystem_members_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_views" ADD CONSTRAINT "network_views_post_id_network_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."network_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_views" ADD CONSTRAINT "network_views_member_id_ecosystem_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "network_block_unique" ON "network_blocks" USING btree ("blocker_id","blocked_id");--> statement-breakpoint
CREATE UNIQUE INDEX "network_follow_unique" ON "network_follows" USING btree ("follower_id","following_id");--> statement-breakpoint
CREATE UNIQUE INDEX "network_likes_unique" ON "network_likes" USING btree ("post_id","member_id");--> statement-breakpoint
CREATE INDEX "network_messages_thread_idx" ON "network_messages" USING btree ("thread_id","id");--> statement-breakpoint
CREATE INDEX "network_posts_feed_idx" ON "network_posts" USING btree ("id");--> statement-breakpoint
CREATE INDEX "network_posts_author_idx" ON "network_posts" USING btree ("author_id");--> statement-breakpoint
CREATE UNIQUE INDEX "network_thread_pair" ON "network_threads" USING btree ("member_a","member_b");--> statement-breakpoint
CREATE UNIQUE INDEX "network_views_unique" ON "network_views" USING btree ("post_id","member_id");