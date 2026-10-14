import { useEffect, useRef, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ArrowLeft, ArrowRight, Pause, Play, Volume2, VolumeX } from 'lucide-react';

const reels = [1, 2, 3].map((number) => ({
  number,
  video: `${import.meta.env.BASE_URL}api/home-reels/reel-${number}.mp4`,
  poster: `${import.meta.env.BASE_URL}api/home-reels/reel-${number}.webp`,
}));

export default function HomeReelStrip() {
  const [carouselRef, carousel] = useEmblaCarousel({ loop: true, align: 'center' });
  const container = useRef<HTMLDivElement>(null);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);
  const [playing, setPlaying] = useState(true);
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
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.1 });
    observer.observe(node);
    return () => { observer.disconnect(); motion.removeEventListener('change', updateMotion); };
  }, []);

  useEffect(() => {
    if (!carousel) return;
    const select = () => { setActive(carousel.selectedScrollSnap()); setSound(false); };
    carousel.on('select', select);
    return () => { carousel.off('select', select); };
  }, [carousel]);

  useEffect(() => {
    videos.current.forEach((video, index) => {
      if (!video) return;
      video.muted = !sound || index !== active;
      if (visible && playing) {
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
    const timer = window.setInterval(() => carousel.scrollNext(), 8000);
    return () => window.clearInterval(timer);
  }, [carousel, visible, playing, sound, reducedMotion, active]);

  const playFromTap = () => {
    setPlaying(true);
    videos.current.forEach((video) => { if (video) void video.play().catch(() => setBlocked(true)); });
  };

  const controlClass = 'flex h-10 w-10 items-center justify-center rounded-full border border-gold-500/50 bg-lagoon-900/90 text-gold-400 hover:bg-lagoon-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400 focus-visible:outline-offset-2';

  return (
    <div ref={container} className="w-full max-w-sm" data-testid="home-reel-strip" role="region" aria-roledescription="carousel" aria-label="The One Movement — three reels">
      <div ref={carouselRef} className="overflow-hidden rounded-sharp border border-gold-500/30 bg-lagoon-800 shadow-xl">
        <div className="flex touch-pan-y">
          {reels.map((reel, index) => (
            <div key={reel.number} className="min-w-0 flex-[0_0_100%]" role="group" aria-roledescription="slide" aria-label={`Reel ${reel.number} of 3`} aria-hidden={active !== index}>
              <video
                ref={(node) => { videos.current[index] = node; }}
                poster={reel.poster}
                muted
                loop
                playsInline
                preload="none"
                className="aspect-[9/16] w-full object-contain bg-ink-900"
                aria-label={`Movement reel ${reel.number}`}
                onError={() => { if (active === index) setFailed(true); }}
                onPlaying={() => { if (active === index) { setBlocked(false); setFailed(false); } }}
              >
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
        <div className="flex gap-2" aria-label="Choose a reel">
          {reels.map((reel, index) => <button key={reel.number} type="button" aria-label={`Go to reel ${reel.number}`} aria-current={active === index ? 'true' : undefined} onClick={() => carousel?.scrollTo(index)} className="flex h-9 w-7 items-center justify-center"><span className={`h-1.5 rounded-full transition-all ${active === index ? 'w-6 bg-gold-400' : 'w-1.5 bg-ivory-300/40'}`} /></button>)}
        </div>
        <div className="flex gap-2">
          <button type="button" className={controlClass} aria-label={playing && !blocked ? 'Pause reels' : 'Play reels'} onClick={() => playing && !blocked ? setPlaying(false) : playFromTap()}>{playing && !blocked ? <Pause size={18} /> : <Play size={18} />}</button>
          <button type="button" className={controlClass} aria-label={sound ? 'Mute reel' : 'Unmute reel'} aria-pressed={sound} onClick={() => setSound(!sound)}>{sound ? <Volume2 size={18} /> : <VolumeX size={18} />}</button>
        </div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-ivory-200">The One Movement · Reel {active + 1} / 3</p>
      {(blocked || failed) && <p role="status" className="mt-2 text-xs text-ivory-200">{failed ? 'This reel could not load. Try the next reel or reload the page.' : 'Tap play to start the reels.'}</p>}
    </div>
  );
}
