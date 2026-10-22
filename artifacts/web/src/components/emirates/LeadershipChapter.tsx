import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import PersonPortrait, { PortraitCredit } from '@/components/editorial/PersonPortrait';
import { SEVEN_EMIRATES, president, COUNCIL_SOURCE } from '@/lib/emirates-experience';
import LeadershipExplorer from './LeadershipExplorer';
import { useEmReveal } from './use-emirates-motion';

/** Chapter 03 — compact President introduction; the seven rulers are explored on request. */
export default function LeadershipChapter({ index, onSelect }: { index: number; onSelect: (i: number) => void }) {
  const reveal = useEmReveal<HTMLElement>();
  const [open, setOpen] = useState(false);
  const p = president();
  const openAt = (i: number) => { onSelect(i); setOpen(true); };

  return (
    <section ref={reveal} aria-labelledby="em-lead-h" className="relative overflow-hidden bg-lagoon-900 py-section-lg text-ivory-100">
      <div className="em-lattice pointer-events-none absolute inset-0 opacity-60" aria-hidden />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-12 md:items-center">
        <div className="md:col-span-4">
          {p && <PersonPortrait slug={p.slug} name={p.name} contain className="em-r-media aspect-[4/5] w-full max-w-[18rem] overflow-hidden bg-lagoon-800" />}
          {p && <div className="text-ivory-300"><PortraitCredit slug={p.slug} /></div>}
        </div>
        <div className="md:col-span-8">
          <p className="em-r-fade text-eyebrow text-gold-400">03 · UAE LEADERSHIP</p>
          <h2 id="em-lead-h" className="mt-4 font-display text-[clamp(2rem,5vw,3.75rem)] leading-[1]">
            <span className="em-mask"><span className="em-r-line block">THE LEADERSHIP</span></span>
            <span className="em-mask"><span className="em-r-line block text-gold-400" style={{ ['--d' as string]: '120ms' }}>OF THE EMIRATES.</span></span>
          </h2>
          {p && <>
            <p className="em-r-x mt-8 text-eyebrow text-gold-200" style={{ ['--d' as string]: '240ms' }}>PRESIDENT OF THE UNITED ARAB EMIRATES</p>
            <p className="em-r-x mt-2 font-display text-2xl sm:text-3xl" style={{ ['--d' as string]: '320ms' }} data-testid="text-president-name">{p.name}</p>
            <p className="em-r-x mt-1 text-sm text-ivory-300" style={{ ['--d' as string]: '400ms' }}>{p.role}</p>
            <a href={p.source || COUNCIL_SOURCE} target="_blank" rel="noopener noreferrer" className="em-focus mt-3 inline-block text-xs text-gold-200 underline" data-testid="link-president-source">UAE Cabinet · Federal Supreme Council</a>
          </>}
          <div className="em-r-fade mt-8 flex flex-wrap items-center gap-4" style={{ ['--d' as string]: '480ms' }}>
            <button type="button" onClick={() => setOpen(true)} className="em-focus inline-flex min-h-12 items-center gap-2 bg-gold-500 px-6 text-sm font-semibold tracking-[0.14em] text-ink-900 hover:bg-gold-400" data-testid="button-explore-leadership">EXPLORE UAE LEADERSHIP <ArrowUpRight className="h-4 w-4" aria-hidden /></button>
            <p className="text-xs text-ivory-300">Optional · the seven rulers, one profile at a time.</p>
          </div>
          <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-1" aria-label="Open a ruler's profile">
            {SEVEN_EMIRATES.map((s, i) => <li key={s.id}><button type="button" onClick={() => openAt(i)} className="em-focus min-h-11 text-xs uppercase tracking-[0.16em] text-ivory-300 underline-offset-4 hover:text-gold-400 hover:underline" data-testid={`button-open-ruler-${s.id}`}>{s.name}</button></li>)}
          </ul>
          <p className="mt-6 max-w-xl text-[11px] text-ivory-300/80">Names and titles as listed by the UAE Cabinet. Presented for information; no endorsement of TOMI or this campaign is implied.</p>
        </div>
      </div>
      <LeadershipExplorer open={open} onOpenChange={setOpen} index={index} onSelect={onSelect} />
    </section>
  );
}
