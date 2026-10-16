import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { deepLinkedIndex, mediaAnchorId } from '@/lib/media-share';
import MediaActions from './MediaActions';

export type GalleryItem = { source: string; title: string };

/**
 * Reaction strip for the currently selected photo of a carousel/gallery.
 * Opening a ?media=<source> link selects that slide (via onSelect) and scrolls
 * the gallery into view. Each item keeps its own persisted engagement.
 */
export default function GalleryActions({ items, index, onSelect, onInteract, tone = 'light', className }: {
  items: (GalleryItem | null)[]; index: number; onSelect: (i: number) => void;
  /** Auto-advancing parents pass their pause/stop here. Called on any focus or pointer
   *  interaction with the strip and when a deep link selects a photo, so an open
   *  comment draft never unmounts or changes target because of autoplay. */
  onInteract?: () => void; tone?: 'light' | 'dark'; className?: string;
}) {
  const onInteractRef = useRef(onInteract);
  onInteractRef.current = onInteract;
  const interact = () => onInteractRef.current?.();
  const ref = useRef<HTMLDivElement>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const sourcesKey = items.map((i) => i?.source ?? '').join('|');
  useEffect(() => {
    const k = deepLinkedIndex(sourcesKey.split('|'));
    if (k < 0) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t = [60, 500].map((ms) => window.setTimeout(() => {
      onInteractRef.current?.();
      onSelectRef.current(k);
      ref.current?.closest('[data-gallery-root]')?.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
      if (ms === 60) ref.current?.focus({ preventScroll: true });
    }, ms));
    return () => t.forEach(clearTimeout);
  }, [sourcesKey]);
  const item = items[index];
  if (!item) return <div ref={ref} tabIndex={-1} className="outline-none" onFocusCapture={interact} onPointerDownCapture={interact} />;
  return (
    <div ref={ref} tabIndex={-1} id={mediaAnchorId(item.source)} className={cn('scroll-mt-28 outline-none', className)} aria-live="polite" onFocusCapture={interact} onPointerDownCapture={interact} onKeyDownCapture={interact}>
      <p className={cn('mb-2 text-[11px] uppercase tracking-[0.16em]', tone === 'dark' ? 'text-ivory-300' : 'text-ink-700')}>Reactions for photo {index + 1} of {items.length}</p>
      <MediaActions key={item.source} source={item.source} title={item.title} tone={tone} compact />
    </div>
  );
}
