import { useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Archive, Eye, EyeOff, Globe, PenLine, Save, Undo2 } from 'lucide-react';
import {
  useRunFounderNewsAction, getGetFounderNewsArticleQueryKey, type GetFounderNewsOptions200, type NewsActionInput, type NewsFounderArticle, type NewsRevision, type NewsSnapshot,
} from '@workspace/api-client-react';
import {
  NEWS_CATEGORIES, SLUG_RE, emptySnapshot, errMsg, founderMediaUrl, formatDate, hasUnpublishedDraft, invalidateNews,
  isoToLocalInput, localInputToIso, nn, slugify, snapshotIssues, YT_RE, VIMEO_RE,
} from '@/lib/news-cms';
import { Confirm, Field, ImageMeta, Section, inputCls } from './fields';
import UploadButton, { UploadTracker } from './MediaUpload';
import BodyEditor from './BodyEditor';
import HistoryPanel, { type HistoryPaging } from './HistoryPanel';
import NewsRenderer from './NewsRenderer';

type Pending = { action: 'publish' | 'unpublish' | 'archive' | 'restore'; revision?: NewsRevision } | null;
const TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;

interface Props {
  article: NewsFounderArticle | null;
  options: GetFounderNewsOptions200 | undefined;
  onCommitted: (a: NewsFounderArticle) => void;
  onDirtyChange: (d: boolean) => void;
  history?: HistoryPaging;
  onBusyChange?: (b: boolean) => void;
  onReload?: () => Promise<NewsFounderArticle | undefined>;
  /** New articles only: prefilled category (e.g. Tropik collection). */
  defaultCategory?: NewsSnapshot['category'];
}

export default function ArticleEditor({ article, options, onCommitted, onDirtyChange, history, onBusyChange, onReload, defaultCategory }: Props) {
  const qc = useQueryClient();
  const run = useRunFounderNewsAction();
  const [snap, setSnap] = useState<NewsSnapshot>(() => article?.draft ?? article?.published ?? emptySnapshot(defaultCategory));
  const [slug, setSlug] = useState(article?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(!!article);
  const [base, setBase] = useState(() => JSON.stringify({ s: article?.draft ?? article?.published ?? emptySnapshot(defaultCategory), slug: article?.slug ?? '' }));
  const [tab, setTab] = useState<'edit' | 'preview' | 'history'>('edit');
  const [pending, setPending] = useState<Pending>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const versionRef = useRef(article?.version ?? 0);
  const dirty = JSON.stringify({ s: snap, slug }) !== base;
  const [uploads, setUploads] = useState(0);
  const [conflict, setConflict] = useState(false);
  const [reloading, setReloading] = useState(false);
  const track = useMemo(() => (d: 1 | -1) => setUploads((n) => Math.max(0, n + d)), []);

  const onDirtyRef = useRef(onDirtyChange);
  onDirtyRef.current = onDirtyChange;
  useEffect(() => { onDirtyRef.current(dirty); }, [dirty]);

  // Server refetch: adopt newer server state only when there is no unsaved work.
  useEffect(() => {
    if (!article || article.version <= versionRef.current) return;
    if (dirty) { setConflict(true); setNotice('A newer version exists on the server. Your unsaved text is kept; reload the saved version to continue (this discards your edits).'); return; }
    const s = article.draft ?? article.published ?? emptySnapshot();
    versionRef.current = article.version;
    setSnap(s); setSlug(article.slug); setBase(JSON.stringify({ s, slug: article.slug }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article?.version]);

  const adopt = (a: NewsFounderArticle) => {
    const s = a.draft ?? a.published ?? emptySnapshot();
    versionRef.current = a.version;
    setSnap(s); setSlug(a.slug); setBase(JSON.stringify({ s, slug: a.slug }));
    qc.setQueriesData<NewsFounderArticle>({ queryKey: getGetFounderNewsArticleQueryKey(a.id) }, old => old ? { ...a, history: old.history, historyHasMore: old.historyHasMore } : a);
    qc.setQueryData(getGetFounderNewsArticleQueryKey(a.id, { historyPage: 1 }), a);
    void invalidateNews(qc);
    onCommitted(a);
  };

  const exec = async (input: NewsActionInput, ok: string) => {
    setError(''); setNotice('');
    try { const a = await run.mutateAsync({ data: input }); setConflict(false); adopt(a); setNotice(ok); return a; }
    catch (e) { if ((e as { status?: number })?.status === 409) setConflict(true); setError(errMsg(e)); return null; }
  };

  const slugLocked = !!article?.publishedAt;
  const issues = useMemo(() => snapshotIssues(snap), [snap]);
  const slugOk = SLUG_RE.test(slug);
  const save = () => {
    if (!slugOk) { setError('The URL slug may use lowercase letters, numbers and single hyphens.'); return; }
    if (!article) void exec({ action: 'create', id: null, version: 0, slug, snapshot: snap, revisionId: null }, 'Draft created. It is private until you publish.');
    else void exec({ action: 'save', id: article.id, version: versionRef.current, slug: slugLocked ? article.slug : slug, snapshot: snap, revisionId: null }, 'Draft saved privately.');
  };
  const reload = async () => {
    if (!onReload) return;
    if (dirty && !window.confirm('Discard your unsaved changes and load the saved version from the server?')) return;
    setReloading(true); setError('');
    try {
      const a = await onReload();
      if (!a) { setError('The saved version could not be loaded. Your text is unchanged.'); return; }
      const s = a.draft ?? a.published ?? emptySnapshot();
      versionRef.current = a.version;
      setSnap(s); setSlug(a.slug); setBase(JSON.stringify({ s, slug: a.slug }));
      setConflict(false); setNotice('Saved version loaded.');
    } catch { setError('The saved version could not be loaded. Your text is unchanged.'); }
    finally { setReloading(false); }
  };
  const lifecycle = async () => {
    if (!article || !pending || dirty || uploads > 0 || run.isPending || reloading) return;
    const msg = { publish: 'Published. The saved draft is now live.', unpublish: 'Unpublished. The article is no longer public.', archive: 'Archived.', restore: 'Revision restored as a new private draft.' }[pending.action];
    await exec({ action: pending.action, id: article.id, version: versionRef.current, slug: null, snapshot: null, revisionId: pending.action === 'restore' ? pending.revision!.id : null }, msg);
    setPending(null);
  };

  const up = <K extends keyof NewsSnapshot>(k: K, v: NewsSnapshot[K]) => setSnap((s) => ({ ...s, [k]: v }));
  const partnerLabel = options?.partners.find((p) => p.key === snap.relatedPartnerKey)?.label ?? null;
  const programmeLabel = options?.programmes.find((p) => p.key === snap.relatedProgrammeSlug)?.label ?? null;
  const live = article?.status === 'published';
  const canPublish = !!article && !dirty && article.status !== 'archived' && article.draftRevisionId != null && (article.status !== 'published' || hasUnpublishedDraft(article));
  const busy = run.isPending || reloading;
  const locked = busy || uploads > 0;
  const onBusyRef = useRef(onBusyChange);
  onBusyRef.current = onBusyChange;
  useEffect(() => { onBusyRef.current?.(locked); }, [locked]);
  useEffect(() => () => onBusyRef.current?.(false), []);
  const lifecycleBlocked = busy || dirty || uploads > 0;

  return (
    <div className="flex min-w-0 flex-col gap-4" data-testid="panel-article-editor">
      <div className="sticky top-[6.75rem] z-20 flex flex-wrap items-center gap-2 rounded-2xl border border-sand-200 bg-ivory-50/95 p-2 shadow-sm backdrop-blur md:top-20">
        <div className="flex rounded-xl bg-ivory-200 p-0.5" role="tablist" aria-label="Editor view">
          {([['edit', PenLine, 'Edit'], ['preview', Eye, 'Preview'], ['history', Undo2, 'History']] as const).map(([v, I, l]) => (
            <button key={v} type="button" role="tab" aria-selected={tab === v} disabled={v === 'history' && !article} onClick={() => setTab(v)} className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors disabled:opacity-40 ${tab === v ? 'bg-lagoon-900 text-gold-400' : 'text-ink-800 hover:bg-ivory-50'}`} data-testid={`tab-editor-${v}`}><I className="h-3.5 w-3.5" />{l}</button>
          ))}
        </div>
        <span className={`text-[11px] font-semibold ${dirty ? 'text-coral-600' : 'text-ink-700'}`} data-testid="status-dirty">{dirty ? 'Unsaved changes' : article ? 'All changes saved' : 'New, not saved'}</span>
        <div className="ml-auto flex flex-wrap gap-2">
          <button type="button" onClick={save} disabled={locked || !dirty} title={uploads > 0 ? 'Wait for uploads to finish' : undefined} className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-gold-500 px-4 text-xs font-semibold text-ink-900 hover:bg-gold-400 disabled:opacity-50" data-testid="button-save-draft"><Save className="h-3.5 w-3.5" />{article ? 'Save draft' : 'Create draft'}</button>
          {article && <button type="button" onClick={() => setPending({ action: 'publish' })} disabled={lifecycleBlocked || !canPublish} title={dirty ? 'Save your changes before publishing' : !canPublish ? 'No saved draft awaiting publication' : undefined} className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-lagoon-900 px-4 text-xs font-semibold text-gold-400 hover:bg-lagoon-800 disabled:opacity-50" data-testid="button-publish"><Globe className="h-3.5 w-3.5" />Publish</button>}
          {live && <button type="button" onClick={() => setPending({ action: 'unpublish' })} disabled={lifecycleBlocked} title={dirty ? 'Save or discard your changes first' : undefined} className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-sand-200 px-3 text-xs font-semibold text-ink-800 hover:border-gold-500 disabled:opacity-50" data-testid="button-unpublish"><EyeOff className="h-3.5 w-3.5" />Unpublish</button>}
          {article && article.status !== 'archived' && <button type="button" onClick={() => setPending({ action: 'archive' })} disabled={lifecycleBlocked} title={dirty ? 'Save or discard your changes first' : undefined} className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-sand-200 px-3 text-xs font-semibold text-ink-800 hover:border-crimson-700 hover:text-crimson-700 disabled:opacity-50" data-testid="button-archive"><Archive className="h-3.5 w-3.5" />Archive</button>}
        </div>
      </div>

      {article && (
        <div className="flex flex-wrap gap-2 text-[11px]" data-testid="status-article">
          <span className={`rounded-full px-2.5 py-1 font-semibold ${live ? 'bg-lagoon-900 text-gold-400' : article.status === 'archived' ? 'bg-ivory-200 text-ink-700' : 'border border-gold-500/40 bg-gold-500/15 text-gold-700'}`}>{live ? 'Live' : article.status === 'archived' ? 'Archived' : 'Draft only'}</span>
          {live && hasUnpublishedDraft(article) && <span className="rounded-full border border-coral-500/50 px-2.5 py-1 text-coral-600">Saved draft differs from live version</span>}
          {article.publishedAt && <span className="rounded-full bg-ivory-200 px-2.5 py-1 text-ink-700">First published {formatDate(article.publishedAt, true)}</span>}
          <span className="rounded-full bg-ivory-200 px-2.5 py-1 text-ink-700">Version {article.version} · updated {formatDate(article.updatedAt, true)}</span>
        </div>
      )}
      {article && dirty && <p className="text-[11px] text-ink-700" data-testid="text-lifecycle-hint">Publish, unpublish, archive and restore are paused until you save or discard your changes.</p>}
      {uploads > 0 && <p role="status" className="text-[11px] text-ink-700" data-testid="text-uploading">Upload in progress. Saving and switching articles are paused.</p>}
      {(conflict || (error && article)) && onReload && (
        <div className="flex flex-wrap items-center gap-2"><button type="button" disabled={busy || uploads > 0} onClick={reload} className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-gold-500/50 px-4 text-xs font-semibold text-gold-700 hover:border-gold-500 disabled:opacity-50" data-testid="button-reload-saved"><Undo2 className="h-3.5 w-3.5" />Reload saved version</button>{dirty && <span className="text-[11px] text-ink-700">Discards your unsaved edits after confirmation.</span>}</div>
      )}
      {error && <p role="alert" className="flex items-start gap-2 rounded-xl border border-crimson-700/30 bg-crimson-700/5 p-3 text-sm text-crimson-700" data-testid="text-editor-error"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />{error}</p>}
      {notice && !error && <p role="status" className="rounded-xl border border-lagoon-600/30 bg-lagoon-600/5 p-3 text-sm text-lagoon-800" data-testid="text-editor-notice">{notice}</p>}

      {tab === 'preview' && (
        <div className="founder-fade overflow-hidden rounded-2xl border border-gold-500/40" data-testid="panel-preview">
          <p className="bg-gold-500/15 px-4 py-2 text-xs font-semibold text-gold-700">Private preview of {dirty ? 'your unsaved edits' : 'the saved draft'}. Not visible to the public.</p>
          <NewsRenderer snapshot={snap} mediaUrl={founderMediaUrl} preview partnerLabel={partnerLabel} programmeLabel={programmeLabel} />
        </div>
      )}
      {tab === 'history' && article && <div className="founder-fade"><HistoryPanel article={article} dirty={dirty || locked} paging={history} onRestore={(r) => setPending({ action: 'restore', revision: r })} /></div>}

      {tab === 'edit' && (
        <UploadTracker.Provider value={track}>
        <fieldset disabled={locked} aria-busy={locked} className="founder-fade m-0 grid min-w-0 gap-4 border-0 p-0 xl:grid-cols-[1fr_18rem]">
          <div className="flex min-w-0 flex-col gap-4">
            <Section title="Headline">
              <Field label="Title" count={snap.title.length} max={200} htmlFor="cms-title">
                <input id="cms-title" className={`${inputCls} font-display text-lg`} maxLength={200} value={snap.title} onChange={(e) => { up('title', e.target.value); if (!slugTouched && !slugLocked) setSlug(slugify(e.target.value)); }} data-testid="input-title" />
              </Field>
              <Field label="Subtitle" count={(snap.subtitle ?? '').length} max={300} htmlFor="cms-sub">
                <textarea id="cms-sub" className={`${inputCls} min-h-16`} maxLength={300} value={snap.subtitle ?? ''} onChange={(e) => up('subtitle', nn(e.target.value))} data-testid="input-subtitle" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Category" htmlFor="cms-cat">
                  <select id="cms-cat" className={inputCls} value={snap.category} onChange={(e) => up('category', e.target.value as NewsSnapshot['category'])} data-testid="select-category">
                    {NEWS_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </Field>
                <Field label="URL slug" htmlFor="cms-slug" hint={slugLocked ? 'Locked after first publication so links never break.' : `/news/${slug || '…'}`}>
                  <input id="cms-slug" className={`${inputCls} font-mono text-xs`} maxLength={160} disabled={slugLocked} value={slug} aria-invalid={!slugOk} onChange={(e) => { setSlugTouched(true); setSlug(e.target.value.toLowerCase()); }} data-testid="input-slug" />
                </Field>
              </div>
            </Section>

            <Section title="Cover & video">
              {snap.cover ? <ImageMeta img={snap.cover} testId="cover" onChange={(c) => up('cover', c)} onRemove={() => up('cover', null)} />
                : <UploadButton kind="image" label="Upload cover image" testId="cover" onUploaded={(id) => up('cover', { uploadId: id, alt: '', credit: null })} />}
              <div className="border-t border-sand-200 pt-4">
                <Field label="Video">
                  <select className={inputCls} value={snap.video ? snap.video.kind === 'upload' ? 'upload' : snap.video.provider : 'none'} onChange={(e) => {
                    const v = e.target.value;
                    if (v === 'none') up('video', null);
                    else if (v === 'youtube' || v === 'vimeo') up('video', { kind: 'embed', provider: v, videoId: snap.video?.kind === 'embed' ? snap.video.videoId : '' });
                  }} data-testid="select-video-kind">
                    <option value="none">No video</option>
                    {snap.video?.kind === 'upload' && <option value="upload">Uploaded video</option>}
                    <option value="youtube">YouTube video ID</option>
                    <option value="vimeo">Vimeo video ID</option>
                  </select>
                </Field>
                {snap.video?.kind === 'embed' && (
                  <div className="mt-3"><Field label={`${snap.video.provider === 'youtube' ? 'YouTube' : 'Vimeo'} ID`} hint={snap.video.provider === 'youtube' ? '11 characters, e.g. the part after watch?v=' : 'Digits only, e.g. 76979871'}>
                    <input className={`${inputCls} font-mono`} maxLength={30} value={snap.video.videoId} aria-invalid={!(snap.video.provider === 'youtube' ? YT_RE : VIMEO_RE).test(snap.video.videoId)} onChange={(e) => up('video', { kind: 'embed', provider: (snap.video as { provider: 'youtube' | 'vimeo' }).provider, videoId: e.target.value.trim() })} data-testid="input-video-id" />
                  </Field></div>
                )}
                {snap.video?.kind === 'upload' && (
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <video src={founderMediaUrl(snap.video.uploadId)} controls preload="metadata" className="h-28 rounded-md bg-lagoon-900"><track kind="captions" /></video>
                    <button type="button" onClick={() => up('video', null)} className="text-xs font-semibold text-crimson-700 hover:underline" data-testid="button-remove-video">Remove video</button>
                  </div>
                )}
                {snap.video?.kind !== 'upload' && <div className="mt-3"><UploadButton kind="video" label={snap.video ? 'Replace with uploaded video' : 'Upload a video'} testId="video" onUploaded={(id) => up('video', { kind: 'upload', uploadId: id })} /></div>}
              </div>
            </Section>

            <Section title="Body"><BodyEditor blocks={snap.body} onChange={(b) => up('body', b)} /></Section>

            <Section title={`Additional images (${snap.additionalImages.length}/12)`}>
              {snap.additionalImages.map((img, i) => (
                <ImageMeta key={i} img={img} testId={`extra-${i}`} onChange={(n) => up('additionalImages', snap.additionalImages.map((x, k) => (k === i ? n : x)))} onRemove={() => up('additionalImages', snap.additionalImages.filter((_, k) => k !== i))} />
              ))}
              {snap.additionalImages.length < 12 && <UploadButton kind="image" label="Add image" testId="extra" onUploaded={(id) => setSnap((s) => ({ ...s, additionalImages: [...s.additionalImages, { uploadId: id, alt: '', credit: null }] }))} />}
            </Section>
          </div>

          <aside className="flex flex-col gap-4">
            <Section title="Byline">
              <Field label="Author" count={(snap.author ?? '').length} max={120}><input className={inputCls} maxLength={120} value={snap.author ?? ''} onChange={(e) => up('author', nn(e.target.value))} data-testid="input-author" /></Field>
              <Field label="Publication date" hint={`Your time zone: ${TZ}. Stored as ISO with offset.`}>
                <input type="datetime-local" className={inputCls} value={isoToLocalInput(snap.publicationDate)} onChange={(e) => up('publicationDate', localInputToIso(e.target.value))} data-testid="input-publication-date" />
              </Field>
            </Section>
            <Section title="References">
              {!options && <p className="text-xs text-sand-400">Loading catalogue…</p>}
              <Field label="Related partner"><select className={inputCls} value={snap.relatedPartnerKey ?? ''} onChange={(e) => up('relatedPartnerKey', nn(e.target.value))} data-testid="select-partner"><option value="">None</option>{options?.partners.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}</select></Field>
              <Field label="Related programme"><select className={inputCls} value={snap.relatedProgrammeSlug ?? ''} onChange={(e) => up('relatedProgrammeSlug', nn(e.target.value))} data-testid="select-programme"><option value="">None</option>{options?.programmes.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}</select></Field>
            </Section>
            <Section title="Search & sharing">
              <Field label="SEO title" count={(snap.seoTitle ?? '').length} max={70}><input className={inputCls} maxLength={70} value={snap.seoTitle ?? ''} onChange={(e) => up('seoTitle', nn(e.target.value))} placeholder={snap.title.slice(0, 70)} data-testid="input-seo-title" /></Field>
              <Field label="SEO description" count={(snap.seoDescription ?? '').length} max={180}><textarea className={`${inputCls} min-h-20`} maxLength={180} value={snap.seoDescription ?? ''} onChange={(e) => up('seoDescription', nn(e.target.value))} data-testid="input-seo-description" /></Field>
            </Section>
            <Section title="Rights">
              <label className="flex items-start gap-2 text-xs leading-relaxed text-ink-800">
                <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[hsl(39_52%_54%)]" checked={snap.mediaRightsConfirmed} onChange={(e) => up('mediaRightsConfirmed', e.target.checked)} data-testid="checkbox-media-rights" />
                I confirm TOMI holds the rights or permission to publish every image and video in this article, and that credits are accurate.
              </label>
            </Section>
            {issues.length > 0 && <ul className="rounded-xl border border-coral-500/40 bg-coral-500/5 p-3 text-xs text-ink-800" data-testid="list-issues">{issues.map((x) => <li key={x}>{x}</li>)}</ul>}
          </aside>
        </fieldset>
        </UploadTracker.Provider>
      )}

      <Confirm open={pending?.action === 'publish'} busy={busy} title="Publish this draft?" confirmLabel="Publish now" onCancel={() => setPending(null)} onConfirm={lifecycle}
        body={<>The saved draft (version {article?.version}) becomes the public article at <span className="font-mono">/news/{article?.slug}</span>.{!article?.publishedAt && ' The URL slug will be locked after this.'}{!snap.mediaRightsConfirmed && <span className="mt-2 block text-crimson-700">Media rights are not confirmed; the server may refuse publication.</span>}</>} />
      <Confirm open={pending?.action === 'unpublish'} busy={busy} title="Unpublish this article?" confirmLabel="Unpublish" tone="danger" onCancel={() => setPending(null)} onConfirm={lifecycle} body="The article is removed from the public site. Your draft and history are kept." />
      <Confirm open={pending?.action === 'archive'} busy={busy} title="Archive this article?" confirmLabel="Archive" tone="danger" onCancel={() => setPending(null)} onConfirm={lifecycle} body="Archived articles are not public. History is kept and a revision can be restored later." />
      <Confirm open={pending?.action === 'restore'} busy={busy} title={`Restore revision ${pending?.revision?.revisionNo ?? ''}?`} confirmLabel="Restore as draft" onCancel={() => setPending(null)} onConfirm={lifecycle} body="Its content becomes a new private draft revision. The live article does not change until you publish." />
    </div>
  );
}
