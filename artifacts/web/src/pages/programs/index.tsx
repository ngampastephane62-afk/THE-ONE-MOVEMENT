import { Helmet } from 'react-helmet-async';
import PhotoActions from '@/components/editorial/PhotoActions';
import VideoActions from "@/components/editorial/VideoActions";
import { programCardMedia } from '@/lib/cover-media';
import ProgrammeCover from '@/components/programs/ProgrammeCover';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import HeroSurface from '@/components/HeroSurface';
import { MotionToggle, WordLine, useProgramsMotion } from './ProgramsMotion';
import GoldThread from '@/components/GoldThread';
import ArchivePhoto from '@/components/ArchivePhoto';
import ProgramVision from '@/components/ProgramVision';
import ProgramSuppliedImage from '@/components/programs/ProgramSuppliedImage';
import { ProgrammeFilmPoster } from '@/components/programs/ProgrammeFilm';
import { DiplomaticGalaPreview } from '@/components/DiplomaticGalaMedia';
import StatBlock from '@/components/StatBlock';
import '@/styles/universe.css';

/* ── Program cards data ─────────────────────────────────────────────────── */

const PROGRAMS: {
  slug: string;
  name: string;
  tagline: string;
  desc: string;
}[] = [
  {
    slug: 'diplomatic-gala',
    name: 'THE ONE DIPLOMATIC GALA',
    tagline: 'Culture. Diplomacy. Art. Peace.',
    desc: 'An evening bringing together diplomats, institutions, artists and cultural leaders — celebrating dialogue between nations and honoring those who build bridges between peoples.',
  },
  {
    slug: 'summit',
    name: 'THE ONE SUMMIT',
    tagline: 'Leadership. Innovation. Business.',
    desc: 'A gathering of leaders, entrepreneurs, investors and innovators — exploring the ideas, industries and partnerships shaping a more connected world.',
  },
  {
    slug: 'fashion-week',
    name: 'THE ONE FASHION WEEK INTERNATIONAL',
    tagline: 'Fashion. Design. Runway. Culture.',
    desc: 'The program where the Movement began. Five completed editions in Bukavu, Goma and Kinshasa carried a message of peace, unity and radical inclusion. The sixth, the first in Dubai, takes place on 22 December 2026.',
  },
  {
    slug: 'awards',
    name: 'THE ONE AWARDS',
    tagline: 'Recognition. Excellence. Impact.',
    desc: "Recognition for creativity, courage, collaboration and positive impact, with Rosina as producer, partner and speaker. Recognition is not for sale.",
  },
  {
    slug: 'fashion-night',
    name: 'THE ONE FASHION NIGHT',
    tagline: 'Entertainment. Music. Fashion. Culture.',
    desc: 'A celebration where fashion meets music, dance and art — an open, vibrant expression of the cultures that make the Movement one.',
  },
  {
    slug: 'investment-forum',
    name: 'THE ONE INVESTMENT FORUM',
    tagline: 'Investment. Startups. Business Matching.',
    desc: "Connecting investors with founders, projects and opportunities from across the Movement's global community — where capital meets creativity and conviction.",
  },
];

const NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI'];

/* ── Page ─────────────────────────────────────────────────────────────────── */

export default function Programs() {
  const { rootRef, still, setStill } = useProgramsMotion();
  return (
    <div ref={rootRef} className="pgm programs-motion-page" data-still={still ? 'true' : 'false'}>
      <Helmet>
        <title>OFFICIAL PROGRAMS — THE ONE MOVEMENT INTERNATIONAL</title>
        <meta name="description" content="Six official programs spanning culture, diplomacy, leadership, recognition, fashion and investment." />
        <meta property="og:title" content="OFFICIAL PROGRAMS — THE ONE MOVEMENT INTERNATIONAL" />
        <meta property="og:description" content="Six official programs spanning culture, diplomacy, leadership, recognition, fashion and investment." />
        {/* FILLED AT DEPLOY WITH PRODUCTION DOMAIN */}
        <link rel="canonical" href="/programs" />
      </Helmet>

      {/* 1. PROGRAMS HERO — local layered stage: background 0, depth plates 1, readability 2, content 3 */}
      <section className="pgm-hero pgm-stack" data-pgm-loop aria-labelledby="programs-hero-heading">
        <div className="pgm-l0" aria-hidden="true" />
        <div className="pgm-l1" aria-hidden="true">
          <div className="pgm-plates-in absolute inset-0">
            <div className="pgm-plate pgm-plate-far" />
            <div className="pgm-mist pgm-mist-b" />
            <div className="pgm-arc" />
            <div className="pgm-plate pgm-plate-near" />
            <div className="pgm-mist pgm-mist-a" />
          </div>
        </div>
        <div className="pgm-l2" aria-hidden="true" />
        <div className="pgm-l3 mx-auto w-full max-w-4xl px-5 py-24 text-center sm:px-6 sm:py-section-lg">
          <p className="pgm-hero-eyebrow text-eyebrow text-gold-400 mb-6">OFFICIAL PROGRAMS</p>
          <h1 id="programs-hero-heading" className="text-display-xl text-ivory-100" style={{ fontFamily: 'var(--font-display)', overflowWrap: 'break-word' }}>
            <WordLine text="THE HEARTBEAT OF" />
            <WordLine text="THE MOVEMENT." start={3} style={{ color: 'hsl(43 80% 73%)' }} />
          </h1>
          <span className="pgm-hero-rule mt-8" aria-hidden="true" />
          <p className="pgm-hero-sub mt-8 text-ivory-200 text-lg leading-relaxed max-w-2xl mx-auto">
             The six official programs set out the Movement&apos;s direction across
             culture, business, diplomacy and celebration. Dates, applications and
             participation details are published only when confirmed.
          </p>
        </div>
        <MotionToggle still={still} onToggle={() => setStill((v) => !v)} />
      </section>

      <div className="pgm-seam" aria-hidden="true" />

      {/* 2. EVERY PROGRAM FEEDS THE ECOSYSTEM — revealed on scroll */}
      <section className="bg-ivory-100 py-section-lg">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center" data-pgm-reveal>
            <div className="lg:col-span-5">
              <p className="pgm-r text-eyebrow text-gold-600">MOMENTS OF CONNECTION</p>
              <h2 className="mt-4 text-display-lg text-ink-900" style={{ fontFamily: 'var(--font-display)', overflowWrap: 'break-word' }}>
                <WordLine text="EVERY PROGRAM" />
                <WordLine text="FEEDS THE ECOSYSTEM" start={2} />
              </h2>
              <span className="pgm-rule mt-6 w-40" style={{ ['--d' as string]: '450ms' }} aria-hidden="true" />
            </div>
            <div className="lg:col-span-6 lg:col-start-7 flex items-center">
              <p className="pgm-r pgm-r-up text-ink-800 leading-relaxed text-lg" style={{ ['--d' as string]: '380ms' }}>
                Each official program is designed to bring creatives, entrepreneurs,
                investors, institutions and changemakers together around a shared
                purpose. Confirmed participation details are published on the relevant
                program page as they become available.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          3. THE PROGRAMS — dark cinematic card grid (cards are now links)
          ───────────────────────────────────────────────────────────────────── */}
      <section
        id="official-programs"
        className="py-section-lg scroll-mt-20"
        style={{ backgroundColor: 'hsl(187 67% 12%)' }}
        aria-label="Official programs"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          {/* Grid: 1-col mobile / 2-col tablet / 3-col desktop */}
          <ul
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            role="list"
          >
            {PROGRAMS.map((program, i) => (
              <li key={program.name} role="listitem" data-pgm-reveal style={{ ['--d' as string]: `${(i % 3) * 140}ms` }}>
                <ProgramCard {...program} />
              </li>
            ))}
          </ul>

          {/* Mandatory footer line */}
          <p
            className="mt-10 text-center text-sm leading-relaxed"
            style={{ color: 'hsl(189 30% 60%)' }}
          >
            Editions, dates and locations are announced officially through the
            Movement's channels.
          </p>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          4. STAT BAND — lagoon-900 strip
          ───────────────────────────────────────────────────────────────────── */}
      <section
        className="py-16"
        style={{
          backgroundColor: 'hsl(187 67% 12%)',
          borderTop: '1px solid hsl(188 66% 22%)',
          borderBottom: '1px solid hsl(188 66% 22%)',
        }}
        aria-label="Movement at a glance"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-6">
            <StatBlock value="6"  label="Official Programs"     surface="dark" />
            <StatBlock value="5"  label="Fashion Week Editions" surface="dark" />
            <StatBlock value="17" label="Sectors Connected"     surface="dark" />
            <StatBlock value="1"  label="Global Movement"       surface="dark" />
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          5. CLOSING INVITATION — HeroSurface
          ───────────────────────────────────────────────────────────────────── */}
      <HeroSurface minHeight="60vh" className="px-6">
        <div className="mx-auto max-w-4xl py-section-lg text-center">
          <h2
            className="text-display-lg text-ivory-100 animate-fade-up"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            BE THERE WHEN THE
            <br />
            <span style={{ color: 'hsl(43 80% 73%)' }}>
              WORLD COMES TOGETHER.
            </span>
          </h2>
          <GoldThread className="mt-8 mx-auto" length="240px" node />
          <p
            className="mt-8 text-ivory-200 text-lg leading-relaxed max-w-xl mx-auto animate-fade-in"
            style={{ animationDelay: '0.15s' }}
          >
            Join the Movement to receive official program announcements and
            opportunities to participate.
          </p>
          <div
            className="mt-10 flex flex-wrap justify-center gap-4 animate-fade-in"
            style={{ animationDelay: '0.25s' }}
          >
            <Link href="/join">
              <Button size="xl" variant="default">
                JOIN THE MOVEMENT
              </Button>
            </Link>
          </div>
          <p
            className="mt-12 text-sm font-semibold tracking-wide animate-fade-in"
            style={{ color: 'hsl(43 80% 73%)', animationDelay: '0.35s' }}
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

/* ── Local sub-component ──────────────────────────────────────────────────── */

/**
 * ProgramCard — dark cinematic card, now a fully clickable accessible link
 * to /programs/:slug. Keyboard navigable with visible gold focus ring.
 * All card content unchanged from the approved overview design.
 */
function ProgramCard({
  slug,
  name,
  tagline,
  desc,
}: {
  slug: string;
  name: string;
  tagline: string;
  desc: string;
}) {
  const media = programCardMedia(slug);
  const numeral = NUMERALS[PROGRAMS.findIndex((p) => p.slug === slug)];
  const keywords = tagline.split('.').map((k) => k.trim()).filter(Boolean);

  return (
    <div className="pgm-card">
    <Link href={`/programs/${slug}`} aria-label={name} className="pgm-card-link" data-testid={`link-program-${slug}`}>
      <article
        className="pgm-r-scale tomi-program-editorial-card tomi-programme flex flex-col h-full cursor-pointer"
        data-program={slug}
        style={{ borderTop: '2px solid hsl(var(--pg))', backgroundColor: 'hsl(187 67% 12%)' }}
      >
        <div className="relative">
          <span className="tomi-programme-numeral pgm-numeral" style={{ ['--w' as string]: 4 }} aria-hidden="true">{numeral}</span>
          <div className="pgm-crop">
            <div className="pgm-crop-img" data-pgm-parallax>
              {slug === 'summit' ? (
                <ArchivePhoto id="summit-goma" actions={false} frameClassName="w-full aspect-[4/3]" objectPosition="center 30%" sizes="(min-width: 1024px) 30vw, 92vw" />
              ) : slug === 'fashion-week' ? (
                <ProgrammeCover programme="fashion-week" actions={false} className="w-full" />
              ) : slug === 'awards' ? (
                <ProgrammeFilmPoster id="awards-rosina-2027" className="w-full" />
              ) : slug === 'diplomatic-gala' ? (
                <DiplomaticGalaPreview actions={false} className="w-full aspect-[4/3]" />
              ) : slug === 'fashion-night' || slug === 'investment-forum' ? (
                <ProgramSuppliedImage slug={slug} compact frameClassName="w-full aspect-[4/3]" />
              ) : (
                <ProgramVision name={name} tagline={tagline} className="w-full aspect-[4/3]" />
              )}
            </div>
          </div>
        </div>

        <div className="tomi-programme-motif" aria-hidden="true" />
        <div className="tomi-weave-dark px-5 pt-6 pb-8 sm:px-6 flex flex-col gap-3 flex-1">
          <p className="pgm-r font-mono text-[10px] tracking-[0.22em]" style={{ color: 'hsl(var(--pg))', ['--w' as string]: 5 }}>OFFICIAL PROGRAMME {numeral} OF VI</p>
          <h3 className="pgm-title">
            {name.split(' ').map((w, i) => (
              <span key={i} className="pgm-word-mask"><span className="pgm-word" style={{ ['--w' as string]: 6 + i }}>{w}</span>{' '}</span>
            ))}
          </h3>
          <p className="pgm-kws">
            <span className="sr-only">{tagline}</span>
            {keywords.map((k, i) => <span key={k} className="pgm-kw" aria-hidden="true" style={{ ['--w' as string]: 10 + i }}>{k}.</span>)}
          </p>
          <p className="pgm-r pgm-r-up pgm-desc text-sm leading-relaxed mt-1" style={{ ['--w' as string]: 15 }}>{desc}</p>
        </div>
      </article>
    </Link>
    {/* Reactions sit outside the card link so no control is nested in an anchor. */}
    <div className="pgm-actions">
      {slug === "fashion-week" || slug === "awards" ? <VideoActions videoId={slug === 'fashion-week' ? 'fashion-knight-2026' : 'awards-rosina-2027'} title={slug === 'fashion-week' ? 'The One Fashion Week International · 22 December 2026 · official artwork' : 'Rosina · producer and speaker · The One Awards'} tone="dark" layout="row" shareExtrasBelow /> : media && <PhotoActions source={media.source} title={media.title} tone="dark" layout="row" shareExtrasBelow />}
    </div>
    </div>
  );
}
