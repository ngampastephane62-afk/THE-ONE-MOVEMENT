import { useState } from 'react';
import { cn } from '@/lib/utils';

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
  /** Editorial metadata: image type/purpose */
  imageType?: string;
  /** Editorial metadata: exact aspect ratio */
  aspectRatio?: string;
  /** Editorial metadata: why this image belongs in the composition */
  purpose?: string;
  /** Editorial metadata: desktop crop guidance */
  desktopCrop?: string;
  /** Editorial metadata: mobile crop guidance */
  mobileCrop?: string;
  /** CSS object-position used when an approved image is available */
  objectPosition?: string;
  /** Load immediately when the image is above the fold */
  priority?: boolean;
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
 * the page looks intentional whether images exist or not, exposing exact 
 * image-brief metadata when absent.
 */
export default function PhotoSlot({
  filename,
  alt = '',
  className,
  variant = 'sharp',
  duotone = true,
  imageType,
  aspectRatio,
  purpose,
  desktopCrop,
  mobileCrop,
  objectPosition = 'center',
  priority = false,
}: PhotoSlotProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  const radius = variant === 'rounded' ? '8px' : '2px';

  if (errored) {
    // Elegant fallback: lagoon-800 surface with geometric pattern and editorial metadata
    return (
      <span
        aria-hidden={alt ? undefined : true}
        aria-label={alt || undefined}
        role={alt ? 'img' : undefined}
        className={cn('tomi-photo-placeholder flex flex-col items-center justify-center p-6 relative overflow-hidden', className)}
        style={{
          borderRadius: radius,
          backgroundColor: 'hsl(188 66% 16%)', // lagoon-800
          border: '1px solid hsl(188 46% 20%)',
        }}
      >
        {/* Centered geometric motif */}
        <span className="tomi-photo-fallback-lines absolute inset-5" aria-hidden="true">
          <span className="absolute inset-4 border border-gold-500/10" />
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
        {/* Editorial brief shown only while approved photography is absent. */}
        <span className="relative z-10 text-center flex flex-col gap-3 items-center text-ivory-300 opacity-90">
          <span className="mb-2 h-px w-12 bg-gold-500/60" aria-hidden="true" />
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase" style={{ color: 'hsl(39 52% 54%)' }}>
            {imageType || 'Brand photography'}
          </span>
          {purpose && (
            <span className="max-w-xs text-xs leading-relaxed text-ivory-200/75">
              {purpose}
            </span>
          )}
          {(aspectRatio || desktopCrop || mobileCrop) && (
            <span className="max-w-sm text-[10px] font-mono uppercase leading-relaxed tracking-widest opacity-60">
              {aspectRatio && `Aspect: ${aspectRatio}`}
              {aspectRatio && (desktopCrop || mobileCrop) && ` • `}
              {desktopCrop && `Desktop: ${desktopCrop}`}
              {desktopCrop && mobileCrop && ` • `}
              {mobileCrop && `Crop: ${mobileCrop}`}
            </span>
          )}
        </span>
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
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        className={cn(
          'w-full h-full block',
          duotone ? 'img-duotone' : '',
          loaded ? 'opacity-100' : 'opacity-0',
          'transition-opacity duration-300',
        )}
        style={{
          objectFit: 'cover',
          objectPosition,
          display: 'block',
        }}
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
      />
    </span>
  );
}
