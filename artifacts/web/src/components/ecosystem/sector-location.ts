import { SECTORS } from '@/lib/sectors-data';

/** UI navigation only: never a saved preference, identity inference or opt-in. */
export function sectorFromSearch(search: string): string {
  const value = new URLSearchParams(search).get('sector');
  return SECTORS.find(sector => sector.slug === value)?.slug ?? SECTORS[0].slug;
}

export function sectorDestination(slug: string): string {
  const sector = SECTORS.find(item => item.slug === slug);
  return sector ? `/ecosystem?sector=${encodeURIComponent(sector.slug)}#explore` : '/ecosystem#explore';
}
