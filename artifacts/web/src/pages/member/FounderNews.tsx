import { useCallback, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, Redirect } from 'wouter';
import { useAuth } from '@clerk/react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ChevronLeft, ChevronRight, ExternalLink, Plus, RotateCw } from 'lucide-react';
import {
  useGetFounderNews, getGetFounderNewsQueryKey, useGetFounderNewsOptions, getGetFounderNewsOptionsQueryKey,
  useGetFounderNewsArticle, getGetFounderNewsArticleQueryKey, type NewsFounderArticle,
} from '@workspace/api-client-react';
import { useMe } from './ctx';
import { TROPIK_CATEGORY, articleTitle, categoryLabel, errMsg, formatDate, hasUnpublishedDraft } from '@/lib/news-cms';
import ArticleEditor from '@/components/news-cms/ArticleEditor';

type Sel = { kind: 'none' } | { kind: 'new'; n: number } | { kind: 'id'; id: number };

function StatusPill({ a }: { a: NewsFounderArticle }) {
  if (a.status === 'archived') return <span className="rounded-full bg-ivory-200 px-2 py-0.5 text-[10px] font-semibold text-ink-700">Archived</span>;
  if (a.status === 'published') return <span className="rounded-full bg-lagoon-900 px-2 py-0.5 text-[10px] font-semibold text-gold-400">Live{hasUnpublishedDraft(a) ? ' + draft' : ''}</span>;
  return <span className="rounded-full border border-gold-500/40 bg-gold-500/15 px-2 py-0.5 text-[10px] font-semibold text-gold-700">Draft</span>;
}

function Detail({ id, options, onCommitted, onDirty, onBusy }: { id: number; options: Parameters<typeof ArticleEditor>[0]['options']; onCommitted: (a: NewsFounderArticle) => void; onDirty: (d: boolean) => void; onBusy: (b: boolean) => void }) {
  const [historyPage, setHistoryPage] = useState(1);
  const params = { historyPage };
  const q = useGetFounderNewsArticle(id, params, { query: { queryKey: getGetFounderNewsArticleQueryKey(id, params), refetchOnWindowFocus: false, placeholderData: (prev) => prev } });
  if (q.isLoading && !q.data) return <div className="space-y-3" aria-busy="true"><div className="h-14 animate-pulse rounded-2xl bg-ivory-200" /><div className="h-64 animate-pulse rounded-2xl bg-ivory-200" /></div>;
  if (!q.data) return (
    <div role="alert" className="rounded-2xl border border-crimson-700/30 bg-ivory-50 p-5 text-sm text-ink-800">
      {errMsg(q.error, 'This article could not be loaded.')}
      <button type="button" onClick={() => q.refetch()} className="ml-3 inline-flex items-center gap-1 font-semibold text-gold-700" data-testid="button-retry-article"><RotateCw className="h-3.5 w-3.5" />Retry</button>
    </div>
  );
  return <>
    {q.isError && <p role="alert" className="mb-3 text-sm text-crimson-700">The saved state could not be refreshed. Your local text is kept.</p>}
    <ArticleEditor key={id} article={q.data} options={options} onCommitted={onCommitted} onDirtyChange={onDirty} history={{ page: historyPage, setPage: setHistoryPage, loading: q.isFetching }} onBusyChange={onBusy} onReload={async () => { const r = await q.refetch(); return r.isError ? undefined : r.data; }} />
  </>;
}

/** Shared News publishing. collection='tropik' scopes the list to Tropik articles and prefills the category. */
export default function FounderNews({ collection }: { collection?: 'tropik' } = {}) {
  const tropik = collection === 'tropik';
  const { me } = useMe();
  const { userId } = useAuth();
  const [page, setPage] = useState(1);
  const [sel, setSel] = useState<Sel>({ kind: 'none' });
  const dirtyRef = useRef(false);
  const [dirty, setDirty] = useState(false);
  const onDirty = useCallback((d: boolean) => { dirtyRef.current = d; setDirty(d); }, []);
  const busyRef = useRef(false);
  const [busy, setBusy] = useState(false);
  const onBusy = useCallback((b: boolean) => { busyRef.current = b; setBusy(b); }, []);
  const qc = useQueryClient();
  const enabled = !!me?.founder;
  const listParams = tropik ? { page, category: TROPIK_CATEGORY } : { page };
  const list = useGetFounderNews(listParams, { query: { enabled, queryKey: getGetFounderNewsQueryKey(listParams) } });
  const opts = useGetFounderNewsOptions({ query: { enabled, queryKey: getGetFounderNewsOptionsQueryKey(), staleTime: 300000 } });

  // Clear private editor state when the signed-in account changes.
  const lastUser = useRef(userId);
  useEffect(() => {
    if (lastUser.current === userId) return;
    lastUser.current = userId;
    qc.removeQueries({ predicate: (q) => typeof q.queryKey[0] === 'string' && (q.queryKey[0] as string).startsWith('/api/founder/news') });
    setSel({ kind: 'none' }); setPage(1); onDirty(false); onBusy(false);
  }, [userId, onDirty, onBusy, qc]);

  // Protect unsaved work: reload/close and in-app link navigation.
  useEffect(() => {
    if (!dirty && !busy) return;
    const before = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    const stay = window.location.pathname + window.location.search + window.location.hash;
    const back = (e: PopStateEvent) => {
      const block = busyRef.current || (dirtyRef.current && !window.confirm('You have unsaved changes. Leave without saving?'));
      if (!block) return;
      e.stopImmediatePropagation();
      window.history.pushState(null, '', stay);
      if (busyRef.current) window.alert('Please wait until the current save, action or upload finishes.');
    };
    const click = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest('a[href]');
      if (!a) return;
      if (busyRef.current) { e.preventDefault(); e.stopPropagation(); window.alert('Please wait until the current save, action or upload finishes.'); return; }
      if (dirtyRef.current && !window.confirm('You have unsaved changes. Leave without saving?')) { e.preventDefault(); e.stopPropagation(); }
    };
    window.addEventListener('beforeunload', before);
    window.addEventListener('popstate', back, true);
    document.addEventListener('click', click, true);
    return () => { window.removeEventListener('beforeunload', before); window.removeEventListener('popstate', back, true); document.removeEventListener('click', click, true); };
  }, [dirty, busy]);

  const choose = (next: Sel) => {
    if (busyRef.current) return;
    if (dirtyRef.current && !window.confirm('You have unsaved changes. Discard them?')) return;
    onDirty(false);
    setSel(next);
  };

  if (!me?.founder) return <Redirect to="/member" replace />;
  const items = list.data?.items ?? [];

  return (
    <div className="flex min-w-0 flex-col gap-4 px-3 pt-4 [overflow-wrap:anywhere] md:px-0 md:pt-0" data-testid="page-founder-news">
      <Helmet><title>{tropik ? 'Tropik articles' : 'News editor'} — Founder Workspace</title><meta name="robots" content="noindex, nofollow" /></Helmet>
      <style>{`.founder-fade{animation:founderIn .24s ease-out}@keyframes founderIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}@media (prefers-reduced-motion:reduce){.founder-fade{animation:none}}`}</style>
      <header className="flex flex-wrap items-end justify-between gap-3 rounded-3xl bg-lagoon-900 p-5 text-ivory-100 sm:p-6">
        <div>
          <Link href="/member/founder" className="inline-flex items-center gap-1 text-xs text-ivory-300 hover:text-gold-400" data-testid="link-back-workspace"><ArrowLeft className="h-3.5 w-3.5" />Founder Workspace</Link>
          <h1 className="mt-2 font-display text-2xl tracking-[0.03em] text-ivory-50">{tropik ? 'Tropik articles' : 'News editor'}</h1>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-ivory-200">{tropik ? 'Same News publishing, preview and history. Articles in the Tropik category appear on the Tropik Magazine page and open at their News address once published.' : 'Drafts stay private. Only an explicit publish puts a saved draft on the public News page.'}</p>
          {tropik && <Link href="~/tropik-magazine#tropik-articles" target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-xs font-semibold text-gold-400 underline underline-offset-4" data-testid="link-tropik-public"><ExternalLink className="h-3.5 w-3.5" />View Tropik Magazine</Link>}
        </div>
        <button type="button" onClick={() => choose({ kind: 'new', n: Date.now() })} disabled={busy} className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-gold-500 px-4 text-xs font-semibold text-ink-900 hover:bg-gold-400 disabled:opacity-50" data-testid="button-new-article"><Plus className="h-4 w-4" />{tropik ? 'Add Tropik article' : 'New article'}</button>
      </header>

      <div className="flex flex-col gap-4 lg:flex-row">
        <nav aria-label="Articles" className={`lg:w-72 lg:shrink-0 ${sel.kind !== 'none' ? 'hidden lg:block' : ''}`}>
          <div className="rounded-2xl border border-sand-200 bg-ivory-50 p-2">
            {list.isLoading ? <ul aria-busy="true" className="space-y-2 p-1">{[0, 1, 2, 3].map((i) => <li key={i} className="h-14 animate-pulse rounded-xl bg-ivory-200" />)}</ul>
              : list.isError ? (
                <div role="alert" className="p-3 text-sm text-ink-800">{errMsg(list.error, 'Articles could not be loaded.')}<button type="button" onClick={() => list.refetch()} className="mt-2 flex items-center gap-1 text-xs font-semibold text-gold-700" data-testid="button-retry-list"><RotateCw className="h-3.5 w-3.5" />Retry</button></div>
              ) : items.length === 0 ? (
                <div className="p-5 text-center" data-testid="text-list-empty"><p className="font-display text-base text-ink-900">{page > 1 ? 'No more articles' : tropik ? 'No Tropik articles yet' : 'No articles yet'}</p><p className="mt-1 text-xs text-ink-700">{tropik ? 'Add the first Tropik article for the magazine page.' : 'Write the first announcement for the Movement.'}</p></div>
              ) : (
                <ul className="flex flex-col gap-1">
                  {items.map((a) => {
                    const active = sel.kind === 'id' && sel.id === a.id;
                    const s = a.draft ?? a.published;
                    return (
                      <li key={a.id}>
                        <button type="button" disabled={busy && !active} onClick={() => !active && choose({ kind: 'id', id: a.id })} aria-current={active ? 'true' : undefined} className={`flex w-full flex-col gap-1 rounded-xl px-3 py-2.5 text-left transition-colors ${active ? 'bg-lagoon-900 text-ivory-50' : 'hover:bg-ivory-200'}`} data-testid={`row-article-${a.id}`}>
                          <span className="flex items-start justify-between gap-2"><span className={`line-clamp-2 text-sm font-semibold ${active ? 'text-ivory-50' : 'text-ink-900'}`}>{articleTitle(a)}</span><StatusPill a={a} /></span>
                          <span className={`text-[11px] ${active ? 'text-ivory-300' : 'text-ink-700'}`}>{s ? categoryLabel(s.category) : ''} · {formatDate(a.updatedAt)}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            <div className="mt-2 flex items-center justify-between border-t border-sand-100 px-1 pt-2">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} aria-label="Previous page" className="rounded-full p-2 text-ink-800 hover:bg-ivory-200 disabled:opacity-30" data-testid="button-page-prev"><ChevronLeft className="h-4 w-4" /></button>
              <span className="text-[11px] text-ink-700" data-testid="text-page">Page {page}</span>
              <button type="button" disabled={!list.data?.hasMore} onClick={() => setPage((p) => p + 1)} aria-label="Next page" className="rounded-full p-2 text-ink-800 hover:bg-ivory-200 disabled:opacity-30" data-testid="button-page-next"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        </nav>

        <div className="min-w-0 flex-1">
          {sel.kind !== 'none' && <button type="button" disabled={busy} onClick={() => choose({ kind: 'none' })} className="mb-3 inline-flex min-h-10 items-center gap-1 text-xs font-semibold text-lagoon-900 lg:hidden" data-testid="button-back-list"><ArrowLeft className="h-4 w-4" />All articles</button>}
          {sel.kind === 'none' && (
            <div className="hidden min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-sand-200 bg-ivory-50 p-8 text-center lg:flex" data-testid="text-editor-empty">
              <p className="font-display text-lg text-ink-900">Choose an article</p>
              <p className="mt-1 max-w-sm text-sm text-ink-700">Select one from the list to edit, preview or inspect its history, or start a new article.</p>
            </div>
          )}
          {sel.kind === 'new' && <ArticleEditor key={`new-${sel.n}`} article={null} defaultCategory={tropik ? TROPIK_CATEGORY : undefined} options={opts.data} onDirtyChange={onDirty} onBusyChange={onBusy} onCommitted={(a) => { onDirty(false); setSel({ kind: 'id', id: a.id }); }} />}
          {sel.kind === 'id' && <Detail id={sel.id} options={opts.data} onDirty={onDirty} onBusy={onBusy} onCommitted={() => undefined} />}
          {opts.isError && <p role="alert" className="mt-3 text-xs text-crimson-700">Partner and programme lists could not be loaded. <button type="button" className="font-semibold underline" onClick={() => opts.refetch()}>Retry</button></p>}
        </div>
      </div>
    </div>
  );
}
