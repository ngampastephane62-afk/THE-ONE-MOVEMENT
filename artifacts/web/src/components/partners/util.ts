import { useEffect, useState } from 'react';

export function baseUrl(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}

export const CATALOGUE_PDF = baseUrl('/api/media-catalogue/assets/tropik-media-coverage.pdf');

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

/** Formats exactly as listed in the source; an empty list means consultation only. */
export function outletFormats(formats: string[]) {
  return formats.length ? formats : ['CONSULTATION'];
}
