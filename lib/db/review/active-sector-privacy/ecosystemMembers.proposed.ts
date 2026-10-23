// Review only: no runtime import until the migration is separately authorized.
import { sql } from "drizzle-orm";
import { boolean, check, integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const ecosystemMembersTable = pgTable("ecosystem_members", {
  id: serial("id").primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  accountType: text("account_type").$type<"individual" | "organization">(),
  cityRegion: varchar("city_region", { length: 120 }),
  organizationType: varchar("organization_type", { length: 100 }),
  contactName: varchar("contact_name", { length: 100 }),
  mainSector: text("main_sector"),
  activeSectors: text("active_sectors").array(),
  locationVisibility: text("location_visibility").$type<"hidden" | "country" | "country_city">().notNull().default("hidden"),
  otherProfessionalActivity: varchar("other_professional_activity", { length: 300 }),
  fullName: text("full_name").notNull(),
  profession: text("profession").notNull(),
  organization: text("organization").notNull().default(""),
  country: text("country").notNull().default(""),
  bio: text("bio").notNull().default(""),
  offering: text("offering").notNull().default(""),
  lookingFor: text("looking_for").notNull().default(""),
  website: text("website").notNull().default(""),
  instagramUrl: text("instagram_url").notNull().default(""),
  facebookUrl: text("facebook_url").notNull().default(""),
  tiktokUrl: text("tiktok_url").notNull().default(""),
  linkedinUrl: text("linkedin_url").notNull().default(""),
  sectors: text("sectors").array().notNull().default([]),
  savedItems: text("saved_items").array().notNull().default([]),
  isPublic: boolean("is_public").notNull().default(false),
  publicMedia: boolean("public_media").notNull().default(false),
  profileLayout: text("profile_layout").$type<"immersive" | "centered" | "editorial">().notNull().default("immersive"),
  coverPosition: integer("cover_position").notNull().default(50),
  postsLayout: text("posts_layout").$type<"grid" | "list">().notNull().default("grid"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  check("ecosystem_members_account_type_check", sql`${table.accountType} IS NULL OR ${table.accountType} IN ('individual', 'organization')`),
  check("ecosystem_members_main_sector_check", sql`${table.mainSector} IS NULL OR ${table.mainSector} IN ('fashion', 'music', 'dance', 'film', 'art', 'business', 'investment', 'tourism', 'diplomacy', 'innovation', 'technology', 'ngos', 'media', 'education', 'real-estate', 'health-care', 'humanitarian-action')`),
  check("ecosystem_members_location_visibility_check", sql`${table.locationVisibility} IN ('hidden', 'country', 'country_city')`),
  check("ecosystem_members_active_sectors_check", sql`${table.activeSectors} IS NULL OR (
    cardinality(${table.activeSectors}) BETWEEN 1 AND 3
    AND array_ndims(${table.activeSectors}) = 1
    AND array_lower(${table.activeSectors}, 1) = 1
    AND array_position(${table.activeSectors}, NULL) IS NULL
    AND ${table.activeSectors} <@ ARRAY['fashion', 'music', 'dance', 'film', 'art', 'business', 'investment', 'tourism', 'diplomacy', 'innovation', 'technology', 'ngos', 'media', 'education', 'real-estate', 'health-care', 'humanitarian-action']::text[]
    AND (cardinality(${table.activeSectors}) < 2 OR ${table.activeSectors}[1] <> ${table.activeSectors}[2])
    AND (cardinality(${table.activeSectors}) < 3 OR (${table.activeSectors}[1] <> ${table.activeSectors}[3] AND ${table.activeSectors}[2] <> ${table.activeSectors}[3]))
    AND ${table.mainSector} IS NOT NULL
    AND ${table.mainSector} = ANY(${table.activeSectors})
  )`),
]);
