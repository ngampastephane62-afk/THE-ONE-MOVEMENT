import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import EcosystemHero from '@/components/ecosystem/EcosystemHero';
import SectorExplorer from '@/components/ecosystem/SectorExplorer';
import MemberDirectory from '@/components/ecosystem/MemberDirectory';
import JoinPaths from '@/components/ecosystem/JoinPaths';
import { SECTORS } from '@/lib/sectors-data';

function prefersReduced() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

export default function Ecosystem() {
  const [paused, setPaused] = useState<boolean>(prefersReduced());
  const [sector, setSector] = useState<string>(SECTORS[0].slug);
  return (
    <div className={paused ? 'eco-paused' : ''}>
      <Helmet>
        <title>THE ECOSYSTEM — SEVENTEEN SECTORS, ONE COMMUNITY</title>
        <meta name="description" content="Find your sector, the TOMI programmes connected to it, curated official knowledge and the opt-in community directory." />
      </Helmet>
      <EcosystemHero paused={paused} onTogglePause={() => setPaused((p) => !p)} selected={sector} onPickSector={setSector} />
      <SectorExplorer selected={sector} onSelect={setSector} />
      <MemberDirectory />
      <JoinPaths />
    </div>
  );
}
