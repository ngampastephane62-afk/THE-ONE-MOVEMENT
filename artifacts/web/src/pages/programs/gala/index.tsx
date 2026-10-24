import { useCallback, useRef, useState } from 'react';
import { BespokeLead, BespokeTail } from '@/components/programs/editorial/BespokeFrame';
import { Helmet } from 'react-helmet-async';
import GalaHero from './Hero';
import GalaVision from './Vision';
import GalaPavilions from './Pavilions';
import GalaExperiences from './Experiences';
import GalaParticipants from './Participants';
import GalaRepresent from './Represent';
import GalaCulture from './Culture';
import GalaPartnerships from './Partnerships';
import GalaClosing from './Closing';

const TITLE = 'The One Diplomatic Gala — Where Cultures Meet | THE ONE MOVEMENT INTERNATIONAL';
const DESC = 'A cultural diplomacy initiative bringing together people, institutions and creative communities through dialogue, cultural expression and a shared commitment to peaceful coexistence.';

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
        <meta property="og:title" content="The One Diplomatic Gala — Where Cultures Meet" />
        <meta property="og:description" content={DESC} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/programs/diplomatic-gala" />
      </Helmet>
      <GalaHero onRepresent={() => goToForm()} />
      <BespokeLead slug="diplomatic-gala" />
      <GalaExperiences />
      <GalaVision />
      <GalaCulture />
      <GalaPavilions onPropose={goToForm} />
      <GalaParticipants selected={category} onSelect={goToForm} />
      <GalaRepresent ref={headingRef} category={category} onCategoryChange={setCategory} />
      <GalaPartnerships onSelect={goToForm} />
      <BespokeTail slug="diplomatic-gala" name="THE ONE DIPLOMATIC GALA" mediaEyebrow="OFFICIAL VIDEOS AND MEDIA" />
      <GalaClosing />
    </div>
  );
}
