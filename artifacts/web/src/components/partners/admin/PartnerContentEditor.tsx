import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Save, Undo2 } from 'lucide-react';
import { useUpdatePartnerPageContent, type PartnerPageContent } from '@workspace/api-client-react';
import { btn, btnGhost, card, field } from '@/components/network/kit';
import { CONTENT_KEYS, CONTENT_MAX, contentForm, invalidatePartners, partnerErr, type ContentForm } from '@/lib/partner-directory';

const LABEL: Record<keyof ContentForm, string> = {
  heroTitle: 'Hero title', heroLineOne: 'Hero line one', heroLineTwo: 'Hero line two', heroDescription: 'Hero paragraph',
  directoryTitle: 'Directory title', directoryDescription: 'Directory description', collaborationTitle: 'Closing title',
  collaborationSubtitle: 'Closing subtitle', partnershipButton: 'Partnership button', conversationButton: 'Conversation button', displayNote: 'Display note',
};
const LONG = new Set<keyof ContentForm>(['heroDescription', 'directoryDescription', 'displayNote']);

export default function PartnerContentEditor({ content, onDirty, onBusy, onSaved }: {
  content: PartnerPageContent; onDirty: (d: boolean) => void; onBusy: (b: boolean) => void; onSaved: () => void;
}) {
  const qc = useQueryClient();
  const upd = useUpdatePartnerPageContent();
  const [form, setForm] = useState<ContentForm>(() => contentForm(content));
  const base = useRef(JSON.stringify(contentForm(content)));
  const version = useRef<string | null>(content.updatedAt ?? null);
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);
  const dirty = JSON.stringify(form) !== base.current;
  const dirtyCb = useRef(onDirty); dirtyCb.current = onDirty;
  const busyCb = useRef(onBusy); busyCb.current = onBusy;
  useEffect(() => { dirtyCb.current(dirty); }, [dirty]);
  useEffect(() => { busyCb.current(saving); }, [saving]);
  useEffect(() => () => { busyCb.current(false); dirtyCb.current(false); }, []);

  async function save() {
    if (saving) return;
    const empty = CONTENT_KEYS.filter((k) => !form[k].trim());
    if (empty.length) { setErr(`Please fill in: ${empty.map((k) => LABEL[k]).join(', ')}.`); return; }
    setErr(''); setSaving(true);
    try {
      const data = { ...Object.fromEntries(CONTENT_KEYS.map((k) => [k, form[k].trim()])), expectedUpdatedAt: version.current } as Parameters<typeof upd.mutateAsync>[0]['data'];
      const saved = await upd.mutateAsync({ data });
      const s = saved as PartnerPageContent | undefined;
      if (s?.updatedAt) version.current = s.updatedAt;
      base.current = JSON.stringify(form);
      dirtyCb.current(false);
      invalidatePartners(qc);
      onSaved();
    } catch (e) { setErr(partnerErr(e)); }
    finally { setSaving(false); }
  }

  return (
    <form className={`${card} flex flex-col gap-4 p-5 sm:p-6`} onSubmit={(e) => { e.preventDefault(); save(); }} data-testid="form-partner-content">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-xl text-ink-900">Page text</h2>
        {dirty && <span className="rounded-full bg-ivory-200 px-2.5 py-0.5 text-[11px] font-semibold text-ink-800">Unsaved changes</span>}
      </div>
      <p className="text-xs text-ink-700">Changes appear on the public Partners page immediately after saving.</p>
      <fieldset disabled={saving} className="grid gap-4 sm:grid-cols-2">
        {CONTENT_KEYS.map((k) => (
          <label key={k} className={`text-xs font-semibold text-ink-800 ${LONG.has(k) ? 'sm:col-span-2' : ''}`}>{LABEL[k]}
            {LONG.has(k)
              ? <textarea className={`${field} mt-1 min-h-24`} maxLength={CONTENT_MAX[k]} value={form[k]} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} data-testid={`input-content-${k}`} />
              : <input className={`${field} mt-1`} maxLength={CONTENT_MAX[k]} value={form[k]} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} data-testid={`input-content-${k}`} />}
            <span className="mt-1 block text-right font-normal text-ink-700">{form[k].length} / {CONTENT_MAX[k]}</span>
          </label>
        ))}
      </fieldset>
      {err && <p className="rounded-xl border border-crimson-700/30 bg-crimson-700/5 p-3 text-xs text-crimson-700" role="alert" data-testid="text-content-error">{err}</p>}
      <div className="flex flex-wrap gap-2 border-t border-sand-100 pt-4">
        <button type="submit" className={btn} disabled={saving || !dirty} data-testid="button-content-save"><Save className="h-3.5 w-3.5" />{saving ? 'Saving…' : 'Save page text'}</button>
        <button type="button" className={btnGhost} disabled={saving || !dirty} onClick={() => { if (window.confirm('Discard unsaved text changes?')) setForm(JSON.parse(base.current)); }} data-testid="button-content-reset"><Undo2 className="h-3.5 w-3.5" />Discard</button>
      </div>
    </form>
  );
}
