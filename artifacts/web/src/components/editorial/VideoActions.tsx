import MediaActions from './MediaActions';

export { videoShareUrl } from '@/lib/media-share';

/** Backward-compatible wrapper: same video IDs, same persisted counts. */
export default function VideoActions({ videoId, title, founder, tone, layout, shareExtrasBelow }: { videoId: string; title: string; founder?: boolean; tone?: 'light' | 'dark'; layout?: 'default' | 'row'; shareExtrasBelow?: boolean }) {
  return <MediaActions videoId={videoId} title={title} founder={founder} tone={tone} layout={layout} shareExtrasBelow={shareExtrasBelow} className="mt-3" />;
}
