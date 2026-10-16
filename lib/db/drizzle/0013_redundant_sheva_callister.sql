CREATE TABLE "magazine_reading_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"edition_id" text NOT NULL,
	"session_hash" text NOT NULL,
	"event_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "magazine_reading_event_unique" ON "magazine_reading_events" USING btree ("edition_id","session_hash","event_key");--> statement-breakpoint
CREATE INDEX "magazine_reading_edition_idx" ON "magazine_reading_events" USING btree ("edition_id","created_at");