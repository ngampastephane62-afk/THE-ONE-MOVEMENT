import { BespokeLead, BespokeTail } from '@/components/programs/editorial/BespokeFrame';
import { Helmet } from 'react-helmet-async';
import SummitHero from '@/components/summit/SummitHero';
import PillarGrid from '@/components/summit/PillarGrid';
import EverydayEcosystem from '@/components/programs/EverydayEcosystem';
import SectorDirectory from '@/components/summit/SectorDirectory';
import { KnowledgeSection, MarketplaceSection, NetworkSection } from '@/components/summit/MarketKnowledgeNetwork';
import SummitExperience from '@/components/summit/SummitExperience';
import { FinalCTA, ImpactSection, MediaSection, ParticipationSection } from '@/components/summit/MediaImpactJoin';

const TITLE = 'The One Summit — Where Ideas Become Opportunities | THE ONE MOVEMENT INTERNATIONAL';
const DESC = 'An international ecosystem connecting business, knowledge, innovation, professional communities and impact across Africa, the UAE and the world. The annual Summit is where it meets in person.';

export default function SummitEcosystem() {
  return (
    <div className="[&_*]:motion-reduce:!animate-none [&_section[id]]:scroll-mt-40">
      <Helmet>
        <title>{TITLE}</title>
        <meta name="description" content={DESC} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESC} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${import.meta.env.BASE_URL}images/summit-ecosystem-hero.jpg`} />
        <link rel="canonical" href="/programs/summit" />
      </Helmet>
      <SummitHero />
      <BespokeLead slug="summit" />
      <div>
        <PillarGrid />
        <EverydayEcosystem programmeSlug="summit" />
        <SectorDirectory />
        <MarketplaceSection />
        <KnowledgeSection />
        <NetworkSection />
        <SummitExperience />
        <MediaSection />
        <ImpactSection />
        <ParticipationSection />
        <BespokeTail slug="summit" name="THE ONE SUMMIT" partnership />
        <FinalCTA />
      </div>
    </div>
  );
}
