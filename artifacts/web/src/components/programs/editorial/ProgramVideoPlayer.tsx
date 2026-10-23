import type { ProgramVideo } from '@workspace/api-client-react';
import SocialVideo from '@/components/editorial/SocialVideo';

/** One approved programme video. Never autoplays; native controls; original aspect ratio (object-contain). */
export default function ProgramVideoPlayer({ video, poster, className = '' }: { video: ProgramVideo; poster?: string; className?: string }) {
  if (!video.url) return null;
  const legacy: Record<string, string> = {
    'ciara-announcement': 'ciara-nomination', 'ciara-original': 'ciara-nomination',
    'nancy-original': 'nancy-isime-nomination', 'mohombi-announcement': 'mohombi-nomination',
    'awards-rosina-2027': 'awards-rosina-2027',
    'nancy-isime-supplied': 'awards-nancy-isime-supplied', 'ciara-supplied': 'awards-ciara-supplied',
    'rosina-peace-supplied': 'awards-rosina-peace-supplied',
  };
  const uploaded = /^\/api\/program-editorial\/([a-z-]+)\/assets\/([0-9a-f-]{36})(?:\?|$)/i.exec(video.url);
  const engagementId = (video.assetKey && legacy[video.assetKey]) || (uploaded ? `program-${uploaded[1]}--${uploaded[2]}` : undefined);
  return (
    <div className={className} data-testid={`video-program-${video.id}`}>
      <SocialVideo videoId={engagementId ?? video.id} title={video.title} poster={poster} preload="none" playsInline controls className="max-h-[75vh] w-full bg-ink-900 object-contain">
        <source src={video.url} />
        Your browser does not support video playback.
      </SocialVideo>
      <p className="mt-2 text-sm font-semibold">{video.title}</p>
      {video.description && <p className="mt-1 text-xs leading-relaxed opacity-75">{video.description}</p>}
      {video.credit && <p className="mt-1 text-[11px] opacity-60">{video.credit}</p>}
    </div>
  );
}
