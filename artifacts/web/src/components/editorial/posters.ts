import winnie from '@/assets/media/programs/awards-winnie-harlow.webp';
import nancy from '@/assets/media/programs/awards-nominees-poster.webp';
import ciara from '@/assets/media/programs/awards-ciara-poster.webp';
import kevin from '@/assets/media/programs/awards-kevin-hart.webp';
import { personImage, portraitSource, PERSON_MEDIA } from './PersonPortrait';
import { programAssetSource } from '@/lib/media-share';

/** Maps shared `poster` asset keys to bundled official TOMI poster images. */
export const POSTERS: Record<string, { src: string; source: string; width: number; height: number; orientation: 'portrait' | 'landscape' }> = {
  'winnie-harlow': { src: winnie, source: programAssetSource('awards-winnie-harlow.webp'), width: 1200, height: 848, orientation: 'landscape' },
  'nancy-isime': { src: nancy, source: programAssetSource('awards-nominees-poster.webp'), width: 540, height: 960, orientation: 'portrait' },
  ciara: { src: ciara, source: programAssetSource('awards-ciara-poster.webp'), width: 540, height: 962, orientation: 'portrait' },
  'kevin-hart': { src: kevin, source: programAssetSource('awards-kevin-hart.webp'), width: 900, height: 636, orientation: 'landscape' },
  'david-jonsson': { src: personImage('david-jonsson-poster') || '', source: portraitSource('david-jonsson-poster') || '', width: PERSON_MEDIA['david-jonsson-poster']?.width ?? 1000, height: PERSON_MEDIA['david-jonsson-poster']?.height ?? 700, orientation: 'landscape' },
  'mohombi': { src: personImage('mohombi-poster') || '', source: portraitSource('mohombi-poster') || '', width: PERSON_MEDIA['mohombi-poster']?.width ?? 640, height: PERSON_MEDIA['mohombi-poster']?.height ?? 900, orientation: 'portrait' },
};

export function posterFor(key: string) {
  return POSTERS[key];
}
