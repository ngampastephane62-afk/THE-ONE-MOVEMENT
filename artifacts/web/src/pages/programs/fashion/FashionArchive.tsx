import { useState } from 'react';
import ArchivePhoto, { archiveVideo } from '@/components/ArchivePhoto';
import ResponsiveMedia from '@/components/ResponsiveMedia';
import { MaskLine, Rise, useInView } from '@/components/programs/editorial/motion';

const FRAMES = [
  { id: 'runway-wide', label: 'Runway' },
  { id: 'audience', label: 'Audience' },
  { id: 'casting-group', label: 'Behind the scenes' },
  { id: 'casting-portrait', label: 'Casting' },
] as const;

/**
 * Historical highlights from the five completed editions (Bukavu, Goma, Kinshasa).
 * Clearly labelled as archive; never presented as the upcoming edition.
 */
export default function FashionArchive() {
  const [ref, shown] = useInView<HTMLElement>(0.15);
  const [i, setI] = useState(0);
  const reel = archiveVideo('fashion-archive');
  const f = FRAMES[i];
  return (
    <section ref={ref} id="archive" aria-labelledby="archive-h" className="scroll-mt-20 bg-ivory-100 py-section-lg" data-testid="section-fashion-archive">
      <div className="mx-auto max-w-7xl px-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-gold-600">Previous editions · archive</p>
        <h2 id="archive-h" className="mt-4 text-[clamp(2rem,6vw,4rem)] leading-[0.95] text-ink-900" style={{ fontFamily: 'var(--font-display)' }}>
          <MaskLine shown={shown}>FIVE EDITIONS.</MaskLine>
          <MaskLine shown={shown} delay={120}>ONE MEMORY.</MaskLine>
        </h2>
        <Rise shown={shown} delay={240} as="p" className="mt-5 max-w-2xl leading-relaxed text-ink-800">Authentic footage and photography from past editions in the Democratic Republic of Congo. These are records of what has happened, not images of the upcoming edition.</Rise>
        <Rise shown={shown} delay={340} className="mt-12 grid gap-8 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-7">
            <div key={f.id} className="motion-safe:animate-[tomiArchiveIn_700ms_cubic-bezier(0.19,1,0.22,1)_both]">
              <ArchivePhoto id={f.id} caption sizes="(min-width: 1024px) 55vw, 92vw" />
            </div>
            <div role="group" aria-label="Archive frames" className="mt-4 flex flex-wrap gap-2">
              {FRAMES.map((x, k) => (
                <button key={x.id} type="button" aria-pressed={k === i} onClick={() => setI(k)} className={`min-h-11 border px-4 text-xs uppercase tracking-[0.16em] ${k === i ? 'border-lagoon-900 bg-lagoon-900 text-ivory-100' : 'border-sand-300 text-ink-800 hover:border-lagoon-700'}`} data-testid={`button-archive-${x.id}`}>{x.label}</button>
              ))}
            </div>
          </div>
          <figure className="mx-auto w-full max-w-xs lg:col-span-4 lg:col-start-9">
            <ResponsiveMedia kind="vertical-reel" label={reel.title} purpose={reel.purpose} videoSrc={reel.videoSrc} videoFallbackSrc={reel.videoFallbackSrc} posterSrc={reel.posterSrc} assetId="FASHION-ARCHIVE-REEL" autoPlay={false} className="aspect-[9/16] w-full" />
            <figcaption className="mt-2 text-[11px] text-ink-700">Previous editions · archive · runway and performance · Founder archive</figcaption>
          </figure>
        </Rise>
      </div>
      <style>{'@keyframes tomiArchiveIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}'}</style>
    </section>
  );
}
