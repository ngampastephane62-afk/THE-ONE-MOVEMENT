import { useRef, useState } from 'react';
import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

type MediaKind =
  | 'cinematic-background'
  | 'landscape-video'
  | 'vertical-reel'
  | 'full-width-image'
  | 'portrait-image'
  | 'program-media'
  | 'event-media'
  | 'founder-archive';

interface ResponsiveMediaProps {
  kind: MediaKind;
  label: string;
  purpose: string;
  videoSrc?: string;
  videoFallbackSrc?: string;
  posterSrc?: string;
  className?: string;
  autoPlay?: boolean;
  assetId?: string;
}

/**
 * Media-ready shell for Founder-provided images and video. Landscape on larger
 * screens and Reel-style on mobile, with native media semantics and accessible
 * custom controls when a video source exists.
 */
export default function ResponsiveMedia({
  kind,
  label,
  purpose,
  videoSrc,
  videoFallbackSrc,
  posterSrc,
  className,
  autoPlay = false,
  assetId,
}: ResponsiveMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(autoPlay);
  const [muted, setMuted] = useState(true);
  const [playbackError, setPlaybackError] = useState('');
  const hasMedia = Boolean(videoSrc || posterSrc);

  const togglePlayback = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      try {
        await video.play();
        setPlaybackError('');
      } catch {
        setPlaybackError('Unable to play this video. Please try again.');
      }
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  const toggleMuted = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  return (
    <div
      className={cn(
        'responsive-media group relative overflow-hidden rounded-sharp border border-gold-500/25 bg-lagoon-800',
        className,
      )}
      data-kind={kind}
      data-asset-id={assetId}
      id={assetId?.toLowerCase()}
    >
      {videoSrc ? (
        <video
          ref={videoRef}
          poster={posterSrc}
          className="absolute inset-0 h-full w-full object-contain"
          aria-label={label}
          muted={muted}
          autoPlay={autoPlay}
          loop
          playsInline
          preload={autoPlay ? 'metadata' : 'none'}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onError={() => setPlaybackError('Unable to load this video. Please try again.')}
        >
          <source src={videoSrc} type="video/mp4" />
          {videoFallbackSrc && <source src={videoFallbackSrc} type="video/webm" />}
        </video>
      ) : posterSrc ? (
        <img
          src={posterSrc}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
      ) : null}

      {!videoSrc && (
        <>
          <div className="responsive-media-grid absolute inset-0" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-t from-lagoon-900 via-lagoon-900/30 to-transparent" />
        </>
      )}

      <div className={videoSrc
        ? 'absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end bg-gradient-to-t from-black/65 to-transparent p-4 pt-8'
        : 'relative z-10 flex h-full min-h-[20rem] flex-col justify-end p-6 sm:p-8'
      }>
        {!hasMedia && (
          <div className="mb-auto max-w-sm">
            <p className="text-eyebrow text-gold-400">FOUNDER MEDIA REQUIRED</p>
            <p className="mt-3 text-sm leading-relaxed text-ivory-200">{label}</p>
          </div>
        )}

        <div className={videoSrc ? 'flex justify-end' : 'flex flex-col gap-4 border-t border-ivory-100/15 pt-5 sm:flex-row sm:items-end sm:justify-between'}>
          {!videoSrc && <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-gold-400">
              Type: Video · Desktop: Landscape · Mobile: Reel
            </p>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-ivory-200">{purpose}</p>
          </div>}

          {videoSrc && (
            <div className="flex gap-2" aria-label="Video controls">
              <button
                type="button"
                onClick={togglePlayback}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gold-500/50 text-gold-400 transition-colors hover:bg-gold-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
                aria-label={playing ? 'Pause movement video' : 'Play movement video'}
                data-testid={`button-playback-${assetId ?? kind}`}
              >
                {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
              </button>
              <button
                type="button"
                onClick={toggleMuted}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gold-500/50 text-gold-400 transition-colors hover:bg-gold-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
                aria-label={muted ? 'Unmute movement video' : 'Mute movement video'}
                aria-pressed={!muted}
                data-testid={`button-mute-${assetId ?? kind}`}
              >
                {muted ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
              </button>
            </div>
          )}
        </div>
        {playbackError && <p role="alert" className="mt-3 text-sm text-white">{playbackError}</p>}
      </div>
    </div>
  );
}