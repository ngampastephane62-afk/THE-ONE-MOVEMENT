import { useState } from 'react';
import { Link } from 'wouter';
import { Plus, RotateCw } from 'lucide-react';
import { useGetPublishedNewsArticles, getGetPublishedNewsArticlesQueryKey, useGetMagazineSubmissions } from '@workspace/api-client-react';
import { TROPIK_CATEGORY, formatDate, publicMediaUrl } from '@/lib/news-cms';
import { useSubmissionKeys } from './contribute';

const ring = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2';

/** Founder-only shortcut, using the same auth-safe submissions query as the contributor space. */
function FounderAdd() {
  const k = useSubmissionKeys();
  const subs = useGetMagazineSubmissions({ query: { enabled: k.signedIn, queryKey: k.own } });
  if (!k.signedIn || !subs.data?.founder) return null;
  return (
    <Link href="/member/founder/tropik" className={`inline-flex min-h-11 items-center gap-1.5 bg-lagoon-900 px-5 text-xs font-semibold uppercase tracking-[0.2em] text-gold-400 hover:bg-lagoon-800 ${ring}`} data-testid="link-add-tropik-article">
      <Plus className="h-3.5 w-3.5" />Add Tropik article
    </Link>
  );
}

/** Published Tropik articles from the News CMS. Each opens at /news/:slug with its engagement. */
export default function TropikArticles() {
  const [page, setPage] = useState(1);
  const params = { page, category: TROPIK_CATEGORY };
  const q = useGetPublishedNewsArticles(params, { query: { queryKey: getGetPublishedNewsArticlesQueryKey(params), refetchInterval: 60000 } });
  const items = q.data?.items ?? [];

  return (
    <section id="tropik-articles" className="scroll-mt-12 border-t border-ink-900/15 bg-ivory-50" aria-labelledby="tropik-articles-heading" data-testid="section-tropik-articles">
      <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ink-900/15 pb-6">
          <div>
            <p className="text-eyebrow text-gold-600">FROM THE NEWSROOM</p>
            <h2 id="tropik-articles-heading" className="mt-3 font-display text-4xl md:text-5xl">Tropik articles</h2>
            <p className="mt-3 max-w-xl leading-relaxed text-ink-800">New stories published by the editorial team, between issues.</p>
          </div>
          <FounderAdd />
        </div>

        {q.isLoading ? (
          <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">{[0, 1, 2].map((i) => <li key={i} className="h-72 animate-pulse bg-ivory-200" />)}</ul>
        ) : q.isError ? (
          <p role="alert" className="mt-8 text-sm text-ink-800">Tropik articles could not be loaded.
            <button type="button" onClick={() => q.refetch()} className={`ml-3 inline-flex items-center gap-1 font-semibold text-gold-700 ${ring}`} data-testid="button-retry-tropik-articles"><RotateCw className="h-3.5 w-3.5" />Try again</button>
          </p>
        ) : items.length === 0 ? (
          <div className="mt-10 border border-dashed border-ink-900/20 p-10 text-center" data-testid="text-tropik-articles-empty">
            <p className="font-display text-2xl text-ink-900">{page > 1 ? 'No more articles' : 'The next story is being written.'}</p>
            <p className="mt-2 text-sm text-ink-700">Published Tropik articles will appear here.</p>
          </div>
        ) : (
          <ul className="mt-10 columns-1 gap-8 sm:columns-2 lg:columns-3">
            {items.map((a) => {
              const s = a.snapshot;
              const date = s.publicationDate ?? a.publishedAt;
              return (
                <li key={a.id} className="mb-10 break-inside-avoid" data-testid={`card-tropik-article-${a.slug}`}>
                  <Link href={`/news/${a.slug}`} className={`group block ${ring}`}>
                    {/* Covers keep their intrinsic ratio: landscape, square or portrait. */}
                    {s.cover && <img src={publicMediaUrl(a.slug)(s.cover.uploadId)} alt={s.cover.alt} loading="lazy" className="block h-auto w-full bg-ivory-200 object-contain" />}
                    <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-700"><time dateTime={date ?? undefined}>{formatDate(date)}</time></p>
                    <h3 className="mt-2 font-display text-2xl leading-tight text-ink-900 transition-colors group-hover:text-lagoon-700">{s.title}</h3>
                    {s.subtitle && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-800">{s.subtitle}</p>}
                    <span className="mt-3 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-lagoon-700 underline-offset-4 group-hover:underline">Read the article</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        {(page > 1 || q.data?.hasMore) && (
          <div className="mt-4 flex items-center gap-4 text-sm">
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className={`min-h-11 font-semibold text-lagoon-700 disabled:opacity-30 ${ring}`} data-testid="button-tropik-prev">Newer</button>
            <span className="text-ink-700">Page {page}</span>
            <button type="button" disabled={!q.data?.hasMore} onClick={() => setPage((p) => p + 1)} className={`min-h-11 font-semibold text-lagoon-700 disabled:opacity-30 ${ring}`} data-testid="button-tropik-next">Older</button>
          </div>
        )}
      </div>
    </section>
  );
}
