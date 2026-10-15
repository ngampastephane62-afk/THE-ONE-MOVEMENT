import { useMemo, useState } from 'react';
import { Download, ExternalLink, Search, X } from 'lucide-react';
import { MEDIA_CATEGORIES, MEDIA_OUTLETS, type MediaOutlet } from '@workspace/shared';
import MediaRequestDialog from './MediaRequestDialog';
import { CATALOGUE_PDF, baseUrl, outletFormats } from './util';

const STEP = 24;
const CAT = new Map(MEDIA_CATEGORIES.map((c) => [c.id, c.name]));
const ALL_FORMATS = Array.from(new Set(MEDIA_OUTLETS.flatMap((o) => outletFormats(o.formats)))).sort();

function Logo({ o }: { o: MediaOutlet }) {
  const [failed, setFailed] = useState(false);
  if (!o.logo || failed) {
    return <span className="text-lg text-ink-800" style={{ fontFamily: 'var(--font-display)' }} aria-hidden>{o.name.split(/\s+/).map((w) => w[0]).join('').slice(0, 3)}</span>;
  }
  return <img src={baseUrl(o.logo)} alt="" loading="lazy" decoding="async" onError={() => setFailed(true)} className="max-h-10 max-w-[80%] object-contain" />;
}

export default function MediaCatalogue() {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [fmt, setFmt] = useState('all');
  const [shown, setShown] = useState(STEP);
  const [active, setActive] = useState<MediaOutlet | null>(null);

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    return MEDIA_OUTLETS.filter((o) =>
      (cat === 'all' || o.categoryId === cat) &&
      (fmt === 'all' || outletFormats(o.formats).includes(fmt)) &&
      (!t || o.name.toLowerCase().includes(t) || (CAT.get(o.categoryId) ?? '').toLowerCase().includes(t) || o.languages.some((l) => l.toLowerCase().includes(t))));
  }, [q, cat, fmt]);

  const reset = (fn: () => void) => { fn(); setShown(STEP); };
  const visible = results.slice(shown - STEP, shown);
  const changePage = (end: number) => {
    setShown(end);
    document.getElementById('media-catalogue')?.scrollIntoView({ block: 'start', behavior: 'instant' });
  };

  return (
    <section id="media-catalogue" className="py-section-lg bg-ivory-100 border-t border-sand-200" aria-labelledby="catalogue-heading">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="text-eyebrow text-gold-600">MEDIA COVERAGE CATALOGUE · COORDINATED BY TROPIK AGENCY</p>
            <h2 id="catalogue-heading" className="mt-4 text-display-lg uppercase text-ink-900" style={{ fontFamily: 'var(--font-display)' }}>
              <span data-testid="text-outlet-total">{MEDIA_OUTLETS.length}</span> outlets. One reviewed conversation.
            </h2>
          </div>
          <div className="lg:col-span-5 text-sm leading-relaxed text-ink-700">
            <p>Browse every outlet in the supplied coverage list and request the format it lists. Each enquiry is reviewed by the administrator — there is no automatic checkout.</p>
            <p className="mt-3 text-xs text-ink-600">These outlets are not TOMI partners and do not endorse the Movement. Listing does not guarantee availability or publication; editorial decisions belong to each outlet.</p>
            <a href={CATALOGUE_PDF} download className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-lagoon-900 underline-offset-4 hover:underline" data-testid="link-download-catalogue"><Download className="h-4 w-4" /> Source PDF</a>
          </div>
        </div>

        <div className="sticky top-16 z-20 mt-10 -mx-6 border-y border-sand-200 bg-ivory-100/95 px-6 py-4 backdrop-blur" role="search">
          <div className="grid gap-3 md:grid-cols-12">
            <label className="relative md:col-span-5">
              <span className="sr-only">Search by outlet, category or language</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
              <input value={q} onChange={(e) => reset(() => setQ(e.target.value))} placeholder="Search outlet, category or language" className="w-full rounded-full border border-sand-300 bg-ivory-50 py-2.5 pl-9 pr-9 text-sm focus:border-lagoon-700 focus:outline-none focus:ring-2 focus:ring-lagoon-700/20" data-testid="input-catalogue-search" />
              {q && <button type="button" onClick={() => reset(() => setQ(''))} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500"><X className="h-4 w-4" /></button>}
            </label>
            <label className="md:col-span-4"><span className="sr-only">Category</span>
              <select value={cat} onChange={(e) => reset(() => setCat(e.target.value))} className="w-full rounded-full border border-sand-300 bg-ivory-50 px-4 py-2.5 text-sm" data-testid="select-catalogue-category">
                <option value="all">All {MEDIA_CATEGORIES.length} categories</option>
                {MEDIA_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label className="md:col-span-3"><span className="sr-only">Format</span>
              <select value={fmt} onChange={(e) => reset(() => setFmt(e.target.value))} className="w-full rounded-full border border-sand-300 bg-ivory-50 px-4 py-2.5 text-sm" data-testid="select-catalogue-format">
                <option value="all">All formats</option>
                {ALL_FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </label>
          </div>
          <p className="mt-3 text-xs text-ink-600" aria-live="polite" data-testid="text-catalogue-count">Showing {results.length ? shown - STEP + 1 : 0}–{Math.min(shown, results.length)} of {results.length} matching · {MEDIA_OUTLETS.length} in catalogue</p>
        </div>

        {results.length === 0 ? (
          <div className="mt-12 rounded-sm border border-dashed border-sand-300 p-10 text-center">
            <p className="text-xl text-ink-900" style={{ fontFamily: 'var(--font-display)' }}>No outlet matches those filters.</p>
            <button type="button" onClick={() => reset(() => { setQ(''); setCat('all'); setFmt('all'); })} className="mt-4 text-xs font-semibold uppercase tracking-widest text-lagoon-900 underline" data-testid="button-clear-filters">Clear filters</button>
          </div>
        ) : (
          <ul className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-sm border border-sand-200 bg-sand-200 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((o) => (
              <li key={o.id} className="group flex flex-col bg-ivory-50 p-5 transition-colors hover:bg-ivory-100" data-testid={`card-outlet-${o.id}`}>
                <div className="grid h-16 place-items-center rounded-sm bg-[hsl(40_30%_96%)]"><Logo o={o} /></div>
                <h3 className="mt-4 text-lg leading-tight text-ink-900" style={{ fontFamily: 'var(--font-display)' }}>{o.name}</h3>
                <p className="mt-1 text-xs text-ink-600">{CAT.get(o.categoryId)}{o.languages.length ? ` · ${o.languages.join(', ')}` : ''}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {outletFormats(o.formats).map((f) => <span key={f} className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wider ${o.formats.length ? 'border-lagoon-700/30 text-lagoon-900' : 'border-gold-600/40 text-gold-700'}`}>{f}</span>)}
                </div>
                <div className="mt-auto flex items-center justify-between gap-2 pt-5">
                  <button type="button" onClick={() => setActive(o)} className="rounded-full bg-lagoon-900 px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-ivory-50 hover:bg-lagoon-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500" data-testid={`button-request-${o.id}`}>Request</button>
                  {o.website && <a href={o.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] text-ink-600 hover:text-lagoon-900" aria-label={`${o.name} website (opens in new tab)`} data-testid={`link-outlet-${o.id}`}>Site <ExternalLink className="h-3 w-3" /></a>}
                </div>
              </li>
            ))}
          </ul>
        )}
        {results.length > STEP && (
          <nav className="mt-8 flex flex-wrap items-center justify-center gap-3" aria-label="Media catalogue pages">
            <button type="button" disabled={shown <= STEP} onClick={() => changePage(shown - STEP)} className="rounded-full border border-lagoon-900 px-5 py-3 text-xs font-semibold uppercase tracking-widest text-lagoon-900 hover:bg-lagoon-900 hover:text-ivory-50 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-lagoon-900" data-testid="button-catalogue-prev">Previous</button>
            <span className="text-xs text-ink-700" data-testid="text-catalogue-page">Page {shown / STEP} of {Math.ceil(results.length / STEP)}</span>
            <button type="button" disabled={shown >= results.length} onClick={() => changePage(shown + STEP)} className="rounded-full border border-lagoon-900 px-5 py-3 text-xs font-semibold uppercase tracking-widest text-lagoon-900 hover:bg-lagoon-900 hover:text-ivory-50 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-lagoon-900" data-testid="button-catalogue-next">Next</button>
          </nav>
        )}
      </div>
      {active && <MediaRequestDialog outlet={active} onClose={() => setActive(null)} />}
    </section>
  );
}
