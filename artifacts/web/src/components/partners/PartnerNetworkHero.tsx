import NetworkMotif from './NetworkMotif';
import type { ContentForm } from '@/lib/partner-directory';

export default function PartnerNetworkHero({ c, count }: { c: ContentForm; count: number }) {
  return (
    <section className="pn-hero relative isolate overflow-hidden bg-lagoon-900 text-ivory-50" aria-labelledby="partners-hero-title" data-testid="section-partners-hero">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_70%_40%,hsl(165_55%_22%/0.55),transparent_60%),radial-gradient(ellipse_at_10%_90%,hsl(43_60%_40%/0.18),transparent_55%)]" />
      <NetworkMotif className="pointer-events-none absolute -right-[30%] top-1/2 -z-10 w-[130%] max-w-none -translate-y-1/2 opacity-80 sm:-right-[12%] sm:w-[85%] lg:-right-[4%] lg:w-[62%]" />
      <div className="pn-field pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40" aria-hidden="true" />
      <div className="mx-auto flex min-h-[86dvh] max-w-7xl flex-col justify-center px-6 py-28">
        <p className="pn-stage text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-400" style={{ animationDelay: '150ms' }}>The One Movement International · Partners</p>
        <h1 id="partners-hero-title" className="mt-6 max-w-4xl font-display leading-[0.95] tracking-[0.01em]">
          <span className="pn-mask block"><span className="pn-line block text-[clamp(2.6rem,8vw,6.4rem)]" style={{ animationDelay: '350ms' }} data-testid="text-hero-title">{c.heroTitle}</span></span>
          <span className="pn-mask mt-4 block"><span className="pn-line block text-[clamp(1.1rem,2.6vw,1.9rem)] tracking-[0.14em] text-[hsl(160_55%_68%)]" style={{ animationDelay: '800ms' }} data-testid="text-hero-line-one">{c.heroLineOne}</span></span>
          <span className="pn-mask block"><span className="pn-line block text-[clamp(1.1rem,2.6vw,1.9rem)] tracking-[0.14em] text-gold-400" style={{ animationDelay: '1050ms' }} data-testid="text-hero-line-two">{c.heroLineTwo}</span></span>
        </h1>
        <div className="pn-stage mt-8 h-px w-24 bg-gold-500" style={{ animationDelay: '1300ms' }} aria-hidden="true" />
        <p className="pn-stage mt-6 max-w-xl text-base leading-relaxed text-ivory-200 sm:text-lg" style={{ animationDelay: '1450ms' }} data-testid="text-hero-description">{c.heroDescription}</p>
        <div className="pn-stage mt-10 flex flex-wrap items-center gap-6" style={{ animationDelay: '1650ms' }}>
          <a href="#partner-gallery" className="inline-flex min-h-11 items-center rounded-full bg-gold-500 px-6 text-xs font-semibold uppercase tracking-[0.16em] text-ink-900 transition-colors hover:bg-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory-50 focus-visible:ring-offset-2 focus-visible:ring-offset-lagoon-900" data-testid="link-hero-explore">Explore the network</a>
          {count > 0 && <p className="text-xs uppercase tracking-[0.2em] text-ivory-300"><span className="font-display text-2xl text-ivory-50">{count}</span> organizations listed</p>}
        </div>
      </div>
    </section>
  );
}
