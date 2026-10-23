import { useCallback, useEffect, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, Download, Maximize2, RotateCcw } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';


export type DocKey = 'investment' | 'partnership';
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

type Status = 'loading' | 'ready' | 'error';

export default function InvestmentPresentation({ doc }: { doc: DocKey }) {
  const [open, setOpen] = useState(false);
  const PDF_SRC = `${baseOf(doc)}presentation.pdf`;
  const btn = 'inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius)] px-6 text-sm font-semibold tracking-wide transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500';
  return (
    <div className="flex flex-col gap-3 sm:flex-row" data-testid={`actions-document-${doc}`}>
      <button type="button" onClick={() => setOpen(true)} className={`${btn} bg-lagoon-900 text-ivory-50 hover:bg-lagoon-800`} data-testid={`button-view-presentation-${doc}`}>
        <BookOpen className="h-4 w-4" aria-hidden="true" /> View presentation
      </button>
      <a href={PDF_SRC} target="_blank" rel="noopener noreferrer" download className={`${btn} border border-sand-300 text-ink-900 hover:border-gold-500`} data-testid={`link-download-pdf-${doc}`}>
        <Download className="h-4 w-4" aria-hidden="true" /> Download PDF
      </a>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[95dvh] w-[96vw] max-w-3xl overflow-auto bg-ivory-50 p-3 sm:p-5">
          <DialogTitle className="font-display text-base">{DOCS[doc].label}</DialogTitle>
          <DialogDescription className="text-xs">Use the arrow keys or controls to move between pages.</DialogDescription>
          {open && <Reader doc={doc} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Reader({ doc }: { doc: DocKey }) {
  const [page, setPage] = useState(1);
  const PAGES = DOCS[doc].pages;
  const pageSrc = (n: number) => pageSrcOf(doc, n);
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
    <div>
      <div>
          <div
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

            <div className="mt-4 grid grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] items-center gap-2">
              <button type="button" className={navBtn} onClick={() => go(page - 1)} disabled={page === 1} aria-label="Previous page" data-testid="button-presentation-prev">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <label className="flex min-w-0 flex-col items-center gap-1 text-sm text-ink-800">
                <span className="sr-only">Go to page</span>
                <select value={page} onChange={(e) => go(Number(e.target.value))} className="min-h-11 w-full min-w-0 max-w-full rounded-[var(--radius)] border border-sand-300 bg-ivory-50 px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500" data-testid="select-presentation-page">
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
    </div>
  );
}
