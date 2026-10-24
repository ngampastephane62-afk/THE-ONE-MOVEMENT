import { Helmet } from 'react-helmet-async';
import { useRef, useState } from 'react';
import { Link } from 'wouter';
import HeroSurface from '@/components/HeroSurface';
import GoldThread from '@/components/GoldThread';
import FashionEditionNote from '@/components/FashionEditionNote';
import ProgrammeCover from '@/components/programs/ProgrammeCover';
import ProgrammeFilm from '@/components/programs/ProgrammeFilm';
import InquiryForm from '@/pages/join/InquiryForm';
import { FASHION_CATEGORIES } from '@/lib/fashion-participation';
import FashionArchive from './FashionArchive';
import { BespokeLead, BespokeTail } from '@/components/programs/editorial/BespokeFrame';
import { inquiryHref } from '@/lib/programme-editorial';

const TITLE = 'The One Fashion Week International — Participation';
const DESC = 'Be part of the global fashion movement. Designers, talent, stylists, press, production teams, partners and educators: choose your category and request participation information to The One Fashion Week International.';


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
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#archive" data-testid="link-hero-archive" className="tomi-cta inline-flex min-h-12 items-center border border-gold-500/70 px-6 text-xs font-semibold uppercase tracking-wider text-gold-400 hover:bg-gold-500/10">Our previous editions</a>
                <a href="#categories" data-testid="link-hero-categories" className="tomi-cta inline-flex min-h-12 items-center bg-gold-500 px-6 text-xs font-semibold uppercase tracking-wider text-ink-900 hover:bg-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory-100">Choose your category</a>
              </div>
            </div>
            <div className="lg:col-span-5">
              <ProgrammeCover programme="fashion-week" tone="dark" className="mx-auto w-full max-w-md" />
            </div>
          </div>
        </div>
      </HeroSurface>

      <FashionArchive />
      <BespokeLead slug="fashion-week" />
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
                    {c.designerPackages ? 'Request designer information' : c.value === 'sponsors-partners' ? 'Partnership route' : 'Apply for participation'}
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
                    <Link href={inquiryHref.partnership('fashion-week', 'partner')} data-testid="link-partnership" className="inline-flex min-h-12 items-center bg-lagoon-900 px-6 text-xs font-semibold uppercase tracking-wider text-ivory-100 hover:bg-lagoon-800">Open a partnership enquiry</Link>
                    <button type="button" onClick={() => goToForm(current.value)} data-testid="button-apply-category" className="min-h-12 border border-lagoon-900 px-6 text-xs font-semibold uppercase tracking-wider text-lagoon-900 hover:bg-lagoon-900 hover:text-ivory-100">Or write to the Fashion Week team</button>
                  </>
                ) : current.value === 'experts-educators' ? (
                  <>
                    <button type="button" onClick={() => goToForm(current.value)} data-testid="button-apply-category" className="min-h-12 bg-lagoon-900 px-6 text-xs font-semibold uppercase tracking-wider text-ivory-100 hover:bg-lagoon-800">Offer to teach or mentor</button>
                    <Link href="/ecosystem#knowledge" data-testid="link-summit-knowledge" className="inline-flex min-h-12 items-center border border-lagoon-900 px-6 text-xs font-semibold uppercase tracking-wider text-lagoon-900 hover:bg-lagoon-900 hover:text-ivory-100">Ecosystem knowledge resources</Link>
                  </>
                ) : current.designerPackages ? (
                  <button type="button" onClick={() => goToForm(current.value)} data-testid="button-request-designer-info" className="tomi-cta min-h-12 bg-lagoon-900 px-6 text-xs font-semibold uppercase tracking-wider text-ivory-100 hover:bg-lagoon-800">Request designer information</button>
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
            <p id="designer-packages" className="mt-8 max-w-2xl scroll-mt-20 border-l-2 border-gold-500 pl-4 text-sm leading-relaxed text-ink-800" data-testid="text-designer-pathway">
              Current designer participation information is shared on request after review. Send an inquiry and the Fashion Week team will reply with the approved package details. No outcome, exposure or placement is promised.
            </p>
          )}
        </div>
      </section>

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

      <BespokeTail slug="fashion-week" name="THE ONE FASHION WEEK INTERNATIONAL" mediaEyebrow="PREVIOUS EDITIONS · ARCHIVE AND OFFICIAL MEDIA" />
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
