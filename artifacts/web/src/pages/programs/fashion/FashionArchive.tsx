import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import catalog from '@/assets/media/founder/catalog.json';
import ArchivePhoto, { archiveVideo } from '@/components/ArchivePhoto';
import ResponsiveMedia from '@/components/ResponsiveMedia';
import SectionHeading from '@/components/SectionHeading';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Rise, useInView } from '@/components/programs/editorial/motion';

/** Founder-archive frames only (catalog.json). No invented editions or footage. */
const FRAMES = [
  { id: 'runway-wide', label: 'Runway' },
  { id: 'runway-edition-five', label: 'Edition five' },
  { id: 'runway-cultural', label: 'Cultural runway' },
  { id: 'runway-white', label: 'Runway portrait' },
  { id: 'audience', label: 'Audience' },
  { id: 'casting-group', label: 'Behind the scenes' },
  { id: 'casting-portrait', label: 'Casting' },
  { id: 'designer-portrait', label: 'Designer' },
] as const;

type FrameId = (typeof FRAMES)[number]['id'];

/**
 * OUR PREVIOUS EDITIONS — swipeable, ratio-preserving archive with a clean
 * fullscreen viewer. Records of past editions in the DRC, never the upcoming one.
 */
export default function FashionArchive() {
  const [ref, shown] = useInView<HTMLElement>(0.12);
  const track = useRef<HTMLDivElement>(null);
  const viewerTrigger = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const reel = archiveVideo('fashion-archive');

  const scrollBy = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: reduce ? 'auto' : 'smooth' });
  };
  const step = (dir: 1 | -1) => setOpen((v) => (v === null ? v : (v + dir + FRAMES.length) % FRAMES.length));
  const current: FrameId | null = open === null ? null : FRAMES[open].id;

  return (
    <section ref={ref} id="archive" aria-labelledby="archive-h" className="scroll-mt-20 overflow-x-clip bg-ivory-100 py-section-lg" data-testid="section-fashion-archive">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <SectionHeading id="archive-h" eyebrow="Previous editions · archive" heading={'OUR PREVIOUS\nEDITIONS.'} subheading="A decade of fashion, culture and connection. Authentic photography and footage from past editions in the Democratic Republic of Congo." thread />
          </div>
          <div className="flex gap-2 lg:col-span-4 lg:justify-end">
            <button type="button" onClick={() => scrollBy(-1)} aria-label="Previous photographs" className="tomi-cta grid h-12 w-12 place-items-center border border-lagoon-900 text-lagoon-900" data-testid="button-archive-prev"><ChevronLeft size={18} aria-hidden="true" /></button>
            <button type="button" onClick={() => scrollBy(1)} aria-label="Next photographs" className="tomi-cta grid h-12 w-12 place-items-center border border-lagoon-900 text-lagoon-900" data-testid="button-archive-next"><ChevronRight size={18} aria-hidden="true" /></button>
          </div>
        </div>
      </div>

      <Rise shown={shown} delay={300}>
        <div ref={track} className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-6 px-6 pb-4 [scrollbar-width:thin] lg:px-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))]" role="region" aria-label="Previous editions photographs, swipe to browse" tabIndex={0} data-testid="track-fashion-archive">
          {FRAMES.map((f, k) => {
            const p = catalog.photos[f.id];
            return (
              <div key={f.id} className="relative shrink-0 snap-start" style={{ height: 'min(62vh, 460px)', aspectRatio: `${p.width} / ${p.height}` }}>
                <ArchivePhoto id={f.id} actions={false} sizes="(min-width: 1024px) 40vw, 80vw" className="h-full" frameClassName="h-full" />
                <button type="button" onClick={(e) => { viewerTrigger.current = e.currentTarget; setOpen(k); }} className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-ink-900/70 via-transparent to-transparent p-3 text-left text-ivory-100 opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 md:opacity-0 md:transition-opacity md:hover:opacity-100 md:focus-visible:opacity-100" aria-label={`Open ${f.label} fullscreen`} data-testid={`button-archive-${f.id}`}>
                  <span className="text-[11px] uppercase tracking-[0.2em]">{f.label}</span>
                  <Maximize2 size={16} aria-hidden="true" />
                </button>
              </div>
            );
          })}
          <figure className="shrink-0 snap-start" style={{ height: 'min(62vh, 460px)', aspectRatio: '9 / 16' }}>
            <ResponsiveMedia kind="vertical-reel" label={reel.title} purpose={reel.purpose} videoSrc={reel.videoSrc} videoFallbackSrc={reel.videoFallbackSrc} posterSrc={reel.posterSrc} assetId="FASHION-ARCHIVE-REEL" autoPlay={false} className="h-full w-full" />
            <figcaption className="sr-only">Previous editions · runway and performance reel · Founder archive</figcaption>
          </figure>
        </div>
      </Rise>

      <Dialog open={open !== null} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-w-[min(96vw,1200px)] border-none bg-ink-900 p-3 sm:p-6" onCloseAutoFocus={(e) => { e.preventDefault(); viewerTrigger.current?.focus({ preventScroll: true }); }} onKeyDown={(e) => { if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1); }}>
          <DialogTitle className="sr-only">{open !== null ? FRAMES[open].label : 'Archive photograph'}</DialogTitle>
          {current && (
            <div className="flex flex-col items-center">
              <ArchivePhoto key={current} id={current} caption captionClassName="text-ivory-200" tone="dark" sizes="96vw" className="w-full [&_img]:mx-auto [&_img]:max-h-[78vh] [&_img]:w-auto [&_img]:max-w-full" />
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => step(-1)} aria-label="Previous photograph" className="tomi-cta grid h-11 w-11 place-items-center border border-gold-400/60 text-gold-400" data-testid="button-viewer-prev"><ChevronLeft size={18} aria-hidden="true" /></button>
                <button type="button" onClick={() => step(1)} aria-label="Next photograph" className="tomi-cta grid h-11 w-11 place-items-center border border-gold-400/60 text-gold-400" data-testid="button-viewer-next"><ChevronRight size={18} aria-hidden="true" /></button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
