import media from '@/lib/person-media.json';
import PhotoActions from './PhotoActions';

type Portrait = { path: string; credit: string; source: string; width: number; height: number };
export const PERSON_MEDIA = media as Record<string, Portrait>;
export function personImage(slug: string) {
  const image = PERSON_MEDIA[slug];
  return image ? `${import.meta.env.BASE_URL}api/editorial-portraits/${image.path.replace(/^people\//, '')}` : undefined;
}
/** Canonical engagement source for a published portrait. */
export function portraitSource(slug: string) {
  const image = PERSON_MEDIA[slug];
  return image ? `/api/editorial-portraits/${image.path.replace(/^people\//, '')}` : undefined;
}
/** Like / comment / share for a portrait; renders nothing for initials-only fallbacks. */
export function PortraitActions({ slug, name, tone = 'light' }: { slug: string; name: string; tone?: 'light' | 'dark' }) {
  const source = portraitSource(slug);
  return source ? <PhotoActions source={source} title={`Portrait: ${name}`} tone={tone} /> : null;
}
export default function PersonPortrait({ slug, name, className = '', contain = false }: { slug: string; name: string; className?: string; contain?: boolean }) {
  const image = PERSON_MEDIA[slug];
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('');
  return <figure className={className}>
    {image ? <img src={personImage(slug)} alt={name} loading="lazy" width={image.width} height={image.height} className={`h-full w-full ${contain ? 'object-contain' : 'object-cover'}`} style={contain ? undefined : { objectPosition: '50% 18%' }} /> : <div className="flex h-full min-h-40 items-center justify-center bg-lagoon-900 font-display text-4xl tracking-widest text-gold-400/70" aria-label={name} role="img">{initials}</div>}
  </figure>;
}
export function PortraitCredit({ slug }: { slug: string }) {
  const item = PERSON_MEDIA[slug];
  if (!item) return null;
  return <details className="mt-2 text-[10px] leading-relaxed text-ink-700">
    <summary className="cursor-pointer select-none uppercase tracking-widest opacity-70 hover:opacity-100">Photo credit</summary>
    <p className="mt-1">{item.source ? <a href={item.source} target="_blank" rel="noopener noreferrer" className="underline">{item.credit}</a> : item.credit}</p>
  </details>;
}
