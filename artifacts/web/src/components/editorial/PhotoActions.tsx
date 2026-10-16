import { cn } from '@/lib/utils';
import { canonicalMediaSource, mediaAnchorId, useDeepLinkFocus } from '@/lib/media-share';
import MediaActions from './MediaActions';

/**
 * Generic action interface for any editorial photograph:
 *   <PhotoActions source="/brand-photos/x.webp" title="..." />
 * `source` is the canonical public path (or an approved original URL).
 * Rendered as a sibling below the image so overflow-hidden frames never clip it.
 * Also gives the photo a deep-link anchor for ?media=<source>#media-<hash>.
 */
export default function PhotoActions({ source, title, tone = 'light', className }: { source: string; title: string; tone?: 'light' | 'dark'; className?: string }) {
  const s = canonicalMediaSource(source);
  const ref = useDeepLinkFocus<HTMLDivElement>({ source: s });
  return (
    <div ref={ref} id={mediaAnchorId(s)} tabIndex={-1} className={cn('scroll-mt-28 pt-3 outline-none data-[deeplinked=true]:ring-2 data-[deeplinked=true]:ring-gold-400 data-[deeplinked=true]:ring-offset-4', className)}>
      <MediaActions source={s} title={title} tone={tone} compact />
    </div>
  );
}
