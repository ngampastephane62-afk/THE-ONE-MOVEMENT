import { useState } from 'react';
import { Play } from 'lucide-react';
import type { MediaPublicationEmbed } from '@workspace/api-client-react';
import { safeEmbedSrc } from '@/lib/media-center';

/** Click-to-load video. Nothing is requested from the provider before consent. */
export default function MediaEmbed({ embed, title, poster }: { embed: MediaPublicationEmbed; title: string; poster?: string | null }) {
  const [on, setOn] = useState(false);
  const src = safeEmbedSrc(embed);
  if (!src) return null;
  const provider = embed.provider === 'youtube' ? 'YouTube' : 'Vimeo';
  return (
    <div className="relative aspect-video w-full overflow-hidden bg-lagoon-900">
      {on ? (
        <iframe src={src} title={title} className="absolute inset-0 h-full w-full" allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" loading="lazy" />
      ) : (
        <button type="button" onClick={() => setOn(true)} className="group absolute inset-0 flex flex-col items-center justify-center gap-3 text-ivory-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold-400" aria-label={`Load ${provider} video: ${title}`} data-testid="button-load-embed">
          {poster && <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" loading="lazy" />}
          <span className="relative grid h-14 w-14 place-items-center rounded-full border border-gold-400 bg-lagoon-900/70 transition-transform duration-200 group-hover:scale-105 motion-reduce:transform-none"><Play className="ml-0.5 h-5 w-5 text-gold-400" /></span>
          <span className="relative max-w-xs px-4 text-center text-[11px] leading-relaxed text-ivory-200">Play loads the video from {provider}, which may set its own cookies.</span>
        </button>
      )}
    </div>
  );
}
