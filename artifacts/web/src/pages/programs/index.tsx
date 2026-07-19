import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import HeroSurface from '@/components/HeroSurface';
import GoldThread from '@/components/GoldThread';
import SectionHeading from '@/components/SectionHeading';
import GeometricAccent from '@/components/GeometricAccent';
import PhotoSlot from '@/components/PhotoSlot';
import StatBlock from '@/components/StatBlock';

/* ── Program cards data ─────────────────────────────────────────────────── */

const PROGRAMS: {
  slug: string;
  name: string;
  tagline: string;
  desc: string;
  photo: string;
  label: string;
}[] = [
  {
    slug: 'diplomatic-gala',
    name: 'THE ONE DIPLOMATIC GALA',
    tagline: 'Culture. Diplomacy. Art. Peace.',
    desc: 'An evening bringing together diplomats, institutions, artists and cultural leaders — celebrating dialogue between nations and honoring those who build bridges between peoples.',
    photo: 'programs-diplomatic-gala.jpg',
    label: 'DIPLOMATIC GALA IMAGE',
  },
  {
    slug: 'summit',
    name: 'THE ONE SUMMIT',
    tagline: 'Leadership. Innovation. Business.',
    desc: 'A gathering of leaders, entrepreneurs, investors and innovators — exploring the ideas, industries and partnerships shaping a more connected world.',
    photo: 'programs-summit.jpg',
    label: 'SUMMIT AND BUSINESS IMAGE',
  },
  {
    slug: 'fashion-week',
    name: 'THE ONE FASHION WEEK INTERNATIONAL',
    tagline: 'Fashion. Design. Runway. Culture.',
    desc: 'The program where the Movement began. Five editions across the Democratic Republic of Congo — in Bukavu, Goma and Kinshasa — carried a message of peace, unity and radical inclusion, with the fifth edition supported by the United Nations mission MONUSCO. A fashion week where every body, every origin and every story belongs on the runway.',
    photo: 'programs-fashion-week.jpg',
    label: 'FASHION WEEK IMAGE',
  },
  {
    slug: 'awards',
    name: 'THE ONE AWARDS',
    tagline: 'Recognition. Excellence. Impact.',
    desc: "Honoring members, organizations and initiatives whose work embodies the Movement's values — creativity, courage, collaboration and positive impact.",
    photo: 'programs-awards.jpg',
    label: 'AWARDS IMAGE',
  },
  {
    slug: 'fashion-night',
    name: 'THE ONE FASHION NIGHT',
    tagline: 'Entertainment. Music. Fashion. Culture.',
    desc: 'A celebration where fashion meets music, dance and art — an open, vibrant expression of the cultures that make the Movement one.',
    photo: 'programs-fashion-night.jpg',
    label: 'FASHION NIGHT IMAGE',
  },
  {
    slug: 'investment-forum',
    name: 'THE ONE INVESTMENT FORUM',
    tagline: 'Investment. Startups. Business Matching.',
    desc: "Connecting investors with founders, projects and opportunities from across the Movement's global community — where capital meets creativity and conviction.",
    photo: 'programs-investment-forum.jpg',
    label: 'INVESTMENT FORUM IMAGE',
  },
];

/* ── Page ─────────────────────────────────────────────────────────────────── */

export default function Programs() {
  return (
    <div>
      <Helmet>
        <title>OFFICIAL PROGRAMS — THE ONE MOVEMENT INTERNATIONAL</title>
        <meta name="description" content="Six official programs — from cultural galas to investment forums — the heartbeat of a global movement alive 365 days a year." />
        <meta property="og:title" content="OFFICIAL PROGRAMS — THE ONE MOVEMENT INTERNATIONAL" />
        <meta property="og:description" content="Six official programs — from cultural galas to investment forums — the heartbeat of a global movement alive 365 days a year." />
        {/* FILLED AT DEPLOY WITH PRODUCTION DOMAIN */}
        <link rel="canonical" href="/programs" />
      </Helmet>

      {/* ─────────────────────────────────────────────────────────────────────
          1. PROGRAMS HERO — HeroSurface (lagoon radiant)
          ───────────────────────────────────────────────────────────────────── */}
      <HeroSurface glowOrigin="bottom-center" minHeight="72vh">
        <div className="mx-auto w-full max-w-4xl px-6 py-section-lg text-center">
          <p className="text-eyebrow text-gold-400 mb-5 animate-fade-in">
            OFFICIAL PROGRAMS
          </p>
          <h1
            className="text-display-xl text-ivory-100 animate-fade-up"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            THE HEARTBEAT OF
            <br />
            <span style={{ color: 'hsl(43 80% 73%)' }}>THE MOVEMENT.</span>
          </h1>
          <GoldThread className="mt-8 mx-auto" length="240px" node />
          <p
            className="mt-8 text-ivory-200 text-lg leading-relaxed max-w-2xl mx-auto animate-fade-in"
            style={{ animationDelay: '0.15s' }}
          >
            Our programs are where the global community meets in person — moments
            of culture, business, diplomacy and celebration that power a network
            alive 365 days a year.
          </p>
        </div>
      </HeroSurface>

      {/* Transition: lagoon → ivory */}
      <div style={{ backgroundColor: 'hsl(38 57% 94%)' }}>
        <GeometricAccent variant="lagoon-on-ivory" height={20} />
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          2. HOW PROGRAMS WORK — ivory surface
          ───────────────────────────────────────────────────────────────────── */}
      <section className="bg-ivory-100 py-section-lg">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5">
              <SectionHeading
                eyebrow="MOMENTS OF CONNECTION"
                heading="EVERY PROGRAM FEEDS THE ECOSYSTEM"
                thread
                size="lg"
                surface="light"
              />
            </div>
            <div className="lg:col-span-6 lg:col-start-7 flex items-center">
              <p className="text-ink-800 leading-relaxed text-lg">
                Each official program brings together members of the Movement —
                creatives, entrepreneurs, investors, institutions and
                changemakers — around a shared purpose. The connections made on
                stage, in forums and behind the scenes continue inside the
                Movement long after each edition ends.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Transition: ivory → lagoon (decorative strip at top of dark section) */}
      <div
        style={{ backgroundColor: 'hsl(187 67% 12%)' }}
        aria-hidden="true"
      >
        <GeometricAccent variant="gold-on-lagoon" height={20} />
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          3. THE PROGRAMS — dark cinematic card grid (cards are now links)
          ───────────────────────────────────────────────────────────────────── */}
      <section
        className="py-section-lg"
        style={{ backgroundColor: 'hsl(187 67% 12%)' }}
        aria-label="Official programs"
      >
        <div className="mx-auto max-w-7xl px-6">
          {/* Grid: 1-col mobile / 2-col tablet / 3-col desktop */}
          <ul
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px"
            style={{ backgroundColor: 'hsl(188 66% 22%)' }}
            role="list"
          >
            {PROGRAMS.map((program) => (
              <li key={program.name} role="listitem">
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
            <StatBlock value="15" label="Sectors Connected"     surface="dark" />
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
  photo,
  label,
}: {
  slug: string;
  name: string;
  tagline: string;
  desc: string;
  photo: string;
  label: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/programs/${slug}`}
      aria-label={name}
      className="block h-full focus:outline-none"
      style={{
        // Gold focus ring via box-shadow (works across all browsers without Tailwind ring utilities)
        boxShadow: 'none',
      }}
      onFocus={(e) => {
        e.currentTarget.style.boxShadow = '0 0 0 2px hsl(39 52% 54%), 0 0 0 4px hsl(187 67% 12%)';
      }}
      onBlur={(e) => {
        e.currentTarget.style.boxShadow = 'none';
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <article
        className="flex flex-col h-full cursor-pointer"
        style={{
          borderTop: '2px solid hsl(39 52% 54%)',
          backgroundColor: hovered ? 'hsl(188 66% 16%)' : 'hsl(187 67% 12%)',
          transition: 'background-color 200ms ease',
        }}
      >
        {/* Photo area with dev label overlay */}
        <div className="relative overflow-hidden">
          <PhotoSlot
            filename={photo}
            alt=""
            className="w-full aspect-[4/3]"
            duotone
          />
          {/* Dev label — tiny, elegant, disappears behind real photos */}
          <div
            aria-hidden="true"
            className="absolute bottom-0 inset-x-0 flex justify-center pb-3 pointer-events-none"
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

        {/* Text body */}
        <div className="px-6 pt-6 pb-8 flex flex-col gap-3 flex-1">
          {/* Program name — Cinzel, ivory, prominent */}
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.78rem',
              letterSpacing: '0.12em',
              lineHeight: 1.4,
              textTransform: 'uppercase',
              color: hovered ? 'hsl(43 80% 73%)' : 'hsl(38 57% 94%)',
              transition: 'color 200ms ease',
            }}
          >
            {name}
          </h3>

          {/* Tagline — gold eyebrow style */}
          <p
            style={{
              fontSize: '0.6rem',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              fontWeight: 600,
              color: 'hsl(39 52% 54%)',
            }}
          >
            {tagline}
          </p>

          {/* Description — body text */}
          <p
            className="text-sm leading-relaxed mt-1"
            style={{
              color: hovered ? 'hsl(38 57% 94%)' : 'hsl(189 30% 72%)',
              transition: 'color 200ms ease',
            }}
          >
            {desc}
          </p>
        </div>
      </article>
    </Link>
  );
}
