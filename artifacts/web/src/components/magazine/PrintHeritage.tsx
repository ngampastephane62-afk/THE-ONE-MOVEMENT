import { Link } from 'wouter';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import { HERITAGE, PRINT_READER } from './editorial-data';
import PhotoActions from '@/components/editorial/PhotoActions';


function Photo({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  const [ok, setOk] = useState(true);
  if (!ok) return <div className={`bg-ink-800 ${className}`} aria-hidden="true" />;
  return <img src={src} alt={alt} loading="lazy" onError={() => setOk(false)} className={`block h-auto w-full object-contain ${className}`} />;
}

export default function PrintHeritage() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y1 = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [60, -60]);
  const y2 = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-30, 40]);
  return (
    <section ref={ref} id="print" className="relative scroll-mt-20 overflow-hidden bg-ink-900 text-ivory-50" aria-labelledby="print-heading" data-testid="section-print-heritage">
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="text-eyebrow text-gold-400">IN PRINT</p>
            <h2 id="print-heading" className="mt-4 font-display text-[clamp(2.6rem,6vw,5rem)] leading-[0.9]">Paper you can <span className="italic text-gold-400">hold.</span></h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ivory-200">Before this selection went digital, the team behind Tropik printed The One Fashion Week magazine: heavy covers, full-bleed spreads, copies stacked for the runway and the hotel lobby.</p>
            <p className="mt-4 max-w-md leading-relaxed text-ivory-300">The printed Tropik Magazine follows the same craft. Accepted contributors may reserve one inside page.</p>
            <Link href="/tropik-magazine/contribute" className="mt-8 inline-flex items-center bg-gold-500 px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-ink-900 hover:bg-gold-400" data-testid="link-print-contribute">Propose an inside page · USD 200</Link>
            <p className="mt-3 text-xs text-ivory-300">Only after Founder acceptance and written edition conditions.</p>
          </div>
          <div className="relative grid grid-cols-6 gap-3 lg:col-span-7">
            <motion.figure style={{ y: y1 }} className="col-span-4">
              <Photo src={HERITAGE(3)} alt="A printed spread from The One Fashion Week magazine" />
              <figcaption className="mt-2 text-[10px] uppercase tracking-[0.22em] text-ivory-300">The One Fashion Week magazine · printed spread</figcaption>
              <PhotoActions source={HERITAGE(3)} title="The One Fashion Week magazine · printed spread" tone="dark" />
            </motion.figure>
            <motion.figure style={{ y: y2 }} className="col-span-2 self-end">
              <Photo src={HERITAGE(2)} alt="The printed cover of The One Fashion Week magazine on a glass table" />
              <figcaption className="mt-2 text-[10px] uppercase tracking-[0.22em] text-ivory-300">Printed cover</figcaption>
              <PhotoActions source={HERITAGE(2)} title="Printed cover" tone="dark" />
            </motion.figure>
            <figure className="col-span-3">
              <Photo src={HERITAGE(1)} alt="A reader holding a printed copy of The One Fashion Week magazine" />
              <figcaption className="mt-2 text-[10px] uppercase tracking-[0.22em] text-ivory-300">A reader with The One Fashion Week</figcaption>
              <PhotoActions source={HERITAGE(1)} title="A reader with The One Fashion Week" tone="dark" />
            </figure>
            <figure className="col-span-3 pt-10">
              <Photo src={HERITAGE(4)} alt="A stack of printed The One Fashion Week magazines" />
              <figcaption className="mt-2 text-[10px] uppercase tracking-[0.22em] text-ivory-300">The print run</figcaption>
              <PhotoActions source={HERITAGE(4)} title="The print run" tone="dark" />
            </figure>
          </div>
        </div>
        <figure className="mt-20 grid items-center gap-8 border-t border-ivory-50/10 pt-14 md:grid-cols-12">
          <div className="md:col-span-5"><Photo src={PRINT_READER} alt="Illustration of a reader holding a red Tropik Magazine cover" /><PhotoActions source={PRINT_READER} title="Illustration of a reader holding Tropik Magazine" tone="dark" /></div>
          <figcaption className="md:col-span-7">
            <p className="font-display text-[clamp(2rem,4.5vw,3.6rem)] italic leading-tight">A page that is read slowly, by someone who chose to pick it up.</p>
            <p className="mt-4 text-[10px] uppercase tracking-[0.25em] text-ivory-300">Tropik Magazine · visual</p>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
