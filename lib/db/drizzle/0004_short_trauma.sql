ALTER TABLE "network_profiles" ADD COLUMN "invite_code" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "network_profiles" ADD COLUMN "referred_by" integer;--> statement-breakpoint
ALTER TABLE "network_profiles" ADD CONSTRAINT "network_profiles_referred_by_ecosystem_members_id_fk" FOREIGN KEY ("referred_by") REFERENCES "public"."ecosystem_members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "network_profiles_referrer_idx" ON "network_profiles" USING btree ("referred_by");--> statement-breakpoint
ALTER TABLE "network_profiles" ADD CONSTRAINT "network_profiles_invite_code_unique" UNIQUE("invite_code");