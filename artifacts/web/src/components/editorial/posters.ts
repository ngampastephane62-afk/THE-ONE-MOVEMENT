import winnie from '@/assets/media/programs/awards-winnie-harlow.webp';
import nancy from '@/assets/media/programs/awards-nominees-poster.webp';
import ciara from '@/assets/media/programs/awards-ciara-poster.webp';
import kevin from '@/assets/media/programs/awards-kevin-hart.webp';
import { personImage, PERSON_MEDIA } from './PersonPortrait';

/** Maps shared `poster` asset keys to bundled official TOMI poster images. */
export const POSTERS: Record<string, { src: string; width: number; height: number; orientation: 'portrait' | 'landscape' }> = {
  'winnie-harlow': { src: winnie, width: 1200, height: 848, orientation: 'landscape' },
  'nancy-isime': { src: nancy, width: 540, height: 960, orientation: 'portrait' },
  ciara: { src: ciara, width: 540, height: 962, orientation: 'portrait' },
  'kevin-hart': { src: kevin, width: 900, height: 636, orientation: 'landscape' },
  'david-jonsson': { src: personImage('david-jonsson-poster') || '', width: PERSON_MEDIA['david-jonsson-poster']?.width ?? 1000, height: PERSON_MEDIA['david-jonsson-poster']?.height ?? 700, orientation: 'landscape' },
  'mohombi': { src: personImage('mohombi-poster') || '', width: PERSON_MEDIA['mohombi-poster']?.width ?? 640, height: PERSON_MEDIA['mohombi-poster']?.height ?? 900, orientation: 'portrait' },
};

export function posterFor(key: string) {
  return POSTERS[key];
}
