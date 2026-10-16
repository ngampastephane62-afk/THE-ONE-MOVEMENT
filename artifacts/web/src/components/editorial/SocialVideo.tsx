import type { VideoHTMLAttributes } from 'react';
import { useEffect, useRef } from 'react';
import NativeVideo from './NativeVideo';
import VideoActions from './VideoActions';

export default function SocialVideo({ videoId, title, ...props }: VideoHTMLAttributes<HTMLVideoElement> & { videoId: string; title: string }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (window.location.hash === `#video-${videoId}`) ref.current?.scrollIntoView({ block: 'start' });
  }, [videoId]);
  return (
    <figure ref={ref} id={`video-${videoId}`} className="scroll-mt-28">
      <NativeVideo aria-label={title} {...props} />
      <figcaption className="bg-ivory-100 p-3 text-ink-900">
        <VideoActions videoId={videoId} title={title} />
      </figcaption>
    </figure>
  );
}
