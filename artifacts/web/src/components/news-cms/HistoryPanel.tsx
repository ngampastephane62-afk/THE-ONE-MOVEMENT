import { useState } from 'react';
import type { NewsFounderArticle, NewsRevision } from '@workspace/api-client-react';
import { formatDate, founderMediaUrl } from '@/lib/news-cms';
import NewsRenderer from './NewsRenderer';

export interface HistoryPaging { page: number; setPage: (n: number) => void; loading: boolean }

export default function HistoryPanel({ article, onRestore, dirty, paging }: { article: NewsFounderArticle; onRestore: (r: NewsRevision) => void; dirty: boolean; paging?: HistoryPaging }) {
  const [inspect, setInspect] = useState<NewsRevision | null>(null);
  if (article.history.length === 0 && (paging?.page ?? 1) === 1) return <p className="rounded-xl border border-dashed border-sand-200 p-4 text-sm text-ink-700" data-testid="text-history-empty">No revisions recorded yet.</p>;
  return (
    <div className="flex flex-col gap-3">
      <ul className="divide-y divide-sand-100 rounded-xl border border-sand-200" data-testid="list-history">
        {article.history.map((r) => {
          const live = article.status === 'published' && r.id === article.publishedRevisionId;
          const draft = r.id === article.draftRevisionId;
          return (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5" data-testid={`row-revision-${r.id}`}>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink-900">Revision {r.revisionNo} · {r.snapshot.title || 'Untitled'}</p>
                <p className="text-[11px] text-ink-700">{formatDate(r.createdAt, true)}{live && <span className="ml-2 rounded-full bg-lagoon-900 px-2 py-0.5 text-gold-400">Live</span>}{draft && !live && <span className="ml-2 rounded-full bg-gold-500/20 px-2 py-0.5 text-gold-700">Current draft</span>}</p>
              </div>
              <div className="flex gap-1">
                <button type="button" onClick={() => setInspect(inspect?.id === r.id ? null : r)} aria-expanded={inspect?.id === r.id} className="min-h-9 rounded-full px-3 text-xs font-semibold text-lagoon-900 hover:bg-ivory-200" data-testid={`button-inspect-${r.id}`}>{inspect?.id === r.id ? 'Close' : 'Inspect'}</button>
                <button type="button" disabled={dirty || (draft && article.status !== 'archived')} title={dirty ? 'Save or discard your changes first' : undefined} onClick={() => onRestore(r)} className="min-h-9 rounded-full border border-gold-500/50 px-3 text-xs font-semibold text-gold-700 hover:border-gold-500 disabled:opacity-40" data-testid={`button-restore-${r.id}`}>Restore as draft</button>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="text-[11px] text-ink-700">Restoring creates a new private draft revision. Nothing goes live until you publish it.</p>
      {paging && (paging.page > 1 || article.historyHasMore) && (
        <div className="flex items-center gap-3 text-xs" aria-busy={paging.loading}>
          <button type="button" disabled={paging.page <= 1 || paging.loading} onClick={() => { setInspect(null); paging.setPage(paging.page - 1); }} className="min-h-9 rounded-full px-3 font-semibold text-lagoon-900 hover:bg-ivory-200 disabled:opacity-30" data-testid="button-history-newer">Newer</button>
          <span className="text-ink-700" data-testid="text-history-page">History page {paging.page}</span>
          <button type="button" disabled={!article.historyHasMore || paging.loading} onClick={() => { setInspect(null); paging.setPage(paging.page + 1); }} className="min-h-9 rounded-full px-3 font-semibold text-lagoon-900 hover:bg-ivory-200 disabled:opacity-30" data-testid="button-history-older">Older</button>
        </div>
      )}
      {inspect && (
        <div className="overflow-hidden rounded-2xl border border-gold-500/40" data-testid="panel-inspect-revision">
          <p className="bg-gold-500/15 px-3 py-2 text-xs font-semibold text-gold-700">Private view of revision {inspect.revisionNo}</p>
          <div className="max-h-[70vh] overflow-auto"><NewsRenderer snapshot={inspect.snapshot} mediaUrl={founderMediaUrl} preview /></div>
        </div>
      )}
    </div>
  );
}
