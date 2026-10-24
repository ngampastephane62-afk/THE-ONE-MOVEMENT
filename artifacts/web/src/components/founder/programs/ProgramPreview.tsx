import type { ProgramEditorial } from '@workspace/api-client-react';
import { byOrder, portraitOf } from '@/lib/use-programme-editorial';
import { programmeArchivePhotos } from '@/lib/programme-photo-archives';

/** Draft preview: shows exactly what would become public (published items only), including draft media. */
export default function ProgramPreview({ content, programmeName }: { content: ProgramEditorial; programmeName: string }) {
  const people = byOrder(content.people.filter((p) => p.published && (p.kind !== 'speaker' || p.confirmed)));
  const media = byOrder(content.media.filter((v) => v.published));
  const hidden = content.people.length - people.length;
  return (
    <section className="overflow-hidden rounded-2xl border border-gold-500/40 bg-lagoon-900 text-ivory-100" aria-label="Draft preview" data-testid="panel-program-preview">
      <div className="p-5 sm:p-7">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold-400">Programme preview · changes go live only when published</p>
        <h3 className="mt-3 font-display text-3xl">{programmeName}</h3>
        {content.introduction && <p className="mt-3 max-w-2xl text-ivory-200">{content.introduction}</p>}
        {(content.heroVideoUrl || content.heroImageUrl) && (
          <div className="mt-5 max-w-sm">{content.heroVideoUrl ? <video src={content.heroVideoUrl} poster={content.heroImageUrl ?? undefined} controls preload="none" playsInline className="w-full bg-ink-900 object-contain" /> : <img src={content.heroImageUrl ?? ''} alt="" className="w-full object-contain" />}</div>
        )}
        {(content.heroImageUploadId || content.heroVideoUploadId) && !content.heroImageUrl && !content.heroVideoUrl && <p className="mt-3 text-xs text-gold-400">New hero upload attached; save the draft to see it here.</p>}
      </div>
      <div className="grid gap-px bg-lagoon-800 md:grid-cols-2">
        <div className="bg-ivory-50 p-5 text-ink-900">
          {content.description && <p className="whitespace-pre-line text-sm leading-relaxed">{content.description}</p>}
          {content.purpose && <p className="mt-3 whitespace-pre-line border-l-2 border-gold-500 pl-3 text-sm">{content.purpose}</p>}
          {content.criteria && <p className="mt-3 whitespace-pre-line text-xs text-ink-700"><strong>Criteria: </strong>{content.criteria}</p>}
          <p className="mt-4 text-xs font-semibold">{content.eventDetailsConfirmed ? `Confirmed: ${[content.eventDate, content.venue].filter(Boolean).join(' · ') || 'no details entered'}` : 'OFFICIAL ANNOUNCEMENT COMING SOON.'}</p>
          {content.announcement && <p className="mt-2 whitespace-pre-line text-xs">{content.announcement}</p>}
          <p className="mt-3 text-xs text-ink-700">Participation: {content.participationRoles.join(', ') || 'all categories'}</p>
          {programmeArchivePhotos(content.slug).length > 0 && (
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3" data-testid="preview-program-photo-captions">
              {programmeArchivePhotos(content.slug).map(photo => (
                <figure key={photo.id} className="min-w-0">
                  <img src={photo.src} alt={photo.alt} width={photo.w} height={photo.h} loading="lazy" className="block h-auto w-full" />
                  <figcaption className="mt-2 whitespace-pre-line break-words text-xs">{content.photoCaptions?.[photo.id] || 'No personal caption'}</figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>
        <div className="bg-ivory-50 p-5 text-ink-900">
          <p className="text-xs font-semibold">{people.length} public profile(s){hidden ? ` · ${hidden} hidden` : ''} · {media.length} programme video(s)</p>
          <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {people.map((p) => {
              const img = portraitOf(p);
              return (
                <li key={p.id} className="text-[11px]">
                  <span className="block aspect-[4/5] overflow-hidden bg-lagoon-900">{img && <img src={img.src} alt="" className="h-full w-full object-contain" loading="lazy" />}</span>
                  <span className="mt-1 block truncate font-semibold">{p.name}</span>
                  <span className="block truncate text-ink-700">{p.kind} · {p.videos.filter((v) => v.published && v.url).length} video(s)</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
