import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import type { NewsImage } from '@workspace/api-client-react';
import { founderMediaUrl, nn } from '@/lib/news-cms';

export const inputCls = 'w-full rounded-lg border border-sand-200 bg-ivory-50 px-3 py-2 text-sm text-ink-900 placeholder:text-sand-400 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/30 disabled:bg-ivory-200 disabled:text-ink-700';

export function Field({ label, hint, count, max, children, htmlFor }: { label: string; hint?: string; count?: number; max?: number; children: ReactNode; htmlFor?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={htmlFor} className="text-xs font-semibold text-ink-800">{label}</label>
        {max != null && <span className={`text-[11px] tabular-nums ${count! > max ? 'text-crimson-700' : 'text-sand-400'}`}>{count}/{max}</span>}
      </div>
      {children}
      {hint && <p className="text-[11px] leading-relaxed text-sand-400">{hint}</p>}
    </div>
  );
}

export function Section({ title, children, id }: { title: string; children: ReactNode; id?: string }) {
  return (
    <section id={id} className="flex flex-col gap-4 rounded-2xl border border-sand-200 bg-ivory-50 p-4 sm:p-5">
      <h3 className="text-eyebrow text-gold-700">{title}</h3>
      {children}
    </section>
  );
}

export function ImageMeta({ img, onChange, onRemove, testId }: { img: NewsImage; onChange: (i: NewsImage) => void; onRemove: () => void; testId: string }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-sand-200 bg-ivory-100 p-3 sm:flex-row" data-testid={`media-${testId}`}>
      <img src={founderMediaUrl(img.uploadId)} alt="" className="h-28 w-full shrink-0 rounded-md bg-ivory-200 object-cover sm:w-36" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Field label="Alt text (required)" count={img.alt.length} max={300}>
          <input className={inputCls} value={img.alt} maxLength={300} onChange={(e) => onChange({ ...img, alt: e.target.value })} placeholder="Describe what the image shows" data-testid={`input-alt-${testId}`} />
        </Field>
        <Field label="Credit" count={(img.credit ?? '').length} max={200}>
          <input className={inputCls} value={img.credit ?? ''} maxLength={200} onChange={(e) => onChange({ ...img, credit: nn(e.target.value) })} placeholder="Photographer or source" data-testid={`input-credit-${testId}`} />
        </Field>
      </div>
      <button type="button" onClick={onRemove} aria-label="Remove image" className="self-start rounded-full p-2 text-ink-700 hover:bg-ivory-200 hover:text-crimson-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500" data-testid={`button-remove-${testId}`}><X className="h-4 w-4" /></button>
    </div>
  );
}

export function Confirm({ open, title, body, confirmLabel, tone = 'gold', busy, onConfirm, onCancel }: { open: boolean; title: string; body: ReactNode; confirmLabel: string; tone?: 'gold' | 'danger'; busy?: boolean; onConfirm: () => void; onCancel: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-lagoon-900/60 p-4 backdrop-blur-sm" onKeyDown={(e) => { if (e.key === 'Escape') onCancel(); }}>
      <div role="alertdialog" aria-modal="true" aria-labelledby="cms-confirm-title" className="founder-fade w-full max-w-md rounded-2xl border border-gold-500/40 bg-ivory-50 p-6 shadow-xl" data-testid="dialog-confirm">
        <h2 id="cms-confirm-title" className="font-display text-lg text-ink-900">{title}</h2>
        <div className="mt-3 text-sm leading-relaxed text-ink-700">{body}</div>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button type="button" autoFocus onClick={onCancel} className="min-h-10 rounded-full px-4 text-xs font-semibold text-ink-800 hover:bg-ivory-200" data-testid="button-confirm-cancel">Cancel</button>
          <button type="button" disabled={busy} onClick={onConfirm} className={`min-h-10 rounded-full px-5 text-xs font-semibold disabled:opacity-60 ${tone === 'danger' ? 'bg-crimson-700 text-ivory-50 hover:bg-crimson-800' : 'bg-lagoon-900 text-gold-400 hover:bg-lagoon-800'}`} data-testid="button-confirm-ok">{busy ? 'Working…' : confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
