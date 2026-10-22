import * as DialogPrimitive from '@radix-ui/react-dialog';
import { ArrowLeft, ChevronLeft, ChevronRight, ExternalLink, X } from 'lucide-react';
import { PortraitActions, PortraitCredit } from '@/components/editorial/PersonPortrait';
import RulerPortrait from './RulerPortrait';
import { SEVEN_EMIRATES, emirateRuler, stepIndex, COUNCIL_SOURCE, PRESIDENT_SLUG, INTRO_SOURCE } from '@/lib/emirates-experience';
import { useEmiratesMotion, useSwipe } from './use-emirates-motion';

/**
 * Optional full-screen leadership explorer (Radix dialog: Escape closes, focus
 * returns to the opening button). One profile at a time, direct + prev/next + swipe.
 */
export default function LeadershipExplorer({ open, onOpenChange, index, onSelect }: { open: boolean; onOpenChange: (o: boolean) => void; index: number; onSelect: (i: number) => void }) {
  const e = SEVEN_EMIRATES[index]!;
  const { paused, toggle } = useEmiratesMotion();
  const ruler = emirateRuler(e);
  const prev = () => onSelect(stepIndex(index, -1));
  const next = () => onSelect(stepIndex(index, 1));
  const swipe = useSwipe(prev, next);
  const nameLines = ruler ? splitName(ruler.name) : [];
  const roles = ruler ? ruler.role.split(' · ') : [];

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-lagoon-900/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="em fixed inset-0 z-50 flex flex-col overflow-y-auto text-ivory-100 outline-none sm:inset-6 lg:inset-10"
          style={{ backgroundColor: `hsl(${e.hue} 45% 12%)`, transition: 'background-color 650ms cubic-bezier(.22,1,.36,1)' }}
          data-paused={paused ? 'true' : 'false'}
          onKeyDown={(k) => {
            const target = k.target as HTMLElement;
            if (target?.closest?.('input, textarea, select, [contenteditable="true"], [role="textbox"]')) return;
            if (k.key === 'ArrowLeft') { k.preventDefault(); prev(); }
            if (k.key === 'ArrowRight') { k.preventDefault(); next(); }
          }}
          data-testid="dialog-leadership-explorer"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,hsl(39_52%_54%/.12),transparent_60%)]" aria-hidden />
          <div className="relative flex items-center justify-between gap-4 border-b border-gold-500/25 px-5 py-3 sm:px-8">
            <DialogPrimitive.Close className="em-focus inline-flex min-h-11 items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-gold-400" data-testid="button-explorer-return"><ArrowLeft className="h-4 w-4" aria-hidden />Return to the campaign</DialogPrimitive.Close>
            <DialogPrimitive.Close className="em-focus grid h-11 w-11 place-items-center border border-gold-500/40" aria-label="Close leadership explorer" data-testid="button-explorer-close"><X className="h-5 w-5" /></DialogPrimitive.Close>
          </div>

          <div className="relative mx-auto grid w-full max-w-6xl flex-1 gap-8 px-5 py-8 sm:px-8 md:grid-cols-12 md:items-center" {...swipe} aria-live="polite">
            <div key={`p-${e.id}`} className="md:col-span-5">
              {ruler && <RulerPortrait slug={ruler.slug} name={ruler.name} box="h-[min(52dvh,26rem)] w-full" />}
            </div>
            <div key={`t-${e.id}`} className="md:col-span-7">
              <p className="text-eyebrow text-gold-400">{e.name.toUpperCase()} · <span lang="ar" dir="rtl" className="em-ar normal-case tracking-normal">{e.ar}</span></p>
              <DialogPrimitive.Title className="mt-4 font-display text-[clamp(2rem,5vw,3.75rem)] leading-[1.02]">
                {nameLines.map((l, i) => <span key={i} className="em-mask"><span className="em-intro-line block" style={{ ['--d' as string]: `${120 + i * 110}ms` }}>{l}</span></span>)}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description asChild>
                <ul className="mt-5 space-y-1">
                  {roles.map((r, i) => <li key={r} className="em-mask"><span className="em-swap-mask block text-sm uppercase tracking-[0.14em] text-gold-200" style={{ ['--d' as string]: `${120 + nameLines.length * 110 + 180 + i * 80}ms` }}>{r}</span></li>)}
                </ul>
              </DialogPrimitive.Description>
              {ruler?.slug === PRESIDENT_SLUG && <p className="em-swap-mask mt-4 inline-block border border-gold-500/50 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-gold-400" style={{ ['--d' as string]: '600ms' }}>President of the United Arab Emirates</p>}
              <p className="em-swap-mask mt-6 max-w-xl leading-relaxed text-ivory-200" style={{ ['--d' as string]: '650ms' }}>{e.intro}</p>
              <a href={INTRO_SOURCE.href} target="_blank" rel="noopener noreferrer" className="em-focus mt-3 flex min-h-11 items-center gap-1.5 text-xs text-gold-200 underline" data-testid="link-explorer-intro-source">Intro: {INTRO_SOURCE.label} <ExternalLink className="h-3 w-3" aria-hidden /></a>
              <a href={ruler?.source ?? COUNCIL_SOURCE} target="_blank" rel="noopener noreferrer" className="em-focus mt-5 inline-flex min-h-11 items-center gap-1.5 text-xs text-gold-200 underline" data-testid="link-explorer-source">Name and title · UAE Cabinet, Federal Supreme Council <ExternalLink className="h-3 w-3" aria-hidden /></a>
              {ruler && <div className="text-ivory-300 [&_details]:text-ivory-300"><PortraitCredit slug={ruler.slug} /><PortraitActions slug={ruler.slug} name={ruler.name} tone="dark" /></div>}
              <p className="mt-6 text-[11px] text-ivory-300/80">Portrait source shown in the photo credit; not all portraits are government images. Presented for information. No endorsement, sponsorship or partnership with TOMI is implied.</p>
            </div>
          </div>

          <nav className="relative border-t border-gold-500/25 px-3 py-3 sm:px-8" aria-label="Choose an emirate's ruler">
            <button type="button" onClick={toggle} aria-pressed={paused} className="em-focus mb-3 min-h-11 px-2 text-xs uppercase tracking-wider text-gold-400" data-testid="button-explorer-motion">{paused ? 'Play page motion' : 'Pause page motion'}</button>
            <div className="mx-auto flex max-w-6xl items-center gap-2">
              <button type="button" onClick={prev} className="em-focus grid h-11 w-11 shrink-0 place-items-center border border-gold-500/40" aria-label="Previous profile" data-testid="button-explorer-prev"><ChevronLeft className="h-5 w-5" /></button>
              <div className="em-noscroll flex flex-1 gap-1 overflow-x-auto">
                {SEVEN_EMIRATES.map((s, i) => (
                  <button key={s.id} type="button" onClick={() => onSelect(i)} aria-current={i === index ? 'true' : undefined}
                    className={`em-focus min-h-11 shrink-0 border-b-2 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] ${i === index ? 'border-gold-400 text-gold-400' : 'border-transparent text-ivory-300 hover:text-ivory-100'}`}
                    data-testid={`button-explorer-emirate-${s.id}`}>{s.name}</button>
                ))}
              </div>
              <button type="button" onClick={next} className="em-focus grid h-11 w-11 shrink-0 place-items-center border border-gold-500/40" aria-label="Next profile" data-testid="button-explorer-next"><ChevronRight className="h-5 w-5" /></button>
            </div>
          </nav>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/** Group a name into 2-3 readable lines at word boundaries (never letters). */
function splitName(name: string): string[] {
  const w = name.split(' ');
  if (w.length <= 2) return [name];
  const head = w[0] === 'Sheikh' ? (w[1] === 'Dr' ? 2 : 1) : 0;
  const first = w.slice(0, head + 1).join(' ');
  const rest = w.slice(head + 1);
  const mid = Math.ceil(rest.length / 2);
  return [first, rest.slice(0, mid).join(' '), rest.slice(mid).join(' ')].filter(Boolean);
}
