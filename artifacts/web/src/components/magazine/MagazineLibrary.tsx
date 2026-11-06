import { useState } from 'react';
import { BookOpen, Eye, X } from 'lucide-react';
import { ART, COVERS } from './editorial-data';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import MediaActions from '@/components/editorial/MediaActions';
import { canonicalMediaSource } from '@/lib/media-share';

// Covers that open inside the real 13-page editorial selection, with their start page.
const IN_BOOK: Record<number, number> = { 12: 0, 14: 5, 13: 9 };

export default function MagazineLibrary({ onOpen }: { onOpen: (page: number) => void }) {
  const [preview, setPreview] = useState<(typeof COVERS)[number] | null>(null);
  return (
    <div data-testid="magazine-library">
      <div className="relative">
        <ul className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {COVERS.map((c, i) => {
            const start = IN_BOOK[c.n];
            const inBook = start !== undefined;
            return (
              <li key={c.n} className="group flex flex-col" data-testid={`shelf-cover-${c.n}`}>
                <button type="button" onClick={() => (inBook ? onOpen(start) : setPreview(c))}
                  className="relative block text-left outline-none [perspective:1200px] focus-visible:ring-2 focus-visible:ring-gold-400"
                  aria-label={inBook ? `Open the editorial selection at ${c.name}` : `Preview the cover featuring ${c.name}`} data-testid={`button-shelf-${c.n}`}>
                  <span className="relative block origin-left transition-transform duration-500 ease-out motion-safe:group-hover:[transform:rotateY(-14deg)]" style={{ transformStyle: 'preserve-3d' }}>
                    <img src={ART(c.n)} alt={`Tropik Magazine cover featuring ${c.name}`} loading={i < 4 ? 'eager' : 'lazy'} className="block h-auto w-full object-contain shadow-[6px_10px_24px_-8px_hsl(200_60%_5%/0.8)]" />
                    <span className="absolute inset-y-0 left-0 w-[5%] bg-gradient-to-r from-ink-900/50 via-ivory-50/15 to-transparent" aria-hidden="true" />
                    <span className="absolute inset-y-[1%] -right-[5px] w-[5px] bg-[repeating-linear-gradient(180deg,hsl(40_30%_92%)_0_1px,hsl(40_20%_78%)_1px_2px)]" aria-hidden="true" />
                  </span>
                  <span className={`absolute left-2 top-2 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] ${inBook ? 'bg-gold-500 text-ink-900' : 'bg-ink-900/80 text-ivory-100'}`}>{inBook ? 'Read inside' : 'Cover only'}</span>
                </button>
                <div className="mt-2 h-2 bg-[linear-gradient(180deg,hsl(30_25%_32%),hsl(30_25%_20%))] shadow-[0_8px_14px_-6px_hsl(0_0%_0%/0.7)]" aria-hidden="true" />
                <p className="mt-3 font-display text-lg leading-tight" translate="no">{c.name}</p>
                <p className="text-[10px] uppercase tracking-[0.22em] text-gold-400">{inBook ? `${c.note} · in the selection` : 'Cover preview · no issue online'}</p>
                <span className="mt-2 inline-flex items-center gap-1.5 text-xs text-ivory-200">{inBook ? <BookOpen className="h-3.5 w-3.5" aria-hidden="true" /> : <Eye className="h-3.5 w-3.5" aria-hidden="true" />}{inBook ? 'Open the book' : 'Inspect the cover'}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <Dialog open={!!preview} onOpenChange={(o) => { if (!o) setPreview(null); }}>
        <DialogContent className="max-h-[100dvh] max-w-[100vw] overflow-auto border-0 bg-ink-900/95 p-4 text-ivory-50 sm:max-w-[100vw] [&>button:last-child]:hidden" onEscapeKeyDown={(e) => e.stopPropagation()} data-testid="dialog-cover-preview">
          {preview && <div className="mx-auto grid max-w-5xl gap-8 py-6 md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] md:items-center">
            <img src={ART(preview.n)} alt={`Tropik Magazine cover featuring ${preview.name}`} className="mx-auto max-h-[80dvh] w-auto object-contain shadow-2xl" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-400">Cover preview</p>
              <DialogTitle className="mt-2 font-display text-4xl font-normal" translate="no">{preview.name}</DialogTitle>
              <DialogDescription className="mt-4 text-base leading-relaxed text-ivory-200">Only this cover was supplied. The full issue is not online and is not on sale here, so no article is shown with it.</DialogDescription>
              <div className="mt-5"><MediaActions source={canonicalMediaSource(ART(preview.n))} title={`Tropik Magazine cover · ${preview.name}`} tone="dark" compact /></div>
              <button type="button" autoFocus onClick={() => setPreview(null)} className="mt-6 inline-flex items-center gap-2 bg-ivory-50 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-900" data-testid="button-preview-close"><X className="h-4 w-4" aria-hidden="true" />Back to the library</button>
            </div>
          </div>}
        </DialogContent>
      </Dialog>
    </div>
  );
}
