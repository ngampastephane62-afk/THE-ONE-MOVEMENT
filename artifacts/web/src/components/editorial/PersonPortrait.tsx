import media from '@/lib/person-media.json';

type Portrait = { path: string; credit: string; source: string; width: number; height: number };
export const PERSON_MEDIA = media as Record<string, Portrait>;
export function personImage(slug: string) {
  const image = PERSON_MEDIA[slug];
  return image ? `${import.meta.env.BASE_URL}api/editorial-portraits/${image.path.replace(/^people\//, '')}` : undefined;
}
export default function PersonPortrait({ slug, name, className = '', contain = false }: { slug: string; name: string; className?: string; contain?: boolean }) {
  const image = PERSON_MEDIA[slug];
  return <figure className={className}>
    {image ? <img src={personImage(slug)} alt={name} loading="lazy" width={image.width} height={image.height} className={`h-full w-full ${contain ? 'object-contain' : 'object-cover object-top'}`} /> : <div className="flex h-full min-h-40 items-center justify-center bg-lagoon-900 p-5 text-center text-sm text-ivory-200">Portrait awaiting publication · {name}</div>}
  </figure>;
}
export function PortraitCredit({ slug }: { slug: string }) {
  const item = PERSON_MEDIA[slug];
  if (!item) return null;
  return <p className="mt-2 text-[10px] leading-relaxed text-ink-700">{item.source ? <a href={item.source} target="_blank" rel="noopener noreferrer" className="underline">{item.credit}</a> : item.credit}</p>;
}
