import { useState } from 'react';
import { Link } from 'wouter';
import { motion, useReducedMotion } from 'framer-motion';
import { ART, HERITAGE, KIT_PDF_URL } from './editorial-data';
import { SOCIAL } from './social-sources';
import PhotoSetActions from '@/components/editorial/PhotoSetActions';

export default function MagazineFeature() {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState(false);
  const [bad, setBad] = useState<string[]>([]);
  const ig = SOCIAL.find((c) => c.id === 'instagram' && c.url);
  const img = (src: string, alt: string, cls: string) => bad.includes(src) ? null : <img src={src} alt={alt} loading="lazy" onError={() => setBad((b) => [...b, src])} className={cls} />;
  return (
    <section className="relative overflow-hidden border-b border-sand-200 bg-lagoon-900 py-section-lg text-ivory-50" aria-labelledby="magazine-feature-heading" data-testid="section-magazine-feature">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_30%_50%,hsl(40_60%_70%/0.18),transparent_70%)]" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 md:grid-cols-12">
        <Link href="/tropik-magazine" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onFocus={() => setHover(true)} onBlur={() => setHover(false)}
          className="relative mx-auto block aspect-[1.25] w-full max-w-lg md:col-span-6" style={{ perspective: 1800 }} aria-label="Open the Tropik digital magazine" data-testid="link-magazine-open">
          <div className="absolute bottom-0 left-0 w-[42%] rotate-[-6deg]">{img(HERITAGE(2), 'Printed cover of The One Fashion Week magazine', 'h-auto w-full object-contain opacity-80 shadow-2xl')}</div>
          <div className="absolute right-[6%] top-[4%] w-[46%]" style={{ transformStyle: 'preserve-3d' }}>
            <div className="aspect-[4/5] w-full bg-[hsl(40_38%_95%)] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]">{img(ART(7), 'Tropik Magazine page: Her Story', 'h-full w-full object-contain')}</div>
            <motion.div className="absolute inset-0 origin-left" animate={reduce ? {} : { rotateY: hover ? -38 : -8 }} transition={{ duration: 0.9, ease: [0.65, 0.02, 0.25, 1] }} style={{ transformStyle: 'preserve-3d' }}>
              {img(ART(12), 'Tropik Magazine cover featuring Carine Nanikian', 'h-full w-full object-contain shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)]')}
            </motion.div>
          </div>
        </Link>
        <div className="md:col-span-6">
          <p className="text-eyebrow text-gold-400">TROPIK MAGAZINE · DIGITAL AND PRINT</p>
          <h2 id="magazine-feature-heading" className="mt-4 font-display text-4xl md:text-6xl">Open it. Leaf through it. Read it.</h2>
          <p className="mt-5 max-w-xl leading-relaxed text-ivory-200">An editorial selection to turn page by page — Carine Nanikian, Rozina Negusei, Reischca Kazumba — every story also readable in full. Plus the print heritage behind it and the free 2026 media kit.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/tropik-magazine" className="inline-flex items-center justify-center bg-gold-500 px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-ink-900 hover:bg-gold-400" data-testid="link-magazine-read">Open the magazine</Link>
            <a href={KIT_PDF_URL} download className="inline-flex items-center justify-center border border-ivory-50/30 px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] hover:border-gold-400" data-testid="link-magazine-kit">Media kit PDF · Free</a>
          </div>
          <p className="mt-5 text-sm text-ivory-300">Your story in the News, on Tropik social pages and in print: <Link href="/tropik-magazine/contribute" className="font-semibold text-gold-400 underline underline-offset-4" data-testid="link-magazine-contribute">propose an article</Link>.{ig && <> Follow <a href={ig.url!} target="_blank" rel="noreferrer noopener" className="underline underline-offset-4" translate="no" data-testid="link-magazine-instagram">{ig.handle}</a>.</>}</p>
          <div className="mt-8 border-t border-ivory-50/15 pt-2"><PhotoSetActions tone="dark" label="Choose a magazine page to react to" items={[
            { src: ART(12), title: 'Tropik Magazine cover · Carine Nanikian' },
            { src: ART(7), title: 'Tropik Magazine page · Her Story' },
            { src: HERITAGE(2), title: 'Printed cover of The One Fashion Week magazine' },
          ]} /></div>
        </div>
      </div>
    </section>
  );
}
