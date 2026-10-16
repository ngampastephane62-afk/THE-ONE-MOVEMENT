import { useRef, useState } from 'react';
import SocialVideo from './SocialVideo';

const api = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;

// Only available films belong in the playback order. Add the fourth-edition
// documentary here once the owner supplies its authorised video source.
const FILMS = [
  {
    id: 'goma',
    title: 'Goma — full humanitarian film',
    src: api('api/documentary/goma/stream'),
    poster: api('api/documentary/media/goma.webp'),
    credit: 'TOMI archive · 59 seconds',
  },
  {
    id: 'radio-okapi',
    title: 'Radio Okapi — MONUSCO trailer',
    src: api('api/documentary/media/radio-okapi-trailer.mp4'),
    poster: api('api/documentary/media/radio-okapi.webp'),
    credit: 'MONUSCO / United Nations · Radio Okapi · 2:09. Not a TOMI production; shown for context.',
  },
];

export default function DocumentarySequence() {
  const root = useRef<HTMLDivElement>(null);
  const [continuous, setContinuous] = useState(true);
  const [notice, setNotice] = useState('');

  function next(index: number) {
    if (!continuous) return;
    const videos = root.current?.querySelectorAll('video');
    const video = videos?.[index + 1];
    if (!video) return;
    video.scrollIntoView({ block: 'center', behavior: 'instant' });
    video.play().then(() => setNotice('')).catch(() => {
      setNotice('The next video is ready. Press Play to continue.');
    });
  }

  return (
    <div ref={root} data-testid="documentary-sequence">
      <label className="mb-6 flex items-center gap-3 text-sm text-ink-800">
        <input type="checkbox" checked={continuous} onChange={(event) => setContinuous(event.target.checked)} className="h-4 w-4 accent-[hsl(187_67%_12%)]" data-testid="checkbox-continuous-playback" />
        Play the next video automatically
      </label>
      {notice && <p role="status" className="mb-4 text-sm text-lagoon-700">{notice}</p>}
      <div className="space-y-10">
        {FILMS.map((film, index) => (
          <article key={film.id}>
            <p className="text-eyebrow text-gold-700">{String(index + 1).padStart(2, '0')} / {String(FILMS.length).padStart(2, '0')} · FREE TO WATCH</p>
            <h3 className="mt-2 font-display text-xl text-ink-900">{film.title}</h3>
            <p className="mb-4 mt-2 text-xs leading-relaxed text-ink-700">{film.credit}</p>
            <SocialVideo videoId={film.id} title={film.title} src={film.src} poster={film.poster}
              onEnded={() => next(index)} onPlay={(event) => {
                root.current?.querySelectorAll('video').forEach((video) => {
                  if (video !== event.currentTarget) video.pause();
                });
                setNotice('');
              }} className="bg-ink-900" />
          </article>
        ))}
      </div>
      <p className="mt-5 text-sm text-ink-800">Humanitarian films are free. No donation, subscription or member account is required to watch.</p>
    </div>
  );
}
