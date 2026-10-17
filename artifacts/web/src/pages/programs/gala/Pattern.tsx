/** Refined African geometric motifs — kente-inspired step diamonds and chevrons. Decorative only. */
export function GeoBand({ className = '', opacity = 0.5 }: { className?: string; opacity?: number }) {
  return (
    <svg aria-hidden="true" className={className} width="100%" height="18" style={{ opacity }}>
      <defs>
        <pattern id="gala-band" width="36" height="18" patternUnits="userSpaceOnUse">
          <path d="M0 9 L9 0 L18 9 L9 18 Z" fill="none" stroke="hsl(39 52% 54%)" strokeWidth="1" />
          <path d="M18 9 L27 0 L36 9 L27 18 Z" fill="hsl(39 52% 54% / 0.35)" />
          <rect x="7" y="7" width="4" height="4" fill="hsl(43 80% 73%)" transform="rotate(45 9 9)" />
        </pattern>
      </defs>
      <rect width="100%" height="18" fill="url(#gala-band)" />
    </svg>
  );
}

export function GeoField({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} width="100%" height="100%">
      <defs>
        <pattern id="gala-field" width="64" height="64" patternUnits="userSpaceOnUse">
          <path d="M32 4 L60 32 L32 60 L4 32 Z" fill="none" stroke="hsl(39 52% 54% / 0.16)" />
          <path d="M32 18 L46 32 L32 46 L18 32 Z" fill="none" stroke="hsl(39 52% 54% / 0.1)" />
          <circle cx="32" cy="32" r="1.6" fill="hsl(43 80% 73% / 0.3)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#gala-field)" />
    </svg>
  );
}

export function Eyebrow({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <p className={`flex items-center gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.28em] ${dark ? 'text-gold-400' : 'text-gold-700'}`}>
      <span aria-hidden="true" className="inline-block h-2 w-2 rotate-45 bg-current" />
      {children}
    </p>
  );
}

export const display = { fontFamily: 'var(--font-display)' } as const;
