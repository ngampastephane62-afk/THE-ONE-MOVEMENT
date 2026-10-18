import { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import { Pause, Play } from 'lucide-react';
import { SECTORS } from '@/lib/sectors-data';
import { PROGRAMS } from '@/lib/programs-data';
import { sectorDestination } from '@/components/ecosystem/sector-location';

const VALUES = ['Peace', 'Unity', 'Culture', 'Creativity', 'Diversity', 'Tolerance', 'Inclusion', 'Innovation', 'Opportunity', 'Humanitarian impact'];

function prefersReduced() {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

/**
 * MovementAtlas — an ILLUSTRATIVE (not geographic) composition of the
 * movement: values at the core, the 17 sectors on an orbit, six programmes
 * alongside it. No member locations or data are implied. Accessible sector
 * links open the selected existing explorer without changing member preferences.
 */
export default function MovementAtlas() {
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(prefersReduced);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(preference.matches);
    sync();
    preference.addEventListener('change', sync);
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting), { rootMargin: '80px' },
    );
    if (ref.current) observer?.observe(ref.current);
    if (!observer) setInView(true);
    return () => { preference.removeEventListener('change', sync); observer?.disconnect(); };
  }, []);
  const still = paused || reduced || !inView;
  return (
    <div ref={ref} className={`tomi-atlas ${still ? 'is-paused' : ''}`} data-testid="movement-atlas">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[10px] uppercase tracking-[0.22em] text-ivory-300">Illustrative composition · not a map of members</p>
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-pressed={paused || reduced}
          disabled={reduced}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-gold-500/40 px-4 text-xs text-ivory-100 hover:border-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 disabled:cursor-default disabled:opacity-80"
          data-testid="button-atlas-motion"
        >
          {paused || reduced ? <Play className="h-3.5 w-3.5" aria-hidden="true" /> : <Pause className="h-3.5 w-3.5" aria-hidden="true" />}
          {reduced ? 'Reduced motion enabled' : paused ? 'Play motion' : 'Pause motion'}
        </button>
      </div>

      <div className="tomi-atlas-stage" aria-hidden="true">
        <span className="tomi-atlas-ring r1" />
        <span className="tomi-atlas-ring r2" />
        <span className="tomi-atlas-ring r3" />
        <span className="tomi-atlas-core">ONE</span>
        <div className="tomi-atlas-spin">
          {SECTORS.map((s, i) => (
            <span key={s.slug} className="tomi-atlas-dot" style={{ transform: `rotate(${(360 / SECTORS.length) * i}deg) translateY(calc(var(--atlas-r) * -1))` }} />
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-12">
        <nav aria-label="The 17 sectors" className="lg:col-span-7">
          <p className="text-eyebrow text-gold-400">17 sectors · one ecosystem</p>
          <ol className="mt-4 grid grid-cols-1 gap-x-6 sm:grid-cols-2">
            {SECTORS.map((s, i) => (
              <li key={s.slug}>
                <Link href={sectorDestination(s.slug)} className="tomi-atlas-row group" data-testid={`link-atlas-sector-${s.slug}`}>
                  <span className="font-mono text-[10px] text-gold-500">{String(i + 1).padStart(2, '0')}</span>
                  <span className="font-display text-sm tracking-[0.12em] text-ivory-100 group-hover:text-gold-400">{s.name}</span>
                </Link>
              </li>
            ))}
          </ol>
        </nav>
        <div className="lg:col-span-5">
          <p className="text-eyebrow text-gold-400">Six official programmes</p>
          <ul className="mt-4">
            {PROGRAMS.map((p) => (
              <li key={p.slug}>
                <Link href={`/programs/${p.slug}`} className="tomi-atlas-row group" data-testid={`link-atlas-program-${p.slug}`}>
                  <span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-gold-500" aria-hidden="true" />
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ivory-100 group-hover:text-gold-400">{p.name}</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-eyebrow text-gold-400">What connects them</p>
          <p className="mt-3 font-display text-base leading-relaxed tracking-[0.08em] text-ivory-200">{VALUES.join(' · ')}</p>
        </div>
      </div>
    </div>
  );
}
