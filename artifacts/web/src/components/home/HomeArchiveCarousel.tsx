import { useCallback, useEffect, useRef, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import catalog from '@/assets/media/founder/catalog.json';
import runwayGroup from '@/assets/media/programs/fashion-night-runway-group.webp';
import fashionPortrait from '@/assets/media/programs/fashion-portrait.webp';
import './home-experience.css';

type PhotoId = keyof typeof catalog.photos;
interface Slide { key: string; src: string; srcSet?: string; alt: string; caption: string }

const base = (p: string) => `${import.meta.env.BASE_URL}brand-photos/${p}`;
const fromCatalog = (id: PhotoId, caption?: string): Slide => {
  const p = catalog.photos[id];
  return {
    key: id,
    src: base(p.filename),
    srcSet: p.versions.map((v) => `${base(v.filename)} ${v.width}w`).join(', '),
    alt: p.alt,
    caption: caption ?? p.caption,
  };
};

// Curated for breadth: community, culture, runway and partner institutions.
// Leadership encounters remain on program pages; this strip leads with people.
const SLIDES: Slide[] = [
  fromCatalog('community-outreach', 'Community & impact'),
  { key: 'runway-group', src: runwayGroup, alt: 'Models in printed gowns on an open-air night runway', caption: 'Night runway · supplied archive' },
  fromCatalog('cultural-performance'),
  fromCatalog('institutional-dialogue'),
  fromCatalog('casting-group'),
  fromCatalog('global-encounter'),
  { key: 'fashion-portrait', src: fashionPortrait, alt: 'Editorial fashion portrait at dusk', caption: 'Editorial fashion portrait · supplied archive' },
  fromCatalog('conversation'),
  fromCatalog('human-connection'),
];

const INTERVAL = 6000;

export default function HomeArchiveCarousel() {
  const [viewportRef, embla] = useEmblaCarousel({ loop: true, align: 'center' });
  const rootRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [onscreen, setOnscreen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnscreen(e.isIntersecting && e.intersectionRatio >= 0.35), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!embla) return;
    const update = () => setSelected(embla.selectedScrollSnap());
    update();
    embla.on('select', update);
    embla.on('reInit', update);
    return () => { embla.off('select', update); embla.off('reInit', update); };
  }, [embla]);

  const playing = !reduced && !userPaused && onscreen && !hovered && !focused;

  useEffect(() => {
    if (!embla || !playing) return;
    const t = window.setInterval(() => embla.scrollNext(), INTERVAL);
    return () => window.clearInterval(t);
  }, [embla, playing, selected]);

  const prev = useCallback(() => embla?.scrollPrev(), [embla]);
  const next = useCallback(() => embla?.scrollNext(), [embla]);

  return (
    <div
      ref={rootRef}
      className="tomi-archive-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label="Movement in action archive"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocused(false); }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') prev();
        if (e.key === 'ArrowRight') next();
      }}
    >
      <div ref={viewportRef} className="overflow-hidden" aria-live={playing ? 'off' : 'polite'}>
        <div className="flex touch-pan-y">
          {SLIDES.map((s, i) => (
            <figure
              key={s.key}
              className="tomi-archive-slide m-0 min-w-0"
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${SLIDES.length}`}
              data-active={selected === i}
              data-testid={`slide-archive-${s.key}`}
            >
              <div className="tomi-archive-frame">
                <img
                  src={s.src}
                  srcSet={s.srcSet}
                  sizes="(min-width: 1024px) 70vw, 92vw"
                  alt={s.alt}
                  loading={i < 2 ? 'eager' : 'lazy'}
                  decoding="async"
                  draggable={false}
                />
              </div>
              <figcaption className="mt-3 text-[11px] leading-relaxed tracking-wide text-ivory-300">{s.caption}</figcaption>
            </figure>
          ))}
        </div>
      </div>

      <div className="tomi-archive-controls">
        <div className="flex items-center gap-2">
          <button type="button" onClick={prev} aria-label="Previous photo" className="tomi-archive-btn" data-testid="button-archive-prev"><ChevronLeft size={18} /></button>
          <button type="button" onClick={next} aria-label="Next photo" className="tomi-archive-btn" data-testid="button-archive-next"><ChevronRight size={18} /></button>
          {!reduced && (
            <button
              type="button"
              onClick={() => setUserPaused((p) => !p)}
              aria-pressed={userPaused}
              aria-label={userPaused ? 'Resume slideshow' : 'Pause slideshow'}
              className="tomi-archive-btn"
              data-testid="button-archive-toggle"
            >
              {userPaused ? <Play size={16} /> : <Pause size={16} />}
            </button>
          )}
          <span className="ml-2 font-mono text-[11px] tracking-[0.18em] text-gold-400" data-testid="text-archive-count">
            {String(selected + 1).padStart(2, '0')} / {SLIDES.length}
          </span>
        </div>
        <div className="tomi-archive-dots" aria-label="Choose a photo">
          {SLIDES.map((s, i) => (
            <button
              key={s.key}
              type="button"
              aria-label={`Show photo ${i + 1}`}
              aria-current={selected === i}
              onClick={() => embla?.scrollTo(i)}
              data-testid={`button-archive-dot-${i}`}
            >
              <span data-active={selected === i} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
