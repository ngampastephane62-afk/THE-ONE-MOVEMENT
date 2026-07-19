import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import HeroSurface from '@/components/HeroSurface';
import GoldThread from '@/components/GoldThread';
import SectionHeading from '@/components/SectionHeading';
import StatBlock from '@/components/StatBlock';
import GeometricAccent from '@/components/GeometricAccent';
import PhotoMosaic from '@/components/PhotoMosaic';

/* ── Data ──────────────────────────────────────────────────────────────────── */

/**
 * FEATURED SECTORS — five for the preview band (desktop), two + all-sectors
 * tile on mobile. Descriptors are from the canonical sectors-data registry.
 */
const FEATURED_SECTORS = [
  { name: 'Fashion',             descriptor: 'Design, craft and identity on the world stage' },
  { name: 'Business',            descriptor: 'Enterprise connecting continents' },
  { name: 'Diplomacy',           descriptor: 'Dialogue between nations and peoples' },
  { name: 'Investment',          descriptor: 'Capital meeting opportunity' },
  { name: 'Humanitarian Action', descriptor: 'Impact where it matters most' },
];

const MORE_SECTORS_LIST =
  'Music, Dance, Film, Art, Tourism, Innovation, Technology, NGOs, Media, Education';

/**
 * PROGRAMS — matched to live /programs/:slug detail routes.
 * Fashion Week card retains the approved "extra" line per spec.
 */
const PROGRAMS: {
  slug: string;
  name: string;
  tagline: string;
  extra?: string;
}[] = [
  {
    slug: 'fashion-week',
    name: 'THE ONE FASHION WEEK INTERNATIONAL',
    tagline: 'Fashion as a force for peace and cultural exchange.',
    extra: 'Five editions. Born in the DRC. Recognized internationally.',
  },
  {
    slug: 'summit',
    name: 'THE ONE SUMMIT',
    tagline: 'Leadership, innovation and business across continents.',
  },
  {
    slug: 'diplomatic-gala',
    name: 'THE ONE DIPLOMATIC GALA',
    tagline: 'Culture and diplomacy as instruments of lasting peace.',
  },
  {
    slug: 'awards',
    name: 'THE ONE AWARDS',
    tagline: 'Recognizing excellence, courage and positive impact.',
  },
  {
    slug: 'fashion-night',
    name: 'THE ONE FASHION NIGHT',
    tagline: 'Fashion meets music, art and celebration.',
  },
  {
    slug: 'investment-forum',
    name: 'THE ONE INVESTMENT FORUM',
    tagline: 'Where capital meets creativity and conviction.',
  },
];

/* ── Component ─────────────────────────────────────────────────────────────── */

export default function Home() {
  const [heroPhotoVisible, setHeroPhotoVisible] = useState(true);

  return (
    <div>
      <Helmet>
        <title>THE ONE MOVEMENT INTERNATIONAL — ONE HUMANITY. ONE MOVEMENT. ONE FUTURE.</title>
        <meta name="description" content="A global ecosystem connecting creatives, entrepreneurs, institutions and changemakers — turning connection into opportunity, and opportunity into impact." />
        <meta property="og:title" content="THE ONE MOVEMENT INTERNATIONAL — ONE HUMANITY. ONE MOVEMENT. ONE FUTURE." />
        <meta property="og:description" content="A global ecosystem connecting creatives, entrepreneurs, institutions and changemakers — turning connection into opportunity, and opportunity into impact." />
        {/* FILLED AT DEPLOY WITH PRODUCTION DOMAIN */}
        <link rel="canonical" href="/" />
      </Helmet>

      {/* ─────────────────────────────────────────────────────────────────────
          1. HERO — lagoon radiant surface; media slot is video-ready placeholder.
          Headline: ONE HUMANITY. ONE MOVEMENT. ONE FUTURE. ("FUTURE." in gold-400)
          Eyebrow unchanged: A GLOBAL CONNECTION ECOSYSTEM
          ───────────────────────────────────────────────────────────────────── */}
      <section
        aria-label="Hero"
        className="relative min-h-[85vh] flex flex-col justify-center overflow-hidden"
        style={{ backgroundColor: 'hsl(187 67% 12%)' }}
      >
        {/* ── Video-ready media slot — shows photo-01.jpg while video absent ── */}
        {heroPhotoVisible && (
          <img
            src="/brand-photos/photo-01.jpg"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover z-0"
            loading="eager"
            onError={() => setHeroPhotoVisible(false)}
          />
        )}

        {/* Deep lagoon duotone overlay */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-[1]"
          style={{
            background: heroPhotoVisible
              ? 'linear-gradient(to bottom, hsl(187 67% 12% / 0.88) 0%, hsl(187 67% 12% / 0.72) 50%, hsl(187 67% 12% / 0.88) 100%)'
              : 'none',
          }}
        />

        {/* Gold radial glow */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-[2]"
          style={{
            background: `
              radial-gradient(ellipse 100% 50% at 50% 115%, hsl(39 52% 54% / 0.28) 0%, transparent 65%),
              radial-gradient(ellipse 70% 35% at 25% 110%, hsl(43 80% 73% / 0.12) 0%, transparent 55%)
            `,
          }}
        />

        {/* Top vignette */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-24 z-[3]"
          style={{
            background: 'linear-gradient(to bottom, hsl(187 67% 12% / 0.7) 0%, transparent 100%)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-section-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
            {/* Left: headline + CTAs */}
            <div className="lg:col-span-8">
              <p className="text-eyebrow text-gold-400 mb-5">
                A GLOBAL CONNECTION ECOSYSTEM
              </p>
              <h1 className="text-display-xl text-ivory-100 animate-fade-up" style={{ fontFamily: 'var(--font-display)' }}>
                ONE HUMANITY.
                <br />
                ONE MOVEMENT.
                <br />
                <span style={{ color: 'hsl(43 80% 73%)' }}>ONE FUTURE.</span>
              </h1>
              <GoldThread className="mt-8" length="280px" node />
              <p
                className="mt-6 text-ivory-200 text-lg leading-relaxed max-w-xl animate-fade-in"
                style={{ animationDelay: '0.15s' }}
              >
                A global ecosystem connecting creatives, entrepreneurs, institutions and
                changemakers — turning connection into opportunity, and opportunity into impact.
              </p>
              <div
                className="mt-8 flex flex-wrap gap-4 animate-fade-in"
                style={{ animationDelay: '0.25s' }}
              >
                <Link href="/join">
                  <Button size="lg" variant="default" aria-label="Join the Movement">
                    JOIN THE MOVEMENT
                  </Button>
                </Link>
                <Link href="/programs">
                  <Button size="lg" variant="gold-outline" aria-label="Discover our programs">
                    DISCOVER OUR PROGRAMS
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: bilingual signature */}
            <div
              className="lg:col-span-3 lg:col-start-10 flex flex-col gap-8 animate-fade-in"
              style={{ animationDelay: '0.3s' }}
            >
              <div
                className="border-t pt-6"
                style={{ borderColor: 'hsl(188 46% 24%)' }}
              >
                <p
                  lang="ar"
                  dir="rtl"
                  className="text-display-md font-arabic text-gold-400"
                  style={{ fontFamily: 'var(--font-arabic)' }}
                  aria-label="We Are One"
                >
                  نحن واحد
                </p>
                <p className="text-xs text-ivory-300 mt-1 tracking-widest uppercase">
                  WE ARE ONE
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transition: hero → ivory */}
      <div style={{ backgroundColor: 'hsl(38 57% 94%)' }}>
        <GeometricAccent variant="lagoon-on-ivory" height={20} />
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          2. WHAT IS THE ONE MOVEMENT? — NEW, ivory, compact
          Definition paragraph + four-item contrast strip as a structured list.
          ───────────────────────────────────────────────────────────────────── */}
      <section aria-label="What is the One Movement" className="bg-ivory-100 py-section-lg">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

            {/* Heading column */}
            <div className="lg:col-span-5">
              <SectionHeading
                eyebrow="WHAT THIS IS"
                heading="A MOVEMENT YOU JOIN. AN ECOSYSTEM THAT WORKS."
                thread
                size="lg"
                surface="light"
              />
            </div>

            {/* Definition + contrast strip */}
            <div className="lg:col-span-6 lg:col-start-7 flex flex-col gap-8">
              <p className="text-ink-800 leading-relaxed">
                The One Movement International is a permanent global ecosystem — born from a
                fashion movement for peace in the Democratic Republic of Congo — connecting
                people, organizations and institutions across fifteen sectors to create
                collaboration, opportunity and positive impact, 365 days a year.
              </p>

              {/* Contrast strip — four statements, exposed as a list */}
              <ul
                className="flex flex-col gap-0 border-t"
                style={{ borderColor: 'hsl(36 26% 74%)' }}
                aria-label="What the One Movement is not"
              >
                {[
                  {
                    not: 'Not a fashion week',
                    is: 'The One Fashion Week International is one of our official programs.',
                  },
                  {
                    not: 'Not a single event',
                    is: 'A permanent community, alive every day of the year.',
                  },
                  {
                    not: 'Not only an organization',
                    is: 'An ecosystem you become part of.',
                  },
                  {
                    not: 'Not promises',
                    is: 'Connection that becomes action.',
                  },
                ].map(({ not, is }) => (
                  <li
                    key={not}
                    className="flex gap-4 items-start py-5 border-b"
                    style={{ borderColor: 'hsl(36 26% 74%)' }}
                  >
                    <div className="shrink-0 pt-0.5">
                      <GoldThread direction="vertical" length="100%" />
                    </div>
                    <div>
                      <p className="text-eyebrow text-gold-600 mb-1">{not}</p>
                      <p className="text-ink-800 leading-relaxed text-sm">{is}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Transition: ivory → off-white (story section) */}
      <div style={{ backgroundColor: 'hsl(40 71% 98%)' }}>
        <GeometricAccent variant="lagoon-on-ivory" height={16} />
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          3. WHY WE EXIST — REUSE existing Our Story section, moved to position 3.
          Copy unchanged. FROM CONGO TO THE WORLD / BORN IN CRISIS. BUILT FOR PEACE.
          ───────────────────────────────────────────────────────────────────── */}
      <section
        aria-labelledby="story-heading"
        className="py-section-lg border-t"
        style={{
          backgroundColor: 'hsl(40 71% 98%)',
          borderColor: 'hsl(36 26% 74%)',
        }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

            {/* Text column */}
            <div className="lg:col-span-5">
              <p className="text-eyebrow text-gold-600 mb-4">From Congo to the World</p>
              <h2
                id="story-heading"
                className="text-display-lg text-ink-900 mb-6"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                BORN IN CRISIS.
                <br />
                BUILT FOR PEACE.
              </h2>
              <GoldThread className="mb-8" length="200px" node />

              <div className="space-y-5 text-ink-800 leading-relaxed">
                <p>
                  The One Movement began as The One Fashion Week in Bukavu, Democratic
                  Republic of Congo — a fashion event created in a region living through
                  one of the world's longest conflicts. Edition after edition, in Bukavu,
                  Goma and Kinshasa, it gave a stage to designers, models and artists
                  carrying one message: peace, unity and the celebration of every human
                  being.
                </p>
                <p>
                  Its fifth edition in Kinshasa, held under the theme Peace and Unity,
                  was supported by the United Nations mission MONUSCO. What began as a
                  runway became a voice. And that voice grew into something larger than
                  any event — a global movement connecting culture, business, diplomacy
                  and humanitarian action, 365 days a year.
                </p>
              </div>

              {/* Pull-quote */}
              <blockquote
                className="mt-10 border-s-2 ps-6"
                style={{ borderColor: 'hsl(39 52% 54%)' }}
              >
                <p
                  className="text-display-md"
                  style={{
                    fontFamily: 'var(--font-display)',
                    color: 'hsl(39 52% 54%)',
                  }}
                >
                  "ONE PEOPLE.
                  <br />
                  ONE SINGLE
                  <br />
                  HUMAN RACE."
                </p>
              </blockquote>
            </div>

            {/* Photo mosaic */}
            <div className="lg:col-span-6 lg:col-start-7">
              <PhotoMosaic
                filenames={[
                  'photo-02.jpg',
                  'photo-03.jpg',
                  'photo-04.jpg',
                  'photo-05.jpg',
                  'photo-06.jpg',
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Transition: ivory → lagoon */}
      <div style={{ backgroundColor: 'hsl(187 67% 12%)' }}>
        <GeometricAccent variant="gold-on-lagoon" height={20} />
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          4. ECOSYSTEM PREVIEW — ENHANCED sector grid into a preview band.
          Desktop: 5 featured tiles + 1 "AND TEN MORE SECTORS" tile.
          Mobile: 2 featured tiles + the all-sectors tile.
          Ghost CTA → /ecosystem  (full 15-tile grid removed from homepage).
          ───────────────────────────────────────────────────────────────────── */}
      <section
        aria-labelledby="ecosystem-heading"
        className="py-section-lg"
        style={{ backgroundColor: 'hsl(187 67% 12%)' }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            eyebrow="FIFTEEN SECTORS. ONE NETWORK."
            heading="WHERE WORLDS CONNECT"
            thread
            size="lg"
            surface="dark"
          />

          {/* Featured sector tiles grid */}
          <div
            className="mt-12 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-px"
            role="list"
            aria-label="Featured sectors"
            style={{ backgroundColor: 'hsl(188 46% 22%)' }}
          >
            {/* 5 featured tiles — show all on desktop, first 2 on mobile */}
            {FEATURED_SECTORS.map((sector, idx) => (
              <div
                key={sector.name}
                role="listitem"
                className={idx >= 2 ? 'hidden sm:block' : ''}
              >
                <FeaturedSectorTile name={sector.name} descriptor={sector.descriptor} />
              </div>
            ))}

            {/* "AND TEN MORE SECTORS" tile — always visible */}
            <AllSectorsTile label={MORE_SECTORS_LIST} />
          </div>

          {/* Ghost CTA */}
          <div className="mt-10 flex justify-center">
            <Link href="/ecosystem">
              <Button variant="gold-outline" size="lg" aria-label="Explore the full ecosystem">
                EXPLORE THE FULL ECOSYSTEM
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Transition: lagoon → ivory */}
      <div style={{ backgroundColor: 'hsl(38 57% 94%)' }}>
        <GeometricAccent variant="lagoon-on-ivory" height={20} />
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          5. OFFICIAL PROGRAMS — REUSE existing six-card section.
          New intro line above grid. DISCOVER links to live /programs/:slug routes.
          Fashion Week card "extra" line unchanged.
          ───────────────────────────────────────────────────────────────────── */}
      <section
        aria-labelledby="programs-heading"
        className="bg-ivory-100 py-section-lg"
      >
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            eyebrow="SIX PROGRAMS"
            heading="OFFICIAL PROGRAMS"
            thread
            size="lg"
            surface="light"
          />

          {/* Intro line — spec verbatim */}
          <p className="mt-6 text-ink-800 leading-relaxed max-w-2xl">
            Six official programs. One of them started it all. The One Fashion Week
            International is one official program of The One Movement International.
          </p>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROGRAMS.map(({ slug, name, tagline, extra }) => (
              <ProgramCard key={slug} slug={slug} name={name} tagline={tagline} extra={extra} />
            ))}
          </div>
        </div>
      </section>

      {/* Transition: ivory → lagoon */}
      <div style={{ backgroundColor: 'hsl(187 67% 12%)' }}>
        <GeometricAccent variant="gold-on-lagoon" height={20} />
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          6. WHY JOIN — NEW, ivory (lagoon surface continues then breaks to ivory).
          Replaces the old "Who Can Join" five-group section on the homepage.
          That content is preserved on /join and /vision — not deleted there.
          ───────────────────────────────────────────────────────────────────── */}
      <section
        aria-labelledby="why-join-heading"
        className="py-section-lg"
        style={{ backgroundColor: 'hsl(188 66% 16%)' }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            eyebrow="WHY JOIN"
            heading="GROW. CONNECT. CREATE. IMPACT."
            thread
            size="lg"
            surface="dark"
            align="center"
          />

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                word: 'GROW',
                desc: 'Access a community built to develop your craft, your venture and your voice.',
              },
              {
                word: 'CONNECT',
                desc: 'Meet people and organizations you would never otherwise reach — across sectors and continents.',
              },
              {
                word: 'CREATE',
                desc: 'Turn connections into collaborations, projects and programs.',
              },
              {
                word: 'IMPACT',
                desc: 'Be part of work that improves lives — from cultural visibility to humanitarian action.',
              },
            ].map(({ word, desc }) => (
              <WhyJoinCard key={word} word={word} desc={desc} />
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <Link href="/join">
              <Button size="lg" variant="default" aria-label="Join the Movement">
                JOIN THE MOVEMENT
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          7. GLOBAL IMPACT — NEW, lagoon-900 continues.
          Absorbs the old standalone stat band (removed as a separate section).
          Timeline + verified stat row. Future slots commented out, not rendered.
          ───────────────────────────────────────────────────────────────────── */}
      <section
        aria-labelledby="impact-heading"
        className="py-section-lg border-t"
        style={{
          backgroundColor: 'hsl(187 67% 12%)',
          borderColor: 'hsl(188 46% 22%)',
        }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            eyebrow="PROOF, NOT PROMISES"
            heading="WHAT IS ALREADY REAL"
            thread
            size="lg"
            surface="dark"
          />

          {/* Timeline — exposed as an ordered list for assistive tech */}
          <ol
            className="mt-12 flex flex-col gap-0 border-t"
            style={{ borderColor: 'hsl(188 46% 22%)' }}
            aria-label="Movement timeline"
          >
            {[
              {
                period: '2019',
                text: 'The One Fashion Week is born in Bukavu, Democratic Republic of Congo.',
              },
              {
                period: '2019–2022',
                text: 'Three editions in Bukavu carry a message of peace through fashion.',
              },
              {
                period: '2024',
                text: 'Goma hosts the fourth edition.',
              },
              {
                period: '2025',
                text: 'Kinshasa hosts the fifth edition, supported by the United Nations mission MONUSCO under the theme Peace and Unity.',
              },
              {
                period: 'TODAY',
                text: 'The movement becomes The One Movement International: fifteen sectors, six official programs, one permanent global ecosystem.',
              },
            ].map(({ period, text }) => (
              <li
                key={period}
                className="flex gap-6 items-start py-6 border-b"
                style={{ borderColor: 'hsl(188 46% 22%)' }}
              >
                <div className="shrink-0 w-28">
                  <span
                    className="text-eyebrow"
                    style={{ color: 'hsl(43 80% 73%)' }}
                  >
                    {period}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-ivory-200 leading-relaxed text-sm">{text}</p>
                </div>
              </li>
            ))}
            {/*
             * FUTURE SLOT — verified impact stories:
             * Uncomment when content is approved and verified.
             * Example: { period: 'FUTURE', text: '...' }
             */}
          </ol>

          {/* Stat row — verified numbers only */}
          <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-8">
            <StatBlock value="5"  label="FASHION WEEK EDITIONS" surface="dark" />
            <StatBlock value="6"  label="OFFICIAL PROGRAMS"     surface="dark" />
            <StatBlock value="15" label="SECTORS CONNECTED"     surface="dark" />
            <StatBlock value="1"  label="GLOBAL MOVEMENT"       surface="dark" />
            {/*
             * FUTURE SLOT — verified metrics (e.g. countries reached, partners verified):
             * Do not add numbers here without owner verification.
             */}
          </div>

          {/* Closing line */}
          <p
            className="mt-10 text-sm leading-relaxed max-w-xl"
            style={{ color: 'hsl(188 46% 60%)' }}
          >
            Our impact reporting grows with the Movement — and is always verified.
          </p>

          {/*
           * FUTURE SLOT — authorized partner logos:
           * Add only after written authorization from each partner.
           * Never render logos based on verbal mentions or press coverage.
           */}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          8. PARTNERSHIP PATHWAY — NEW short band (lagoon-900 continues).
          Outline CTA → /join  (anchor /join#institutional noted: not yet live;
          link falls back to /join per spec — never a dead anchor).
          ───────────────────────────────────────────────────────────────────── */}
      <section
        aria-labelledby="partnership-heading"
        className="py-section-md border-t border-b"
        style={{
          backgroundColor: 'hsl(188 66% 16%)',
          borderColor: 'hsl(188 46% 22%)',
        }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <p className="text-eyebrow text-gold-400 mb-3">FOR INSTITUTIONS &amp; PARTNERS</p>
              <h2
                id="partnership-heading"
                className="text-display-md text-ivory-100 mb-5"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                PARTNERSHIP BEGINS WITH A CONVERSATION.
              </h2>
              <GoldThread length="160px" node className="mb-6" />
              <p className="text-ivory-200 leading-relaxed mb-3">
                Embassies, governments, international organizations, universities, NGOs,
                sponsors and media join the Movement through direct dialogue.
              </p>
              <p className="text-ivory-200 leading-relaxed">
                Partnership is built on verification and trust — every collaboration begins
                with a conversation.
              </p>
            </div>
            <div className="lg:col-span-4 lg:col-start-9 flex items-center">
              {/*
               * NOTE: /join#institutional anchor not yet live (Join page is a parallel task).
               * Linking to /join as a safe fallback per spec — update when Join page merges.
               */}
              <Link href="/join">
                <Button variant="gold-outline" size="lg" aria-label="Become a partner">
                  BECOME A PARTNER
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Transition: lagoon → ivory */}
      <div style={{ backgroundColor: 'hsl(187 67% 12%)' }}>
        <GeometricAccent variant="gold-on-lagoon" height={20} />
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          9. CLOSING — REUSE existing final invitation section.
          Headline updated to approved wording: THE MOVEMENT IS OPEN. THE WORLD IS INVITED.
          Primary CTA → /join. Bilingual signature retained.
          ───────────────────────────────────────────────────────────────────── */}
      <HeroSurface minHeight="60vh" className="px-6">
        <div className="mx-auto max-w-5xl py-section-lg text-center">
          <p className="text-eyebrow text-gold-400 mb-6">
            ONE HUMANITY. ONE MOVEMENT. ONE FUTURE.
          </p>
          <h2
            className="text-display-lg text-ivory-100 animate-fade-up"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            THE MOVEMENT IS OPEN.
            <br />
            <span style={{ color: 'hsl(43 80% 73%)' }}>THE WORLD IS INVITED.</span>
          </h2>
          <GoldThread className="mt-8 mx-auto" length="240px" node />
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/join">
              <Button size="xl" variant="default" aria-label="Join the Movement">
                JOIN THE MOVEMENT
              </Button>
            </Link>
          </div>
          <p
            className="mt-12 text-sm font-semibold tracking-wide"
            style={{ color: 'hsl(43 80% 73%)' }}
            aria-label="We Are One"
          >
            WE ARE ONE{' '}
            <span className="opacity-40 mx-2" aria-hidden="true">/</span>
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

/* ── Section sub-components (composed from existing primitives) ───────────── */

/**
 * FeaturedSectorTile — preview tile for the ecosystem band.
 * Same hover pattern as the retired SectorTile, now showing a descriptor line.
 */
function FeaturedSectorTile({ name, descriptor }: { name: string; descriptor: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="px-5 py-7 transition-colors duration-200 cursor-default h-full"
      style={{
        backgroundColor: hovered ? 'hsl(189 74% 32%)' : 'hsl(187 67% 12%)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <p
        className="text-xs font-semibold tracking-widest mb-2 transition-colors duration-200 uppercase"
        style={{
          color: hovered ? 'hsl(43 80% 73%)' : 'hsl(38 57% 94%)',
          fontFamily: 'var(--font-display)',
        }}
      >
        {name}
      </p>
      <p
        className="text-xs leading-relaxed transition-colors duration-200"
        style={{ color: hovered ? 'hsl(38 57% 94% / 0.85)' : 'hsl(188 46% 60%)' }}
      >
        {descriptor}
      </p>
    </div>
  );
}

/**
 * AllSectorsTile — the "+10 more sectors" tile in the preview band.
 */
function AllSectorsTile({ label }: { label: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="px-5 py-7 transition-colors duration-200 cursor-default h-full border-t sm:border-t-0 sm:border-l"
      style={{
        backgroundColor: hovered ? 'hsl(188 66% 16%)' : 'hsl(188 66% 14%)',
        borderColor: 'hsl(188 46% 22%)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <p
        className="text-xs font-semibold tracking-widest mb-2 uppercase"
        style={{
          color: 'hsl(39 52% 54%)',
          fontFamily: 'var(--font-display)',
        }}
      >
        AND TEN MORE SECTORS
      </p>
      <p
        className="text-xs leading-relaxed"
        style={{ color: 'hsl(188 46% 55%)' }}
      >
        {label}
      </p>
    </div>
  );
}

/**
 * ProgramCard — program card with DISCOVER link to /programs/:slug.
 * Composed from the existing lagoon card pattern.
 */
function ProgramCard({
  slug,
  name,
  tagline,
  extra,
}: {
  slug: string;
  name: string;
  tagline: string;
  extra?: string;
}) {
  return (
    <div
      className="group rounded-sharp overflow-hidden flex flex-col"
      style={{ backgroundColor: 'hsl(40 71% 98%)', border: '1px solid hsl(36 26% 74%)' }}
    >
      {/* Gold top accent */}
      <div className="h-1 w-full" style={{ backgroundColor: 'hsl(39 52% 54%)' }} />

      {/* Card body */}
      <div className="p-6 flex flex-col flex-1">
        <p
          className="text-xs font-semibold tracking-widest text-ink-900 mb-2"
          style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.09em' }}
        >
          {name}
        </p>
        <p className="text-sm text-ink-700 leading-relaxed flex-1">{tagline}</p>
        {extra && (
          <p className="mt-3 text-xs" style={{ color: 'hsl(39 52% 54%)' }}>
            {extra}
          </p>
        )}
        <div className="mt-5">
          <Link href={`/programs/${slug}`}>
            <Button
              variant="gold-outline"
              size="sm"
              aria-label={`Discover ${name}`}
            >
              DISCOVER
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * WhyJoinCard — one of four "Why Join" cards (GROW / CONNECT / CREATE / IMPACT).
 * Composed from existing card pattern on lagoon surface.
 */
function WhyJoinCard({ word, desc }: { word: string; desc: string }) {
  return (
    <div
      className="rounded-sharp p-6 border-t-2"
      style={{
        backgroundColor: 'hsl(187 67% 12%)',
        borderTopColor: 'hsl(39 52% 54%)',
        border: '1px solid hsl(188 46% 22%)',
        borderTop: '2px solid hsl(39 52% 54%)',
      }}
    >
      <p
        className="text-eyebrow text-gold-400 mb-3"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {word}
      </p>
      <p className="text-sm text-ivory-200 leading-relaxed">{desc}</p>
    </div>
  );
}
