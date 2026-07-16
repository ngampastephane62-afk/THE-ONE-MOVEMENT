import { cn } from '@/lib/utils';
import PhotoSlot from './PhotoSlot';

interface PhotoMosaicProps {
  /** Ordered list of filenames — missing files render as elegant fallbacks */
  filenames: string[];
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
  className,
}: PhotoMosaicProps) {
  if (filenames.length === 0) return null;

  const [primary, ...secondary] = filenames;
  const secondarySlice = secondary.slice(0, 4);

  if (secondarySlice.length === 0) {
    return (
      <div className={cn('w-full', className)}>
        <PhotoSlot filename={primary} alt="" className="w-full aspect-[4/3]" />
      </div>
    );
  }

  return (
    <div
      className={cn('grid gap-2', className)}
      style={{ gridTemplateColumns: '3fr 2fr' }}
    >
      {/* Primary — tall portrait */}
      <PhotoSlot
        filename={primary}
        alt=""
        className="w-full aspect-[2/3]"
      />

      {/* Secondary column — square thumbnails */}
      <div className="flex flex-col gap-2">
        {secondarySlice.map((filename, i) => (
          <PhotoSlot
            key={i}
            filename={filename}
            alt=""
            className="w-full aspect-square"
          />
        ))}
      </div>
    </div>
  );
}
