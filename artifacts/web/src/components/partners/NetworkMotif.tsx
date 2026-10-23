/** Original lightweight SVG network motif: points gather on a spiral, settle into a
 *  globe of meridians, then drift. Pure SVG + CSS transforms; static when reduced motion. */
const N = 54;
const pts = Array.from({ length: N }, (_, i) => {
  const t = i / N;
  const a = i * 2.39996; // golden angle
  const r = 40 + t * 250;
  const lat = Math.asin(2 * t - 1);
  const lon = a;
  return {
    sx: 400 + Math.cos(a) * r, sy: 400 + Math.sin(a) * r,
    gx: 400 + Math.cos(lat) * Math.sin(lon) * 260, gy: 400 + Math.sin(lat) * 260,
    front: Math.cos(lat) * Math.cos(lon) > 0, gold: i % 7 === 0,
  };
});
const links: [number, number][] = [];
pts.forEach((p, i) => { for (let j = i + 1; j < N; j++) { const q = pts[j]; if (Math.hypot(p.gx - q.gx, p.gy - q.gy) < 92 && links.length < 110) links.push([i, j]); } });

export default function NetworkMotif({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 800 800" className={`pn-motif ${className}`} aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="pn-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(165 60% 40%)" stopOpacity="0.32" />
          <stop offset="70%" stopColor="hsl(187 67% 12%)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="400" cy="400" r="380" fill="url(#pn-halo)" />
      <g className="pn-globe" fill="none" stroke="hsl(40 71% 98% / 0.12)" strokeWidth="1">
        <circle cx="400" cy="400" r="260" />
        {[0.25, 0.55, 0.85].map((k) => <ellipse key={k} cx="400" cy="400" rx={260 * k} ry="260" />)}
        {[-0.6, -0.3, 0, 0.3, 0.6].map((k) => <ellipse key={k} cx="400" cy={400 + k * 260} rx={260 * Math.sqrt(1 - k * k)} ry={22 * Math.sqrt(1 - k * k)} />)}
      </g>
      <g className="pn-links" stroke="hsl(165 55% 62% / 0.28)" strokeWidth="0.8">
        {links.map(([a, b]) => <line key={a + '-' + b} x1={pts[a].gx} y1={pts[a].gy} x2={pts[b].gx} y2={pts[b].gy} />)}
      </g>
      <g>
        {pts.map((p, i) => (
          <circle key={i} className="pn-dot" cx={p.gx} cy={p.gy} r={p.gold ? 3.4 : p.front ? 2.4 : 1.5}
            fill={p.gold ? 'hsl(43 80% 73%)' : p.front ? 'hsl(40 71% 98%)' : 'hsl(160 55% 60%)'}
            style={{ ['--dx' as string]: `${p.sx - p.gx}px`, ['--dy' as string]: `${p.sy - p.gy}px`, animationDelay: `${(i % 18) * 40}ms` }} />
        ))}
      </g>
    </svg>
  );
}
