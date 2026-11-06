import { useState } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import type { ProgramPerson } from '@workspace/api-client-react';
import { btnGhost, field } from '@/components/network/kit';
import { portraitOf } from '@/lib/use-programme-editorial';
import { Field, OrderControls, Text, Toggle, UploadButton, IMAGE_MB, move, newId } from './fields';
import VideoListEditor from './VideoListEditor';

const KIND_LABEL: Record<ProgramPerson['kind'], string> = { nominee: 'Nominee', speaker: 'Speaker', participant: 'Participant' };

/** Add, edit, order and publish nominee / speaker / participant profiles and their videos. */
export default function PeopleEditor({ people, onChange, onBusy }: { people: ProgramPerson[]; onChange: (p: ProgramPerson[]) => void; onBusy: (b: boolean) => void }) {
  const list = [...people].sort((a, b) => a.order - b.order);
  const [open, setOpen] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | ProgramPerson['kind']>('all');
  const set = (id: string, patch: Partial<ProgramPerson>) => onChange(list.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const add = (kind: ProgramPerson['kind']) => {
    const id = newId(kind);
    onChange([...list, { id, name: `New ${KIND_LABEL[kind].toLowerCase()}`, designation: '', biography: '', kind, confirmed: false, published: false, portraitKey: null, portraitUploadId: null, portraitUrl: null, profileUrl: null, order: list.length, videos: [] }]);
    setOpen(id);
  };
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <select className={`${field} w-auto`} value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} aria-label="Filter people" data-testid="select-people-filter">
          <option value="all">All people ({list.length})</option>
          {(['nominee', 'speaker', 'participant'] as const).map((k) => <option key={k} value={k}>{KIND_LABEL[k]}s ({list.filter((p) => p.kind === k).length})</option>)}
        </select>
        <button type="button" className={btnGhost} onClick={() => add('nominee')} data-testid="button-add-nominee"><Plus className="h-3.5 w-3.5" />Nominee</button>
        <button type="button" className={btnGhost} onClick={() => add('speaker')} data-testid="button-add-speaker"><Plus className="h-3.5 w-3.5" />Confirmed speaker</button>
        <button type="button" className={btnGhost} onClick={() => add('participant')} data-testid="button-add-participant"><Plus className="h-3.5 w-3.5" />Participant</button>
      </div>
      {list.length === 0 && <p className="rounded-xl border border-dashed border-sand-300 p-4 text-sm text-ink-700">No people yet. Nothing is shown publicly until a profile is added and published.</p>}
      <ul className="flex flex-col gap-2">
        {list.map((p, i) => {
          if (filter !== 'all' && p.kind !== filter) return null;
          const img = portraitOf(p);
          const isOpen = open === p.id;
          return (
            <li key={p.id} className="rounded-2xl border border-sand-200 bg-ivory-50" data-testid={`row-person-${p.id}`}>
              <div className="flex items-center gap-3 p-3">
                <span className="grid h-14 w-12 shrink-0 place-items-center overflow-hidden rounded bg-lagoon-900">{img ? <img src={img.src} alt="" className="h-full w-full object-contain" loading="lazy" /> : <span className="text-[10px] text-gold-400">No image</span>}</span>
                <button type="button" onClick={() => setOpen(isOpen ? null : p.id)} aria-expanded={isOpen} className="flex min-h-11 min-w-0 flex-1 items-center gap-2 text-left" data-testid={`button-edit-person-${p.id}`}>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink-900">{p.name}</span>
                    <span className="block truncate text-xs text-ink-700">{KIND_LABEL[p.kind]}{p.kind === 'speaker' ? (p.confirmed ? ' · confirmed' : ' · not confirmed') : ''} · {p.videos.length} video(s)</span>
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${p.published ? 'bg-lagoon-900 text-gold-400' : 'bg-ivory-200 text-ink-800'}`}>{p.published ? 'Published' : 'Hidden'}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <OrderControls index={i} count={list.length} name={p.name} onMove={(to) => onChange(move(list, i, to))} onRemove={() => onChange(list.filter((x) => x.id !== p.id).map((x, k) => ({ ...x, order: k })))} />
              </div>
              {isOpen && (
                <div className="flex flex-col gap-4 border-t border-sand-200 p-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <Text label="Official name" value={p.name} onChange={(v) => set(p.id, { name: v })} max={150} testId={`input-person-name-${p.id}`} />
                    <Text label="Professional designation" value={p.designation} onChange={(v) => set(p.id, { designation: v })} max={200} testId={`input-person-designation-${p.id}`} />
                    <Field label="Role">
                      <select className={field} value={p.kind} onChange={(e) => set(p.id, { kind: e.target.value as ProgramPerson['kind'] })} data-testid={`select-person-kind-${p.id}`}>
                        {(['nominee', 'speaker', 'participant'] as const).map((k) => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}
                      </select>
                    </Field>
                    <Field label="Profile link (site path or https URL)" hint="For example /ambassadors/ciara">
                      <input className={field} maxLength={500} value={p.profileUrl ?? ''} onChange={(e) => set(p.id, { profileUrl: e.target.value.trim() ? e.target.value : null })} data-testid={`input-person-profile-${p.id}`} />
                    </Field>
                    <div className="md:col-span-2"><Text label="Biography (verified achievements and impact only)" value={p.biography} onChange={(v) => set(p.id, { biography: v })} max={3000} rows={4} testId={`input-person-bio-${p.id}`} /></div>
                  </div>
                  <div className="flex flex-wrap items-start gap-4">
                    <UploadButton kind="image" label={img ? 'Replace portrait / poster' : `Upload portrait / poster (${IMAGE_MB} MB)`} onUploaded={(id) => set(p.id, { portraitUploadId: id })} onBusy={onBusy} testId={`upload-portrait-${p.id}`} />
                    {p.portraitKey && <span className="text-xs text-ink-700">Existing official poster retained (read-only).</span>}
                    <div className="flex flex-col">
                      <Toggle label={p.kind === 'nominee' ? 'Nomination verified' : 'Confirmed by the Founder'} checked={p.confirmed} onChange={(b) => set(p.id, { confirmed: b })} testId={`toggle-person-confirmed-${p.id}`} />
                      <Toggle label="Published" checked={p.published} onChange={(b) => set(p.id, { published: b })} testId={`toggle-person-published-${p.id}`} />
                    </div>
                  </div>
                  {p.kind === 'speaker' && p.published && !p.confirmed && <p className="text-xs text-gold-700">Unconfirmed speakers are never shown publicly.</p>}
                  <div>
                    <p className="mb-2 text-xs font-semibold text-ink-800">Videos linked to {p.name}</p>
                    <VideoListEditor videos={p.videos} onChange={(v) => set(p.id, { videos: v })} onBusy={onBusy} scope={p.id} />
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
