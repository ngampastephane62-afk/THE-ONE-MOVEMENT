import winniePoster from '@/assets/media/programs/awards-winnie-harlow.webp';
import nomineesPoster from '@/assets/media/programs/awards-nominees-poster.webp';
import ciaraPoster from '@/assets/media/programs/awards-ciara-poster.webp';
import SocialVideo from '@/components/editorial/SocialVideo';
import ProgrammeCover from '@/components/programs/ProgrammeCover';

export function AwardsPreview({ className = '' }: { className?: string }) {
  return <ProgrammeCover programme="awards" className={className} />;
}

export function AwardsNominees() {
  return (
    <div>
      <h3 className="font-display text-2xl text-ink-900">Ambassador of Peace — Celebrity Nominees</h3>
      <p className="mt-3 max-w-3xl text-ink-800">
        Meet the celebrities nominated for The One Awards’ Ambassador of Peace recognition.
      </p>
      <div className="mt-8 grid items-start gap-6 md:grid-cols-3">
        <figure>
          <img src={winniePoster} alt="Winnie Harlow · official TOMI nomination poster" width={1200} height={848} className="block h-auto w-full" loading="lazy" />
          <figcaption className="mt-3 text-sm text-ink-700">Winnie Harlow · Ambassador of Peace nominee</figcaption>
        </figure>
        {[
          { file: 'awards-nominees', poster: nomineesPoster, label: 'Celebrity nominees · Ambassador of Peace' },
          { file: 'awards-ciara', poster: ciaraPoster, label: 'Ciara · Ambassador of Peace nominee' },
        ].map(({ file, poster, label }) => (
          <figure key={file}>
            <SocialVideo
              videoId={file === 'awards-ciara' ? 'ciara-nomination' : 'nancy-isime-nomination'}
              title={label}
              preload="none"
              poster={poster}
              aria-label={label}
              className="bg-lagoon-900"
            >
              <source src={`${import.meta.env.BASE_URL}api/program-media/${file}.mp4`} type="video/mp4" />
              Your browser does not support video playback.
            </SocialVideo>
            <figcaption className="mt-3 text-sm text-ink-700">{label}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
