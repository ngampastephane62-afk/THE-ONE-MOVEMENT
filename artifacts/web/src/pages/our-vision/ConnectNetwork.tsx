import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react';

export const AREAS = [
  { n: '01', t: 'HUMANITARIAN ACTION & HUMAN RIGHTS', d: 'Supporting human dignity, inclusion, humanitarian awareness and opportunities for solidarity with vulnerable communities.' },
  { n: '02', t: 'DIPLOMACY & INTERNATIONAL RELATIONS', d: 'Encouraging dialogue, cultural diplomacy, international understanding and cooperation between people and institutions.' },
  { n: '03', t: 'BUSINESS & INVESTMENT', d: 'Connecting entrepreneurs, investors, professionals and organisations to explore responsible collaboration and opportunity.' },
  { n: '04', t: 'CULTURE & ENTERTAINMENT', d: 'Using fashion, music, art, film and creative expression to bridge cultures, celebrate diversity and encourage unity.' },
  { n: '05', t: 'GOVERNANCE & CIVIC DIALOGUE', d: 'Encouraging constructive dialogue, responsible leadership, institutional engagement and inclusive participation.' },
  { n: '06', t: 'MEDIA & GLOBAL STORYTELLING', d: 'Amplifying meaningful stories, promoting cross-cultural understanding and creating visibility for initiatives with positive impact.' },
];

const G = 'hsl(42 62% 56%)';
/** Abstract motifs — geometric only, no cultural symbols. */
function Motif({ i, on = false }: { i: number; on?: boolean }) {
  const m: ReactNode[] = [
    // Humanitarian: human-centred circles held together
    <g key="h"><circle cx="40" cy="40" r="10" /><circle cx="22" cy="52" r="7" /><circle cx="58" cy="52" r="7" /><path d="M14 64 Q40 44 66 64" /></g>,
    // Diplomacy: nations linked by dialogue pathways
    <g key="d"><rect x="10" y="18" width="16" height="16" /><rect x="54" y="18" width="16" height="16" /><rect x="32" y="50" width="16" height="16" /><path d="M26 26 H54 M18 34 L40 50 M62 34 L40 50" strokeDasharray="3 3" /></g>,
    // Business: networks & opportunity nodes
    <g key="b"><circle cx="16" cy="60" r="4" /><circle cx="34" cy="38" r="4" /><circle cx="50" cy="48" r="4" /><circle cx="66" cy="18" r="5" /><path d="M16 60 L34 38 L50 48 L66 18" /></g>,
    // Culture: abstract woven textile lattice
    <g key="c"><path d="M10 20 L25 35 L40 20 L55 35 L70 20 M10 45 L25 60 L40 45 L55 60 L70 45" /><path d="M25 35 V45 M55 35 V45 M40 20 V60" strokeDasharray="2 3" /></g>,
    // Governance: balanced geometry
    <g key="g"><path d="M40 10 L70 40 L40 70 L10 40 Z" /><path d="M40 22 L58 40 L40 58 L22 40 Z" /><path d="M10 40 H70 M40 10 V70" /></g>,
    // Media: flowing communication waves
    <g key="m"><path d="M8 40 Q24 20 40 40 T72 40" /><path d="M8 52 Q24 32 40 52 T72 52" opacity=".6" /><path d="M8 28 Q24 8 40 28 T72 28" opacity=".6" /></g>,
  ];
  return <svg viewBox="0 0 80 80" aria-hidden className="h-full w-full" fill="none" stroke={G} strokeWidth="1.6"><g className={`tv-motif tv-motif-${i} ${on ? 'tv-motif-on' : ''}`}>{m[i]}</g></svg>;
}

export default function ConnectNetwork() {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: KeyboardEvent, i: number) => {
    let n = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (i + 1) % 6;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (i + 5) % 6;
    if (e.key === 'Home') n = 0;
    if (e.key === 'End') n = 5;
    if (n >= 0) { e.preventDefault(); setActive(n); refs.current[n]?.focus(); }
  };
  const pts = AREAS.map((_, i) => { const a = (i / 6) * Math.PI * 2 - Math.PI / 2; return { x: 200 + Math.cos(a) * 150, y: 200 + Math.sin(a) * 150 }; });
  const a = AREAS[active];

  return (
    <div className="grid items-center gap-10 lg:grid-cols-2">
      <div className="relative mx-auto aspect-square w-full max-w-[440px]">
        <svg viewBox="0 0 400 400" className="tv-hub-svg h-full w-full" aria-hidden>
          <g className="orbit"><circle cx="200" cy="200" r="150" fill="none" stroke="hsl(42 62% 56% / .18)" strokeDasharray="2 8" /></g>
          <circle cx="200" cy="200" r="95" fill="none" stroke="hsl(42 62% 56% / .12)" />
          {pts.map((p, i) => <line key={i} className={`spoke ${i === active ? 'on' : ''}`} x1="200" y1="200" x2={p.x} y2={p.y} />)}
          <g key={`sel-${active}`}>
            <line className="tv-spoke-draw" x1="200" y1="200" x2={pts[active].x} y2={pts[active].y} pathLength={1} />
            <circle className="tv-hub-pulse" cx={pts[active].x} cy={pts[active].y} r="34" />
          </g>
          <circle cx="200" cy="200" r="40" fill="hsl(187 60% 12%)" stroke={G} />
          <text x="200" y="205" textAnchor="middle" fill={G} fontSize="13" letterSpacing="3">TOMI</text>
        </svg>
        {pts.map((p, i) => (
          <button
            key={AREAS[i].n}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`${AREAS[i].n} ${AREAS[i].t}`}
            aria-pressed={i === active}
            tabIndex={-1}
            className={`absolute grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border p-2 transition-colors sm:h-16 sm:w-16 ${i === active ? 'border-gold-400 bg-lagoon-800' : 'border-gold-500/30 bg-lagoon-900 hover:border-gold-400'}`}
            style={{ left: `${p.x / 4}%`, top: `${p.y / 4}%` }}
            data-testid={`node-area-${AREAS[i].n}`}
          >
            <Motif key={i === active ? `on-${active}` : 'off'} i={i} on={i === active} />
          </button>
        ))}
      </div>

      <div>
        <div role="tablist" aria-label="Areas of action" className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {AREAS.map((x, i) => (
            <button
              key={x.n}
              ref={(el) => { refs.current[i] = el; }}
              role="tab"
              id={`tv-tab-${x.n}`}
              aria-selected={i === active}
              aria-controls="tv-area-panel"
              tabIndex={i === active ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={(e) => onKey(e, i)}
              className={`tv-area min-h-[56px] border px-3 py-2 text-left text-[11px] font-semibold leading-snug tracking-[0.08em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 ${i === active ? 'border-gold-400 bg-gold-500/10 text-gold-300' : 'border-gold-500/20 text-ivory-300 hover:border-gold-500/50'}`}
              data-testid={`tab-area-${x.n}`}
            >
              <span className="block font-mono text-gold-500">{x.n}</span>
              <span className="break-words">{x.t}</span>
            </button>
          ))}
        </div>
        <div id="tv-area-panel" role="tabpanel" aria-labelledby={`tv-tab-${a.n}`} key={a.n} tabIndex={0} className="tv-panel mt-8 flex flex-col gap-5 border-l border-gold-500/50 pl-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 sm:flex-row" aria-live="polite">
          <div className="h-20 w-20 shrink-0"><Motif i={active} on /></div>
          <div>
            <p className="font-mono text-xs text-gold-500">{a.n} / 06</p>
            <h3 className="mt-2 font-display text-2xl leading-tight text-ivory-100" data-testid="text-area-title">{a.t}</h3>
            <p className="mt-3 leading-relaxed text-ivory-300" data-testid="text-area-description">{a.d}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
