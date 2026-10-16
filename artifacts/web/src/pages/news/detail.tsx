/**
 * news/detail.tsx — Article detail route for /news/:slug
 *
 * RENDER GATE: getPublishedArticleBySlug() returns undefined for unknown slugs,
 * draft articles, archived articles, and any other non-published state. When
 * undefined, this page redirects cleanly to /news with no 404, no error
 * surface, and no leakage of the fact that an unpublished slug exists.
 *
 * ROBOTS: Published articles use default indexing (no noindex needed). Non-
 * published articles never reach this renderer — the redirect happens before
 * any head tags are rendered — so no belt-and-suspenders noindex is required.
 *
 * CATEGORY TAG DEEP-LINK: /news?category=[slug] links are Phase 2 behaviour
 * (the index page filter is React state, not URL-driven at launch). At launch
 * these chips navigate to /news and the filter resets, which is intentional
 * and documented here as a Phase 2 follow-up.
 *
 * CORRECTION NOTICE SLOT: RESERVED.
 * POPULATED WHEN A CORRECTION IS ISSUED — renders above the body when
 * article.corrections is present. Do NOT add a corrections field to NewsArticle
 * in this task — that belongs to a later editorial-workflow task.
 *
 * EMBED BLOCKS: The "embed" block type renders a "video governance pending"
 * placeholder card only — no iframe, no external fetch, no hotlinking.
 *
 * NO raw HTML. NO dangerouslySetInnerHTML. All block content is rendered as
 * plain text.
 */

import { useEffect } from 'react';
import BrandPhotoActions from '@/components/editorial/BrandPhotoActions';
import { useParams, useLocation, Link } from 'wouter';
import { Helmet } from 'react-helmet-async';
import HeroSurface from '@/components/HeroSurface';
import GoldThread from '@/components/GoldThread';
import PhotoSlot from '@/components/PhotoSlot';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  getPublishedArticleBySlug,
  getRelatedPublishedArticles,
  isSafeUrl,
  type NewsArticle,
  type BodyBlock,
} from '@/lib/news-data';
import { getProgramBySlug } from '@/lib/programs-data';

/* ── Helpers ────────────────────────────────────────────────────────────────── */

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

const AUTHOR_TYPE_LABELS: Record<string, string> = {
  tomi: 'The One Movement International',
  founder: 'Founder',
  program: 'Program Team',
  partner: 'Partner',
  sponsor: 'Sponsor',
  institution: 'Institution',
  ngo: 'NGO',
  government: 'Government',
  university: 'University',
  ambassador: 'Ambassador',
  'media-partner': 'Media Partner',
  community: 'Community',
};

const CATEGORY_LABELS: Record<string, string> = {
  announcement: 'Announcement',
  'program-news': 'Program News',
  'partner-news': 'Partner News',
  humanitarian: 'Humanitarian',
  'event-report': 'Event Report',
  interview: 'Interview',
  'press-release': 'Press Release',
  editorial: 'Editorial',
  'community-story': 'Community Story',
  'founder-article': 'Founder Article',
};

/** Extract the domain from a safe URL for attribution display */
function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/* ── Block renderer ─────────────────────────────────────────────────────────── */

/**
 * Renders a single body block. All string content is rendered as text —
 * no dangerouslySetInnerHTML, no raw HTML injection.
 */
function BlockRenderer({ block }: { block: BodyBlock }) {
  switch (block.type) {
    case 'paragraph':
      return (
        <p className="text-lagoon-800 text-lg leading-relaxed">{block.content}</p>
      );

    case 'heading':
      if (block.level === 2) {
        return (
          <h2
            className="text-2xl text-lagoon-900 uppercase tracking-wide mt-10 mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {block.content}
          </h2>
        );
      }
      return (
        <h3
          className="text-xl text-lagoon-900 uppercase tracking-wide mt-8 mb-3"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {block.content}
        </h3>
      );

    case 'quote':
      return (
        <figure className="border-l-2 border-gold-500 pl-6 my-8">
          <blockquote className="text-xl text-lagoon-700 italic leading-relaxed">
            {block.content}
          </blockquote>
          {block.attribution && (
            <figcaption className="mt-3 text-sm text-lagoon-500 not-italic">
              — {block.attribution}
            </figcaption>
          )}
        </figure>
      );

    case 'list':
      if (block.ordered) {
        return (
          <ol className="list-decimal list-inside space-y-2 text-lagoon-800 text-lg leading-relaxed">
            {block.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ol>
        );
      }
      return (
        <ul className="space-y-2 text-lagoon-800 text-lg leading-relaxed">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span
                className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-gold-500"
                aria-hidden="true"
              />
              {item}
            </li>
          ))}
        </ul>
      );

    case 'image':
      return (
        <figure className="my-8">
          {/* PhotoSlot elegant lagoon-800 fallback at launch (no real images) */}
          <PhotoSlot
            filename={block.mediaSlot}
            alt={block.altText}
            className="w-full h-64 sm:h-80"
            variant="sharp"
            duotone
          />
          {block.caption && (
            <figcaption className="mt-3 text-sm text-lagoon-500 text-center italic">
              {block.caption}
            </figcaption>
          )}
          <BrandPhotoActions filename={block.mediaSlot} title={block.caption || block.altText} />
        </figure>
      );

    case 'embed':
      // RESERVED — video governance pending. No iframe, no external fetch.
      return (
        <div
          className="my-8 rounded-sm border border-gold-500/20 px-6 py-8 text-center"
          style={{ backgroundColor: 'hsl(187 67% 10%)' }}
          role="status"
          aria-label="Video content pending"
        >
          <p className="text-sm text-ivory-400 uppercase tracking-widest">
            Video content
          </p>
          <p className="mt-2 text-xs text-ivory-500">
            Video publishing requires governance approval. This content will
            appear here when the video governance framework is in place.
          </p>
        </div>
      );
  }
}

/* ── Article renderer ────────────────────────────────────────────────────────── */

function ArticleRenderer({ article }: { article: NewsArticle }) {
  const safeSourceUrl =
    article.sourceUrl && isSafeUrl(article.sourceUrl)
      ? article.sourceUrl
      : undefined;

  const resolvedPrograms = (article.programSlugs ?? [])
    .map((s) => getProgramBySlug(s))
    .filter(Boolean) as NonNullable<ReturnType<typeof getProgramBySlug>>[];

  const relatedArticles = getRelatedPublishedArticles(article);

  const pageTitle = article.seoTitle || `${article.title} — THE ONE MOVEMENT INTERNATIONAL`;

  return (
    <div>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={article.seoDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={article.seoDescription} />
        {/* FILLED AT DEPLOY WITH PRODUCTION DOMAIN */}
        <link rel="canonical" href={`/news/${article.slug}`} />
      </Helmet>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <HeroSurface glowOrigin="bottom-center" minHeight="65vh">
        <div className="mx-auto w-full max-w-4xl px-6 py-section-lg">
          {/* Category badge */}
          <p className="text-eyebrow text-gold-400 mb-4 uppercase">
            {CATEGORY_LABELS[article.category] ?? article.category}
          </p>
          {/* Title */}
          <h1
            className="text-display-xl text-ivory-100 uppercase animate-fade-up"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {article.title}
          </h1>
          {/* Subtitle */}
          {article.subtitle && (
            <p className="mt-4 text-xl text-ivory-300 leading-relaxed">
              {article.subtitle}
            </p>
          )}
          <GoldThread className="mt-8" length="180px" node />
          {/* Byline */}
          <p className="mt-6 text-sm text-ivory-400">
            {article.authorDisplayName}
            {' · '}
            {AUTHOR_TYPE_LABELS[article.authorType] ?? article.authorType}
            {' · '}
            {formatDate(article.publishedAt)}
            {article.updatedAt && (
              <span className="ml-3 text-ivory-500">
                · Updated {formatDate(article.updatedAt)}
              </span>
            )}
          </p>
        </div>
      </HeroSurface>

      {/* ── HERO MEDIA (if slot present) ────────────────────────────────── */}
      {article.heroMediaSlot && (
        <div style={{ backgroundColor: 'hsl(187 67% 8%)' }}>
          <div className="mx-auto max-w-4xl px-6 pb-12">
            <PhotoSlot
              filename={article.heroMediaSlot}
              alt={`${article.title} — hero image`}
              className="w-full h-72 sm:h-96"
              variant="sharp"
              duotone
            />
            <BrandPhotoActions filename={article.heroMediaSlot} title={article.title} tone="dark" />
          </div>
        </div>
      )}

      {/* ── BODY ─────────────────────────────────────────────────────────── */}
      <article
        className="w-full py-section-lg"
        style={{ backgroundColor: 'hsl(60 9% 97%)' }}
      >
        <div className="mx-auto max-w-4xl px-6">
          {/*
           * CORRECTION NOTICE SLOT — RESERVED.
           * POPULATED WHEN A CORRECTION IS ISSUED — renders above the body when
           * article.corrections is present. Do NOT add corrections field yet.
           */}

          {/* Body blocks */}
          <div className="space-y-6">
            {article.body.map((block, i) => (
              <BlockRenderer key={i} block={block} />
            ))}
          </div>

          {/* Republished attribution block (sourceUrl present) */}
          {safeSourceUrl && (
            <div
              className="mt-10 rounded-sm border border-gold-500/25 p-5"
              style={{ backgroundColor: 'hsl(187 67% 97%)' }}
            >
              <p className="text-sm text-lagoon-700">
                Originally published at{' '}
                <strong>{extractDomain(safeSourceUrl)}</strong> —{' '}
                <a
                  href={safeSourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'underline underline-offset-2 text-lagoon-600 hover:text-lagoon-800',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400 focus-visible:outline-offset-2',
                  )}
                >
                  Read the original article
                </a>
              </p>
            </div>
          )}

          {/* Tags block */}
          {(article.programSlugs?.length || article.sectorSlugs?.length || true) && (
            <div className="mt-12 pt-8 border-t border-lagoon-200">
              <div className="flex flex-wrap gap-3 items-center">
                {/* Category chip — links to /news (Phase 2: ?category=[slug]) */}
                <Link
                  href="/news"
                  className={cn(
                    'inline-flex items-center rounded-sm border border-lagoon-700/30 px-3 py-1.5 text-xs text-lagoon-700 uppercase tracking-wide',
                    'hover:border-lagoon-700/60 hover:text-lagoon-900 transition-colors',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400 focus-visible:outline-offset-2',
                  )}
                  title="Category filter — deep-link coming in Phase 2"
                >
                  {CATEGORY_LABELS[article.category] ?? article.category}
                </Link>

                {/* Program chips */}
                {resolvedPrograms.map((program) => (
                  <Link
                    key={program.slug}
                    href={`/programs/${program.slug}`}
                    className={cn(
                      'inline-flex items-center rounded-sm border border-gold-500/35 px-3 py-1.5 text-xs text-lagoon-700 uppercase tracking-wide',
                      'hover:border-gold-500/65 hover:text-lagoon-900 transition-colors',
                      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400 focus-visible:outline-offset-2',
                    )}
                  >
                    {program.name}
                  </Link>
                ))}

                {/* Sector chips — link to /ecosystem */}
                {(article.sectorSlugs ?? []).map((s) => (
                  <Link
                    key={s}
                    href="/ecosystem"
                    className={cn(
                      'inline-flex items-center rounded-sm border border-lagoon-600/25 px-3 py-1.5 text-xs text-lagoon-600 uppercase tracking-wide',
                      'hover:border-lagoon-600/50 hover:text-lagoon-800 transition-colors',
                      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400 focus-visible:outline-offset-2',
                    )}
                  >
                    {s.replace(/-/g, ' ')}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Editorial policy footer link — deep-links to section 4 on /news */}
          <div className="mt-8">
            <Link
              href="/news#editorial-policy"
              className={cn(
                'text-xs text-lagoon-500 hover:text-lagoon-700 underline underline-offset-2 transition-colors',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400 focus-visible:outline-offset-2',
              )}
            >
              Read our editorial policy
            </Link>
          </div>
        </div>
      </article>

      {/* ── RELATED ARTICLES — only when at least one resolves ──────────── */}
      {relatedArticles.length > 0 && (
        <section
          className="w-full py-section-lg"
          style={{ backgroundColor: 'hsl(187 67% 8%)' }}
        >
          <div className="mx-auto max-w-4xl px-6">
            <p
              className="text-eyebrow text-gold-400 mb-6"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              RELATED ARTICLES
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {relatedArticles.map((related) => (
                <li key={related.slug}>
                  <Link
                    href={`/news/${related.slug}`}
                    className={cn(
                      'block rounded-sm border border-gold-500/15 bg-lagoon-800/30 p-5',
                      'hover:border-gold-500/35 hover:bg-lagoon-800/50 transition-colors',
                      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400 focus-visible:outline-offset-2',
                    )}
                  >
                    <span className="text-xs text-gold-400 uppercase tracking-widest">
                      {CATEGORY_LABELS[related.category] ?? related.category}
                    </span>
                    <p
                      className="mt-2 text-sm text-ivory-100 uppercase leading-snug"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {related.title}
                    </p>
                    <p className="mt-2 text-xs text-ivory-500">
                      {formatDate(related.publishedAt)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────────── */

export default function NewsDetail() {
  const params = useParams<{ slug: string }>();
  const [, navigate] = useLocation();
  const article = getPublishedArticleBySlug(params.slug ?? '');

  useEffect(() => {
    // Unknown slug, non-published, or any resolution failure → redirect cleanly.
    // No 404, no error surface, no leakage of unpublished content.
    if (!article) navigate('/news', { replace: true });
  }, [article, navigate]);

  if (!article) return null;

  return <ArticleRenderer article={article} />;
}
