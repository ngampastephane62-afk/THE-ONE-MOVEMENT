import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, Redirect } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { ExternalLink, RefreshCw, Search, Undo2 } from 'lucide-react';
import { SITE_EDITABLE_PAGES, sitePageForPath } from '@workspace/shared';
import {
  useGetFounderSitePage, getGetFounderSitePageQueryKey, useSaveSitePage, getGetSitePageQueryKey,
  type SitePageDocument, type SiteLanguageCopyLanguage,
} from '@workspace/api-client-react';
import { ErrorBox, Skeleton, btn, btnGhost, card, errStatus, field } from '@/components/network/kit';
import { useLeaveGuard } from '@/components/founder/pages/useLeaveGuard';
import { basePath } from '@/lib/clerk';
import { useMe } from './ctx';

type Lang = SiteLanguageCopyLanguage;
const LANGS: { code: Lang; label: string }[] = [
  { code: 'en', label: 'English' }, { code: 'fr', label: 'Francais' }, { code: 'ar', label: 'Arabic' },
  { code: 'es', label: 'Espanol' }, { code: 'pt', label: 'Portugues' }, { code: 'sw', label: 'Kiswahili' }, { code: 'zh', label: 'Chinese' },
];
type Draft = Record<Lang, Record<string, string>>;
const LEAVE = 'You have unsaved text changes. Leave without saving?';
const MAX_VALUE = 5000;

function toDraft(doc: SitePageDocument): Draft {
  const d = Object.fromEntries(LANGS.map((l) => [l.code, {}])) as Draft;
  for (const c of doc.copies ?? []) {
    if (!d[c.language]) continue;
    for (const e of c.entries) d[c.language][e.source] = e.value;
  }
  return d;
}
const clean = (d: Draft) => JSON.stringify(LANGS.map((l) => Object.entries(d[l.code]).filter(([, v]) => v.trim() !== '').sort(([a], [b]) => a.localeCompare(b))));

/** Same-origin public page; LocaleProvider answers tomi:capture-copy with the page's original source strings. */
function CaptureFrame({ pageKey, path, onSources, reloadKey, copies, language }: { pageKey: string; path: string; onSources: (s: string[]) => void; reloadKey: number; copies: SitePageDocument['copies']; language: Lang }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const cb = useRef(onSources); cb.current = onSources;
  const [state, setState] = useState<'loading' | 'waiting' | 'ok' | 'outside' | 'silent'>('loading');
  const [where, setWhere] = useState(path);

  const inPage = useRef(false);
  const previewRef = useRef({ copies, language }); previewRef.current = { copies, language };
  /** Draft preview inside the page: LocaleProvider applies these copies locally, nothing is saved. */
  const sendPreview = useCallback(() => {
    const w = ref.current?.contentWindow;
    if (!w || !inPage.current) return;
    w.postMessage({ type: 'tomi:preview-copy', pageKey, copies: previewRef.current.copies, language: previewRef.current.language }, window.location.origin);
  }, [pageKey]);
  const copiesKey = JSON.stringify(copies);
  useEffect(() => { sendPreview(); }, [copiesKey, language, sendPreview]);

  const ask = useCallback(() => {
    const w = ref.current?.contentWindow;
    if (!w) return;
    let p = path;
    try { p = w.location.pathname.slice(basePath.length) || '/'; } catch { /* same origin expected */ }
    setWhere(p);
    if (sitePageForPath(p)?.key !== pageKey) { inPage.current = false; setState('outside'); return; }
    inPage.current = true;
    setState('waiting');
    sendPreview();
    w.postMessage({ type: 'tomi:capture-copy', pageKey }, window.location.origin);
  }, [pageKey, path, sendPreview]);

  useEffect(() => {
    const on = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || !ref.current || e.source !== ref.current.contentWindow) return;
      const d = e.data as { type?: string; pageKey?: string; sources?: unknown; path?: unknown };
      if (d?.type !== 'tomi:page-copy' || d.pageKey !== pageKey || !Array.isArray(d.sources)) return;
      if (typeof d.path === 'string') { setWhere(d.path); if (sitePageForPath(d.path)?.key !== pageKey) { inPage.current = false; setState('outside'); return; } }
      cb.current(d.sources.filter((x): x is string => typeof x === 'string' && x.trim() !== ''));
      setState('ok');
      sendPreview();
    };
    window.addEventListener('message', on);
    return () => window.removeEventListener('message', on);
  }, [pageKey, sendPreview]);

  useEffect(() => {
    if (state !== 'waiting') return;
    const t = window.setTimeout(() => setState('silent'), 6000);
    return () => window.clearTimeout(t);
  }, [state]);

  const src = `${basePath}${path}${path.includes('?') ? '&' : '?'}copy-preview=1`;
  const note = { loading: 'Loading the public page...', waiting: 'Collecting original text...', ok: 'Original text collected. The preview shows your unsaved draft in the selected language.', outside: 'This address belongs to another page. Go back to collect text for this page.', silent: 'The page did not answer. Scroll it or recollect.' }[state];

  return (
    <div className={`${card} flex min-w-0 flex-col overflow-hidden`}>
      <div className="flex flex-wrap items-center gap-2 border-b border-sand-200 p-3">
        <span className={`h-2 w-2 rounded-full ${state === 'ok' ? 'bg-lagoon-600' : state === 'outside' || state === 'silent' ? 'bg-coral-500' : 'animate-pulse bg-gold-500 motion-reduce:animate-none'}`} aria-hidden="true" />
        <p className="min-w-0 flex-1 text-xs text-ink-700" role="status" data-testid="status-capture">{note} <span className="font-mono text-[11px] text-lagoon-700">{where}</span></p>
        <button type="button" className={`${btnGhost} min-h-11`} onClick={ask} data-testid="button-recollect"><RefreshCw className="h-3.5 w-3.5" />Recollect</button>
      </div>
      <iframe key={`${path}-${reloadKey}`} ref={ref} src={src} title="Public page preview" className="h-[70vh] w-full bg-ivory-100" onLoad={() => { inPage.current = false; setState('loading'); window.setTimeout(ask, 400); }} data-testid="frame-site-preview" />
    </div>
  );
}

function Editor({ pageKey, path, doc, onReload, onDirty }: { pageKey: string; path: string; doc: SitePageDocument; onReload: () => Promise<unknown>; onDirty: (d: boolean) => void }) {
  const qc = useQueryClient();
  const save = useSaveSitePage();
  const [base, setBase] = useState(doc);
  const baseDraft = useMemo(() => toDraft(base), [base]);
  const [draft, setDraft] = useState<Draft>(() => toDraft(doc));
  const [lang, setLang] = useState<Lang>('en');
  const [q, setQ] = useState('');
  const [captured, setCaptured] = useState<string[]>([]);
  const [tab, setTab] = useState<'edit' | 'review'>('edit');
  const [confirm, setConfirm] = useState(false);
  const [msg, setMsg] = useState<{ tone: 'ok' | 'err' | 'conflict'; text: string } | null>(null);
  const [frameKey, setFrameKey] = useState(0);
  const dirty = clean(draft) !== clean(baseDraft);
  const dirtyRef = useRef(false); dirtyRef.current = dirty || save.isPending;
  useLeaveGuard(dirtyRef, LEAVE);
  const onDirtyRef = useRef(onDirty); onDirtyRef.current = onDirty;
  useEffect(() => { onDirtyRef.current(dirty || save.isPending); }, [dirty, save.isPending]);

  const addSources = useCallback((s: string[]) => setCaptured((prev) => { const set = new Set(prev); s.forEach((x) => set.add(x)); return set.size === prev.length ? prev : [...set]; }), []);
  // Union of captured text and every saved entry in any language: saved entries are never dropped.
  const savedSources = useMemo(() => new Set(LANGS.flatMap((l) => Object.keys(draft[l.code]))), [draft]);
  const capturedSet = useMemo(() => new Set(captured), [captured]);
  const sources = useMemo(() => [...new Set([...captured, ...savedSources])], [captured, savedSources]);
  const needle = q.trim().toLowerCase();
  const shown = needle ? sources.filter((s) => s.toLowerCase().includes(needle) || (draft[lang][s] ?? '').toLowerCase().includes(needle)) : sources;
  const changes = LANGS.map((l) => ({ ...l, n: Object.values(draft[l.code]).filter((v) => v.trim()).length }));
  const diff = LANGS.flatMap((l) => sources.filter((s) => (draft[l.code][s] ?? '') !== (baseDraft[l.code][s] ?? '')).map((s) => ({ lang: l, source: s, before: baseDraft[l.code][s] ?? '', after: draft[l.code][s] ?? '' })));

  const previewCopies = useMemo<SitePageDocument['copies']>(() => LANGS.map((l) => ({ language: l.code, entries: Object.entries(draft[l.code]).map(([source, value]) => ({ source, value })) })), [draft]);
  const set = (source: string, value: string) => setDraft((d) => ({ ...d, [lang]: { ...d[lang], [source]: value } }));
  const reset = (source: string) => setDraft((d) => { const x = { ...d[lang] }; delete x[source]; return { ...d, [lang]: x }; });

  const submit = (status: 'draft' | 'published') => {
    setMsg(null);
    const content: SitePageDocument = {
      pageKey, updatedAt: base.updatedAt, status,
      copies: LANGS.map((l) => ({ language: l.code, entries: Object.entries(draft[l.code]).map(([source, value]) => ({ source, value })) })),
    };
    save.mutate({ pageKey, data: { expectedUpdatedAt: base.updatedAt, content } }, {
      onSuccess: (res) => {
        setBase(res); setDraft(toDraft(res)); setConfirm(false);
        qc.setQueryData(getGetFounderSitePageQueryKey(pageKey), res);
        qc.invalidateQueries({ queryKey: getGetSitePageQueryKey(pageKey) });
        setMsg({ tone: 'ok', text: status === 'published' ? 'Published. Visitors now see this text.' : 'Draft saved. It stays private until you publish.' });
        if (status === 'published') setFrameKey((k) => k + 1);
      },
      onError: (e) => {
        setConfirm(false);
        const st = errStatus(e);
        if (st === 409) setMsg({ tone: 'conflict', text: 'Conflict: this page was changed elsewhere since you opened it. Your draft is kept here; nothing was overwritten.' });
        else setMsg({ tone: 'err', text: st === 400 || st === 422 ? 'The server refused this text. Plain text only; check very long values.' : 'Saving failed. Your draft is kept; try again.' });
      },
    });
  };
  const reloadServer = async () => { if (dirty && !window.confirm('Reload the server version? Your local changes will be lost.')) return; dirtyRef.current = false; await onReload(); };

  const state = dirty ? { label: 'Unsaved changes', cls: 'bg-coral-500/15 text-coral-500 border-coral-500/40' }
    : base.status === 'draft' && base.updatedAt ? { label: 'Draft saved, not published', cls: 'bg-gold-500/15 text-gold-700 border-gold-500/40' }
      : { label: base.updatedAt ? 'Published, up to date' : 'Original text', cls: 'bg-lagoon-600/10 text-lagoon-700 border-lagoon-600/40' };
  const rtl = lang === 'ar';

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className={`${card} sticky top-[6.9rem] z-30 flex flex-wrap items-center gap-2 p-3 md:top-20`}>
        <span className={`inline-flex min-h-9 items-center rounded-full border px-3 text-xs font-semibold ${state.cls}`} role="status" aria-live="polite" data-testid="status-site-page">{state.label}</span>
        {base.updatedAt && <span className="hidden text-[11px] text-ink-700 sm:inline">Revision {new Date(base.updatedAt).toLocaleString()}</span>}
        <div className="ml-auto flex flex-wrap gap-2">
          {dirty && <button type="button" className={`${btnGhost} min-h-11`} disabled={save.isPending} onClick={() => { if (window.confirm('Discard unsaved changes?')) setDraft(baseDraft); }} data-testid="button-discard-site">Discard</button>}
          <button type="button" className={`${btnGhost} min-h-11`} disabled={save.isPending || !dirty} onClick={() => submit('draft')} data-testid="button-save-site-draft">{save.isPending ? 'Saving...' : 'Save draft'}</button>
          <button type="button" className={`${btn} min-h-11`} disabled={save.isPending || (!dirty && base.status === 'published')} onClick={() => setConfirm(true)} data-testid="button-publish-site">Publish...</button>
        </div>
        {msg && (
          <div className={`basis-full rounded-xl p-3 text-xs ${msg.tone === 'ok' ? 'bg-lagoon-600/10 text-lagoon-700' : 'bg-coral-500/10 text-ink-900'}`} role={msg.tone === 'ok' ? 'status' : 'alert'}>
            {msg.text}{msg.tone === 'conflict' && <button type="button" onClick={reloadServer} className="ml-2 font-semibold underline">Reload server version</button>}
          </div>
        )}
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-3">
          <div role="tablist" aria-label="Language" className="flex gap-1.5 overflow-x-auto pb-1">
            {changes.map((l) => (
              <button key={l.code} role="tab" type="button" aria-selected={lang === l.code} onClick={() => setLang(l.code)}
                className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 text-xs font-semibold ${lang === l.code ? 'bg-lagoon-900 text-gold-400' : 'border border-sand-300 text-ink-800 hover:border-lagoon-600'}`} data-testid={`tab-lang-${l.code}`}>
                {l.label}{l.n > 0 && <span className={`rounded-full px-1.5 font-mono text-[10px] ${lang === l.code ? 'bg-gold-400/20' : 'bg-ivory-200'}`}>{l.n}</span>}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Search original text</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-700" />
              <input className={`${field} min-h-11 pl-9`} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search original or edited text" data-testid="input-search-copy" />
            </label>
            <div role="tablist" aria-label="Mode" className="flex gap-1.5">
              {(['edit', 'review'] as const).map((t) => (
                <button key={t} role="tab" type="button" aria-selected={tab === t} onClick={() => setTab(t)} className={`min-h-11 rounded-full px-4 text-xs font-semibold ${tab === t ? 'bg-lagoon-900 text-gold-400' : 'border border-sand-300 text-ink-800'}`} data-testid={`tab-site-${t}`}>
                  {t === 'edit' ? 'Edit' : `Review changes (${diff.length})`}
                </button>
              ))}
            </div>
          </div>

          {tab === 'edit' ? (
            <div className={`${card} max-h-[70vh] min-w-0 overflow-auto p-2`}>
              {sources.length === 0 ? (
                <div className="p-6 text-center" data-testid="text-copy-empty">
                  <p className="font-display text-lg text-ink-900">Waiting for the page text</p>
                  <p className="mt-1 text-sm text-ink-700">The preview collects every original text block. If nothing appears, press Recollect.</p>
                </div>
              ) : shown.length === 0 ? <p className="p-6 text-center text-sm text-ink-700">No text matches this search.</p> : (
                <ul className="flex flex-col divide-y divide-sand-200">
                  {shown.map((s, i) => {
                    const v = draft[lang][s];
                    const changed = (v ?? '') !== (baseDraft[lang][s] ?? '');
                    const id = `copy-${i}`;
                    return (
                      <li key={s} className="flex flex-col gap-1.5 p-3" data-testid={`row-copy-${i}`}>
                        <div className="flex flex-wrap items-start gap-2">
                          <label htmlFor={id} className="min-w-0 flex-1 text-xs leading-relaxed text-ink-700"><span className="font-mono text-[10px] text-gold-700">ORIGINAL </span>{s}</label>
                          {!capturedSet.has(s) && <span className="rounded-full bg-ivory-200 px-2 py-0.5 text-[10px] font-semibold text-ink-700" title="Saved earlier, not seen in the current capture. Kept.">saved, not on screen</span>}
                          {changed && <span className="rounded-full bg-gold-500/20 px-2 py-0.5 text-[10px] font-semibold text-gold-700">edited</span>}
                          {v !== undefined && <button type="button" onClick={() => reset(s)} className="inline-flex min-h-9 items-center gap-1 text-[11px] text-lagoon-700 underline underline-offset-2"><Undo2 className="h-3 w-3" />Use original</button>}
                        </div>
                        <textarea id={id} dir={rtl ? 'rtl' : 'ltr'} lang={lang} className={`${field} min-h-[2.75rem] text-sm`} rows={Math.min(6, Math.max(1, Math.ceil(s.length / 70)))} maxLength={MAX_VALUE} value={v ?? ''} placeholder={lang === 'en' ? s : 'Built-in translation (leave empty to keep it)'} onChange={(e) => set(s, e.target.value)} data-testid={`input-copy-${i}`} />
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ) : (
            <div className={`${card} max-h-[70vh] overflow-auto p-3`} data-testid="panel-site-review">
              {diff.length === 0 ? <p className="p-4 text-sm text-ink-700">No unsaved changes. Saved drafts are listed by language in the counters above.</p> : (
                <ul className="flex flex-col gap-3">
                  {diff.map((d, i) => (
                    <li key={i} className="rounded-xl border border-sand-200 p-3 text-sm">
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-lagoon-700">{d.lang.label}</p>
                      <p className="mt-1 text-xs text-ink-700">{d.source}</p>
                      <p className="mt-2 text-ink-700 line-through decoration-coral-500/60" dir={d.lang.code === 'ar' ? 'rtl' : 'ltr'}>{d.before || '(original)'}</p>
                      <p className="mt-1 font-semibold text-ink-900" dir={d.lang.code === 'ar' ? 'rtl' : 'ltr'}>{d.after || '(back to original)'}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <CaptureFrame pageKey={pageKey} path={path} onSources={addSources} reloadKey={frameKey} copies={previewCopies} language={lang} />
      </div>

      {confirm && (
        <div className="fixed inset-0 z-50 grid place-items-end bg-ink-900/50 sm:place-items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="pub-site-h">
          <div className="w-full max-w-lg rounded-t-3xl bg-ivory-50 p-6 shadow-2xl sm:rounded-3xl">
            <p className="text-eyebrow text-gold-700">CONFIRMATION</p>
            <h2 id="pub-site-h" className="mt-1 font-display text-xl text-ink-900">Publish this page text?</h2>
            <p className="mt-2 text-sm text-ink-800">Visitors will see your text in {changes.filter((l) => l.n > 0).map((l) => l.label).join(', ') || 'the original version'}. Untouched text keeps its original wording and built-in translations.</p>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button type="button" className={`${btnGhost} min-h-11`} onClick={() => setConfirm(false)} autoFocus>Cancel</button>
              <button type="button" className={`${btn} min-h-11`} disabled={save.isPending} onClick={() => submit('published')} data-testid="button-confirm-publish-site">{save.isPending ? 'Publishing...' : 'Publish now'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FounderSitePages() {
  const { me } = useMe();
  const [pageKey, setPageKey] = useState<string>(SITE_EDITABLE_PAGES[0].key);
  const [k, setK] = useState(0);
  const dirtyRef = useRef(false);
  const page = SITE_EDITABLE_PAGES.find((p) => p.key === pageKey) ?? SITE_EDITABLE_PAGES[0];
  const q = useGetFounderSitePage(pageKey, { query: { queryKey: getGetFounderSitePageQueryKey(pageKey), enabled: !!me?.founder, refetchOnWindowFocus: false, staleTime: Infinity } });
  if (!me?.founder) return <Redirect to="/member" replace />;
  const choose = (next: string) => {
    if (next === pageKey) return;
    if (dirtyRef.current && !window.confirm(LEAVE)) return;
    dirtyRef.current = false; setPageKey(next); setK((x) => x + 1);
  };
  const reload = async () => { await q.refetch(); setK((x) => x + 1); };

  return (
    <div className="flex min-w-0 flex-col gap-5 px-3 pt-4 [overflow-wrap:anywhere] md:px-0 md:pt-0" data-testid="page-founder-site-pages">
      <Helmet><title>Site text — TOMI</title><meta name="robots" content="noindex, nofollow" /></Helmet>
      <header className="rounded-3xl bg-lagoon-900 p-5 text-ivory-100 sm:p-7">
        <Link href="/member/founder" className="inline-flex min-h-11 items-center text-xs font-semibold text-gold-400 underline underline-offset-4" data-testid="link-site-back-founder">Back to Founder Workspace</Link>
        <p className="mt-2 text-eyebrow text-gold-400">FOUNDER · PAGES · SITE TEXT</p>
        <h1 className="mt-2 font-display text-2xl tracking-[0.03em] text-ivory-50 sm:text-3xl">Every public page, in seven languages</h1>
        <div className="mt-3 h-px w-16 bg-gold-400" aria-hidden="true" />
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ivory-200">Choose a page, find a sentence, rewrite it. Plain text only. Save draft keeps it private; Publish updates the public page after confirmation. Forms and member content are not editable here.</p>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="flex min-w-[15rem] flex-col gap-1 text-xs font-semibold text-gold-400">Page
            <select className={`${field} min-h-11 text-ink-900`} value={pageKey} onChange={(e) => choose(e.target.value)} data-testid="select-site-page">
              {SITE_EDITABLE_PAGES.map((p) => <option key={p.key} value={p.key}>{p.label} ({p.path})</option>)}
            </select>
          </label>
          <Link href={`~${page.path}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1.5 text-xs font-semibold text-gold-400 underline underline-offset-4" data-testid="link-site-public"><ExternalLink className="h-3.5 w-3.5" />Open public page</Link>
          <Link href="/member/founder/pages" className="inline-flex min-h-11 items-center text-xs font-semibold text-gold-400 underline underline-offset-4" data-testid="link-home-layout">Homepage layout and media</Link>
        </div>
      </header>
      {q.isLoading ? <Skeleton rows={6} />
        : q.isError || !q.data ? <ErrorBox onRetry={() => q.refetch()} msg="This page's text could not be loaded." />
          : <Editor key={`${pageKey}-${k}`} pageKey={pageKey} path={page.path} doc={q.data} onReload={reload} onDirty={(d) => { dirtyRef.current = d; }} />}
    </div>
  );
}
