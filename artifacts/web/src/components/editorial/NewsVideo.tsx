import { useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCw, Volume2, VolumeX } from 'lucide-react';
import { useDeepLinkFocus } from '@/lib/media-share';
import type { EditorialVideoNews } from '@/lib/editorial-news';
import VideoActions from './VideoActions';

/**
 * Vertical 9:16 editorial video. Never autoplays; controls sit outside the
 * frame's clip, and the reaction strip sits below so it cannot be cut off.
 */
export default function NewsVideo({ item, compact = false }: { item: EditorialVideoNews; compact?: boolean }) {
  const v = item.video;
  const video = useRef<HTMLVideoElement>(null);
  const anchor = useDeepLinkFocus<HTMLElement>({ videoId: v.id });
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState('');
  const [posterOk, setPosterOk] = useState(true);
  useEffect(() => { const el = video.current; if (el) el.muted = muted; }, [muted]);

  const toggle = async () => {
    const el = video.current;
    if (!el) return;
    if (el.paused) { try { await el.play(); setError(''); } catch { setError('The video could not start. Try again.'); } }
    else el.pause();
  };
  const btn = 'inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-full border border-ivory-100/40 bg-lagoon-900/70 px-3 text-xs font-semibold text-ivory-100 backdrop-blur-sm hover:border-gold-400 hover:text-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400';

  return (
    <figure ref={anchor} id={`video-${v.id}`} tabIndex={-1} className="m-0 scroll-mt-28 outline-none data-[deeplinked=true]:ring-2 data-[deeplinked=true]:ring-gold-400 data-[deeplinked=true]:ring-offset-4">
      <div className={`relative mx-auto aspect-[9/16] w-full overflow-hidden rounded-sharp border border-gold-500/30 bg-lagoon-900 ${compact ? 'max-w-[18rem]' : 'max-w-[26rem]'}`}>
        <video
          ref={video}
          className="absolute inset-0 h-full w-full object-contain"
          poster={posterOk ? v.poster : undefined}
          playsInline
          controls={playing}
          preload="none"
          aria-label={v.label}
          width={v.width}
          height={v.height}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onError={() => setError('This video could not be loaded right now.')}
          data-testid={`video-${v.id}`}
        >
          <source src={v.src} type="video/mp4" />
        </video>
        {!posterOk && !playing && <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,hsl(340_70%_70%/.35),transparent_60%)]" aria-hidden />}
        <img src={v.poster} alt="" className="hidden" onError={() => setPosterOk(false)} />
        {!playing && (
          <button type="button" onClick={toggle} className="group absolute inset-0 flex items-end justify-center bg-gradient-to-t from-lagoon-900/85 via-transparent to-transparent p-5 focus-visible:outline-none" aria-label={`Play video: ${item.title}`} data-testid={`button-play-${v.id}`}>
            <span className="inline-flex items-center gap-2 rounded-full bg-[hsl(338_62%_86%)] px-5 py-3 text-sm font-semibold text-[hsl(338_55%_22%)] shadow-lg transition-transform group-hover:scale-[1.03] group-focus-visible:ring-2 group-focus-visible:ring-gold-400 motion-reduce:transition-none">
              <Play className="h-4 w-4 fill-current" aria-hidden />Watch · {v.durationLabel}
            </span>
          </button>
        )}
      </div>
      <div className="mx-auto mt-3 flex max-w-[26rem] flex-wrap items-center justify-center gap-2" aria-label="Video controls">
        <button type="button" className={btn} onClick={toggle} aria-label={playing ? 'Pause video' : 'Play video'} data-testid={`button-playback-${v.id}`}>{playing ? <Pause className="h-4 w-4" aria-hidden /> : <Play className="h-4 w-4" aria-hidden />}{playing ? 'Pause' : 'Play'}</button>
        <button type="button" className={btn} onClick={() => setMuted((m) => !m)} aria-pressed={muted} aria-label={muted ? 'Unmute video' : 'Mute video'} data-testid={`button-mute-${v.id}`}>{muted ? <VolumeX className="h-4 w-4" aria-hidden /> : <Volume2 className="h-4 w-4" aria-hidden />}{muted ? 'Sound off' : 'Sound on'}</button>
      </div>
      {error && (
        <p role="alert" className="mx-auto mt-3 flex max-w-[26rem] items-center justify-center gap-2 text-sm text-crimson-700">
          {error}
          <button type="button" className="inline-flex items-center gap-1 underline" onClick={() => { setError(''); video.current?.load(); }}><RotateCw className="h-3.5 w-3.5" aria-hidden />Reload</button>
        </p>
      )}
      <figcaption className="mx-auto mt-3 max-w-[26rem] text-center text-[11px] leading-relaxed tracking-wide text-ink-700">
        <a href={item.source.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-8 items-center underline underline-offset-4 hover:text-lagoon-900" data-testid="link-video-emaar-source">
          {item.credit}<span className="sr-only"> (opens in a new tab)</span>
        </a>
      </figcaption>
      {<div className="mx-auto max-w-xl"><VideoActions videoId={v.id} title={item.title} /></div>}
    </figure>
  );
}
