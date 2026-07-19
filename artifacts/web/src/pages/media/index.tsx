import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import HeroSurface from '@/components/HeroSurface';
import GoldThread from '@/components/GoldThread';
import SectionHeading from '@/components/SectionHeading';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/* ── Media enquiry request card type ─────────────────────────────────────── */

interface EnquiryCard {
  title: string;
  description: string;
}

const ENQUIRY_CARDS: EnquiryCard[] = [
  {
    title: 'PRESS ENQUIRIES',
    description:
      'Interviews, statements and background information for journalists and editors.',
  },
  {
    title: 'INTERVIEW REQUESTS',
    description:
      'Requests to interview the Founder, program leads or Movement representatives.',
  },
  {
    title: 'PRESS COLLABORATION',
    description:
      'Editorial collaborations, joint features and shared storytelling with approved media partners.',
  },
];

/* ── Future media resource card type (NOT links — intentional) ────────────── */

interface ResourceCard {
  name: string;
  description: string;
}

const RESOURCE_CARDS: ResourceCard[] = [
  {
    name: 'PRESS KIT',
    description:
      'A complete media kit with brand overview, boilerplate, biographies and approved assets, prepared for editorial use.',
  },
  {
    name: 'BRAND GUIDELINES',
    description:
      "The Movement's visual identity system — colors, typography, logo usage and voice — for authorized reproduction.",
  },
  {
    name: 'PHOTOGRAPHY & FILMING REQUESTS',
    description:
      "The pathway for coordinating photography and filming at the Movement's programs and initiatives.",
  },
  {
    name: 'MEDIA ACCREDITATION',
    description:
      "The application process for press access, credentials and coverage of the Movement's official programs.",
  },
];

/* ── Page ─────────────────────────────────────────────────────────────────── */

export default function MediaHub() {
  return (
    <div>
      <Helmet>
        <title>MEDIA &amp; PRESS — THE ONE MOVEMENT INTERNATIONAL</title>
        <meta
          name="description"
          content="Official media hub for The One Movement International — brand overview, boilerplate and press pathways for journalists and media partners."
        />
        <meta
          property="og:title"
          content="MEDIA &amp; PRESS — THE ONE MOVEMENT INTERNATIONAL"
        />
        <meta
          property="og:description"
          content="Official media hub for The One Movement International — brand overview, boilerplate and press pathways for journalists and media partners."
        />
        {/* FILLED AT DEPLOY WITH PRODUCTION DOMAIN */}
        <link rel="canonical" href="/media" />
      </Helmet>

      {/* ───────────────────────────────────────────────────────────────────────
          1. HERO — HeroSurface lagoon radiant
          ───────────────────────────────────────────────────────────────────── */}
      <HeroSurface glowOrigin="bottom-center" minHeight="70vh">
        <div className="mx-auto w-full max-w-7xl px-6 py-section-lg">
          <p className="text-eyebrow text-gold-400 mb-6 animate-fade-in">
            MEDIA &amp; PRESS
          </p>
          <h1
            className="text-display-xl text-ivory-100 uppercase animate-fade-up"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            THE OFFICIAL MEDIA HUB.
          </h1>
          <GoldThread className="mt-8" length="200px" node />
          <p
            className="mt-6 text-ivory-200 text-lg leading-relaxed max-w-2xl animate-fade-in"
            style={{ animationDelay: '0.15s' }}
          >
            Institutional information, brand overview and press pathways for
            journalists, media partners and institutional visitors covering The
            One Movement International.
          </p>
        </div>
      </HeroSurface>

      {/* ───────────────────────────────────────────────────────────────────────
          2. BRAND OVERVIEW — ivory, asymmetric
          ───────────────────────────────────────────────────────────────────── */}
      <section
        className="w-full py-section-lg"
        style={{ backgroundColor: 'hsl(60 9% 97%)' }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <SectionHeading
              eyebrow="ABOUT THE MOVEMENT"
              heading="WHO WE ARE."
              surface="light"
              thread
            />
            <p className="mt-8 text-lagoon-800 text-lg leading-relaxed">
              The One Movement International is a permanent global ecosystem
              connecting people, organizations and institutions across culture,
              business, diplomacy, innovation, education, tourism, humanitarian
              action and investment. It operates 365 days a year and expresses
              its mission through six official programs.
            </p>
            <p className="mt-6 text-lagoon-800 text-lg leading-relaxed">
              The Movement grew from The One Fashion Week, a fashion movement
              for peace born in the Democratic Republic of Congo. Five editions
              have taken place — in Bukavu, Goma and Kinshasa. The fifth
              edition, in Kinshasa, was supported by the United Nations mission
              MONUSCO under the theme Peace and Unity.
            </p>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────────────────
          3. OFFICIAL BOILERPLATE — ivory continues, visually distinct panel
          The card signals "you may quote this verbatim" without additional prose.
          ───────────────────────────────────────────────────────────────────── */}
      <section
        className="w-full pb-section-lg"
        style={{ backgroundColor: 'hsl(60 9% 97%)' }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <SectionHeading
              eyebrow="OFFICIAL BOILERPLATE"
              heading="FOR PRESS USE."
              surface="light"
              thread
            />
            <p className="mt-8 text-lagoon-700 text-sm uppercase tracking-widest">
              The paragraph below is TOMI&apos;s official boilerplate. It may be
              quoted verbatim in press coverage.
            </p>
            {/* Visually distinct press-use panel — gold border, subtle lagoon tint */}
            <blockquote
              className="mt-4 rounded-sm border border-gold-500/40 px-8 py-7 text-lagoon-900 text-lg leading-relaxed not-italic"
              style={{ backgroundColor: 'hsl(187 40% 96%)' }}
            >
              The One Movement International is a permanent global ecosystem
              connecting people, organizations and institutions across fifteen
              sectors — from culture and creative industries to business,
              diplomacy, innovation and humanitarian action. Grown from a
              fashion movement for peace born in the Democratic Republic of
              Congo, the Movement expresses its mission through six official
              programs and a year-round community that turns connection into
              opportunity and opportunity into impact. The One Movement
              International is operated by Tropik Agence FZE LLC, registered in
              the Emirate of Ajman, United Arab Emirates.
            </blockquote>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────────────────
          4. MISSION & POSITIONING — lagoon-900 band
          ───────────────────────────────────────────────────────────────────── */}
      <section
        className="w-full py-section-lg"
        style={{ backgroundColor: 'hsl(187 67% 8%)' }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <SectionHeading
              eyebrow="OUR POSITIONING"
              heading="A MOVEMENT, NOT AN EVENT."
              surface="dark"
              thread
            />
            <p className="mt-8 text-ivory-300 text-lg leading-relaxed">
              The One Movement International is not a fashion week, an NGO, a
              single-event platform or a media organization. The One Fashion Week
              International is one of the Movement&apos;s six official programs. The
              Movement itself is the permanent ecosystem — the community, the
              network, and the framework of programs that give its members
              visibility, connection and opportunity throughout the year.
            </p>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────────────────
          5. MEDIA ENQUIRIES PATHWAY — ivory
          All three cards route to the same institutional inquiry anchor.
          No separate form. No email address. No phone number.
          Anchor /join#institutional-inquiry confirmed present in join page.
          ───────────────────────────────────────────────────────────────────── */}
      <section
        className="w-full py-section-lg"
        style={{ backgroundColor: 'hsl(60 9% 97%)' }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            eyebrow="MEDIA ENQUIRIES"
            heading="BEGIN WITH A CONVERSATION."
            surface="light"
            thread
          />
          <p className="mt-8 text-lagoon-800 text-lg leading-relaxed max-w-2xl">
            Journalists, editors and media organizations seeking interviews,
            quotes, background information or press access to the Movement&apos;s
            programs are invited to reach out through the institutional inquiry
            pathway. Every media conversation begins there — direct, human and
            considered.
          </p>

          {/* Three request cards — all lead to /join#institutional-inquiry */}
          <ul
            className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6"
            aria-label="Media enquiry request types"
          >
            {ENQUIRY_CARDS.map((card) => (
              <li key={card.title}>
                <Link
                  href="/join#institutional-inquiry"
                  className={cn(
                    'block h-full rounded-sm border border-lagoon-800/20 bg-white',
                    'px-6 py-7 transition-colors',
                    'hover:border-lagoon-800/40 hover:bg-lagoon-50',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-lagoon-800 focus-visible:outline-offset-2',
                  )}
                >
                  <p
                    className="text-sm font-semibold text-lagoon-900 uppercase tracking-wider"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {card.title}
                  </p>
                  <p className="mt-3 text-sm text-lagoon-700 leading-relaxed">
                    {card.description}
                  </p>
                </Link>
              </li>
            ))}
          </ul>

          {/* Single CTA — mirrors Partners and News CTA convention */}
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

      {/* ───────────────────────────────────────────────────────────────────────
          6. FUTURE MEDIA RESOURCES — lagoon-900 band
          Four "IN PREPARATION" cards.
          NOT links. NOT focusable. cursor: default. No href, no download, no file path.
          ───────────────────────────────────────────────────────────────────── */}
      <section
        className="w-full py-section-lg"
        style={{ backgroundColor: 'hsl(187 67% 8%)' }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            eyebrow="COMING SOON"
            heading="MEDIA RESOURCES IN PREPARATION."
            surface="dark"
            thread
          />
          <p className="mt-8 text-ivory-400 text-base leading-relaxed max-w-2xl">
            The following media resources are being prepared through our
            editorial and design process. They will be published here as they
            are approved for release.
          </p>

          {/* Four reserved placeholder cards — deliberately non-interactive */}
          <ul
            className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6"
            aria-label="Media resources in preparation"
          >
            {RESOURCE_CARDS.map((card) => (
              <li key={card.name}>
                {/*
                  Intentionally a <div> — not a <Link>, not a <button>.
                  tabIndex omitted (default 0 for div is non-focusable already).
                  cursor: default prevents pointer affordance.
                  aria-label clarifies "not yet available" for screen readers.
                */}
                <div
                  className="rounded-sm border border-ivory-100/10 px-6 py-7"
                  style={{
                    backgroundColor: 'hsl(187 67% 11%)',
                    cursor: 'default',
                  }}
                  aria-label={`${card.name} — in preparation, not yet available`}
                >
                  <span className="text-xs text-gold-500/60 uppercase tracking-[0.2em]">
                    IN PREPARATION
                  </span>
                  <p
                    className="mt-3 text-base text-ivory-200 uppercase tracking-wide"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {card.name}
                  </p>
                  <p className="mt-3 text-sm text-ivory-400 leading-relaxed">
                    {card.description}
                  </p>
                  {/* Status badge — span, not anchor, not button */}
                  <span
                    className="mt-5 inline-block text-xs text-ivory-500 uppercase tracking-[0.15em] border border-ivory-500/20 px-3 py-1 rounded-sm"
                    style={{ cursor: 'default' }}
                  >
                    PREPARING
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-10 text-ivory-400 text-sm leading-relaxed max-w-2xl">
            In the meantime, all media resource requests can be made through the
            institutional inquiry pathway above.
          </p>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────────────────
          7. EDITORIAL STANDARDS — ivory, short — credibility anchor
          ───────────────────────────────────────────────────────────────────── */}
      <section
        className="w-full py-section-lg"
        style={{ backgroundColor: 'hsl(60 9% 97%)' }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <SectionHeading
              eyebrow="OUR STANDARDS"
              heading="HOW WE WORK WITH THE PRESS."
              surface="light"
              thread
            />
            <p className="mt-8 text-lagoon-800 text-lg leading-relaxed">
              The One Movement International provides journalists and media
              partners with accurate, verifiable information about the Movement,
              its programs and its ecosystem. We do not make claims we cannot
              document, and we correct errors in our own communications when they
              occur.
            </p>
            <p className="mt-6 text-lagoon-800 text-lg leading-relaxed">
              We ask media partners to reflect the same standard: to attribute
              quotes accurately, to distinguish between the Movement and its
              individual programs, and to seek confirmation before publishing
              statistics, dates or claims about the Movement&apos;s work.
            </p>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────────────────
          8. CLOSING SIGNATURE — bilingual
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
