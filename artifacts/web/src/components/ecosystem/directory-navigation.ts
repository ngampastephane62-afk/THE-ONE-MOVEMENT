import { SECTORS } from '@/lib/sectors-data';

/** Local UI event only. Never changes visibility, preferences or permissions. */
export const DIRECTORY_SECTOR_EVENT = 'tomi:directory-sector';

export function showListedMembers(slug: string) {
  if (!SECTORS.some(sector => sector.slug === slug)) return;
  window.dispatchEvent(new CustomEvent(DIRECTORY_SECTOR_EVENT, { detail: slug }));
}
