import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import PartnerOrbitStage from '@/components/partners/PartnerOrbitStage';
import PartnerEditorial from '@/components/partners/PartnerEditorial';
import { PartnerInstitutions, PartnerMedia } from '@/components/partners/PartnerHistory';
import PartnerOpportunities from '@/components/partners/PartnerOpportunities';
import InvestmentPresentation from '@/components/partners/InvestmentPresentation';
import BroadcasterAudience from '@/components/partners/BroadcasterAudience';
import SectionHeading from '@/components/SectionHeading';
import Reveal from '@/components/Reveal';
import DocumentaryTeasers from '@/components/editorial/DocumentaryTeasers';
import ResponsiveMedia from '@/components/ResponsiveMedia';
import { archiveVideo } from '@/components/ArchivePhoto';

export default function Partners() {
  return (
    <div className="bg-ivory-50 min-h-screen">
      <Helmet>
        <title>PARTNERS & INVESTMENT — THE ONE MOVEMENT INTERNATIONAL</title>
        <meta name="description" content="Governments, UN entities, diplomatic missions, Rawbank, private companies, international brands and broadcasters that have partnered with The One Movement International — and the paths to invest in or partner with the Movement." />
         <meta property="og:title" content="Partners & Investment — The One Movement International" />
         <meta property="og:description" content="Explore the Movement's partner network and explore investment and partnership opportunities." />
        <link rel="canonical" href="/partners" />
      </Helmet>

      <PartnerOrbitStage />

      <PartnerInstitutions />

      <PartnerOpportunities />

      <InvestmentPresentation />

      <PartnerMedia />

      <BroadcasterAudience />

      <PartnerEditorial />

      {/* DOCUMENTARY ARCHIVE */}
      <section className="py-section-lg bg-ivory-50 border-t border-sand-200" aria-labelledby="engagement-heading">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <SectionHeading eyebrow="SINCE THE FIRST EDITION" heading="OUR DOCUMENTARY ARCHIVE" surface="light" size="lg" thread />
            <p id="engagement-heading" className="mt-6 max-w-2xl leading-relaxed text-ink-800">
              Since its first edition, The One Movement has produced documentaries and magazines.
            </p>
          </Reveal>
          <DocumentaryTeasers />
          <Reveal className="mt-12 flex flex-col items-center sm:flex-row sm:items-center sm:gap-10">
            <ResponsiveMedia
              kind="vertical-reel"
              label={archiveVideo('institutional-meeting').title}
              purpose={archiveVideo('institutional-meeting').purpose}
              videoSrc={archiveVideo('institutional-meeting').videoSrc}
              videoFallbackSrc={archiveVideo('institutional-meeting').videoFallbackSrc}
              posterSrc={archiveVideo('institutional-meeting').posterSrc}
              assetId="PARTNERS-MEETING"
              autoPlay={false}
              className="aspect-[9/16] w-full max-w-xs"
            />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-700 sm:mt-0">
              Meeting with the Private Office of Sheikh Hamdan Al Nahyan · Founder archive footage.
            </p>
          </Reveal>
        </div>
      </section>


      {/* POLICY */}
      <section className="py-12 bg-ivory-50 border-t border-sand-200">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <Reveal>
            <p className="text-[10px] font-semibold text-ink-500 tracking-[0.2em] uppercase">OUR DISPLAY POLICY</p>
            <p className="mt-3 text-sm text-ink-700 leading-relaxed">
              Partners listed on this page are relationships confirmed by the Founder. Organisations that enquire are reviewed before any public listing, and an enquiry is never shown as a partnership.
            </p>
            <p className="mt-3 text-sm text-ink-700 leading-relaxed">Industry profiles are editorial context and do not indicate a partnership.</p>
            <Link href="/news" className="mt-4 inline-block text-sm font-semibold text-lagoon-700 underline underline-offset-4" data-testid="link-press-news">Looking for press coverage? Visit News.</Link>
          </Reveal>
        </div>
      </section>

    </div>
  );
}
