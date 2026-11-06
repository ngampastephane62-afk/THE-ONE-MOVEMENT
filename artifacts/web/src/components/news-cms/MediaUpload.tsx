import { createContext, useContext, useRef, useState } from 'react';
import { Loader2, Upload } from 'lucide-react';
import { useCompleteFounderNewsUpload, useRequestFounderNewsUpload, type NewsUploadInputContentType } from '@workspace/api-client-react';
import { IMAGE_MAX, IMAGE_TYPES, VIDEO_MAX, VIDEO_TYPES, errMsg } from '@/lib/news-cms';

export type MediaKind = 'image' | 'video';

/** Lets the owning editor know when uploads are in flight so it can block save/switching. */
export const UploadTracker = createContext<(delta: 1 | -1) => void>(() => undefined);

export function useNewsUpload() {
  const request = useRequestFounderNewsUpload();
  const complete = useCompleteFounderNewsUpload();
  return async (file: File, kind: MediaKind): Promise<string> => {
    const types: readonly string[] = kind === 'image' ? IMAGE_TYPES : VIDEO_TYPES;
    const max = kind === 'image' ? IMAGE_MAX : VIDEO_MAX;
    if (!types.includes(file.type)) throw new Error(kind === 'image' ? 'Use a JPEG, PNG, WebP or GIF image.' : 'Use an MP4, WebM or QuickTime video.');
    if (file.size > max) throw new Error(`This file is larger than ${Math.round(max / (1024 * 1024))} MiB.`);
    let ticket;
    try { ticket = await request.mutateAsync({ data: { filename: file.name.slice(0, 200) || 'upload', contentType: file.type as NewsUploadInputContentType, size: file.size } }); }
    catch (e) { throw new Error(errMsg(e, 'The upload could not be prepared.')); }
    const put = await fetch(ticket.uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file }).catch(() => null);
    if (!put || !put.ok) throw new Error('The file transfer failed. Check your connection and try again.');
    try { const done = await complete.mutateAsync({ uploadId: ticket.id }); return done.id; }
    catch (e) { throw new Error(errMsg(e, 'The upload could not be confirmed.')); }
  };
}

export default function UploadButton({ kind, label, onUploaded, testId }: { kind: MediaKind; label: string; onUploaded: (id: string) => void; testId: string }) {
  const upload = useNewsUpload();
  const track = useContext(UploadTracker);
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const pick = async (f: File | undefined) => {
    if (!f) return;
    setErr(''); setBusy(true); track(1);
    try { onUploaded(await upload(f, kind)); }
    catch (e) { setErr((e as Error).message); }
    finally { setBusy(false); track(-1); if (ref.current) ref.current.value = ''; }
  };
  return (
    <div>
      <input ref={ref} type="file" className="sr-only" tabIndex={-1} accept={(kind === 'image' ? IMAGE_TYPES : VIDEO_TYPES).join(',')} onChange={(e) => pick(e.target.files?.[0])} data-testid={`input-file-${testId}`} />
      <button type="button" disabled={busy} onClick={() => ref.current?.click()} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-dashed border-gold-500/60 bg-ivory-50 px-3 text-xs font-semibold text-lagoon-900 hover:border-gold-500 hover:bg-ivory-100 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500" data-testid={`button-upload-${testId}`}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" /> : <Upload className="h-4 w-4" />}{busy ? 'Uploading…' : label}
      </button>
      <p className="mt-1 text-[11px] text-sand-400">{kind === 'image' ? 'JPEG, PNG, WebP or GIF · max 20 MiB' : 'MP4, WebM or QuickTime · max 100 MiB'}</p>
      {err && <p role="alert" className="mt-1 text-xs text-crimson-700" data-testid={`error-upload-${testId}`}>{err}</p>}
    </div>
  );
}
