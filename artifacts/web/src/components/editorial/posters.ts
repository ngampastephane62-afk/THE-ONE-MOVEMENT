import winnie from '@/assets/media/programs/awards-winnie-harlow.webp';
import nancy from '@/assets/media/programs/awards-nominees-poster.webp';
import ciara from '@/assets/media/programs/awards-ciara-poster.webp';
import kevin from '@/assets/media/programs/awards-kevin-hart.webp';

/** Maps shared `poster` asset keys to bundled official TOMI poster images. */
export const POSTERS: Record<string, { src: string; orientation: 'portrait' | 'landscape' }> = {
  'winnie-harlow': { src: winnie, orientation: 'portrait' },
  'nancy-isime': { src: nancy, orientation: 'portrait' },
  ciara: { src: ciara, orientation: 'portrait' },
  'kevin-hart': { src: kevin, orientation: 'landscape' },
};

export function posterFor(key: string) {
  return POSTERS[key];
}
