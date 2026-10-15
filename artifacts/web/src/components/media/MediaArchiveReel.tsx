import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import catalog from '@/assets/media/founder/catalog.json';
import { SUPPLIED_IMAGES } from '@/components/programs/ProgramSuppliedImage';
import './media-archive.css';

type PhotoId = keyof typeof catalog.photos;
interface Frame {
  key: string;
  src: string;
  srcSet?: string;
  alt: string;
  chapter: string;
  title: string;
  context: string;
  source: string;
}

const base = (p: string) => `${import.meta.env.BASE_URL}brand-photos/${p}`;
const photo = (id: PhotoId, chapter: string, title: string, context: string): Frame => {
  const p = catalog.photos[id];
  const isPartner = p.caption.includes('TOMI partner');
  return {
    key: id,
    src: base(p.filename),
    srcSet: p.versions.map((v) => `${base(v.filename)} ${v.width}w`).join(', '),
    alt: p.alt,
    chapter,
    title,
    context,
    source: isPartner ? 'TOMI partner' : 'Founder archive',
  };
};
const supplied = (id: keyof typeof SUPPLIED_IMAGES, chapter: string, title: string, context: string): Frame => ({
  key: id, src: SUPPLIED_IMAGES[id].src, alt: SUPPLIED_IMAGES[id].alt, chapter, title, context, source: 'Supplied archive',
});

// Captions describe only what the archive records. No names, dates or places
// beyond those already attached to each photograph.
const FRAMES: Frame[] = [
  photo('runway-wide', 'Fashion', 'Runway atmosphere', 'The runway where the Movement began: fashion in the Democratic Republic of Congo carrying a message of peace.'),
  photo('community-outreach', 'Community', 'Community outreach', 'Time spent with communities, the people the Movement exists to connect.'),
  supplied('fashion-night', 'Culture', 'A night runway', 'Printed gowns under stage lights in the open air. An image of the celebration The One Fashion Night is designed to be.'),
  photo('summit-goma', 'Leadership', 'The One Summit, Goma', 'Leadership and business conversation held in Goma, DRC.'),
  photo('cultural-performance', 'Culture', 'Cultural performance', 'Performance shared on stage as part of the Movement\'s cultural programme.'),
  photo('global-encounter', 'Diplomacy', 'Ambassador of Tanzania', 'An encounter with the Ambassador of Tanzania, recorded as a TOMI partner meeting.'),
  supplied('investment-forum', 'Voices', 'A speaker on stage', 'A speaker addressing a room. Supplied archive image; the occasion is not documented here.'),
  photo('casting-group', 'Fashion', 'Casting and creative community', 'Models and creatives gathered at casting, where every body and every origin is welcome.'),
  photo('conversation', 'Partners', 'Dr Denis Mukwege', 'A conversation with Dr Denis Mukwege, listed in the archive as a TOMI partner.'),
  supplied('fashion-portrait', 'Fashion', 'Editorial portrait', 'Fashion as storytelling: an editorial portrait from the supplied archive.'),
];

const INTERVAL = 6500;

export default function MediaArchiveReel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [inView, setInView] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

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
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const go = useCallback((d: number) => setIndex((i) => (i + d + FRAMES.length) % FRAMES.length), []);
  const running = !paused && !reduced && inView;

  useEffect(() => {
    if (!running) return;
    const t = window.setTimeout(() => go(1), INTERVAL);
    return () => window.clearTimeout(t);
  }, [running, index, go]);

  const f = FRAMES[index];

  return (
    <div
      ref={rootRef}
      className="media-archive grid gap-6 lg:grid-cols-12"
      data-running={running ? 'true' : 'false'}
      role="region"
      aria-roledescription="carousel"
      aria-label="From the archive"
      onKeyDown={(e) => { if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); }}
    >
      <div className="relative overflow-hidden rounded-sharp bg-lagoon-900 lg:col-span-8">
        <div className="relative aspect-[4/5] sm:aspect-[16/11]">
          {FRAMES.map((fr, i) => (
            <img
              key={fr.key}
              src={fr.src}
              srcSet={fr.srcSet}
              sizes="(min-width: 1024px) 62vw, 94vw"
              alt={i === index ? fr.alt : ''}
              aria-hidden={i !== index}
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
              className={`media-archive-img ${i === index ? 'is-active' : ''}`}
            />
          ))}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-lagoon-900/90 via-lagoon-900/10 to-transparent" aria-hidden="true" />
          <div key={f.key} className="media-archive-caption absolute inset-x-0 bottom-0 p-6 sm:p-8" aria-live={running ? 'off' : 'polite'}>
            <p className="text-[10px] uppercase tracking-[0.24em] text-gold-400">
              {String(index + 1).padStart(2, '0')} / {String(FRAMES.length).padStart(2, '0')} · {f.chapter}
            </p>
            <h3 className="mt-2 text-2xl text-ivory-100 sm:text-3xl" style={{ fontFamily: 'var(--font-display)' }} data-testid="text-archive-title">{f.title}</h3>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ivory-200">{f.context}</p>
            <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-ivory-300">{f.source}</p>
          </div>
          <div className="media-archive-progress absolute inset-x-0 top-0 h-[2px] bg-ivory-100/10" aria-hidden="true">
            <span key={`${f.key}-${running}`} className="block h-full origin-left bg-gold-400" style={{ animationDuration: `${INTERVAL}ms` }} />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:col-span-4">
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => go(-1)} aria-label="Previous photograph" data-testid="button-archive-prev" className="media-archive-btn"><ChevronLeft className="h-4 w-4" /></button>
          <button type="button" onClick={() => go(1)} aria-label="Next photograph" data-testid="button-archive-next" className="media-archive-btn"><ChevronRight className="h-4 w-4" /></button>
          {!reduced && (
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-pressed={paused}
              data-testid="button-archive-pause"
              className="media-archive-btn ml-auto gap-1.5 px-3 text-[11px] uppercase tracking-wider"
            >
              {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
              {paused ? 'Play' : 'Pause'}
            </button>
          )}
        </div>
        <ol className="mt-5 grid grid-cols-5 gap-2 lg:grid-cols-2 lg:gap-3" aria-label="Choose a photograph">
          {FRAMES.map((fr, i) => (
            <li key={fr.key}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-current={i === index}
                aria-label={`${fr.title} · ${fr.chapter}`}
                data-testid={`button-archive-thumb-${fr.key}`}
                className={`media-archive-thumb group relative block w-full overflow-hidden ${i === index ? 'is-active' : ''}`}
              >
                <img src={fr.src} alt="" loading="lazy" decoding="async" className="aspect-square w-full object-cover lg:aspect-[4/3]" />
                <span className="absolute inset-x-0 bottom-0 hidden bg-lagoon-900/80 px-2 py-1 text-left text-[9px] uppercase tracking-[0.16em] text-ivory-100 lg:block">{fr.chapter}</span>
              </button>
            </li>
          ))}
        </ol>
        <p className="mt-5 text-xs leading-relaxed text-ink-700">
          Photographs from the Founder archive, partner meetings and supplied images. Supplied images are illustrative and do not document specific TOMI events.
        </p>
      </div>
    </div>
  );
}
