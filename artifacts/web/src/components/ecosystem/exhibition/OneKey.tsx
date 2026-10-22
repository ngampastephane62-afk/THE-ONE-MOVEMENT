import { useId } from 'react';

/** THE ONE KEY: gold bow with seventeen points, emerald heart, refined shaft and bit. Decorative only. */
export default function OneKey({ className = '', title }: { className?: string; title?: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 240 92" className={className} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} aria-label={title} focusable="false">
      <defs>
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="hsl(43 85% 82%)" />
          <stop offset="0.45" stopColor="hsl(39 55% 56%)" />
          <stop offset="0.7" stopColor="hsl(37 60% 34%)" />
          <stop offset="1" stopColor="hsl(43 80% 70%)" />
        </linearGradient>
        <radialGradient id={`e${id}`} cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" stopColor="hsl(160 55% 48%)" />
          <stop offset="1" stopColor="hsl(170 70% 12%)" />
        </radialGradient>
      </defs>
      <circle cx="46" cy="46" r="34" fill="none" stroke={`url(#g${id})`} strokeWidth="6" />
      <circle cx="46" cy="46" r="24" fill="none" stroke={`url(#g${id})`} strokeWidth="1" opacity="0.7" />
      <path d="M46 31 L57 46 L46 61 L35 46 Z" fill={`url(#e${id})`} stroke={`url(#g${id})`} strokeWidth="1.2" />
      {Array.from({ length: 17 }, (_, i) => {
        const a = (i / 17) * Math.PI * 2 - Math.PI / 2;
        return <circle key={i} cx={46 + Math.cos(a) * 41} cy={46 + Math.sin(a) * 41} r="1.5" fill="hsl(43 80% 73%)" />;
      })}
      <rect x="80" y="42" width="128" height="8" rx="1" fill={`url(#g${id})`} />
      <rect x="80" y="44.5" width="128" height="1" fill="hsl(160 55% 45%)" opacity="0.5" />
      <path d="M176 50 V66 H186 V58 H194 V70 H208 V50 Z" fill={`url(#g${id})`} />
      <rect x="208" y="40" width="10" height="12" rx="2" fill={`url(#g${id})`} />
    </svg>
  );
}
