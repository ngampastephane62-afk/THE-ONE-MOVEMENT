import { useCallback, useEffect, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Maximize2, RotateCcw } from 'lucide-react';
import SectionHeading from '@/components/SectionHeading';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

import { Link } from 'wouter';

type DocKey = 'investment' | 'partnership';
const baseOf = (d: DocKey) => `${import.meta.env.BASE_URL}api/${d}/presentation/`;
const pageSrcOf = (d: DocKey, n: number) => `${baseOf(d)}page-${String(n).padStart(2, '0')}.jpg`;

const INVESTMENT_PAGES: { title: string; summary: string }[] = [
  { title: 'Global Investor & Strategic Partnership Forum', summary: 'Founder-supplied investment presentation: culture, capital, media and relationships.' },
  { title: 'Opportunity', summary: 'Why the Movement presents an investment opportunity now.' },
  { title: 'Movement', summary: 'What The One Movement is and the communities it connects.' },
  { title: 'Ecosystem', summary: 'Programmes, media and members forming one ecosystem.' },
  { title: 'Architecture', summary: 'How the platform and its programmes are structured.' },
  { title: 'Economic model', summary: 'How the Movement intends to generate revenue.' },
  { title: 'Network effect', summary: 'How each new participant strengthens the network.' },
  { title: 'Connection to opportunity', summary: 'Turning relationships into concrete opportunities.' },
  { title: 'Forms of return', summary: 'The types of return described by the Founder; none are guaranteed.' },
  { title: 'Participation paths', summary: 'Ways an investor can take part.' },
  { title: 'Investment Forum', summary: 'The One Investment Forum programme.' },
  { title: 'Summit', summary: 'The One Summit programme.' },
  { title: 'Fashion Week', summary: 'The One Fashion Week International programme.' },
  { title: 'Media', summary: 'Editorial, documentary and media activities.' },
  { title: 'Expansion', summary: 'Planned geographic and programme expansion.' },
  { title: 'Capital requirement', summary: 'A stated USD 4M requirement to launch and position the platform — not a valuation or funds raised; allocation by category still to be defined.' },
  { title: 'Projected growth', summary: '2026–2028 revenue figures are projections, not achieved results.' },
  { title: 'Contact', summary: 'How to begin an investment conversation.' },
];
const PARTNERSHIP_PAGES: { title: string; summary: string }[] = [
  { title: 'Annual Partnership 2026–2027', summary: 'An invitation to join the ecosystem for twelve months.' },
  { title: 'The invitation', summary: 'A year in the ecosystem, rather than sponsorship of a single event.' },
  { title: 'Who we are', summary: 'The Movement’s origins in Africa and international development in Dubai.' },
  { title: 'The ecosystem', summary: 'Eight programme expressions of one ecosystem.' },
  { title: 'Why partner', summary: 'Reputation, relationships, reach and opportunity — not promised financial returns.' },
  { title: 'The annual journey', summary: 'Before, during and after the programme; timings remain subject to confirmation.' },
  { title: 'Media and reach', summary: 'Media relationships across regions; coverage remains subject to editorial approval.' },
  { title: 'Digital and outdoor visibility', summary: 'Website, app and Dubai outdoor opportunities, subject to development and site availability.' },
  { title: 'Voice and connections', summary: 'Speaking consideration and introductions, subject to selection and mutual interest.' },
  { title: 'Humanitarian and cultural impact', summary: 'Peace, unity, communities and cultural dialogue.' },
  { title: 'Institutional partnership', summary: 'Tailored collaboration with governments, ministries and institutions.' },
  { title: 'Five annual levels', summary: 'Cumulative twelve-month commercial partnership levels, separate from charitable contributions.' },
  { title: 'Annual Partner and Official Sponsor', summary: 'Benefits at USD 10,000 and USD 50,000 per twelve-month agreement.' },
  { title: 'Gold and Platinum Strategic Sponsor', summary: 'Benefits at USD 100,000 and USD 250,000 per twelve-month agreement.' },
  { title: 'Global Partner', summary: 'USD 500,000 by invitation, subject to agreement, selection and due diligence.' },
  { title: 'Sector partnerships', summary: 'Sector positioning and possible exclusivity, subject to availability.' },
  { title: 'How to join', summary: 'Discovery, proposal, agreement and activation.' },
  { title: 'Contact', summary: 'Begin a partnership conversation with TOMI.' },
];

const DOCS: Record<DocKey, { label: string; kicker: string; pages: { title: string; summary: string }[] }> = {
  investment: { label: 'Investment presentation', kicker: 'Equity / capital — The One Movement Multinational', pages: INVESTMENT_PAGES },
  partnership: { label: 'Annual Partnership 2026–2027', kicker: 'Sponsorship package fees — not an investment', pages: PARTNERSHIP_PAGES },
};
const TOTAL = 18;

const LEVELS = [
  { pkg: 'annual-partner', role: 'partner', name: 'Annual Partner', price: 'USD 10,000', adds: ['Presence in the annual directory and on the website', 'Selected social media and newsletter mentions', 'One professional feature', 'Selected VIP and networking access'] },
  { pkg: 'official-sponsor', role: 'sponsor', name: 'Official Sponsor', price: 'USD 50,000', adds: ['Red carpet, media wall and screen visibility', 'Digital and Dubai outdoor visibility', 'Branded content and PR', 'Consideration for the Summit and One Hour', 'Introductions'] },
  { pkg: 'gold-sponsor', role: 'sponsor', name: 'Gold Sponsor', price: 'USD 100,000', adds: ['Branded activation', 'Larger outdoor visibility', 'Expanded PR', 'Panel consideration'] },
  { pkg: 'platinum-sponsor', role: 'sponsor', name: 'Platinum Strategic Sponsor', price: 'USD 250,000', adds: ['Strategic visibility', 'Sector exclusivity, subject to availability', 'CEO interviews', 'Business development support', 'Documentary opportunity, subject to production, editorial and distribution decisions'] },
  { pkg: 'global-partner', role: 'partner', name: 'Global Partner', price: 'USD 500,000 · by invitation', adds: ['Title-level visibility', 'Presence across all flagship programmes', 'Strategic introductions, subject to agreement, selection and due diligence'] },
];

type Status = 'loading' | 'ready' | 'error';

export default function InvestmentPresentation() {
  const [doc, setDoc] = useState<DocKey>(() => (typeof window !== 'undefined' && window.location.hash === '#annual-partnership' ? 'partnership' : 'investment'));
  const [page, setPage] = useState(1);
  const PAGES = DOCS[doc].pages;
  const pageSrc = (n: number) => pageSrcOf(doc, n);
  const PDF_SRC = `${baseOf(doc)}presentation.pdf`;
  const switchDoc = (d: DocKey) => { if (d === doc) return; setDoc(d); setPage(1); setStatus('loading'); setAttempt(0); };
  const [status, setStatus] = useState<Status>('loading');
  const [attempt, setAttempt] = useState(0);
  const [zoom, setZoom] = useState(false);

  const go = useCallback((n: number) => {
    const next = Math.min(TOTAL, Math.max(1, n));
    setPage((cur) => {
      if (cur !== next) setStatus('loading');
      return next;
    });
  }, []);

  // Preload neighbours for smooth paging
  useEffect(() => {
    [page + 1, page - 1].filter((n) => n >= 1 && n <= TOTAL).forEach((n) => { const i = new Image(); i.src = pageSrc(n); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, doc]);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target instanceof HTMLSelectElement || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); go(page + 1); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(page - 1); }
    else if (e.key === 'Home') { e.preventDefault(); go(1); }
    else if (e.key === 'End') { e.preventDefault(); go(TOTAL); }
  };

  const meta = PAGES[page - 1];
  const src = `${pageSrc(page)}${attempt ? `?r=${attempt}` : ''}`;
  const navBtn =
    'inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius)] border border-sand-300 bg-ivory-50 text-ink-900 transition-colors duration-200 hover:border-gold-500 hover:bg-ivory-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 disabled:opacity-35 disabled:pointer-events-none';

  return (
    <section id="investment-presentation" className="scroll-mt-24 border-t border-sand-200 bg-ivory-100 py-section-lg" aria-labelledby="investment-presentation-heading" data-testid="section-investment-presentation">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div id="investment-presentation-heading">
            <SectionHeading eyebrow="PUBLIC PRESENTATIONS" heading="READ THE DOCUMENTS" size="md" thread />
          </div>
          <p className="mt-6 leading-relaxed text-ink-800">
            Two separate documents, published to read here page by page: the investment presentation of The One Movement Multinational, and the Annual Partnership 2026–2027 package. Sponsorship fees buy defined services; they are not an investment.
          </p>
          <div role="tablist" aria-label="Choose a document" className="mt-6 flex flex-col gap-2">
            {(Object.keys(DOCS) as DocKey[]).map((d) => (
              <button key={d} type="button" role="tab" aria-selected={doc === d} aria-controls="presentation-reader" onClick={() => switchDoc(d)}
                className={`rounded-[var(--radius)] border px-4 py-3 text-start transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 ${doc === d ? 'border-gold-500 bg-ivory-50' : 'border-sand-300 hover:border-gold-500/60'}`}
                data-testid={`tab-document-${d}`}>
                <span className="block text-sm font-semibold text-ink-900">{DOCS[d].label}</span>
                <span className="block text-xs text-ink-700">{DOCS[d].kicker}</span>
              </button>
            ))}
          </div>
          {doc === 'investment' ? <ul className="mt-6 space-y-3 border-l-2 border-gold-500/60 pl-4 text-sm leading-relaxed text-ink-700" data-testid="text-presentation-context">
            <li>The stated USD 4M capital requirement is to launch and position the platform. It is not a valuation and not funds already raised; allocation by category is still to be defined.</li>
            <li>Revenue figures for 2026–2028 are projections, not achieved results. No return is guaranteed.</li>
            <li>Some Arabic lettering in the original file renders imperfectly; pages are shown exactly as supplied.</li>
          </ul> : <ul className="mt-6 space-y-3 border-l-2 border-gold-500/60 pl-4 text-sm leading-relaxed text-ink-700" data-testid="text-partnership-context">
            <li>Programme dates, outdoor placements and deliverables are subject to a written agreement; timings in the document are not confirmed dates.</li>
            <li>Some programmes and app features described are in preparation and not yet fully live. Projections are not achieved results.</li>
            <li>No reach, speaking slot, transaction or documentary broadcast is guaranteed.</li>
          </ul>}
          <a href={PDF_SRC} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-lagoon-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500" data-testid="link-presentation-pdf">
            Open original PDF <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>

        <div className="lg:col-span-8">
          <div
            id="presentation-reader"
            role="tabpanel"
            tabIndex={0}
            onKeyDown={onKey}
            aria-roledescription="presentation reader"
            aria-label={`${DOCS[doc].label}, page ${page} of ${TOTAL}. Use arrow keys to change page.`}
            className="rounded-[var(--radius)] border border-sand-300 bg-ivory-50 p-3 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 sm:p-5"
            data-testid="reader-investment-presentation"
          >
            <div className="relative mx-auto aspect-[1/1.414] w-full max-w-xl overflow-hidden bg-sand-100">
              {status === 'loading' && <div className="absolute inset-0 animate-pulse bg-sand-100" aria-hidden="true" />}
              {status === 'error' ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center" role="alert" data-testid="status-presentation-error">
                  <p className="text-sm text-ink-800">Page {page} could not be loaded.</p>
                  <button type="button" onClick={() => { setStatus('loading'); setAttempt((a) => a + 1); }} className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-gold-500 px-4 py-2 text-sm font-semibold text-ink-900 transition-colors hover:bg-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500" data-testid="button-presentation-retry">
                    <RotateCcw className="h-4 w-4" aria-hidden="true" /> Retry
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => setZoom(true)} className="group absolute inset-0 cursor-zoom-in focus-visible:outline-none" aria-label={`Enlarge page ${page}`} data-testid="button-presentation-zoom">
                  <img
                    key={src}
                    src={src}
                    alt={`${DOCS[doc].label} page ${page}: ${meta.title}`}
                    onLoad={() => setStatus('ready')}
                    onError={() => setStatus('error')}
                    className={`h-full w-full object-contain transition-opacity duration-300 ${status === 'ready' ? 'opacity-100' : 'opacity-0'}`}
                  />
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-[var(--radius)] bg-lagoon-900/80 px-2 py-1 text-xs text-ivory-100 opacity-80 transition-opacity group-hover:opacity-100">
                    <Maximize2 className="h-3 w-3" aria-hidden="true" /> Enlarge
                  </span>
                </button>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <button type="button" className={navBtn} onClick={() => go(page - 1)} disabled={page === 1} aria-label="Previous page" data-testid="button-presentation-prev">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <label className="flex items-center gap-2 text-sm text-ink-800">
                <span className="sr-only">Go to page</span>
                <select value={page} onChange={(e) => go(Number(e.target.value))} className="min-h-11 max-w-[14rem] rounded-[var(--radius)] border border-sand-300 bg-ivory-50 px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500" data-testid="select-presentation-page">
                  {PAGES.map((p, i) => <option key={i} value={i + 1}>{i + 1}. {p.title}</option>)}
                </select>
                <span className="font-mono text-xs text-ink-700" aria-live="polite" data-testid="text-presentation-counter">{page} / {TOTAL}</span>
              </label>
              <button type="button" className={navBtn} onClick={() => go(page + 1)} disabled={page === TOTAL} aria-label="Next page" data-testid="button-presentation-next">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-700" data-testid="text-presentation-summary">
              <span className="font-semibold text-ink-900">{meta.title}.</span> {meta.summary}
            </p>
          </div>
        </div>
      </div>

      <div id="annual-partnership" className="mx-auto mt-16 max-w-7xl scroll-mt-24 px-6" data-testid="section-partnership-levels">
        <SectionHeading eyebrow="ANNUAL PARTNERSHIP 2026–2027" heading="FIVE PARTNER LEVELS" size="md" />
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-ink-700">
          Each level runs for 12 months and is cumulative: it includes everything in the levels before it. These are sponsorship package fees for services, not investments, and they are separate from charitable donations. Choosing a level starts an application in the member area — nothing is paid online here.
        </p>
        <ol className="mt-8 grid grid-cols-1 border-t border-sand-300 md:grid-cols-2 xl:grid-cols-5">
          {LEVELS.map((l, i) => (
            <li key={l.pkg} className="flex flex-col border-b border-sand-300 p-5 transition-colors duration-200 hover:bg-ivory-50 xl:border-r xl:last:border-r-0" data-testid={`card-level-${l.pkg}`}>
              <span className="font-mono text-xs text-gold-700">0{i + 1} · 12 months</span>
              <h3 className="mt-2 font-display text-lg text-ink-900">{l.name}</h3>
              <p className="mt-1 font-mono text-sm text-lagoon-700" data-testid={`text-level-price-${l.pkg}`}>{l.price}</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-ink-700">{i === 0 ? 'Includes' : `All of ${LEVELS[i - 1].name}, plus`}</p>
              <ul className="mt-2 flex-1 space-y-1.5 text-sm leading-relaxed text-ink-800">
                {l.adds.map((a) => <li key={a}>{a}</li>)}
              </ul>
              <Link href={`/member/certifications?package=${l.pkg}&role=${l.role}`} className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-lagoon-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500" data-testid={`link-level-apply-${l.pkg}`}>
                Apply <span className="font-normal text-ink-700">(member area)</span> <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-xs leading-relaxed text-ink-700">Benefits marked as consideration or opportunity depend on availability, selection and editorial decisions. Final deliverables are set in a written agreement.</p>
      </div>

      <Dialog open={zoom} onOpenChange={setZoom}>
        <DialogContent className="max-h-[95dvh] w-[96vw] max-w-4xl overflow-auto bg-ivory-50 p-3 sm:p-5">
          <DialogTitle className="font-display text-base">Page {page} — {meta.title}</DialogTitle>
          <DialogDescription className="text-xs">{meta.summary}</DialogDescription>
          <img src={src} alt={`${DOCS[doc].label} page ${page}: ${meta.title}`} className="w-full" />
          <div className="flex justify-between">
            <button type="button" className={navBtn} onClick={() => go(page - 1)} disabled={page === 1} aria-label="Previous page" data-testid="button-zoom-prev"><ChevronLeft className="h-5 w-5" /></button>
            <span className="self-center font-mono text-xs">{page} / {TOTAL}</span>
            <button type="button" className={navBtn} onClick={() => go(page + 1)} disabled={page === TOTAL} aria-label="Next page" data-testid="button-zoom-next"><ChevronRight className="h-5 w-5" /></button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
