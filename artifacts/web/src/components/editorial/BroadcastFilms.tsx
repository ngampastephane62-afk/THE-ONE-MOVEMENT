import { useEffect, useState } from 'react';
import { useNewsPlaybackScope } from '@/hooks/use-news-motion';
import { PUBLISHED_FILMS, engagementId } from '@/lib/editorial-films';
import CinematicVideoStory from './cinematic/CinematicVideoStory';
import { useCinematicReveal } from './cinematic/use-cinematic-reveal';
import PublishedCampaignVideos from './cinematic/PublishedCampaignVideos';

export default function BroadcastFilms({ embedded = false }: { embedded?: boolean }) {
  const root = useNewsPlaybackScope<HTMLElement>();
  const head = useCinematicReveal<HTMLDivElement>();
  const [continuous, setContinuous] = useState(false);
  const [notice, setNotice] = useState('');
  const films = PUBLISHED_FILMS;

  useEffect(() => {
    const go = () => {
      const id = window.location.hash.slice(1);
      const shared = new URLSearchParams(window.location.search).get('video');
      if (shared && films.some(f => engagementId(f) === shared)) {
        requestAnimationFrame(() => {
          const target = document.getElementById(`video-${shared}`);
          target?.scrollIntoView({ block: 'center' }); target?.focus({ preventScroll: true });
        });
        return;
      }
      if (id === 'broadcast-films' || films.some(f => id === `broadcast-film-${f.id}`)) {
        requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: 'start' }));
      }
    };
    go();
    window.addEventListener('hashchange', go);
    return () => window.removeEventListener('hashchange', go);
  }, [films]);

  function next(index: number) {
    if (!continuous) return;
    const video = root.current?.querySelectorAll('video')[index + 1];
    if (!video) return;
    video.scrollIntoView({ block: 'center', behavior: 'smooth' });
    void video.play().then(() => setNotice('')).catch(() => setNotice('The next film is ready. Press Play to continue.'));
  }

  return (
    <section ref={root} id="broadcast-films" aria-labelledby="broadcast-films-heading"
      className={`scroll-mt-24 overflow-x-clip bg-ivory-50 text-ink-900 ${embedded ? 'mt-10' : 'border-b border-sand-300 px-5 py-section-lg sm:px-6'}`}
      data-testid="section-broadcast-films">
      <div className={embedded ? '' : 'mx-auto max-w-5xl'}>
        <div ref={head} className="tomi-cine">
          <p data-cine="category" className="text-eyebrow text-gold-700">WATCH · THE FILM ARCHIVE</p>
          <h2 id="broadcast-films-heading" data-cine="title" className="tomi-cine-mask mt-3 font-display text-[clamp(2rem,8vw,3.75rem)] uppercase leading-none">
            <span>Films of the Movement.</span>
          </h2>
          <div data-cine="text" className="tomi-cine-rule mt-6 w-24" aria-hidden />
        </div>
        {films.length > 1 && (
          <nav aria-label="Films" className="mt-6 flex flex-wrap gap-x-5 gap-y-1">
            {films.map((film, i) => (
              <a key={film.id} href={`#broadcast-film-${film.id}`}
                className="inline-flex min-h-11 items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink-700 underline-offset-4 hover:text-lagoon-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-lagoon-700">
                <span className="font-mono tracking-normal text-gold-700">{String(i + 1).padStart(2, '0')}</span>{film.name}
              </a>
            ))}
          </nav>
        )}
        {films.length > 1 && (
          <label className="mt-3 inline-flex min-h-11 cursor-pointer items-center gap-3 text-sm text-ink-700">
            <input type="checkbox" checked={continuous} onChange={e => setContinuous(e.target.checked)}
              className="h-4 w-4 accent-[hsl(187_67%_12%)]" data-testid="checkbox-broadcast-continuous" />
            Continue to the next film when one ends
          </label>
        )}
        {notice && <p role="status" className="mt-2 text-sm text-lagoon-700">{notice}</p>}
        <div className="mt-12 space-y-20 sm:space-y-28">
          {films.map((film, index) => (
            <CinematicVideoStory key={film.id} film={film} index={index} total={films.length}
              articleId={`broadcast-film-${film.id}`} testId={`broadcast-film-${film.id}`}
              onPlay={e => {
                setNotice('');
                root.current?.querySelectorAll('video').forEach(v => { if (v !== e.currentTarget) v.pause(); });
              }}
              onEnded={() => next(index)} />
          ))}
        </div>
        <PublishedCampaignVideos />
      </div>
    </section>
  );
}
