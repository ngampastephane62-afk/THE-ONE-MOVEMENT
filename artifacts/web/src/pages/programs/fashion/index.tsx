import { Helmet } from 'react-helmet-async';
import { useRef, useState } from 'react';
import { Link } from 'wouter';
import HeroSurface from '@/components/HeroSurface';
import GoldThread from '@/components/GoldThread';
import ArchivePhoto from '@/components/ArchivePhoto';
import FashionEditionNote from '@/components/FashionEditionNote';
import ProgrammeCover from '@/components/programs/ProgrammeCover';
import ProgrammeFilm from '@/components/programs/ProgrammeFilm';
import PeaceVoices from '@/components/programs/PeaceVoices';
import FashionConnections from '@/components/programs/FashionConnections';
import ProgrammeNominees from '@/components/editorial/ProgrammeNominees';
import InquiryForm from '@/pages/join/InquiryForm';
import { FASHION_CATEGORIES } from '@/lib/fashion-participation';
import DesignerPackages from './DesignerPackages';
import EverydayEcosystem from '@/components/programs/EverydayEcosystem';

const TITLE = 'The One Fashion Week International — Participation';
const DESC = 'Be part of the global fashion movement. Designers, talent, stylists, press, production teams, partners and educators: choose your category, compare designer packages and apply to The One Fashion Week International.';

const PILLARS = [
  { n: 'I', h: 'Show', p: 'Collections that carry heritage and local craft onto an international runway.' },
  { n: 'II', h: 'Teach', p: 'Brands, experts and professors share technique, business and history with the next generation.' },
  { n: 'III', h: 'Connect', p: 'Designers, stylists and makers meet across continents to build working relationships.' },
  { n: 'IV', h: 'Cooperate', p: 'Fashion invites diplomatic and humanitarian partners into problems larger than one sector.' },
];

export default function FashionWeekPage() {
  const [selected, setSelected] = useState<string>('designers-brands');
  const formRef = useRef<HTMLDivElement>(null);
  const current = FASHION_CATEGORIES.find((c) => c.value === selected) ?? FASHION_CATEGORIES[0];

  const goToForm = (value: string) => {
    setSelected(value);
    requestAnimationFrame(() => {
      const el = formRef.current;
      if (!el) return;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      el.focus({ preventScroll: true });
    });
  };

  const pick = (value: string) => {
    setSelected(value);
    requestAnimationFrame(() => document.getElementById('category-detail')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }));
  };

  return (
    <div>
      <Helmet>
        <title>{TITLE}</title>
        <meta name="description" content={DESC} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESC} />
        <link rel="canonical" href="/programs/fashion-week" />
      </Helmet>

      {/* 1 · INTRODUCTION */}
      <HeroSurface glowOrigin="behind" minHeight="88vh">
        <div className="mx-auto w-full max-w-7xl px-6 py-section-lg">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="text-eyebrow text-gold-400 animate-fade-in">The One Fashion Week International</p>
              <h1 className="mt-5 text-[clamp(2.4rem,7.5vw,5.4rem)] leading-[0.95] tracking-[-0.02em] text-ivory-100 animate-fade-up" style={{ fontFamily: 'var(--font-display)' }}>
                BE PART OF THE GLOBAL <span style={{ color: 'hsl(43 80% 73%)' }}>FASHION MOVEMENT.</span>
              </h1>
              <GoldThread className="mt-7" length="220px" node />
              <FashionEditionNote dark />
              <p className="mt-7 max-w-xl font-display text-xl leading-snug text-ivory-100">
                More than a runway. A platform for fashion, culture, creativity, business and international connections.
              </p>
              <p className="mt-4 max-w-xl leading-relaxed text-ivory-200">
                Designers, models, stylists, accessory creators, media, production teams, brands, partners and educators meet on one international platform. Whether you are an established house, an emerging designer or a professional with a skill to share, there is a place for you here.
              </p>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-gold-400">
                Choose your category. Select your participation package. Become part of the movement.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#categories" data-testid="link-hero-categories" className="inline-flex min-h-12 items-center bg-gold-500 px-6 text-xs font-semibold uppercase tracking-wider text-ink-900 hover:bg-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory-100">Choose your category</a>
                <a href="#learning" data-testid="link-hero-learning" className="inline-flex min-h-12 items-center border border-gold-500/70 px-6 text-xs font-semibold uppercase tracking-wider text-gold-400 hover:bg-gold-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400">Share your knowledge</a>
              </div>
            </div>
            <div className="lg:col-span-5">
              <ProgrammeCover programme="fashion-week" tone="dark" className="mx-auto w-full max-w-md" />
            </div>
          </div>
        </div>
      </HeroSurface>

      {/* 2 · ECOSYSTEM */}
      <section className="bg-ivory-100 py-section-lg" aria-labelledby="eco-h">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="text-eyebrow text-gold-600">An ecosystem, not a showcase</p>
              <h2 id="eco-h" className="mt-3 text-display-lg text-ink-900" style={{ fontFamily: 'var(--font-display)' }}>FASHION, HERITAGE, LEARNING AND COOPERATION.</h2>
              <p className="mt-5 leading-relaxed text-ink-800">
                The One Fashion Week International connects fashion, cultural heritage, learning and professional cooperation within the wider ecosystem of The One Movement International. Difference is the material we work with: people from many fields and regions, working together, not appearing as decoration.
              </p>
            </div>
            <ol className="grid gap-px self-start border border-sand-300 bg-sand-300 sm:grid-cols-2 lg:col-span-6 lg:col-start-7">
              {PILLARS.map((p) => (
                <li key={p.n} className="bg-ivory-50 p-6">
                  <span className="font-display text-sm text-gold-600">{p.n}</span>
                  <h3 className="mt-2 font-display text-2xl text-ink-900">{p.h}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-800">{p.p}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="mt-16 grid grid-cols-12 gap-3 sm:gap-5">
            <div className="col-span-12 sm:col-span-7"><ArchivePhoto id="runway-cultural" caption sizes="(min-width: 640px) 55vw, 92vw" /></div>
            <div className="col-span-6 sm:col-span-5"><ArchivePhoto id="designer-portrait" caption sizes="(min-width: 640px) 38vw, 46vw" /></div>
            <div className="col-span-6 sm:hidden"><ArchivePhoto id="casting-portrait" caption sizes="46vw" /></div>
          </div>
        </div>
      </section>

      <EverydayEcosystem programmeSlug="fashion-week" />
      {/* 3 · CATEGORIES */}
      <section id="categories" className="scroll-mt-20 py-section-lg" style={{ backgroundColor: 'hsl(187 67% 12%)' }} aria-labelledby="cat-h">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-eyebrow text-gold-400">Step 01 · Choose your category</p>
          <h2 id="cat-h" className="mt-3 text-display-lg text-ivory-100" style={{ fontFamily: 'var(--font-display)' }}>TWELVE WAYS IN.</h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-ivory-200">Each category has its own benefits, conditions and route. Select one to read the detail.</p>
          <div className="mt-10 grid gap-px border border-lagoon-700/60 bg-lagoon-700/60 sm:grid-cols-2 lg:grid-cols-4" role="list">
            {FASHION_CATEGORIES.map((c, i) => {
              const on = c.value === selected;
              return (
                <button
                  key={c.value} type="button" role="listitem" onClick={() => pick(c.value)} aria-pressed={on}
                  data-testid={`button-category-${c.value}`}
                  className={`group flex min-h-[8.5rem] flex-col p-5 text-left transition-colors focus-visible:relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 ${on ? 'bg-gold-500 text-ink-900' : 'bg-lagoon-900 text-ivory-100 hover:bg-lagoon-800'}`}
                >
                  <span className={`font-display text-xs ${on ? 'text-ink-900' : 'text-gold-400'}`}>{String(i + 1).padStart(2, '0')}</span>
                  <span className="mt-2 font-display text-lg leading-tight">{c.label}</span>
                  <span className={`mt-auto pt-3 text-[0.65rem] uppercase tracking-[0.16em] ${on ? 'text-ink-900' : 'text-ivory-300'}`}>
                    {c.designerPackages ? 'Five annual packages' : c.value === 'sponsors-partners' ? 'Partnership route' : 'Apply for participation'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4 · CATEGORY DETAIL */}
      <section id="category-detail" className="scroll-mt-20 bg-ivory-100 py-section-lg" aria-live="polite" aria-labelledby="detail-h">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-eyebrow text-gold-600">Step 02 · Review your category</p>
          <div className="mt-4 grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h3 id="detail-h" className="font-display text-[clamp(2rem,4vw,3rem)] leading-tight text-ink-900" data-testid="text-category-title">{current.label}</h3>
              <p className="mt-4 text-lg leading-relaxed text-ink-800">{current.description}</p>
              <p className="mt-6 border-l-2 border-gold-500 pl-4 text-sm leading-relaxed text-ink-800" data-testid="text-category-conditions">
                <span className="block text-[0.65rem] uppercase tracking-[0.18em] text-gold-600">Conditions</span>
                {current.conditions}
              </p>
            </div>
            <div className="lg:col-span-6 lg:col-start-7">
              <p className="text-[0.65rem] uppercase tracking-[0.18em] text-gold-600">Potential benefits · subject to selection</p>
              <ul className="mt-4 divide-y divide-sand-300 border-y border-sand-300">
                {current.benefits.map((b) => (
                  <li key={b} className="flex gap-3 py-3 text-ink-800"><span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-gold-500" />{b}</li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                {current.value === 'sponsors-partners' ? (
                  <>
                    <Link href="/join?intent=partnership#institutional-inquiry" data-testid="link-partnership" className="inline-flex min-h-12 items-center bg-lagoon-900 px-6 text-xs font-semibold uppercase tracking-wider text-ivory-100 hover:bg-lagoon-800">Open a partnership enquiry</Link>
                    <button type="button" onClick={() => goToForm(current.value)} data-testid="button-apply-category" className="min-h-12 border border-lagoon-900 px-6 text-xs font-semibold uppercase tracking-wider text-lagoon-900 hover:bg-lagoon-900 hover:text-ivory-100">Or write to the Fashion Week team</button>
                  </>
                ) : current.value === 'experts-educators' ? (
                  <>
                    <button type="button" onClick={() => goToForm(current.value)} data-testid="button-apply-category" className="min-h-12 bg-lagoon-900 px-6 text-xs font-semibold uppercase tracking-wider text-ivory-100 hover:bg-lagoon-800">Offer to teach or mentor</button>
                    <Link href="/programs/summit#knowledge" data-testid="link-summit-knowledge" className="inline-flex min-h-12 items-center border border-lagoon-900 px-6 text-xs font-semibold uppercase tracking-wider text-lagoon-900 hover:bg-lagoon-900 hover:text-ivory-100">Summit knowledge resources</Link>
                  </>
                ) : current.designerPackages ? (
                  <a href="#designer-packages" data-testid="link-compare-packages" className="inline-flex min-h-12 items-center bg-lagoon-900 px-6 text-xs font-semibold uppercase tracking-wider text-ivory-100 hover:bg-lagoon-800">Compare packages</a>
                ) : (
                  <button type="button" onClick={() => goToForm(current.value)} data-testid="button-apply-category" className="min-h-12 bg-lagoon-900 px-6 text-xs font-semibold uppercase tracking-wider text-ivory-100 hover:bg-lagoon-800">Apply for participation</button>
                )}
              </div>
              {!current.designerPackages && current.value !== 'sponsors-partners' && (
                <p className="mt-4 text-xs leading-relaxed text-ink-700">No paid package is configured for this category. Your application is reviewed; nothing is charged.</p>
              )}
            </div>
          </div>
          {current.designerPackages && (
            <div id="designer-packages" className="scroll-mt-20">
              <DesignerPackages onEnquire={() => goToForm(current.value)} />
            </div>
          )}
        </div>
      </section>

      {/* 5 · LEARNING */}
      <section id="learning" className="scroll-mt-20 py-section-lg" style={{ backgroundColor: 'hsl(40 71% 98%)', borderTop: '1px solid hsl(36 26% 84%)' }} aria-labelledby="learn-h">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5 order-2 lg:order-1">
            <ArchivePhoto id="casting-group" caption sizes="(min-width: 1024px) 40vw, 92vw" />
          </div>
          <div className="order-1 lg:order-2 lg:col-span-6 lg:col-start-7">
            <p className="text-eyebrow text-gold-600">Knowledge · open to anyone with a skill to share</p>
            <h2 id="learn-h" className="mt-3 text-display-lg text-ink-900" style={{ fontFamily: 'var(--font-display)' }}>A FASHION WEEK THAT TEACHES.</h2>
            <p className="mt-5 leading-relaxed text-ink-800">
              Pattern cutting, textile heritage, sustainable sourcing, fashion law, brand building, styling for culture rather than costume. We invite brands, practitioners, experts and professors to propose sessions, masterclasses and mentoring. Proposals are reviewed and confirmed per edition; no programme is announced until it is.
            </p>
            <div className="mt-8 grid gap-px border border-sand-300 bg-sand-300 sm:grid-cols-3">
              <button type="button" onClick={() => goToForm('experts-educators')} data-testid="button-learn-teach" className="bg-ivory-50 p-5 text-left hover:bg-ivory-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500">
                <span className="font-display text-lg text-ink-900">Teach</span><span className="mt-1 block text-xs text-ink-700">Propose a session or masterclass</span>
              </button>
              <button type="button" onClick={() => goToForm('experts-educators')} data-testid="button-learn-mentor" className="bg-ivory-50 p-5 text-left hover:bg-ivory-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500">
                <span className="font-display text-lg text-ink-900">Mentor</span><span className="mt-1 block text-xs text-ink-700">Guide an emerging designer</span>
              </button>
              <Link href="/programs/summit#knowledge" data-testid="link-learn-summit" className="bg-ivory-50 p-5 hover:bg-ivory-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500">
                <span className="font-display text-lg text-ink-900">Learn</span><span className="mt-1 block text-xs text-ink-700">Summit knowledge resources</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6 · COOPERATION */}
      <section className="py-section-lg" style={{ backgroundColor: 'hsl(187 67% 12%)' }} aria-labelledby="coop-h">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-6">
            <p className="text-eyebrow text-gold-400">Beyond one sector</p>
            <h2 id="coop-h" className="mt-3 text-display-lg text-ivory-100" style={{ fontFamily: 'var(--font-display)' }}>FASHION AT THE TABLE WITH DIPLOMACY AND HUMANITARIAN WORK.</h2>
            <p className="mt-5 leading-relaxed text-ivory-200">
              Livelihoods, artisanal skills, cultural memory and peace are questions no runway solves alone. We invite institutions, diplomatic missions and humanitarian organisations to cooperate with the fashion community. These are invitations to work together, not claims of funded results.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/join?intent=partnership#institutional-inquiry" data-testid="link-coop-partnership" className="inline-flex min-h-12 items-center bg-gold-500 px-6 text-xs font-semibold uppercase tracking-wider text-ink-900 hover:bg-gold-400">Propose a cooperation</Link>
              <Link href="/programs/diplomatic-gala" data-testid="link-coop-gala" className="inline-flex min-h-12 items-center border border-gold-500/70 px-6 text-xs font-semibold uppercase tracking-wider text-gold-400 hover:bg-gold-500/10">The Diplomatic Gala</Link>
            </div>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <ProgrammeFilm id="fashion-knight-2026" tone="dark" className="mx-auto w-full max-w-sm" />
          </div>
        </div>
      </section>

      {/* 7 · DISCOVERY ACROSS CONTINENTS */}
      <FashionConnections />
      <PeaceVoices />
      <ProgrammeNominees programme="fashion-week" />

      {/* 8 · APPLICATION FORM */}
      <section id="apply" className="scroll-mt-16 py-section-lg" style={{ backgroundColor: 'hsl(187 67% 12%)' }} aria-labelledby="apply-h">
        <div className="mx-auto max-w-4xl px-6">
          <div ref={formRef} tabIndex={-1} className="outline-none focus-visible:ring-2 focus-visible:ring-gold-400">
            <p className="text-eyebrow text-gold-400">Step 03 · Apply</p>
            <h2 id="apply-h" className="mt-3 text-display-lg text-ivory-100" style={{ fontFamily: 'var(--font-display)' }}>TELL US WHAT YOU BRING.</h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-ivory-200">
              Selected category: <strong className="text-gold-400" data-testid="text-selected-category">{current.label}</strong>. Submitting does not create an account, a membership or a confirmed place. Every application is reviewed.
            </p>
          </div>
          <div className="mt-10">
            <InquiryForm intent="fashion-week" participationCategory={selected} onParticipationCategoryChange={setSelected} />
          </div>
        </div>
      </section>

      {/* 9 · CLOSING */}
      <HeroSurface minHeight="48vh" className="px-6">
        <div className="mx-auto max-w-4xl py-section-lg text-center">
          <h2 className="text-display-lg text-ivory-100" style={{ fontFamily: 'var(--font-display)' }}>
            BRING YOUR CRAFT. <span style={{ color: 'hsl(43 80% 73%)' }}>WE ARE ONE.</span>
          </h2>
          <GoldThread className="mx-auto mt-8" length="240px" node />
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <a href="#categories" data-testid="link-closing-categories" className="inline-flex min-h-12 items-center bg-gold-500 px-6 text-xs font-semibold uppercase tracking-wider text-ink-900 hover:bg-gold-400">Choose your category</a>
            <Link href="/join" data-testid="link-closing-join" className="inline-flex min-h-12 items-center border border-gold-500/70 px-6 text-xs font-semibold uppercase tracking-wider text-gold-400 hover:bg-gold-500/10">Create a free account</Link>
          </div>
        </div>
      </HeroSurface>
    </div>
  );
}
