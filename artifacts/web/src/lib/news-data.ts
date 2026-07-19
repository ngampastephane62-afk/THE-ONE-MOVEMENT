/**
 * news-data.ts — news article type, structured body blocks, registry, and helpers.
 *
 * EDITORIAL RENDER GATE: editorialStatus must equal PUBLIC_EDITORIAL_STATUS
 * ("published") before any article is shown publicly. getPublishedArticles() is
 * the ONLY function pages use to read articles — it enforces this gate at the
 * code level.
 *
 * HERO MEDIA SLOT: heroMediaSlot is a dev label (PhotoSlot pattern). Never a
 * real image path. At launch every heroMediaSlot will trigger PhotoSlot's
 * elegant lagoon-800 fallback, which is the correct and intentional behaviour.
 *
 * REPUBLISHED / THIRD-PARTY ARTICLES (sourceUrl present):
 * Do NOT reproduce the full original body unless licensing explicitly grants
 * republishing rights AND an editor has approved that specific piece for full
 * republishing. Default: render whatever body blocks exist (editor-written
 * summary paragraphs), then render a prominent attribution block linking back
 * to sourceUrl. This is enforced by CONVENTION and RENDER PATTERN in the
 * detail page renderer, not by field validation. Documented here as the
 * authoritative editorial rule.
 *
 * LICENSING / CONSENT REFERENCES: internal strings — NEVER rendered publicly.
 *
 * ROBOTS / INDEXING: Published articles use default robots indexing (no
 * noindex). Non-published articles never reach the detail page (redirect to
 * /news on resolution failure), so no noindex belt-and-suspenders is needed.
 *
 * isSafeUrl() is intentionally duplicated from partners-data.ts rather than
 * shared, to keep the two data modules independent. Marked as a Phase 2
 * refactor target (extract to a shared lib/utils helper).
 *
 * EMBED BLOCKS: The "embed" block type is present in the type system but is
 * DISABLED at launch. The renderer returns a "video governance pending"
 * placeholder card — no iframe, no external fetch, no hotlinking.
 *
 * NO raw HTML. NO dangerouslySetInnerHTML anywhere in this module or its
 * rendering surface. All string content is rendered as text.
 */

import {
  PROGRAM_SLUGS,
  SECTOR_SLUGS,
  PUBLIC_EDITORIAL_STATUS,
  type NewsCategorySlug,
  type NewsAuthorType,
  type EditorialStatus,
} from "@workspace/shared/taxonomy";

// Re-export for consumers
export type { NewsCategorySlug, NewsAuthorType, EditorialStatus };
export { PUBLIC_EDITORIAL_STATUS };

// ---------------------------------------------------------------------------
// isSafeUrl — intentional duplication from partners-data.ts (Phase 2 target)
// ---------------------------------------------------------------------------

/** Safe URL validation — http(s) only, no javascript:/data:/malformed */
export function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Structured body block types
// ---------------------------------------------------------------------------

export type ParagraphBlock = {
  type: "paragraph";
  /** Plain text — rendered as-is, no HTML injection */
  content: string;
};

export type HeadingBlock = {
  type: "heading";
  level: 2 | 3;
  /** Plain text — rendered as-is */
  content: string;
};

export type QuoteBlock = {
  type: "quote";
  /** Plain text — rendered as a blockquote */
  content: string;
  attribution?: string;
};

export type ListBlock = {
  type: "list";
  ordered: boolean;
  /** Plain text items */
  items: string[];
};

export type ImageBlock = {
  type: "image";
  /** Accessibility alt text */
  altText: string;
  /**
   * Dev label for future image file (PhotoSlot pattern).
   * No real image loaded at launch — renders as PhotoSlot fallback.
   */
  mediaSlot: string;
  caption?: string;
};

export type EmbedBlock = {
  type: "embed";
  /**
   * RESERVED — disabled at launch. Renderer shows a "video governance pending"
   * placeholder card. No iframe, no external fetch, no hotlinking.
   */
  provider: "youtube";
  refId: string;
};

export type BodyBlock =
  | ParagraphBlock
  | HeadingBlock
  | QuoteBlock
  | ListBlock
  | ImageBlock
  | EmbedBlock;

// ---------------------------------------------------------------------------
// Article type
// ---------------------------------------------------------------------------

export interface NewsArticle {
  /** URL-safe unique identifier */
  slug: string;
  /** Article title */
  title: string;
  /** Optional subtitle (sans-serif, below title in hero) */
  subtitle?: string;
  /** Editorial category */
  category: NewsCategorySlug;
  /** Author classification */
  authorType: NewsAuthorType;
  /** Display name for the byline */
  authorDisplayName: string;
  /**
   * Optional link to a future partners-data entry.
   * If set and no matching PartnerEntity exists yet, byline still renders
   * using authorDisplayName only — no error, no broken link.
   */
  authorEntitySlug?: string;
  /** ISO date string — used for sorting and byline display */
  publishedAt: string;
  /** ISO date string — rendered as "Updated [date]" when present */
  updatedAt?: string;
  /**
   * Dev label for the hero image (PhotoSlot pattern).
   * NEVER a real image path — PhotoSlot elegant fallback is the
   * correct launch behaviour.
   */
  heroMediaSlot?: string;
  /** Article excerpt — ≤200 chars */
  excerpt: string;
  /** Structured content body — see BLOCK TYPES above */
  body: BodyBlock[];
  /** Program slugs — validated against PROGRAM_SLUGS */
  programSlugs?: string[];
  /** Sector slugs — validated against SECTOR_SLUGS */
  sectorSlugs?: string[];
  /**
   * Explicit editorial cross-links to related articles.
   * Never algorithmic — must be deliberate editorial choices.
   */
  relatedArticleSlugs?: string[];
  /** SEO page title */
  seoTitle: string;
  /** SEO meta description — must be ≤160 chars */
  seoDescription: string;
  /**
   * HARD RENDER GATE. Must equal PUBLIC_EDITORIAL_STATUS ("published")
   * before the article appears on any public page. getPublishedArticles()
   * enforces this at the code level.
   */
  editorialStatus: EditorialStatus;
  /**
   * Source URL for republished third-party pieces.
   * Must pass isSafeUrl() (http(s) only). When present, the renderer shows
   * an attribution block linking back to sourceUrl, sourced from the URL
   * domain — never invented. See BODY RULE in file header.
   */
  sourceUrl?: string;
  /**
   * Internal republishing rights reference — NEVER rendered publicly.
   */
  licensing?: string;
  /**
   * Internal consent reference for named individuals — NEVER rendered publicly.
   */
  consentReferences?: string;
}

// ---------------------------------------------------------------------------
// Validation helpers (dev-time / build-time)
// ---------------------------------------------------------------------------

export function validateNewsArticle(article: NewsArticle): string[] {
  const errors: string[] = [];

  if (article.excerpt.length > 200) {
    errors.push(
      `excerpt too long (${article.excerpt.length} chars, max 200)`,
    );
  }
  if (article.seoDescription.length > 160) {
    errors.push(
      `seoDescription too long (${article.seoDescription.length} chars, max 160)`,
    );
  }
  if (article.sourceUrl && !isSafeUrl(article.sourceUrl)) {
    errors.push(`Unsafe sourceUrl: "${article.sourceUrl}"`);
  }

  const validPrograms = new Set(PROGRAM_SLUGS as readonly string[]);
  (article.programSlugs ?? []).forEach((s) => {
    if (!validPrograms.has(s)) errors.push(`Unknown programSlug: "${s}"`);
  });

  const validSectors = new Set(SECTOR_SLUGS as readonly string[]);
  (article.sectorSlugs ?? []).forEach((s) => {
    if (!validSectors.has(s)) errors.push(`Unknown sectorSlug: "${s}"`);
  });

  return errors;
}

// ---------------------------------------------------------------------------
// Registry — starts empty.
// Every article added here MUST have editorialStatus: "published" AND written
// editorial approval before any public display. getPublishedArticles() enforces
// this at the code level for all public page rendering.
// ---------------------------------------------------------------------------
const NEWS_ARTICLES: NewsArticle[] = [];

// ---------------------------------------------------------------------------
// Public helpers — these are the ONLY functions pages should call.
// ---------------------------------------------------------------------------

/**
 * Returns articles with editorialStatus === "published", sorted by
 * publishedAt DESC (most recent first).
 * This is the ONLY function the /news page uses to read articles — it enforces
 * the editorial render gate at the code level.
 */
export function getPublishedArticles(): NewsArticle[] {
  return NEWS_ARTICLES.filter(
    (a) => a.editorialStatus === PUBLIC_EDITORIAL_STATUS,
  ).sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

/**
 * Returns a single published article by slug, or undefined.
 * Unknown slugs, draft articles, archived articles, and any non-published state
 * all return undefined — the caller cannot distinguish between "does not exist"
 * and "exists but not published". This prevents leaking unpublished content.
 */
export function getPublishedArticleBySlug(
  slug: string,
): NewsArticle | undefined {
  return getPublishedArticles().find((a) => a.slug === slug);
}

/**
 * Returns published articles filtered to a specific category, sorted by
 * publishedAt DESC.
 */
export function getPublishedArticlesByCategory(
  category: NewsCategorySlug,
): NewsArticle[] {
  return getPublishedArticles().filter((a) => a.category === category);
}

/**
 * Resolves article.relatedArticleSlugs to published articles, preserving
 * editorial order, capped at 3.
 * Returns an empty array when no related slugs resolve to published articles.
 */
export function getRelatedPublishedArticles(
  article: NewsArticle,
): NewsArticle[] {
  if (!article.relatedArticleSlugs || article.relatedArticleSlugs.length === 0)
    return [];
  const published = getPublishedArticles();
  const bySlug = new Map(published.map((a) => [a.slug, a]));
  return article.relatedArticleSlugs
    .map((s) => bySlug.get(s))
    .filter((a): a is NewsArticle => a !== undefined)
    .slice(0, 3);
}
