import { useEffect, useRef, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, Trash2, Upload } from 'lucide-react';
import { useUploads, field, btnGhost } from '@/components/network/kit';
import { UPLOAD_LIMITS } from '@workspace/shared';

export const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp';
export const VIDEO_ACCEPT = 'video/mp4,video/webm,video/quicktime';
const MAX_IMG = UPLOAD_LIMITS.fileBytes;
export const IMAGE_MB = Math.round(UPLOAD_LIMITS.fileBytes / (1024 * 1024));
export const VIDEO_MB = Math.round(UPLOAD_LIMITS.videoBytes / (1024 * 1024));

export const newId = (p: string) => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-ink-800">{label}</span>
      {children}
      {hint && <span className="text-[11px] text-ink-700">{hint}</span>}
    </label>
  );
}

export function Text({ label, value, onChange, max, hint, rows, testId }: { label: string; value: string; onChange: (v: string) => void; max: number; hint?: string; rows?: number; testId: string }) {
  return (
    <Field label={`${label} (${value.length}/${max})`} hint={hint}>
      {rows ? <textarea className={`${field} min-h-24`} rows={rows} maxLength={max} value={value} onChange={(e) => onChange(e.target.value)} data-testid={testId} />
        : <input className={field} maxLength={max} value={value} onChange={(e) => onChange(e.target.value)} data-testid={testId} />}
    </Field>
  );
}

export function Toggle({ label, checked, onChange, testId }: { label: string; checked: boolean; onChange: (v: boolean) => void; testId: string }) {
  return (
    <label className="inline-flex min-h-11 items-center gap-2 text-sm text-ink-800">
      <input type="checkbox" className="h-4 w-4 accent-lagoon-700" checked={checked} onChange={(e) => onChange(e.target.checked)} data-testid={testId} />
      {label}
    </label>
  );
}

/** Order controls shared by people and videos lists. */
export function OrderControls({ index, count, onMove, onRemove, name }: { index: number; count: number; onMove: (to: number) => void; onRemove: () => void; name: string }) {
  const b = 'inline-flex h-10 w-10 items-center justify-center rounded-full border border-sand-300 text-ink-800 hover:border-lagoon-600 disabled:opacity-40';
  return (
    <span className="flex gap-1">
      <button type="button" className={b} disabled={index === 0} onClick={() => onMove(index - 1)} aria-label={`Move ${name} up`}><ArrowUp className="h-4 w-4" /></button>
      <button type="button" className={b} disabled={index === count - 1} onClick={() => onMove(index + 1)} aria-label={`Move ${name} down`}><ArrowDown className="h-4 w-4" /></button>
      <button type="button" className={`${b} text-crimson-700`} onClick={() => { if (window.confirm(`Remove ${name} from this draft? It stays live until you publish changes.`)) onRemove(); }} aria-label={`Remove ${name}`}><Trash2 className="h-4 w-4" /></button>
    </span>
  );
}

export function move<T extends { order: number }>(xs: T[], from: number, to: number): T[] {
  const next = [...xs];
  const [it] = next.splice(from, 1);
  next.splice(to, 0, it);
  return next.map((x, i) => ({ ...x, order: i }));
}

/**
 * Single authorised upload via the existing private network upload flow
 * (ticket, PUT, upload.complete ownership check). Reports the upload id once done.
 */
export function UploadButton({ kind, label, onUploaded, onBusy, testId }: { kind: 'image' | 'video'; label: string; onUploaded: (id: string) => void; onBusy?: (b: boolean) => void; testId: string }) {
  const u = useUploads(1);
  const ref = useRef<HTMLInputElement>(null);
  const cb = useRef(onUploaded); cb.current = onUploaded;
  const busyCb = useRef(onBusy); busyCb.current = onBusy;
  const done = u.ids[0];
  const wasBusy = useRef(false);
  useEffect(() => { if (done) { cb.current(done); } }, [done]);
  useEffect(() => {
    if (wasBusy.current === u.busy) return;
    wasBusy.current = u.busy;
    busyCb.current?.(u.busy);
  }, [u.busy]);
  useEffect(() => () => { if (wasBusy.current) busyCb.current?.(false); }, []);
  const item = u.items[0];
  return (
    <div className="flex flex-col gap-1.5">
      <input ref={ref} type="file" className="sr-only" accept={kind === 'image' ? IMAGE_ACCEPT : VIDEO_ACCEPT} tabIndex={-1}
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = '';
          if (!f) return;
          if (kind === 'image' && f.size > MAX_IMG) { window.alert(`Images must be ${IMAGE_MB} MB or less.`); return; }
          if (kind === 'video' && f.size > UPLOAD_LIMITS.videoBytes) { window.alert(`Videos must be ${VIDEO_MB} MB or less. The original file is never compressed.`); return; }
          u.clear(); u.add([f]);
        }} data-testid={`input-${testId}`} />
      <button type="button" className={btnGhost} onClick={() => ref.current?.click()} disabled={u.busy} data-testid={`button-${testId}`}>
        <Upload className="h-3.5 w-3.5" />{u.busy ? `Uploading ${item?.progress ?? 0}%` : label}
      </button>
      {item?.status === 'error' && <span role="alert" className="text-xs text-crimson-700">{item.error} <button type="button" className="underline" onClick={() => u.retry(item.key)}>Retry</button></span>}
      {item?.status === 'done' && <span className="text-xs text-lagoon-700">Uploaded privately. Save to attach it.</span>}
    </div>
  );
}
