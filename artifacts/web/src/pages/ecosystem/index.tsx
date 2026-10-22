import { useEffect, useState } from 'react';
import { useSearch } from 'wouter';
import { Helmet } from 'react-helmet-async';
import '@/styles/exhibition.css';
import EcosystemHero from '@/components/ecosystem/EcosystemHero';
import SectorExplorer from '@/components/ecosystem/SectorExplorer';
import MemberDirectory from '@/components/ecosystem/MemberDirectory';
import GlobalDiscovery from '@/components/discovery/GlobalDiscovery';
import EcosystemConcepts from '@/components/ecosystem/EcosystemConcepts';
import JoinPaths from '@/components/ecosystem/JoinPaths';
import TomiGuideIntro from '@/components/ecosystem/exhibition/TomiGuideIntro';
import KeyPassage from '@/components/ecosystem/exhibition/KeyPassage';
import { sectorFromSearch } from '@/components/ecosystem/sector-location';
import { usePageHidden, useReducedMotion } from '@/components/ecosystem/exhibition/useStage';

/** The journey: enter the world → meet TOMI → find your direction → the One Key → the gateways → the worlds → the movement. */
export default function Ecosystem() {
  const search = useSearch();
  const reduced = useReducedMotion();
  const hidden = usePageHidden();
  const [userPaused, setPaused] = useState(false);
  // Reduced motion always wins; Play cannot override it.
  const paused = userPaused || reduced;
  const [sector, setSector] = useState<string>(() => sectorFromSearch(search));
  useEffect(() => { setSector(sectorFromSearch(search)); }, [search]);
  // A direct SPA entry may arrive before the browser can find its fragment.
  // Reapply only real public chapter anchors, without changing history.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!['explore', 'discover', 'one-key-passage'].includes(id)) return;
    const frame = requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: 'start' }));
    return () => cancelAnimationFrame(frame);
  }, [search]);
  return (
    <div className={`eco-x${paused ? ' eco-paused' : ''}${hidden ? ' eco-hidden' : ''}`}>
      <Helmet>
        <title>THE ECOSYSTEM — SEVENTEEN SECTORS, ONE COMMUNITY</title>
        <meta name="description" content="Find your sector, the TOMI programmes connected to it, curated official knowledge and the opt-in community directory." />
      </Helmet>
      <EcosystemHero paused={paused} onTogglePause={() => setPaused((p) => !p)} motionLocked={reduced} selected={sector} onPickSector={setSector} />
      <TomiGuideIntro />
      <GlobalDiscovery paused={paused} />
      <KeyPassage paused={paused} />
      <SectorExplorer selected={sector} onSelect={setSector} />
      <MemberDirectory />
      <EcosystemConcepts />
      <JoinPaths />
    </div>
  );
}
