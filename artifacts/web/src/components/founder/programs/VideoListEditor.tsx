import { Plus } from 'lucide-react';
import type { ProgramVideo } from '@workspace/api-client-react';
import { btnGhost } from '@/components/network/kit';
import { OrderControls, Text, Toggle, UploadButton, VIDEO_MB, move, newId } from './fields';

/** Independently ordered approved videos (for a person or for the programme). */
export default function VideoListEditor({ videos, onChange, onBusy, scope, addLabel = 'Add video', newTitle = 'Untitled video' }: { videos: ProgramVideo[]; onChange: (v: ProgramVideo[]) => void; onBusy: (b: boolean) => void; scope: string; addLabel?: string; newTitle?: string }) {
  const list = [...videos].sort((a, b) => a.order - b.order);
  const set = (i: number, patch: Partial<ProgramVideo>) => onChange(list.map((v, k) => (k === i ? { ...v, ...patch } : v)));
  const add = () => onChange([...list, { id: newId('video'), title: newTitle, description: '', credit: '', uploadId: null, assetKey: null, url: null, published: false, rightsConfirmed: false, order: list.length }]);
  return (
    <div className="flex flex-col gap-3">
      {list.length === 0 && <p className="text-xs text-ink-700">No videos yet.</p>}
      {list.map((v, i) => (
        <div key={v.id} className="rounded-xl border border-sand-200 bg-ivory-100 p-3" data-testid={`editor-video-${v.id}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-ink-900">{String(i + 1).padStart(2, '0')} · {v.published ? 'Published' : 'Hidden'}{v.assetKey ? ' · existing approved asset' : ''}</span>
            <OrderControls index={i} count={list.length} name={v.title} onMove={(to) => onChange(move(list, i, to))} onRemove={() => onChange(list.filter((_, k) => k !== i).map((x, k) => ({ ...x, order: k })))} />
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <Text label="Video title" value={v.title} onChange={(t) => set(i, { title: t })} max={200} testId={`input-video-title-${v.id}`} />
            <Text label="Credit" value={v.credit} onChange={(t) => set(i, { credit: t })} max={300} testId={`input-video-credit-${v.id}`} />
            <div className="md:col-span-2"><Text label="Description" value={v.description} onChange={(t) => set(i, { description: t })} max={2000} rows={2} testId={`input-video-desc-${v.id}`} /></div>
          </div>
          <div className="mt-3 flex flex-wrap items-start gap-4">
            {v.url && <video src={v.url} controls preload="none" playsInline className="h-40 max-w-[16rem] bg-ink-900 object-contain" aria-label={`Preview ${v.title}`} />}
            <UploadButton kind="video" label={v.url || v.uploadId ? 'Replace video file' : `Upload video (${VIDEO_MB} MB max)`} onUploaded={(id) => set(i, { uploadId: id, assetKey: null, url: null, rightsConfirmed: false, published: false })} onBusy={onBusy} testId={`upload-video-${scope}-${v.id}`} />
            <div className="flex flex-col">
              <Toggle label="Rights confirmed" checked={v.rightsConfirmed} onChange={(b) => set(i, { rightsConfirmed: b })} testId={`toggle-video-rights-${v.id}`} />
              <Toggle label="Published" checked={v.published} onChange={(b) => set(i, { published: b })} testId={`toggle-video-published-${v.id}`} />
            </div>
          </div>
          {v.published && !v.rightsConfirmed && <p className="mt-2 text-xs text-gold-700">Confirm rights before publishing this video.</p>}
          {!v.url && !v.uploadId && !v.assetKey && <p className="mt-2 text-xs text-ink-700">No file yet. It will not appear publicly until a file is uploaded.</p>}
        </div>
      ))}
      <button type="button" className={`${btnGhost} self-start`} onClick={add} disabled={list.length >= 20} data-testid={`button-add-video-${scope}`}><Plus className="h-3.5 w-3.5" />{addLabel}</button>
    </div>
  );
}
