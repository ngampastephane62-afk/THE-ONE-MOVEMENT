import fashionCover from '@/assets/media/editorial/fashion-three-models.webp';
import awardsCover from '@/assets/media/editorial/awards-naomi.webp';

export default function ProgrammeCover({ programme, className = '' }: { programme: 'awards' | 'fashion-week'; className?: string }) {
  const awards = programme === 'awards';
  return <figure className={`overflow-hidden bg-lagoon-900 ${className}`} data-testid={`programme-cover-${programme}`}>
    <img src={awards ? awardsCover : fashionCover} alt={awards ? 'Official The One Awards artwork featuring Naomi Campbell · announced recognition' : 'The One Fashion Week · supplied official artwork featuring three models'} className="h-full w-full object-contain" loading="lazy" />
  </figure>;
}
