ALTER TABLE "network_profiles" ADD COLUMN "founder" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "network_profiles" ADD COLUMN "stripe_customer_id" text;--> statement-breakpoint
ALTER TABLE "network_threads" ADD COLUMN "declined" boolean DEFAULT false NOT NULL;