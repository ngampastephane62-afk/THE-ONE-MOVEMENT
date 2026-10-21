import MediaActions from './MediaActions';

export { videoShareUrl } from '@/lib/media-share';

/** Backward-compatible wrapper: same video IDs, same persisted counts. */
export default function VideoActions({ videoId, title, founder, tone, layout }: { videoId: string; title: string; founder?: boolean; tone?: 'light' | 'dark'; layout?: 'default' | 'row' }) {
  return <MediaActions videoId={videoId} title={title} founder={founder} tone={tone} layout={layout} className="mt-3" />;
}
