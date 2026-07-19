import { Helmet } from 'react-helmet-async';
import { useParams, useLocation, Link } from 'wouter';
import { useEffect } from 'react';
import HeroSurface from '@/components/HeroSurface';
import GoldThread from '@/components/GoldThread';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getPartnerBySlug, isSafeUrl } from '@/lib/partners-data';
import { getProgramBySlug } from '@/lib/programs-data';

/* ── Page ─────────────────────────────────────────────────────────────────── */

export default function PartnerDetail() {
  const params = useParams<{ slug: string }>();
  const [, navigate] = useLocation();
  const entity = getPartnerBySlug(params.slug ?? '');

  useEffect(() => {
    // Unknown slug, unauthorized entity, or non-active — redirect cleanly to
    // /partners. The redirect does not distinguish "does not exist" from
    // "exists but not authorized", preventing information leakage.
    if (!entity) navigate('/partners', { replace: true });
  }, [entity, navigate]);

  if (!entity) return null;

  /* At launch the registry is empty so this render path is unreachable.
     The code is present, typed and tested for when authorizations arrive. */

  const safeWebsite =
    entity.website && isSafeUrl(entity.website) ? entity.website : undefined;

  const resolvedPrograms = (entity.programSlugs ?? [])
    .map((s) => getProgramBySlug(s))
    .filter(Boolean) as NonNullable<ReturnType<typeof getProgramBySlug>>[];

  return (
    <div>
      <Helmet>
        <title>{`${entity.name} — THE ONE MOVEMENT INTERNATIONAL`}</title>
        <meta name="description" content={entity.seoDescription} />
        <meta
          property="og:title"
          content={`${entity.name} — THE ONE MOVEMENT INTERNATIONAL`}
        />
        <meta property="og:description" content={entity.seoDescription} />
        {/* FILLED AT DEPLOY WITH PRODUCTION DOMAIN */}
        <link rel="canonical" href={`/partners/${entity.slug}`} />
      </Helmet>

      {/* ─────────────────────────────────────────────────────────────────────
          HERO — name, category badge, country, role
          ───────────────────────────────────────────────────────────────────── */}
      <HeroSurface glowOrigin="bottom-center" minHeight="60vh">
        <div className="mx-auto w-full max-w-7xl px-6 py-section-lg">
          {/* Category badge */}
          <p className="text-eyebrow text-gold-400 mb-4 uppercase">
            {entity.category.replace(/-/g, ' ')}
          </p>
          <h1
            className="text-display-xl text-ivory-100 uppercase animate-fade-up"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {entity.name}
          </h1>
          <GoldThread className="mt-8" length="180px" node />
          <div className="mt-6 flex flex-wrap gap-6 text-sm text-ivory-400">
            <span>{entity.country}</span>
            {entity.role && <span>{entity.role}</span>}
          </div>
        </div>
      </HeroSurface>

      {/* ─────────────────────────────────────────────────────────────────────
          ABOUT — description (conditional on presence)
          ───────────────────────────────────────────────────────────────────── */}
      {entity.description && (
        <section
          className="w-full py-section-lg"
          style={{ backgroundColor: 'hsl(60 9% 97%)' }}
        >
          <div className="mx-auto max-w-7xl px-6">
            <div className="max-w-3xl">
              <p className="text-lagoon-800 text-lg leading-relaxed">
                {entity.description}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          SERVICES — conditional on non-empty array
          ───────────────────────────────────────────────────────────────────── */}
      {entity.services && entity.services.length > 0 && (
        <section
          className="w-full py-section-lg"
          style={{ backgroundColor: 'hsl(187 67% 8%)' }}
        >
          <div className="mx-auto max-w-7xl px-6">
            <h2
              className="text-xl text-ivory-100 uppercase tracking-wider mb-6"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Services
            </h2>
            <ul className="space-y-2">
              {entity.services.map((s) => (
                <li key={s} className="text-ivory-300 flex items-start gap-3">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold-400" aria-hidden="true" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          PRODUCTS — conditional on non-empty array
          ───────────────────────────────────────────────────────────────────── */}
      {entity.products && entity.products.length > 0 && (
        <section
          className="w-full py-section-lg"
          style={{ backgroundColor: 'hsl(60 9% 97%)' }}
        >
          <div className="mx-auto max-w-7xl px-6">
            <h2
              className="text-xl text-lagoon-900 uppercase tracking-wider mb-6"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Products
            </h2>
            <ul className="space-y-2">
              {entity.products.map((p) => (
                <li key={p} className="text-lagoon-700 flex items-start gap-3">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold-500" aria-hidden="true" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          WEBSITE — conditional on presence + safe URL
          ───────────────────────────────────────────────────────────────────── */}
      {safeWebsite && (
        <section
          className="w-full py-10"
          style={{ backgroundColor: 'hsl(60 9% 97%)' }}
        >
          <div className="mx-auto max-w-7xl px-6">
            <a
              href={safeWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: 'gold-outline', size: 'lg' }),
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400 focus-visible:outline-offset-2',
              )}
            >
              VISIT WEBSITE
            </a>
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          RELATED PROGRAMS — conditional on resolved programs
          ───────────────────────────────────────────────────────────────────── */}
      {resolvedPrograms.length > 0 && (
        <section
          className="w-full py-section-lg"
          style={{ backgroundColor: 'hsl(187 67% 8%)' }}
        >
          <div className="mx-auto max-w-7xl px-6">
            <h2
              className="text-xl text-ivory-100 uppercase tracking-wider mb-6"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Related Programs
            </h2>
            <div className="flex flex-wrap gap-3">
              {resolvedPrograms.map((program) => (
                <Link
                  key={program.slug}
                  href={`/programs/${program.slug}`}
                  className={cn(
                    'inline-flex items-center rounded-sm border border-gold-500/40 px-4 py-2 text-sm text-ivory-200 uppercase tracking-wide',
                    'hover:border-gold-500/70 hover:text-ivory-100 transition-colors',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400 focus-visible:outline-offset-2',
                  )}
                >
                  {program.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          RELATED SECTORS — conditional on sectorSlugs
          ───────────────────────────────────────────────────────────────────── */}
      {entity.sectorSlugs && entity.sectorSlugs.length > 0 && (
        <section
          className="w-full py-10"
          style={{ backgroundColor: 'hsl(60 9% 97%)' }}
        >
          <div className="mx-auto max-w-7xl px-6">
            <h2
              className="text-xl text-lagoon-900 uppercase tracking-wider mb-6"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Related Sectors
            </h2>
            <div className="flex flex-wrap gap-3">
              {entity.sectorSlugs.map((s) => (
                <Link
                  key={s}
                  href="/ecosystem"
                  className={cn(
                    'inline-flex items-center rounded-sm border border-lagoon-700/40 px-4 py-2 text-sm text-lagoon-700 uppercase tracking-wide',
                    'hover:border-lagoon-700/70 hover:text-lagoon-900 transition-colors',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400 focus-visible:outline-offset-2',
                  )}
                >
                  {s.replace(/-/g, ' ')}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          RELATED ARTICLES — reserved slot.
          POPULATED WHEN NEWS HUB v0 LANDS (articleSlugs)
          ───────────────────────────────────────────────────────────────────── */}
      {/* {entity.articleSlugs && entity.articleSlugs.length > 0 && ( <ArticleGrid slugs={entity.articleSlugs} /> )} */}

      {/* ─────────────────────────────────────────────────────────────────────
          CONTACT
          - institutional-inquiry-only → link to /join#institutional-inquiry
          - direct-contact-authorized → email link (only when type is explicit)
          ───────────────────────────────────────────────────────────────────── */}
      <section
        className="w-full py-section-lg"
        style={{ backgroundColor: 'hsl(187 67% 8%)' }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <h2
            className="text-xl text-ivory-100 uppercase tracking-wider mb-6"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Contact
          </h2>
          {entity.contactType === 'direct-contact-authorized' &&
          entity.contactEmail ? (
            <a
              href={`mailto:${entity.contactEmail}`}
              className={cn(
                buttonVariants({ size: 'lg' }),
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400 focus-visible:outline-offset-2',
              )}
            >
              GET IN TOUCH
            </a>
          ) : (
            <Link
              href="/join#institutional-inquiry"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400 focus-visible:outline-offset-2',
              )}
            >
              BEGIN THE CONVERSATION
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
