import type { ReactNode } from 'react';
import type { ProgrammeTheme } from '@/lib/programme-editorial';
import { MaskLine, Rise, useInView } from './motion';

/** One numbered chapter of a programme page. Title lines mask-reveal in sequence. */
export default function Chapter({ id, n, eyebrow, title, lede, tone, theme, children, testId, narrow = false }: {
  id?: string; n: string; eyebrow: string; title: string[]; lede?: ReactNode; tone: 'night' | 'paper'; theme: ProgrammeTheme; children?: ReactNode; testId?: string; narrow?: boolean;
}) {
  const [ref, shown] = useInView<HTMLElement>(0.12);
  const dark = tone === 'night';
  const headingId = id ? `${id}-heading` : undefined;
  return (
    <section
      ref={ref}
      id={id}
      aria-labelledby={headingId}
      className="relative scroll-mt-20 overflow-hidden py-20 sm:py-28"
      style={{ backgroundColor: dark ? theme.night : theme.paper, color: dark ? 'hsl(40 40% 94%)' : theme.ink }}
      data-testid={testId}
    >
      <div className={`relative mx-auto px-5 sm:px-8 ${narrow ? 'max-w-4xl' : 'max-w-7xl'}`}>
        <div className="flex items-baseline gap-4">
          <span className="font-mono text-[11px] tracking-[0.3em]" style={{ color: theme.accent }} aria-hidden="true">{n}</span>
          <span className="h-px w-10 origin-left transition-transform duration-1000 motion-reduce:transition-none" style={{ backgroundColor: theme.accent, transform: shown ? 'scaleX(1)' : 'scaleX(0)' }} aria-hidden="true" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em]" style={{ color: dark ? theme.mist : theme.ink, opacity: dark ? 1 : 0.7 }}>{eyebrow}</p>
        </div>
        <h2 id={headingId} className="mt-6 text-[clamp(1.9rem,6.4vw,4rem)] leading-[0.98] tracking-[-0.01em]" style={{ fontFamily: 'var(--font-display)' }}>
          {title.map((line, i) => <MaskLine key={line} shown={shown} delay={i * 120}>{line}</MaskLine>)}
        </h2>
        {lede && <Rise shown={shown} delay={260} className="mt-6 max-w-2xl text-base leading-relaxed sm:text-lg" ><div style={{ color: dark ? theme.mist : undefined }}>{lede}</div></Rise>}
        {children && <Rise shown={shown} delay={360} className="mt-12">{children}</Rise>}
      </div>
    </section>
  );
}
