import { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import { ArrowUpRight } from 'lucide-react';
import { SECTORS } from '@/lib/sectors-data';
import { sectorDestination } from '@/components/ecosystem/sector-location';
import './one-universe.css';

/**
 * THE ONE UNIVERSE — home-only view of the 17 canonical sectors (SECTORS order).
 * Sector labels enter from opposite sides and cross into a woven composition
 * once the section is in view. Every label is a real button (keyboard + touch);
 * there is no second visual list below.
 */
const N = SECTORS.length;
/** Pure helpers for offline tests: number label + canonical destination per sector. */
export const UNIVERSE_SECTORS = SECTORS.map((s, i) => ({
  number: String(i + 1).padStart(2, '0'),
  slug: s.slug,
  name: s.name,
  href: sectorDestination(s.slug),
}));
const pad = (i: number) => String(i + 1).padStart(2, '0');

export default function OneUniverse() {
  const [index, setIndex] = useState(0);
  const [entered, setEntered] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const btns = useRef<(HTMLButtonElement | null)[]>([]);
  const sector = SECTORS[index];

  useEffect(() => {
    const el = root.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setEntered(true); return; }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setEntered(true); io.disconnect(); }
    }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const go = (i: number) => { setIndex(i); btns.current[i]?.focus(); };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); go((index + 1) % N); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); go((index - 1 + N) % N); }
  };

  return (
    <div ref={root} className="tou" data-entered={entered ? 'true' : 'false'} onFocusCapture={() => setEntered(true)} data-testid="home-one-universe">
      <div className="tou-weave" role="group" aria-label="The 17 sectors of the TOMI ecosystem">
        <svg className="tou-threads" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 6 C 30 6, 70 34, 100 34" />
          <path d="M0 34 C 30 34, 70 6, 100 6" />
        </svg>
        {SECTORS.map((s, i) => (
          <button
            key={s.slug}
            ref={(el) => { btns.current[i] = el; }}
            type="button"
            className={`tou-chip${i === index ? ' is-on' : ''}`}
            style={{ '--from': i % 2 === 0 ? -1 : 1, '--d': `${(i % 9) * 70}ms` } as React.CSSProperties}
            onClick={() => setIndex(i)}
            onKeyDown={onKey}
            aria-pressed={i === index}
            data-testid={`button-universe-node-${s.slug}`}
          >
            <span className="tou-chip-num">{pad(i)}</span>
            <span className="tou-chip-name">{s.name}</span>
          </button>
        ))}
      </div>

      <div className="tou-panel" aria-live="polite" data-testid="panel-universe-selected">
        <p className="tou-panel-eyebrow">{pad(index)} / 17</p>
        <div key={sector.slug} className="tou-panel-body-wrap">
          <p className="tou-panel-name" data-testid="text-universe-sector-name">{sector.name}</p>
          <p className="tou-panel-desc">{sector.descriptor}</p>
          <p className="tou-panel-body">{sector.contributes}</p>
        </div>
        <Link href={sectorDestination(sector.slug)} className="tou-explore" data-testid="link-universe-explore">
          Explore {sector.name} <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
