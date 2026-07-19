/**
 * Shared taxonomy — machine-readable constants and derived TypeScript types.
 * No display copy, no marketing text, no JSX.
 * The backend validates against these constants; the frontend may import them
 * to eliminate duplicate slug arrays (see Part T narrow rule in spec).
 */

// ---------------------------------------------------------------------------
// Sector slugs — verified against artifacts/web/src/lib/sectors-data.ts
// ---------------------------------------------------------------------------
export const SECTOR_SLUGS = [
  "fashion",
  "music",
  "dance",
  "film",
  "art",
  "business",
  "investment",
  "tourism",
  "diplomacy",
  "innovation",
  "technology",
  "ngos",
  "media",
  "education",
  "humanitarian-action",
] as const;

export type SectorSlug = (typeof SECTOR_SLUGS)[number];

// ---------------------------------------------------------------------------
// Program slugs — verified against artifacts/web/src/lib/programs-data.ts
// ---------------------------------------------------------------------------
export const PROGRAM_SLUGS = [
  "diplomatic-gala",
  "summit",
  "fashion-week",
  "awards",
  "fashion-night",
  "investment-forum",
] as const;

export type ProgramSlug = (typeof PROGRAM_SLUGS)[number];

// ---------------------------------------------------------------------------
// Joinable audience groups
// ---------------------------------------------------------------------------
export const JOINABLE_GROUPS = [
  "creative-cultural",
  "business-innovation",
  "community-impact",
] as const;

export type JoinableGroup = (typeof JOINABLE_GROUPS)[number];

// ---------------------------------------------------------------------------
// Categories by group
// ---------------------------------------------------------------------------
export const CATEGORIES_BY_GROUP: Record<JoinableGroup, readonly string[]> = {
  "creative-cultural": [
    "designer",
    "model",
    "photographer",
    "videographer",
    "makeup-artist",
    "hair-stylist",
    "musician",
    "artist",
    "dancer",
    "filmmaker",
    "influencer",
  ],
  "business-innovation": [
    "entrepreneur",
    "startup",
    "company",
    "investor",
    "innovator",
    "technology-company",
  ],
  "community-impact": [
    "volunteer",
    "student",
    "humanitarian-organization",
  ],
};

// Flat set of all valid categories (for quick lookup)
export const ALL_CATEGORIES: ReadonlySet<string> = new Set(
  Object.values(CATEGORIES_BY_GROUP).flat(),
);

// ---------------------------------------------------------------------------
// Organization types (institutional inquiry)
// ---------------------------------------------------------------------------
export const ORGANIZATION_TYPES = [
  "embassy",
  "government",
  "international-organization",
  "university",
  "ngo",
  "sponsor",
  "partner",
  "media-organization",
] as const;

export type OrganizationType = (typeof ORGANIZATION_TYPES)[number];

// ---------------------------------------------------------------------------
// Consent version
// ---------------------------------------------------------------------------
export const CONSENT_VERSION = "join-stage1-v1" as const;

// ---------------------------------------------------------------------------
// Joining-as enum
// ---------------------------------------------------------------------------
export const JOINING_AS_VALUES = ["individual", "organization"] as const;
export type JoiningAs = (typeof JOINING_AS_VALUES)[number];

// ---------------------------------------------------------------------------
// Partner category slugs
// ---------------------------------------------------------------------------
export const PARTNER_CATEGORY_SLUGS = [
  "sponsors",
  "partners",
  "institutions",
  "companies",
  "ngos",
  "universities",
  "governments",
  "ambassadors",
  "strategic-supporters",
] as const;

export type PartnerCategorySlug = (typeof PARTNER_CATEGORY_SLUGS)[number];

// ---------------------------------------------------------------------------
// News category slugs
// ---------------------------------------------------------------------------
export const NEWS_CATEGORY_SLUGS = [
  "announcement",
  "program-news",
  "partner-news",
  "humanitarian",
  "event-report",
  "interview",
  "press-release",
  "editorial",
  "community-story",
  "founder-article",
] as const;

export type NewsCategorySlug = (typeof NEWS_CATEGORY_SLUGS)[number];

// ---------------------------------------------------------------------------
// News author types
// ---------------------------------------------------------------------------
export const NEWS_AUTHOR_TYPES = [
  "tomi",
  "founder",
  "program",
  "partner",
  "sponsor",
  "institution",
  "ngo",
  "government",
  "university",
  "ambassador",
  "media-partner",
  "community",
] as const;

export type NewsAuthorType = (typeof NEWS_AUTHOR_TYPES)[number];

// ---------------------------------------------------------------------------
// Editorial statuses
// ---------------------------------------------------------------------------
export const EDITORIAL_STATUSES = [
  "draft",
  "pending-review",
  "approved",
  "published",
  "archived",
] as const;

export type EditorialStatus = (typeof EDITORIAL_STATUSES)[number];

/**
 * The single editorial status that gates public rendering.
 * Used by getPublishedArticles() — never re-typed elsewhere.
 */
export const PUBLIC_EDITORIAL_STATUS = "published" as const;

// ---------------------------------------------------------------------------
// Helper sets for O(1) validation
// ---------------------------------------------------------------------------
export const SECTOR_SLUG_SET: ReadonlySet<string> = new Set(SECTOR_SLUGS);
export const PROGRAM_SLUG_SET: ReadonlySet<string> = new Set(PROGRAM_SLUGS);
export const JOINABLE_GROUP_SET: ReadonlySet<string> = new Set(JOINABLE_GROUPS);
export const ORGANIZATION_TYPE_SET: ReadonlySet<string> = new Set(ORGANIZATION_TYPES);
export const JOINING_AS_SET: ReadonlySet<string> = new Set(JOINING_AS_VALUES);
export const PARTNER_CATEGORY_SET: ReadonlySet<string> = new Set(PARTNER_CATEGORY_SLUGS);
export const NEWS_CATEGORY_SET: ReadonlySet<string> = new Set(NEWS_CATEGORY_SLUGS);
export const NEWS_AUTHOR_TYPE_SET: ReadonlySet<string> = new Set(NEWS_AUTHOR_TYPES);
export const EDITORIAL_STATUS_SET: ReadonlySet<string> = new Set(EDITORIAL_STATUSES);
