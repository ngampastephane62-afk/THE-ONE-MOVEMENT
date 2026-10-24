import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';
import { useGetMediaPublications, getGetMediaPublicationsQueryKey, type MediaPublicationCategory } from '@workspace/api-client-react';
import SectionHeading from '@/components/SectionHeading';
import Reveal from '@/components/Reveal';
import { CATEGORIES, CATEGORY_LABEL } from '@/lib/media-center';
import MediaPublicationCard from './MediaPublicationCard';
import { uniquePublishedMedia } from '@/lib/media-publication-identity';

export default function MediaCenter() {
  const [page, setPage] = useState(1);
  const [cat, setCat] = useState<MediaPublicationCategory | 'all'>('all');
  const q = useGetMediaPublications({ page }, { query: { queryKey: getGetMediaPublicationsQueryKey({ page }), refetchOnMount: 'always', refetchOnWindowFocus: true, refetchInterval: 60_000, placeholderData: (prev) => prev } });
  const items = useMemo(() => uniquePublishedMedia(q.data?.items ?? []), [q.data]);
  const present = useMemo(() => CATEGORIES.filter((c) => items.some((p) => p.category === c)), [items]);
  const shown = cat === 'all' || !present.includes(cat) ? items : items.filter((p) => p.category === cat);
  const go = (n: number) => { setPage(n); setCat('all'); document.getElementById('media-center')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };

  return (
    <section id="media-center" className="scroll-mt-24 bg-ivory-50 py-section-lg" aria-labelledby="media-center-heading">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <div id="media-center-heading"><SectionHeading eyebrow="MEDIA CENTER" heading="PRESS / COVERAGE" surface="light" thread /></div>
          <p className="mt-6 max-w-2xl leading-relaxed text-ink-700">International press, television, magazines, interviews and official announcements about The One Movement International. Each entry is published by the Founder's office.</p>
        </Reveal>

        {present.length > 1 && (
          <div className="mt-10 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
            {(['all', ...present] as const).map((c) => {
              const sel = (cat === 'all' || !present.includes(cat as MediaPublicationCategory) ? 'all' : cat) === c;
              return (
                <button key={c} type="button" aria-pressed={sel} onClick={() => setCat(c)} className={`min-h-10 border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 ${sel ? 'border-lagoon-900 bg-lagoon-900 text-gold-400' : 'border-sand-300 text-ink-700 hover:border-gold-500'}`} data-testid={`filter-media-${c}`}>
                  {c === 'all' ? 'All' : CATEGORY_LABEL[c]}
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-10" aria-live="polite" aria-busy={q.isLoading}>
          {q.isLoading ? (
            <div className="grid gap-6 md:grid-cols-2">{[0, 1, 2, 3].map((i) => <div key={i} className="h-96 animate-pulse border border-sand-200 bg-ivory-100" />)}</div>
          ) : q.isError && !q.data ? (
            <div className="flex flex-wrap items-center gap-4 border-l-2 border-crimson-700 bg-ivory-100 px-5 py-4" role="alert">
              <p className="text-sm text-ink-800">The media center could not be loaded right now.</p>
              <button type="button" onClick={() => q.refetch()} className="inline-flex items-center gap-1.5 bg-lagoon-900 px-4 py-2 text-xs font-semibold text-ivory-100" data-testid="button-media-retry"><RotateCw className="h-3.5 w-3.5" />Try again</button>
            </div>
          ) : shown.length === 0 ? (
            <div className="max-w-2xl border border-sand-200 bg-ivory-100 p-8">
              <div className="mb-4 h-px w-12 bg-gold-500" aria-hidden="true" />
              <h3 className="text-lg text-ink-900" style={{ fontFamily: 'var(--font-display)' }}>No publications listed yet</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-700">Published articles and press mentions appear here only once confirmed. For interviews and editorial context, use the media inquiry below.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {shown.map((p, i) => (
                <Reveal key={p.id} delay={Math.min(i, 4) * 60} className={i === 0 && page === 1 && cat === 'all' ? 'md:col-span-2' : ''}>
                  <MediaPublicationCard p={p} lead={i === 0 && page === 1 && cat === 'all'} />
                </Reveal>
              ))}
            </div>
          )}
        </div>

        {(page > 1 || q.data?.hasMore) && (
          <nav className="mt-12 flex items-center justify-between border-t border-sand-200 pt-6" aria-label="Media center pages">
            <button type="button" disabled={page <= 1 || q.isFetching} onClick={() => go(page - 1)} className="inline-flex min-h-10 items-center gap-1.5 text-xs font-semibold tracking-[0.15em] text-lagoon-700 disabled:opacity-40" data-testid="button-media-prev"><ChevronLeft className="h-4 w-4" />NEWER</button>
            <span className="text-xs text-ink-500">Page {page}</span>
            <button type="button" disabled={!q.data?.hasMore || q.isFetching} onClick={() => go(page + 1)} className="inline-flex min-h-10 items-center gap-1.5 text-xs font-semibold tracking-[0.15em] text-lagoon-700 disabled:opacity-40" data-testid="button-media-next">OLDER<ChevronRight className="h-4 w-4" /></button>
          </nav>
        )}
      </div>
    </section>
  );
}
