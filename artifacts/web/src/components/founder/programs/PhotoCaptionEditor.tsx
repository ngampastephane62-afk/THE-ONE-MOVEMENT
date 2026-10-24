import { programmeArchivePhotos } from '@/lib/programme-photo-archives';
import { card, field } from '@/components/network/kit';

export default function PhotoCaptionEditor({ programme, captions, onChange }: {
  programme: string; captions: Record<string, string>; onChange: (captions: Record<string, string>) => void;
}) {
  const photos = programmeArchivePhotos(programme);
  if (!photos.length) return null;
  return (
    <section className={`${card} space-y-5 p-4 sm:p-5`} data-testid="panel-program-photo-captions">
      <div>
        <h3 className="font-display text-lg text-ink-900">Photo captions</h3>
        <p className="mt-1 text-xs text-ink-700">Add a caption below each slideshow photograph. Save a private draft or publish using the programme controls above. Clear a caption to remove your text. Maximum 300 characters per photo.</p>
      </div>
      {photos.map((photo, i) => (
        <div key={photo.id} className="grid gap-3 border-t border-sand-300 pt-4 sm:grid-cols-[112px_1fr]">
          <img src={photo.src} alt={photo.alt} width={photo.w} height={photo.h} loading="lazy"
            className="block h-auto w-28 self-start" />
          <div className="min-w-0">
            <label htmlFor={`caption-${photo.id}`} className="block text-xs font-semibold text-ink-900">Photo {i + 1} caption</label>
            <textarea id={`caption-${photo.id}`} value={captions[photo.id] ?? ''} maxLength={300}
              rows={3} className={`${field} mt-2 w-full`} data-testid={`input-photo-caption-${photo.id}`}
              onChange={e => onChange({ ...captions, [photo.id]: e.target.value })}
              aria-describedby={`caption-limit-${photo.id}`} />
            <p id={`caption-limit-${photo.id}`} className="mt-1 text-right text-[11px] tabular-nums text-ink-700">{(captions[photo.id] ?? '').length} / 300</p>
            {captions[photo.id] && <p className="mt-2 whitespace-pre-line break-words text-sm text-ink-800" data-testid={`preview-photo-caption-${photo.id}`}>{captions[photo.id]}</p>}
          </div>
        </div>
      ))}
    </section>
  );
}
