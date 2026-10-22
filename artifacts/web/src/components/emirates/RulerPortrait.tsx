import PersonPortrait, { PERSON_MEDIA } from '@/components/editorial/PersonPortrait';

/**
 * Consistent dignified frame for every ruler portrait. The frame adopts the
 * image's natural width/height ratio (from PERSON_MEDIA), and is fitted inside
 * a fixed box, so the complete photograph is always shown with no crop and no
 * colour bands. Box sets the maximum footprint; the frame centres within it.
 */
export default function RulerPortrait({ slug, name, box, light = false, align = 'center' }: { slug: string; name: string; box: string; light?: boolean; align?: 'center' | 'start' }) {
  const m = PERSON_MEDIA[slug];
  const ratio = m ? m.width / m.height : 4 / 5;
  return (
    <div className={`flex ${align === 'start' ? 'items-start justify-start' : 'items-center justify-center'} ${box}`}>
      <div key={slug} className={`em-frame em-portrait-in ${light ? 'em-frame-light' : ''}`}
        style={{ aspectRatio: String(ratio), maxWidth: '100%', maxHeight: '100%', width: ratio >= 1 ? '100%' : 'auto', height: ratio >= 1 ? 'auto' : '100%' }}
        data-testid={`img-ruler-portrait-${slug}`}>
        <PersonPortrait slug={slug} name={name} contain className="h-full w-full" />
      </div>
    </div>
  );
}
