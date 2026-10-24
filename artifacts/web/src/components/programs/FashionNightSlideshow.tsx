import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import PhotoActions from '@/components/editorial/PhotoActions';
import { programAssetSource } from '@/lib/media-share';
import { FASHION_NIGHT_PHOTOS, type ProgrammeArchivePhoto } from '@/lib/programme-photo-archives';

// Founder-supplied order. Natural dimensions preserve the whole photograph,
// including photographer marks, without a coloured frame or letterboxing.
export function ProgrammeArchiveSlideshow({ photos, title, className, testId, engagementSource }: {
  photos: ProgrammeArchivePhoto[]; title: string; className: string; testId: string; engagementSource?: string;
}) {
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState<Record<number, boolean>>({});
  const [failed, setFailed] = useState(-1);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  const [hovered, setHovered] = useState(false);
  const reduced = useReducedMotion();
  const root = useRef<HTMLElement>(null);
  const photo = photos[index];

  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .25 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const update = () => setTabVisible(!document.hidden);
    update();
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);
  useEffect(() => {
    const next = new Image();
    next.src = photos[(index + 1) % photos.length].src;
  }, [index, photos]);
  useEffect(() => {
    if (paused || reduced || !visible || !tabVisible || hovered || !loaded[index]) return;
    const timer = window.setTimeout(() => {
      setIndex(i => (i + 1) % photos.length);
    }, 3500);
    return () => window.clearTimeout(timer);
  }, [index, loaded, paused, reduced, visible, tabVisible, hovered, photos]);

  const advance = (step: number) => {
    setPaused(true);
    setIndex(i => (i + step + photos.length) % photos.length);
  };

  return (
    <figure ref={root} className={className}
      aria-label={title} aria-roledescription="carousel"
      data-testid={testId}>
      <div className="relative overflow-hidden"
        onPointerEnter={e => { if (e.pointerType === 'mouse') setHovered(true); }}
        onPointerLeave={() => setHovered(false)}>
        <AnimatePresence initial={false} mode="popLayout">
          {failed === index ? (
            <p key={`error-${index}`} className="py-8 text-sm" role="status">Photo unavailable. Please select another photograph.</p>
          ) : (
            <motion.img key={index} src={photo.src} alt={photo.alt}
              width={photo.w} height={photo.h} loading="lazy" decoding="async" draggable={false}
              className="block h-auto w-full"
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0 : .65, ease: 'easeInOut' }}
              onLoad={() => setLoaded(previous => ({ ...previous, [index]: true }))}
              onError={() => { setLoaded(previous => ({ ...previous, [index]: false })); setFailed(index); }}
            />
          )}
        </AnimatePresence>
      </div>
      <figcaption className="mt-2 whitespace-pre-line break-words text-[11px] leading-relaxed text-ink-700">
        {photo.caption || title}
      </figcaption>
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex gap-1">
          <button type="button" onClick={() => advance(-1)} aria-label="Previous photograph" className="inline-flex h-11 w-11 items-center justify-center border border-ink-700/20">
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <button type="button" onClick={() => advance(1)} aria-label="Next photograph" className="inline-flex h-11 w-11 items-center justify-center border border-ink-700/20">
            <ChevronRight size={18} aria-hidden="true" />
          </button>
          {!reduced && <button type="button" onClick={() => setPaused(v => !v)} aria-label={paused ? 'Play slideshow' : 'Pause slideshow'} className="inline-flex h-11 w-11 items-center justify-center border border-ink-700/20">
            {paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
          </button>}
        </div>
        <span className="text-xs tabular-nums" aria-live={paused || reduced ? 'polite' : 'off'}>{index + 1} / {photos.length}</span>
      </div>
      {/* Preserve this placement's existing engagement and shared-link identity. */}
      {engagementSource && <PhotoActions source={engagementSource} title={title} />}
    </figure>
  );
}

export default function FashionNightSlideshow({ captions }: { captions?: Record<string, string> }) {
  const photos = useMemo(() => FASHION_NIGHT_PHOTOS.map(photo => ({ ...photo, caption: captions?.[photo.id] })), [captions]);
  return <ProgrammeArchiveSlideshow photos={photos} title="Fashion archive · supplied photographs"
    className="mx-auto w-full max-w-sm lg:col-span-5 lg:col-start-8" testId="fashion-night-slideshow"
    engagementSource={programAssetSource('fashion-portrait.webp')} />;
}
