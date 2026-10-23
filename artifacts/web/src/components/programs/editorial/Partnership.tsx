import { Link } from 'wouter';
import { ArrowUpRight } from 'lucide-react';
import { PARTNERSHIP_COPY, inquiryHref, type ProgrammeTheme } from '@/lib/programme-editorial';
import { MaskLine, Rise, useInView } from './motion';

/** PARTNER WITH THE MOVEMENT — three inquiry paths, all tagged with the programme. */
export default function Partnership({ programme, programmeName, theme, n = '08' }: { programme: string; programmeName: string; theme: ProgrammeTheme; n?: string }) {
  const [ref, shown] = useInView<HTMLElement>(0.2);
  const links = [
    { k: 'partner' as const, label: 'BECOME A PARTNER' },
    { k: 'sponsor' as const, label: 'SPONSORSHIP INQUIRY' },
    { k: 'media' as const, label: 'MEDIA COLLABORATION' },
  ];
  return (
    <section ref={ref} id="partner" aria-labelledby="partner-heading" className="relative overflow-hidden py-20 sm:py-28" style={{ backgroundColor: theme.nightSoft, color: 'hsl(40 40% 94%)' }} data-testid="section-partnership">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-1/2 h-[28rem] w-[28rem] -translate-y-1/2 rounded-full opacity-[0.12]" style={{ border: `1px solid ${theme.accent}` }} />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <p className="font-mono text-[11px] tracking-[0.3em]" style={{ color: theme.accent }}>{n} · {programmeName}</p>
          <h2 id="partner-heading" className="mt-5 text-[clamp(1.9rem,6vw,3.75rem)] leading-[0.98]" style={{ fontFamily: 'var(--font-display)' }}>
            <MaskLine shown={shown}>PARTNER WITH</MaskLine>
            <MaskLine shown={shown} delay={120}><span style={{ color: theme.accent }}>THE MOVEMENT.</span></MaskLine>
          </h2>
          <Rise shown={shown} delay={240} as="p" className="mt-6 max-w-xl text-base leading-relaxed sm:text-lg"><span style={{ color: theme.mist }}>{PARTNERSHIP_COPY.body}</span></Rise>
        </div>
        <Rise shown={shown} delay={320} className="flex flex-col gap-3 lg:col-span-5">
          {links.map((l, i) => (
            <Link key={l.k} href={inquiryHref.partnership(programme, l.k)}
              className="group flex min-h-14 items-center justify-between gap-3 border px-5 text-xs font-semibold tracking-[0.2em] transition-colors focus-visible:outline-none focus-visible:ring-2"
              style={i === 0 ? { backgroundColor: theme.accent, borderColor: theme.accent, color: theme.night } : { borderColor: 'hsl(40 40% 94% / 0.3)' }}
              data-testid={`link-partnership-${l.k}`}>
              {l.label}
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
            </Link>
          ))}
          <p className="mt-2 text-xs leading-relaxed" style={{ color: theme.mist }}>{PARTNERSHIP_COPY.guard}</p>
        </Rise>
      </div>
    </section>
  );
}
