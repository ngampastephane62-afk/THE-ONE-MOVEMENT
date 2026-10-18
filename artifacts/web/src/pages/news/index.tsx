import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import { ArrowUpRight, RotateCw, Search, X } from 'lucide-react';
import { useGetNewsArchive, getGetNewsArchiveQueryKey, type PressEntry } from '@workspace/api-client-react';
import HeroSurface from '@/components/HeroSurface';
import GoldThread from '@/components/GoldThread';
import SectionHeading from '@/components/SectionHeading';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getPublishedArticles } from '@/lib/news-data';
import { PRESS_CATEGORY_LABELS, assetUrl, captureCount, outboundLink } from '@/lib/press';
import { CaptureStack, EvidenceViewer, PublisherMark, useCaptureDeepLink } from '@/components/news/PressParts';
import PhotoSetActions from '@/components/editorial/PhotoSetActions';
import NewsVideo from '@/components/editorial/NewsVideo';
import { EDITORIAL_VIDEO_NEWS, formatNewsDate } from '@/lib/editorial-news';
import PlacementLabel from '@/components/editorial/PlacementLabel';

const TITLE = 'In the Press — Ten Years of Coverage | The One Movement International';
const DESC = 'The historical press archive of The One Movement International: publisher coverage of the Movement, its Founder and CEO, and its programmes, with the original captures preserved.';
const CATS = ['movement', 'founder', 'editions', 'humanitarian'] as const;
const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2';

function LedgerEntry({ e, n }: { e: PressEntry; n: number }) {
  const [idx, setIdx] = useState<number | null>(null);
  const link = outboundLink(e);
  useCaptureDeepLink(e.evidenceUrls, setIdx);
  return (
    <li className="reveal-safe grid grid-cols-1 gap-8 border-t border-gold-500/20 py-12 md:grid-cols-[11rem_1fr_15rem] md:gap-10" data-testid={`card-coverage-${e.id}`}>
      <div className="flex items-start gap-4 md:flex-col">
        <span className="font-display text-sm tracking-[0.2em] text-gold-500" aria-hidden>{String(n).padStart(2, '0')}</span>
        <PublisherMark outlet={e.outlet} logoUrl={e.logoUrl} />
      </div>
      <div className="min-w-0">
        <PlacementLabel kind="editorial" tone="dark" />
        <p className="mt-2 text-eyebrow text-gold-400">{e.outlet} · {e.dateLabel}</p>
        <h3 className="mt-3 text-2xl leading-tight text-ivory-100 sm:text-3xl" style={{ fontFamily: 'var(--font-display)' }}>
          <Link href={`/news/coverage/${e.id}`} className={cn('rounded-sharp hover:text-gold-400 transition-colors', focusRing)} data-testid={`link-coverage-${e.id}`}>{e.title}</Link>
        </h3>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-ivory-200 line-clamp-4">{e.summary}</p>
        <p className="mt-2 text-xs text-ivory-300">Summary of coverage published by {e.outlet}.</p>
        <div className="mt-6 flex flex-wrap items-center gap-3 text-xs">
          <span className="rounded-full border border-gold-500/35 px-3 py-1 uppercase tracking-wider text-gold-400">{PRESS_CATEGORY_LABELS[e.category]}</span>
          <span className="rounded-full border border-ivory-300/25 px-3 py-1 uppercase tracking-wider text-ivory-200" data-testid={`text-capture-count-${e.id}`}>1 publication · {captureCount(e.evidenceUrls.length)}</span>
          <Link href={`/news/coverage/${e.id}`} className={cn('font-semibold uppercase tracking-wider text-ivory-100 underline decoration-gold-500/60 underline-offset-4 hover:text-gold-400', focusRing)}>Full record</Link>
          {link && (
            <a href={link.href} target="_blank" rel="noopener noreferrer" className={cn('inline-flex items-center gap-1 font-semibold uppercase tracking-wider text-gold-400 hover:text-gold-500', focusRing)} data-testid={`link-outbound-${e.id}`}>
              {link.label}<ArrowUpRight className="h-3.5 w-3.5" /><span className="sr-only"> (opens in a new tab)</span>
            </a>
          )}
        </div>
      </div>
      <div>
        <CaptureStack images={e.evidenceUrls} outlet={e.outlet} onOpen={setIdx} testId={`button-open-captures-${e.id}`} />
        {e.evidenceUrls.length > 0 && <PhotoSetActions tone="dark" label="Choose a capture to react to" items={e.evidenceUrls.map((src, i) => ({ src: assetUrl(src), title: `${e.outlet} — ${e.title}, capture ${i + 1}` }))} />}
      </div>
      <EvidenceViewer images={e.evidenceUrls} outlet={e.outlet} title={e.title} index={idx} onIndex={setIdx} onClose={() => setIdx(null)} />
    </li>
  );
}

export default function News() {
  const q = useGetNewsArchive({ query: { queryKey: getGetNewsArchiveQueryKey(), staleTime: 30000, refetchOnMount: true } });
  const entries = useMemo(() => q.data ?? [], [q.data]);
  const [search, setSearch] = useState('');
  const [outlet, setOutlet] = useState('');
  const [cat, setCat] = useState<string>('');
  const legacy = getPublishedArticles();

  const outlets = useMemo(() => Array.from(new Set(entries.map((e) => e.outlet))).sort(), [entries]);
  const presentCats = CATS.filter((c) => entries.some((e) => e.category === c));
  const filtered = entries.filter((e) => {
    if (outlet && e.outlet !== outlet) return false;
    if (cat && e.category !== cat) return false;
    const s = search.trim().toLowerCase();
    return !s || [e.title, e.outlet, e.summary, e.dateLabel].some((f) => f.toLowerCase().includes(s));
  });
  const totalCaptures = entries.reduce((a, e) => a + e.evidenceUrls.length, 0);
  const filtering = !!(search || outlet || cat);

  return (
    <div>
      <Helmet>
        <title>{TITLE}</title>
        <meta name="description" content={DESC} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESC} />
        <meta property="og:type" content="website" />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESC} />
      </Helmet>

      <HeroSurface glowOrigin="bottom-center" minHeight="72vh">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-section-lg lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div>
            <p className="text-eyebrow text-gold-400 mb-6 animate-fade-in">News · The press archive</p>
            <h1 className="text-display-xl uppercase text-ivory-100 animate-fade-up">Ten years,<br />on the record.</h1>
            <GoldThread className="mt-8" length="200px" node />
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ivory-200 animate-fade-in" style={{ animationDelay: '0.15s' }}>
              For a decade, media partners have followed The One Movement International — its gatherings, its Founder and CEO, and the programmes that carry its message of unity. This archive keeps their coverage as it was published, screen by screen.
            </p>
          </div>
          {entries.length > 0 && (
            <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-sm border border-gold-500/25 bg-gold-500/20 animate-fade-in" style={{ animationDelay: '0.3s' }} data-testid="stats-archive">
              {[[entries.length, entries.length === 1 ? 'Publication' : 'Publications'], [outlets.length, outlets.length === 1 ? 'Publisher' : 'Publishers'], [totalCaptures, 'Original captures']].map(([v, l]) => (
                <div key={l} className="bg-lagoon-900/90 p-5">
                  <dt className="text-[10px] uppercase tracking-[0.16em] text-ivory-300">{l}</dt>
                  <dd className="mt-2 font-display text-3xl text-gold-400">{v}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </HeroSurface>

      <section className="w-full bg-[hsl(30_40%_97%)] py-section-md" aria-labelledby="latest-heading">
        <div className="mx-auto max-w-7xl px-6">
          <p id="latest-heading" className="text-eyebrow text-gold-600">News & announcements</p>
          {EDITORIAL_VIDEO_NEWS.map((n) => (
            <article key={n.slug} className="mt-8 grid gap-10 border-t border-gold-500/30 pt-10 md:grid-cols-[18rem_1fr] md:items-center lg:gap-16" data-testid={`card-news-${n.slug}`}>
              <NewsVideo item={n} compact />
              <div className="min-w-0">
                <PlacementLabel kind="editorial" />
                <p className="mt-2 text-eyebrow text-[hsl(338_55%_40%)]">{n.kicker} · <span>Shared on</span> <time dateTime={n.publishedAt}>{formatNewsDate(n.publishedAt)}</time></p>
                <h2 className="mt-4 text-3xl leading-tight text-lagoon-900 sm:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>
                  <Link href={`/news/${n.slug}`} className={cn('rounded-sharp hover:text-[hsl(338_55%_40%)] transition-colors', focusRing)} data-testid={`link-news-${n.slug}`}>{n.title}</Link>
                </h2>
                <p className="mt-5 max-w-2xl text-lg leading-relaxed text-lagoon-800">{n.standfirst}</p>
                <div className="mt-8 flex flex-wrap items-center gap-5">
                  <a href={n.source.url} target="_blank" rel="noopener noreferrer"
                    className={cn(buttonVariants({ size: 'lg' }), 'max-w-full whitespace-normal text-center', focusRing)}
                    data-testid={`link-source-${n.slug}`}>
                    <span>View EMAAR’s official page</span><ArrowUpRight className="ml-2 h-4 w-4 shrink-0" aria-hidden />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                  <Link href={`/news/${n.slug}`} className={cn('text-sm font-semibold text-lagoon-800 underline underline-offset-4', focusRing)} data-testid={`link-read-${n.slug}`}>View announcement</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="w-full bg-ivory-50 py-section-md">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 md:grid-cols-3">
          {[
            ['The Movement', 'How publishers have described TOMI as a cross-border movement for culture, diplomacy and solidarity.'],
            ['The Founder & CEO', 'Coverage of the person who has carried the vision since its first edition, in their own outlets\u2019 words.'],
            ['The Programmes', 'Fashion weeks, peace editions and humanitarian action, documented by the partners who were there.'],
          ].map(([h, b], i) => (
            <div key={h} className="border-l-2 border-gold-500 pl-5">
              <p className="font-display text-xs tracking-[0.2em] text-gold-600">0{i + 1}</p>
              <p className="mt-2 font-display text-lg uppercase tracking-wide text-lagoon-900">{h}</p>
              <p className="mt-2 text-sm leading-relaxed text-lagoon-800">{b}</p>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-10 max-w-7xl px-6 text-sm text-lagoon-700">
          The archive grows as historical coverage is recovered and added. Years without an entry here simply have not been archived yet.
        </p>
      </section>

      <section className="w-full py-section-lg" style={{ backgroundColor: 'hsl(187 67% 8%)' }} aria-labelledby="archive-heading">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div id="archive-heading"><SectionHeading eyebrow="Historical press partners" heading="THE COVERAGE." surface="dark" thread /></div>
            {entries.length > 0 && (
              <div className="flex flex-col gap-3 sm:flex-row" role="search">
                <label className="relative block">
                  <span className="sr-only">Search coverage</span>
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ivory-300" />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search titles, outlets, summaries" className="w-full rounded-sm border border-gold-500/30 bg-lagoon-900 py-2.5 pl-9 pr-3 text-sm text-ivory-100 placeholder:text-ivory-300/60 focus:border-gold-400 focus:outline-none sm:w-72" data-testid="input-search-coverage" />
                </label>
                <label className="block">
                  <span className="sr-only">Filter by publisher</span>
                  <select value={outlet} onChange={(e) => setOutlet(e.target.value)} className="w-full rounded-sm border border-gold-500/30 bg-lagoon-900 px-3 py-2.5 text-sm text-ivory-100 focus:border-gold-400 focus:outline-none" data-testid="select-outlet">
                    <option value="">All publishers</option>
                    {outlets.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </label>
              </div>
            )}
          </div>

          {presentCats.length > 1 && (
            <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filter by subject">
              {[['', 'All subjects'] as const, ...presentCats.map((c) => [c, PRESS_CATEGORY_LABELS[c]] as const)].map(([v, l]) => (
                <button key={v || 'all'} type="button" aria-pressed={cat === v} onClick={() => setCat(v)} className={cn('rounded-sm border px-4 py-2 text-xs uppercase tracking-widest transition-colors', focusRing, cat === v ? 'border-gold-400 bg-gold-400/10 text-gold-400' : 'border-gold-500/30 text-ivory-300 hover:text-ivory-100')} data-testid={`button-category-${v || 'all'}`}>{l}</button>
              ))}
            </div>
          )}

          <div className="mt-10" aria-live="polite">
            {q.isLoading ? (
              <ul aria-busy="true" aria-label="Loading coverage">
                {[0, 1, 2].map((i) => (
                  <li key={i} className="grid gap-8 border-t border-gold-500/15 py-12 md:grid-cols-[11rem_1fr_15rem]">
                    <div className="h-16 w-28 animate-pulse rounded-sm bg-lagoon-800" />
                    <div className="space-y-3"><div className="h-3 w-40 animate-pulse bg-lagoon-800" /><div className="h-7 w-3/4 animate-pulse bg-lagoon-800" /><div className="h-16 w-full animate-pulse bg-lagoon-800/70" /></div>
                    <div className="h-56 w-44 animate-pulse rounded-sm bg-lagoon-800" />
                  </li>
                ))}
              </ul>
            ) : q.isError ? (
              <div className="max-w-xl rounded-sm border border-coral-500/40 bg-lagoon-900 p-6" role="alert">
                <p className="text-ivory-100">The press archive could not be loaded just now.</p>
                <button type="button" onClick={() => q.refetch()} className={cn('mt-4 inline-flex items-center gap-2 rounded-sm bg-gold-500 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink-900', focusRing)} data-testid="button-retry-archive"><RotateCw className="h-3.5 w-3.5" />Try again</button>
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
                <button type="button" onClick={() => { setSearch(''); setOutlet(''); setCat(''); }} className={cn('mt-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gold-400', focusRing)} data-testid="button-clear-filters"><X className="h-3.5 w-3.5" />Clear filters</button>
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

      {legacy.length > 0 && (
        <section className="w-full bg-ivory-50 py-section-lg">
          <div className="mx-auto max-w-7xl px-6">
            <SectionHeading eyebrow="From the Movement" heading="OFFICIAL ARTICLES." surface="light" thread />
            <ul className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {legacy.map((a) => (
                <li key={a.slug}>
                  <Link href={`/news/${a.slug}`} className={cn('block rounded-sm border border-sand-200 bg-ivory-100 p-6 hover:border-gold-500', focusRing)}>
                    <p className="font-display text-base uppercase text-lagoon-900">{a.title}</p>
                    <p className="mt-3 line-clamp-3 text-sm text-lagoon-800">{a.excerpt}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section id="editorial-policy" className="w-full bg-ivory-100 py-section-lg">
        <div className="mx-auto max-w-3xl px-6">
          <SectionHeading eyebrow="How this archive is kept" heading="AS PUBLISHED, CREDITED." surface="light" thread />
          <div className="mt-8 space-y-4 text-lg leading-relaxed text-lagoon-800">
            <p>Every entry names its publisher and keeps the original screens uncropped. Summaries are ours and are attributed; the reporting belongs to the outlet.</p>
            <p>Where we hold the exact original link, we offer Read original. Otherwise we point to the publisher's own site rather than imply a direct article link. Likes, views or shares visible in a capture reflect the moment it was taken, not total reach.</p>
          </div>
        </div>
      </section>

      <section className="w-full py-section-md" style={{ backgroundColor: 'hsl(187 67% 8%)' }}>
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 md:flex-row md:items-center md:justify-between">
          <p className="max-w-xl text-lg text-ivory-200">Covering the Movement or holding past coverage of it? Media partnerships begin with a conversation.</p>
          <Link href="/join#institutional-inquiry" className={cn(buttonVariants({ size: 'lg' }), focusRing)} data-testid="link-media-inquiry">Begin the conversation</Link>
        </div>
      </section>
    </div>
  );
}
