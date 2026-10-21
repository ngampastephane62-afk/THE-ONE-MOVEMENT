import { useEffect, useRef, useState } from 'react';
import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import VideoActions from '@/components/editorial/VideoActions';
import { useDeepLinkFocus } from '@/lib/media-share';

const media = (name: string) => `${import.meta.env.BASE_URL}api/program-media/${name}`;

export const PROGRAMME_FILMS = {
  'fashion-knight-2026': {
    file: 'fashion-knight-2026', ratio: '1080 / 1298',
    title: 'The One Fashion Week International · 22 December 2026 · official artwork',
    alt: 'Official animated artwork: the Founder as a horseman, Chevalier de la paix et de l’unité, for The One Fashion Week International, Dubai, 22 December 2026',
  },
  'awards-rosina-2027': {
    file: 'awards-rosina-2027', ratio: '1080 / 1440',
    title: 'Rosina · producer and speaker · The One Awards',
    alt: 'Stylized supplied clip of Rosina, producer, partner and speaker of The One Awards',
  },
} as const;
export type ProgrammeFilmId = keyof typeof PROGRAMME_FILMS;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const q = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!q) return;
    const on = () => setReduced(q.matches);
    q.addEventListener('change', on);
    return () => q.removeEventListener('change', on);
  }, []);
  return reduced;
}

/** Static poster — safe inside card links (no controls). */
export function ProgrammeFilmPoster({ id, className = '' }: { id: ProgrammeFilmId; className?: string }) {
  const f = PROGRAMME_FILMS[id];
  return (
    <figure className={`overflow-hidden bg-lagoon-900 ${className}`} style={{ aspectRatio: f.ratio }} data-testid={`poster-${id}`}>
      <img src={media(`${f.file}.webp`)} alt={f.alt} className="block h-full w-full object-contain" loading="lazy" />
    </figure>
  );
}

/** Muted looping film with play/pause and sound controls; poster-only under reduced motion. */
export default function ProgrammeFilm({ id, className = '', actions = true, tone = 'light', caption, presentation = 'default' }: { id: ProgrammeFilmId; className?: string; actions?: boolean; tone?: 'light' | 'dark'; caption?: string; /** 'home': no autoplay, preload none, user-initiated play, pauses offscreen, one-row actions. */ presentation?: 'default' | 'home' }) {
  const home = presentation === 'home';
  const f = PROGRAMME_FILMS[id];
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLVideoElement>(null);
  const anchor = useDeepLinkFocus<HTMLDivElement>({ videoId: id });
  const [playing, setPlaying] = useState(!reduced && !home);
  const [muted, setMuted] = useState(true);
  const [failed, setFailed] = useState(false);
  const showVideo = !failed && (home ? playing : (!reduced || playing));

  useEffect(() => { if (reduced) setPlaying(false); }, [reduced]);
  const figRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!home || !figRef.current || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([en]) => { if (!en.isIntersecting && ref.current && !ref.current.paused) ref.current.pause(); }, { threshold: 0.15 });
    io.observe(figRef.current);
    return () => io.disconnect();
  }, [home]);
  useEffect(() => {
    if (!home || !playing) return;
    const v = ref.current;
    if (v && v.paused) v.play().catch(() => setPlaying(false));
  }, [home, playing]);

  const toggle = () => {
    const v = ref.current;
    if (!v) { setPlaying(true); return; }
    if (v.paused) { v.play().then(() => setPlaying(true)).catch(() => setPlaying(false)); }
    else { v.pause(); setPlaying(false); }
  };
  const toggleSound = () => {
    const v = ref.current;
    const next = !muted;
    setMuted(next);
    if (v) { v.muted = next; if (!next && v.paused) v.play().then(() => setPlaying(true)).catch(() => {}); }
  };
  const btn = 'inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-sharp border border-gold-400/60 bg-lagoon-900/80 px-3 text-xs uppercase tracking-[0.14em] text-ivory-100 backdrop-blur hover:bg-lagoon-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400';

  return (
    <div ref={anchor} id={`video-${id}`} tabIndex={-1} className={`scroll-mt-28 outline-none ${className}`}>
      <figure ref={figRef} className="relative overflow-hidden bg-lagoon-900" style={{ aspectRatio: f.ratio }} data-testid={`film-${id}`}>
        {showVideo ? (
          <video
            ref={ref}
            className="block h-full w-full object-contain"
            poster={media(`${f.file}.webp`)}
            autoPlay={playing}
            muted={muted}
            loop
            playsInline
            preload={home ? 'none' : 'metadata'}
            aria-label={f.alt}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onError={() => setFailed(true)}
          >
            <source src={media(`${f.file}.webm`)} type="video/webm" />
            <source src={media(`${f.file}.mp4`)} type="video/mp4" />
          </video>
        ) : (
          <img src={media(`${f.file}.webp`)} alt={f.alt} className="block h-full w-full object-contain" loading={home ? 'lazy' : undefined} decoding={home ? 'async' : undefined} />
        )}
        {!failed && (
          <div className="absolute bottom-3 right-3 flex gap-2">
            <button type="button" className={btn} onClick={toggle} aria-label={playing ? 'Pause' : 'Play'} data-testid={`button-play-${id}`}>
              {playing ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
            </button>
            <button type="button" className={btn} onClick={toggleSound} aria-label={muted ? 'Sound on' : 'Sound off'} data-testid={`button-sound-${id}`}>
              {muted ? <VolumeX className="h-4 w-4" aria-hidden="true" /> : <Volume2 className="h-4 w-4" aria-hidden="true" />}
            </button>
          </div>
        )}
      </figure>
      {failed && <p role="alert" className={`mt-2 text-sm ${tone === 'dark' ? 'text-ivory-200' : 'text-ink-800'}`}>
        <span>This video could not be loaded right now.</span>{' '}
        <button type="button" className="min-h-11 underline underline-offset-4" onClick={() => { setFailed(false); setPlaying(true); }}>Retry</button>
      </p>}
      {caption && <p className={`mt-2 text-[11px] leading-relaxed ${tone === 'dark' ? 'text-ivory-300' : 'text-ink-700'}`}>{caption}</p>}
      {actions && <VideoActions videoId={id} title={f.title} tone={tone} layout={home ? 'row' : undefined} />}
    </div>
  );
}
