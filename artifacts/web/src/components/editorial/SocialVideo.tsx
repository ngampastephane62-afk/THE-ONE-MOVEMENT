import type { VideoHTMLAttributes } from 'react';
import { useDeepLinkFocus } from '@/lib/media-share';
import NativeVideo from './NativeVideo';
import VideoActions from './VideoActions';

export default function SocialVideo({ videoId, title, ...props }: VideoHTMLAttributes<HTMLVideoElement> & { videoId: string; title: string }) {
  const ref = useDeepLinkFocus<HTMLElement>({ videoId });
  return (
    <figure ref={ref} id={`video-${videoId}`} tabIndex={-1} className="scroll-mt-28 outline-none data-[deeplinked=true]:ring-2 data-[deeplinked=true]:ring-gold-400">
      <NativeVideo aria-label={title} {...props} />
      <figcaption className="bg-ivory-100 p-3 text-ink-900">
        <VideoActions videoId={videoId} title={title} />
      </figcaption>
    </figure>
  );
}
