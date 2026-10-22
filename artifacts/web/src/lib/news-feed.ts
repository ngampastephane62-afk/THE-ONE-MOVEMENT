import type { NewsPublicArticle, NewsSnapshotCategory } from '@workspace/api-client-react';

/**
 * Pure ordering + grouping for the live News page.
 * Latest = CMS publication timestamp (publishedAt), never snapshot.publicationDate
 * or any event date. Each CMS story is placed in exactly one group.
 */
export const ANNOUNCEMENT_CATEGORIES: NewsSnapshotCategory[] = ['official-announcement', 'partnership-announcement', 'press-release'];
export const PROGRAMME_CATEGORIES: NewsSnapshotCategory[] = ['event-announcement', 'opportunity', 'humanitarian-update', 'ecosystem-update'];
export const FEATURED_LIMIT = 3;

const ts = (a: NewsPublicArticle) => {
  const t = Date.parse(a.publishedAt);
  return Number.isNaN(t) ? -Infinity : t;
};

/** Newest publication first; ties broken by higher id (mirrors the API order). */
export function sortByPublishedAt(items: readonly NewsPublicArticle[]): NewsPublicArticle[] {
  return [...items].sort((a, b) => ts(b) - ts(a) || b.id - a.id);
}

export const hasVideo = (a: NewsPublicArticle) => a.snapshot.video != null || a.snapshot.category === 'video-news';

export interface NewsGroups {
  hero: NewsPublicArticle | null;
  featured: NewsPublicArticle[];
  feed: NewsPublicArticle[];
  motion: NewsPublicArticle[];
  programmes: NewsPublicArticle[];
}

/**
 * @param latestPage  page 1 of the public API (source of the hero, always)
 * @param currentPage items of the page being browsed (same as latestPage on page 1)
 */
export function groupNews(latestPage: readonly NewsPublicArticle[], currentPage: readonly NewsPublicArticle[] = latestPage): NewsGroups {
  const hero = sortByPublishedAt(latestPage)[0] ?? null;
  const seen = new Set<number>(hero ? [hero.id] : []);
  const out: NewsGroups = { hero, featured: [], feed: [], motion: [], programmes: [] };
  for (const a of sortByPublishedAt(currentPage)) {
    if (seen.has(a.id)) continue;
    seen.add(a.id);
    const c = a.snapshot.category;
    if (ANNOUNCEMENT_CATEGORIES.includes(c) && out.featured.length < FEATURED_LIMIT) out.featured.push(a);
    else if (hasVideo(a)) out.motion.push(a);
    else if (PROGRAMME_CATEGORIES.includes(c) || a.snapshot.relatedProgrammeSlug) out.programmes.push(a);
    else out.feed.push(a);
  }
  return out;
}

/** Short introduction: subtitle, else SEO description, else first paragraph. Never invented. */
export function storyIntro(a: NewsPublicArticle): string | null {
  const s = a.snapshot;
  if (s.subtitle) return s.subtitle;
  if (s.seoDescription) return s.seoDescription;
  const p = s.body.find((b) => b.type === 'paragraph' && b.text.trim());
  if (p && p.type === 'paragraph') return p.text.length > 240 ? `${p.text.slice(0, 237).trimEnd()}…` : p.text;
  return null;
}
