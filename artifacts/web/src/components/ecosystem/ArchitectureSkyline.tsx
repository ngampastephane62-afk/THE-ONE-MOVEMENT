/** Original illustrative SVG artwork made for TOMI. Not a depiction of any specific building, owner or project. */
export default function ArchitectureSkyline({ className = '' }: { className?: string }) {
  const towers = [
    [40, 210, 46], [92, 150, 38], [136, 250, 30], [172, 120, 54], [232, 190, 34], [272, 300, 40],
    [318, 170, 58], [382, 230, 28], [416, 140, 44], [466, 330, 36], [508, 200, 50], [564, 260, 32],
    [602, 160, 46], [654, 220, 38], [698, 280, 30], [734, 180, 52],
  ];
  return (
    <svg viewBox="0 0 800 420" className={className} role="img" aria-labelledby="sw-sky-t">
      <title id="sw-sky-t">Illustrative architectural artwork: an imagined city of towers above a lagoon</title>
      <defs>
        <linearGradient id="sw-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="hsl(187 67% 9%)" />
          <stop offset="0.7" stopColor="hsl(189 70% 21%)" />
          <stop offset="1" stopColor="hsl(39 52% 54%)" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id="sw-tower" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="hsl(43 80% 73%)" stopOpacity="0.9" />
          <stop offset="1" stopColor="hsl(187 67% 12%)" stopOpacity="0.95" />
        </linearGradient>
      </defs>
      <rect width="800" height="420" fill="url(#sw-sky)" />
      <circle cx="610" cy="120" r="54" fill="hsl(43 80% 73%)" opacity="0.18" />
      <circle cx="610" cy="120" r="30" fill="hsl(43 80% 73%)" opacity="0.35" />
      <g className="sw-skyline-towers">
        {towers.map(([x, h, w], i) => (
          <g key={i} style={{ ['--i' as string]: i }} className="sw-tower">
            <rect x={x} y={340 - h} width={w} height={h} fill="url(#sw-tower)" stroke="hsl(43 80% 73% / 0.45)" strokeWidth="0.8" />
            {Array.from({ length: Math.floor(h / 18) }).map((_, r) => (
              <line key={r} x1={x + 4} x2={x + w - 4} y1={340 - h + 10 + r * 18} y2={340 - h + 10 + r * 18} stroke="hsl(43 80% 73% / 0.22)" strokeWidth="0.6" />
            ))}
            {i % 4 === 1 && <path d={`M${x} ${340 - h} L${x + w / 2} ${340 - h - 26} L${x + w} ${340 - h}`} fill="none" stroke="hsl(43 80% 73% / 0.7)" />}
          </g>
        ))}
      </g>
      <rect y="340" width="800" height="80" fill="hsl(187 67% 8%)" />
      {towers.map(([x, h, w], i) => (
        <rect key={i} x={x} y="342" width={w} height={Math.min(h * 0.22, 70)} fill="hsl(43 80% 73%)" opacity="0.07" />
      ))}
      <path d="M0 360 Q200 352 400 360 T800 358" stroke="hsl(43 80% 73% / 0.35)" fill="none" />
      <path d="M0 380 Q200 372 400 382 T800 378" stroke="hsl(43 80% 73% / 0.18)" fill="none" />
    </svg>
  );
}
