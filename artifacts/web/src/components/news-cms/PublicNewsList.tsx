import { useState } from 'react';
import { Link } from 'wouter';
import { RotateCw } from 'lucide-react';
import { useGetPublishedNewsArticles, getGetPublishedNewsArticlesQueryKey } from '@workspace/api-client-react';
import { categoryLabel, formatDate, publicMediaUrl } from '@/lib/news-cms';

const ring = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2';

export default function PublicNewsList() {
  const [page, setPage] = useState(1);
  const q = useGetPublishedNewsArticles({ page }, { query: { queryKey: getGetPublishedNewsArticlesQueryKey({ page }), refetchOnMount: 'always', refetchInterval: 60000 } });
  const items = q.data?.items ?? [];
  if (!q.isLoading && !q.isError && items.length === 0 && page === 1) return null;
  return (
    <section className="w-full bg-ivory-50 py-section-md" aria-labelledby="cms-news-heading" data-testid="section-cms-news">
      <div className="mx-auto max-w-7xl px-6">
        <p id="cms-news-heading" className="text-eyebrow text-gold-600">Latest from the Movement</p>
        {q.isLoading ? (
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">{[0, 1, 2].map((i) => <li key={i} className="h-72 animate-pulse rounded-sm bg-ivory-200" />)}</ul>
        ) : q.isError ? (
          <div role="alert" className="mt-8 max-w-xl text-lagoon-800">Latest articles could not be loaded.
            <button type="button" onClick={() => q.refetch()} className={`ml-3 inline-flex items-center gap-1 text-sm font-semibold text-gold-700 ${ring}`} data-testid="button-retry-cms-news"><RotateCw className="h-3.5 w-3.5" />Try again</button>
          </div>
        ) : (
          <ul className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((a, i) => {
              const s = a.snapshot;
              const date = s.publicationDate ?? a.publishedAt;
              return (
                <li key={a.id} className={i === 0 && page === 1 ? 'sm:col-span-2' : ''} data-testid={`card-cms-news-${a.slug}`}>
                  <Link href={`/news/${a.slug}`} className={`group block rounded-sm ${ring}`}>
                    <div className="aspect-[16/9] overflow-hidden rounded-sm bg-lagoon-900">
                      {s.cover ? <img src={publicMediaUrl(a.slug)(s.cover.uploadId)} alt={s.cover.alt} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transform-none" />
                        : <div className="grid h-full place-items-center font-display text-sm tracking-[0.3em] text-gold-400/70">TOMI</div>}
                    </div>
                    <p className="mt-4 text-eyebrow text-gold-700">{categoryLabel(s.category)} · <time dateTime={date}>{formatDate(date)}</time></p>
                    <h2 className={`mt-2 font-display leading-tight text-lagoon-900 transition-colors group-hover:text-gold-700 ${i === 0 && page === 1 ? 'text-2xl sm:text-3xl' : 'text-xl'}`}>{s.title}</h2>
                    {s.subtitle && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-lagoon-800">{s.subtitle}</p>}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        {(page > 1 || q.data?.hasMore) && (
          <div className="mt-10 flex items-center gap-4 text-sm">
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className={`font-semibold text-lagoon-900 underline underline-offset-4 disabled:opacity-30 ${ring}`} data-testid="button-cms-news-prev">Newer</button>
            <span className="text-lagoon-700">Page {page}</span>
            <button type="button" disabled={!q.data?.hasMore} onClick={() => setPage((p) => p + 1)} className={`font-semibold text-lagoon-900 underline underline-offset-4 disabled:opacity-30 ${ring}`} data-testid="button-cms-news-next">Older</button>
          </div>
        )}
      </div>
    </section>
  );
}
