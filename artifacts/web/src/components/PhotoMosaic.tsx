import { cn } from '@/lib/utils';
import PhotoSlot from './PhotoSlot';

interface PhotoMosaicProps {
  /** Ordered list of filenames — missing files render as elegant fallbacks */
  filenames: string[];
  /** Neutral descriptions of the supplied photographs, in filename order. */
  alts?: string[];
  /** Optional matching editorial briefs for missing Founder archive images */
  briefs?: Array<{
    subject: string;
    purpose?: string;
    desktopCrop?: string;
    mobileCrop?: string;
  }>;
  className?: string;
}

/**
 * PhotoMosaic — asymmetric editorial photo grid.
 *
 * Layout (1 large + up to 4 small):
 *   ┌──────────┬────┐
 *   │          │ sm │
 *   │  LARGE   ├────┤
 *   │          │ sm │
 *   └──────────┴────┘
 *
 * The first filename is the large feature image; subsequent images
 * fill the secondary column as squares. Missing files degrade to
 * elegant lagoon-800 fallbacks via PhotoSlot.
 */
export default function PhotoMosaic({
  filenames,
  alts = [],
  briefs = [],
  className,
}: PhotoMosaicProps) {
  if (filenames.length === 0) return null;

  const [primary, ...secondary] = filenames;
  const secondarySlice = secondary.slice(0, 4);

  if (secondarySlice.length === 0) {
    return (
      <div className={cn('w-full', className)}>
        <PhotoSlot
          filename={primary}
          alt={alts[0] ?? ''}
          imageType={briefs[0]?.subject ?? 'Founder image required'}
          purpose={briefs[0]?.purpose}
          aspectRatio="4:3"
          desktopCrop={briefs[0]?.desktopCrop}
          mobileCrop={briefs[0]?.mobileCrop}
          className="w-full aspect-[4/3]"
        />
      </div>
    );
  }

  return (
    <div
      className={cn('grid gap-2', className)}
      style={{ gridTemplateColumns: '3fr 2fr' }}
      data-testid="photo-mosaic"
    >
      {/* Primary — tall portrait */}
      <PhotoSlot
        filename={primary}
        alt={alts[0] ?? ''}
        imageType={briefs[0]?.subject ?? 'Founder image required'}
        purpose={briefs[0]?.purpose}
        aspectRatio="2:3"
        desktopCrop={briefs[0]?.desktopCrop}
        mobileCrop={briefs[0]?.mobileCrop}
        className="w-full h-full min-h-0"
      />

      {/* Secondary column — square thumbnails */}
      <div className={cn('grid gap-2 auto-rows-fr', secondarySlice.length > 2 ? 'grid-cols-2' : 'grid-cols-1')}>
        {secondarySlice.map((filename, i) => (
          <PhotoSlot
            key={i}
            filename={filename}
            alt={alts[i + 1] ?? ''}
            imageType={briefs[i + 1]?.subject ?? 'Founder image required'}
            purpose={briefs[i + 1]?.purpose}
            aspectRatio="1:1"
            desktopCrop={briefs[i + 1]?.desktopCrop}
            mobileCrop={briefs[i + 1]?.mobileCrop}
            className="w-full h-full min-h-0 aspect-square"
          />
        ))}
      </div>
    </div>
  );
}
