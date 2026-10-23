import { useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@clerk/react';
import { useQueryClient } from '@tanstack/react-query';
import { Link, Redirect } from 'wouter';
import { ExternalLink, Plus, RotateCw, Search } from 'lucide-react';
import { useGetAdminPartnerDirectory, getGetAdminPartnerDirectoryQueryKey, type PartnerOrganization } from '@workspace/api-client-react';
import { Empty, ErrorBox, Skeleton, btn, btnGhost, card, field } from '@/components/network/kit';
import PartnerEditor from '@/components/partners/admin/PartnerEditor';
import PartnerContentEditor from '@/components/partners/admin/PartnerContentEditor';
import { CATEGORY_LABEL, RELATIONSHIP_LABEL } from '@/lib/partner-directory';
import { useMe } from './ctx';

type Sel = { mode: 'none' } | { mode: 'content'; k: number } | { mode: 'new'; k: number } | { mode: 'edit'; entry: PartnerOrganization; k: number };
type StatusF = 'all' | 'published' | 'draft' | 'archived' | 'review';
const BADGE = { draft: 'bg-ivory-200 text-ink-800', published: 'bg-lagoon-900 text-gold-400', archived: 'border border-sand-300 text-ink-700' } as const;
const LEAVE = 'You have unsaved changes. Leave without saving?';
const WAIT = 'Please wait until the current save or upload finishes.';
const needsReview = (p: PartnerOrganization) => p.status !== 'published' && (!p.relationshipVerified || !p.rightsConfirmed || !p.logoUrl);

export default function FounderPartners() {
  const { me } = useMe();
  const { userId } = useAuth();
  const qc = useQueryClient();
  const [sel, setSel] = useState<Sel>({ mode: 'none' });
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [statusF, setStatusF] = useState<StatusF>('all');
  const dirtyRef = useRef(false);
  const busyRef = useRef(false);
  const q = useGetAdminPartnerDirectory({ query: { queryKey: getGetAdminPartnerDirectoryQueryKey(), enabled: !!me?.founder } });
  const lastUser = useRef(userId);
  useEffect(() => {
    if (lastUser.current === userId) return;
    lastUser.current = userId;
    qc.removeQueries({ queryKey: getGetAdminPartnerDirectoryQueryKey() });
    setSel({ mode: 'none' }); setNotice(''); setQuery(''); setStatusF('all');
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

  const all = useMemo(() => q.data?.items ?? [], [q.data]);
  const counts = useMemo(() => ({
    published: all.filter((p) => p.status === 'published').length,
    draft: all.filter((p) => p.status === 'draft').length,
    archived: all.filter((p) => p.status === 'archived').length,
    review: all.filter(needsReview).length,
  }), [all]);

  if (!me?.founder) return <Redirect to="/member" replace />;

  const choose = (next: Sel) => {
    if (busyRef.current) { window.alert(WAIT); return; }
    if (dirtyRef.current && !window.confirm(LEAVE)) return;
    dirtyRef.current = false; setNotice(''); setSel(next);
  };
  const needle = query.trim().toLowerCase();
  const items = [...all]
    .filter((p) => statusF === 'all' || (statusF === 'review' ? needsReview(p) : p.status === statusF))
    .filter((p) => !needle || p.name.toLowerCase().includes(needle))
    .sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name));
  const onDone = (saved: PartnerOrganization | null) => {
    dirtyRef.current = false;
    if (saved) { setNotice(`Saved "${saved.name}" as ${saved.status}.`); setSel({ mode: 'edit', entry: saved, k: Date.now() }); return; }
    if (sel.mode === 'edit') setNotice('Organization removed from the public directory (archived).');
    setSel({ mode: 'none' });
  };

  return (
    <div className="flex min-w-0 flex-col gap-5 px-3 pt-4 [overflow-wrap:anywhere] md:px-0 md:pt-0" data-testid="page-founder-partners">
      <Helmet><title>Manage Partners — TOMI</title><meta name="robots" content="noindex, nofollow" /></Helmet>
      <header className="rounded-3xl bg-lagoon-900 p-5 text-ivory-100 sm:p-7">
        <Link href="/member/founder" className="inline-flex min-h-11 items-center text-xs font-semibold text-gold-400 underline underline-offset-4" data-testid="link-partners-back-founder">Back to Founder Workspace</Link>
        <p className="mt-2 text-eyebrow text-gold-400">FOUNDER · PARTNERS</p>
        <h1 className="mt-2 font-display text-2xl tracking-[0.03em] text-ivory-50 sm:text-3xl">Manage Partners</h1>
        <div className="mt-3 h-px w-16 bg-gold-400" aria-hidden="true" />
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ivory-200">Edit organization names, logos, categories and relationships, and the text of the public Partners page. Only published organizations with a logo, a verified relationship and confirmed rights appear publicly.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => choose({ mode: 'new', k: Date.now() })} className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-gold-500 px-4 py-2 text-xs font-semibold text-ink-900 hover:bg-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400" data-testid="button-partner-new"><Plus className="h-4 w-4" />New organization</button>
          <button type="button" onClick={() => choose({ mode: 'content', k: Date.now() })} disabled={!q.data} className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-ivory-100/30 px-4 py-2 text-xs font-semibold text-ivory-100 hover:border-gold-400 hover:text-gold-400 disabled:opacity-50" data-testid="button-partner-content">Edit page text</button>
          <Link href="~/partners" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-ivory-100/30 px-4 py-2 text-xs font-semibold text-ivory-100 hover:border-gold-400 hover:text-gold-400" data-testid="link-partners-public"><ExternalLink className="h-3.5 w-3.5" />View public page</Link>
        </div>
      </header>

      {notice && <p className="rounded-2xl border border-lagoon-600/40 bg-lagoon-600/10 px-4 py-3 text-sm text-lagoon-700" role="status" data-testid="text-partners-notice">{notice}</p>}

      {sel.mode === 'content' && q.data && (
        <PartnerContentEditor key={sel.k} content={q.data.content} onDirty={(d) => { dirtyRef.current = d; }} onBusy={(b) => { busyRef.current = b; }} onSaved={() => setNotice('Page text saved.')} />
      )}
      {(sel.mode === 'new' || sel.mode === 'edit') && (
        <PartnerEditor key={sel.k} entry={sel.mode === 'edit' ? sel.entry : null}
          onDirty={(d) => { dirtyRef.current = d; }} onBusy={(b) => { busyRef.current = b; }} onDone={onDone} />
      )}

      <section className="flex flex-col gap-3" aria-labelledby="partners-list-heading">
        <div className="flex items-center justify-between gap-2">
          <h2 id="partners-list-heading" className="font-display text-lg text-ink-900">All organizations</h2>
          <button type="button" className={btnGhost} onClick={() => q.refetch()} disabled={q.isFetching} data-testid="button-partners-reload"><RotateCw className={`h-3.5 w-3.5 ${q.isFetching ? 'animate-spin motion-reduce:animate-none' : ''}`} />Reload</button>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="relative flex-1"><span className="sr-only">Search organizations</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-700" />
            <input className={`${field} pl-9`} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name" data-testid="input-partners-search" />
          </label>
          <select className={`${field} sm:w-56`} value={statusF} onChange={(e) => setStatusF(e.target.value as StatusF)} aria-label="Filter by status" data-testid="select-partners-status">
            <option value="all">All ({all.length})</option>
            <option value="published">Published ({counts.published})</option>
            <option value="draft">Drafts ({counts.draft})</option>
            <option value="review">Review needed ({counts.review})</option>
            <option value="archived">Archived ({counts.archived})</option>
          </select>
        </div>
        {q.isLoading ? <Skeleton rows={4} />
          : q.isError && !q.data ? <ErrorBox onRetry={() => q.refetch()} msg="The partner directory could not be loaded." />
          : items.length === 0 ? <Empty title={all.length ? 'No matches' : 'No organizations yet'} body={all.length ? 'Try another search or status filter.' : 'Create the first entry. It stays a private draft until verified and published.'}>{!all.length && <button type="button" className={btn} onClick={() => choose({ mode: 'new', k: Date.now() })}>New organization</button>}</Empty>
          : (
            <ul className="flex flex-col gap-2">
              {items.map((p) => {
                const active = sel.mode === 'edit' && sel.entry.id === p.id;
                return (
                  <li key={p.id}>
                    <button type="button" onClick={() => choose({ mode: 'edit', entry: p, k: Date.now() })} aria-current={active ? 'true' : undefined}
                      className={`${card} flex w-full items-center gap-3 p-3 text-left transition-colors hover:border-gold-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 ${active ? 'border-gold-500' : ''}`} data-testid={`row-partner-${p.id}`}>
                      <span className="grid h-14 w-20 shrink-0 place-items-center overflow-hidden rounded-lg border border-sand-200 bg-ivory-100 p-1.5">
                        {p.logoUrl ? <img src={p.logoUrl} alt="" className="max-h-full max-w-full object-contain" loading="lazy" /> : <span className="text-[10px] text-ink-700">No logo</span>}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-ink-900">{p.name}</span>
                        <span className="block truncate text-xs text-ink-700">{CATEGORY_LABEL[p.category]} · {RELATIONSHIP_LABEL[p.relationship]}</span>
                      </span>
                      <span className="hidden text-[11px] text-ink-700 sm:inline">Order {p.priority}</span>
                      {needsReview(p) && <span className="rounded-full bg-gold-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-gold-700">Review needed</span>}
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${BADGE[p.status]}`}>{p.status}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
      </section>
    </div>
  );
}
