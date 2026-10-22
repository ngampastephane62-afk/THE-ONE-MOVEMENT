import { UAE_OUTLINE, UAE_ENCLAVE_HOLE, EMIRATE_CAPITALS } from '@/lib/emirates-geography';
import { SEVEN_EMIRATES } from '@/lib/emirates-experience';

/**
 * Clean UAE locator: the Natural Earth outline as a single gold-edged land
 * mass, faint capital points, and ONE active marker + leader line that glides
 * to the selected emirate's capital city.
 */
export default function UaeLocator({ index, onSelect }: { index: number; onSelect: (i: number) => void }) {
  const e = SEVEN_EMIRATES[index]!;
  const p = EMIRATE_CAPITALS[e.id] ?? { x: 300, y: 240 };
  // Leader goes up-left by default; the label sits on its far end.
  const lx = -96, ly = p.y < 115 ? -40 : -58;
  return (
    <svg viewBox="40 30 540 400" className="block h-auto w-full" role="img" aria-label={`Map of the United Arab Emirates, ${e.name} highlighted at its capital city`} data-testid="svg-uae-locator">
      <defs>
        <linearGradient id="em-land" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="hsl(40 45% 92%)" />
          <stop offset="1" stopColor="hsl(38 40% 84%)" />
        </linearGradient>
        <radialGradient id="em-glow"><stop offset="0" stopColor="hsl(39 60% 58% / .55)" /><stop offset="1" stopColor="hsl(39 60% 58% / 0)" /></radialGradient>
      </defs>
      <text x="70" y="120" fontSize="11" letterSpacing="5" fill="hsl(190 30% 40% / .55)" className="font-display">ARABIAN GULF</text>
      <path d={`${UAE_OUTLINE}${UAE_ENCLAVE_HOLE}`} fill="url(#em-land)" stroke="hsl(39 52% 50%)" strokeWidth="1.1" strokeLinejoin="round" fillRule="evenodd" className="em-loc-land" />
      {SEVEN_EMIRATES.map((s, i) => {
        const c = EMIRATE_CAPITALS[s.id];
        if (!c) return null;
        return (
          <g key={s.id} transform={`translate(${c.x} ${c.y})`} onClick={() => onSelect(i)} style={{ cursor: 'pointer' }} aria-hidden>
            <circle r="9" fill="transparent" />
            <circle r="2.6" className="em-loc-dot" data-on={i === index} fill="hsl(190 45% 28%)" />
          </g>
        );
      })}
      <g className="em-loc-marker" style={{ transform: `translate(${p.x}px, ${p.y}px)`, pointerEvents: 'none' }}>
        <circle r="26" fill="url(#em-glow)" />
        <circle r="7" className="em-pulse" fill="none" stroke="hsl(39 52% 50%)" strokeWidth="1.2" />
        <circle r="5" fill="hsl(39 52% 50%)" stroke="hsl(40 40% 97%)" strokeWidth="1.6" />
        <g key={e.id}>
          <path d={`M0 0 L${lx * 0.55} ${ly} L${lx} ${ly}`} pathLength={1} fill="none" stroke="hsl(190 45% 24%)" strokeWidth="0.9" className="em-loc-lead" />
          <g className="em-loc-label">
            <text x={lx - 6} y={ly - 6} textAnchor="end" fontSize="17" fill="hsl(190 45% 18%)" className="font-display">{e.name}</text>
            <text x={lx - 6} y={ly + 14} textAnchor="start" fontSize="13" fill="hsl(39 52% 42%)" direction="rtl" className="em-ar">{e.ar}</text>
          </g>
        </g>
      </g>
    </svg>
  );
}
