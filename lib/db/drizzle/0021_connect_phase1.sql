CREATE TABLE "connect_attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"message_id" uuid,
	"owner_id" integer,
	"object_path" text NOT NULL,
	"filename" text NOT NULL,
	"content_type" text NOT NULL,
	"size" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"scan_status" text DEFAULT 'not_supported' NOT NULL,
	"duration_ms" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "connect_attachments_status" CHECK ("connect_attachments"."status" IN ('pending', 'uploaded', 'ready', 'rejected')),
	CONSTRAINT "connect_attachments_scan" CHECK ("connect_attachments"."scan_status" IN ('not_supported', 'pending', 'clean', 'infected', 'failed')),
	CONSTRAINT "connect_attachments_size" CHECK ("connect_attachments"."size" > 0 AND "connect_attachments"."size" <= CASE WHEN "connect_attachments"."content_type" LIKE 'video/%' THEN 524288000 ELSE 20971520 END),
	CONSTRAINT "connect_attachments_duration" CHECK ("connect_attachments"."duration_ms" IS NULL OR "connect_attachments"."duration_ms" > 0),
	CONSTRAINT "connect_attachments_bound" CHECK ("connect_attachments"."message_id" IS NULL OR "connect_attachments"."status" = 'ready'),
	CONSTRAINT "connect_attachments_scan_ready" CHECK ("connect_attachments"."status" <> 'ready' OR "connect_attachments"."scan_status" IN ('not_supported', 'clean'))
);
--> statement-breakpoint
CREATE TABLE "connect_conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" text NOT NULL,
	"legacy_thread_id" integer,
	"title" text DEFAULT '' NOT NULL,
	"created_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "connect_conversations_kind" CHECK ("connect_conversations"."kind" IN ('direct', 'group')),
	CONSTRAINT "connect_conversations_legacy_kind" CHECK (("connect_conversations"."kind" = 'direct' AND "connect_conversations"."legacy_thread_id" IS NOT NULL) OR ("connect_conversations"."kind" = 'group' AND "connect_conversations"."legacy_thread_id" IS NULL)),
	CONSTRAINT "connect_conversations_title" CHECK (char_length("connect_conversations"."title") <= 160 AND ("connect_conversations"."kind" <> 'group' OR char_length(btrim("connect_conversations"."title")) > 0))
);
--> statement-breakpoint
CREATE TABLE "connect_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"subject_member_id" integer,
	"message_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "connect_events_kind" CHECK ("connect_events"."kind" IN ('message', 'edit', 'delete', 'reaction', 'pin', 'invitation', 'membership', 'read'))
);
--> statement-breakpoint
CREATE TABLE "connect_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"sender_id" integer,
	"legacy_message_id" integer,
	"text" text,
	"kind" text DEFAULT 'text' NOT NULL,
	"reply_to_id" uuid,
	"client_nonce" uuid NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"edited_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "connect_messages_identity_scope" UNIQUE("id","conversation_id"),
	CONSTRAINT "connect_messages_kind" CHECK ("connect_messages"."kind" IN ('text', 'attachment', 'voice')),
	CONSTRAINT "connect_messages_version" CHECK ("connect_messages"."version" > 0),
	CONSTRAINT "connect_messages_source" CHECK (("connect_messages"."legacy_message_id" IS NOT NULL AND "connect_messages"."text" IS NULL) OR ("connect_messages"."legacy_message_id" IS NULL AND "connect_messages"."text" IS NOT NULL)),
	CONSTRAINT "connect_messages_text" CHECK ("connect_messages"."text" IS NULL OR (char_length("connect_messages"."text") <= 3000 AND ("connect_messages"."kind" <> 'text' OR char_length(btrim("connect_messages"."text")) > 0))),
	CONSTRAINT "connect_messages_reply" CHECK ("connect_messages"."reply_to_id" IS NULL OR "connect_messages"."reply_to_id" <> "connect_messages"."id")
);
--> statement-breakpoint
CREATE TABLE "connect_participants" (
	"conversation_id" uuid NOT NULL,
	"member_id" integer NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"status" text DEFAULT 'invited' NOT NULL,
	"invited_by" integer,
	"invited_at" timestamp with time zone DEFAULT now() NOT NULL,
	"joined_at" timestamp with time zone,
	"history_from" timestamp with time zone,
	"last_read_at" timestamp with time zone,
	"last_read_message_id" uuid,
	"muted" boolean DEFAULT false NOT NULL,
	"archived" boolean DEFAULT false NOT NULL,
	"left_at" timestamp with time zone,
	CONSTRAINT "connect_participants_conversation_id_member_id_pk" PRIMARY KEY("conversation_id","member_id"),
	CONSTRAINT "connect_participants_role" CHECK ("connect_participants"."role" IN ('owner', 'admin', 'member')),
	CONSTRAINT "connect_participants_status" CHECK ("connect_participants"."status" IN ('invited', 'active', 'declined', 'left', 'removed')),
	CONSTRAINT "connect_participants_active" CHECK ("connect_participants"."status" <> 'active' OR ("connect_participants"."joined_at" IS NOT NULL AND "connect_participants"."history_from" IS NOT NULL AND "connect_participants"."left_at" IS NULL))
);
--> statement-breakpoint
CREATE TABLE "connect_pins" (
	"message_id" uuid PRIMARY KEY NOT NULL,
	"pinned_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "connect_preferences" (
	"member_id" integer PRIMARY KEY NOT NULL,
	"theme" text DEFAULT 'original' NOT NULL,
	"show_presence" boolean DEFAULT false NOT NULL,
	"notification_previews" boolean DEFAULT false NOT NULL,
	"in_app_notifications" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "connect_preferences_theme" CHECK ("connect_preferences"."theme" IN ('emerald-gold', 'midnight', 'ivory', 'dark-professional', 'original'))
);
--> statement-breakpoint
CREATE TABLE "connect_reactions" (
	"message_id" uuid NOT NULL,
	"member_id" integer NOT NULL,
	"emoji" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "connect_reactions_message_id_member_id_emoji_pk" PRIMARY KEY("message_id","member_id","emoji"),
	CONSTRAINT "connect_reactions_emoji" CHECK (char_length("connect_reactions"."emoji") BETWEEN 1 AND 32)
);
--> statement-breakpoint
CREATE TABLE "connect_signals" (
	"conversation_id" uuid NOT NULL,
	"member_id" integer NOT NULL,
	"typing_until" timestamp with time zone,
	"online_until" timestamp with time zone,
	CONSTRAINT "connect_signals_conversation_id_member_id_pk" PRIMARY KEY("conversation_id","member_id")
);
--> statement-breakpoint
ALTER TABLE "connect_attachments" ADD CONSTRAINT "connect_attachments_conversation_id_connect_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."connect_conversations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connect_attachments" ADD CONSTRAINT "connect_attachments_owner_id_ecosystem_members_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connect_attachments" ADD CONSTRAINT "connect_attachments_message_scope" FOREIGN KEY ("message_id","conversation_id") REFERENCES "public"."connect_messages"("id","conversation_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connect_conversations" ADD CONSTRAINT "connect_conversations_legacy_thread_id_network_threads_id_fk" FOREIGN KEY ("legacy_thread_id") REFERENCES "public"."network_threads"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connect_conversations" ADD CONSTRAINT "connect_conversations_created_by_ecosystem_members_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."ecosystem_members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connect_events" ADD CONSTRAINT "connect_events_conversation_id_connect_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."connect_conversations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connect_events" ADD CONSTRAINT "connect_events_subject_member_id_ecosystem_members_id_fk" FOREIGN KEY ("subject_member_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connect_events" ADD CONSTRAINT "connect_events_message_scope" FOREIGN KEY ("message_id","conversation_id") REFERENCES "public"."connect_messages"("id","conversation_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connect_messages" ADD CONSTRAINT "connect_messages_conversation_id_connect_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."connect_conversations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connect_messages" ADD CONSTRAINT "connect_messages_sender_id_ecosystem_members_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connect_messages" ADD CONSTRAINT "connect_messages_legacy_message_id_network_messages_id_fk" FOREIGN KEY ("legacy_message_id") REFERENCES "public"."network_messages"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connect_messages" ADD CONSTRAINT "connect_messages_reply_to_id_connect_messages_id_fk" FOREIGN KEY ("reply_to_id") REFERENCES "public"."connect_messages"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connect_participants" ADD CONSTRAINT "connect_participants_conversation_id_connect_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."connect_conversations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connect_participants" ADD CONSTRAINT "connect_participants_member_id_ecosystem_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connect_participants" ADD CONSTRAINT "connect_participants_invited_by_ecosystem_members_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."ecosystem_members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connect_participants" ADD CONSTRAINT "connect_participants_read_message_scope" FOREIGN KEY ("last_read_message_id","conversation_id") REFERENCES "public"."connect_messages"("id","conversation_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connect_pins" ADD CONSTRAINT "connect_pins_message_id_connect_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."connect_messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connect_pins" ADD CONSTRAINT "connect_pins_pinned_by_ecosystem_members_id_fk" FOREIGN KEY ("pinned_by") REFERENCES "public"."ecosystem_members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connect_preferences" ADD CONSTRAINT "connect_preferences_member_id_ecosystem_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connect_reactions" ADD CONSTRAINT "connect_reactions_message_id_connect_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."connect_messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connect_reactions" ADD CONSTRAINT "connect_reactions_member_id_ecosystem_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connect_signals" ADD CONSTRAINT "connect_signals_conversation_id_connect_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."connect_conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connect_signals" ADD CONSTRAINT "connect_signals_member_id_ecosystem_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "connect_attachments_object" ON "connect_attachments" USING btree ("object_path");--> statement-breakpoint
CREATE INDEX "connect_attachments_message" ON "connect_attachments" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "connect_attachments_owner_date" ON "connect_attachments" USING btree ("owner_id","created_at");--> statement-breakpoint
CREATE INDEX "connect_attachments_expiry" ON "connect_attachments" USING btree ("status","expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "connect_conversations_legacy_thread" ON "connect_conversations" USING btree ("legacy_thread_id");--> statement-breakpoint
CREATE INDEX "connect_events_cursor" ON "connect_events" USING btree ("conversation_id","created_at","id");--> statement-breakpoint
CREATE UNIQUE INDEX "connect_messages_legacy" ON "connect_messages" USING btree ("legacy_message_id");--> statement-breakpoint
CREATE UNIQUE INDEX "connect_messages_nonce" ON "connect_messages" USING btree ("conversation_id","sender_id","client_nonce");--> statement-breakpoint
CREATE INDEX "connect_messages_page" ON "connect_messages" USING btree ("conversation_id","created_at","id");--> statement-breakpoint
CREATE INDEX "connect_participants_inbox" ON "connect_participants" USING btree ("member_id","status","archived");