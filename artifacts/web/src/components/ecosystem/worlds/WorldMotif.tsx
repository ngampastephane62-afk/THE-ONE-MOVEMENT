import type { WorldMotif as Motif } from './world-config';

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.2 } as const;

function shapes(m: Motif) {
  const r = (n: number) => Array.from({ length: n }, (_, i) => i);
  switch (m) {
    case 'runway': return <>{r(9).map((i) => <line key={i} {...S} x1={200} y1={40} x2={20 + i * 45} y2={240} opacity={0.4} />)}<path {...S} className="wm-drift" d="M0 90 C 100 40, 160 140, 260 80 S 380 60, 400 100" /><path {...S} className="wm-drift wm-d2" d="M0 120 C 120 70, 180 170, 280 110 S 380 90, 400 130" /></>;
    case 'sound': return <>{r(28).map((i) => <rect key={i} className="wm-bar" style={{ animationDelay: `${(i * 137) % 900}ms` }} x={14 + i * 13.5} y={60} width={6} height={120} fill="currentColor" opacity={0.55} />)}</>;
    case 'ribbon': return <>{r(5).map((i) => <path key={i} {...S} className="wm-drift" style={{ animationDelay: `${i * 300}ms` }} d={`M-10 ${150 + i * 10} C 80 ${20 + i * 20}, 160 ${230 - i * 10}, 240 ${100 + i * 8} S 360 ${30 + i * 15}, 410 ${120 + i * 6}`} />)}</>;
    case 'reel': return <>{r(8).map((i) => <rect key={i} {...S} x={10 + i * 50} y={70} width={42} height={100} />)}{r(16).map((i) => <rect key={`h${i}`} x={14 + i * 25} y={56} width={8} height={6} fill="currentColor" opacity={0.6} />)}{r(16).map((i) => <rect key={`b${i}`} x={14 + i * 25} y={178} width={8} height={6} fill="currentColor" opacity={0.6} />)}<circle {...S} cx={200} cy={120} r={34} className="wm-spin" strokeDasharray="6 8" /></>;
    case 'gallery': return <><rect {...S} x={30} y={50} width={90} height={120} /><rect {...S} x={150} y={30} width={110} height={150} /><circle cx={205} cy={105} r={30} fill="currentColor" opacity={0.25} className="wm-pulse" /><rect {...S} x={290} y={70} width={80} height={80} /><line {...S} x1={0} y1={210} x2={400} y2={210} /></>;
    case 'network': return <>{[[60, 60], [180, 40], [320, 70], [100, 170], [240, 150], [350, 190]].map(([x, y], i, a) => <g key={i}>{a.slice(i + 1).map(([x2, y2], j) => <line key={j} {...S} x1={x} y1={y} x2={x2} y2={y2} opacity={0.35} />)}<circle cx={x} cy={y} r={6} fill="currentColor" className="wm-pulse" style={{ animationDelay: `${i * 250}ms` }} /></g>)}</>;
    case 'growth': return <>{r(6).map((i) => <line key={i} {...S} x1={0} y1={40 + i * 36} x2={400} y2={40 + i * 36} opacity={0.2} />)}<polyline {...S} strokeWidth={2} className="wm-draw" points="10,210 70,190 120,200 170,150 230,160 280,110 330,90 390,40" />{r(8).map((i) => <rect key={`c${i}`} x={20 + i * 48} y={220 - (i + 2) * 16} width={18} height={(i + 2) * 16} fill="currentColor" opacity={0.18} />)}</>;
    case 'horizon': return <><circle cx={290} cy={150} r={46} fill="currentColor" opacity={0.25} className="wm-pulse" />{r(6).map((i) => <path key={i} {...S} d={`M0 ${170 + i * 12} Q 200 ${130 + i * 12} 400 ${170 + i * 12}`} opacity={0.6 - i * 0.07} />)}<path {...S} d="M40 170 L80 110 L110 150 L150 90 L200 170" /></>;
    case 'table': return <>{r(4).map((i) => <circle key={i} {...S} cx={200} cy={120} r={30 + i * 26} opacity={0.6 - i * 0.12} />)}{r(12).map((i) => { const a = (i / 12) * Math.PI * 2; return <circle key={`s${i}`} cx={200 + Math.cos(a) * 82} cy={120 + Math.sin(a) * 82} r={5} fill="currentColor" className="wm-pulse" style={{ animationDelay: `${i * 150}ms` }} />; })}</>;
    case 'orbit': return <><circle cx={200} cy={120} r={10} fill="currentColor" />{[0, 60, 120].map((d) => <ellipse key={d} {...S} cx={200} cy={120} rx={150} ry={42} transform={`rotate(${d} 200 120)`} />)}<g className="wm-spin" style={{ transformOrigin: '200px 120px' }}><circle cx={350} cy={120} r={5} fill="currentColor" /></g></>;
    case 'circuit': return <>{r(7).map((i) => <path key={i} {...S} d={`M0 ${30 + i * 30} H ${80 + i * 20} V ${50 + i * 25} H ${260 - i * 10} V ${30 + i * 30} H 400`} opacity={0.45} />)}{r(10).map((i) => <rect key={`n${i}`} className="wm-pulse" style={{ animationDelay: `${i * 170}ms` }} x={30 + i * 37} y={(i * 53) % 200 + 20} width={8} height={8} fill="currentColor" />)}</>;
    case 'circle': return <>{r(10).map((i) => { const a = (i / 10) * Math.PI * 2; return <circle key={i} {...S} cx={200 + Math.cos(a) * 70} cy={120 + Math.sin(a) * 70} r={34} opacity={0.55} />; })}<circle cx={200} cy={120} r={14} fill="currentColor" className="wm-pulse" /></>;
    case 'broadcast': return <><rect x={194} y={110} width={12} height={110} fill="currentColor" opacity={0.6} />{r(5).map((i) => <path key={i} {...S} className="wm-pulse" style={{ animationDelay: `${i * 220}ms` }} d={`M${200 - 30 - i * 30} ${110 - 10 - i * 10} A ${30 + i * 30} ${30 + i * 30} 0 0 1 ${200 + 30 + i * 30} ${110 - 10 - i * 10}`} />)}</>;
    case 'pages': return <>{r(7).map((i) => <path key={i} {...S} d={`M200 200 Q ${200 - 30 - i * 22} ${170 - i * 6} ${200 - 40 - i * 24} ${60 + i * 4}`} opacity={0.55} />)}{r(7).map((i) => <path key={`r${i}`} {...S} d={`M200 200 Q ${200 + 30 + i * 22} ${170 - i * 6} ${200 + 40 + i * 24} ${60 + i * 4}`} opacity={0.55} />)}<line {...S} x1={200} y1={40} x2={200} y2={200} /></>;
    case 'skyline': return <>{[40, 90, 60, 150, 110, 70, 130].map((h, i) => <rect key={i} {...S} x={20 + i * 54} y={220 - h} width={40} height={h} />)}</>;
    case 'pulse': return <><polyline {...S} strokeWidth={2} className="wm-draw" points="0,130 90,130 110,130 125,80 140,180 160,60 178,150 192,130 400,130" /><path {...S} d="M300 60 h20 v-20 h20 v20 h20 v20 h-20 v20 h-20 v-20 h-20 z" opacity={0.6} /></>;
    case 'shelter': return <>{r(4).map((i) => <path key={i} {...S} d={`M${200 - 50 - i * 35} 210 A ${50 + i * 35} ${50 + i * 35} 0 0 1 ${200 + 50 + i * 35} 210`} opacity={0.65 - i * 0.12} className="wm-pulse" style={{ animationDelay: `${i * 300}ms` }} />)}<circle cx={200} cy={180} r={12} fill="currentColor" /></>;
  }
}

export default function WorldMotif({ motif, className }: { motif: Motif; className?: string }) {
  return (
    <svg viewBox="0 0 400 240" className={className} preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      {shapes(motif)}
    </svg>
  );
}
