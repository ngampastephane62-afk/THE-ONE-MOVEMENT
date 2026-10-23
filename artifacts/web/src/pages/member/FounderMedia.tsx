import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@clerk/react';
import { useQueryClient } from '@tanstack/react-query';
import { Link, Redirect } from 'wouter';
import { ChevronLeft, ChevronRight, ExternalLink, Plus, RotateCw } from 'lucide-react';
import { useGetAdminMediaPublications, getGetAdminMediaPublicationsQueryKey, type MediaPublication } from '@workspace/api-client-react';
import { Empty, ErrorBox, Skeleton, btn, btnGhost, card } from '@/components/network/kit';
import { CATEGORY_LABEL, formatPubDate } from '@/lib/media-center';
import MediaEditor from '@/components/media-center/admin/MediaEditor';
import { useMe } from './ctx';

type Sel = { mode: 'none' } | { mode: 'new'; k: number } | { mode: 'edit'; entry: MediaPublication; k: number };
const BADGE = { draft: 'bg-ivory-200 text-ink-800', published: 'bg-lagoon-900 text-gold-400', archived: 'border border-sand-300 text-ink-700' } as const;
const LEAVE = 'You have unsaved changes. Leave without saving?';
const WAIT = 'Please wait until the current save or upload finishes.';

export default function FounderMedia() {
  const { me } = useMe();
  const { userId } = useAuth();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [sel, setSel] = useState<Sel>({ mode: 'none' });
  const [notice, setNotice] = useState('');
  const dirtyRef = useRef(false);
  const busyRef = useRef(false);
  const q = useGetAdminMediaPublications({ page }, { query: { queryKey: getGetAdminMediaPublicationsQueryKey({ page }), enabled: !!me?.founder, placeholderData: (p) => p } });
  const lastUser = useRef(userId);
  useEffect(() => {
    if (lastUser.current === userId) return;
    lastUser.current = userId;
    qc.removeQueries({ queryKey: getGetAdminMediaPublicationsQueryKey() });
    setSel({ mode: 'none' }); setPage(1); setNotice('');
    dirtyRef.current = false; busyRef.current = false;
  }, [userId, qc]);

  useEffect(() => {
    const stay = window.location.href;
    const before = (e: BeforeUnloadEvent) => { if (dirtyRef.current || busyRef.current) { e.preventDefault(); e.returnValue = ''; } };
    const back = (e: PopStateEvent) => {
      const block = busyRef.current || (dirtyRef.current && !window.confirm(LEAVE));
      if (!block) return;
      e.stopImmediatePropagation();
      window.history.pushState(null, '', stay);
      if (busyRef.current) window.alert(WAIT);
    };
    const click = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest('a[href]');
      if (!a || a.getAttribute('target') === '_blank') return;
      if (busyRef.current) { e.preventDefault(); e.stopPropagation(); window.alert(WAIT); return; }
      if (dirtyRef.current && !window.confirm(LEAVE)) { e.preventDefault(); e.stopPropagation(); }
      else dirtyRef.current = false;
    };
    window.addEventListener('beforeunload', before);
    window.addEventListener('popstate', back, true);
    document.addEventListener('click', click, true);
    return () => { window.removeEventListener('beforeunload', before); window.removeEventListener('popstate', back, true); document.removeEventListener('click', click, true); };
  }, []);

  if (!me?.founder) return <Redirect to="/member" replace />;

  const choose = (next: Sel) => {
    if (busyRef.current) { window.alert(WAIT); return; }
    if (dirtyRef.current && !window.confirm(LEAVE)) return;
    dirtyRef.current = false; setNotice(''); setSel(next);
  };
  const turn = (n: number) => { if (!busyRef.current) setPage(n); };
  const items = q.data?.items ?? [];

  return (
    <div className="flex min-w-0 flex-col gap-5 px-3 pt-4 [overflow-wrap:anywhere] md:px-0 md:pt-0" data-testid="page-founder-media">
      <Helmet><title>Media Management — TOMI</title><meta name="robots" content="noindex, nofollow" /></Helmet>
      <header className="rounded-3xl bg-lagoon-900 p-5 text-ivory-100 sm:p-7">
        <Link href="/member/founder" className="inline-flex min-h-11 items-center text-xs font-semibold text-gold-400 underline underline-offset-4" data-testid="link-media-back-founder">Back to Founder Workspace</Link>
        <p className="mt-2 text-eyebrow text-gold-400">FOUNDER · MEDIA CENTER</p>
        <h1 className="mt-2 font-display text-2xl tracking-[0.03em] text-ivory-50 sm:text-3xl">Media Management</h1>
        <div className="mt-3 h-px w-16 bg-gold-400" aria-hidden="true" />
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ivory-200">Add press coverage, television appearances, interviews and announcements. Only published entries appear on the public Media page; drafts and archived entries stay private.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => choose({ mode: 'new', k: Date.now() })} className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-gold-500 px-4 py-2 text-xs font-semibold text-ink-900 hover:bg-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400" data-testid="button-media-new"><Plus className="h-4 w-4" />New publication</button>
          <Link href="~/media#media-center" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-ivory-100/30 px-4 py-2 text-xs font-semibold text-ivory-100 hover:border-gold-400 hover:text-gold-400" data-testid="link-media-public"><ExternalLink className="h-3.5 w-3.5" />View public Media page</Link>
        </div>
      </header>

      {notice && <p className="rounded-2xl border border-lagoon-600/40 bg-lagoon-600/10 px-4 py-3 text-sm text-lagoon-700" role="status" data-testid="text-media-notice">{notice}</p>}

      {sel.mode !== 'none' && (
        <MediaEditor key={sel.k} entry={sel.mode === 'edit' ? sel.entry : null}
          onDirty={(d) => { dirtyRef.current = d; }} onBusy={(b) => { busyRef.current = b; }}
          onDone={(saved) => {
            dirtyRef.current = false;
            if (saved && sel.mode === 'new') { setNotice(`Saved "${saved.title}" as ${saved.status}.`); setSel({ mode: 'edit', entry: saved, k: Date.now() }); return; }
            if (saved && sel.mode === 'edit' && saved.updatedAt !== sel.entry.updatedAt) { setNotice(`Saved "${saved.title}" as ${saved.status}.`); setSel({ mode: 'edit', entry: saved, k: Date.now() }); return; }
            if (!saved && sel.mode === 'edit') setNotice('Publication deleted.');
            setSel({ mode: 'none' });
          }} />
      )}

      <section className="flex flex-col gap-3" aria-labelledby="media-list-heading">
        <div className="flex items-center justify-between gap-2">
          <h2 id="media-list-heading" className="font-display text-lg text-ink-900">All publications</h2>
          <button type="button" className={btnGhost} onClick={() => q.refetch()} disabled={q.isFetching} data-testid="button-media-reload"><RotateCw className={`h-3.5 w-3.5 ${q.isFetching ? 'animate-spin motion-reduce:animate-none' : ''}`} />Reload</button>
        </div>
        <p className="text-xs text-ink-700">Order shown matches the public page: lower order number first, then newest date.</p>
        {q.isLoading ? <Skeleton rows={3} />
          : q.isError && !q.data ? <ErrorBox onRetry={() => q.refetch()} msg="The media list could not be loaded." />
          : items.length === 0 ? <Empty title="No publications yet" body="Create the first entry. It stays a private draft until you publish it."><button type="button" className={btn} onClick={() => choose({ mode: 'new', k: Date.now() })}>New publication</button></Empty>
          : (
            <ul className="flex flex-col gap-2">
              {items.map((p) => {
                const active = sel.mode === 'edit' && sel.entry.id === p.id;
                return (
                  <li key={p.id}>
                    <button type="button" onClick={() => choose({ mode: 'edit', entry: p, k: Date.now() })} aria-current={active ? 'true' : undefined}
                      className={`${card} flex w-full items-center gap-3 p-3 text-left transition-colors hover:border-gold-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 ${active ? 'border-gold-500' : ''}`} data-testid={`row-media-${p.id}`}>
                      <span className="grid h-14 w-20 shrink-0 place-items-center overflow-hidden rounded-lg bg-lagoon-900">
                        {p.coverUrl ? <img src={p.coverUrl} alt="" className="h-full w-full object-cover" loading="lazy" /> : <span className="text-[10px] text-gold-400">#{p.priority}</span>}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-ink-900">{p.title}</span>
                        <span className="block truncate text-xs text-ink-700">{[CATEGORY_LABEL[p.category], p.publisher, formatPubDate(p.publicationDate) || 'No date'].filter(Boolean).join(' · ')}</span>
                      </span>
                      <span className="hidden text-[11px] text-ink-700 sm:inline">Order {p.priority}</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${BADGE[p.status]}`}>{p.status}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        {(page > 1 || q.data?.hasMore) && (
          <nav className="flex items-center justify-between pt-2" aria-label="Media list pages">
            <button type="button" className={btnGhost} disabled={page <= 1 || q.isFetching} onClick={() => turn(page - 1)}><ChevronLeft className="h-3.5 w-3.5" />Previous</button>
            <span className="text-xs text-ink-700">Page {page}</span>
            <button type="button" className={btnGhost} disabled={!q.data?.hasMore || q.isFetching} onClick={() => turn(page + 1)}>Next<ChevronRight className="h-3.5 w-3.5" /></button>
          </nav>
        )}
      </section>
    </div>
  );
}
