import type { ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import { ArrowLeft, ArrowRight, Mail } from 'lucide-react';
import Reveal from '@/components/Reveal';
import SectionHeading from '@/components/SectionHeading';
import NetworkMotif from './NetworkMotif';
import InvestmentPresentation, { type DocKey } from './InvestmentPresentation';

type Block = { title: string; body: string };
export type OpportunityViewProps = {
  doc: DocKey; path: string; metaTitle: string; metaDescription: string;
  eyebrow: string; title: string; lead: string;
  sectionsEyebrow: string; sectionsHeading: string; blocks: Block[];
  documentTitle: string; documentBody: string;
  intent: 'partner' | 'investment'; inquiryLabel: string; requestLabel: string;
  disclosures: string[]; alternate: { href: string; label: string };
  extra?: ReactNode;
};

export default function OpportunityView(p: OpportunityViewProps) {
  const inquiry = `/join?intent=${p.intent === 'partner' ? 'partnership' : 'investment'}`;
  return (
    <div className="min-h-[100dvh] bg-ivory-50" data-testid={`page-opportunity-${p.intent}`}>
      <Helmet>
        <title>{p.metaTitle}</title>
        <meta name="description" content={p.metaDescription} />
        <link rel="canonical" href={p.path} />
      </Helmet>

      <header className="relative isolate overflow-hidden bg-lagoon-900 pb-20 pt-28 text-ivory-50 sm:pt-36">
        <NetworkMotif className="pointer-events-none absolute -right-40 top-1/2 -z-10 w-[min(900px,140%)] -translate-y-1/2 opacity-30" />
        <div className="mx-auto max-w-7xl px-6">
          <Link href="/partners" className="inline-flex min-h-11 items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-ivory-200 hover:text-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400" data-testid="link-back-partners"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Partners</Link>
          <Reveal>
            <p className="mt-10 text-eyebrow text-gold-400">{p.eyebrow}</p>
            <h1 className="mt-4 max-w-4xl font-display text-[clamp(2.4rem,7vw,5.5rem)] leading-[0.95] tracking-[0.01em]" data-testid="text-opportunity-title">{p.title}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ivory-200">{p.lead}</p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href={inquiry} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gold-500 px-7 text-xs font-semibold uppercase tracking-[0.16em] text-ink-900 hover:bg-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory-50" data-testid="link-hero-inquiry">{p.inquiryLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
              <a href="#documents" className="inline-flex min-h-12 items-center justify-center rounded-full border border-ivory-100/40 px-7 text-xs font-semibold uppercase tracking-[0.16em] hover:border-gold-400 hover:text-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400" data-testid="link-hero-documents">View presentation</a>
            </div>
          </Reveal>
        </div>
      </header>

      <section className="py-section-lg" aria-labelledby="opportunity-blocks">
        <div className="mx-auto max-w-7xl px-6">
          <div id="opportunity-blocks"><SectionHeading eyebrow={p.sectionsEyebrow} heading={p.sectionsHeading} size="md" thread /></div>
          <ol className="mt-12 grid grid-cols-1 border-t border-sand-300 md:grid-cols-2">
            {p.blocks.map((b, i) => (
              <li key={b.title} className="border-b border-sand-300 py-8 md:odd:pr-10 md:even:border-l md:even:pl-10" data-testid={`block-opportunity-${i}`}>
                <Reveal>
                  <span className="font-mono text-xs text-gold-700">{String(i + 1).padStart(2, '0')}</span>
                  <h2 className="mt-2 font-display text-xl text-ink-900 sm:text-2xl">{b.title}</h2>
                  <p className="mt-3 max-w-lg leading-relaxed text-ink-800">{b.body}</p>
                </Reveal>
              </li>
            ))}
          </ol>
          {p.extra}
        </div>
      </section>

      <section id="documents" className="scroll-mt-24 border-y border-sand-200 bg-ivory-100 py-section-lg" aria-labelledby="documents-heading">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="text-eyebrow text-lagoon-600">PRESENTATION</p>
            <h2 id="documents-heading" className="mt-3 font-display text-3xl text-ink-900 sm:text-4xl">{p.documentTitle}</h2>
            <p className="mt-4 max-w-xl leading-relaxed text-ink-800">{p.documentBody}</p>
            <div className="mt-8"><InvestmentPresentation doc={p.doc} /></div>
            <Link href={`${inquiry}&request=documentation`} className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-lagoon-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500" data-testid="link-request-documentation"><Mail className="h-4 w-4" aria-hidden="true" /> {p.requestLabel}</Link>
          </div>
          <aside className="lg:col-span-5" aria-labelledby="disclosures-heading" data-testid="text-disclosures">
            <h3 id="disclosures-heading" className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-700">Important information</h3>
            <ul className="mt-4 space-y-3 border-l-2 border-gold-500/60 pl-4 text-sm leading-relaxed text-ink-700">
              {p.disclosures.map((d) => <li key={d}>{d}</li>)}
            </ul>
          </aside>
        </div>
      </section>

      <section className="py-24 text-center">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="font-display text-[clamp(1.8rem,5vw,3.4rem)] leading-[1.02] text-ink-900">Start a conversation.</h2>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href={inquiry} className="inline-flex min-h-12 items-center rounded-full bg-lagoon-900 px-7 text-xs font-semibold uppercase tracking-[0.16em] text-ivory-50 hover:bg-lagoon-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500" data-testid="link-footer-inquiry">{p.inquiryLabel}</Link>
            <Link href={p.alternate.href} className="inline-flex min-h-12 items-center rounded-full border border-sand-300 px-7 text-xs font-semibold uppercase tracking-[0.16em] text-ink-900 hover:border-gold-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500" data-testid="link-alternate-path">{p.alternate.label}</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
