import { cn } from '@/lib/utils';
import catalog from '@/assets/media/founder/catalog.json';

type PhotoId = keyof typeof catalog.photos;

function assetUrl(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}

interface ArchivePhotoProps {
  id: PhotoId;
  /** Sizes attribute; defaults to a conservative responsive value. */
  sizes?: string;
  className?: string;
  /** Wrapper class: control aspect/box. Without one the natural ratio is used. */
  frameClassName?: string;
  objectPosition?: string;
  caption?: boolean | string;
  priority?: boolean;
  /** Override alt (defaults to catalog neutral alt). */
  alt?: string;
  captionClassName?: string;
}

/**
 * ArchivePhoto — renders an optimized Founder archive photograph using the
 * catalog's srcSet and real dimensions. Natural ratio is preserved unless the
 * caller supplies an aspect via frameClassName (then object-cover with position).
 */
export default function ArchivePhoto({
  id,
  sizes = '(min-width: 1024px) 40vw, 92vw',
  className,
  frameClassName,
  objectPosition = 'center',
  caption = false,
  priority = false,
  alt,
  captionClassName,
}: ArchivePhotoProps) {
  const p = catalog.photos[id];
  const text = typeof caption === 'string' ? caption : p.caption;
  const cropped = Boolean(frameClassName);
  return (
    <figure className={cn('m-0', className)}>
      <div className={cn('relative overflow-hidden rounded-sharp bg-lagoon-800', frameClassName)}>
        <img
          src={assetUrl(`/brand-photos/${p.filename}`)}
          srcSet={p.versions.map((version) => `${assetUrl(`/brand-photos/${version.filename}`)} ${version.width}w`).join(', ')}
          sizes={sizes}
          width={p.width}
          height={p.height}
          alt={alt ?? p.alt}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          data-testid={`img-archive-${id}`}
          className={cn('block w-full', cropped ? 'h-full object-cover' : 'h-auto')}
          style={cropped ? { objectPosition } : undefined}
        />
      </div>
      {caption && (
        <figcaption className={cn('mt-2 text-[11px] leading-relaxed tracking-wide text-ink-700', captionClassName)}>
          {text}
        </figcaption>
      )}
    </figure>
  );
}

export function archiveVideo(id: keyof typeof catalog.videos) {
  const video = catalog.videos[id];
  return {
    ...video,
    videoSrc: assetUrl(video.videoSrc),
    videoFallbackSrc: assetUrl(video.videoFallbackSrc),
    posterSrc: assetUrl(video.posterSrc),
  };
}
