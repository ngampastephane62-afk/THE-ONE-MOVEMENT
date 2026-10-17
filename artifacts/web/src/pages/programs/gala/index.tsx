import { useCallback, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import GalaHero from './Hero';
import GalaVision from './Vision';
import EverydayEcosystem from '@/components/programs/EverydayEcosystem';
import GalaPavilions from './Pavilions';
import GalaExperiences from './Experiences';
import GalaParticipants from './Participants';
import GalaRepresent from './Represent';
import GalaCulture from './Culture';
import GalaPartnerships from './Partnerships';
import GalaClosing from './Closing';

const TITLE = 'The One Diplomatic Gala — The World, Under One Roof | THE ONE MOVEMENT INTERNATIONAL';
const DESC = 'A global gathering of nations, cultures, communities and opportunities. Explore the World Pavilions and express interest in representing your country.';

export default function DiplomaticGalaPage() {
  const [category, setCategory] = useState('');
  const headingRef = useRef<HTMLHeadingElement>(null);

  const goToForm = useCallback((next?: string) => {
    if (next) setCategory(next);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById('represent-country')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    window.setTimeout(() => headingRef.current?.focus({ preventScroll: true }), reduce ? 0 : 500);
  }, []);

  return (
    <div className="bg-ivory-100">
      <Helmet>
        <title>{TITLE}</title>
        <meta name="description" content={DESC} />
        <meta property="og:title" content="The One Diplomatic Gala — The World, Under One Roof" />
        <meta property="og:description" content={DESC} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/programs/diplomatic-gala" />
      </Helmet>
      <GalaHero onRepresent={() => goToForm()} />
      <GalaVision />
      <EverydayEcosystem programmeSlug="diplomatic-gala" />
      <GalaPavilions onPropose={goToForm} />
      <GalaExperiences />
      <GalaParticipants selected={category} onSelect={goToForm} />
      <GalaRepresent ref={headingRef} category={category} onCategoryChange={setCategory} />
      <GalaCulture />
      <GalaPartnerships onSelect={goToForm} />
      <GalaClosing />
    </div>
  );
}
