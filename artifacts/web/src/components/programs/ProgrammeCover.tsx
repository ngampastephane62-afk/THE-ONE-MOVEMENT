import fashionCover from '@/assets/media/editorial/fashion-three-models.webp';
import awardsCover from '@/assets/media/editorial/awards-naomi.webp';
import PhotoActions from '@/components/editorial/PhotoActions';

const SOURCES = {
  'fashion-week': { source: '/assets/media/editorial/fashion-three-models.webp', title: 'The One Fashion Week · official artwork' },
  awards: { source: '/assets/media/editorial/awards-naomi.webp', title: 'The One Awards · official artwork' },
} as const;

/** actions=false when rendered inside a card link; the card then renders its own sibling strip. */
export default function ProgrammeCover({ programme, className = '', actions = true, tone = 'light' }: { programme: 'awards' | 'fashion-week'; className?: string; actions?: boolean; tone?: 'light' | 'dark' }) {
  const awards = programme === 'awards';
  const fig = <figure className={`overflow-hidden bg-lagoon-900 ${className}`} data-testid={`programme-cover-${programme}`}>
    <img src={awards ? awardsCover : fashionCover} alt={awards ? 'Official The One Awards artwork featuring Naomi Campbell · announced recognition' : 'The One Fashion Week · supplied official artwork featuring three models'} className="block h-auto w-full" loading="lazy" />
  </figure>;
  if (!actions) return fig;
  return <div>{fig}<PhotoActions source={SOURCES[programme].source} title={SOURCES[programme].title} tone={tone} /></div>;
}
