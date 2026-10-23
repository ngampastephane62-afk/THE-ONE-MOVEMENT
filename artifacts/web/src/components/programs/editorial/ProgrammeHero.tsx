import { useEffect, useState, type ReactNode } from 'react';
import type { ProgrammeTheme } from '@/lib/programme-editorial';
import { Curtain, MaskLine, Rise, useParallax } from './motion';

/**
 * Cinematic programme opening. Title lines mask-rise while a curtain uncovers the media,
 * then the media drifts against the scroll. Media never sits behind body text.
 */
export default function ProgrammeHero({ theme, eyebrow, title, secondary, statement, media, actions, motif }: {
  theme: ProgrammeTheme; eyebrow: string; title: string[]; secondary?: string[]; statement: string; media: ReactNode; actions?: ReactNode; motif?: ReactNode;
}) {
  const [shown, setShown] = useState(false);
  useEffect(() => { const t = requestAnimationFrame(() => setShown(true)); return () => cancelAnimationFrame(t); }, []);
  const [mediaRef, y] = useParallax<HTMLDivElement>(0.06);
  const base = title.length * 140;
  return (
    <header className="relative isolate overflow-hidden" style={{ backgroundColor: theme.night, color: 'hsl(40 40% 94%)' }} data-testid="section-programme-hero">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10" style={{ background: `radial-gradient(70% 55% at 78% 35%, ${theme.accent.replace(')', ' / 0.16)')}, transparent 70%), linear-gradient(180deg, transparent 60%, ${theme.nightSoft})` }} />
      {motif}
      <div className="mx-auto grid min-h-[calc(100dvh-4rem)] max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-12 lg:py-20">
        <div className="lg:col-span-7">
          <Rise shown={shown} as="p" className="text-[10px] font-semibold uppercase tracking-[0.32em]"><span style={{ color: theme.accent }}>{eyebrow}</span></Rise>
          <h1 className="mt-6 text-[clamp(2.6rem,11vw,6.5rem)] leading-[0.9] tracking-[-0.02em]" style={{ fontFamily: 'var(--font-display)' }}>
            {title.map((l, i) => <MaskLine key={l} shown={shown} delay={120 + i * 140}>{l}</MaskLine>)}
          </h1>
          {secondary && (
            <p className="mt-7 text-sm font-semibold tracking-[0.28em] sm:text-base" style={{ color: theme.accent }}>
              {secondary.map((l, i) => <MaskLine key={l} shown={shown} delay={base + 160 + i * 110}>{l}</MaskLine>)}
            </p>
          )}
          <Rise shown={shown} delay={base + 420} as="p" className="mt-7 max-w-xl text-base leading-relaxed sm:text-lg"><span style={{ color: theme.mist }}>{statement}</span></Rise>
          {actions && <Rise shown={shown} delay={base + 560} className="mt-9 flex flex-wrap gap-3">{actions}</Rise>}
        </div>
        <div ref={mediaRef} className="lg:col-span-5">
          <div className="relative mx-auto w-full max-w-sm will-change-transform lg:max-w-none" style={{ transform: `translate3d(0, ${y}px, 0)` }}>
            <div className="relative overflow-hidden">
              <Curtain shown={shown} delay={480} color={theme.accent} />
              <Curtain shown={shown} delay={240} color={theme.night} />
              {media}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
