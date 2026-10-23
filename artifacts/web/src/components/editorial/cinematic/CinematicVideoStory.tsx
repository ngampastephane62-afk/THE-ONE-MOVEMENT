import type { ReactNode, SyntheticEvent } from 'react';
import { engagementId, filmMedia, type EditorialFilm } from '@/lib/editorial-films';
import NativeVideo from '../NativeVideo';
import VideoActions from '../VideoActions';
import { useCinematicReveal } from './use-cinematic-reveal';
import './cinematic.css';

export type CinematicVideoStoryProps = {
  film: EditorialFilm;
  /** Replaces the default NativeVideo. */
  media?: ReactNode;
  /** Replaces the default VideoActions row. */
  actions?: ReactNode;
  onPlay?: (e: SyntheticEvent<HTMLVideoElement>) => void;
  onEnded?: (e: SyntheticEvent<HTMLVideoElement>) => void;
  /** Article anchor id (legacy hash). */
  articleId?: string;
  /** Focus target id for shared-video links; pass null to omit. */
  focusId?: string | null;
  index?: number;
  total?: number;
  headingLevel?: 'h2' | 'h3';
  testId?: string;
};

/** Reusable cinematic editorial presentation for one published film. */
export function CinematicVideoStory({ film, media, actions, onPlay, onEnded, articleId, focusId, index, total, headingLevel = 'h3', testId }: CinematicVideoStoryProps) {
  const ref = useCinematicReveal<HTMLElement>();
  const vid = engagementId(film);
  const Heading = headingLevel;
  const portrait = film.height > film.width;
  const fid = focusId === undefined ? `video-${vid}` : focusId;
  return (
    <article ref={ref} id={articleId} className="tomi-cine scroll-mt-24" data-testid={testId ?? `cinematic-film-${film.id}`}>
      <p data-cine="category" className="flex items-center gap-2 text-[11px] font-semibold uppercase leading-relaxed tracking-[0.22em] text-gold-700 sm:gap-3">
        {typeof index === 'number' && total && total > 1 && <span className="shrink-0 whitespace-nowrap font-mono tracking-normal text-ink-500">{String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>}
        <span className="min-w-0">{film.name}</span>
        <span aria-hidden className="hidden h-px w-6 shrink-0 bg-gold-500/70 sm:block" />
        <span className="shrink-0 whitespace-nowrap font-mono tracking-normal text-ink-600">{film.duration}</span>
      </p>
      <Heading data-cine="title" className="tomi-cine-mask mt-3 font-display text-[clamp(1.6rem,6.2vw,3rem)] uppercase leading-[1.02] text-ink-900">
        <span>{film.title}</span>
      </Heading>
      <figure id={fid ?? undefined} tabIndex={fid ? -1 : undefined} className="mt-6 scroll-mt-24 outline-none">
        <div data-cine="frame" className={`tomi-cine-frame ${portrait ? 'max-w-sm' : ''}`} style={{ aspectRatio: `${film.width} / ${film.height}` }}>
          {media ?? (
            <NativeVideo src={filmMedia(film.file)} poster={film.poster ? filmMedia(film.poster) : undefined}
              width={film.width} height={film.height} preload="none" autoPlay={false}
              className="!h-full !max-h-none" aria-label={`${film.name}: ${film.title}`}
              data-testid={`video-broadcast-${film.id}`} onPlay={onPlay} onEnded={onEnded} />
          )}
        </div>
        <div data-cine="text" className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
          <p className="max-w-2xl text-[15px] leading-relaxed text-ink-800">{film.description}</p>
          {film.credit && <figcaption className="max-w-xs border-l border-gold-500/60 pl-3 text-xs leading-relaxed text-ink-600">{film.credit}</figcaption>}
        </div>
        <div data-cine="actions" className="mt-2">
          {actions ?? <VideoActions videoId={vid} title={film.title} layout="row" />}
        </div>
      </figure>
    </article>
  );
}

export default CinematicVideoStory;
