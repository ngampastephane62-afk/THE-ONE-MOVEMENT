import { Link } from 'wouter';
import { EMIRATES_FORM_HREF } from '@/lib/emirates-experience';
import { useEmReveal } from './use-emirates-motion';

const STEPS = [
  { n: '01', t: 'Join the movement', d: 'Create or open your free TOMI member account. No payment at any step.' },
  { n: '02', t: 'Verify your email', d: 'Only verified accounts can enter the member network.' },
  { n: '03', t: 'Activate the network', d: 'An explicit choice that makes your name visible to signed-in members.' },
  { n: '04', t: 'Share your story', d: 'Accept the consent terms, then submit a written testimony, a short video with a caption, or both.' },
];

function Step({ s, i }: { s: (typeof STEPS)[number]; i: number }) {
  const r = useEmReveal<HTMLLIElement>();
  return (
    <li ref={r} className="relative pl-10 md:pl-0 md:pt-10" data-testid={`journey-step-${s.n}`}>
      <span className="absolute left-[15px] top-0 h-full w-px bg-gold-500/20 md:left-0 md:top-[15px] md:h-px md:w-full" aria-hidden />
      <span className="em-r-conn absolute left-[15px] top-0 h-full w-px bg-gold-400 md:left-0 md:top-[15px] md:h-px md:w-full" style={{ ['--d' as string]: `${i * 100}ms` }} aria-hidden />
      <span className="em-r-scale absolute left-0 top-0 grid h-8 w-8 place-items-center rounded-full border border-gold-400 bg-lagoon-900 font-mono text-[11px] text-gold-400" style={{ ['--d' as string]: `${i * 100 + 200}ms` }} aria-hidden>{s.n}</span>
      <div className="pb-8 md:pb-0 md:pr-6 md:pt-4">
        <p className="sr-only">Step {s.n}</p>
        <h3 className="em-mask font-display text-xl sm:text-2xl"><span className="em-r-line block" style={{ ['--d' as string]: `${i * 100 + 260}ms` }}>{s.t}</span></h3>
        <p className="em-r-fade mt-2 text-sm leading-relaxed text-ivory-300" style={{ ['--d' as string]: `${i * 100 + 360}ms` }}>{s.d}</p>
      </div>
    </li>
  );
}

/** Chapter 06 — four-step journey; connectors draw as each step enters. */
export default function JourneyChapter() {
  const r = useEmReveal<HTMLDivElement>();
  return (
    <section aria-labelledby="em-journey-h" className="bg-lagoon-800 py-section-lg text-ivory-100" id="em-participate">
      <div className="mx-auto max-w-6xl px-6">
        <div ref={r}>
          <p className="em-r-fade text-eyebrow text-gold-400">08 · PARTICIPATE · FREE</p>
          <h2 id="em-journey-h" className="mt-4 font-display text-[clamp(2rem,5vw,3.75rem)] leading-[1]">
            <span className="em-mask"><span className="em-r-line block">FOUR STEPS.</span></span>
            <span className="em-mask"><span className="em-r-line block text-gold-400" style={{ ['--d' as string]: '120ms' }}>NO PAYMENT.</span></span>
          </h2>
        </div>
        <ol className="mt-12 grid md:grid-cols-4">{STEPS.map((s, i) => <Step key={s.n} s={s} i={i} />)}</ol>
        <div className="mt-10 flex flex-wrap items-center gap-5">
          <Link href={EMIRATES_FORM_HREF} className="em-focus inline-flex min-h-12 items-center bg-gold-500 px-7 text-sm font-semibold tracking-[0.14em] text-ink-900 hover:bg-gold-400" data-testid="link-share-story-bottom">PARTICIPATE IN THANK YOU, EMIRATES</Link>
          <p className="max-w-md text-xs leading-relaxed text-ivory-300">The form checks each step and explains what is still needed. Stories are visible to signed-in members; they lead to no official or governmental award.</p>
        </div>
      </div>
    </section>
  );
}
