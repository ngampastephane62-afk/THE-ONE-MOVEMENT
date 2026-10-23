import { useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import SummitEcosystem from './SummitEcosystem';
import DiplomaticGala from './gala';
import FashionWeekPage from './fashion';
import AwardsPage from './awards';
import ProgrammeEditorialPage from './ProgrammeEditorialPage';
import { getProgramBySlug } from '@/lib/programs-data';

/** Routes each of the six official programmes to its page. Gala, Summit and Fashion Week keep bespoke pages. */
export default function ProgramDetail() {
  const params = useParams<{ slug: string }>();
  const [, navigate] = useLocation();
  const program = getProgramBySlug(params.slug ?? '');

  useEffect(() => {
    if (!program) navigate('/programs', { replace: true });
  }, [program, navigate]);

  if (!program) return null;
  if (program.slug === 'summit') return <SummitEcosystem />;
  if (program.slug === 'diplomatic-gala') return <DiplomaticGala />;
  if (program.slug === 'fashion-week') return <FashionWeekPage />;
  if (program.slug === 'awards') return <AwardsPage />;
  if (program.slug === 'fashion-night' || program.slug === 'investment-forum') {
    return <ProgrammeEditorialPage key={program.slug} program={{ ...program, slug: program.slug }} />;
  }
  return null;
}
