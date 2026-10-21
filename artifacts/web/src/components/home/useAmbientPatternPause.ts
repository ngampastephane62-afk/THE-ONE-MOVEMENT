import { useEffect, useRef } from 'react';

/** Home-only: pauses the ambient .thp-pattern drift while its containing section is offscreen. */
export function useAmbientPatternPause<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root || typeof IntersectionObserver === 'undefined') return;
    const sections = new Set<HTMLElement>();
    root.querySelectorAll<HTMLElement>('.thp-pattern').forEach((p) => { if (p.parentElement) sections.add(p.parentElement); });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        (en.target as HTMLElement).querySelectorAll<HTMLElement>(':scope > .thp-pattern').forEach((p) => {
          p.style.animationPlayState = en.isIntersecting ? 'running' : 'paused';
        });
      });
    }, { rootMargin: '100px 0px' });
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);
  return ref;
}
