/**
 * partners-data.ts — partner entity type, registry, and helpers.
 *
 * AUTHORIZATION GATE: authorizationOnFile must be true AND status must be
 * "active" before any entity is shown publicly. getVisiblePartners() is the
 * ONLY function the /partners page uses to read entities.
 *
 * LOGO / BANNER RULE: every logo or banner reference requires a real file.
 * Never render a broken <img> or a placeholder logo silhouette.
 *
 * VIDEO SLOTS: reserved; do NOT render at launch (requires future video
 * governance approval before any public display).
 *
 * ARTICLE SLUGS: reserved for News Hub v0 integration; empty at launch.
 *
 * EVENT SLUGS: reserved for Events module; empty at launch.
 *
 * CONTACT EMAIL: rendered ONLY when contactType === "direct-contact-authorized".
 *
 * AUTHORIZATION REFERENCE: internal reference string — NEVER rendered publicly.
 */

import {
  PARTNER_CATEGORY_SLUGS,
  SECTOR_SLUGS,
  PROGRAM_SLUGS,
  type PartnerCategorySlug,
} from "@workspace/shared/taxonomy";

// Re-export for consumers who need the slug type
export type { PartnerCategorySlug };

/** Safe URL validation — http(s) only, no javascript:/data:/malformed */
function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export interface PartnerEntity {
  /** URL-safe identifier */
  slug: string;
  /** Full display name */
  name: string;
  /** Category within the partner taxonomy */
  category: PartnerCategorySlug;
  /** Country of primary registration or operation */
  country: string;
  /** One-line description of the partner's role (optional) */
  role?: string;
  /**
   * HARD RENDER GATE.
   * Must be true before any public display. Written authorization must be on
   * file. getVisiblePartners() enforces this at the code level.
   */
  authorizationOnFile: boolean;
  /**
   * Internal authorization reference — NEVER rendered publicly.
   * E.g. "AUTH-2024-001" or a document identifier.
   */
  authorizationReference?: string;
  /** Dev label for the future logo file (PhotoSlot pattern) */
  logoSlot?: string;
  /** Dev label for the future banner file */
  bannerSlot?: string;
  /** Extended description of the partnership */
  description?: string;
  /** Services the partner offers within the ecosystem */
  services?: string[];
  /** Products the partner contributes to the ecosystem */
  products?: string[];
  /**
   * Public website URL. Validated: http(s) only, no javascript:/data:/
   * malformed. Rendered only when isSafeUrl passes.
   */
  website?: string;
  /** Program slugs — validated against PROGRAM_SLUGS */
  programSlugs?: string[];
  /** Sector slugs — validated against SECTOR_SLUGS */
  sectorSlugs?: string[];
  /**
   * Article slugs — reserved; empty at launch.
   * POPULATED WHEN NEWS HUB v0 LANDS (articleSlugs)
   */
  articleSlugs?: string[];
  /** Collaboration descriptions or partner names */
  collaborations?: string[];
  /** Gallery image slot labels (PhotoSlot pattern) */
  gallerySlots?: string[];
  /**
   * Video slot labels — DO NOT RENDER at launch.
   * Requires future video governance approval before any public display.
   */
  videoSlots?: string[];
  /**
   * Event slugs — reserved; empty at launch.
   * POPULATED WHEN EVENTS MODULE LANDS (eventSlugs)
   */
  eventSlugs?: string[];
  /** Lifecycle status */
  status: "active" | "historical" | "archived";
  /** SEO page title */
  seoTitle: string;
  /** SEO meta description — must be ≤160 chars */
  seoDescription: string;
  /** Contact pathway */
  contactType: "institutional-inquiry-only" | "direct-contact-authorized";
  /**
   * Direct contact email. Rendered ONLY when
   * contactType === "direct-contact-authorized".
   */
  contactEmail?: string;
}

// ---------------------------------------------------------------------------
// Registry — starts empty.
// Every entity added here MUST have authorizationOnFile: true and written
// authorization on file before any public display. The getVisiblePartners()
// helper enforces this at the code level for all public page rendering.
// ---------------------------------------------------------------------------
const PARTNERS: PartnerEntity[] = [];

// ---------------------------------------------------------------------------
// Validation helpers (used at development time / build time)
// ---------------------------------------------------------------------------

/** Assert that a partner entity's cross-references are coherent. */
export function validatePartnerEntity(entity: PartnerEntity): string[] {
  const errors: string[] = [];

  if (entity.programSlugs) {
    const validPrograms = new Set(PROGRAM_SLUGS as readonly string[]);
    entity.programSlugs.forEach((s) => {
      if (!validPrograms.has(s)) errors.push(`Unknown programSlug: "${s}"`);
    });
  }

  if (entity.sectorSlugs) {
    const validSectors = new Set(SECTOR_SLUGS as readonly string[]);
    entity.sectorSlugs.forEach((s) => {
      if (!validSectors.has(s)) errors.push(`Unknown sectorSlug: "${s}"`);
    });
  }

  if (entity.website && !isSafeUrl(entity.website)) {
    errors.push(`Unsafe website URL: "${entity.website}"`);
  }

  if (entity.seoDescription.length > 160) {
    errors.push(
      `seoDescription too long (${entity.seoDescription.length} chars, max 160)`,
    );
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Public helpers — these are the ONLY functions pages should call.
// ---------------------------------------------------------------------------

/**
 * Returns partners that have written authorization on file AND are active.
 * This is the ONLY function the /partners page uses to read entities —
 * it enforces the render gate at the code level.
 */
export function getVisiblePartners(): PartnerEntity[] {
  return PARTNERS.filter(
    (p) => p.authorizationOnFile === true && p.status === "active",
  );
}

/**
 * Returns a single visible partner by slug, or undefined.
 * Unknown slugs, unauthorized entities, and non-active entities all return
 * undefined — the caller cannot distinguish between "does not exist" and
 * "exists but not authorized". This prevents leaking unauthorized names.
 */
export function getPartnerBySlug(slug: string): PartnerEntity | undefined {
  return getVisiblePartners().find((p) => p.slug === slug);
}

/**
 * Returns visible partners filtered to a specific category.
 * Returns an empty array when no authorized active entity exists in that category.
 */
export function getVisiblePartnersByCategory(
  category: PartnerCategorySlug,
): PartnerEntity[] {
  return getVisiblePartners().filter((p) => p.category === category);
}

export { PARTNER_CATEGORY_SLUGS, isSafeUrl };
