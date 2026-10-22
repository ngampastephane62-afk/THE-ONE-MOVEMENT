import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { ArrowUpRight, RotateCw, Search, X } from 'lucide-react';
import { useGetNewsArchive, getGetNewsArchiveQueryKey, type PressEntry } from '@workspace/api-client-react';
import { PRESS_CATEGORY_LABELS, assetUrl, captureCount, outboundLink } from '@/lib/press';
import { EvidenceViewer, PublisherMark, useCaptureDeepLink } from '@/components/news/PressParts';
import PhotoSetActions from '@/components/editorial/PhotoSetActions';
import PlacementLabel from '@/components/editorial/PlacementLabel';
import { useNewsReveal } from '@/hooks/use-news-motion';
import CaptureGallery from './CaptureGallery';
import { Lines, SectionTitle, ring } from './parts';
import { cn } from '@/lib/utils';

const CATS = ['movement', 'founder', 'editions', 'humanitarian'] as const;

function LedgerEntry({ e, n }: { e: PressEntry; n: number }) {
  const [idx, setIdx] = useState<number | null>(null);
  const [captureIndex, setCaptureIndex] = useState(0);
  const link = outboundLink(e);
  const ref = useNewsReveal<HTMLLIElement>();
  useCaptureDeepLink(e.evidenceUrls, setIdx);
  return (
    <li ref={ref} className="grid grid-cols-1 gap-8 border-t border-gold-500/20 py-12 md:grid-cols-[11rem_1fr_17rem] md:gap-10" data-testid={`card-coverage-${e.id}`}>
      <div className="nm-up flex items-start gap-4 md:flex-col">
        <span className="font-display text-sm tracking-[0.2em] text-gold-500" aria-hidden>{String(n).padStart(2, '0')}</span>
        <PublisherMark outlet={e.outlet} logoUrl={e.logoUrl} />
      </div>
      <div className="nm-side min-w-0" style={{ ['--x' as string]: '-24px', ['--d' as string]: '140ms' }}>
        <PlacementLabel kind="editorial" tone="dark" />
        <p className="mt-2 text-eyebrow text-gold-400">{e.outlet} · {e.dateLabel}</p>
        <h3 className="nm-headline mt-3 text-2xl leading-tight text-ivory-100 sm:text-3xl" style={{ fontFamily: 'var(--font-display)' }}>
          <Link href={`/news/coverage/${e.id}`} className={cn('rounded-sharp transition-colors hover:text-gold-400', ring)} data-testid={`link-coverage-${e.id}`}><Lines text={e.title} base={200} step={110} /></Link>
        </h3>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-ivory-200 line-clamp-4">{e.summary}</p>
        <p className="mt-2 text-xs text-ivory-300">Summary of coverage published by {e.outlet}.</p>
        <div className="mt-6 flex flex-wrap items-center gap-3 text-xs">
          <span className="rounded-full border border-gold-500/35 px-3 py-1 uppercase tracking-wider text-gold-400">{PRESS_CATEGORY_LABELS[e.category]}</span>
          <span className="rounded-full border border-ivory-300/25 px-3 py-1 uppercase tracking-wider text-ivory-200" data-testid={`text-capture-count-${e.id}`}>1 publication · {captureCount(e.evidenceUrls.length)}</span>
          <Link href={`/news/coverage/${e.id}`} className={cn('font-semibold uppercase tracking-wider text-ivory-100 underline decoration-gold-500/60 underline-offset-4 hover:text-gold-400', ring)}>Full record</Link>
          {link && (
            <a href={link.href} target="_blank" rel="noopener noreferrer" className={cn('inline-flex items-center gap-1 font-semibold uppercase tracking-wider text-gold-400 hover:text-gold-500', ring)} data-testid={`link-outbound-${e.id}`}>
              {link.label}<ArrowUpRight className="h-3.5 w-3.5" /><span className="sr-only"> (opens in a new tab)</span>
            </a>
          )}
        </div>
      </div>
      <div className="nm-media nm-from-bottom" style={{ ['--d' as string]: '220ms' }}>
        <CaptureGallery images={e.evidenceUrls} outlet={e.outlet} onOpen={setIdx} selectedIndex={captureIndex} onIndexChange={setCaptureIndex} testId={`button-open-captures-${e.id}`} />
        {e.evidenceUrls.length > 0 && <PhotoSetActions tone="dark" label="Choose a capture to react to" layout="row" selectedIndex={captureIndex} onSelectedIndexChange={setCaptureIndex} hideChooser items={e.evidenceUrls.map((src, i) => ({ src: assetUrl(src), title: `${e.outlet} — ${e.title}, capture ${i + 1}` }))} />}
      </div>
      <EvidenceViewer images={e.evidenceUrls} outlet={e.outlet} title={e.title} index={idx} onIndex={setIdx} onClose={() => setIdx(null)} />
    </li>
  );
}

export default function PressArchive() {
  const q = useGetNewsArchive({ query: { queryKey: getGetNewsArchiveQueryKey(), staleTime: 30000, refetchOnMount: true } });
  const entries = useMemo(() => q.data ?? [], [q.data]);
  const [search, setSearch] = useState('');
  const [outlet, setOutlet] = useState('');
  const [cat, setCat] = useState<string>('');
  const head = useNewsReveal<HTMLDivElement>();

  const outlets = useMemo(() => Array.from(new Set(entries.map((e) => e.outlet))).sort(), [entries]);
  const presentCats = CATS.filter((c) => entries.some((e) => e.category === c));
  const s = search.trim().toLowerCase();
  const filtered = entries.filter((e) => (!outlet || e.outlet === outlet) && (!cat || e.category === cat) && (!s || [e.title, e.outlet, e.summary, e.dateLabel].some((f) => f.toLowerCase().includes(s))));
  const totalCaptures = entries.reduce((a, e) => a + e.evidenceUrls.length, 0);
  const filtering = !!(search || outlet || cat);

  return (
    <section id="press-archive" className="relative w-full scroll-mt-24 py-section-lg" style={{ backgroundColor: 'hsl(187 67% 8%)' }} aria-labelledby="archive-heading" data-testid="section-press-archive">
      <div className="nm-band" aria-hidden />
      <div className="mx-auto max-w-7xl px-5 pt-section-md sm:px-6">
        <div ref={head} className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <SectionTitle id="archive-heading" eyebrow="Historical media archive" title="Ten years on the record." sub="A growing archive of the stories, voices and media coverage documenting our journey." />
          {entries.length > 0 && (
            <dl className="nm-up grid grid-cols-3 gap-px overflow-hidden rounded-sm border border-gold-500/25 bg-gold-500/20" style={{ ['--d' as string]: '420ms' }} data-testid="stats-archive">
              {[[entries.length, entries.length === 1 ? 'Publication' : 'Publications'], [outlets.length, outlets.length === 1 ? 'Publisher' : 'Publishers'], [totalCaptures, 'Original captures']].map(([v, l]) => (
                <div key={l} className="bg-lagoon-900/90 p-4 sm:p-5">
                  <dt className="text-[10px] uppercase tracking-[0.14em] text-ivory-300">{l}</dt>
                  <dd className="mt-2 font-display text-2xl text-gold-400 sm:text-3xl">{v}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
        <p className="mt-6 max-w-2xl text-sm text-ivory-300">Historical press coverage of The One Fashion Week International, The One Movement International and its Founder, kept apart from current TOMI news, with each publisher credited.</p>

        {entries.length > 0 && (
          <div className="mt-10 flex flex-col gap-3 sm:flex-row" role="search">
            <label className="relative block">
              <span className="sr-only">Search coverage</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ivory-300" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search titles, outlets, summaries" className="min-h-11 w-full rounded-sm border border-gold-500/30 bg-lagoon-900 py-2.5 pl-9 pr-3 text-sm text-ivory-100 placeholder:text-ivory-300/60 focus:border-gold-400 focus:outline-none sm:w-72" data-testid="input-search-coverage" />
            </label>
            <label className="block">
              <span className="sr-only">Filter by publisher</span>
              <select value={outlet} onChange={(e) => setOutlet(e.target.value)} className="min-h-11 w-full rounded-sm border border-gold-500/30 bg-lagoon-900 px-3 py-2.5 text-sm text-ivory-100 focus:border-gold-400 focus:outline-none" data-testid="select-outlet">
                <option value="">All publishers</option>
                {outlets.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </label>
          </div>
        )}
        {presentCats.length > 1 && (
          <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filter by subject">
            {[['', 'All subjects'] as const, ...presentCats.map((c) => [c, PRESS_CATEGORY_LABELS[c]] as const)].map(([v, l]) => (
              <button key={v || 'all'} type="button" aria-pressed={cat === v} onClick={() => setCat(v)} className={cn('min-h-11 rounded-sm border px-4 py-2 text-xs uppercase tracking-widest transition-colors', ring, cat === v ? 'border-gold-400 bg-gold-400/10 text-gold-400' : 'border-gold-500/30 text-ivory-300 hover:text-ivory-100')} data-testid={`button-category-${v || 'all'}`}>{l}</button>
            ))}
          </div>
        )}

        <div className="mt-10" aria-live="polite">
          {q.isLoading ? (
            <ul aria-busy="true" aria-label="Loading coverage">
              {[0, 1, 2].map((i) => (
                <li key={i} className="grid gap-8 border-t border-gold-500/15 py-12 md:grid-cols-[11rem_1fr_17rem]">
                  <div className="h-16 w-28 animate-pulse rounded-sm bg-lagoon-800" />
                  <div className="space-y-3"><div className="h-3 w-40 animate-pulse bg-lagoon-800" /><div className="h-7 w-3/4 animate-pulse bg-lagoon-800" /><div className="h-16 w-full animate-pulse bg-lagoon-800/70" /></div>
                  <div className="h-56 w-44 animate-pulse rounded-sm bg-lagoon-800" />
                </li>
              ))}
            </ul>
          ) : q.isError ? (
            <div className="max-w-xl rounded-sm border border-coral-500/40 bg-lagoon-900 p-6" role="alert">
              <p className="text-ivory-100">The press archive could not be loaded just now.</p>
              <button type="button" onClick={() => q.refetch()} className={cn('mt-4 inline-flex items-center gap-2 rounded-sm bg-gold-500 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink-900', ring)} data-testid="button-retry-archive"><RotateCw className="h-3.5 w-3.5" />Try again</button>
            </div>
          ) : entries.length === 0 ? (
            <div className="max-w-xl border-l-2 border-gold-500 pl-6">
              <p className="font-display text-xl uppercase text-ivory-100">The archive is being assembled.</p>
              <p className="mt-3 text-ivory-300">Historical coverage is being prepared for publication and will appear here with its original captures.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="max-w-xl border-l-2 border-gold-500 pl-6">
              <p className="font-display text-xl uppercase text-ivory-100">No coverage matches.</p>
              <p className="mt-3 text-ivory-300">Try another publisher, subject or search term.</p>
              <button type="button" onClick={() => { setSearch(''); setOutlet(''); setCat(''); }} className={cn('mt-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gold-400', ring)} data-testid="button-clear-filters"><X className="h-3.5 w-3.5" />Clear filters</button>
            </div>
          ) : (
            <>
              {filtering && <p className="mb-4 text-xs uppercase tracking-wider text-ivory-300">{filtered.length} of {entries.length} publications</p>}
              <ol>{filtered.map((e, i) => <LedgerEntry key={e.id} e={e} n={i + 1} />)}</ol>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
