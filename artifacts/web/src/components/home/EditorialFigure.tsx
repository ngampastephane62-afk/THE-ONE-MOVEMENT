import type { HomeMedia } from '@workspace/shared';

/** Renders one Founder-supplied homepage asset through the protected asset endpoint. */
export default function EditorialFigure({ media, className = '', fill = false }: { media: HomeMedia & { src: string }; className?: string; fill?: boolean }) {
  const cls = fill ? 'h-full w-full object-cover' : 'block h-auto w-full rounded-sharp object-cover';
  return (
    <figure className={`he-figure ${className}`} data-testid={`home-editorial-media-${media.key}`}>
      {media.kind === 'video'
        ? <video src={media.src} className={cls} controls playsInline preload="metadata" aria-label={media.alt || undefined} />
        : <img src={media.src} alt={media.alt} className={cls} loading="lazy" decoding="async" />}
      {media.credit && !fill && <figcaption className="he-credit">{media.credit}</figcaption>}
    </figure>
  );
}
