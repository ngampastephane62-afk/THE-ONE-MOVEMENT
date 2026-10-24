import { useId, type CSSProperties } from 'react';
import { cn } from '@/lib/utils';

/**
 * Kuba-inspired geometric motifs, redrawn as lightweight SVG from the Founder's pattern reference:
 * chevron columns, diamond "eyes" with a central circle and maze-like vertical blocks.
 * Decorative only (aria-hidden). Distinct from the older generic .tomi-kuba-band weave.
 */
export type KubaPalette = 'emerald' | 'teal' | 'gold' | 'ivory';

const PALETTES: Record<KubaPalette, { line: string; block: string; maze: string }> = {
  emerald: { line: 'var(--color-lagoon-900)', block: 'var(--color-gold-500)', maze: 'var(--color-lagoon-800)' },
  teal: { line: 'var(--color-lagoon-700)', block: 'var(--color-gold-500)', maze: 'var(--color-lagoon-900)' },
  gold: { line: 'var(--color-gold-500)', block: 'var(--color-gold-400)', maze: 'var(--color-gold-700)' },
  ivory: { line: 'var(--color-ivory-100)', block: 'var(--color-ivory-300)', maze: 'var(--color-lagoon-900)' },
};

interface Base { palette?: KubaPalette; className?: string; style?: CSSProperties; animated?: boolean }

/** One 40x64 chevron/eye cell; tiles vertically. */
function ChevronCell({ c }: { c: string }) {
  return (
    <g fill="none" stroke={c} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 6 L20 16 L32 6" />
      <circle cx="6" cy="27" r="2.6" fill={c} stroke="none" />
      <circle cx="34" cy="27" r="2.6" fill={c} stroke="none" />
      <path d="M8 40 L20 30 L32 40" />
      <path d="M20 44 L30 53 L20 62 L10 53 Z" />
      <circle cx="20" cy="53" r="2.6" fill={c} stroke="none" />
    </g>
  );
}

/** One 40x64 stacked-chevron diamond eye cell. */
function DiamondCell({ c }: { c: string }) {
  return (
    <g fill="none" stroke={c} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 4 L20 12 L32 4" />
      <path d="M8 13 L20 21 L32 13" />
      <path d="M20 24 L34 38 L20 52 L6 38 Z" />
      <circle cx="20" cy="38" r="3.4" fill={c} stroke="none" />
      <path d="M8 60 L20 54 L32 60" />
    </g>
  );
}

function Column({ kind, height, palette = 'teal', className, style, animated }: Base & { kind: 'chevron' | 'diamond'; height: number }) {
  const uid = useId().replace(/:/g, '');
  const pid = `kuba-${kind}-${uid}`;
  const c = PALETTES[palette].line;
  return (
    <svg viewBox={`0 0 40 ${height}`} width="40" height={height} aria-hidden="true" focusable="false" className={cn('kuba-svg', animated && 'kuba-drift', className)} style={style}>
      <defs>
        <pattern id={pid} width="40" height="64" patternUnits="userSpaceOnUse">
          {kind === 'chevron' ? <ChevronCell c={c} /> : <DiamondCell c={c} />}
        </pattern>
      </defs>
      <rect width="40" height={height} fill={`url(#${pid})`} />
    </svg>
  );
}

export function KubaChevronPattern({ height = 192, ...p }: Base & { height?: number }) {
  return <Column kind="chevron" height={height} {...p} />;
}

export function KubaDiamondPattern({ height = 192, ...p }: Base & { height?: number }) {
  return <Column kind="diamond" height={height} {...p} />;
}

/** Maze-like vertical block (reference: orange panels with interlocking channels). */
export function KubaGeometricBlock({ palette = 'gold', className, style }: Base) {
  const { block, maze } = PALETTES[palette];
  return (
    <svg viewBox="0 0 40 100" width="40" height="100" aria-hidden="true" focusable="false" className={cn('kuba-svg', className)} style={style}>
      <rect x="1" y="1" width="38" height="98" rx="1.5" fill={block} />
      <g fill="none" stroke={maze} strokeWidth="3.2" strokeLinecap="square">
        <path d="M8 8 V44 H20 V30 H30" />
        <path d="M30 8 V22 H18" />
        <path d="M8 56 H22 V70 H12 V92" />
        <path d="M32 52 V84 H22" />
      </g>
    </svg>
  );
}

/**
 * Horizontal divider: the reference columns laid on their side in a short repeat.
 * Use once per section at most.
 */
export function KubaSectionDivider({ palette = 'teal', className, style, animated = false, label }: Base & { label?: string }) {
  const uid = useId().replace(/:/g, '');
  const { line, block, maze } = PALETTES[palette];
  const pid = `kuba-div-${uid}`;
  return (
    <div className={cn('kuba-divider', animated && 'kuba-reveal', className)} style={style} aria-hidden="true" data-kuba-label={label}>
      <svg viewBox="0 0 480 40" preserveAspectRatio="xMidYMid slice" width="100%" height="40" focusable="false">
        <defs>
          <pattern id={pid} width="120" height="40" patternUnits="userSpaceOnUse">
            <g fill="none" stroke={line} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 8 L12 20 L4 32" />
              <path d="M14 8 L22 20 L14 32" />
              <path d="M34 20 L44 10 L54 20 L44 30 Z" />
              <circle cx="44" cy="20" r="2.4" fill={line} stroke="none" />
              <path d="M66 8 L74 20 L66 32" />
              <path d="M110 8 L102 20 L110 32" />
            </g>
            <rect x="80" y="6" width="16" height="28" rx="1" fill={block} />
            <path d="M84 10 V22 H90 V16 M92 10 V14 M84 30 H92 V24" fill="none" stroke={maze} strokeWidth="1.8" />
          </pattern>
        </defs>
        <rect width="480" height="40" fill={`url(#${pid})`} />
      </svg>
    </div>
  );
}

/** Compact vertical cluster echoing the reference: chevron column, block pair, diamond column. */
export function KubaCluster({ palette = 'teal', blockPalette, className, height = 208 }: Base & { blockPalette?: KubaPalette; height?: number }) {
  return (
    <div className={cn('kuba-cluster flex items-start gap-2', className)} aria-hidden="true">
      <KubaChevronPattern palette={palette} height={height} />
      <div className="flex flex-col gap-2 pt-1">
        <KubaGeometricBlock palette={blockPalette ?? palette} />
        <KubaGeometricBlock palette={blockPalette ?? palette} style={{ transform: 'scaleX(-1)' }} />
      </div>
      <KubaDiamondPattern palette={palette} height={height} />
    </div>
  );
}
