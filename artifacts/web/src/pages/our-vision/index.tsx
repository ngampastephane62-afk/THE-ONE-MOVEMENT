import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import HeroSurface from '@/components/HeroSurface';
import GoldThread from '@/components/GoldThread';
import SectionHeading from '@/components/SectionHeading';
import GeometricAccent from '@/components/GeometricAccent';
import PhotoSlot from '@/components/PhotoSlot';

/* ── Pillar data (verbatim from spec) ─────────────────────────────────────── */

const PILLARS: { name: string; desc: string }[] = [
  { name: 'Culture',             desc: 'Fashion, music, dance, film and art as universal languages.' },
  { name: 'Business',            desc: 'Enterprise and entrepreneurship across continents.' },
  { name: 'Investment',          desc: 'Capital meeting talent and opportunity.' },
  { name: 'Diplomacy',           desc: 'Dialogue between nations, institutions and peoples.' },
  { name: 'Innovation',          desc: 'Technology and ideas that change what is possible.' },
  { name: 'Education',           desc: 'Knowledge, universities and the next generation.' },
  { name: 'Tourism',             desc: 'Cultures discovering each other.' },
  { name: 'Media',               desc: 'Stories and voices that inform the world.' },
  { name: 'Humanitarian Impact', desc: 'Connection with a conscience.' },
];

const STEPS: { label: string; desc: string }[] = [
  {
    label: 'EXPRESS INTEREST',
    desc: 'Tell us who you are, what you do and what brings you to the Movement.',
  },
  {
    label: 'FOLLOW THE WORK',
    desc: 'Receive official updates about confirmed programs and future platform developments.',
  },
  {
    label: 'TAKE PART',
    desc: 'Respond when a relevant program, partnership or participation opportunity is confirmed.',
  },
];

/* ── Page ─────────────────────────────────────────────────────────────────── */

export default function OurVision() {
  return (
    <div>
      <Helmet>
        <title>OUR VISION — THE ONE MOVEMENT INTERNATIONAL</title>
        <meta name="description" content="Born in the Democratic Republic of Congo and developing a global collaboration ecosystem. Our vision, mission and pillars of connection, opportunity and peace." />
        <meta property="og:title" content="OUR VISION — THE ONE MOVEMENT INTERNATIONAL" />
        <meta property="og:description" content="Born in the Democratic Republic of Congo and developing a global collaboration ecosystem. Our vision, mission and pillars of connection, opportunity and peace." />
        {/* FILLED AT DEPLOY WITH PRODUCTION DOMAIN */}
        <link rel="canonical" href="/our-vision" />
      </Helmet>

      {/* ───────────────────────────────────────────────────────────────────────
          1. VISION HERO — HeroSurface (lagoon radiant), split layout
          ─────────────────────────────────────────────────────────────────────── */}
      <HeroSurface glowOrigin="behind" minHeight="85vh">
        <div className="mx-auto w-full max-w-7xl px-6 py-section-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left: headline */}
            <div className="lg:col-span-6">
              <p className="text-eyebrow text-gold-400 mb-5">OUR VISION</p>
              <h1
                className="text-display-xl text-ivory-100 animate-fade-up"
                style={{ fontFamily: 'var(--font-display)', textWrap: 'balance' } as React.CSSProperties}
              >
                CONNECTING{' '}
                <span style={{ color: 'hsl(43 80% 73%)' }}>HUMANITY.</span>
                <br />
                CREATING OPPORTUNITY.
                <br />
                BUILDING PEACE.
              </h1>
              <GoldThread className="mt-8" length="240px" node />
              <p
                className="mt-6 text-ivory-200 text-lg leading-relaxed max-w-lg animate-fade-in"
                style={{ animationDelay: '0.15s' }}
              >
                The One Movement International brings people, cultures, businesses and
                institutions together through programs and dialogue. Its longer-term
                vision is a trusted global collaboration ecosystem.
              </p>
            </div>

            {/* Right: cinematic media area */}
            <div
              className="lg:col-span-5 lg:col-start-8 animate-fade-in"
              style={{ animationDelay: '0.25s' }}
            >
              <MediaArea
                filename="vision-hero.jpg"
                label="HERO MEDIA — CINEMATIC CULTURES MONTAGE"
                className="w-full aspect-[3/4]"
              />
            </div>
          </div>
        </div>
      </HeroSurface>

      {/* Transition: lagoon → ivory */}
      <div style={{ backgroundColor: 'hsl(38 57% 94%)' }}>
        <GeometricAccent variant="lagoon-on-ivory" height={20} />
      </div>

      {/* ───────────────────────────────────────────────────────────────────────
          2. THE MISSION — ivory surface
          ─────────────────────────────────────────────────────────────────────── */}
      <section className="bg-ivory-100 py-section-lg">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-5">
              <SectionHeading
                eyebrow="THE MISSION"
                heading="BUILDING TOWARD A CONNECTED GLOBAL ECOSYSTEM"
                thread
                size="lg"
                surface="light"
              />
            </div>
            <div className="lg:col-span-6 lg:col-start-7 flex items-center">
              <p className="text-ink-800 leading-relaxed text-lg">
                Our mission is to bring creatives, entrepreneurs, investors, institutions,
                governments and changemakers into meaningful contact across borders and
                sectors. Today that work begins through public programs and direct
                enquiries; broader digital collaboration tools remain part of the future.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────────────────
          3. BORN IN BUKAVU — asymmetric, ivory-50, photo + text
          ─────────────────────────────────────────────────────────────────────── */}
      <section
        className="py-section-lg border-t"
        style={{
          backgroundColor: 'hsl(40 71% 98%)',
          borderColor: 'hsl(36 26% 74%)',
        }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

            {/* Left: photo */}
            <div className="lg:col-span-5">
              <MediaArea
                filename="vision-bukavu.jpg"
                label="ORIGIN STORY IMAGE — BUKAVU"
                className="w-full aspect-[3/4]"
              />
            </div>

            {/* Right: text */}
            <div className="lg:col-span-6 lg:col-start-7">
              <p className="text-eyebrow text-gold-600 mb-4">WHERE IT BEGAN</p>
              <h2
                className="text-display-lg text-ink-900 mb-6"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                BORN IN BUKAVU.
                <br />
                FORGED BY HOPE.
              </h2>

              <div className="space-y-5 text-ink-800 leading-relaxed">
                <p>
                  The One Movement began as The One Fashion Week in Bukavu, in the east
                  of the Democratic Republic of Congo — a region that has lived through
                  decades of conflict. In a place where the world saw crisis, a community
                  of designers, models, artists and organizers chose to build a stage for
                  something else: dignity, creativity and peace.
                </p>
                <p>
                  Edition after edition — in Bukavu, in Goma, in Kinshasa — the runway
                  carried one message to audiences living the reality of war: we are one
                  people. The fifth edition in Kinshasa was held under the theme Peace and
                  Unity. Any formal description of institutional support for that edition
                  remains subject to Founder confirmation. Fashion had become more than
                  fashion. It had become a voice.
                </p>
              </div>

              <GoldThread className="mt-10" length="200px" node />
            </div>
          </div>
        </div>
      </section>

      {/* Transition: ivory → lagoon */}
      <div style={{ backgroundColor: 'hsl(187 67% 12%)' }}>
        <GeometricAccent variant="gold-on-lagoon" height={20} />
      </div>

      {/* ───────────────────────────────────────────────────────────────────────
          4. FROM EVENT TO MOVEMENT — lagoon-900 band, photo, pull-quote
          ─────────────────────────────────────────────────────────────────────── */}
      <section className="py-section-lg" style={{ backgroundColor: 'hsl(187 67% 12%)' }}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left: text + pull-quote */}
            <div className="lg:col-span-6">
              <p className="text-eyebrow text-gold-400 mb-4">THE TURNING POINT</p>
              <h2
                className="text-display-lg text-ivory-100 mb-8"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                AN EVENT ENDS.
                <br />
                A MOVEMENT DOES NOT.
              </h2>
              <p className="text-ivory-200 leading-relaxed text-lg mb-10">
                What began as days on a calendar revealed a truth larger than any single
                event: the conversations created between creatives, institutions,
                communities and markets deserved to continue beyond the runway. The One
                Movement International was formed to develop that wider direction.
              </p>

              {/* Pull-quote */}
              <blockquote
                className="border-s-2 ps-6 mb-6"
                style={{ borderColor: 'hsl(43 80% 73%)' }}
              >
                <p
                  className="text-display-md"
                  style={{
                    fontFamily: 'var(--font-display)',
                    color: 'hsl(43 80% 73%)',
                  }}
                >
                  ONE PEOPLE.
                  <br />
                  ONE SINGLE
                  <br />
                  HUMAN RACE.
                </p>
              </blockquote>
              <p className="text-ivory-300 leading-relaxed ps-8 max-w-lg">
                This is the belief at the center of everything we build: that every
                human being — of every origin, body, ability and story — deserves a
                place on the world's stage.
              </p>
            </div>

            {/* Right: photo */}
            <div className="lg:col-span-5 lg:col-start-8">
              <MediaArea
                filename="vision-culture-peace.jpg"
                label="CULTURE AND PEACE IMAGE"
                className="w-full aspect-[4/5]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Transition: lagoon → ivory */}
      <div style={{ backgroundColor: 'hsl(38 57% 94%)' }}>
        <GeometricAccent variant="lagoon-on-ivory" height={20} />
      </div>

      {/* ───────────────────────────────────────────────────────────────────────
          5. THE 365-DAY MODEL — ivory, three-step layout
          ─────────────────────────────────────────────────────────────────────── */}
      <section className="bg-ivory-100 py-section-lg">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            eyebrow="HOW IT WORKS"
            heading="FROM PROGRAMS TO A FUTURE PLATFORM"
            thread
            size="lg"
            surface="light"
          />
          <p className="mt-6 text-ink-800 leading-relaxed text-lg max-w-2xl">
            Official programs create real moments of connection today. A future member
            platform, social network and digital collaboration workspace are planned
            directions, not services currently available on this website.
          </p>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {STEPS.map(({ label, desc }, i) => (
              <StepCard key={label} step={i + 1} label={label} desc={desc} />
            ))}
          </div>
        </div>
      </section>

      {/* Transition: ivory → lagoon */}
      <div style={{ backgroundColor: 'hsl(187 67% 12%)' }}>
        <GeometricAccent variant="gold-on-lagoon" height={20} />
      </div>

      {/* ───────────────────────────────────────────────────────────────────────
          6. THE PILLARS — lagoon-900, 3×3 grid
          ─────────────────────────────────────────────────────────────────────── */}
      <section className="py-section-lg" style={{ backgroundColor: 'hsl(187 67% 12%)' }}>
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            eyebrow="WHAT WE CONNECT"
            heading="NINE PILLARS. ONE ECOSYSTEM."
            size="lg"
            surface="dark"
          />
          <div
            className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px"
            style={{ backgroundColor: 'hsl(188 46% 22%)' }}
          >
            {PILLARS.map(({ name, desc }) => (
              <PillarTile key={name} name={name} desc={desc} />
            ))}
          </div>
        </div>
      </section>

      {/* Transition (GeometricAccent divider above section 7): lagoon → ivory */}
      <div style={{ backgroundColor: 'hsl(38 57% 94%)' }}>
        <GeometricAccent variant="lagoon-on-ivory" height={20} />
      </div>

      {/* ───────────────────────────────────────────────────────────────────────
          7. THE DISTINCTION — ivory, important clarification
          ─────────────────────────────────────────────────────────────────────── */}
      <section className="bg-ivory-100 py-section-lg">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-5">
              <SectionHeading
                eyebrow="AN IMPORTANT DISTINCTION"
                heading="THE MOVEMENT AND THE FASHION WEEK"
                thread
                size="lg"
                surface="light"
              />
            </div>
            <div className="lg:col-span-6 lg:col-start-7 flex items-center">
              <p className="text-ink-800 leading-relaxed text-lg">
                The One Movement International is not a fashion week. The One Fashion
                Week International is one of our official programs — a powerful
                expression of the Movement's values, alongside programs dedicated to
                diplomacy, leadership, investment, recognition and culture. The Movement
                is the ecosystem. The programs are its heartbeat.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Transition: ivory → lagoon */}
      <div style={{ backgroundColor: 'hsl(187 67% 12%)' }}>
        <GeometricAccent variant="gold-on-lagoon" height={20} />
      </div>

      {/* ───────────────────────────────────────────────────────────────────────
          8. THE GLOBAL AMBITION — lagoon-900 band, asymmetric, photo right
          ─────────────────────────────────────────────────────────────────────── */}
      <section className="py-section-lg" style={{ backgroundColor: 'hsl(187 67% 12%)' }}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left: text (asymmetric — narrower) */}
            <div className="lg:col-span-5">
              <p className="text-eyebrow text-gold-400 mb-4">WHERE WE ARE GOING</p>
              <h2
                className="text-display-lg text-ivory-100 mb-8"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                A TRUSTED HOME
                <br />
                FOR GLOBAL
                <br />
                CONNECTION
              </h2>
              <p className="text-ivory-200 leading-relaxed text-lg">
                Our ambition is to build a trusted cross-sector community and a digital
                and physical home where people and institutions can find one another and
                work together. That platform is future direction. Current participation
                happens through the programs and enquiry pathways described on this site.
              </p>
            </div>

            {/* Right: photo (asymmetric — wider) */}
            <div className="lg:col-span-6 lg:col-start-7">
              <MediaArea
                filename="vision-global-community.jpg"
                label="GLOBAL COMMUNITY IMAGE"
                className="w-full aspect-[4/3]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────────────────
          9. CLOSING INVITATION — HeroSurface
          ─────────────────────────────────────────────────────────────────────── */}
      <HeroSurface minHeight="60vh" className="px-6">
        <div className="mx-auto max-w-4xl py-section-lg text-center">
          <h2
            className="text-display-lg text-ivory-100 animate-fade-up"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            THE MOVEMENT IS OPEN.
            <br />
            <span style={{ color: 'hsl(43 80% 73%)' }}>THE WORLD IS INVITED.</span>
          </h2>
          <GoldThread className="mt-8 mx-auto" length="240px" node />
          <div
            className="mt-10 flex flex-wrap justify-center gap-4 animate-fade-in"
            style={{ animationDelay: '0.15s' }}
          >
            <Link href="/join">
              <Button size="xl" variant="default">
                JOIN THE MOVEMENT
              </Button>
            </Link>
            <Link href="/ecosystem">
              <Button size="xl" variant="gold-outline">
                EXPLORE THE ECOSYSTEM
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
 * MediaArea — wraps PhotoSlot and overlays an elegant dev label
 * in the fallback surface (appears when brand-photos/ file is absent).
 * Label is tiny, gold, uppercase — clearly a reserved production area.
 */
function MediaArea({
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
      {/* Dev label — overlaid at bottom of placeholder; very subtle when photo loads */}
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
 * PillarTile — one of the nine ecosystem pillars.
 * Pattern mirrors SectorTile on the homepage.
 */
function PillarTile({ name, desc }: { name: string; desc: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="px-6 py-7 transition-colors duration-200 cursor-default"
      style={{
        backgroundColor: hovered ? 'hsl(189 74% 25%)' : 'hsl(187 67% 12%)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <p
        className="text-eyebrow mb-2 transition-colors duration-200"
        style={{ color: hovered ? 'hsl(43 80% 73%)' : 'hsl(39 52% 54%)' }}
      >
        {name}
      </p>
      <p
        className="text-sm leading-relaxed transition-colors duration-200"
        style={{ color: hovered ? 'hsl(38 57% 94%)' : 'hsl(189 30% 72%)' }}
      >
        {desc}
      </p>
    </div>
  );
}

/**
 * StepCard — one of the three 365-Day Model steps.
 * Uses the ivory card pattern with gold accent top.
 */
function StepCard({
  step,
  label,
  desc,
}: {
  step: number;
  label: string;
  desc: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="rounded-sharp border-t-2 border p-7 transition-colors duration-200 cursor-default"
      style={{
        backgroundColor: hovered ? 'hsl(189 74% 32%)' : 'hsl(40 71% 98%)',
        borderTopColor: 'hsl(39 52% 54%)',
        borderColor: hovered ? 'hsl(189 74% 32%)' : 'hsl(36 26% 74%)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span
        className="block text-display-md mb-1 transition-colors duration-200"
        style={{
          fontFamily: 'var(--font-display)',
          color: hovered ? 'hsl(43 80% 73%)' : 'hsl(39 52% 54%)',
          lineHeight: 1,
        }}
        aria-hidden="true"
      >
        {String(step).padStart(2, '0')}
      </span>
      <p
        className="text-eyebrow mb-3 transition-colors duration-200"
        style={{ color: hovered ? 'hsl(43 80% 73%)' : 'hsl(37 55% 40%)' }}
      >
        {label}
      </p>
      <p
        className="text-sm leading-relaxed transition-colors duration-200"
        style={{ color: hovered ? 'hsl(38 57% 94%)' : 'hsl(29 35% 16%)' }}
      >
        {desc}
      </p>
    </div>
  );
}
