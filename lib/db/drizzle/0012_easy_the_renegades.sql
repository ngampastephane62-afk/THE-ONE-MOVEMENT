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
ALTER TABLE "magazine_submissions" ADD CONSTRAINT "magazine_submissions_order_id_magazine_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."magazine_orders"("id") ON DELETE no action ON UPDATE no action;