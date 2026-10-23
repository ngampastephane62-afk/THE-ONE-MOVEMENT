import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Eye, Save, Send } from 'lucide-react';
import {
  useSaveProgramEditorial, getGetFounderProgramEditorialQueryKey, getGetProgramEditorialQueryKey,
  type ProgramEditorial, type ProgramEditorialParticipationRolesItem,
} from '@workspace/api-client-react';
import { btn, btnGhost, card, errStatus, field } from '@/components/network/kit';
import { Field, Text, Toggle, UploadButton } from './fields';
import PeopleEditor from './PeopleEditor';
import VideoListEditor from './VideoListEditor';
import ProgramPreview from './ProgramPreview';

const ROLES: ProgramEditorialParticipationRolesItem[] = ['speaker', 'exhibitor', 'media', 'partner', 'sponsor', 'collaborator'];

function Panel({ title, children, hint }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className={`${card} flex flex-col gap-4 p-4 sm:p-5`}>
      <div><h3 className="font-display text-lg text-ink-900">{title}</h3>{hint && <p className="mt-1 text-xs text-ink-700">{hint}</p>}</div>
      {children}
    </section>
  );
}

/** Edits one programme's editorial content. Explicit draft save and explicit publish; 409 conflicts are surfaced. */
export default function ProgramEditor({ initial, programmeName, onDirty, onBusy, onReload }: {
  initial: ProgramEditorial; programmeName: string; onDirty: (d: boolean) => void; onBusy: (b: boolean) => void; onReload: () => void;
}) {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<ProgramEditorial>(initial);
  const [dirty, setDirty] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [msg, setMsg] = useState<{ tone: 'ok' | 'err' | 'conflict'; text: string } | null>(null);
  const [preview, setPreview] = useState(false);
  const save = useSaveProgramEditorial();
  const dirtyCb = useRef(onDirty); dirtyCb.current = onDirty;
  const busyCb = useRef(onBusy); busyCb.current = onBusy;
  useEffect(() => { dirtyCb.current(dirty); }, [dirty]);
  useEffect(() => { busyCb.current(save.isPending || uploading > 0); }, [save.isPending, uploading]);

  const update = (patch: Partial<ProgramEditorial>) => { setDraft((d) => ({ ...d, ...patch })); setDirty(true); setMsg(null); };
  const busy = (b: boolean) => setUploading((n) => Math.max(0, n + (b ? 1 : -1)));

  const submit = (status: ProgramEditorial['status']) => {
    if (status === 'published' && !window.confirm(`Publish these changes to the public ${programmeName} page?`)) return;
    save.mutate({ slug: draft.slug, data: { expectedUpdatedAt: draft.updatedAt, content: { ...draft, status } } }, {
      onSuccess: (saved) => {
        setDraft(saved); setDirty(false);
        qc.setQueryData(getGetFounderProgramEditorialQueryKey(saved.slug), saved);
        qc.invalidateQueries({ queryKey: getGetProgramEditorialQueryKey(saved.slug) });
        setMsg({ tone: 'ok', text: status === 'published' ? 'Published. The public page now shows these changes.' : 'Private draft saved. The public page is unchanged until you publish.' });
      },
      onError: (e) => {
        if (errStatus(e) === 409) setMsg({ tone: 'conflict', text: 'This programme was changed elsewhere since you opened it. Your edits are kept here; reload the latest version to continue (reloading discards these edits).' });
        else setMsg({ tone: 'err', text: errStatus(e) === 403 ? 'You are not authorised to save this programme.' : 'Saving failed. Your edits are kept; please try again.' });
      },
    });
  };
  const disabled = save.isPending || uploading > 0;

  return (
    <div className="flex flex-col gap-4" data-testid={`editor-program-${draft.slug}`}>
      <div className={`${card} sticky top-2 z-20 flex flex-wrap items-center gap-2 p-3`}>
        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${draft.status === 'published' ? 'bg-lagoon-900 text-gold-400' : 'bg-ivory-200 text-ink-800'}`} data-testid="status-program-editorial">{draft.status === 'published' ? 'Published' : 'Draft'}</span>
        <span className="text-xs text-ink-700">{dirty ? 'Unsaved changes' : draft.updatedAt ? `Saved ${new Date(draft.updatedAt).toLocaleString()}` : 'Never saved (showing defaults)'}</span>
        <span className="ml-auto flex flex-wrap gap-2">
          <button type="button" className={btnGhost} onClick={() => setPreview((p) => !p)} aria-pressed={preview} data-testid="button-program-preview"><Eye className="h-3.5 w-3.5" />{preview ? 'Close preview' : 'Preview'}</button>
          <button type="button" className={btnGhost} onClick={() => submit('draft')} disabled={disabled} data-testid="button-program-save-draft"><Save className="h-3.5 w-3.5" />{save.isPending ? 'Saving' : 'Save draft'}</button>
          <button type="button" className={btn} onClick={() => submit('published')} disabled={disabled} data-testid="button-program-publish"><Send className="h-3.5 w-3.5" />Publish changes</button>
        </span>
        {uploading > 0 && <p className="w-full text-xs text-ink-700">Wait for uploads to finish before saving.</p>}
      </div>
      {msg && (
        <div role={msg.tone === 'ok' ? 'status' : 'alert'} className={`rounded-2xl border px-4 py-3 text-sm ${msg.tone === 'ok' ? 'border-lagoon-600/40 bg-lagoon-600/10 text-lagoon-700' : 'border-crimson-700/40 bg-crimson-700/10 text-crimson-700'}`} data-testid="text-program-save-message">
          {msg.text}
          {msg.tone === 'conflict' && <button type="button" className="ml-2 font-semibold underline" onClick={() => { if (window.confirm('Discard your edits and load the latest version?')) onReload(); }} data-testid="button-program-reload-latest">Reload latest</button>}
        </div>
      )}
      {preview && <ProgramPreview content={draft} programmeName={programmeName} />}

      <Panel title="Introduction and description" hint="Leave a field empty to keep the existing public text for that section.">
        <Text label="Introduction (hero statement)" value={draft.introduction} onChange={(v) => update({ introduction: v })} max={2000} rows={3} testId="input-program-introduction" />
        <Text label="Description (What is this program?)" value={draft.description} onChange={(v) => update({ description: v })} max={4000} rows={5} hint="Separate paragraphs with a blank line." testId="input-program-description" />
        <Text label="Purpose and vision" value={draft.purpose} onChange={(v) => update({ purpose: v })} max={3000} rows={4} testId="input-program-purpose" />
        <Text label="Approved criteria" value={draft.criteria} onChange={(v) => update({ criteria: v })} max={6000} rows={4} hint="Only formally approved eligibility and selection criteria. Leave empty until approved." testId="input-program-criteria" />
      </Panel>

      <Panel title="Hero media" hint="Images up to 5 MB, videos up to 100 MB. Videos never autoplay with sound.">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-ink-800">Hero image</span>
            {draft.heroImageUrl && <img src={draft.heroImageUrl} alt="" className="max-h-48 w-auto self-start object-contain" />}
            <UploadButton kind="image" label="Upload hero image" onUploaded={(id) => update({ heroImageUploadId: id })} onBusy={busy} testId="upload-hero-image" />
            {(draft.heroImageUploadId || draft.heroImageUrl) && <button type="button" className="self-start text-xs underline" onClick={() => update({ heroImageUploadId: null, heroImageUrl: null })} data-testid="button-clear-hero-image">Remove from page</button>}
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-ink-800">Hero video</span>
            {draft.heroVideoUrl && <video src={draft.heroVideoUrl} controls preload="none" playsInline className="max-h-48 self-start bg-ink-900 object-contain" />}
            <UploadButton kind="video" label="Upload hero video" onUploaded={(id) => update({ heroVideoUploadId: id })} onBusy={busy} testId="upload-hero-video" />
            {(draft.heroVideoUploadId || draft.heroVideoUrl) && <button type="button" className="self-start text-xs underline" onClick={() => update({ heroVideoUploadId: null, heroVideoUrl: null })} data-testid="button-clear-hero-video">Remove from page</button>}
          </div>
        </div>
      </Panel>

      <Panel title="Event details and announcements" hint="Date and venue are shown publicly only when marked confirmed. Otherwise the page says Official announcement coming soon.">
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Date (as it should read)"><input className={field} maxLength={100} value={draft.eventDate ?? ''} onChange={(e) => update({ eventDate: e.target.value.trim() ? e.target.value : null })} data-testid="input-program-date" /></Field>
          <Text label="Venue" value={draft.venue} onChange={(v) => update({ venue: v })} max={300} testId="input-program-venue" />
        </div>
        <Toggle label="Date and venue are officially confirmed" checked={draft.eventDetailsConfirmed} onChange={(b) => update({ eventDetailsConfirmed: b })} testId="toggle-program-confirmed" />
        <Text label="Official announcement" value={draft.announcement} onChange={(v) => update({ announcement: v })} max={3000} rows={3} testId="input-program-announcement" />
      </Panel>

      <Panel title="Participation categories" hint="Each category opens an inquiry linked to this programme. No fees are shown publicly.">
        <div className="flex flex-wrap gap-x-5">
          {ROLES.map((r) => (
            <Toggle key={r} label={r[0].toUpperCase() + r.slice(1)} checked={draft.participationRoles.includes(r)}
              onChange={(b) => update({ participationRoles: b ? ROLES.filter((x) => x === r || draft.participationRoles.includes(x)) : draft.participationRoles.filter((x) => x !== r) })} testId={`toggle-role-${r}`} />
          ))}
        </div>
      </Panel>

      <Panel title="People: nominees, confirmed speakers, participants" hint="Profiles appear publicly only when published. Speakers also need to be confirmed. Changes go live only after Publish changes.">
        <PeopleEditor people={draft.people} onChange={(people) => update({ people })} onBusy={busy} />
      </Panel>

      <Panel title="Official programme videos and media" hint="Programme-level films, archive footage and approved press videos.">
        <VideoListEditor videos={draft.media} onChange={(media) => update({ media })} onBusy={busy} scope="programme" />
      </Panel>
    </div>
  );
}
