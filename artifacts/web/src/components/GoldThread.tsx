import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface GoldThreadProps {
  /** Direction of the line */
  direction?: 'horizontal' | 'vertical';
  /** Show a small circular node/dot at the center */
  node?: boolean;
  /** Additional classes */
  className?: string;
  /** Length override — CSS value e.g. "100%", "200px" */
  length?: string;
}

/**
 * GoldThread — the brand's "connection" symbol.
 *
 * A thin 1px gold line, horizontal or vertical, with an optional central
 * node dot. The line carries a subtle shimmer sweep that activates when the
 * element scrolls into view (CSS animation, triggered by IntersectionObserver).
 * Entirely disabled under prefers-reduced-motion.
 *
 * Composition rules: use at most ONE per screen region. This is a motif,
 * not a divider — it should feel like it belongs, not like decoration.
 */
export default function GoldThread({
  direction = 'horizontal',
  node = false,
  className,
  length,
}: GoldThreadProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect reduced motion preference before setting up observer
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.setAttribute('data-visible', '');
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const isHorizontal = direction === 'horizontal';

  const lineStyle: React.CSSProperties = isHorizontal
    ? {
        width: length ?? '100%',
        height: '1px',
      }
    : {
        height: length ?? '100%',
        width: '1px',
      };

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={cn(
        'relative inline-flex items-center justify-center shrink-0',
        isHorizontal ? 'flex-row' : 'flex-col',
        className,
      )}
      style={isHorizontal ? { width: length ?? '100%' } : { height: length ?? '100%' }}
    >
      {/* The line itself */}
      <span
        className="absolute"
        style={{
          ...lineStyle,
          background: `linear-gradient(
            ${isHorizontal ? '90deg' : '180deg'},
            transparent 0%,
            hsl(39 52% 54%) 15%,
            hsl(43 80% 73%) 50%,
            hsl(39 52% 54%) 85%,
            transparent 100%
          )`,
        }}
      />

      {/* Shimmer overlay — activates on data-visible attribute */}
      <span
        className="absolute overflow-hidden"
        style={lineStyle}
      >
        <span
          className={cn(
            'absolute inset-0',
            // The shimmer gradient sweeps when data-visible is set
            '[data-visible_&]:animate-shimmer',
          )}
          style={{
            backgroundImage: `linear-gradient(
              ${isHorizontal ? '90deg' : '180deg'},
              transparent 0%,
              hsl(43 80% 73% / 0) 30%,
              hsl(43 80% 73% / 0.85) 50%,
              hsl(43 80% 73% / 0) 70%,
              transparent 100%
            )`,
            backgroundSize: isHorizontal ? '400% 100%' : '100% 400%',
          }}
        />
      </span>

      {/* Optional node dot */}
      {node && (
        <span className="kuba-node relative z-10 shrink-0" style={{ boxShadow: '0 0 0 3px hsl(187 67% 10% / 0.6)' }} />
      )}
    </span>
  );
}
