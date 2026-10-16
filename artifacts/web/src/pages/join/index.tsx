import { Helmet } from 'react-helmet-async';
import { useState, useRef, useEffect } from 'react';
import { Link, useSearch } from 'wouter';
import { getProgrammeServiceOffer } from '@workspace/shared';
import HeroSurface from '@/components/HeroSurface';
import GoldThread from '@/components/GoldThread';
import SectionHeading from '@/components/SectionHeading';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import ArchivePhoto from '@/components/ArchivePhoto';
import PathCard from './PathCard';
import InterestForm from './InterestForm';
import InquiryForm, { type InquiryIntent } from './InquiryForm';
import {
  PATH_DEFINITIONS,
  JOURNEY_STEPS,
  FAQ_ITEMS,
  getCategoriesForGroup,
  type PathDefinition,
} from './join-data';

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function scrollTo(el: HTMLElement | null) {
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ── Page ─────────────────────────────────────────────────────────────────── */

export default function JoinTheMovement() {
  const [activePath, setActivePath] = useState<string | null>(null);
  const search = new URLSearchParams(useSearch());
  const privacyRequest = search.get('request') === 'privacy';
  const requestedIntent = search.get('intent');
  const serviceOffer = !privacyRequest && requestedIntent === 'programme-service'
    ? getProgrammeServiceOffer(search.get('program') ?? '', search.get('service') ?? '')
    : undefined;
  const inquiryIntent: InquiryIntent = serviceOffer ? 'programme-service'
    : !privacyRequest && (requestedIntent === 'investment' || requestedIntent === 'partnership') ? requestedIntent : undefined;

  const formSectionRef = useRef<HTMLElement>(null);
  const inquirySectionRef = useRef<HTMLElement>(null);
  const heroCtaRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!inquiryIntent) return;
    const timer = window.setTimeout(() => {
      inquirySectionRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
    }, 100);
    return () => window.clearTimeout(timer);
  }, [inquiryIntent, serviceOffer?.programme, serviceOffer?.role]);

  function handlePathSelect(path: PathDefinition) {
    const newId = activePath === path.id ? null : path.id;
    setActivePath(newId);

    if (!newId) return;

    // Delay scroll to let render settle
    setTimeout(() => {
      if (path.scrollsToInquiry) {
        scrollTo(inquirySectionRef.current);
      } else {
        scrollTo(formSectionRef.current);
      }
    }, 80);
  }

  // Derived: which audienceGroup to pre-select in the form
  const activeGroup: string =
    PATH_DEFINITIONS.find((p) => p.id === activePath)?.audienceGroup ?? '';

  // Derived: show path detail panel when a joinable path is active
  const activeDef = PATH_DEFINITIONS.find((p) => p.id === activePath);
  const showPathDetail = !!activeDef && !activeDef.scrollsToInquiry;

  return (
    <div>
      <Helmet>
        <title>JOIN THE MOVEMENT — THE ONE MOVEMENT INTERNATIONAL</title>
        <meta name="description" content="Submit an expression of interest in The One Movement International and receive relevant updates as programs and future platform plans are confirmed." />
        <meta property="og:title" content="JOIN THE MOVEMENT — THE ONE MOVEMENT INTERNATIONAL" />
        <meta property="og:description" content="Submit an expression of interest in The One Movement International and receive relevant updates as programs and future platform plans are confirmed." />
        {/* FILLED AT DEPLOY WITH PRODUCTION DOMAIN */}
        <link rel="canonical" href="/join" />
      </Helmet>

      {/* ─────────────────────────────────────────────────────────────────
          1. JOIN HERO — radiant lagoon surface
          ───────────────────────────────────────────────────────────────── */}
      <HeroSurface minHeight="85vh">
        <div className="mx-auto w-full max-w-7xl px-6 py-section-lg">
          <div className="max-w-2xl">
            <p className="text-eyebrow text-gold-400 mb-5">JOIN THE MOVEMENT</p>

            <h1
              className="text-display-xl text-ivory-100 animate-fade-up"
              style={{ fontFamily: 'var(--font-display)', textWrap: 'balance' } as React.CSSProperties}
            >
              ONE WORLD.{' '}
              <span style={{ color: 'hsl(43 80% 73%)' }}>ONE PURPOSE.</span>
              <br />
              ONE MOVEMENT.
            </h1>

            <GoldThread className="mt-8" length="240px" node />

            <p
              className="mt-6 text-ivory-200 text-lg leading-relaxed animate-fade-in"
              style={{ animationDelay: '0.15s' }}
            >
              A growing global movement for creatives, entrepreneurs, institutions
              and changemakers. Submit an expression of interest to follow its
               programs, connect with its ecosystem or create your free member space.
            </p>

            <p
              className="mt-3 text-ivory-300/70 text-base"
              style={{ fontFamily: 'var(--font-display)' }}
              lang="ar"
            >
              نحن واحد
            </p>

            <div
              className="mt-10 flex flex-col sm:flex-row gap-4 animate-fade-in"
              style={{ animationDelay: '0.25s' }}
            >
              <a
                ref={heroCtaRef}
                href="#interest-form"
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo(formSectionRef.current);
                }}
                className={[
                  'inline-flex items-center justify-center',
                  'rounded-sm px-8 py-4 text-sm font-semibold tracking-wide',
                  'bg-gold-500 text-ink-900 border border-gold-600',
                  'hover:bg-gold-400 transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300 focus-visible:ring-offset-2',
                ].join(' ')}
              >
                EXPRESS YOUR INTEREST
              </a>
              <Link
                href="/ecosystem"
                className={[
                  'inline-flex items-center justify-center',
                  'rounded-sm px-8 py-4 text-sm font-semibold tracking-wide',
                  'border border-ivory-100/30 text-ivory-100',
                  'hover:border-ivory-100/60 transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory-100/50 focus-visible:ring-offset-2',
                ].join(' ')}
              >
                EXPLORE THE ECOSYSTEM
              </Link>
            </div>
          </div>
        </div>
      </HeroSurface>

      <div style={{ backgroundColor: 'hsl(38 57% 94%)' }}>
        <div className="mx-auto max-w-5xl px-6 pt-10">
          <ArchivePhoto id="community-gathering" caption="Community outreach · Founder archive" sizes="(min-width: 1024px) 64rem, 92vw" frameClassName="aspect-[16/9] w-full" objectPosition="center 40%" />
        </div>
      </div>

      {/* Transition: lagoon → ivory */}
      <div style={{ backgroundColor: 'hsl(38 57% 94%)' }}>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          2. WHY JOIN
          ───────────────────────────────────────────────────────────────── */}
      <section className="bg-ivory-100 py-section-lg">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            eyebrow="WHY JOIN"
            heading="CONNECT. COLLABORATE. CREATE IMPACT."
            size="lg"
            surface="light"
            thread
          />

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                 label: 'CONNECTION',
                  body: 'Connect your interests with an ecosystem spanning business, institutions, culture, media, innovation and community. Create a free account and editable profile. Network interactions and publishing follow the access conditions shown in your member space; optional professional services and annual event packages are separate.',
              },
              {
                label: 'OPPORTUNITY',
                 body: 'Hear about programs, collaborations and openings as they are confirmed across seventeen sectors and six official programs.',
              },
              {
                label: 'PURPOSE',
                 body: 'Bring your skills, organization or ideas into conversations about collaboration, cultural exchange and community impact across Africa, the UAE and international networks.',
              },
            ].map(({ label, body }) => (
              <div
                key={label}
                className="flex flex-col border-t-2 border-gold-500 pt-6"
              >
                <span
                  className="text-eyebrow text-ink-900 mb-3"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {label}
                </span>
                <p className="text-ink-700 leading-relaxed text-sm">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          3. HOW PARTICIPATION DEVELOPS
          ───────────────────────────────────────────────────────────────── */}
      <section
        className="py-section-lg"
        style={{ backgroundColor: 'hsl(187 30% 96%)' }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4">
              <SectionHeading
                eyebrow="HOW IT WORKS"
                 heading="WHAT HAPPENS NEXT"
                size="md"
                surface="light"
                thread
              />
            </div>
            <div className="lg:col-span-7 lg:col-start-6">
              <ul className="space-y-5">
                {[
                   'Explore the public website, programme information and direct enquiry pathways without an account.',
                  'Submitting an expression of interest does not create an account, membership or guaranteed place.',
                  'The team may contact you with relevant official updates as plans are confirmed.',
                   'Create a free editable member account separately via Sign up. Optional monthly professional services and annual event packages are listed inside the member space.',
                   'Network access and programme participation follow the conditions displayed for each service or confirmed opportunity.',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <span
                      className="shrink-0 w-6 h-6 rounded-full border border-gold-500 flex items-center justify-center text-xs text-gold-600 font-semibold mt-0.5"
                      aria-hidden="true"
                    >
                      {i + 1}
                    </span>
                    <p className="text-ink-700 leading-relaxed text-sm">{item}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Transition: ivory → lagoon */}

      {/* ─────────────────────────────────────────────────────────────────
          4. CHOOSE YOUR PATH — dark lagoon surface
          ───────────────────────────────────────────────────────────────── */}
      <section
        className="py-section-lg"
        style={{ backgroundColor: 'hsl(187 67% 12%)' }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            eyebrow="CHOOSE YOUR PATH"
            heading="WHERE DO YOU BELONG?"
            subheading="Select the path that best describes you. Joinable paths open the expression of interest form. Institutions and strategic partners follow the inquiry pathway below."
            size="lg"
            surface="dark"
            thread
          />

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {PATH_DEFINITIONS.map((path) => (
              <PathCard
                key={path.id}
                path={path}
                isSelected={activePath === path.id}
                onSelect={handlePathSelect}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Transition: lagoon → ivory */}
      <div style={{ backgroundColor: 'hsl(38 57% 94%)' }}>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          5. PATH DETAILS — conditional, shown when joinable path active
          ───────────────────────────────────────────────────────────────── */}
      {showPathDetail && activeDef && (
        <section className="bg-ivory-100 py-section-lg border-b border-sand-200">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-4">
                <p className="text-eyebrow text-gold-600 mb-3">{activeDef.label}</p>
                <p className="text-ink-700 leading-relaxed">{activeDef.desc}</p>
                <p className="mt-5 text-sm text-sand-400">
                  Select your category in the form below — it helps us understand your place in the ecosystem.
                </p>
              </div>
              <div className="lg:col-span-7 lg:col-start-6">
                <p className="text-xs font-semibold text-ink-500 uppercase tracking-widest mb-4">
                  Categories in this path
                </p>
                <div className="flex flex-wrap gap-2">
                  {activeDef.audienceGroup &&
                    getCategoriesForGroup(activeDef.audienceGroup).map(({ slug, label }) => (
                      <span
                        key={slug}
                        className="inline-flex items-center px-4 py-2 rounded-full border border-sand-300 text-ink-700 text-xs"
                      >
                        {label}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          6. WHAT HAPPENS AFTER YOU JOIN
          ───────────────────────────────────────────────────────────────── */}
      <section className="bg-ivory-100 py-section-lg">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            eyebrow="THE JOURNEY"
            heading="WHAT HAPPENS AFTER YOU JOIN"
            size="md"
            surface="light"
            thread
          />

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {JOURNEY_STEPS.map((step, i) => (
              <div key={i} className="flex flex-col items-start">
                {/* Step number + thread */}
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="shrink-0 w-8 h-8 rounded-full border-2 border-gold-500 flex items-center justify-center text-sm font-bold text-gold-600"
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  {i < JOURNEY_STEPS.length - 1 && (
                    <GoldThread
                      length="100%"
                      className="hidden lg:flex flex-1"
                      aria-hidden
                    />
                  )}
                </div>
                <p className="text-ink-700 text-sm leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          7. EXPRESSION OF INTEREST FORM
          ───────────────────────────────────────────────────────────────── */}
      <section
        id="interest-form"
        ref={formSectionRef}
        className="py-section-lg"
        style={{ backgroundColor: 'hsl(38 57% 97%)' }}
        aria-label="Expression of interest"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left: heading */}
            <div className="lg:col-span-4">
              <SectionHeading
                eyebrow="EXPRESS YOUR INTEREST"
                heading="SUBMIT YOUR EXPRESSION OF INTEREST"
                size="md"
                surface="light"
                thread
              />
              <p className="mt-4 text-ink-700 text-sm leading-relaxed">
                Tell us about your interests and how you would like to engage.
                This form does not create an account, membership or confirmed
                place. To create a free member space, use{' '}
                <Link href="/sign-up" className="underline text-lagoon-600" data-testid="link-join-signup">Create your member space</Link>. The team may contact you about relevant future developments.
              </p>
              <p className="mt-4 text-sand-400 text-xs leading-relaxed">
                Required fields are marked with{' '}
                <span className="text-red-600 font-semibold" aria-hidden="true">*</span>.
              </p>
            </div>

            {/* Right: form */}
            <div className="lg:col-span-7 lg:col-start-6">
              <div className="bg-white rounded-sm border border-sand-200 p-8 shadow-xs">
                <InterestForm preselectedGroup={activeGroup} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transition: ivory → lagoon */}

      {/* ─────────────────────────────────────────────────────────────────
          8. INSTITUTIONAL INQUIRY — dark lagoon surface
          ───────────────────────────────────────────────────────────────── */}
      <section
        id="institutional-inquiry"
        ref={inquirySectionRef}
        className="py-section-lg"
        style={{ backgroundColor: 'hsl(187 67% 12%)' }}
        aria-label="Institutional inquiry"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left */}
            <div className="lg:col-span-4">
              <SectionHeading
                eyebrow={privacyRequest ? 'PRIVACY & DATA RIGHTS' : serviceOffer ? 'PROGRAMME PARTICIPATION SERVICES' : inquiryIntent ? 'INVESTMENT & PARTNERSHIPS' : 'INSTITUTIONAL PATHWAY'}
                heading={privacyRequest ? 'PRIVACY REQUEST' : serviceOffer ? `${serviceOffer.name.toUpperCase()} · ${serviceOffer.programmeName.toUpperCase()}` : inquiryIntent === 'investment' ? 'INVEST IN THE ONE MOVEMENT MULTINATIONAL' : inquiryIntent === 'partnership' ? 'BECOME A PARTNER' : 'INSTITUTIONAL INQUIRY'}
                size="md"
                surface="dark"
                thread
              />
              {inquiryIntent && (
                <p className="mt-5 border-s-2 border-gold-500 px-4 text-sm leading-relaxed text-ivory-200" role="note">
                  {serviceOffer
                    ? 'Choose a professional service for this activity without buying a sponsorship package. Describe your objectives so the team can confirm selection, scope and deliverables. Existing sponsors can request a check of their agreed inclusions before any additional fee.'
                    : inquiryIntent === 'investment'
                    ? 'Discuss the project, its funding needs and development milestones directly with TOMI. This enquiry is not an investment commitment. Read the public investment presentation on the Partners page.'
                    : 'Tell TOMI about your visibility objectives, outdoor marketing needs, preferred locations, timing and budget. Package scope and availability are agreed with the team; this enquiry does not activate a partnership.'}
                </p>
              )}
              {privacyRequest && (
                <div
                  className="mt-5 border-s-2 border-gold-500 bg-lagoon-800/40 px-4 py-4"
                  role="note"
                >
                  <p className="text-eyebrow text-gold-400">PRIVACY REQUEST PATHWAY</p>
                  <p className="mt-2 text-sm leading-relaxed text-ivory-200">
                    Use this existing inquiry form to request access, correction,
                    deletion or withdrawal of consent for information submitted
                    through the website.
                  </p>
                </div>
              )}
              <p className="mt-4 text-ivory-200 text-sm leading-relaxed">
                {privacyRequest
                  ? 'Provide enough information for the operator to locate and review your request. The form remains the existing institutional inquiry pathway and does not create a new request type.'
                  : serviceOffer ? 'Apply as an independent professional or on behalf of an organisation. This enquiry is sent to TOMI for review; it does not reserve a place or charge a fee.'
                  : "Embassies, governments, international organizations, universities, NGOs, sponsors, partners and media organizations engage through this pathway. Provide your organization's information and our team will contact you directly."}
              </p>
              {!privacyRequest && !serviceOffer && <div className="mt-8 space-y-4">
                {[
                  'Embassy or diplomatic mission',
                  'Government or ministry',
                  'International organization',
                  'University or academic institution',
                  'NGO or civil society organization',
                  'Sponsor or corporate partner',
                  'Media organization',
                ].map((type) => (
                  <div key={type} className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="w-1 h-1 rounded-full bg-gold-500 shrink-0"
                    />
                    <span className="text-ivory-200 text-sm">{type}</span>
                  </div>
                ))}
              </div>}
            </div>

            {/* Right: form */}
            <div className="lg:col-span-7 lg:col-start-6">
              <div
                className="rounded-sm border p-8"
                style={{
                  borderColor: 'hsl(187 45% 30%)',
                  backgroundColor: 'hsl(187 55% 15%)',
                }}
              >
                <InquiryForm
                  key={privacyRequest ? 'privacy' : serviceOffer ? `${serviceOffer.programme}-${serviceOffer.role}-${search.get('coverage') ?? ''}` : inquiryIntent ?? 'institutional'}
                  privacyRequest={privacyRequest} intent={inquiryIntent} serviceOffer={serviceOffer}
                  existingSponsor={search.get('coverage') === 'existing-sponsor'}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transition: lagoon → ivory */}
      <div style={{ backgroundColor: 'hsl(38 57% 94%)' }}>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          9. PRIVACY REASSURANCE
          ───────────────────────────────────────────────────────────────── */}
      <section className="bg-ivory-100 py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-eyebrow text-gold-600 mb-4">HOW WE HANDLE YOUR INFORMATION</p>
          <p className="text-ink-700 leading-relaxed">
            We collect information to review your expression of interest and provide
            relevant updates. We use safeguards appropriate to the current service and
            do not share personal data with third parties for their own marketing. You
            may request access, correction, deletion or withdrawal of consent.
          </p>
          <p className="mt-4 text-sand-400 text-sm">
            Read our{' '}
            <a href="/privacy-policy" className="underline hover:text-ink-600 transition-colors">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          10. FAQ
          ───────────────────────────────────────────────────────────────── */}
      <section className="bg-ivory-100 py-section-lg border-t border-sand-200">
        <div className="mx-auto max-w-3xl px-6">
          <SectionHeading
            eyebrow="FREQUENTLY ASKED"
            heading="QUESTIONS"
            size="md"
            surface="light"
            thread
          />

          <Accordion type="single" collapsible className="mt-10 w-full">
            {FAQ_ITEMS.map((item, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border-b border-sand-200"
              >
                <AccordionTrigger
                  className="text-left text-sm font-semibold text-ink-900 py-5 hover:no-underline hover:text-lagoon-600 transition-colors"
                >
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-ink-700 leading-relaxed pb-5">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Transition: ivory → lagoon */}

      {/* ─────────────────────────────────────────────────────────────────
          11. CLOSING SIGNATURE — cinematic lagoon surface
          ───────────────────────────────────────────────────────────────── */}
      <HeroSurface glowOrigin="behind" minHeight="50vh">
        <div className="mx-auto w-full max-w-7xl px-6 py-section-lg text-center">
          <p className="text-eyebrow text-gold-400 mb-6">THE ONE MOVEMENT INTERNATIONAL</p>

          <h2
            className="text-display-xl text-ivory-100"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            ONE WORLD.{' '}
            <span style={{ color: 'hsl(43 80% 73%)' }}>ONE PURPOSE.</span>
            <br />
            ONE MOVEMENT.
          </h2>

          <GoldThread className="mt-8 mx-auto" length="200px" node />

          <p
            className="mt-6 text-ivory-300/80 text-xl tracking-wider"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            WE ARE ONE
          </p>
          <p
            className="mt-2 text-ivory-300/60 text-lg"
            lang="ar"
          >
            نحن واحد
          </p>

          <div className="mt-10">
            <a
              href="#interest-form"
              onClick={(e) => {
                e.preventDefault();
                scrollTo(formSectionRef.current);
              }}
              className={[
                'inline-flex items-center justify-center',
                'rounded-sm px-10 py-4 text-sm font-semibold tracking-wide',
                'bg-gold-500 text-ink-900 border border-gold-600',
                'hover:bg-gold-400 transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300 focus-visible:ring-offset-2',
              ].join(' ')}
            >
              JOIN THE MOVEMENT
            </a>
          </div>
        </div>
      </HeroSurface>
    </div>
  );
}
