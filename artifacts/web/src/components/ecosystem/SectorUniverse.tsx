import { useState } from 'react';
import { Link } from 'wouter';
import { Show, useAuth } from '@clerk/react';
import { ArrowRight, Lightbulb } from 'lucide-react';
import { SECTORS } from '@/lib/sectors-data';
import { storePendingSector } from '@/lib/network-invitations';
import { SECTOR_ICONS } from './SectorEmblem';

interface Props {
  selected: string;
  onPick: (slug: string) => void;
}

/**
 * Interactive map of all seventeen sectors arranged on one shared orbit.
 * Each node is a real button: choosing one selects it in the explorer below
 * and offers the existing member-space flow with that sector pre-noted.
 */
export default function SectorUniverse({ selected, onPick }: Props) {
  const { userId } = useAuth();
  const [hover, setHover] = useState<string | null>(null);
  const focusSlug = hover ?? selected;
  const active = SECTORS.find((s) => s.slug === focusSlug) ?? SECTORS[0];
  const n = SECTORS.length;

  const explore = (slug: string) => {
    onPick(slug);
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    document.getElementById('explore')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  };

  return (
    <figure className="relative" aria-labelledby="sector-universe-caption">
      <div className="eco-universe relative mx-auto aspect-square w-full max-w-[34rem]">
        <div className="eco-universe-ring eco-universe-ring-outer" aria-hidden="true" />
        <div className="eco-universe-ring eco-universe-ring-inner" aria-hidden="true" />
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" aria-hidden="true">
          {SECTORS.map((s, i) => {
            const a = (i / n) * Math.PI * 2 - Math.PI / 2;
            const on = s.slug === focusSlug;
            return (
              <line
                key={s.slug}
                x1={50} y1={50}
                x2={50 + Math.cos(a) * 41} y2={50 + Math.sin(a) * 41}
                stroke={on ? 'hsl(43 80% 73% / 0.75)' : 'hsl(43 80% 73% / 0.08)'}
                strokeWidth={on ? 0.35 : 0.2}
                style={{ transition: 'stroke 400ms ease' }}
              />
            );
          })}
        </svg>

        <div className="absolute left-1/2 top-1/2 z-10 w-[46%] -translate-x-1/2 -translate-y-1/2 text-center" aria-live="polite">
          <p className="text-[9px] uppercase tracking-[0.24em] text-gold-400 sm:text-[10px]">Sector {SECTORS.indexOf(active) + 1} of {n}</p>
          <p key={active.slug} className="eco-detail-in mt-1.5 text-base leading-tight text-ivory-100 sm:text-2xl" style={{ fontFamily: 'var(--font-display)' }} data-testid="text-universe-sector">
            {active.name.toUpperCase()}
          </p>
          <p className="mt-1.5 hidden text-[11px] leading-snug text-ivory-300 sm:block">{active.descriptor}</p>
        </div>

        <ul className="absolute inset-0" aria-label="All seventeen sectors">
          {SECTORS.map((s, i) => {
            const a = (i / n) * Math.PI * 2 - Math.PI / 2;
            const Icon = SECTOR_ICONS[s.slug] ?? Lightbulb;
            const on = s.slug === selected;
            const lit = s.slug === focusSlug;
            return (
              <li
                key={s.slug}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${50 + Math.cos(a) * 41}%`, top: `${50 + Math.sin(a) * 41}%` }}
              >
                <button
                  type="button"
                  onClick={() => onPick(s.slug)}
                  onMouseEnter={() => setHover(s.slug)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(s.slug)}
                  onBlur={() => setHover(null)}
                  aria-pressed={on}
                  aria-label={`${s.name}: ${s.descriptor}`}
                  data-testid={`button-universe-${s.slug}`}
                  className={`eco-universe-node ${on ? 'is-on' : ''} ${lit ? 'is-lit' : ''}`}
                  style={{ animationDelay: `${-(i * 0.37)}s` }}
                >
                  <Icon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-6 flex flex-col items-center gap-3 border-t border-gold-500/20 pt-5 sm:flex-row sm:justify-between">
        <p id="sector-universe-caption" className="text-center text-xs text-ivory-300 sm:text-left">
          Choose a sector on the orbit, then join through your member space.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => explore(active.slug)}
            data-testid="button-universe-explore"
            className="inline-flex items-center gap-1.5 border border-ivory-100/30 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ivory-100 hover:border-gold-400 hover:text-gold-400"
          >
            Explore {active.name}
          </button>
          <Show when="signed-out">
            <Link
              href={`/sign-up?sector=${active.slug}`}
              onClick={() => storePendingSector(active.slug, userId)}
              data-testid="link-universe-join"
              className="inline-flex items-center gap-1.5 bg-gold-500 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-900 hover:bg-gold-400"
            >
              Join <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </Show>
          <Show when="signed-in">
            <Link
              href={`/member/settings?sector=${active.slug}`}
              onClick={() => storePendingSector(active.slug, userId)}
              data-testid="link-universe-workspace"
              className="inline-flex items-center gap-1.5 bg-gold-500 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-900 hover:bg-gold-400"
            >
              Add to my profile <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </Show>
        </div>
      </div>
    </figure>
  );
}
