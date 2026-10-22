import { useEffect, useRef } from 'react';
import { AWARENESS_FILM, engagementId } from '@/lib/editorial-films';
import CinematicVideoStory from './cinematic/CinematicVideoStory';

/** Partners page: the single published awareness film, same cinematic card. IDs/hash preserved. */
export default function DocumentaryTeasers() {
  const root = useRef<HTMLElement>(null);
  const vid = engagementId(AWARENESS_FILM);

  useEffect(() => {
    const go = () => {
      const shared = new URLSearchParams(window.location.search).get('video');
      if (shared === vid) {
        requestAnimationFrame(() => {
          const target = root.current?.querySelector<HTMLElement>(`[data-shared-video="${shared}"]`);
          target?.scrollIntoView({ block: 'center' }); target?.focus({ preventScroll: true });
        });
        return;
      }
      if (window.location.hash === '#documentary-teasers') {
        requestAnimationFrame(() => root.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
      }
    };
    go();
    window.addEventListener('hashchange', go);
    return () => window.removeEventListener('hashchange', go);
  }, [vid]);

  return (
    <section ref={root} id="documentary-teasers" aria-label={AWARENESS_FILM.title} className="mt-12 scroll-mt-24 overflow-x-clip py-8" data-testid="section-documentary-teasers">
      <div data-shared-video={vid} tabIndex={-1} className="mx-auto max-w-4xl scroll-mt-28 outline-none">
        <CinematicVideoStory film={AWARENESS_FILM} focusId={null} testId={`card-${vid}`} />
      </div>
    </section>
  );
}
