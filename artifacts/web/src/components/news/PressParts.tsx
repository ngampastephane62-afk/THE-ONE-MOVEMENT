import { useCallback, useEffect, useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';
import { assetUrl, initials } from '@/lib/press';
import { cn } from '@/lib/utils';

/** Publisher logo plate — ivory card so dark and light logos both read. */
export function PublisherMark({ outlet, logoUrl, size = 'md', className }: { outlet: string; logoUrl: string | null; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const [broken, setBroken] = useState(false);
  const dims = size === 'lg' ? 'h-24 w-40' : size === 'sm' ? 'h-12 w-20' : 'h-16 w-28';
  return (
    <span
      className={cn('relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-sm border border-gold-500/30 bg-ivory-50 p-2 shadow-[0_8px_24px_hsl(187_67%_4%/0.18)]', dims, className)}
      data-testid="img-publisher-logo"
    >
      {logoUrl && !broken ? (
        <img src={assetUrl(logoUrl)} alt={`${outlet} logo`} className="min-h-0 min-w-0 h-full w-full object-contain" onError={() => setBroken(true)} />
      ) : (
        <span aria-label={outlet} className="font-display text-lg tracking-[0.12em] text-lagoon-800">{initials(outlet)}</span>
      )}
    </span>
  );
}

/** Keyboard-friendly gallery dialog preserving the entire uncropped capture. */
export function EvidenceViewer({ images, outlet, title, index, onIndex, onClose }: {
  images: string[]; outlet: string; title: string; index: number | null; onIndex: (i: number) => void; onClose: () => void;
}) {
  const open = index !== null;
  const n = images.length;
  const go = useCallback((d: number) => { if (index !== null) onIndex((index + d + n) % n); }, [index, n, onIndex]);
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, go]);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[80] bg-[hsl(187_67%_5%/0.92)] backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed inset-0 z-[90] flex flex-col outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0"
          aria-describedby={undefined}
          data-testid="dialog-evidence"
        >
          <div className="flex items-start justify-between gap-4 border-b border-gold-500/20 px-4 py-3 sm:px-6">
            <div className="min-w-0">
              <DialogPrimitive.Title className="truncate text-sm font-semibold text-ivory-100">{outlet} — {title}</DialogPrimitive.Title>
              <p className="mt-0.5 text-xs text-ivory-300" aria-live="polite">
                Capture {index !== null ? index + 1 : 0} of {n} · one publication{n > 1 ? ', several screens' : ''}
              </p>
            </div>
            <DialogPrimitive.Close className="rounded-sharp p-2 text-ivory-200 hover:text-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400" aria-label="Close captures" data-testid="button-close-evidence">
              <X className="h-5 w-5" />
            </DialogPrimitive.Close>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 py-4 sm:px-16">
            {index !== null && (
              <img
                key={index}
                src={assetUrl(images[index])}
                alt={`${outlet} coverage, capture ${index + 1} of ${n}`}
                className="max-h-full max-w-full animate-fade-in object-contain shadow-2xl"
                data-testid="img-evidence-full"
              />
            )}
            {n > 1 && (
              <>
                <button type="button" onClick={() => go(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-gold-500/40 bg-lagoon-900/80 p-3 text-gold-400 hover:bg-lagoon-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400" aria-label="Previous capture" data-testid="button-evidence-prev"><ChevronLeft className="h-5 w-5" /></button>
                <button type="button" onClick={() => go(1)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-gold-500/40 bg-lagoon-900/80 p-3 text-gold-400 hover:bg-lagoon-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400" aria-label="Next capture" data-testid="button-evidence-next"><ChevronRight className="h-5 w-5" /></button>
              </>
            )}
          </div>
          {n > 1 && (
            <div className="flex gap-2 overflow-x-auto border-t border-gold-500/20 px-4 py-3 sm:justify-center" role="group" aria-label="Choose capture">
              {images.map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  onClick={() => onIndex(i)}
                  aria-label={`Show capture ${i + 1}`}
                  aria-current={i === index}
                  className={cn('h-16 w-12 shrink-0 overflow-hidden rounded-sharp border bg-ivory-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400', i === index ? 'border-gold-400 opacity-100' : 'border-transparent opacity-50 hover:opacity-90')}
                >
                  <img src={assetUrl(src)} alt="" className="h-full w-full object-contain" loading="lazy" />
                </button>
              ))}
            </div>
          )}
          <p className="px-4 pb-3 text-center text-[11px] text-ivory-300/80">Use the arrow keys to move between captures. Any social counts visible are a dated snapshot, not overall reach.</p>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/** Stacked preview: one publication, its screens fanned like clipped pages. */
export function CaptureStack({ images, outlet, onOpen, testId }: { images: string[]; outlet: string; onOpen: (i: number) => void; testId?: string }) {
  if (!images.length) return <p className="text-xs text-ivory-300">Captures not yet attached.</p>;
  const shown = images.slice(0, 3);
  return (
    <button
      type="button"
      onClick={() => onOpen(0)}
      className="group relative block h-56 w-full max-w-[15rem] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-4 focus-visible:ring-offset-lagoon-900"
      aria-label={`View ${images.length} captures of this ${outlet} publication`}
      data-testid={testId}
    >
      {shown.map((src, i) => (
        <span
          key={src + i}
          className="absolute inset-y-0 left-0 w-[11rem] overflow-hidden rounded-sharp border border-gold-500/30 bg-ivory-100 shadow-[0_14px_30px_hsl(187_67%_4%/0.35)] transition-transform duration-500 ease-out motion-reduce:transition-none"
          style={{ transform: `translateX(${i * 22}px) rotate(${(i - 1) * 3}deg)`, zIndex: 3 - i }}
        >
          {i === 0 && <img src={assetUrl(src)} alt="" className="h-full w-full object-contain" />}
        </span>
      ))}
      <span className="absolute bottom-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-lagoon-900/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gold-400 ring-1 ring-gold-500/40 transition-transform group-hover:-translate-y-0.5">
        <Maximize2 className="h-3 w-3" />{images.length} {images.length === 1 ? 'screen' : 'screens'}
      </span>
    </button>
  );
}
