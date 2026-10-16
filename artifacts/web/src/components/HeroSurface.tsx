import { type ReactNode, useEffect, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import emiratesArt from '@/assets/media/editorial/emirates-dunes.webp';
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
  /** Show the supplied Emirates dunes art as atmospheric layer (default true) */
  atmosphere?: boolean;
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
  atmosphere = true,
}: HeroSurfaceProps) {
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  const still = paused || reduced;
  // Lagoon-900 base with warm gold radial glow — the teal-meets-gold sunrise atmosphere
  const glowGradients =
    glowOrigin === 'behind'
      ? `
        radial-gradient(ellipse 80% 60% at 40% 55%, hsl(39 52% 54% / 0.20) 0%, transparent 65%),
        radial-gradient(ellipse 50% 40% at 60% 50%, hsl(43 80% 73% / 0.08) 0%, transparent 55%)
      `
      : `
        radial-gradient(ellipse 100% 50% at 50% 115%, hsl(39 52% 54% / 0.28) 0%, transparent 65%),
        radial-gradient(ellipse 70% 35% at 25% 110%, hsl(43 80% 73% / 0.12) 0%, transparent 55%),
        radial-gradient(ellipse 50% 25% at 75% 100%, hsl(39 52% 54% / 0.10) 0%, transparent 50%)
      `;

  return (
    <section
      className={cn(
        'tomi-aurora-surface relative w-full overflow-hidden',
        'flex flex-col justify-center',
        className,
      )}
      data-paused={still ? 'true' : 'false'}
      style={{
        minHeight,
        backgroundColor: 'hsl(187 67% 12%)',
        background: `
          ${glowGradients},
          radial-gradient(ellipse 45% 40% at 95% 0%, hsl(12 58% 38% / 0.22) 0%, transparent 70%),
        hsl(187 67% 12%)
        `,
      }}
    >
      {atmosphere && (
        <>
          <img src={emiratesArt} alt="" aria-hidden="true" decoding="async" className="hero-emirates-art pointer-events-none" />
          <span aria-hidden="true" className="hero-emirates-veil pointer-events-none absolute inset-0" />
        </>
      )}
      {/* Lagoon-to-transparent vignette at top */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-24"
        style={{
          background:
            'linear-gradient(to bottom, hsl(187 67% 12% / 0.7) 0%, transparent 100%)',
        }}
      />
      <span className="tomi-surface-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      {/* Original Kuba-inspired lattice, masked away from the text column */}
      <span className="kuba-field" aria-hidden="true" />
      <span className="kuba-panel-edge" aria-hidden="true" />
      <span className="kuba-band pointer-events-none absolute inset-x-0 bottom-0 z-[5]" aria-hidden="true" />
      <div className="relative z-10">{children}</div>
      {atmosphere && (
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          disabled={reduced}
          aria-pressed={still}
          aria-label={still ? 'Play background motion' : 'Pause background motion'}
          className="region-backdrop-toggle"
          style={{ top: 'auto', bottom: '1.5rem' }}
          data-testid="button-hero-motion"
        >
          {still ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
          <span>{reduced ? 'Motion reduced' : still ? 'Play' : 'Pause'}</span>
        </button>
      )}
    </section>
  );
}
