import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import HeroSurface from '@/components/HeroSurface';
import GoldThread from '@/components/GoldThread';
import SectionHeading from '@/components/SectionHeading';
import PhotoSlot from '@/components/PhotoSlot';
import ArchivePhoto from '@/components/ArchivePhoto';
import StatusNotice from '@/components/StatusNotice';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  getPublishedArticles,
  getPublishedArticlesByCategory,
  type NewsCategorySlug,
} from '@/lib/news-data';
import { NEWS_CATEGORY_SLUGS } from '@workspace/shared/taxonomy';

/* ── Helpers ────────────────────────────────────────────────────────────────── */

/** Format ISO date string as "DD Month YYYY" */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Human-readable label for author type */
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

/** Human-readable label for news category slug */
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

/* ── Page ────────────────────────────────────────────────────────────────────── */

export default function News() {
  const [activeCategory, setActiveCategory] = useState<NewsCategorySlug | null>(
    null,
  );

  const publishedArticles = getPublishedArticles();

  // Only show chips for categories that have ≥1 published article
  const populatedCategories = (
    NEWS_CATEGORY_SLUGS as readonly NewsCategorySlug[]
  ).filter(
    (slug) => getPublishedArticlesByCategory(slug).length > 0,
  );

  const displayedArticles =
    activeCategory !== null
      ? getPublishedArticlesByCategory(activeCategory)
      : publishedArticles;

  return (
    <div>
      <Helmet>
        <title>NEWS &amp; PUBLICATIONS — THE ONE MOVEMENT INTERNATIONAL</title>
        <meta
          name="description"
          content="Official announcements, stories, interviews and reports from The One Movement International — its programs, partners and community."
        />
        <meta
          property="og:title"
          content="NEWS & PUBLICATIONS — THE ONE MOVEMENT INTERNATIONAL"
        />
        <meta
          property="og:description"
          content="Official announcements, stories, interviews and reports from The One Movement International — its programs, partners and community."
        />
        {/* FILLED AT DEPLOY WITH PRODUCTION DOMAIN */}
        <link rel="canonical" href="/news" />
      </Helmet>

      {/* ─────────────────────────────────────────────────────────────────────
          1. HERO — HeroSurface lagoon radiant
          ───────────────────────────────────────────────────────────────────── */}
      <HeroSurface glowOrigin="bottom-center" minHeight="70vh">
        <div className="mx-auto w-full max-w-7xl px-6 py-section-lg">
          <p className="text-eyebrow text-gold-400 mb-6 animate-fade-in">
            THE VOICE OF THE MOVEMENT
          </p>
          <h1
            className="text-display-xl text-ivory-100 uppercase animate-fade-up"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            OFFICIAL NEWS &amp; PUBLICATIONS.
          </h1>
          <GoldThread className="mt-8" length="200px" node />
          <p
            className="mt-6 text-ivory-200 text-lg leading-relaxed max-w-2xl animate-fade-in"
            style={{ animationDelay: '0.15s' }}
          >
            Announcements, stories, interviews and reports from The One Movement
            International — its programs, its partners, and the community it
            connects.
          </p>
        </div>
      </HeroSurface>

      {/* ─────────────────────────────────────────────────────────────────────
          2. EDITORIAL MISSION — ivory
          ───────────────────────────────────────────────────────────────────── */}
      <section
        className="w-full py-section-lg"
        style={{ backgroundColor: 'hsl(60 9% 97%)' }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <SectionHeading
              eyebrow="WHAT WE PUBLISH"
              heading="AN EDITORIAL HUB, NOT A FEED."
              surface="light"
              thread
            />
            <p className="mt-8 text-lagoon-800 text-lg leading-relaxed">
              Every article on this page has been reviewed and approved through
              the Movement's editorial process. Content originates from The One
              Movement International, its programs, its Founder, and — where an
              official relationship exists — its partners, sponsors,
              institutions, universities, NGOs, ambassadors and approved media
              partners.
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          3. ARTICLES — conditional on published count
          ───────────────────────────────────────────────────────────────────── */}
      <section
        className="w-full py-section-lg"
        style={{ backgroundColor: 'hsl(187 67% 8%)' }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            eyebrow="LATEST"
            heading="FROM THE MOVEMENT"
            surface="dark"
            thread
          />

          {publishedArticles.length === 0 && (
            <div className="mt-12 max-w-sm">
              <ArchivePhoto id="cultural-performance" caption="Cultural performance · Founder archive" captionClassName="text-ivory-300" sizes="(min-width: 640px) 24rem, 92vw" />
            </div>
          )}
          <div className="mt-12">
            {publishedArticles.length === 0 ? (
              /* ── Zero-articles state: composed and honest ─────────────────── */
              <div className="max-w-xl">
                <StatusNotice
                  variant="editorial"
                  message="The first official articles are being prepared through our editorial process and will appear here as they are approved."
                />
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link
                    href="/programs"
                    className={cn(
                      'block rounded-sm border border-gold-500/30 p-6 transition-colors',
                      'hover:border-gold-500/60 hover:bg-lagoon-800/40',
                      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400 focus-visible:outline-offset-2',
                    )}
                  >
                    <p
                      className="text-sm text-gold-400 uppercase tracking-widest mb-2"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      Explore
                    </p>
                    <p
                      className="text-base text-ivory-100 uppercase tracking-wide"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      THE PROGRAMS
                    </p>
                  </Link>
                  <Link
                    href="/ecosystem"
                    className={cn(
                      'block rounded-sm border border-gold-500/30 p-6 transition-colors',
                      'hover:border-gold-500/60 hover:bg-lagoon-800/40',
                      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400 focus-visible:outline-offset-2',
                    )}
                  >
                    <p
                      className="text-sm text-gold-400 uppercase tracking-widest mb-2"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      Explore
                    </p>
                    <p
                      className="text-base text-ivory-100 uppercase tracking-wide"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      THE ECOSYSTEM
                    </p>
                  </Link>
                </div>
              </div>
            ) : (
              /* ── Published articles exist: chips + card grid ──────────────── */
              <>
                {/* Category filter chips — only populated categories */}
                {populatedCategories.length > 0 && (
                  <div
                    className="flex flex-wrap gap-2 mb-10"
                    role="group"
                    aria-label="Filter by category"
                  >
                    <button
                      role="button"
                      aria-pressed={activeCategory === null}
                      onClick={() => setActiveCategory(null)}
                      className={cn(
                        'rounded-sm border px-4 py-2 text-xs uppercase tracking-widest transition-colors',
                        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400 focus-visible:outline-offset-2',
                        activeCategory === null
                          ? 'border-gold-400 bg-gold-400/10 text-gold-300'
                          : 'border-gold-500/30 text-ivory-400 hover:border-gold-500/60 hover:text-ivory-200',
                      )}
                    >
                      All
                    </button>
                    {populatedCategories.map((slug) => (
                      <button
                        key={slug}
                        role="button"
                        aria-pressed={activeCategory === slug}
                        onClick={() =>
                          setActiveCategory(
                            activeCategory === slug ? null : slug,
                          )
                        }
                        className={cn(
                          'rounded-sm border px-4 py-2 text-xs uppercase tracking-widest transition-colors',
                          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400 focus-visible:outline-offset-2',
                          activeCategory === slug
                            ? 'border-gold-400 bg-gold-400/10 text-gold-300'
                            : 'border-gold-500/30 text-ivory-400 hover:border-gold-500/60 hover:text-ivory-200',
                        )}
                      >
                        {CATEGORY_LABELS[slug] ?? slug}
                      </button>
                    ))}
                  </div>
                )}

                {/* Article card grid */}
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedArticles.map((article) => (
                    <li key={article.slug}>
                      <Link
                        href={`/news/${article.slug}`}
                        className={cn(
                          'group block rounded-sm border border-gold-500/15 bg-lagoon-800/30',
                          'overflow-hidden transition-colors',
                          'hover:border-gold-500/35 hover:bg-lagoon-800/50',
                          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400 focus-visible:outline-offset-2',
                        )}
                      >
                        {/* Hero media slot — PhotoSlot elegant fallback at launch */}
                        {article.heroMediaSlot && (
                          <PhotoSlot
                            filename={article.heroMediaSlot}
                            alt=""
                            className="w-full h-44"
                            variant="sharp"
                            duotone
                          />
                        )}
                        <div className="p-6">
                          {/* Category badge */}
                          <span className="text-xs text-gold-400 uppercase tracking-widest">
                            {CATEGORY_LABELS[article.category] ??
                              article.category}
                          </span>
                          {/* Title */}
                          <p
                            className="mt-2 text-base text-ivory-100 uppercase leading-snug"
                            style={{ fontFamily: 'var(--font-display)' }}
                          >
                            {article.title}
                          </p>
                          {/* Excerpt */}
                          <p className="mt-3 text-sm text-ivory-400 leading-relaxed line-clamp-3">
                            {article.excerpt}
                          </p>
                          {/* Byline */}
                          <p className="mt-4 text-xs text-ivory-500">
                            {article.authorDisplayName}
                            {' · '}
                            {AUTHOR_TYPE_LABELS[article.authorType] ??
                              article.authorType}
                            {' · '}
                            {formatDate(article.publishedAt)}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          4. EDITORIAL POLICY — ivory, id="editorial-policy" (deep-link target)
          ───────────────────────────────────────────────────────────────────── */}
      <section
        id="editorial-policy"
        className="w-full py-section-lg"
        style={{ backgroundColor: 'hsl(60 9% 97%)' }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <SectionHeading
              eyebrow="OUR EDITORIAL POLICY"
              heading="WHAT REACHES THIS PAGE."
              surface="light"
              thread
            />
            <div className="mt-8 space-y-5 text-lagoon-800 text-lg leading-relaxed">
              <p>
                The One Movement International publishes announcements, stories,
                interviews and reports that reflect the work, values and reach
                of the Movement and its ecosystem. Every article is reviewed by
                our editorial team before publication.
              </p>
              <p>
                Where an article is contributed by a partner, sponsor,
                institution or approved media partner, the byline names the
                author and the contributing organization. Republished
                third-party pieces are attributed clearly and link back to their
                original source.
              </p>
              <p>
                We correct errors visibly when they occur. Articles involving
                named individuals are published only with their consent. Content
                involving humanitarian beneficiaries follows the safeguarding
                standards of our humanitarian partners.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          5. MEDIA PARTNERSHIP PATHWAY — lagoon-900
          CTA → /join#institutional-inquiry (confirmed anchor)
          ───────────────────────────────────────────────────────────────────── */}
      <section
        className="w-full py-section-lg"
        style={{ backgroundColor: 'hsl(187 67% 8%)' }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            eyebrow="FOR MEDIA ORGANIZATIONS"
            heading="MEDIA PARTNERSHIPS BEGIN WITH A CONVERSATION."
            surface="dark"
            thread
          />
          <p className="mt-8 text-ivory-300 text-lg leading-relaxed max-w-2xl">
            Media organizations interested in contributing to or covering The
            One Movement International connect through the institutional inquiry
            pathway. Approved media partners may propose articles for editorial
            review as their partnership develops.
          </p>
          <div className="mt-10">
            <Link
              href="/join#institutional-inquiry"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400 focus-visible:outline-offset-2',
              )}
            >
              BEGIN THE CONVERSATION
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          6. CLOSING SIGNATURE — bilingual
          ───────────────────────────────────────────────────────────────────── */}
      <section
        className="w-full py-16 flex items-center justify-center"
        style={{ backgroundColor: 'hsl(187 67% 8%)' }}
        aria-label="Closing signature"
      >
        <p className="text-xs text-ivory-400 tracking-[0.3em] uppercase select-none">
          WE ARE ONE —{' '}
          <span lang="ar" dir="rtl" className="font-normal not-italic">
            نحن واحد
          </span>
        </p>
      </section>
    </div>
  );
}
