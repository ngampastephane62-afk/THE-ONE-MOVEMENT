import { useEffect, useRef, useState } from 'react';
import NativeVideo from './NativeVideo';
import VideoActions from './VideoActions';

const engagementId = (film: { id: string; file: string }) =>
  film.id === 'radio-okapi' ? 'radio-okapi' : film.file.replace(/\.mp4$/, '');

const media = (name: string) => `${import.meta.env.BASE_URL}api/documentary/media/${name}`;
const FILMS = [
  {
    id: 'canal', name: 'CANAL+',
    title: 'The One Documentaire · Teaser',
    description: 'A documentary highlight supplied by the Founder, presented here with the CANAL+ broadcast file.',
    file: 'documentary-teaser-03.mp4', poster: 'documentary-teaser-03.webp',
    duration: '29 s', credit: 'The One Documentaire · Founder archive. This teaser is not the complete film.',
  },
  {
    id: 'archive-01', name: 'CANAL+ · 02',
    title: 'The One Documentaire · Teaser 02',
    description: 'More documentary highlights supplied by the Founder, available here in the same collection.',
    file: 'documentary-teaser-01.mp4', poster: 'documentary-teaser-01.webp',
    duration: '1 min 16 s', credit: 'Founder archive · Documentary excerpt, not the complete film.',
  },
  {
    id: 'archive-02', name: 'CANAL+ · 03',
    title: 'The One Documentaire · Teaser 03',
    description: 'More documentary highlights supplied by the Founder, available here in the same collection.',
    file: 'documentary-teaser-02.mp4', poster: 'documentary-teaser-02.webp',
    duration: '7 s', credit: 'Founder archive · Documentary excerpt, not the complete film.',
  },
  {
    id: 'tv5monde', name: 'TV5MONDE Afrique · France 24',
    title: 'The One Fashion Week, on international television.',
    description: 'A television archive of The One Fashion Week, supplied by the Founder.',
    file: 'fashion-week-tv5.mp4', poster: 'fashion-week-tv5-runway.webp',
    duration: '1 min 26 s', credit: 'Visible broadcaster credits: TV5MONDE Afrique · France 24. Archive supplied by the Founder.',
  },
  {
    id: 'archive-04', name: 'THE ONE DOCUMENTAIRE · 04',
    title: 'Documentary highlight 04',
    description: 'More documentary highlights supplied by the Founder, available here in the same collection.',
    file: 'documentary-teaser-04.mp4', poster: 'documentary-teaser-04.webp',
    duration: '1 min 01 s', credit: 'Founder archive · Documentary excerpt, not the complete film.',
  },
  {
    id: 'radio-okapi', name: 'RADIO OKAPI',
    title: 'Radio Okapi · Film archive',
    description: 'A separate film from the archive supplied by the Founder.',
    file: 'radio-okapi-trailer.mp4', poster: 'radio-okapi.webp',
    duration: '2 min 09 s', credit: 'Film credit: MONUSCO / United Nations · Radio Okapi.',
  },
];

export default function BroadcastFilms({ embedded = false }: { embedded?: boolean }) {
  const root = useRef<HTMLElement>(null);
  const [continuous, setContinuous] = useState(true);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const go = () => {
      const id = window.location.hash.slice(1);
      const shared = new URLSearchParams(window.location.search).get('video');
      if (shared && FILMS.some(f => engagementId(f) === shared)) {
        requestAnimationFrame(() => {
          const target = document.getElementById(`video-${shared}`);
          target?.scrollIntoView({ block: 'center' }); target?.focus({ preventScroll: true });
        });
        return;
      }
      if (id === 'broadcast-films' || FILMS.some(f => id === `broadcast-film-${f.id}`)) {
        requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: 'start' }));
      }
    };
    go();
    window.addEventListener('hashchange', go);
    return () => window.removeEventListener('hashchange', go);
  }, []);

  function next(index: number) {
    if (!continuous) return;
    const videos = root.current?.querySelectorAll('video');
    const video = videos?.[index + 1];
    if (!video) return;
    video.scrollIntoView({ block: 'center', behavior: 'smooth' });
    void video.play().then(() => setNotice('')).catch(() => {
      setNotice('The next video is ready. Press Play to continue.');
    });
  }

  return (
    <section ref={root} id="broadcast-films" aria-labelledby="broadcast-films-heading"
      className={`scroll-mt-24 bg-ivory-50 text-ink-900 ${embedded ? 'mt-10' : 'border-b border-sand-300 px-6 py-section-lg'}`}
      data-testid="section-broadcast-films">
      <div className={embedded ? '' : 'mx-auto max-w-6xl'}>
        <p className="text-eyebrow text-gold-700">WATCH · BROADCAST & DOCUMENTARY HIGHLIGHTS</p>
        <h2 id="broadcast-films-heading" className="mt-3 font-display text-3xl uppercase sm:text-5xl">CANAL+. TV5MONDE. THE ONE DOCUMENTAIRE.</h2>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-ink-700">Watch the films here, one after another. Start the first video to play the collection in sequence.</p>
        <nav aria-label="Broadcast films" className="mt-5 flex flex-wrap gap-3">
          {FILMS.map((film, i) => (
            <a key={film.id} href={`#broadcast-film-${film.id}`}
              className="inline-flex min-h-11 items-center border border-sand-300 px-4 text-xs font-semibold uppercase tracking-wider hover:border-lagoon-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-lagoon-700">
              {i + 1}. {film.name}
            </a>
          ))}
        </nav>
        <label className="mt-6 inline-flex min-h-11 cursor-pointer items-center gap-3 text-sm text-ink-800">
          <input type="checkbox" checked={continuous} onChange={e => setContinuous(e.target.checked)}
            className="h-4 w-4 accent-[hsl(187_67%_12%)]" data-testid="checkbox-broadcast-continuous" />
          Play the next video automatically
        </label>
        {notice && <p role="status" className="mt-3 text-sm text-lagoon-700">{notice}</p>}
        <div className="mt-8 space-y-12">
          {FILMS.map((film, index) => (
            <article key={film.id} id={`broadcast-film-${film.id}`} className="scroll-mt-24 border-t-2 border-ink-900 pt-6" data-testid={`broadcast-film-${film.id}`}>
              <p className="text-eyebrow text-gold-700">{film.name} · {film.duration}</p>
              <h3 className="mt-2 font-display text-2xl uppercase sm:text-3xl">{film.title}</h3>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-700">{film.description}</p>
              <figure className="mt-5 scroll-mt-24 outline-none" id={`video-${engagementId(film)}`} tabIndex={-1}>
                <div className="border border-ink-900 bg-ink-900">
                  <NativeVideo src={media(film.file)} poster={media(film.poster)}
                    width={film.id === 'archive-01' ? 480 : film.id === 'archive-04' ? 720 : 1280}
                    height={film.id === 'archive-01' ? 848 : film.id === 'archive-04' ? 1280 : 720}
                    className={film.id === 'archive-01' || film.id === 'archive-04' ? 'aspect-[9/16] !max-w-sm' : 'aspect-video'} preload="none"
                    aria-label={`${film.name} — ${film.title}`} data-testid={`video-broadcast-${film.id}`}
                    onPlay={e => {
                      setNotice('');
                      root.current?.querySelectorAll('video').forEach(v => { if (v !== e.currentTarget) v.pause(); });
                    }}
                    onEnded={() => next(index)}
                  />
                </div>
                <figcaption className="mt-3 border-b border-sand-300 pb-3 text-xs leading-relaxed text-ink-700">{film.credit}</figcaption>
                <VideoActions videoId={engagementId(film)} title={film.title} />
              </figure>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
