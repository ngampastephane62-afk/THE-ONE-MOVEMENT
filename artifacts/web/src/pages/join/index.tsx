import { Helmet } from 'react-helmet-async';
import { useEffect, useRef } from 'react';
import { Link, useSearch } from 'wouter';
import { Show } from '@clerk/react';
import { ArrowRight, Compass, Handshake, Landmark, Sparkles, UserRound } from 'lucide-react';
import { getProgrammeServiceOffer } from '@workspace/shared';
import SectionHeading from '@/components/SectionHeading';
import InquiryForm, { type InquiryIntent } from './InquiryForm';
import { getInquiryDefinition, isGeneralInquiryIntent } from './inquiry-intents';

const gold = 'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gold-500 px-7 text-xs font-semibold uppercase tracking-[0.16em] text-ink-900 transition-colors hover:bg-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory-50 focus-visible:ring-offset-2 focus-visible:ring-offset-lagoon-900';
const ghost = 'inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-ivory-100/40 px-7 text-xs font-semibold uppercase tracking-[0.16em] text-ivory-50 transition-colors hover:border-gold-400 hover:text-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400';

const STEPS = [
  { n: '01', title: 'Create your account', body: 'Secure sign-up with your email. Membership is free.' },
  { n: '02', title: 'Set up your profile', body: 'Name, profession, country and the sectors you work in. Private by default.' },
  { n: '03', title: 'Explore and connect', body: 'Discover people, programmes and all 17 sectors. Network participation is activated only with your consent.' },
];

const OPPORTUNITIES = [
  { key: 'partnership', icon: Handshake, title: 'Partnership', body: 'Annual collaboration with programmes, media and communities.', href: '/partners/partnership' },
  { key: 'investment', icon: Landmark, title: 'Investment', body: 'Information on The One Movement Multinational.', href: '/partners/investment' },
  { key: 'programmes', icon: Sparkles, title: 'Programmes', body: 'Participate in, or contribute to, an official programme.', href: '/programs' },
];

export default function JoinTheMovement() {
  const search = new URLSearchParams(useSearch());
  const privacyRequest = search.get('request') === 'privacy';
  const requestedIntent = search.get('intent');
  const serviceOffer = !privacyRequest && requestedIntent === 'programme-service'
    ? getProgrammeServiceOffer(search.get('program') ?? '', search.get('service') ?? '')
    : undefined;
  const inquiryIntent: InquiryIntent = serviceOffer ? 'programme-service'
    : !privacyRequest && isGeneralInquiryIntent(requestedIntent) ? requestedIntent : undefined;
  const inquiryDefinition = getInquiryDefinition(inquiryIntent);
  const inquirySectionRef = useRef<HTMLElement>(null);
  const focusInquiry = Boolean(inquiryIntent || privacyRequest || search.get('program'));

  useEffect(() => {
    if (!focusInquiry) return;
    const timer = window.setTimeout(() => inquirySectionRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' }), 100);
    return () => window.clearTimeout(timer);
  }, [focusInquiry, inquiryIntent, serviceOffer?.programme, serviceOffer?.role]);

  return (
    <div className="min-h-[100dvh] bg-ivory-50" data-testid="page-join">
      <Helmet>
        <title>JOIN THE MOVEMENT — THE ONE MOVEMENT INTERNATIONAL</title>
        <meta name="description" content="Become a member of The One Movement International, or start a partnership, investment or programme conversation." />
        <link rel="canonical" href="/join" />
      </Helmet>

      <header className="relative isolate overflow-hidden bg-lagoon-900 pb-20 pt-28 text-ivory-50 sm:pt-36" data-testid="section-join-hero">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_80%_20%,hsl(38_60%_35%/0.3),transparent_55%)]" />
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="text-eyebrow text-gold-400">JOIN THE MOVEMENT</p>
            <Show when="signed-out">
              <h1 className="mt-4 font-display text-[clamp(2.4rem,7vw,5.2rem)] leading-[0.95]" data-testid="text-join-title">One membership. A global community.</h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-ivory-200">Join people and organisations working across culture, business and diplomacy between Africa, the UAE and the world. Membership is free.</p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link href="/sign-up" className={gold} data-testid="link-join-signup">Become a member <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
                <Link href="/sign-in" className={ghost} data-testid="link-join-signin">I already have an account</Link>
              </div>
            </Show>
            <Show when="signed-in">
              <h1 className="mt-4 font-display text-[clamp(2.4rem,7vw,5.2rem)] leading-[0.95]" data-testid="text-join-title-member">You are already part of the Movement.</h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-ivory-200">Your account is active. There is no need to apply again; continue in your member space or explore an opportunity below.</p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link href="/member" className={gold} data-testid="link-join-myspace"><UserRound className="h-4 w-4" aria-hidden="true" /> My space</Link>
                <Link href="/member/onboarding" className={ghost} data-testid="link-join-complete-profile">Complete my profile</Link>
                <Link href="/ecosystem" className={ghost} data-testid="link-join-explore"><Compass className="h-4 w-4" aria-hidden="true" /> Explore sectors</Link>
              </div>
            </Show>
          </div>
          <ol className="self-end border-t border-ivory-100/15 lg:col-span-5" aria-label="How membership works">
            {STEPS.map((s) => (
              <li key={s.n} className="grid grid-cols-[3rem_1fr] gap-2 border-b border-ivory-100/15 py-5">
                <span className="font-mono text-xs text-gold-400">{s.n}</span>
                <span><span className="block font-display text-lg">{s.title}</span><span className="mt-1 block text-sm leading-relaxed text-ivory-200">{s.body}</span></span>
              </li>
            ))}
          </ol>
        </div>
      </header>

      <section className="py-section-lg" aria-labelledby="opportunities-title" data-testid="section-join-opportunities">
        <div className="mx-auto max-w-7xl px-6">
          <div id="opportunities-title"><SectionHeading eyebrow="BEYOND MEMBERSHIP" heading="EXPRESS AN INTEREST" size="md" thread /></div>
          <p className="mt-5 max-w-2xl leading-relaxed text-ink-800">Partnership, investment and programme participation are separate conversations from membership. An expression of interest is reviewed by the TOMI team and does not create an account.</p>
          <ul className="mt-10 grid grid-cols-1 gap-px bg-sand-300 md:grid-cols-3">
            {OPPORTUNITIES.map(({ key, icon: Icon, title, body, href }) => (
              <li key={key} className="bg-ivory-50">
                <Link href={href} className="group flex h-full flex-col p-7 transition-colors hover:bg-ivory-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold-500" data-testid={`link-opportunity-${key}`}>
                  <Icon className="h-6 w-6 text-gold-700" aria-hidden="true" />
                  <span className="mt-6 font-display text-2xl text-ink-900">{title}</span>
                  <span className="mt-2 text-sm leading-relaxed text-ink-700">{body}</span>
                  <span className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-lagoon-700">Learn more <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" /></span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="institutional-inquiry"
        ref={inquirySectionRef}
        className="py-section-lg"
        style={{ backgroundColor: 'hsl(187 67% 12%)' }}
        aria-label="Opportunity inquiry"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left */}
            <div className="lg:col-span-4">
              <SectionHeading
                eyebrow={privacyRequest ? 'PRIVACY & DATA RIGHTS' : serviceOffer ? 'PROGRAMME PARTICIPATION SERVICES' : inquiryDefinition?.eyebrow ?? 'INSTITUTIONAL PATHWAY'}
                heading={privacyRequest ? 'PRIVACY REQUEST' : serviceOffer ? `${serviceOffer.name.toUpperCase()} · ${serviceOffer.programmeName.toUpperCase()}` : inquiryDefinition?.heading ?? 'INSTITUTIONAL INQUIRY'}
                size="md"
                surface="dark"
                thread
              />
              {inquiryIntent && (
                <p className="mt-5 border-s-2 border-gold-500 px-4 text-sm leading-relaxed text-ivory-200" role="note">
                  {serviceOffer
                    ? 'Choose a professional service for this activity without buying a sponsorship package. Describe your objectives so the team can confirm selection, scope and deliverables. Existing sponsors can request a check of their agreed inclusions before any additional fee.'
                    : inquiryDefinition?.note}
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
                  : serviceOffer || inquiryDefinition?.professional ? 'Apply as an independent professional or on behalf of an organisation. This enquiry is sent to TOMI for review; it does not reserve a place or charge a fee.'
                  : "Embassies, governments, international organizations, universities, NGOs, sponsors, partners and media organizations engage through this pathway. Provide your organization's information and our team will contact you directly."}
              </p>
              {!privacyRequest && !serviceOffer && !inquiryDefinition?.professional && <div className="mt-8 space-y-4">
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
                  key={(privacyRequest ? 'privacy' : serviceOffer ? `${serviceOffer.programme}-${serviceOffer.role}-${search.get('coverage') ?? ''}` : `${inquiryIntent ?? 'institutional'}-${search.get('program') ?? ''}-${search.get('interest') ?? ''}`) + (search.get('request') === 'documentation' ? '-documentation' : '')}
                  privacyRequest={privacyRequest} intent={inquiryIntent} serviceOffer={serviceOffer}
                  programmeSlug={search.get('program') ?? undefined} programmeInterest={search.get('interest') ?? undefined}
                  existingSponsor={search.get('coverage') === 'existing-sponsor'}
                  participationCategory={search.get('category') ?? undefined}
                  documentationRequest={search.get('request') === 'documentation'}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ivory-100 py-16" aria-label="Privacy">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-sm leading-relaxed text-ink-700">Member profiles are private by default. Inquiries are used only to respond to you. To request access, correction or deletion of your data, use the <Link href="/join?request=privacy" className="font-semibold text-lagoon-700 underline underline-offset-4" data-testid="link-privacy-request">privacy request form</Link>.</p>
        </div>
      </section>
    </div>
  );
}
