import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Archive, Eye, Save, Send, Trash2, Undo2 } from 'lucide-react';
import { useCreatePartnerOrganization, useUpdatePartnerOrganization, useDeletePartnerOrganization, type PartnerOrganization } from '@workspace/api-client-react';
import { useUploads, btn, btnGhost, card, field } from '@/components/network/kit';
import ImageSlot from '@/components/media-center/admin/ImageSlot';
import {
  CATEGORIES, CATEGORY_LABEL, RELATIONSHIPS, RELATIONSHIP_LABEL, emptyPartnerForm, invalidatePartners, partnerErr, partnerFormFrom, partnerIssues, toPartnerSave,
  type PartnerForm, type PartnerStatus,
} from '@/lib/partner-directory';

const STATUS_LABEL = { draft: 'Draft', published: 'Published', archived: 'Archived' } as const;
const LEGACY = '__legacy__';

export default function PartnerEditor({ entry, onDone, onDirty, onBusy }: {
  entry: PartnerOrganization | null; onDone: (saved: PartnerOrganization | null) => void;
  onDirty: (d: boolean) => void; onBusy: (b: boolean) => void;
}) {
  const qc = useQueryClient();
  const create = useCreatePartnerOrganization();
  const update = useUpdatePartnerOrganization();
  const del = useDeletePartnerOrganization();
  const logo = useUploads(1);
  const init = entry ? partnerFormFrom(entry) : emptyPartnerForm();
  const [form, setForm] = useState<PartnerForm>(init);
  const base = useRef(JSON.stringify(init));
  const [err, setErr] = useState('');
  const [issues, setIssues] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const lock = useRef(false);

  const dirty = JSON.stringify(form) !== base.current || logo.items.length > 0;
  const busy = saving || logo.busy;
  const dirtyCb = useRef(onDirty); dirtyCb.current = onDirty;
  const busyCb = useRef(onBusy); busyCb.current = onBusy;
  useEffect(() => { dirtyCb.current(dirty); }, [dirty]);
  useEffect(() => { busyCb.current(busy); }, [busy]);
  useEffect(() => () => { busyCb.current(false); }, []);

  const set = <K extends keyof PartnerForm>(k: K, v: PartnerForm[K]) => setForm((f) => ({ ...f, [k]: v }));
  const status: PartnerStatus = entry?.status ?? 'draft';
  // Legacy logo: represented in the slot by a sentinel; uploading replaces it, removing sets null.
  const legacyActive = form.logoUploadId === null && form.legacyLogoId !== null;
  const slotValue = form.logoUploadId ?? (legacyActive ? LEGACY : null);
  const originalSlot = entry?.logoUploadId ?? (entry?.legacyLogoId != null ? LEGACY : null);
  const hasLogo = !!slotValue;
  const reviewNeeded = !!entry && (!entry.relationshipVerified || !entry.rightsConfirmed || !entry.logoUrl);

  async function save(next: PartnerStatus, confirmMsg?: string) {
    if (lock.current || logo.busy) return;
    const iss = partnerIssues(form, next, hasLogo);
    setIssues(iss); setErr('');
    if (iss.length) return;
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    lock.current = true; setSaving(true);
    try {
      const data = toPartnerSave(form, next, entry?.updatedAt ?? null);
      const saved = entry ? await update.mutateAsync({ id: entry.id, data }) : await create.mutateAsync({ data });
      invalidatePartners(qc);
      base.current = JSON.stringify(form);
      logo.clear();
      dirtyCb.current(false);
      onDone(saved);
    } catch (e) { setErr(partnerErr(e)); }
    finally { lock.current = false; setSaving(false); }
  }

  async function remove() {
    if (!entry || lock.current) return;
    if (!window.confirm(`Remove "${entry.name}" from the directory? It is archived and hidden publicly; source logo files are kept.`)) return;
    lock.current = true; setSaving(true); setErr('');
    try {
      await del.mutateAsync({ id: entry.id, data: { expectedUpdatedAt: entry.updatedAt } });
      invalidatePartners(qc);
      dirtyCb.current(false);
      onDone(null);
    } catch (e) { setErr(partnerErr(e, 'Not removed. Please try again.')); }
    finally { lock.current = false; setSaving(false); }
  }

  return (
    <form className={`${card} flex flex-col gap-5 p-5 sm:p-6`} onSubmit={(e) => { e.preventDefault(); save(status === 'archived' ? 'draft' : status); }} data-testid="form-partner">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-xl text-ink-900">{entry ? 'Edit organization' : 'New organization'}</h2>
        <span className="rounded-full bg-ivory-200 px-2.5 py-0.5 text-[11px] font-semibold text-ink-800" data-testid="text-partner-status">{STATUS_LABEL[status]}{dirty ? ' · unsaved changes' : ''}</span>
      </div>
      {reviewNeeded && <p className="rounded-xl border border-gold-500/40 bg-gold-500/10 p-3 text-xs text-ink-900" data-testid="text-partner-review">Review needed: this record cannot be published until the relationship is verified, logo rights are confirmed and a high-quality logo is attached.</p>}
      {!entry && <p className="text-xs text-ink-700">New organizations start as private drafts. Check the list first — the same organization must not be added twice.</p>}

      <fieldset disabled={saving} className="grid gap-4 sm:grid-cols-2">
        <label className="text-xs font-semibold text-ink-800 sm:col-span-2">Official name
          <input className={`${field} mt-1`} minLength={2} maxLength={200} value={form.name} onChange={(e) => set('name', e.target.value)} required data-testid="input-partner-name" />
        </label>
        <label className="text-xs font-semibold text-ink-800">Category
          <select className={`${field} mt-1`} value={form.category} onChange={(e) => set('category', e.target.value as PartnerForm['category'])} data-testid="select-partner-category">
            {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
          </select>
        </label>
        <label className="text-xs font-semibold text-ink-800">Relationship
          <select className={`${field} mt-1`} value={form.relationship} onChange={(e) => set('relationship', e.target.value as PartnerForm['relationship'])} data-testid="select-partner-relationship">
            {RELATIONSHIPS.map((r) => <option key={r} value={r}>{RELATIONSHIP_LABEL[r]}</option>)}
          </select>
        </label>
        <label className="text-xs font-semibold text-ink-800 sm:col-span-2">Approved description (optional)
          <textarea className={`${field} mt-1 min-h-28`} maxLength={2000} value={form.description} onChange={(e) => set('description', e.target.value)} data-testid="input-partner-description" />
          <span className="mt-1 block text-right font-normal text-ink-700">{form.description.length} / 2000</span>
        </label>
        <label className="text-xs font-semibold text-ink-800">Official website (optional)
          <input type="url" className={`${field} mt-1`} maxLength={2000} value={form.website} onChange={(e) => set('website', e.target.value)} placeholder="https://" data-testid="input-partner-website" />
        </label>
        <label className="text-xs font-semibold text-ink-800">Display order
          <input type="number" inputMode="numeric" min={0} max={100000} step={1} className={`${field} mt-1`} value={form.priority} onChange={(e) => set('priority', e.target.value)} data-testid="input-partner-priority" />
          <span className="mt-1 block font-normal text-ink-700">Lower numbers appear first.</span>
        </label>
      </fieldset>

      <ImageSlot name="Logo" u={logo} value={slotValue} original={originalSlot} originalUrl={entry?.logoUrl ?? null}
        onChange={(id) => setForm((f) => id === LEGACY ? { ...f, logoUploadId: null, legacyLogoId: entry?.legacyLogoId ?? null } : id === null ? { ...f, logoUploadId: null, legacyLogoId: null } : { ...f, logoUploadId: id })}
        disabled={saving} />

      <div className="flex flex-col gap-2">
        <label className="flex items-start gap-2 text-xs text-ink-800">
          <input type="checkbox" className="mt-0.5 accent-[hsl(187_67%_12%)]" checked={form.relationshipVerified} disabled={saving} onChange={(e) => set('relationshipVerified', e.target.checked)} data-testid="checkbox-partner-verified" />
          I have verified this relationship with the organization and the label above is accurate. Required to publish.
        </label>
        <label className="flex items-start gap-2 text-xs text-ink-800">
          <input type="checkbox" className="mt-0.5 accent-[hsl(187_67%_12%)]" checked={form.rightsConfirmed} disabled={saving} onChange={(e) => set('rightsConfirmed', e.target.checked)} data-testid="checkbox-partner-rights" />
          TOMI has the right to display this logo and name. Required to publish.
        </label>
      </div>

      {issues.length > 0 && <ul className="list-disc rounded-xl border border-gold-500/40 bg-gold-500/10 py-3 pl-8 pr-4 text-xs text-ink-900" role="alert" data-testid="list-partner-issues">{issues.map((i) => <li key={i}>{i}</li>)}</ul>}
      {err && <p className="rounded-xl border border-crimson-700/30 bg-crimson-700/5 p-3 text-xs text-crimson-700" role="alert" data-testid="text-partner-error">{err}</p>}
      {logo.busy && <p className="text-xs text-lagoon-700" aria-live="polite">Waiting for the upload to finish before saving.</p>}

      <div className="flex flex-wrap gap-2 border-t border-sand-100 pt-4">
        {status !== 'published' && <button type="button" className={btn} disabled={busy} onClick={() => save('published', 'Publish this organization on the public Partners page?')} data-testid="button-partner-publish"><Send className="h-3.5 w-3.5" />Publish</button>}
        {status === 'published' && <button type="button" className={btn} disabled={busy} onClick={() => save('published')} data-testid="button-partner-update"><Save className="h-3.5 w-3.5" />Save published</button>}
        {status !== 'published' && <button type="button" className={btnGhost} disabled={busy} onClick={() => save('draft')} data-testid="button-partner-draft"><Save className="h-3.5 w-3.5" />{status === 'archived' ? 'Restore as draft' : 'Save draft'}</button>}
        {status === 'published' && <button type="button" className={btnGhost} disabled={busy} onClick={() => save('draft', 'Move back to draft? It will be hidden from the public Partners page.')} data-testid="button-partner-unpublish"><Eye className="h-3.5 w-3.5" />Unpublish</button>}
        {entry && status !== 'archived' && <button type="button" className={btnGhost} disabled={busy} onClick={() => save('archived', 'Archive this organization? It is hidden publicly but kept here.')} data-testid="button-partner-archive"><Archive className="h-3.5 w-3.5" />Archive</button>}
        {entry && status !== 'archived' && <button type="button" className={`${btnGhost} text-crimson-700`} disabled={busy} onClick={remove} data-testid="button-partner-delete"><Trash2 className="h-3.5 w-3.5" />Remove</button>}
        <button type="button" className={`${btnGhost} ml-auto`} disabled={busy} onClick={() => { if (!dirty || window.confirm('Discard unsaved changes?')) { dirtyCb.current(false); onDone(entry); } }} data-testid="button-partner-close"><Undo2 className="h-3.5 w-3.5" />Close</button>
      </div>
    </form>
  );
}
