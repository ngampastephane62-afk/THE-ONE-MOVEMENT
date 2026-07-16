import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface HeroSurfaceProps {
  children: ReactNode;
  className?: string;
  /**
   * Glow origin:
   * - 'bottom-center' (default): radial glow rising from below content
   * - 'behind': glow centered behind content — use for portraits/imagery
   */
  glowOrigin?: 'bottom-center' | 'behind';
  /** Minimum height — CSS value */
  minHeight?: string;
}

/**
 * HeroSurface — the Radiant Surface motif.
 *
 * A dark ink container with a layered radial gold glow that rises from below,
 * giving a cinematic depth without imagery. Pure CSS gradients — no images,
 * no noise, no glassmorphism.
 *
 * Composition rules:
 * - Use max ONE per page/section
 * - Children should be left-aligned at large scale (asymmetric composition)
 * - Works best with display-xl typography + GoldThread beneath the heading
 */
export default function HeroSurface({
  children,
  className,
  glowOrigin = 'bottom-center',
  minHeight = '70vh',
}: HeroSurfaceProps) {
  const glowGradients =
    glowOrigin === 'behind'
      ? `
        radial-gradient(ellipse 80% 60% at 40% 55%, hsl(39 52% 54% / 0.18) 0%, transparent 65%),
        radial-gradient(ellipse 50% 40% at 60% 50%, hsl(43 80% 73% / 0.08) 0%, transparent 55%)
      `
      : `
        radial-gradient(ellipse 100% 50% at 50% 115%, hsl(39 52% 54% / 0.25) 0%, transparent 65%),
        radial-gradient(ellipse 70% 35% at 25% 110%, hsl(43 80% 73% / 0.10) 0%, transparent 55%),
        radial-gradient(ellipse 50% 25% at 75% 100%, hsl(39 52% 54% / 0.08) 0%, transparent 50%)
      `;

  return (
    <section
      className={cn(
        'relative w-full overflow-hidden',
        'flex flex-col justify-center',
        className,
      )}
      style={{
        minHeight,
        backgroundColor: 'hsl(30 37% 7%)',
        background: `
          ${glowGradients},
          hsl(30 37% 7%)
        `,
      }}
    >
      {/* Very subtle ink-to-transparent vignette at top to avoid hard edge */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-24"
        style={{
          background:
            'linear-gradient(to bottom, hsl(29 35% 8% / 0.6) 0%, transparent 100%)',
        }}
      />
      <div className="relative z-10">{children}</div>
    </section>
  );
}
