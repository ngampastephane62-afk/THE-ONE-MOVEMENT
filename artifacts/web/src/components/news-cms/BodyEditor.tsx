import { ArrowDown, ArrowUp, Heading, Image as ImageIcon, List, Pilcrow, Quote, Trash2 } from 'lucide-react';
import type { NewsBlock } from '@workspace/api-client-react';
import { emptyBlock, nn } from '@/lib/news-cms';
import { Field, ImageMeta, inputCls } from './fields';
import UploadButton from './MediaUpload';

const MAX = 150;

export default function BodyEditor({ blocks, onChange }: { blocks: NewsBlock[]; onChange: (b: NewsBlock[]) => void }) {
  const set = (i: number, b: NewsBlock) => onChange(blocks.map((x, k) => (k === i ? b : x)));
  const move = (i: number, d: -1 | 1) => { const j = i + d; if (j < 0 || j >= blocks.length) return; const n = [...blocks]; [n[i], n[j]] = [n[j], n[i]]; onChange(n); };
  const remove = (i: number) => onChange(blocks.filter((_, k) => k !== i));
  const add = (t: NewsBlock['type']) => { const b = emptyBlock(t); if (b) onChange([...blocks, b]); };
  const full = blocks.length >= MAX;

  return (
    <div className="flex flex-col gap-3">
      {blocks.length === 0 && <p className="rounded-xl border border-dashed border-sand-200 p-4 text-center text-sm text-ink-700">No blocks yet. Start with a paragraph.</p>}
      <ol className="flex flex-col gap-3">
        {blocks.map((b, i) => (
          <li key={i} className="rounded-xl border border-sand-200 bg-ivory-100/60 p-3" data-testid={`block-${i}`}>
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gold-700">{i + 1} · {b.type}</span>
              <div className="flex gap-1">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move block ${i + 1} up`} className="rounded-md p-1.5 text-ink-700 hover:bg-ivory-200 disabled:opacity-30" data-testid={`button-block-up-${i}`}><ArrowUp className="h-4 w-4" /></button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === blocks.length - 1} aria-label={`Move block ${i + 1} down`} className="rounded-md p-1.5 text-ink-700 hover:bg-ivory-200 disabled:opacity-30" data-testid={`button-block-down-${i}`}><ArrowDown className="h-4 w-4" /></button>
                <button type="button" onClick={() => remove(i)} aria-label={`Remove block ${i + 1}`} className="rounded-md p-1.5 text-ink-700 hover:bg-ivory-200 hover:text-crimson-700" data-testid={`button-block-remove-${i}`}><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            {b.type === 'paragraph' && <textarea className={`${inputCls} min-h-28`} aria-label={`Paragraph ${i + 1}`} value={b.text} onChange={(e) => set(i, { ...b, text: e.target.value })} data-testid={`input-block-text-${i}`} />}
            {b.type === 'heading' && (
              <div className="flex gap-2">
                <select className={`${inputCls} w-24`} aria-label="Heading level" value={b.level} onChange={(e) => set(i, { ...b, level: Number(e.target.value) as 2 | 3 })} data-testid={`select-block-level-${i}`}><option value={2}>H2</option><option value={3}>H3</option></select>
                <input className={inputCls} aria-label={`Heading ${i + 1}`} value={b.text} onChange={(e) => set(i, { ...b, text: e.target.value })} data-testid={`input-block-text-${i}`} />
              </div>
            )}
            {b.type === 'quote' && (
              <div className="flex flex-col gap-2">
                <textarea className={`${inputCls} min-h-20`} aria-label={`Quote ${i + 1}`} value={b.text} onChange={(e) => set(i, { ...b, text: e.target.value })} data-testid={`input-block-text-${i}`} />
                <input className={inputCls} placeholder="Attribution (optional)" maxLength={300} value={b.attribution ?? ''} onChange={(e) => set(i, { ...b, attribution: nn(e.target.value) })} data-testid={`input-block-attribution-${i}`} />
              </div>
            )}
            {b.type === 'list' && (
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-xs text-ink-800"><input type="checkbox" checked={b.ordered} onChange={(e) => set(i, { ...b, ordered: e.target.checked })} data-testid={`checkbox-block-ordered-${i}`} />Numbered list</label>
                {b.items.map((it, k) => (
                  <div key={k} className="flex gap-2">
                    <input className={inputCls} aria-label={`List item ${k + 1}`} value={it} onChange={(e) => set(i, { ...b, items: b.items.map((x, z) => (z === k ? e.target.value : x)) })} data-testid={`input-block-item-${i}-${k}`} />
                    <button type="button" aria-label="Remove item" disabled={b.items.length === 1} onClick={() => set(i, { ...b, items: b.items.filter((_, z) => z !== k) })} className="rounded-md p-2 text-ink-700 hover:text-crimson-700 disabled:opacity-30"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
                <button type="button" disabled={b.items.length >= 50} onClick={() => set(i, { ...b, items: [...b.items, ''] })} className="self-start text-xs font-semibold text-gold-700 hover:underline disabled:opacity-40" data-testid={`button-block-add-item-${i}`}>Add item</button>
              </div>
            )}
            {b.type === 'image' && (
              <div className="flex flex-col gap-2">
                <ImageMeta img={b} onChange={(img) => set(i, { ...b, ...img })} onRemove={() => remove(i)} testId={`block-${i}`} />
                <Field label="Caption"><input className={inputCls} maxLength={300} value={b.caption ?? ''} onChange={(e) => set(i, { ...b, caption: nn(e.target.value) })} data-testid={`input-block-caption-${i}`} /></Field>
              </div>
            )}
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap items-start gap-2 border-t border-sand-200 pt-3">
        {([['paragraph', Pilcrow, 'Paragraph'], ['heading', Heading, 'Heading'], ['quote', Quote, 'Quote'], ['list', List, 'List']] as const).map(([t, I, l]) => (
          <button key={t} type="button" disabled={full} onClick={() => add(t)} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-sand-200 bg-ivory-50 px-3 text-xs font-semibold text-ink-800 hover:border-gold-500 disabled:opacity-40" data-testid={`button-add-${t}`}><I className="h-3.5 w-3.5 text-gold-700" />{l}</button>
        ))}
        {!full && <span className="inline-flex items-center gap-1"><ImageIcon className="sr-only" /><UploadButton kind="image" label="Image block" testId="block-image" onUploaded={(id) => onChange([...blocks, { type: 'image', uploadId: id, alt: '', credit: null, caption: null }])} /></span>}
        {full && <p className="text-xs text-crimson-700">Maximum of {MAX} blocks reached.</p>}
      </div>
    </div>
  );
}
