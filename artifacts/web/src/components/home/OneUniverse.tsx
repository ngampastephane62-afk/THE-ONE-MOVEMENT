import { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import { ArrowUpRight } from 'lucide-react';
import { SECTORS } from '@/lib/sectors-data';
import { sectorDestination } from '@/components/ecosystem/sector-location';
import './one-universe.css';

/**
 * THE ONE UNIVERSE — home-only view of the 17 canonical sectors (SECTORS order).
 * The SVG globe is decorative; every interaction lives in real buttons, and the
 * numbered list below is the complete readable keyboard/touch alternative.
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
const pos = (i: number) => {
  const a = (i / N) * Math.PI * 2 - Math.PI / 2;
  return { x: 50 + Math.cos(a) * 43, y: 50 + Math.sin(a) * 43 };
};

export default function OneUniverse() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const root = useRef<HTMLDivElement>(null);
  const sector = SECTORS[index];

  useEffect(() => {
    const el = root.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '80px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); setIndex((i) => (i + 1) % N); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); setIndex((i) => (i - 1 + N) % N); }
  };

  return (
    <div ref={root} className="tou" data-active={visible ? 'true' : 'false'} data-testid="home-one-universe">
      <div className="tou-stage">
        <div className="tou-orbit-wrap">
          <svg className="tou-globe" viewBox="0 0 100 100" aria-hidden="true">
            <defs>
              <radialGradient id="tou-sphere" cx="38%" cy="34%" r="70%">
                <stop offset="0" stopColor="hsl(150 34% 22%)" />
                <stop offset=".65" stopColor="hsl(165 45% 10%)" />
                <stop offset="1" stopColor="hsl(170 50% 6%)" />
              </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="43" className="tou-ring" />
            <circle cx="50" cy="50" r="47.5" className="tou-ring tou-ring--faint" />
            {SECTORS.map((_, i) => {
              const p = pos(i);
              return <line key={i} x1="50" y1="50" x2={p.x} y2={p.y} className={`tou-ray${i === index ? ' is-on' : ''}`} />;
            })}
            <circle cx="50" cy="50" r="22" fill="url(#tou-sphere)" className="tou-sphere" />
            <g className="tou-meridians">
              <ellipse cx="50" cy="50" rx="22" ry="7" />
              <ellipse cx="50" cy="50" rx="22" ry="14" />
              <line x1="28" y1="50" x2="72" y2="50" />
            </g>
            <g className="tou-spin">
              <ellipse cx="50" cy="50" rx="7" ry="22" />
              <ellipse cx="50" cy="50" rx="15" ry="22" />
              <ellipse cx="50" cy="50" rx="20.5" ry="22" />
            </g>
            <ellipse cx="50" cy="50" rx="31" ry="9" className="tou-orbit" transform="rotate(-18 50 50)" />
          </svg>
          <div className="tou-core">
            <span className="tou-core-num">{pad(index)}</span>
            <span className="tou-core-of">of 17</span>
          </div>
          {SECTORS.map((s, i) => {
            const p = pos(i);
            return (
              <button
                key={s.slug}
                type="button"
                className={`tou-node${i === index ? ' is-on' : ''}`}
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                onClick={() => setIndex(i)}
                onKeyDown={onKey}
                aria-pressed={i === index}
                aria-label={`${pad(i)} ${s.name}`}
                data-testid={`button-universe-node-${s.slug}`}
              >
                <span className="tou-node-num">{pad(i)}</span>
                <span className="tou-node-name" aria-hidden="true">{s.name}</span>
              </button>
            );
          })}
        </div>

        <div className="tou-panel" aria-live="polite" data-testid="panel-universe-selected">
          <p className="tou-panel-eyebrow">Sector {pad(index)} / 17</p>
          <p key={sector.slug} className="tou-panel-name" data-testid="text-universe-sector-name">{sector.name}</p>
          <p className="tou-panel-desc">{sector.descriptor}</p>
          <p className="tou-panel-body">{sector.contributes}</p>
          <Link href={sectorDestination(sector.slug)} className="tou-explore" data-testid="link-universe-explore">
            Explore {sector.name} <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
          <p className="tou-hint">Select a number, or use the arrow keys.</p>
        </div>
      </div>

      <ol className="tou-list" aria-label="The 17 sectors of the TOMI ecosystem">
        {SECTORS.map((s, i) => (
          <li key={s.slug}>
            <button
              type="button"
              className={`tou-list-btn${i === index ? ' is-on' : ''}`}
              onClick={() => setIndex(i)}
              aria-pressed={i === index}
              data-testid={`button-universe-list-${s.slug}`}
            >
              <span className="tou-list-num">{pad(i)}</span>
              <span className="tou-list-name">{s.name}</span>
              <span className="tou-list-desc">{s.descriptor}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
