import { useState } from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';
import SocialVideo from './editorial/SocialVideo';

const base = `${import.meta.env.BASE_URL}api/humanitarian-media/`;

interface Film {
  slug: string;
  eyebrow: string;
  title: string;
  credit: string;
  role: string;
  duration: string;
  aspect: string;
  frame: string;
}

const FILMS: Film[] = [
  {
    slug: 'panzi-appeal',
    eyebrow: 'APPEAL · PANZI FOUNDATION',
    title: 'End the Endless War',
    credit: 'A film by the Panzi Foundation.',
    role: 'Panzi’s own campaign appeal, shown in full with its original subtitles. Its closing frame names the campaign address panzi.org/endthewar.',
    duration: '1 min 59 s',
    aspect: '1 / 1',
    frame: 'max-w-xl',
  },
  {
    slug: 'tomi-fonarev-story',
    eyebrow: 'STORY · TOMI × FONAREV',
    title: 'Nyota’s story',
    credit: 'Produced by The One Movement International with FONAREV, as stated in the closing credits.',
    role: 'A testimony film from eastern DRC, shown in full with its original subtitles.',
    duration: '3 min 05 s',
    aspect: '1918 / 1080',
    frame: 'max-w-4xl',
  },
];

function FilmPlayer({ film, cinematic = false, index = 0 }: { film: Film; cinematic?: boolean; index?: number }) {
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);
  const titleId = `film-${film.slug}-title`;
  const noteId = `film-${film.slug}-note`;
  return (
    <figure className={`mx-auto w-full ${film.frame} ${cinematic ? 'hum-film-chapter' : ''}`} aria-labelledby={titleId} data-testid={`film-${film.slug}`}>
      {cinematic && <p className="hum-film-index font-mono text-xs text-gold-400/80" aria-hidden>FILM {String(index + 1).padStart(2, '0')}</p>}
      <figcaption className={cinematic ? 'hum-film-text mb-4' : 'mb-4'}>
        <p className="text-eyebrow text-gold-400">{film.eyebrow}</p>
        <h3 id={titleId} className="mt-2 font-display text-2xl tracking-wide text-ivory-100">{film.title}</h3>
        <p className="mt-2 text-sm text-ivory-300">{film.credit} <span className="whitespace-nowrap text-gold-400">· {film.duration}</span></p>
        <p className="mt-1 text-sm text-ivory-300/80">{film.role}</p>
      </figcaption>
      <p id={noteId} className="mb-3 flex items-start gap-2 border-l-2 border-coral-500 bg-ink-900/40 px-3 py-2 text-sm leading-relaxed text-ivory-200" role="note">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-coral-500" aria-hidden />
        <span>Content notice: this film speaks of armed conflict, violence, trauma and death. It does not play automatically — start it when you are ready.</span>
      </p>
      <div className={`relative overflow-hidden border border-gold-500/30 bg-ink-950 ${cinematic ? 'hum-film-frame' : ''}`} style={failed ? { aspectRatio: film.aspect } : undefined}>
        {failed ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center" role="alert">
            <p className="text-sm text-ivory-200">This film could not be loaded.</p>
            <button type="button" onClick={() => { setFailed(false); setAttempt((n) => n + 1); }} className="inline-flex items-center gap-2 border border-gold-500 px-4 py-2 text-xs uppercase tracking-wider text-gold-400 hover:bg-gold-500 hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400" data-testid={`button-retry-${film.slug}`}>
              <RotateCw className="h-3.5 w-3.5" /> Try again
            </button>
          </div>
        ) : (
          <SocialVideo
            videoId={film.slug === 'panzi-appeal' ? 'panzi' : 'nyota'}
            title={film.title}
            key={attempt}
            className="bg-ink-950"
            controls
            playsInline
            preload="none"
            poster={`${base}${film.slug}.webp`}
            aria-labelledby={titleId}
            aria-describedby={noteId}
            onError={() => setFailed(true)}
            data-testid={`video-${film.slug}`}
          >
            <source src={`${base}${film.slug}.webm`} type="video/webm" />
            <source src={`${base}${film.slug}.mp4`} type="video/mp4" onError={() => setFailed(true)} />
            Your browser cannot play this video.
          </SocialVideo>
        )}
      </div>
    </figure>
  );
}

/** `cinematic` is opt-in (used by /donate): adds chapter headings and staged reveal classes. Media, credits, notices and playback stay identical. */
export default function HumanitarianFilms({ cinematic = false }: { cinematic?: boolean } = {}) {
  return (
    <section className="tomi-aurora-surface text-ivory-100" aria-labelledby="films-title">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <p className="text-eyebrow text-gold-400">{cinematic ? 'HUMANITARIAN FILMS AND TESTIMONIES' : 'WITNESS'}</p>
        {cinematic ? (
          <h2 id="films-title" className="mt-2 text-display-lg"><span className="hum-mask"><span>STORIES THAT MUST BE HEARD.</span></span><span className="hum-mask mt-2 block text-gold-400" style={{ fontSize: '0.5em' }}><span>HUMANITARIAN FILMS FROM EASTERN CONGO.</span></span></h2>
        ) : (
          <h2 id="films-title" className="mt-2 text-display-md">Two films from eastern DRC</h2>
        )}
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ivory-300">Each film is shown uncut, in its original frame. They have different authors and purposes: one is the Panzi Foundation’s own appeal, the other a story told by TOMI with FONAREV.</p>
        <div className="mt-12 flex flex-col gap-16">
          {FILMS.map((f, i) => <FilmPlayer key={f.slug} film={f} cinematic={cinematic} index={i} />)}
        </div>
      </div>
    </section>
  );
}
