import { cn } from '@/lib/utils';

interface GeometricAccentProps {
  className?: string;
  /** Color override — CSS color value (defaults to gold-500) */
  color?: string;
  /** Overall height of the strip */
  height?: number;
}

/**
 * GeometricAccent — the brand's optional decorative border-pattern strip.
 *
 * An elegant thin-line SVG pattern inspired by woven geometric traditions —
 * precise interlocking rhombus forms, NOT literal ethnic print.
 * Rendered as a repeating SVG, off by default — use with restraint,
 * maximum ONE per page region.
 *
 * Designed to sit at section boundaries or below the NavigationBar.
 */
export default function GeometricAccent({
  className,
  color = 'hsl(39 52% 54%)',
  height = 24,
}: GeometricAccentProps) {
  // Single tile: 40×24 interlocking diamond/rhombus strip
  const tileW = 40;
  const tileH = height;
  const h = tileH;
  const w = tileW;

  // Paths that form an elegant geometric chain
  const pattern = `
    M0,${h / 2} L${w / 4},0 L${w / 2},${h / 2} L${w / 4},${h} Z
    M${w / 2},${h / 2} L${(3 * w) / 4},0 L${w},${h / 2} L${(3 * w) / 4},${h} Z
  `
    .trim()
    .replace(/\s+/g, ' ');

  const patternId = 'geo-accent-pattern';

  return (
    <span
      aria-hidden="true"
      className={cn('block w-full overflow-hidden', className)}
      style={{ height }}
    >
      <svg
        width="100%"
        height={height}
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMinYMid slice"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id={patternId}
            x="0"
            y="0"
            width={tileW}
            height={tileH}
            patternUnits="userSpaceOnUse"
          >
            {/* Outer diamond outlines */}
            <path
              d={`M0,${h / 2} L${w / 4},1 L${w / 2},${h / 2} L${w / 4},${h - 1} Z`}
              fill="none"
              stroke={color}
              strokeWidth="0.75"
              opacity="0.6"
            />
            <path
              d={`M${w / 2},${h / 2} L${(3 * w) / 4},1 L${w},${h / 2} L${(3 * w) / 4},${h - 1} Z`}
              fill="none"
              stroke={color}
              strokeWidth="0.75"
              opacity="0.6"
            />
            {/* Inner accent nodes */}
            <circle cx={w / 4} cy={h / 2} r="1.5" fill={color} opacity="0.4" />
            <circle cx={(3 * w) / 4} cy={h / 2} r="1.5" fill={color} opacity="0.4" />
          </pattern>
        </defs>
        <rect width="100%" height={height} fill={`url(#${patternId})`} />
      </svg>
    </span>
  );
}
