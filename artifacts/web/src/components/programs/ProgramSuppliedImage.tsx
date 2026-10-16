import { cn } from '@/lib/utils';
import { programAssetSource } from '@/lib/media-share';
import PhotoActions from '@/components/editorial/PhotoActions';
import runwayGroup from '@/assets/media/programs/fashion-night-runway-group.webp';
import speakerMic from '@/assets/media/programs/archive-speaker-microphone.webp';
import fashionPortrait from '@/assets/media/programs/fashion-portrait.webp';

/**
 * Supplied archive photographs used as illustration for programs without
 * their own event photography. Captions say so plainly: these images do not
 * document an edition of the program they illustrate.
 */
export const SUPPLIED_IMAGES = {
  'fashion-night': {
    src: runwayGroup,
    source: programAssetSource('fashion-night-runway-group.webp'),
    alt: 'Models in vivid printed gowns walking an open-air runway at night under stage lights',
    caption: 'Night runway · supplied archive · illustrative of The One Fashion Night vision',
    position: 'center 40%',
  },
  'investment-forum': {
    src: speakerMic,
    source: programAssetSource('archive-speaker-microphone.webp'),
    alt: 'A woman speaking into a microphone at a podium on stage',
    caption: 'Speaker on stage · supplied archive · illustrative only, not an Investment Forum event',
    position: 'center 25%',
  },
  'fashion-portrait': {
    src: fashionPortrait,
    source: programAssetSource('fashion-portrait.webp'),
    alt: 'Editorial fashion portrait of a man in a sculpted cape against a village landscape at dusk',
    caption: 'Editorial fashion portrait · supplied archive',
    position: 'center 20%',
  },
} as const;

export type SuppliedImageId = keyof typeof SUPPLIED_IMAGES;

interface Props {
  slug: SuppliedImageId;
  className?: string;
  frameClassName?: string;
  captionClassName?: string;
  /** Card usage: no caption below, small badge instead. */
  compact?: boolean;
}

export default function ProgramSuppliedImage({ slug, className, frameClassName, captionClassName, compact }: Props) {
  const img = SUPPLIED_IMAGES[slug];
  return (
    <figure className={cn('group', className)} data-testid={`img-supplied-${slug}`}>
      <div className={cn('relative overflow-hidden rounded-sharp bg-lagoon-900', frameClassName)}>
        <img
          src={img.src}
          alt={img.alt}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          style={{ objectPosition: img.position }}
        />
        {compact && (
          <span className="absolute bottom-2 left-2 bg-lagoon-900/80 px-2 py-1 text-[9px] uppercase tracking-[0.18em] text-ivory-200 backdrop-blur-sm">
            Illustrative archive
          </span>
        )}
      </div>
      {!compact && (
        <figcaption className={cn('mt-2 text-[11px] leading-relaxed text-ink-700', captionClassName)}>{img.caption}</figcaption>
      )}
      {!compact && <PhotoActions source={img.source} title={img.caption} tone={captionClassName?.includes('ivory') ? 'dark' : 'light'} />}
    </figure>
  );
}
