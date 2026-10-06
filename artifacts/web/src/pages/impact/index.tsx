import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import HeroSurface from '@/components/HeroSurface';
import ArchivePhoto, { archiveVideo } from '@/components/ArchivePhoto';
import ResponsiveMedia from '@/components/ResponsiveMedia';
import { Button } from '@/components/ui/button';

export default function Impact() {
  const outreach = archiveVideo('community-outreach');
  return (
    <div>
      <Helmet><title>COMMUNITY & IMPACT — THE ONE MOVEMENT INTERNATIONAL</title><meta name="description" content="Community and humanitarian action within The One Movement's wider ecosystem of connections." /></Helmet>
      <HeroSurface minHeight="60vh">
        <div className="mx-auto max-w-7xl px-6 py-section-lg grid gap-10 lg:grid-cols-2 items-center">
          <div>
            <p className="text-eyebrow text-gold-400">COMMUNITY & IMPACT</p>
            <h1 className="mt-5 text-display-lg text-ivory-100" style={{ fontFamily: 'var(--font-display)' }}>CONNECTION WITH A HUMAN PURPOSE.</h1>
            <p className="mt-6 text-lg leading-relaxed text-ivory-200">Community and humanitarian action belong within a wider ecosystem of business, institutions, culture and opportunity. These moments from the Movement show people coming together, without reducing the whole network to a single cause.</p>
          </div>
          <ArchivePhoto id="community-outreach" priority className="mx-auto max-w-sm w-full" caption="Community outreach" captionClassName="text-ivory-200" />
        </div>
      </HeroSurface>
      <section className="bg-ivory-100 py-section-lg">
        <div className="mx-auto max-w-7xl px-6 grid gap-10 md:grid-cols-2 items-center">
          <ArchivePhoto id="community-gathering" caption="People coming together" />
          <div><h2 className="text-display-md text-ink-900" style={{ fontFamily: 'var(--font-display)' }}>TAKE PART THROUGH CONNECTION.</h2><p className="mt-6 text-ink-800 leading-relaxed">Volunteers, organizations and institutions can share their interests with the team. Participation and collaboration are discussed in the context of confirmed activities; submitting an enquiry is not a promise of placement.</p><Link href="/join" className="mt-8 inline-block"><Button variant="gold-outline">EXPRESS YOUR INTEREST</Button></Link></div>
        </div>
      </section>
      <section className="bg-lagoon-900 py-section-lg">
        <div className="mx-auto max-w-7xl px-6 grid gap-10 md:grid-cols-2 items-center">
          <div><p className="text-eyebrow text-gold-400">MOVEMENT IN ACTION</p><h2 className="mt-5 text-display-md text-ivory-100" style={{ fontFamily: 'var(--font-display)' }}>COMMUNITY OUTREACH.</h2><p className="mt-6 text-ivory-200 leading-relaxed">A moment of community action from the Movement's video archive.</p></div>
          <ResponsiveMedia kind="vertical-reel" label="Community outreach" purpose={outreach.purpose} videoSrc={outreach.videoSrc} videoFallbackSrc={outreach.videoFallbackSrc} posterSrc={outreach.posterSrc} assetId="IMPACT-COMMUNITY" autoPlay={false} className="aspect-[9/16] w-full max-w-xs mx-auto" />
        </div>
      </section>
    </div>
  );
}
