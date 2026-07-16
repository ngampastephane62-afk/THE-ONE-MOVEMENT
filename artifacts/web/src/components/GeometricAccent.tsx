import { cn } from '@/lib/utils';

interface GeometricAccentProps {
  className?: string;
  /**
   * Visual variant — determines foreground color:
   * - 'gold-on-lagoon': gold rhombus pattern, for use on lagoon-900/800 surfaces (default)
   * - 'lagoon-on-ivory': teal rhombus pattern, for use on ivory/light surfaces
   */
  variant?: 'gold-on-lagoon' | 'lagoon-on-ivory';
  /** Override color directly (overrides variant) */
  color?: string;
  /** Overall height of the strip */
  height?: number;
}

/**
 * GeometricAccent — the brand's decorative border-pattern strip.
 *
 * An elegant thin-line SVG pattern inspired by woven geometric traditions —
 * precise interlocking rhombus forms, NOT literal ethnic print.
 *
 * V2 PROMOTION: Now an active brand element, available in two variants:
 * - gold-on-lagoon: for section boundaries on dark surfaces
 * - lagoon-on-ivory: for section boundaries on light surfaces
 *
 * Still maximum ONE per page region. Use at section transitions.
 */
export default function GeometricAccent({
  className,
  variant = 'gold-on-lagoon',
  color,
  height = 24,
}: GeometricAccentProps) {
  // Resolve color: explicit override > variant default
  const resolvedColor = color ?? (
    variant === 'lagoon-on-ivory'
      ? 'hsl(189 74% 32%)'   // lagoon-500
      : 'hsl(39 52% 54%)'    // gold-500
  );

  const tileW = 40;
  const tileH = height;
  const h = tileH;
  const w = tileW;

  // Unique pattern ID per variant to prevent SVG pattern ID conflicts on the same page
  const patternId = `geo-accent-pattern-${variant.replace(/[^a-z]/g, '-')}`;

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
            {/* Left diamond outline */}
            <path
              d={`M0,${h / 2} L${w / 4},1 L${w / 2},${h / 2} L${w / 4},${h - 1} Z`}
              fill="none"
              stroke={resolvedColor}
              strokeWidth="0.75"
              opacity="0.6"
            />
            {/* Right diamond outline */}
            <path
              d={`M${w / 2},${h / 2} L${(3 * w) / 4},1 L${w},${h / 2} L${(3 * w) / 4},${h - 1} Z`}
              fill="none"
              stroke={resolvedColor}
              strokeWidth="0.75"
              opacity="0.6"
            />
            {/* Node dots at diamond intersections */}
            <circle cx={w / 4}       cy={h / 2} r="1.5" fill={resolvedColor} opacity="0.4" />
            <circle cx={(3 * w) / 4} cy={h / 2} r="1.5" fill={resolvedColor} opacity="0.4" />
          </pattern>
        </defs>
        <rect width="100%" height={height} fill={`url(#${patternId})`} />
      </svg>
    </span>
  );
}
