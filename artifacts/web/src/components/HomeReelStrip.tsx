import { useEffect, useRef, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ArrowLeft, ArrowRight, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import VideoActions from './editorial/VideoActions';

const NEW_REEL_ID = 'home-we-are-one-2026';
function initialReels() {
  const requested = new URLSearchParams(window.location.search).get('video') ||
    window.location.hash.replace(/^#video-/, '');
  // Historical links retain the original film and its own reactions.
  const legacyFirst = requested === 'home-reel-1';
  const existing = [1, 2, 3].map((number) => {
    const isNew = number === 1 && !legacyFirst;
    const file = isNew ? 'we-are-one-2026' : `reel-${number}`;
    return {
      number,
      id: isNew ? NEW_REEL_ID : `home-reel-${number}`,
      title: isNew ? 'We Are One — for peace and unity' : `The One Movement — reel ${number}`,
      video: `${import.meta.env.BASE_URL}api/home-reels/${file}.mp4`,
      webm: isNew ? `${import.meta.env.BASE_URL}api/home-reels/${file}.webm` : undefined,
      poster: `${import.meta.env.BASE_URL}api/home-reels/${file}.webp`,
      duration: isNew ? 51080 : 8000,
    };
  });
  return [...existing, ...[
    { file: 'movement-vision-2026', title: 'The One Movement — a shared vision', duration: 52734 },
    { file: 'movement-together-2026', title: 'The One Movement — together as one', duration: 30000 },
  ].map((reel, index) => ({
    number: index + existing.length + 1,
    id: `home-${reel.file}`,
    title: reel.title,
    video: `${import.meta.env.BASE_URL}api/home-reels/${reel.file}.mp4`,
    webm: `${import.meta.env.BASE_URL}api/home-reels/${reel.file}.webm`,
    poster: `${import.meta.env.BASE_URL}api/home-reels/${reel.file}.webp`,
    duration: reel.duration,
  }))];
}

export default function HomeReelStrip() {
  const [reels] = useState(initialReels);
  const requestedId = new URLSearchParams(window.location.search).get('video') || window.location.hash.replace(/^#video-/, '');
  const requested = Math.max(0, reels.findIndex(reel => reel.id === requestedId));
  const [carouselRef, carousel] = useEmblaCarousel({ loop: true, align: 'center', startIndex: requested });
  const container = useRef<HTMLDivElement>(null);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const [active, setActive] = useState(requested);
  const [visible, setVisible] = useState(false);
  // A shared reel link opens paused so the visitor lands on that reel.
  const [playing, setPlaying] = useState(() => !requestedId.startsWith('home-'));
  const [sound, setSound] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [failed, setFailed] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const node = container.current;
    if (!node) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => {
      setReducedMotion(motion.matches);
      if (motion.matches) setPlaying(false);
    };
    updateMotion();
    motion.addEventListener('change', updateMotion);
    if (requestedId.startsWith('home-')) {
      window.setTimeout(() => node.scrollIntoView({ block: 'center', behavior: motion.matches ? 'auto' : 'smooth' }), 120);
    }
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.1 });
    observer.observe(node);
    return () => { observer.disconnect(); motion.removeEventListener('change', updateMotion); };
  }, []);

  useEffect(() => {
    if (!carousel) return;
    const select = () => { setActive(carousel.selectedScrollSnap()); setSound(false); setFailed(false); setBlocked(false); };
    carousel.on('select', select);
    return () => { carousel.off('select', select); };
  }, [carousel]);

  useEffect(() => {
    videos.current.forEach((video, index) => {
      if (!video) return;
      video.muted = !sound || index !== active;
      if (visible && playing && index === active) {
        void video.play().then(() => {
          if (index === active) setBlocked(false);
        }).catch(() => {
          if (index === active) setBlocked(true);
        });
      } else video.pause();
    });
  }, [visible, playing, active, sound]);

  useEffect(() => {
    if (!carousel || !visible || !playing || sound || reducedMotion) return;
    // Give each newly supplied film its full running time before moving on.
    const duration = reels[active]?.duration ?? 8000;
    const timer = window.setInterval(() => carousel.scrollNext(), duration);
    return () => window.clearInterval(timer);
  }, [carousel, visible, playing, sound, reducedMotion, active]);

  const playFromTap = () => {
    setPlaying(true);
    const video = videos.current[active];
    if (video) void video.play().catch(() => setBlocked(true));
  };

  const controlClass = 'flex h-10 w-10 items-center justify-center rounded-full border border-gold-500/50 bg-lagoon-900/90 text-gold-400 hover:bg-lagoon-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400 focus-visible:outline-offset-2';

  return (
    <div ref={container} id="home-reels" className="w-full max-w-sm scroll-mt-28" data-testid="home-reel-strip" role="region" aria-roledescription="carousel" aria-label={`The One Movement — ${reels.length} reels`}>
      <div ref={carouselRef} className="overflow-hidden rounded-sharp border border-gold-500/30 bg-lagoon-800 shadow-xl">
        <div className="flex touch-pan-y">
          {reels.map((reel, index) => (
            <div id={`video-${reel.id}`} key={reel.id} className="min-w-0 flex-[0_0_100%]" role="group" aria-roledescription="slide" aria-label={`Reel ${reel.number} of ${reels.length}`} aria-hidden={active !== index}>
              <video
                ref={(node) => { videos.current[index] = node; }}
                poster={reel.poster}
                muted
                loop
                playsInline
                preload="none"
                className="h-auto max-h-[80vh] w-full object-contain bg-ink-900"
                aria-label={reel.title}
                onError={() => { if (active === index) setFailed(true); }}
                onPlaying={() => { if (active === index) { setBlocked(false); setFailed(false); } }}
              >
                {reel.webm && <source src={reel.webm} type="video/webm" />}
                <source src={reel.video} type="video/mp4" />
              </video>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex gap-2">
          <button type="button" className={controlClass} aria-label="Previous reel" onClick={() => carousel?.scrollPrev()}><ArrowLeft size={18} /></button>
          <button type="button" className={controlClass} aria-label="Next reel" onClick={() => carousel?.scrollNext()}><ArrowRight size={18} /></button>
        </div>
        <div className="flex gap-1" aria-label="Choose a reel">
          {reels.map((reel, index) => <button key={reel.number} type="button" aria-label={`Go to reel ${reel.number}`} aria-current={active === index ? 'true' : undefined} onClick={() => carousel?.scrollTo(index)} className="flex h-9 w-5 items-center justify-center"><span className={`h-1.5 rounded-full transition-all ${active === index ? 'w-5 bg-gold-400' : 'w-1.5 bg-ivory-300/40'}`} /></button>)}
        </div>
        <div className="flex gap-2">
          <button type="button" className={controlClass} aria-label={playing && !blocked ? 'Pause reels' : 'Play reels'} onClick={() => playing && !blocked ? setPlaying(false) : playFromTap()}>{playing && !blocked ? <Pause size={18} /> : <Play size={18} />}</button>
          <button type="button" className={controlClass} aria-label={sound ? 'Mute reel' : 'Unmute reel'} aria-pressed={sound} onClick={() => setSound(!sound)}>{sound ? <Volume2 size={18} /> : <VolumeX size={18} />}</button>
        </div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-ivory-200">The One Movement · Reel {active + 1} / {reels.length}</p>
      {/* Any interaction with reactions stops auto-advance so a comment draft never moves to another reel. */}
      <div className="mt-4 bg-ivory-100 p-3 text-ink-900" onFocusCapture={() => setPlaying(false)} onPointerDownCapture={() => setPlaying(false)}>
        <VideoActions key={active} videoId={reels[active]?.id ?? NEW_REEL_ID} title={reels[active]?.title ?? 'The One Movement'} />
      </div>
      {(blocked || failed) && <p role="status" className="mt-2 text-xs text-ivory-200">{failed ? 'This reel could not load. Try the next reel or reload the page.' : 'Tap play to start the reels.'}</p>}
    </div>
  );
}
