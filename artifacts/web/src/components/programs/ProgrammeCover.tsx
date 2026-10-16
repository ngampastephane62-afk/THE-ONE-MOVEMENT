import awardsCover from '@/assets/media/editorial/awards-naomi.webp';
import PhotoActions from '@/components/editorial/PhotoActions';
import ProgrammeFilm, { ProgrammeFilmPoster } from '@/components/programs/ProgrammeFilm';

/** actions=false when rendered inside a card link: static poster only, no controls. */
export default function ProgrammeCover({ programme, className = '', actions = true, tone = 'light' }: { programme: 'awards' | 'fashion-week'; className?: string; actions?: boolean; tone?: 'light' | 'dark' }) {
  if (programme === 'fashion-week') {
    if (!actions) return <ProgrammeFilmPoster id="fashion-knight-2026" className={className} />;
    return <ProgrammeFilm id="fashion-knight-2026" tone={tone} className={className} caption="Official artwork · The Founder as Chevalier de la paix et de l’unité · Dubai, 22 December 2026" />;
  }
  const fig = <figure className={`overflow-hidden bg-lagoon-900 ${className}`} data-testid="programme-cover-awards">
    <img src={awardsCover} alt="Official The One Awards artwork featuring Naomi Campbell · announced recognition" className="block h-auto w-full" loading="lazy" />
  </figure>;
  if (!actions) return fig;
  return <div>{fig}<PhotoActions source="/assets/media/editorial/awards-naomi.webp" title="The One Awards · official artwork" tone={tone} /></div>;
}
