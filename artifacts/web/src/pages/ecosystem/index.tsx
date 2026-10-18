import { useEffect, useState } from 'react';
import { useSearch } from 'wouter';
import { Helmet } from 'react-helmet-async';
import EcosystemHero from '@/components/ecosystem/EcosystemHero';
import SectorExplorer from '@/components/ecosystem/SectorExplorer';
import MemberDirectory from '@/components/ecosystem/MemberDirectory';
import GlobalDiscovery from '@/components/discovery/GlobalDiscovery';
import EcosystemConcepts from '@/components/ecosystem/EcosystemConcepts';
import JoinPaths from '@/components/ecosystem/JoinPaths';
import { sectorFromSearch } from '@/components/ecosystem/sector-location';

function prefersReduced() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

export default function Ecosystem() {
  const search = useSearch();
  const [paused, setPaused] = useState<boolean>(prefersReduced());
  const [sector, setSector] = useState<string>(() => sectorFromSearch(search));
  useEffect(() => { setSector(sectorFromSearch(search)); }, [search]);
  return (
    <div className={paused ? 'eco-paused' : ''}>
      <Helmet>
        <title>THE ECOSYSTEM — SEVENTEEN SECTORS, ONE COMMUNITY</title>
        <meta name="description" content="Find your sector, the TOMI programmes connected to it, curated official knowledge and the opt-in community directory." />
      </Helmet>
      <EcosystemHero paused={paused} onTogglePause={() => setPaused((p) => !p)} selected={sector} onPickSector={setSector} />
      <GlobalDiscovery />
      <SectorExplorer selected={sector} onSelect={setSector} />
      <MemberDirectory />
      <EcosystemConcepts />
      <JoinPaths />
    </div>
  );
}
