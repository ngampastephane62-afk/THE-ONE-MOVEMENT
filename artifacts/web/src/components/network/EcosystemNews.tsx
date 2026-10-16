import { Link } from 'wouter';
import { ArrowRight, Archive, ExternalLink, Newspaper, PlayCircle, RotateCw } from 'lucide-react';
import { useGetNewsArchive, getGetNewsArchiveQueryKey } from '@workspace/api-client-react';
import { EDITORIAL_VIDEO_NEWS, formatNewsDate } from '@/lib/editorial-news';
import { getPublishedArticles, isSafeUrl } from '@/lib/news-data';
import { card } from './kit';

/**
 * Compact, read-only selection of the public News content for signed-in members.
 * Reuses the exact source records of the public /news page. No notifications,
 * no unread counts, no personalisation. Readable by every member tier.
 */
export default function EcosystemNews({ limit = 3, className = '' }: { limit?: number; className?: string }) {
  const q = useGetNewsArchive({
    query: {
      enabled: true, queryKey: getGetNewsArchiveQueryKey(), staleTime: 60000,
      refetchInterval: 120000, refetchIntervalInBackground: false, refetchOnWindowFocus: true,
    },
  });
  const curated = [
    ...EDITORIAL_VIDEO_NEWS.map((n) => ({ key: `v-${n.slug}`, href: `/news/${n.slug}`, kicker: n.kicker, title: n.title, text: n.standfirst, date: n.publishedAt, credit: n.credit, poster: n.video.poster, alt: n.video.label, sourceUrl: n.source.url, sourceName: n.source.name })),
    ...getPublishedArticles().map((a) => ({ key: `a-${a.slug}`, href: `/news/${a.slug}`, kicker: a.authorDisplayName, title: a.title, text: a.excerpt, date: a.publishedAt.slice(0, 10), credit: '', poster: '', alt: '', sourceUrl: a.sourceUrl && isSafeUrl(a.sourceUrl) ? a.sourceUrl : '', sourceName: a.authorDisplayName })),
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
  const press = (q.data ?? []).filter((e) => e.status === 'published').slice(0, limit);

  return (
    <section aria-labelledby="eco-news-title" className={`${card} overflow-hidden ${className}`} data-testid="panel-ecosystem-news">
      <header className="flex items-center justify-between gap-3 border-b border-sand-100 bg-lagoon-900 px-4 py-3">
        <h2 id="eco-news-title" className="flex items-center gap-2 text-sm font-semibold text-ivory-100"><Newspaper className="h-4 w-4 text-gold-400" />Ecosystem news</h2>
        <Link href="/news" className="inline-flex min-h-[44px] items-center gap-1 text-xs font-semibold text-gold-400 hover:underline" data-testid="link-news-all">See all news<ArrowRight className="h-3.5 w-3.5" /></Link>
      </header>

      <div className="p-4">
        <p className="text-eyebrow text-gold-700">Announcements</p>
        {curated.length === 0 ? <p className="mt-2 text-xs text-ink-700">No announcements published yet.</p> : (
          <ul className="mt-2 flex flex-col gap-3">
            {curated.map((n) => (
              <li key={n.key} className="flex gap-3" data-testid={`card-news-${n.key}`}>
                {n.poster ? (
                  <Link href={n.href} className="relative h-20 w-14 shrink-0 overflow-hidden rounded-lg bg-lagoon-800" aria-label={n.title}>
                    <img src={n.poster} alt={n.alt} loading="lazy" className="h-full w-full object-cover" />
                    <PlayCircle className="absolute bottom-1 right-1 h-4 w-4 text-ivory-50" aria-hidden />
                  </Link>
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase tracking-wider text-gold-700">{n.kicker}</p>
                  <Link href={n.href} className="mt-0.5 block text-sm font-semibold leading-snug text-ink-900 hover:text-lagoon-700">{n.title}</Link>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-700">{n.text}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 text-[11px] text-sand-400">
                    {n.credit && <span>{n.credit}</span>}
                    <span><span>Shared on</span> {formatNewsDate(n.date)}</span>
                    {n.sourceUrl && <a href={n.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-lagoon-700 hover:underline">{n.sourceName}<ExternalLink className="h-3 w-3" aria-hidden /><span className="sr-only">(opens in a new tab)</span></a>}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 border-t border-sand-100 pt-3">
          <p className="flex items-center gap-1.5 text-eyebrow text-gold-700"><Archive className="h-3.5 w-3.5" />Press archive</p>
          <p className="mt-0.5 text-[11px] text-sand-400">Past coverage, dated by its original publication.</p>
          {q.isLoading ? (
            <div className="mt-2 flex flex-col gap-2" aria-hidden>{[0, 1].map((i) => <div key={i} className="h-10 animate-pulse rounded-lg bg-ivory-200" />)}</div>
          ) : q.isError ? (
            <div role="alert" className="mt-2 flex flex-wrap items-center gap-2 rounded-lg border border-coral-500/40 bg-coral-500/5 p-2 text-xs text-ink-800">
              <span className="flex-1">The press archive did not load.</span>
              <button type="button" onClick={() => q.refetch()} className="inline-flex min-h-[36px] items-center gap-1 rounded-full border border-lagoon-700 px-3 font-semibold text-lagoon-700" data-testid="button-news-retry"><RotateCw className="h-3 w-3" />Retry</button>
            </div>
          ) : press.length === 0 ? <p className="mt-2 text-xs text-ink-700">No press coverage published yet.</p> : (
            <ul className="mt-2 flex flex-col divide-y divide-sand-100">
              {press.map((e) => (
                <li key={e.id} className="py-2" data-testid={`card-press-${e.id}`}>
                  <Link href={`/news/coverage/${e.id}`} className="block text-sm font-medium leading-snug text-ink-900 hover:text-lagoon-700">{e.title}</Link>
                  <p className="mt-0.5 text-[11px] text-sand-400"><span translate="no">{e.outlet}</span>{e.dateLabel && <> · {e.dateLabel}</>}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
