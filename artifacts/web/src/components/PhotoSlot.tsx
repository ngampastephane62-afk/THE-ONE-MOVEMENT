import { useState } from 'react';
import { cn } from '@/lib/utils';
import GeometricAccent from './GeometricAccent';

interface PhotoSlotProps {
  /** Filename only — resolved to /brand-photos/{filename} */
  filename: string;
  /** Alt text for accessibility */
  alt?: string;
  className?: string;
  /**
   * Border radius personality:
   * - 'sharp': 2px — institutional (default)
   * - 'rounded': 8px — softer card context
   */
  variant?: 'sharp' | 'rounded';
  /** Whether to apply the lagoon duotone treatment (hover reveals full color) */
  duotone?: boolean;
}

/**
 * PhotoSlot — the photography pipeline's core rendering unit.
 *
 * Renders a brand photo from /brand-photos/ with:
 * - object-fit cover
 * - lagoon duotone-to-full-color hover treatment (CSS)
 * - lazy loading
 * - Elegant lagoon-800 fallback surface with GeometricAccent when file missing
 *
 * The fallback never shows a broken-image icon or blank white space —
 * the page looks intentional whether images exist or not.
 */
export default function PhotoSlot({
  filename,
  alt = '',
  className,
  variant = 'sharp',
  duotone = true,
}: PhotoSlotProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  const radius = variant === 'rounded' ? '8px' : '2px';

  if (errored) {
    // Elegant fallback: lagoon-800 surface with geometric pattern
    return (
      <span
        aria-hidden="true"
        className={cn('block overflow-hidden relative', className)}
        style={{
          borderRadius: radius,
          backgroundColor: 'hsl(188 66% 16%)',
        }}
      >
        {/* Centered geometric motif */}
        <span className="absolute inset-0 flex flex-col justify-center overflow-hidden opacity-30">
          <GeometricAccent variant="gold-on-lagoon" height={20} />
          <GeometricAccent variant="gold-on-lagoon" height={20} />
          <GeometricAccent variant="gold-on-lagoon" height={20} />
          <GeometricAccent variant="gold-on-lagoon" height={20} />
          <GeometricAccent variant="gold-on-lagoon" height={20} />
          <GeometricAccent variant="gold-on-lagoon" height={20} />
          <GeometricAccent variant="gold-on-lagoon" height={20} />
          <GeometricAccent variant="gold-on-lagoon" height={20} />
        </span>
        {/* Subtle gold radial glow */}
        <span
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 50% 60%, hsl(39 52% 54% / 0.12) 0%, transparent 70%)',
          }}
        />
      </span>
    );
  }

  return (
    <span
      className={cn('block overflow-hidden relative', className)}
      style={{ borderRadius: radius }}
    >
      {/* Loading shimmer — hidden once loaded */}
      {!loaded && (
        <span
          aria-hidden="true"
          className="absolute inset-0"
          style={{ backgroundColor: 'hsl(188 66% 16%)' }}
        />
      )}
      <img
        src={`/brand-photos/${filename}`}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={cn(
          'w-full h-full block',
          duotone ? 'img-duotone' : '',
          loaded ? 'opacity-100' : 'opacity-0',
          'transition-opacity duration-300',
        )}
        style={{
          objectFit: 'cover',
          display: 'block',
        }}
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
      />
    </span>
  );
}
