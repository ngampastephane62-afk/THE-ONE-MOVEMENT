import { archivePhotoSource } from '@/components/ArchivePhoto';
import { SUPPLIED_IMAGES } from '@/components/programs/ProgramSuppliedImage';
import { programAssetSource } from '@/lib/media-share';

/** Stable engagement identities for programme cover photos (bundled URLs are hashed). */
export const COVER_SOURCES = {
  awards: { source: '/assets/media/editorial/awards-naomi.webp', title: 'The One Awards · official artwork' },
  'diplomatic-gala': { source: programAssetSource('gala-founder-speaking.webp'), title: 'The Founder speaking · institutional engagement archive' },
} as const;

/** Cover photo identity for a programme card, or undefined for text-only visuals. */
export function programCardMedia(slug: string): { source: string; title: string } | undefined {
  if (slug === 'summit') return { source: archivePhotoSource('summit-goma'), title: 'The One Summit, Goma' };
  if (slug in COVER_SOURCES) return COVER_SOURCES[slug as keyof typeof COVER_SOURCES];
  if (slug === 'fashion-night' || slug === 'investment-forum') return { source: SUPPLIED_IMAGES[slug].source, title: SUPPLIED_IMAGES[slug].caption };
  return undefined;
}
