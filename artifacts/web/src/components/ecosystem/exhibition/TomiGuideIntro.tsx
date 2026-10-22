import type { CSSProperties } from 'react';
import { Compass } from 'lucide-react';
import { useStage } from './useStage';

function TomiSigil() {
  return (
    <svg viewBox="0 0 240 240" className="x-sigil" aria-hidden="true" focusable="false">
      <g className="ring-a">
        <circle cx="120" cy="120" r="104" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeDasharray="2 7" />
        {Array.from({ length: 17 }, (_, i) => { const a = (i / 17) * Math.PI * 2; return <circle key={i} cx={120 + Math.cos(a) * 104} cy={120 + Math.sin(a) * 104} r="2" fill="currentColor" opacity="0.7" />; })}
      </g>
      <g className="ring-b">
        <ellipse cx="120" cy="120" rx="76" ry="30" fill="none" stroke="currentColor" strokeOpacity="0.35" />
        <ellipse cx="120" cy="120" rx="30" ry="76" fill="none" stroke="currentColor" strokeOpacity="0.2" />
      </g>
      <circle cx="120" cy="120" r="52" fill="none" stroke="currentColor" strokeOpacity="0.5" />
      <g className="needle">
        <path d="M120 74 L126 120 L120 128 L114 120 Z" fill="currentColor" />
        <path d="M120 166 L124 120 L116 120 Z" fill="currentColor" opacity="0.3" />
      </g>
      <circle className="core" cx="120" cy="120" r="5" fill="hsl(38 57% 94%)" />
    </svg>
  );
}

/** TOMI introduced as the ecosystem's guide. Honest: guided navigation today, not an AI assistant. */
export default function TomiGuideIntro() {
  const { ref, attrs } = useStage<HTMLElement>();
  return (
    <section ref={ref} {...attrs} className="x-guide py-20 lg:py-28" aria-labelledby="meet-tomi-title" data-testid="section-meet-tomi">
      <div className="x-content mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-12">
        <div className="x-rise flex justify-center lg:col-span-5" style={{ '--d': '100ms' } as CSSProperties}><TomiSigil /></div>
        <div className="lg:col-span-7">
          <p className="x-track text-eyebrow text-gold-400">Chapter two · The navigator</p>
          <h2 id="meet-tomi-title" className="mt-4 text-display-lg text-ivory-100">
            <span className="x-line"><span style={{ '--d': '150ms' } as CSSProperties}>MEET TOMI.</span></span>
            <span className="x-line text-gold-400"><span style={{ '--d': '320ms' } as CSSProperties} className="text-display-md">YOUR GUIDE TO ONE CONNECTED WORLD.</span></span>
          </h2>
          <p className="x-fade mt-6 max-w-xl font-serif text-xl italic leading-relaxed text-ivory-200" style={{ '--d': '520ms', fontFamily: 'Georgia, serif' } as CSSProperties}>
            Discover the worlds, people, knowledge and opportunities that connect our global movement.
          </p>
          <p className="x-fade mt-4 max-w-xl text-sm leading-relaxed text-ivory-300" style={{ '--d': '680ms' } as CSSProperties}>
            Today TOMI is a guided path with fixed answers that lead to real pages on this site. It is not a live AI assistant yet, and it never invents results.
          </p>
          <a href="#discover" className="x-fade x-btn x-btn-ghost mt-8" style={{ '--d': '820ms' } as CSSProperties} data-testid="link-meet-tomi-discover">
            <Compass className="h-4 w-4" aria-hidden="true" /> Ask TOMI where to go
          </a>
        </div>
      </div>
    </section>
  );
}
