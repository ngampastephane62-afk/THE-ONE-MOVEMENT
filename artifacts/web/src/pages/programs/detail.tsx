import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import { Link, useParams, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import HeroSurface from '@/components/HeroSurface';
import GoldThread from '@/components/GoldThread';
import SectionHeading from '@/components/SectionHeading';
import GeometricAccent from '@/components/GeometricAccent';
import PhotoSlot from '@/components/PhotoSlot';
import StatusNotice from '@/components/StatusNotice';
import { PROGRAMS, getProgramBySlug, type Program, type ProgramStatus } from '@/lib/programs-data';

/* ── Page ─────────────────────────────────────────────────────────────────── */

export default function ProgramDetail() {
  const params = useParams<{ slug: string }>();
  const [, navigate] = useLocation();
  const program = getProgramBySlug(params.slug ?? '');

  useEffect(() => {
    if (!program) navigate('/programs', { replace: true });
  }, [program, navigate]);

  if (!program) return null;

  return (
    <div>
      <Helmet>
        <title>{`${program.name} — THE ONE MOVEMENT INTERNATIONAL`}</title>
        <meta name="description" content={program.seoDescription} />
        <meta property="og:title" content={`${program.name} — THE ONE MOVEMENT INTERNATIONAL`} />
        <meta property="og:description" content={program.seoDescription} />
        {/* FILLED AT DEPLOY WITH PRODUCTION DOMAIN */}
        <link rel="canonical" href={`/programs/${program.slug}`} />
      </Helmet>

      {/* ───────────────────────────────────────────────────────────────────────
          1. PROGRAM HERO — HeroSurface (lagoon radiant), split layout
          ─────────────────────────────────────────────────────────────────────── */}
      <HeroSurface glowOrigin="behind" minHeight="82vh">
        <div className="mx-auto w-full max-w-7xl px-6 py-section-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

            {/* Left: text */}
            <div className="lg:col-span-6">
              <p className="text-eyebrow text-gold-400 mb-4 animate-fade-in">
                {program.eyebrow}
              </p>

              {/* Status badge — only when status exists */}
              {program.status && (
                <div className="mb-5">
                  <StatusBadge status={program.status} />
                </div>
              )}

              <h1
                className="text-[clamp(2.25rem,9vw,5rem)] leading-[0.95] tracking-[-0.02em] text-ivory-100 animate-fade-up"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {program.name}
              </h1>
              <GoldThread className="mt-7" length="220px" node />
              <p
                className="mt-6 text-ivory-200 text-lg leading-relaxed max-w-xl animate-fade-in"
                style={{ animationDelay: '0.15s' }}
              >
                {program.heroStatement}
              </p>

              {/* CTAs */}
              <div
                className="mt-9 flex flex-wrap gap-4 animate-fade-in"
                style={{ animationDelay: '0.25s' }}
              >
                <Link href={program.primaryCTA.href}>
                  <Button size="xl" variant="default">
                    {program.primaryCTA.label}
                  </Button>
                </Link>
                {program.secondaryCTA && (
                  <Link href={program.secondaryCTA.href}>
                    <Button size="xl" variant="gold-outline">
                      {program.secondaryCTA.label}
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Right: cinematic photo placeholder */}
            <div
              className="lg:col-span-5 lg:col-start-8 animate-fade-in"
              style={{ animationDelay: '0.3s' }}
            >
              {program.mediaSlots[0] && (
                <MediaSlotWithLabel
                  filename={`programs-${program.slug}-hero.jpg`}
                  label={program.mediaSlots[0]}
                  className="w-full aspect-[3/4]"
                />
              )}
            </div>
          </div>
        </div>
      </HeroSurface>

      {/* Transition: lagoon → ivory */}
      <div style={{ backgroundColor: 'hsl(38 57% 94%)' }}>
        <GeometricAccent variant="lagoon-on-ivory" height={20} />
      </div>

      {/* ───────────────────────────────────────────────────────────────────────
          2. PURPOSE — ivory
          ─────────────────────────────────────────────────────────────────────── */}
      <section className="bg-ivory-100 pt-section-lg pb-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-4">
              <SectionHeading
                eyebrow="WHY IT EXISTS"
                heading="PURPOSE"
                thread
                size="md"
                surface="light"
              />
            </div>
            <div className="lg:col-span-7 lg:col-start-6 flex items-start pt-1">
              <p className="text-ink-800 leading-relaxed text-lg">{program.purpose}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────────────────
          3. OVERVIEW — ivory continues
          ─────────────────────────────────────────────────────────────────────── */}
      <section
        className="bg-ivory-100 pb-section-lg"
        style={{ borderTop: '1px solid hsl(36 26% 84%)' }}
      >
        <div className="mx-auto max-w-7xl px-6 pt-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-4">
              <SectionHeading
                eyebrow="THE PROGRAM"
                heading="OVERVIEW"
                size="md"
                surface="light"
              />
            </div>
            <div className="lg:col-span-7 lg:col-start-6 flex items-start pt-1">
              <p className="text-ink-800 leading-relaxed text-lg">{program.overview}</p>
            </div>
          </div>
          <GoldThread className="mt-14" length="280px" node />
        </div>
      </section>

      {/* Transition: ivory → lagoon */}
      <div style={{ backgroundColor: 'hsl(187 67% 12%)' }} aria-hidden="true">
        <GeometricAccent variant="gold-on-lagoon" height={20} />
      </div>

      {/* ───────────────────────────────────────────────────────────────────────
          4. KEY THEMES — lagoon-900 band
          ─────────────────────────────────────────────────────────────────────── */}
      <section
        className="py-14"
        style={{ backgroundColor: 'hsl(187 67% 12%)' }}
        aria-label="Key themes"
      >
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-eyebrow text-gold-400 mb-6">KEY THEMES</p>
          <div className="flex flex-wrap gap-3">
            {program.themes.map((theme) => (
              <span
                key={theme}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0.35rem 1rem',
                  borderRadius: '2px',
                  border: '1px solid hsl(39 52% 54% / 0.55)',
                  backgroundColor: 'hsl(39 52% 54% / 0.07)',
                  color: 'hsl(39 52% 54%)',
                  fontSize: '0.65rem',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                }}
              >
                {theme}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Transition: lagoon → ivory */}
      <div style={{ backgroundColor: 'hsl(38 57% 94%)' }}>
        <GeometricAccent variant="lagoon-on-ivory" height={20} />
      </div>

      {/* ───────────────────────────────────────────────────────────────────────
          5. WHO IT IS FOR — ivory
          ─────────────────────────────────────────────────────────────────────── */}
      <section className="bg-ivory-100 py-section-lg">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            eyebrow="WHO IT IS FOR"
            heading="A PROGRAM FOR"
            thread
            size="lg"
            surface="light"
            className="mb-12"
          />
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl">
            {program.audiences.map((audience) => (
              <li
                key={audience}
                className="flex items-center gap-3 py-3 border-b"
                style={{ borderColor: 'hsl(36 26% 80%)' }}
              >
                {/* Gold diamond bullet */}
                <span
                  aria-hidden="true"
                  style={{
                    display: 'inline-block',
                    width: '6px',
                    height: '6px',
                    backgroundColor: 'hsl(39 52% 54%)',
                    transform: 'rotate(45deg)',
                    flexShrink: 0,
                  }}
                />
                <span className="text-ink-800 text-sm leading-snug">{audience}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────────────────
          6. THE EXPERIENCE — ivory, experience item cards
          ─────────────────────────────────────────────────────────────────────── */}
      <section
        className="py-section-lg"
        style={{
          backgroundColor: 'hsl(40 71% 98%)',
          borderTop: '1px solid hsl(36 26% 84%)',
        }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            eyebrow="THE EXPERIENCE"
            heading="WHAT THE PROGRAM BRINGS TOGETHER"
            thread
            size="lg"
            surface="light"
            className="mb-12"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
            {program.experienceItems.map((item) => (
              <ExperienceCard key={item} text={item} />
            ))}
          </div>
          <p
            className="mt-10 text-sm italic leading-relaxed max-w-2xl"
            style={{ color: 'hsl(189 30% 50%)' }}
          >
            Program formats evolve edition by edition; specific activities are confirmed in
            official announcements.
          </p>
        </div>
      </section>

      {/* Transition: ivory → lagoon */}
      <div style={{ backgroundColor: 'hsl(187 67% 12%)' }} aria-hidden="true">
        <GeometricAccent variant="gold-on-lagoon" height={20} />
      </div>

      {/* ───────────────────────────────────────────────────────────────────────
          7. CONNECTION TO THE MOVEMENT — lagoon-900 band
          ─────────────────────────────────────────────────────────────────────── */}
      <section
        className="py-section-lg"
        style={{ backgroundColor: 'hsl(187 67% 12%)' }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5">
              <SectionHeading
                eyebrow="PART OF SOMETHING LARGER"
                heading="ONE PROGRAM. ONE MOVEMENT."
                thread
                size="lg"
                surface="dark"
              />
            </div>
            <div className="lg:col-span-6 lg:col-start-7">
              <p className="text-ivory-200 leading-relaxed text-lg">
                {program.movementConnection}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Transition: lagoon → ivory */}
      <div style={{ backgroundColor: 'hsl(38 57% 94%)' }}>
        <GeometricAccent variant="lagoon-on-ivory" height={20} />
      </div>

      {/* ───────────────────────────────────────────────────────────────────────
          8. PROGRAM INFORMATION — ProgramInfoPanel
          ─────────────────────────────────────────────────────────────────────── */}
      <section className="bg-ivory-100 py-section-lg">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            eyebrow="PROGRAM INFORMATION"
            heading="OFFICIAL DETAILS"
            size="md"
            surface="light"
            className="mb-10"
          />
          <div className="max-w-2xl">
            <ProgramInfoPanel
              historyNote={program.historyNote}
            />
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────────────────
          9. MEDIA — premium photo placeholders
          ─────────────────────────────────────────────────────────────────────── */}
      <section
        className="py-section-lg"
        style={{
          backgroundColor: 'hsl(40 71% 98%)',
          borderTop: '1px solid hsl(36 26% 84%)',
        }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            eyebrow="MEDIA"
            heading="MOMENTS FROM THE MOVEMENT"
            size="lg"
            surface="light"
            className="mb-12"
          />
          <ProgramMediaGrid slug={program.slug} mediaSlots={program.mediaSlots} />
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────────────────
          10. PARTICIPATION — ivory
          ─────────────────────────────────────────────────────────────────────── */}
      <section
        className="bg-ivory-100 py-section-lg"
        style={{ borderTop: '1px solid hsl(36 26% 84%)' }}
      >
        <div className="mx-auto max-w-4xl px-6 text-center">
          <SectionHeading
            eyebrow="TAKE PART"
            heading="BEGIN WITH AN EXPRESSION OF INTEREST"
            thread
            size="lg"
            surface="light"
            align="center"
            className="mb-8"
          />
          <p className="text-ink-800 leading-relaxed text-lg mb-10 max-w-2xl mx-auto">
            Applications, invitations and partnership conversations vary by program.
            Submit an expression of interest to receive relevant official updates.
            Submission does not create an account, membership or confirmed place.
          </p>
          <Link href="/join">
            <Button size="xl" variant="default">
              JOIN THE MOVEMENT
            </Button>
          </Link>
          {program.verificationNotice && (
            <div className="mt-10">
              <StatusNotice message={program.verificationNotice} />
            </div>
          )}
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────────────────
          11. RELATED PROGRAMS — lagoon-900
          ─────────────────────────────────────────────────────────────────────── */}
      {program.relatedProgramSlugs.length > 0 && (
        <>
          <div style={{ backgroundColor: 'hsl(187 67% 12%)' }} aria-hidden="true">
            <GeometricAccent variant="gold-on-lagoon" height={20} />
          </div>
          <section
            className="py-section-lg"
            style={{ backgroundColor: 'hsl(187 67% 12%)' }}
            aria-label="Related programs"
          >
            <div className="mx-auto max-w-7xl px-6">
              <p className="text-eyebrow text-gold-400 mb-8">EXPLORE MORE</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-px"
                style={{ backgroundColor: 'hsl(188 66% 22%)' }}
              >
                {program.relatedProgramSlugs.map((slug) => (
                  <RelatedProgramCard key={slug} slug={slug} />
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* ───────────────────────────────────────────────────────────────────────
          12. CLOSING — HeroSurface
          ─────────────────────────────────────────────────────────────────────── */}
      <HeroSurface minHeight="56vh" className="px-6">
        <div className="mx-auto max-w-4xl py-section-lg text-center">
          <h2
            className="text-display-lg text-ivory-100 animate-fade-up"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            BE THERE WHEN THE
            <br />
            <span style={{ color: 'hsl(43 80% 73%)' }}>WORLD COMES TOGETHER.</span>
          </h2>
          <GoldThread className="mt-8 mx-auto" length="240px" node />
          <div
            className="mt-10 animate-fade-in"
            style={{ animationDelay: '0.15s' }}
          >
            <Link href="/join">
              <Button size="xl" variant="default">
                JOIN THE MOVEMENT
              </Button>
            </Link>
          </div>
          <p
            className="mt-12 text-sm font-semibold tracking-wide animate-fade-in"
            style={{ color: 'hsl(43 80% 73%)', animationDelay: '0.25s' }}
            aria-label="We Are One"
          >
            WE ARE ONE{' '}
            <span className="opacity-40 mx-2" aria-hidden="true">—</span>
            <span
              lang="ar"
              dir="rtl"
              className="font-arabic"
              style={{ fontFamily: 'var(--font-arabic)' }}
            >
              نحن واحد
            </span>
          </p>
        </div>
      </HeroSurface>
    </div>
  );
}

/* ── Local sub-components ─────────────────────────────────────────────────── */

/**
 * StatusBadge — renders the program status in the hero.
 * Only shown when program.status is set.
 */
function StatusBadge({ status }: { status: ProgramStatus }) {
  const isPostponed = status === 'postponed';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.25rem 0.8rem',
        borderRadius: '2px',
        border: `1px solid ${isPostponed ? 'hsl(189 30% 40%)' : 'hsl(39 52% 54% / 0.55)'}`,
        backgroundColor: isPostponed ? 'hsl(187 50% 18%)' : 'hsl(39 52% 54% / 0.1)',
        color: isPostponed ? 'hsl(189 30% 72%)' : 'hsl(39 52% 54%)',
        fontSize: '0.6rem',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        fontFamily: 'var(--font-display)',
        fontWeight: 600,
      }}
    >
      {status.toUpperCase()}
    </span>
  );
}

/**
 * MediaSlotWithLabel — wraps PhotoSlot with a premium dev caption overlay.
 * The label is tiny, gold, uppercase — clearly a reserved production area.
 */
function MediaSlotWithLabel({
  filename,
  label,
  className,
}: {
  filename: string;
  label: string;
  className?: string;
}) {
  return (
    <div className="relative" aria-hidden="false">
      <PhotoSlot filename={filename} alt="" className={className} duotone />
      <div
        aria-hidden="true"
        className="absolute bottom-0 inset-x-0 flex justify-center pb-4 pointer-events-none"
      >
        <span
          style={{
            fontSize: '0.5rem',
            letterSpacing: '0.18em',
            fontFamily: 'var(--font-display)',
            textTransform: 'uppercase',
            color: 'hsl(43 80% 73%)',
            opacity: 0.55,
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

/**
 * ProgramMediaGrid — mosaic-style grid of all mediaSlots for the media section.
 * First slot is large; subsequent slots fill the secondary column.
 */
function ProgramMediaGrid({
  slug,
  mediaSlots,
}: {
  slug: string;
  mediaSlots: string[];
}) {
  if (mediaSlots.length === 0) return null;

  const [primary, ...secondary] = mediaSlots;
  const secondarySlots = secondary.slice(0, 3);

  if (secondarySlots.length === 0) {
    return (
      <MediaSlotWithLabel
        filename={`programs-${slug}-media-1.jpg`}
        label={primary}
        className="w-full aspect-[4/3]"
      />
    );
  }

  return (
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: '3fr 2fr' }}
    >
      {/* Primary — tall portrait */}
      <MediaSlotWithLabel
        filename={`programs-${slug}-media-1.jpg`}
        label={primary}
        className="w-full aspect-[2/3]"
      />
      {/* Secondary column */}
      <div className="flex flex-col gap-2">
        {secondarySlots.map((label, i) => (
          <MediaSlotWithLabel
            key={i}
            filename={`programs-${slug}-media-${i + 2}.jpg`}
            label={label}
            className="w-full aspect-square"
          />
        ))}
      </div>
    </div>
  );
}

/**
 * ExperienceCard — one experience item rendered as a short bordered card.
 */
function ExperienceCard({ text }: { text: string }) {
  return (
    <div
      className="py-4 px-5 border-l-2"
      style={{
        borderLeftColor: 'hsl(39 52% 54%)',
        backgroundColor: 'hsl(38 57% 94%)',
        borderRadius: '0 2px 2px 0',
      }}
    >
      <p
        className="text-sm leading-snug font-medium"
        style={{ color: 'hsl(29 35% 16%)' }}
      >
        {text}
      </p>
    </div>
  );
}

/**
 * ProgramInfoPanel — the official program information block.
 * Renders verified history (if any) above a neutral scheduling notice.
 * Scheduling fields are not rendered because none are confirmed at this stage.
 */
function ProgramInfoPanel({ historyNote }: { historyNote?: string }) {
  return (
    <div
      className="rounded-sharp border p-8"
      style={{
        borderColor: 'hsl(36 26% 74%)',
        backgroundColor: 'hsl(40 71% 98%)',
      }}
    >
      {/* Verified history — only for programs with completed editions */}
      {historyNote && (
        <div className="mb-6 pb-6" style={{ borderBottom: '1px solid hsl(36 26% 84%)' }}>
          <p className="text-eyebrow text-gold-600 mb-3">PROGRAM HISTORY</p>
          <p className="text-ink-800 leading-relaxed text-sm">{historyNote}</p>
        </div>
      )}

      {/* Neutral scheduling notice — always shown at this stage */}
      <p
        className="text-sm leading-relaxed"
        style={{ color: 'hsl(189 30% 45%)', fontStyle: 'italic' }}
      >
        Official program details will be announced when confirmed.
      </p>
    </div>
  );
}

// StatusNotice promoted to shared component: @/components/StatusNotice

/**
 * RelatedProgramCard — compact clickable card linking to another program's detail page.
 * Only renders when the target slug exists in PROGRAMS_DATA.
 */
function RelatedProgramCard({ slug }: { slug: string }) {
  const program = getProgramBySlug(slug);
  if (!program) return null;

  return (
    <Link
      href={`/programs/${slug}`}
      aria-label={program.name}
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
      style={
        {
          '--tw-ring-color': 'hsl(39 52% 54%)',
          '--tw-ring-offset-color': 'hsl(187 67% 12%)',
        } as React.CSSProperties
      }
    >
      <div
        className="px-7 py-8 transition-colors duration-200 h-full cursor-pointer"
        style={{ backgroundColor: 'hsl(187 67% 12%)' }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.backgroundColor = 'hsl(188 66% 16%)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.backgroundColor = 'hsl(187 67% 12%)';
        }}
      >
        {/* Gold top rule */}
        <div
          className="mb-5"
          style={{ width: '32px', height: '2px', backgroundColor: 'hsl(39 52% 54%)' }}
          aria-hidden="true"
        />
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.75rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'hsl(38 57% 94%)',
            lineHeight: 1.5,
          }}
        >
          {program.name}
        </h3>
        <p
          className="mt-2 text-xs leading-relaxed"
          style={{
            color: 'hsl(39 52% 54%)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          {program.tagline}
        </p>
        <p
          className="mt-1 text-xs"
          style={{
            color: 'hsl(189 30% 60%)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          VIEW PROGRAM →
        </p>
      </div>
    </Link>
  );
}
