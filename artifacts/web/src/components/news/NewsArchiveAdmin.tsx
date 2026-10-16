import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Archive, CheckCircle2, Eye, EyeOff, Pencil, Plus, Trash2, Undo2 } from 'lucide-react';
import {
  useGetNewsAdmin, getGetNewsAdminQueryKey, getGetNewsArchiveQueryKey,
  useCreateNewsEntry, useUpdateNewsEntry,
  type PressEntry, type PressEntryInput,
} from '@workspace/api-client-react';
import { Empty, ErrorBox, Skeleton, UploadTray, btn, btnGhost, card, field, useUploads } from '@/components/network/kit';
import { PRESS_CATEGORY_LABELS, assetUrl, captureCount, outboundLink } from '@/lib/press';

const MAX = 12;
const OK_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ACCEPT = OK_TYPES.join(',');
type Status = PressEntry['status'];
type Cat = PressEntry['category'];

function apiMessage(e: unknown): string {
  const d = (e as { data?: { error?: unknown } } | null)?.data;
  return typeof d?.error === 'string' ? d.error : 'The entry was not saved. Your edits are kept — check the fields and try again.';
}

function Editor({ entry, onDone }: { entry: PressEntry | null; onDone: (msg: string) => void }) {
  const qc = useQueryClient();
  const after = async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: getGetNewsArchiveQueryKey() }),
      qc.invalidateQueries({ queryKey: getGetNewsAdminQueryKey() }),
    ]);
  };
  const create = useCreateNewsEntry({ mutation: { onSuccess: after } });
  const update = useUpdateNewsEntry({ mutation: { onSuccess: after } });
  const shots = useUploads(MAX);
  const logo = useUploads(1);

  const [title, setTitle] = useState(entry?.title ?? '');
  const [outlet, setOutlet] = useState(entry?.outlet ?? '');
  const [summary, setSummary] = useState(entry?.summary ?? '');
  const [category, setCategory] = useState<Cat>(entry?.category ?? 'movement');
  const [dateLabel, setDateLabel] = useState(entry?.dateLabel ?? '');
  const [sourceUrl, setSourceUrl] = useState(entry?.sourceUrl ?? '');
  const [websiteUrl, setWebsiteUrl] = useState(entry?.websiteUrl ?? '');
  const [removeIdx, setRemoveIdx] = useState<number[]>([]);
  const [removeLogo, setRemoveLogo] = useState(false);
  const [consent, setConsent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const existing = entry?.evidenceUrls ?? [];
  const retained = existing.length - removeIdx.length;
  const total = retained + shots.items.length;
  const badType = [...shots.items, ...logo.items].some((x) => !OK_TYPES.includes(x.file.type));
  const notDone = [...shots.items, ...logo.items].some((x) => x.status !== 'done');
  const newUploads = shots.items.length > 0 || logo.items.length > 0;
  const pending = create.isPending || update.isPending;

  const problems: string[] = [];
  if (title.trim().length < 2) problems.push('Title needs at least 2 characters.');
  if (outlet.trim().length < 2) problems.push('Publisher needs at least 2 characters.');
  if (summary.trim().length < 10) problems.push('Summary needs at least 10 characters.');
  if (websiteUrl.trim().length < 8 || !/^https?:\/\//i.test(websiteUrl.trim())) problems.push('Publisher website must be a full https:// address.');
  if (sourceUrl.trim() && !/^https?:\/\//i.test(sourceUrl.trim())) problems.push('Original article link must start with https:// or be left empty.');
  if (total > MAX) problems.push(`At most ${MAX} screenshots in total (currently ${total}). Remove some.`);
  if (badType) problems.push('Only JPEG, PNG or WebP images are accepted. Remove other files.');

  const save = async (status: Status) => {
    setErr(null);
    if ((status === 'published' || newUploads) && !consent) { setErr('Confirm the public image consent before publishing or adding images.'); return; }
    const data: PressEntryInput = {
      title: title.trim(), outlet: outlet.trim(), summary: summary.trim(), category,
      dateLabel: dateLabel.trim(), sourceUrl: sourceUrl.trim(), websiteUrl: websiteUrl.trim(), status,
      evidenceUploadIds: shots.ids, removeEvidenceIndexes: removeIdx,
      removeLogo: removeLogo && logo.ids.length === 0, publicAssetsConsent: consent,
      ...(logo.ids[0] ? { logoUploadId: logo.ids[0] } : {}),
    };
    try {
      if (entry) await update.mutateAsync({ id: entry.id, data });
      else await create.mutateAsync({ data });
      shots.clear(); logo.clear();
      onDone(`Saved as ${status}.`);
    } catch (e) { setErr(apiMessage(e)); }
  };

  const blocked = pending || problems.length > 0 || shots.busy || logo.busy || notDone;
  const lbl = 'flex flex-col gap-1 text-xs font-semibold text-ink-800';

  return (
    <form className={`${card} flex flex-col gap-4 p-4 md:p-6`} onSubmit={(e) => e.preventDefault()} data-testid="form-news-entry">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-lg text-ink-900">{entry ? 'Edit coverage' : 'New coverage'}</h2>
        {entry && <span className="rounded-full bg-ivory-200 px-2.5 py-0.5 text-xs font-semibold capitalize">Currently {entry.status}</span>}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className={`${lbl} md:col-span-2`}>Headline as published<input className={field} maxLength={240} value={title} onChange={(e) => setTitle(e.target.value)} data-testid="input-news-title" /></label>
        <label className={lbl}>Publisher<input className={field} maxLength={120} value={outlet} onChange={(e) => setOutlet(e.target.value)} data-testid="input-news-outlet" /></label>
        <label className={lbl}>Date / context<input className={field} maxLength={80} placeholder="e.g. 7 September 2025" value={dateLabel} onChange={(e) => setDateLabel(e.target.value)} data-testid="input-news-date" /></label>
        <label className={lbl}>Subject<select className={field} value={category} onChange={(e) => setCategory(e.target.value as Cat)} data-testid="select-news-category">{(Object.keys(PRESS_CATEGORY_LABELS) as Cat[]).map((c) => <option key={c} value={c}>{PRESS_CATEGORY_LABELS[c]}</option>)}</select></label>
        <label className={lbl}>Publisher website (required)<input className={field} maxLength={2000} placeholder="https://" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} data-testid="input-news-website" /></label>
        <label className={`${lbl} md:col-span-2`}>Exact original article link (only if verified — otherwise leave empty and visitors see "Visit publisher")<input className={field} maxLength={2000} placeholder="https://" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} data-testid="input-news-source" /></label>
        <label className={`${lbl} md:col-span-2`}>Attributed summary<textarea className={`${field} min-h-28`} maxLength={1800} value={summary} onChange={(e) => setSummary(e.target.value)} data-testid="input-news-summary" /><span className="font-normal text-sand-400">{summary.length}/1800 · Do not add audience totals the publication does not state.</span></label>
      </div>

      <fieldset className="flex flex-col gap-2 border-t border-sand-100 pt-4">
        <legend className="text-xs font-semibold text-ink-800">Screenshots of this one publication — {total}/{MAX}</legend>
        {existing.length > 0 && (
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {existing.map((src, i) => {
              const gone = removeIdx.includes(i);
              return (
                <li key={src + i} className={`relative rounded-lg border p-1 ${gone ? 'border-crimson-700/40 opacity-40' : 'border-sand-200'}`}>
                  <img src={assetUrl(src)} alt={`Existing screenshot ${i + 1}`} className="aspect-[3/4] w-full bg-ivory-100 object-contain" />
                  <button type="button" onClick={() => setRemoveIdx((r) => gone ? r.filter((x) => x !== i) : [...r, i])} className="mt-1 inline-flex w-full items-center justify-center gap-1 rounded-full border border-sand-300 py-0.5 text-[10px] font-semibold" aria-label={gone ? `Keep screenshot ${i + 1}` : `Remove screenshot ${i + 1}`} data-testid={`button-toggle-evidence-${i}`}>
                    {gone ? <><Undo2 className="h-3 w-3" />Keep</> : <><Trash2 className="h-3 w-3" />Remove</>}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <UploadTray u={shots} accept={ACCEPT} label="Add screenshots (JPEG, PNG, WebP)" testId="upload-news-evidence" />
      </fieldset>

      <fieldset className="flex flex-col gap-2 border-t border-sand-100 pt-4">
        <legend className="text-xs font-semibold text-ink-800">Publisher logo</legend>
        {entry?.logoUrl && logo.items.length === 0 && (
          <div className="flex items-center gap-3">
            <img src={assetUrl(entry.logoUrl)} alt="Current logo" className={`h-12 w-20 rounded border border-sand-200 bg-ivory-50 object-contain p-1 ${removeLogo ? 'opacity-30' : ''}`} />
            <button type="button" className={btnGhost} onClick={() => setRemoveLogo((v) => !v)} data-testid="button-toggle-logo">{removeLogo ? 'Keep logo' : 'Remove logo'}</button>
          </div>
        )}
        <UploadTray u={logo} accept={ACCEPT} label={entry?.logoUrl ? 'Replace logo' : 'Add logo'} testId="upload-news-logo" />
      </fieldset>

      <label className="flex items-start gap-2 rounded-xl border border-gold-500/40 bg-gold-400/10 p-3 text-xs text-ink-800">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 accent-[hsl(187_67%_12%)]" data-testid="checkbox-news-consent" />
        <span>I confirm that once this entry is published, its uploaded screenshots and publisher logo become publicly accessible to anyone on the web, and that TOMI may display them as press evidence. Required to publish or to add new images.</span>
      </label>

      {problems.length > 0 && <ul className="list-disc pl-5 text-xs text-crimson-700">{problems.map((p) => <li key={p}>{p}</li>)}</ul>}
      {(shots.busy || logo.busy) && <p className="text-xs text-lagoon-700">Waiting for uploads to finish...</p>}
      {notDone && !(shots.busy || logo.busy) && <p className="text-xs text-crimson-700">Retry or remove failed uploads before saving.</p>}
      {err && <p className="text-xs text-crimson-700" role="alert" data-testid="text-news-error">{err}</p>}

      <div className="flex flex-wrap gap-2 border-t border-sand-100 pt-4">
        <button type="button" className={btnGhost} disabled={blocked} onClick={() => save(entry?.status === 'archived' ? 'archived' : entry?.status === 'published' ? 'published' : 'draft')} data-testid="button-news-save">{pending ? 'Saving...' : entry ? 'Save changes' : 'Save as draft'}</button>
        {entry?.status !== 'published' && <button type="button" className={btn} disabled={blocked} onClick={() => save('published')} data-testid="button-news-publish"><Eye className="h-3.5 w-3.5" />Publish</button>}
        {entry?.status === 'published' && <button type="button" className={btnGhost} disabled={blocked} onClick={() => save('draft')} data-testid="button-news-unpublish"><EyeOff className="h-3.5 w-3.5" />Unpublish</button>}
        {entry && entry.status !== 'archived' && <button type="button" className={btnGhost} disabled={blocked} onClick={() => confirm('Archive this entry? It leaves the public archive but is kept and can be restored.') && save('archived')} data-testid="button-news-archive"><Archive className="h-3.5 w-3.5" />Archive</button>}
        <button type="button" className="ml-auto text-xs font-semibold text-ink-700 underline" disabled={pending} onClick={() => onDone('')} data-testid="button-news-cancel">Cancel</button>
      </div>
    </form>
  );
}

export default function NewsArchiveAdmin() {
  const q = useGetNewsAdmin({ query: { queryKey: getGetNewsAdminQueryKey(), staleTime: 30000, refetchOnMount: true } });
  const [editing, setEditing] = useState<PressEntry | 'new' | null>(null);
  const [saved, setSaved] = useState('');

  const done = (msg: string) => { setEditing(null); setSaved(msg); if (msg) q.refetch(); };

  if (q.isLoading) return <Skeleton />;
  if (q.isError) return <ErrorBox onRetry={() => q.refetch()} msg="The news archive could not be loaded." />;
  const list = q.data ?? [];
  const order: Record<Status, number> = { published: 0, draft: 1, archived: 2 };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-ink-700">Historical press coverage shown on the public News page. Archiving hides an entry without deleting it.</p>
        {!editing && <button className={btn} onClick={() => { setSaved(''); setEditing('new'); }} data-testid="button-news-new"><Plus className="h-3.5 w-3.5" />Add coverage</button>}
      </div>
      {saved && <p className="flex items-center gap-1.5 rounded-xl bg-lagoon-600/10 px-3 py-2 text-xs font-semibold text-lagoon-700" role="status" data-testid="status-news-saved"><CheckCircle2 className="h-4 w-4" />{saved}</p>}
      {editing && <Editor key={editing === 'new' ? 'new' : editing.id} entry={editing === 'new' ? null : editing} onDone={done} />}
      {list.length === 0 && !editing ? <Empty title="No coverage yet" body="Add a publication with its screenshots and publisher logo." /> : (
        <ul className="flex flex-col gap-3">
          {[...list].sort((a, b) => order[a.status] - order[b.status]).map((e) => (
            <li key={e.id} className={`${card} flex flex-wrap items-center gap-3 p-4 ${e.status === 'archived' ? 'opacity-60' : ''}`} data-testid={`admin-news-${e.id}`}>
              {e.logoUrl ? <img src={assetUrl(e.logoUrl)} alt="" className="h-10 w-16 rounded border border-sand-200 bg-ivory-50 object-contain p-1" /> : <span className="grid h-10 w-16 place-items-center rounded border border-dashed border-sand-300 text-[10px] text-sand-400">No logo</span>}
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink-900">{e.title}</p>
                <p className="text-xs text-sand-400">{e.outlet} · {e.dateLabel} · {captureCount(e.evidenceUrls.length)} · {outboundLink(e)?.label ?? 'No link'}</p>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${e.status === 'published' ? 'bg-lagoon-600/15 text-lagoon-700' : 'bg-ivory-200 text-ink-700'}`}>{e.status}</span>
              <button className={btnGhost} disabled={!!editing} onClick={() => { setSaved(''); setEditing(e); }} data-testid={`button-news-edit-${e.id}`}><Pencil className="h-3.5 w-3.5" />Edit</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
