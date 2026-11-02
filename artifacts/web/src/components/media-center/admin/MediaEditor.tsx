import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Archive, Eye, Save, Send, Trash2, Undo2 } from 'lucide-react';
import {
  useCreateMediaPublication, useUpdateMediaPublication, useDeleteMediaPublication,
  type MediaPublication, type MediaPublicationSaveStatus,
} from '@workspace/api-client-react';
import { useUploads, btn, btnGhost, card, field } from '@/components/network/kit';
import {
  CATEGORIES, CATEGORY_LABEL, emptyForm, formFrom, formIssues, invalidateMediaCenter, mediaErr, parseEmbed, safeEmbedSrc, toSave, type MediaForm,
} from '@/lib/media-center';
import ImageSlot from './ImageSlot';

const STATUS_LABEL = { draft: 'Draft', published: 'Published', archived: 'Archived' } as const;

export default function MediaEditor({ entry, onDone, onDirty, onBusy }: {
  entry: MediaPublication | null; onDone: (saved: MediaPublication | null) => void;
  onDirty: (d: boolean) => void; onBusy: (b: boolean) => void;
}) {
  const qc = useQueryClient();
  const create = useCreateMediaPublication();
  const update = useUpdateMediaPublication();
  const del = useDeleteMediaPublication();
  const cover = useUploads(1);
  const logo = useUploads(1);
  const [form, setForm] = useState<MediaForm>(() => (entry ? formFrom(entry) : emptyForm()));
  const base = useRef(JSON.stringify(entry ? formFrom(entry) : emptyForm()));
  const [err, setErr] = useState('');
  const [issues, setIssues] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const lock = useRef(false);

  const uploading = cover.busy || logo.busy;
  const dirty = JSON.stringify(form) !== base.current || cover.items.length > 0 || logo.items.length > 0;
  const busy = saving || uploading;
  const dirtyCb = useRef(onDirty); dirtyCb.current = onDirty;
  const busyCb = useRef(onBusy); busyCb.current = onBusy;
  useEffect(() => { dirtyCb.current(dirty); }, [dirty]);
  useEffect(() => { busyCb.current(busy); }, [busy]);
  useEffect(() => () => { busyCb.current(false); }, []);

  const set = <K extends keyof MediaForm>(k: K, v: MediaForm[K]) => setForm((f) => ({ ...f, [k]: v }));
  const status = entry?.status ?? 'draft';

  async function save(next: MediaPublicationSaveStatus, confirmMsg?: string) {
    if (lock.current || uploading) return;
    const iss = formIssues(form, next);
    setIssues(iss); setErr('');
    if (iss.length) return;
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    lock.current = true; setSaving(true);
    try {
      const data = toSave(form, next, entry?.updatedAt ?? null);
      const saved = entry ? await update.mutateAsync({ id: entry.id, data }) : await create.mutateAsync({ data });
      invalidateMediaCenter(qc);
      base.current = JSON.stringify(form);
      cover.clear(); logo.clear();
      dirtyCb.current(false);
      onDone(saved);
    } catch (e) { setErr(mediaErr(e)); }
    finally { lock.current = false; setSaving(false); }
  }

  async function remove() {
    if (!entry || lock.current) return;
    if (!window.confirm(`Delete "${entry.title}"? It is removed from the public Media page and from this list. Uploaded images are retained in private storage. This cannot be undone here.`)) return;
    lock.current = true; setSaving(true); setErr('');
    try {
      await del.mutateAsync({ id: entry.id, data: { expectedUpdatedAt: entry.updatedAt } });
      invalidateMediaCenter(qc);
      dirtyCb.current(false);
      onDone(null);
    } catch (e) { setErr(mediaErr(e, 'Not deleted. Please try again.')); }
    finally { lock.current = false; setSaving(false); }
  }

  const embed = parseEmbed(form.embedInput);
  const embedOk = embed ? !!safeEmbedSrc(embed) : false;

  return (
    <form className={`${card} flex flex-col gap-5 p-5 sm:p-6`} onSubmit={(e) => { e.preventDefault(); save(status === 'archived' ? 'draft' : status); }} data-testid="form-media-publication">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-xl text-ink-900">{entry ? 'Edit publication' : 'New publication'}</h2>
        <span className="rounded-full bg-ivory-200 px-2.5 py-0.5 text-[11px] font-semibold text-ink-800" data-testid="text-media-status">{STATUS_LABEL[status]}{dirty ? ' · unsaved changes' : ''}</span>
      </div>

      <fieldset disabled={saving} className="grid gap-4 sm:grid-cols-2">
        <label className="text-xs font-semibold text-ink-800 sm:col-span-2">Title
          <input className={`${field} mt-1`} maxLength={240} value={form.title} onChange={(e) => set('title', e.target.value)} required data-testid="input-media-title" />
        </label>
        <label className="text-xs font-semibold text-ink-800">Media / publisher
          <input className={`${field} mt-1`} maxLength={140} value={form.publisher} onChange={(e) => set('publisher', e.target.value)} placeholder="e.g. TV5MONDE" data-testid="input-media-publisher" />
        </label>
        <label className="text-xs font-semibold text-ink-800">Category
          <select className={`${field} mt-1`} value={form.category} onChange={(e) => set('category', e.target.value as MediaForm['category'])} data-testid="select-media-category">
            {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
          </select>
        </label>
        <label className="text-xs font-semibold text-ink-800 sm:col-span-2">Description
          <textarea className={`${field} mt-1 min-h-32`} maxLength={6000} value={form.description} onChange={(e) => set('description', e.target.value)} data-testid="input-media-description" />
          <span className="mt-1 block text-right font-normal text-ink-700">{form.description.length} / 6000</span>
        </label>
        <label className="text-xs font-semibold text-ink-800">Publication date
          <input type="date" className={`${field} mt-1`} value={form.publicationDate} onChange={(e) => set('publicationDate', e.target.value)} data-testid="input-media-date" />
          <span className="mt-1 block font-normal text-ink-700">Optional for drafts, required to publish.</span>
        </label>
        <label className="text-xs font-semibold text-ink-800">Display order
          <input type="number" inputMode="numeric" min={0} max={100000} step={1} className={`${field} mt-1`} value={form.priority} onChange={(e) => set('priority', e.target.value)} data-testid="input-media-priority" />
          <span className="mt-1 block font-normal text-ink-700">Lower numbers appear first (0 is top). Equal numbers sort newest date first.</span>
        </label>
        <label className="text-xs font-semibold text-ink-800 sm:col-span-2">Publication / source link
          <input type="url" className={`${field} mt-1`} maxLength={2000} value={form.externalUrl} onChange={(e) => set('externalUrl', e.target.value)} placeholder="https://" data-testid="input-media-url" />
        </label>
        <label className="text-xs font-semibold text-ink-800 sm:col-span-2">Direct Instagram link
          <input type="url" className={`${field} mt-1`} maxLength={2000} value={form.instagramUrl} onChange={(e) => set('instagramUrl', e.target.value)} placeholder="https://www.instagram.com/p/…" data-testid="input-media-instagram-url" />
          <span className="mt-1 block font-normal text-ink-700">Optional. Use the exact public post or reel link; it appears separately from the publication source.</span>
        </label>
        <label className="text-xs font-semibold text-ink-800 sm:col-span-2">YouTube or Vimeo video (optional)
          <input className={`${field} mt-1`} maxLength={300} value={form.embedInput} onChange={(e) => set('embedInput', e.target.value)} placeholder="https://www.youtube.com/watch?v=… or https://vimeo.com/…" data-testid="input-media-embed" />
          <span className={`mt-1 block font-normal ${form.embedInput.trim() && !embedOk ? 'text-crimson-700' : 'text-ink-700'}`}>
            {!form.embedInput.trim() ? 'Visitors must click to load the video; nothing autoplays.' : embedOk ? `Recognised ${embed!.provider === 'youtube' ? 'YouTube' : 'Vimeo'} video ${embed!.videoId}.` : 'Not a recognised YouTube or Vimeo link.'}
          </span>
        </label>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <ImageSlot name="Cover" u={cover} value={form.coverUploadId} original={entry?.coverUploadId ?? null} originalUrl={entry?.coverUrl ?? null} onChange={(id) => set('coverUploadId', id)} disabled={saving} contain={form.category === 'magazine'} />
        <ImageSlot name="Logo" u={logo} value={form.logoUploadId} original={entry?.logoUploadId ?? null} originalUrl={entry?.logoUrl ?? null} onChange={(id) => set('logoUploadId', id)} disabled={saving} />
      </div>

      <label className="flex items-start gap-2 text-xs text-ink-800">
        <input type="checkbox" className="mt-0.5 accent-[hsl(187_67%_12%)]" checked={form.rightsConfirmed} disabled={saving} onChange={(e) => set('rightsConfirmed', e.target.checked)} data-testid="checkbox-media-rights" />
        I confirm TOMI has the right to display these images, logos, description and video. Required to publish.
      </label>

      {issues.length > 0 && <ul className="list-disc rounded-xl border border-gold-500/40 bg-gold-500/10 py-3 pl-8 pr-4 text-xs text-ink-900" role="alert" data-testid="list-media-issues">{issues.map((i) => <li key={i}>{i}</li>)}</ul>}
      {err && <p className="rounded-xl border border-crimson-700/30 bg-crimson-700/5 p-3 text-xs text-crimson-700" role="alert" data-testid="text-media-error">{err}</p>}
      {uploading && <p className="text-xs text-lagoon-700" aria-live="polite">Waiting for uploads to finish before saving.</p>}

      <div className="flex flex-wrap gap-2 border-t border-sand-100 pt-4">
        {status !== 'published' && <button type="button" className={btn} disabled={busy} onClick={() => save('published', 'Publish this entry? It will appear on the public Media page.')} data-testid="button-media-publish"><Send className="h-3.5 w-3.5" />Publish</button>}
        {status === 'published' && <button type="button" className={btn} disabled={busy} onClick={() => save('published')} data-testid="button-media-update"><Save className="h-3.5 w-3.5" />Save published</button>}
        {status !== 'published' && <button type="button" className={btnGhost} disabled={busy} onClick={() => save('draft')} data-testid="button-media-draft"><Save className="h-3.5 w-3.5" />{status === 'archived' ? 'Restore as draft' : 'Save draft'}</button>}
        {status === 'published' && <button type="button" className={btnGhost} disabled={busy} onClick={() => save('draft', 'Move back to draft? It will be removed from the public Media page.')} data-testid="button-media-unpublish"><Eye className="h-3.5 w-3.5" />Unpublish to draft</button>}
        {entry && status !== 'archived' && <button type="button" className={btnGhost} disabled={busy} onClick={() => save('archived', 'Archive this entry? It is hidden from the public page but kept here.')} data-testid="button-media-archive"><Archive className="h-3.5 w-3.5" />Archive</button>}
        {entry && <button type="button" className={`${btnGhost} text-crimson-700`} disabled={busy} onClick={remove} data-testid="button-media-delete"><Trash2 className="h-3.5 w-3.5" />Delete</button>}
        <button type="button" className={`${btnGhost} ml-auto`} disabled={busy} onClick={() => { if (!dirty || window.confirm('Discard unsaved changes?')) { dirtyCb.current(false); onDone(entry); } }} data-testid="button-media-cancel"><Undo2 className="h-3.5 w-3.5" />Close</button>
      </div>
    </form>
  );
}
