import { Link } from 'wouter';
import { EMIRATES_FORM_HREF } from '@/lib/emirates-experience';
import { useEmReveal } from './use-emirates-motion';

/** Chapter 05 — honest statement: Emirates stories reach the member network only; none are shown publicly here. */
export default function HumanStoryChapter() {
  const r = useEmReveal<HTMLElement>();
  return (
    <section ref={r} aria-labelledby="em-human-h" className="relative overflow-hidden bg-lagoon-900 py-section-xl text-center text-ivory-100">
      <div className="em-r-wide em-lattice absolute inset-x-6 inset-y-10 border border-gold-500/25 sm:inset-x-16" aria-hidden />
      <div className="relative mx-auto max-w-3xl px-6">
        <p className="em-r-fade text-eyebrow text-gold-400">07 · THE HUMAN STORY</p>
        <h2 id="em-human-h" className="mt-6 font-display text-[clamp(2.2rem,6vw,4.5rem)] leading-[0.98]">
          <span className="em-mask"><span className="em-r-line block" style={{ ['--d' as string]: '120ms' }}>EVERY PERSON</span></span>
          <span className="em-mask"><span className="em-r-line block" style={{ ['--d' as string]: '240ms' }}>HAS A STORY.</span></span>
        </h2>
        <p className="em-mask mt-4"><span className="em-r-line block font-display text-lg tracking-[0.18em] text-gold-400 sm:text-xl" style={{ ['--d' as string]: '380ms' }}>EVERY STORY DESERVES TO BE HEARD.</span></p>
        <p className="em-r-fade mx-auto mt-8 max-w-xl leading-relaxed text-ivory-200" style={{ ['--d' as string]: '520ms' }}>Citizens, residents and people anywhere in the world can share an authentic account of what the Emirates has meant to them, in their own words and their own language. TOMI does not write on anyone's behalf.</p>
        <div className="em-r-scale mx-auto mt-8 max-w-xl border border-gold-500/40 bg-lagoon-800/70 p-5 text-left text-sm leading-relaxed text-ivory-200" style={{ ['--d' as string]: '640ms' }} data-testid="text-human-boundary">
          <p className="text-eyebrow text-gold-400">WHO SEES YOUR STORY</p>
          <p className="mt-2">Stories submitted here are shared with the TOMI member network and are visible to signed-in members only. There is no public gallery of Emirates stories yet, so none are shown on this page. Nothing is sent to any broadcaster or authority.</p>
        </div>
        <Link href={EMIRATES_FORM_HREF} className="em-focus em-r-fade mt-8 inline-flex min-h-12 items-center bg-gold-500 px-7 text-sm font-semibold tracking-[0.14em] text-ink-900 hover:bg-gold-400" style={{ ['--d' as string]: '760ms' }} data-testid="link-human-share">SHARE YOUR STORY</Link>
      </div>
    </section>
  );
}
