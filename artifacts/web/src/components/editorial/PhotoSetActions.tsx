import { useState } from 'react';
import { cn } from '@/lib/utils';
import { canonicalMediaSource } from '@/lib/media-share';
import GalleryActions from './GalleryActions';

export type PhotoSetItem = { src: string; title: string };

/**
 * Reactions for a group of photos composed together (mosaics, stacked covers,
 * linked artwork). A labelled chooser selects the photo; the strip below is
 * that photo's own persisted engagement. Render it OUTSIDE any card link.
 */
export default function PhotoSetActions({ items, tone = 'light', label = 'Choose a photo to react to', className, onInteract }: {
  items: PhotoSetItem[]; tone?: 'light' | 'dark'; label?: string; className?: string; onInteract?: () => void;
}) {
  const [i, setI] = useState(0);
  if (!items.length) return null;
  const dark = tone === 'dark';
  const gallery = items.map((it) => ({ source: canonicalMediaSource(it.src), title: it.title }));
  return (
    <div className={cn('pt-3', className)} data-gallery-root onFocusCapture={onInteract} onPointerDownCapture={onInteract}>
      {items.length > 1 && (
        <div className="mb-3 flex flex-wrap items-center gap-1.5" role="group" aria-label={label}>
          {items.map((it, k) => (
            <button key={it.src} type="button" onClick={() => setI(k)} aria-pressed={i === k} aria-label={`Photo ${k + 1}: ${it.title}`}
              className={cn('h-8 min-w-8 rounded-full border px-2 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400',
                i === k ? (dark ? 'border-gold-400 bg-gold-400/15 text-gold-400' : 'border-lagoon-700 bg-lagoon-900 text-ivory-50')
                  : (dark ? 'border-ivory-100/30 text-ivory-200' : 'border-sand-300 text-ink-800'))}>
              {k + 1}
            </button>
          ))}
        </div>
      )}
      <GalleryActions items={gallery} index={i} onSelect={setI} onInteract={onInteract} tone={tone} />
    </div>
  );
}
