import { GeoBand, display } from './Pattern';

export default function GalaHero({ onRepresent }: { onRepresent: () => void }) {
  return (
    <section className="relative isolate flex min-h-[100dvh] items-end overflow-hidden bg-lagoon-900 text-ivory-100" aria-labelledby="gala-title">
      <img src="/brand-photos/founder/audience-800.webp" srcSet="/brand-photos/founder/audience-800.webp 800w, /brand-photos/founder/audience.webp 2000w" sizes="100vw" alt="" aria-hidden="true" fetchPriority="high" className="absolute inset-0 -z-20 h-full w-full object-cover motion-safe:animate-[galaZoom_18s_ease-out_both]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,hsl(187_67%_8%/0.55)_0%,hsl(187_67%_10%/0.35)_40%,hsl(187_67%_7%/0.96)_88%)]" />
      <style>{`@keyframes galaZoom{from{transform:scale(1.08)}to{transform:scale(1)}}@keyframes galaRise{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}`}</style>
      <div className="mx-auto w-full max-w-7xl px-6 pb-14 pt-32 md:pb-20">
        <p className="motion-safe:animate-[galaRise_.9s_ease-out_both] text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-gold-400">The One Movement International presents</p>
        <h1 id="gala-title" className="mt-5 text-[clamp(1.1rem,3vw,1.6rem)] tracking-[0.3em] text-ivory-200 motion-safe:animate-[galaRise_.9s_.1s_ease-out_both]" style={display}>THE ONE DIPLOMATIC GALA</h1>
        <p className="mt-4 max-w-5xl text-[clamp(2.3rem,8vw,6.2rem)] leading-[0.9] tracking-[-0.02em] motion-safe:animate-[galaRise_1s_.2s_ease-out_both]" style={display}>
          WHERE CULTURES MEET.<br /><span className="text-gold-400">WHERE DIALOGUE BEGINS.</span>
        </p>
        <GeoBand className="mt-8 max-w-xs" opacity={0.8} />
        <div className="mt-8 grid gap-6 md:grid-cols-12 md:items-end motion-safe:animate-[galaRise_1s_.35s_ease-out_both]">
          <div className="md:col-span-7">
            <p className="max-w-xl text-lg leading-relaxed text-ivory-100 md:text-xl">A cultural diplomacy initiative bringing together people, institutions and creative communities through dialogue, cultural expression and a shared commitment to peaceful coexistence.</p>
            <p className="mt-3 text-[11px] uppercase tracking-[0.28em] text-gold-400">Culture · Diplomacy · Dialogue · Peace · International connection</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:col-span-5 md:justify-end">
            <a href="#experience" data-testid="link-discover-experience" className="tomi-cta inline-flex min-h-12 items-center justify-center border border-gold-400 px-6 text-xs font-semibold tracking-[0.2em] text-gold-400 transition-colors hover:bg-gold-400 hover:text-ink-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400">DISCOVER THE EXPERIENCE</a>
            <a href="#represent-country" onClick={(e) => { e.preventDefault(); onRepresent(); }} data-testid="link-represent-country" className="tomi-cta inline-flex min-h-12 items-center justify-center bg-gold-500 px-6 text-xs font-semibold tracking-[0.2em] text-ink-900 transition-colors hover:bg-gold-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400">EXPRESS INTEREST</a>
          </div>
        </div>
        <a href="#everyday" className="mt-7 inline-flex min-h-11 items-center border-b border-gold-500 text-xs uppercase tracking-wider text-gold-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400">Explore culture, science & creation</a>
        <p className="mt-5 text-[11px] text-ivory-300">Audience at a previous TOMI event · Founder archive. Not a photograph of the upcoming Gala.</p>
      </div>
    </section>
  );
}
