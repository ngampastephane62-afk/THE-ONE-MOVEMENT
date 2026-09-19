import { Helmet } from 'react-helmet-async';
import { type CSSProperties, useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import HeroSurface from '@/components/HeroSurface';
import GoldThread from '@/components/GoldThread';
import SectionHeading from '@/components/SectionHeading';
import StatBlock from '@/components/StatBlock';
import GeometricAccent from '@/components/GeometricAccent';
import PhotoMosaic from '@/components/PhotoMosaic';
import PhotoSlot from '@/components/PhotoSlot';
import HomeExperience from './HomeExperience';

export default HomeExperience;

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
    extra: 'Five completed editions. Born in the DRC. The sixth is planned for November and currently postponed.',
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

function LegacyHome() {
  const [heroPhotoVisible, setHeroPhotoVisible] = useState(true);

  return (
    <div>
      <Helmet>
        <title>THE ONE MOVEMENT INTERNATIONAL — ONE HUMANITY. ONE MOVEMENT. ONE FUTURE.</title>
        <meta name="description" content="A global movement bringing creatives, entrepreneurs, institutions and changemakers together through programs, dialogue and a developing collaboration ecosystem." />
        <meta property="og:title" content="THE ONE MOVEMENT INTERNATIONAL — ONE HUMANITY. ONE MOVEMENT. ONE FUTURE." />
        <meta property="og:description" content="A global movement bringing creatives, entrepreneurs, institutions and changemakers together through programs, dialogue and a developing collaboration ecosystem." />
        {/* FILLED AT DEPLOY WITH PRODUCTION DOMAIN */}
        <link rel="canonical" href="/" />
      </Helmet>

      {/* ─────────────────────────────────────────────────────────────────────
          1. HERO — cinematic emerald/gold field; media slot is video-ready placeholder.
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
        {/* Quiet connection field: intelligence is represented by relationships,
            not a robot or neon interface. */}
        <div className="tomi-network-field absolute inset-0 z-[2]" aria-hidden="true">
          <span className="tomi-network-line tomi-network-line-one" />
          <span className="tomi-network-line tomi-network-line-two" />
          <span className="tomi-network-line tomi-network-line-three" />
          <span className="tomi-network-node tomi-network-node-one" />
          <span className="tomi-network-node tomi-network-node-two" />
          <span className="tomi-network-node tomi-network-node-three" />
        </div>

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
                A global movement bringing creatives, entrepreneurs, institutions and
                changemakers together through programs, dialogue and a developing
                collaboration ecosystem.
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
                <Link href="/ecosystem">
                  <Button size="lg" variant="gold-outline" aria-label="Explore the ecosystem">
                    EXPLORE THE ECOSYSTEM
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: archive media slot + bilingual signature */}
            <div
              className="lg:col-span-4 lg:col-start-9 flex flex-col gap-6 animate-fade-in"
              style={{ animationDelay: '0.3s' }}
            >
              <PhotoSlot
                filename="photo-01.jpg"
                alt="Founder archive image required: a global connection scene"
                imageType="Founder image required · Global connection"
                aspectRatio="4:5"
                mobileCrop="Keep the central human connection visible"
                desktopCrop="Place people in the lower-right third with space for the headline"
                purpose="Establish TOMI as a human bridge between Africa, the UAE and the wider world."
                objectPosition="center"
                priority
                className="w-full aspect-[4/5] max-w-sm lg:ms-auto"
                duotone
              />
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
                heading="A MOVEMENT TO JOIN. A VISION TO BUILD."
                thread
                size="lg"
                surface="light"
              />
              <PhotoSlot
                filename="photo-07.jpg"
                alt="Founder archive image required: people in conversation across cultures"
                imageType="Founder image required · Human connection"
                aspectRatio="5:4"
                mobileCrop="Keep faces and hands within the centre third"
                desktopCrop="Preserve the full conversation around the table"
                purpose="Show real people exchanging ideas across cultures and institutions."
                className="mt-10 w-full aspect-[5/4]"
                variant="rounded"
                duotone={false}
              />
            </div>

            {/* Definition + contrast strip */}
            <div className="lg:col-span-6 lg:col-start-7 flex flex-col gap-8">
              <p className="text-ink-800 leading-relaxed">
                The One Movement International is a global movement born from a fashion
                initiative for peace in the Democratic Republic of Congo. It brings people,
                organizations and institutions together around fifteen sectors and six
                official programs, with a wider collaboration platform planned for the future.
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
                    is: 'A year-round direction expressed through programs and future digital tools.',
                  },
                  {
                    not: 'Not only an organization',
                    is: 'A developing ecosystem you can follow and help shape.',
                  },
                  {
                    not: 'Not promises',
                    is: 'Work that begins with real conversations and confirmed programs.',
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
                  Its fifth edition in Kinshasa was held under the theme Peace and Unity.
                  Any formal description of institutional support for that edition remains
                  subject to Founder confirmation. What began as a runway became a wider
                  movement connecting culture, business, diplomacy and humanitarian action.
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
                briefs={[
                  {
                    subject: 'Founder archive: Fashion Week runway',
                    purpose: 'Show the movement’s origin through a strong human runway moment.',
                    desktopCrop: 'Full figure with audience context',
                    mobileCrop: 'Keep model and garment centred',
                  },
                  {
                    subject: 'Founder archive: designer portrait',
                    purpose: 'Give a creator a clear human presence.',
                    desktopCrop: 'Portrait with working environment',
                    mobileCrop: 'Face and hands',
                  },
                  {
                    subject: 'Founder archive: audience',
                    purpose: 'Show cultural exchange and public participation.',
                    desktopCrop: 'Wide crowd context',
                    mobileCrop: 'Central group',
                  },
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

          <ConnectionField />

          {/* Featured sector tiles grid */}
          <div
            className="mt-8 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-px"
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

          {/* Flagship proof point — Fashion Week is the origin story, not a
              small card in a generic program grid. */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch rounded-sharp overflow-hidden border border-sand-200 bg-ivory-50">
            <div className="lg:col-span-7 min-h-[22rem]">
              <PhotoMosaic
                filenames={['fashion-week-runway.jpg', 'fashion-week-designer.jpg', 'fashion-week-audience.jpg']}
                briefs={[
                  {
                    subject: 'Founder image required: flagship runway',
                    purpose: 'Lead with the visual proof of five completed Fashion Week editions.',
                    desktopCrop: 'Runway, model and audience in one frame',
                    mobileCrop: 'Full garment and face',
                  },
                  {
                    subject: 'Founder image required: designer backstage',
                    purpose: 'Show the craft and people behind the program.',
                    desktopCrop: 'Designer at work',
                    mobileCrop: 'Hands, fabric and face',
                  },
                  {
                    subject: 'Founder image required: cultural audience',
                    purpose: 'Show participation, exchange and atmosphere.',
                    desktopCrop: 'Wide social context',
                    mobileCrop: 'Central human moment',
                  },
                ]}
                className="h-full"
              />
            </div>
            <div className="lg:col-span-5 flex flex-col justify-center p-7 sm:p-10">
              <p className="text-eyebrow text-gold-600 mb-4">FLAGSHIP PROGRAM</p>
              <h3 className="text-display-md text-ink-900" style={{ fontFamily: 'var(--font-display)' }}>
                THE ONE FASHION WEEK INTERNATIONAL
              </h3>
              <GoldThread className="mt-5 mb-6" length="180px" node />
              <p className="text-ink-800 leading-relaxed">
                Fashion crosses language, carries identity and creates room for people to meet.
                Five editions are completed. The sixth is planned for November and is currently postponed.
              </p>
              <Link href="/programs/fashion-week" className="mt-7">
                <Button variant="gold-outline" size="sm" aria-label="Explore The One Fashion Week International">
                  EXPLORE FASHION WEEK
                </Button>
              </Link>
            </div>
          </div>

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
          6. FUTURE INTELLIGENCE — visible future direction, never presented as
          a live account or AI product.
          ───────────────────────────────────────────────────────────────────── */}
      <section aria-labelledby="future-intelligence-heading" className="tomi-aurora-surface py-section-lg">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5">
              <p className="text-eyebrow text-gold-400 mb-4">DEVELOPING FUTURE DIRECTION</p>
              <h2 id="future-intelligence-heading" className="text-display-lg text-ivory-100" style={{ fontFamily: 'var(--font-display)' }}>
                INTELLIGENCE THAT HELPS PEOPLE MOVE.
              </h2>
              <GoldThread className="mt-6 mb-7" length="190px" node />
              <p className="text-ivory-200 leading-relaxed">
                The future TOMI platform is intended to help people find relevant people,
                organizations, opportunities, events and next actions. That layer is being
                developed; it is not a live AI service or member platform today.
              </p>
            </div>
            <div className="lg:col-span-6 lg:col-start-7">
              <div className="tomi-intelligence-panel rounded-sharp border border-lagoon-600/60 p-6 sm:p-8">
                <div className="flex items-center justify-between gap-4 border-b border-lagoon-600/50 pb-5">
                  <p className="text-eyebrow text-gold-400">A FUTURE TOMI PROMPT</p>
                  <span className="rounded-full border border-gold-500/50 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-gold-400">
                    In development
                  </span>
                </div>
                <div className="grid gap-4 py-6 sm:grid-cols-2">
                  <FuturePrompt label="WHAT DID YOU ACCOMPLISH TODAY?" />
                  <FuturePrompt label="WHAT DO YOU WANT TO ACCOMPLISH TOMORROW?" />
                </div>
                <div className="tomi-signal-list" aria-label="Future recommendation examples">
                  {['People', 'Organizations', 'Opportunities', 'Events', 'Programs', 'Communities'].map((item, index) => (
                    <span key={item} style={{ '--signal-delay': `${index * 80}ms` } as CSSProperties}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          7. WHY JOIN — NEW, ivory (lagoon surface continues then breaks to ivory).
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
            eyebrow="WHY REACH OUT"
            heading="START WITH A CONVERSATION."
            thread
            size="lg"
            surface="dark"
            align="center"
          />

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                word: 'GROW',
                desc: 'Tell us about your craft, venture or work and what you hope to develop.',
              },
              {
                word: 'CONNECT',
                desc: 'Hear about relevant programs, conversations and future opportunities as they are confirmed.',
              },
              {
                word: 'CREATE',
                desc: 'Bring an idea, perspective or possible collaboration to the Movement.',
              },
              {
                word: 'IMPACT',
                desc: 'Explore where your contribution may fit as programs and partnerships develop.',
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
          8. GLOBAL IMPACT — NEW, lagoon-900 continues.
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
                text: 'Kinshasa hosts the fifth edition under the theme Peace and Unity. Any institutional-support attribution remains subject to Founder confirmation.',
              },
              {
                period: 'TODAY',
                text: 'The One Movement International brings together fifteen sectors and six official programs, with a broader digital collaboration platform planned for the future.',
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
          9. PARTNERSHIP PATHWAY — NEW short band (lagoon-900 continues).
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
          10. CLOSING — REUSE existing final invitation section.
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

function ConnectionField() {
  return (
    <div className="tomi-connection-field mt-10 overflow-hidden rounded-sharp border border-lagoon-600/60 p-5 sm:p-8">
      <div className="relative min-h-[15rem] sm:min-h-[18rem]">
        <div className="absolute inset-0 opacity-80" aria-hidden="true">
          <span className="tomi-orbit tomi-orbit-one" />
          <span className="tomi-orbit tomi-orbit-two" />
          <span className="tomi-orbit tomi-orbit-three" />
          <span className="tomi-field-node tomi-field-node-one" />
          <span className="tomi-field-node tomi-field-node-two" />
          <span className="tomi-field-node tomi-field-node-three" />
          <span className="tomi-field-node tomi-field-node-four" />
        </div>
        <div className="relative z-10 flex min-h-[15rem] flex-col items-center justify-center text-center sm:min-h-[18rem]">
          <p className="text-eyebrow text-gold-400">THE CONNECTION LAYER</p>
          <p className="mt-3 max-w-md text-display-md text-ivory-100" style={{ fontFamily: 'var(--font-display)' }}>
            MANY WORLDS. ONE MOVEMENT.
          </p>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-ivory-300">
            Business, culture, diplomacy, media, humanitarian action and opportunity
            meet here as distinct parts of one developing ecosystem.
          </p>
        </div>
      </div>
    </div>
  );
}

function FuturePrompt({ label }: { label: string }) {
  return (
    <div className="rounded-sharp border border-lagoon-600/60 bg-lagoon-900/70 p-5">
      <span className="mb-6 block h-1 w-10 bg-gold-500/80" aria-hidden="true" />
      <p className="text-sm leading-relaxed text-ivory-100">{label}</p>
      <p className="mt-4 text-xs uppercase tracking-[0.15em] text-lagoon-400">A future starting point</p>
    </div>
  );
}
