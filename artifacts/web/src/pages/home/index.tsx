import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import HeroSurface from '@/components/HeroSurface';
import GoldThread from '@/components/GoldThread';
import SectionHeading from '@/components/SectionHeading';
import StatBlock from '@/components/StatBlock';
import GeometricAccent from '@/components/GeometricAccent';
import PhotoSlot from '@/components/PhotoSlot';
import PhotoMosaic from '@/components/PhotoMosaic';

/* ── Data ──────────────────────────────────────────────────────────────────── */

const SECTORS = [
  'Fashion & Design',
  'Arts & Culture',
  'Music & Sound',
  'Film & Media',
  'Business & Investment',
  'Diplomacy & Governance',
  'Education & Research',
  'Technology & Innovation',
  'Tourism & Hospitality',
  'Healthcare & Wellness',
  'Sports & Lifestyle',
  'Architecture & Urban Design',
  'Environment & Sustainability',
  'Humanitarian Action',
  'Youth & Leadership',
];

const CATEGORIES = [
  {
    title: 'Creative & Cultural',
    desc: 'Designers, artists, musicians, filmmakers and storytellers from every tradition and every continent.',
  },
  {
    title: 'Business & Innovation',
    desc: 'Entrepreneurs, investors and innovators building across borders with purpose at the core.',
  },
  {
    title: 'Institutions',
    desc: 'Universities, embassies, cultural institutions and international bodies shaping the world through policy and partnership.',
  },
  {
    title: 'Community & Impact',
    desc: 'NGOs, community leaders and humanitarian organizations driving dignity and change on the ground.',
  },
  {
    title: 'Strategic Support',
    desc: 'Media partners, legal advisors, production specialists and operational enablers of the ecosystem.',
  },
];

const PROGRAMS: {
  name: string;
  tagline: string;
  extra?: string;
  photo: string;
}[] = [
  {
    name: 'THE ONE FASHION WEEK INTERNATIONAL',
    tagline: 'Fashion as a force for peace and cultural exchange.',
    extra: 'Six editions. Born in the DRC. Recognized internationally.',
    photo: 'photo-07.jpg',
  },
  {
    name: 'THE ONE BUSINESS FORUM',
    tagline: 'Where commerce meets conscience across continents.',
    photo: 'photo-08.jpg',
  },
  {
    name: 'THE ONE DIPLOMATIC CIRCLE',
    tagline: 'Culture and diplomacy as instruments of lasting peace.',
    photo: 'photo-09.jpg',
  },
  {
    name: 'THE ONE EDUCATION NETWORK',
    tagline: 'Knowledge without borders, learning without limits.',
    photo: 'photo-10.jpg',
  },
  {
    name: 'THE ONE MEDIA LAB',
    tagline: 'Telling the stories the world needs to hear.',
    photo: 'photo-11.jpg',
  },
  {
    name: 'THE ONE IMPACT INITIATIVE',
    tagline: 'Direct humanitarian action rooted in community dignity.',
    photo: 'photo-12.jpg',
  },
];

/* ── Component ─────────────────────────────────────────────────────────────── */

export default function Home() {
  const [heroPhotoVisible, setHeroPhotoVisible] = useState(true);

  return (
    <div>
      {/* ─────────────────────────────────────────────────────────────────────
          1. HERO — lagoon radiant surface with optional photo-01.jpg
          ───────────────────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-[85vh] flex flex-col justify-center overflow-hidden"
        style={{ backgroundColor: 'hsl(187 67% 12%)' }}
      >
        {/* Full-bleed photo background with lagoon duotone overlay */}
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

        {/* Deep lagoon duotone overlay — always shown for contrast */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-[1]"
          style={{
            background: heroPhotoVisible
              ? 'linear-gradient(to bottom, hsl(187 67% 12% / 0.88) 0%, hsl(187 67% 12% / 0.72) 50%, hsl(187 67% 12% / 0.88) 100%)'
              : 'none',
          }}
        />

        {/* Gold radial glow — the teal-meets-gold sunrise */}
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
            {/* Left: oversized headline */}
            <div className="lg:col-span-7">
              <p className="text-eyebrow text-gold-400 mb-5">
                ONE WORLD. ONE PURPOSE. ONE MOVEMENT.
              </p>
              <h1 className="text-display-xl text-ivory-100 animate-fade-up">
                THE ONE
                <br />
                <span style={{ color: 'hsl(43 80% 73%)' }}>MOVEMENT</span>
                <br />
                INTERNATIONAL
              </h1>
              <GoldThread className="mt-8" length="280px" node />
              <p
                className="mt-6 text-ivory-200 text-lg leading-relaxed max-w-xl animate-fade-in"
                style={{ animationDelay: '0.15s' }}
              >
                A permanent global ecosystem connecting culture, business, diplomacy,
                education, tourism, media and humanitarian impact.
              </p>
              <div
                className="mt-8 flex flex-wrap gap-4 animate-fade-in"
                style={{ animationDelay: '0.25s' }}
              >
                <Link href="/join-the-movement">
                  <Button size="lg" variant="default">
                    Join the Movement
                  </Button>
                </Link>
                <Link href="/ecosystem">
                  <Button size="lg" variant="gold-outline">
                    Explore Ecosystem
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: stat blocks + bilingual signature */}
            <div
              className="lg:col-span-4 lg:col-start-9 flex flex-col gap-8 animate-fade-in"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="grid grid-cols-2 gap-8">
                <StatBlock value="6"  label="Fashion Week Editions" surface="dark" />
                <StatBlock value="15" label="Sectors Connected"     surface="dark" />
                <StatBlock value="6"  label="Official Programs"     surface="dark" />
                <StatBlock value="1"  label="Global Movement"       surface="dark" />
              </div>
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
          2. WHAT WE ARE — three pillars, ivory surface
          ───────────────────────────────────────────────────────────────────── */}
      <section className="bg-ivory-100 py-section-lg">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-5">
              <SectionHeading
                eyebrow="Our Purpose"
                heading="NOT AN EVENT. A PERMANENT ECOSYSTEM."
                thread
                size="lg"
                surface="light"
              />
            </div>
            <div className="lg:col-span-6 lg:col-start-7 flex flex-col gap-10">
              {[
                {
                  label: 'CULTURE & IDENTITY',
                  text: 'Fashion, arts, music, film and language as instruments of connection, expression and peace — shared across every border.',
                },
                {
                  label: 'BUSINESS & DIPLOMACY',
                  text: 'A living bridge between entrepreneurs, creative leaders, institutions and governments. Commerce that carries a conscience.',
                },
                {
                  label: 'HUMANITARIAN ACTION',
                  text: 'From runway to relief — every pillar of the ecosystem is in service of human dignity, from the DRC to the world.',
                },
              ].map(({ label, text }) => (
                <div key={label} className="flex gap-5">
                  <div className="shrink-0 pt-1">
                    <GoldThread direction="vertical" length="100%" />
                  </div>
                  <div>
                    <p className="text-eyebrow text-gold-600 mb-2">{label}</p>
                    <p className="text-ink-800 leading-relaxed">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          3. OUR STORY — new section, ivory, photo mosaic
          ───────────────────────────────────────────────────────────────────── */}
      <section
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
              <blockquote className="mt-10 border-s-2 ps-6" style={{ borderColor: 'hsl(39 52% 54%)' }}>
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

            {/* Photo mosaic column */}
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
          4. ECOSYSTEM — lagoon-900 band, 15 sector tiles
          ───────────────────────────────────────────────────────────────────── */}
      <section className="py-section-lg" style={{ backgroundColor: 'hsl(187 67% 12%)' }}>
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            eyebrow="15 Sectors"
            heading="A WORLD BUILT ON CONNECTION"
            subheading="The ecosystem spans every dimension of human endeavor — united by a single purpose."
            thread
            size="lg"
            surface="dark"
          />

          <div
            className="mt-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-px"
            style={{ backgroundColor: 'hsl(188 46% 22%)' }}
          >
            {SECTORS.map((sector) => (
              <SectorTile key={sector} label={sector} />
            ))}
          </div>
        </div>
      </section>

      {/* Transition: lagoon → ivory */}
      <div style={{ backgroundColor: 'hsl(38 57% 94%)' }}>
        <GeometricAccent variant="lagoon-on-ivory" height={20} />
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          5. WHO CAN JOIN — ivory, category cards with gold top + lagoon hover
          ───────────────────────────────────────────────────────────────────── */}
      <section className="bg-ivory-100 py-section-lg">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            eyebrow="Community"
            heading="WHO CAN JOIN"
            subheading="The ecosystem is open to every sector. If your work connects, creates, or cares — you belong here."
            thread
            size="lg"
            surface="light"
            align="center"
          />

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CATEGORIES.map(({ title, desc }) => (
              <CategoryCard key={title} title={title} desc={desc} />
            ))}
          </div>
        </div>
      </section>

      {/* Transition: ivory → lagoon */}
      <div style={{ backgroundColor: 'hsl(187 67% 12%)' }}>
        <GeometricAccent variant="gold-on-lagoon" height={20} />
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          6. OFFICIAL PROGRAMS — lagoon band, program cards with photo bg
          ───────────────────────────────────────────────────────────────────── */}
      <section className="py-section-lg" style={{ backgroundColor: 'hsl(187 67% 12%)' }}>
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            eyebrow="Six Programs"
            heading="OFFICIAL PROGRAMS"
            thread
            size="lg"
            surface="dark"
          />

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROGRAMS.map(({ name, tagline, extra, photo }) => (
              <div
                key={name}
                className="group rounded-sharp overflow-hidden"
                style={{ backgroundColor: 'hsl(188 66% 16%)' }}
              >
                {/* Photo thumbnail with duotone overlay */}
                <div className="relative h-40 overflow-hidden">
                  <PhotoSlot
                    filename={photo}
                    alt=""
                    className="w-full h-full"
                    duotone
                  />
                  {/* Lagoon overlay for contrast */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0"
                    style={{ background: 'hsl(187 67% 12% / 0.55)' }}
                  />
                </div>

                {/* Card body */}
                <div className="p-6">
                  <div
                    className="h-0.5 w-10 mb-5"
                    style={{ backgroundColor: 'hsl(39 52% 54%)' }}
                  />
                  <p
                    className="text-xs font-semibold tracking-widest text-ivory-100 mb-2"
                    style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.09em' }}
                  >
                    {name}
                  </p>
                  <p className="text-sm text-ivory-300 leading-relaxed">{tagline}</p>
                  {extra && (
                    <p className="mt-3 text-xs" style={{ color: 'hsl(43 80% 73%)' }}>
                      {extra}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          7. STAT BAND — gold-400 numbers on lagoon-900
          ───────────────────────────────────────────────────────────────────── */}
      <section
        className="py-section-md border-t border-b"
        style={{
          backgroundColor: 'hsl(188 66% 16%)',
          borderColor: 'hsl(188 46% 22%)',
        }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <StatBlock value="6"  label="Fashion Week Editions" surface="dark" />
            <StatBlock value="15" label="Sectors Connected"     surface="dark" />
            <StatBlock value="6"  label="Official Programs"     surface="dark" />
            <StatBlock value="1"  label="Global Movement"       surface="dark" />
          </div>
        </div>
      </section>

      {/* Transition: lagoon → ivory */}
      <div style={{ backgroundColor: 'hsl(38 57% 94%)' }}>
        <GeometricAccent variant="lagoon-on-ivory" height={20} />
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          8. IMPACT — ivory, text + photo-13. No donation language.
          ───────────────────────────────────────────────────────────────────── */}
      <section className="bg-ivory-100 py-section-lg">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6">
              <SectionHeading
                eyebrow="Impact"
                heading="WHAT WE STAND FOR"
                thread
                size="lg"
                surface="light"
              />
              <div className="mt-8 space-y-5 text-ink-800 leading-relaxed">
                <p>
                  The One Movement was built on the conviction that creativity
                  and culture are not luxuries — they are the infrastructure
                  of peace. Every program, every connection, every story told
                  within this ecosystem is an act of solidarity.
                </p>
                <p>
                  We do not measure success in revenue or reach alone. We
                  measure it in the number of voices given a platform, in
                  the partnerships forged between people who had no reason
                  to meet — and every reason to remain divided.
                </p>
                <p>
                  From the Democratic Republic of Congo outward, we carry
                  one belief: the world is not broken beyond repair. It
                  simply needs people willing to build something together.
                </p>
              </div>
            </div>
            <div className="lg:col-span-5 lg:col-start-8">
              <PhotoSlot
                filename="photo-13.jpg"
                alt=""
                className="w-full aspect-[4/5]"
                duotone
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
          9. FINAL INVITATION — lagoon radiant surface, gold glow
          ───────────────────────────────────────────────────────────────────── */}
      <HeroSurface minHeight="60vh" className="px-6">
        <div className="mx-auto max-w-5xl py-section-lg text-center">
          <p className="text-eyebrow text-gold-400 mb-6">
            ONE WORLD. ONE PURPOSE. ONE MOVEMENT.
          </p>
          <h2
            className="text-display-lg text-ivory-100 animate-fade-up"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            THE WORLD IS READY.
            <br />
            <span style={{ color: 'hsl(43 80% 73%)' }}>ARE YOU?</span>
          </h2>
          <GoldThread className="mt-8 mx-auto" length="240px" node />
          <p className="mt-8 text-ivory-200 text-lg leading-relaxed max-w-2xl mx-auto">
            Join a permanent global ecosystem. Bring your creativity,
            your vision, your sector. Together we are building something
            the world has never seen.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/join-the-movement">
              <Button size="xl" variant="default">
                Join the Movement
              </Button>
            </Link>
            <Link href="/our-vision">
              <Button size="xl" variant="gold-outline">
                Our Vision
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

/* ── Small extracted components to keep JSX clean ─────────────────────────── */

function SectorTile({ label }: { label: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="px-5 py-6 transition-colors duration-200 cursor-default"
      style={{
        backgroundColor: hovered ? 'hsl(189 74% 32%)' : 'hsl(187 67% 12%)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <p
        className="text-xs font-medium tracking-wide transition-colors duration-200"
        style={{
          color: hovered ? 'hsl(43 80% 73%)' : 'hsl(38 57% 94%)',
          lineHeight: '1.5',
        }}
      >
        {label}
      </p>
    </div>
  );
}

function CategoryCard({ title, desc }: { title: string; desc: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="rounded-sharp p-6 border-t-2 border transition-colors duration-200 cursor-default"
      style={{
        backgroundColor: hovered ? 'hsl(189 74% 32%)' : 'hsl(40 71% 98%)',
        borderTopColor: hovered ? 'hsl(43 80% 73%)' : 'hsl(39 52% 54%)',
        borderColor: hovered ? 'hsl(189 74% 32%)' : 'hsl(36 26% 74%)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <p
        className="text-eyebrow mb-3 transition-colors duration-200"
        style={{ color: hovered ? 'hsl(43 80% 73%)' : 'hsl(37 55% 40%)' }}
      >
        {title}
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
