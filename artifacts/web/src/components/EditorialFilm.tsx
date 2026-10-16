import { basePath } from '@/lib/clerk';

/** Editorial film with native controls, no autoplay, base-path aware sources. */
export default function EditorialFilm({ name, label, caption, credit, testId }: { name: string; label: string; caption: string; credit?: string; testId: string }) {
  const src = (ext: string) => `${basePath}/api/editorial-media/${name}.${ext}`;
  return (
    <figure className="tomi-film" data-testid={testId}>
      <div className="relative overflow-hidden border border-gold-500/30 bg-lagoon-900 shadow-[0_30px_80px_hsl(187_67%_4%/0.35)]">
        <video
          controls
          playsInline
          preload="none"
          poster={src('webp')}
          aria-label={label}
          className="block aspect-video w-full bg-lagoon-900 object-cover"
        >
          <source src={src('webm')} type="video/webm" />
          <source src={src('mp4')} type="video/mp4" />
        </video>
      </div>
      <figcaption className="mt-4 flex gap-4 text-sm leading-relaxed">
        <span aria-hidden className="mt-2 h-px w-10 shrink-0 bg-gold-500" />
        <span>
          {caption}
          {credit && <span className="mt-1 block text-xs uppercase tracking-[0.16em] opacity-70">{credit}</span>}
        </span>
      </figcaption>
    </figure>
  );
}
