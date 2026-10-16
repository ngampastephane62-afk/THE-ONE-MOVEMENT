import MediaActions from './MediaActions';

export { videoShareUrl } from '@/lib/media-share';

/** Backward-compatible wrapper: same video IDs, same persisted counts. */
export default function VideoActions({ videoId, title, founder, tone }: { videoId: string; title: string; founder?: boolean; tone?: 'light' | 'dark' }) {
  return <MediaActions videoId={videoId} title={title} founder={founder} tone={tone} className="mt-3" />;
}
