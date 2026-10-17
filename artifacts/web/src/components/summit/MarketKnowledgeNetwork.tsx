import { Check, Clock } from 'lucide-react';
import ArchivePhoto from '@/components/ArchivePhoto';
import { ECOSYSTEM_RESOURCES } from '@/lib/ecosystem-resources';
import { ActionLink, Eyebrow, SectionTitle, StatusPill } from './SummitUI';
import { KNOWLEDGE_FORMATS, KNOWLEDGE_TOPICS, ROUTES } from './summit-data';

function Capability({ live, children }: { live: boolean; children: string }) {
  return (
    <li className="flex items-start gap-3 py-2.5 text-sm">
      {live ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-lagoon-600" aria-hidden="true" /> : <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" aria-hidden="true" />}
      <span className="text-ink-800">{children}<span className="sr-only">{live ? ' (available now)' : ' (in development)'}</span></span>
    </li>
  );
}

export function MarketplaceSection() {
  return (
    <section id="marketplace" aria-labelledby="marketplace-title" className="scroll-mt-16 bg-ivory-100 py-section-lg border-t border-sand-200">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <div className="flex items-center gap-3"><Eyebrow>THE ONE MARKETPLACE</Eyebrow><StatusPill status="early-access" /></div>
          <SectionTitle id="marketplace-title">SHOW WHAT YOU DO. BE FOUND FOR IT.</SectionTitle>
          <p className="mt-5 max-w-lg text-ink-700 leading-relaxed">A place for members to showcase products, services, expertise and solutions. We are building it in phases, starting with what already works: your professional profile.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ActionLink href={ROUTES.settings} testId="link-list-business">List your business</ActionLink>
            <ActionLink href={ROUTES.ecosystem} variant="outline" testId="link-explore-marketplace">Explore the marketplace</ActionLink>
          </div>
          <p className="mt-4 max-w-lg text-xs text-ink-700">"List your business" opens your free member profile, where you describe what you offer, what you are looking for and your sectors. "Explore" opens the public opt-in directory. Want dedicated listings? <ActionLink href={ROUTES.marketplaceEnquiry} variant="text" testId="link-marketplace-early">Request early access</ActionLink></p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:col-span-6">
          <div className="border border-sand-300 bg-ivory-50 p-6">
            <h3 className="text-eyebrow text-lagoon-700">AVAILABLE NOW</h3>
            <ul className="mt-2">
              <Capability live>Professional profile with organisation</Capability>
              <Capability live>What you offer and what you seek</Capability>
              <Capability live>Sector classification</Capability>
              <Capability live>Website link and introduction</Capability>
              <Capability live>Opt-in public visibility</Capability>
            </ul>
          </div>
          <div className="border border-dashed border-gold-600/50 bg-ivory-100 p-6">
            <h3 className="text-eyebrow text-gold-700">IN DEVELOPMENT</h3>
            <ul className="mt-2">
              <Capability live={false}>Product and service listings</Capability>
              <Capability live={false}>Portfolio and media galleries</Capability>
              <Capability live={false}>Listing-based enquiries</Capability>
              <Capability live={false}>Calls for collaboration</Capability>
            </ul>
            <p className="mt-3 text-xs text-ink-700">No payments, bookings, transactions or verification are offered through the marketplace.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function KnowledgeSection() {
  return (
    <section id="knowledge" aria-labelledby="knowledge-title" className="scroll-mt-16 bg-lagoon-900 py-section-lg text-ivory-100">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3"><Eyebrow dark>THE ONE KNOWLEDGE HUB</Eyebrow><StatusPill status="early-access" dark /></div>
            <SectionTitle id="knowledge-title" dark>KNOWLEDGE, ORGANISED BY SECTOR.</SectionTitle>
            <p className="mt-5 text-ivory-200 leading-relaxed">A library of guides, videos, case studies, expert interviews and training, being built with members who have something to teach. Until it opens, we point you to official sources we have checked.</p>
            <ul className="mt-6 flex flex-wrap gap-2" aria-label="Planned formats">
              {KNOWLEDGE_FORMATS.map((f) => <li key={f} className="border border-ivory-100/20 px-2.5 py-1 text-[11px] uppercase tracking-wider text-ivory-300">{f}</li>)}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <ActionLink href={ROUTES.knowledgeEnquiry} testId="link-knowledge-early">Join early access</ActionLink>
            </div>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <h3 className="text-eyebrow text-gold-400">PLANNED TOPICS</h3>
            <ol className="mt-4 grid grid-cols-1 gap-x-6 sm:grid-cols-2">
              {KNOWLEDGE_TOPICS.map((t, i) => (
                <li key={t} className="flex gap-3 border-b border-ivory-100/10 py-2.5 text-sm text-ivory-200"><span className="font-mono text-gold-400" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>{t}</li>
              ))}
            </ol>
            <h3 className="mt-10 text-eyebrow text-gold-400">AVAILABLE NOW · CURATED OFFICIAL SOURCES</h3>
            <ul className="mt-4 grid gap-px bg-ivory-100/10 sm:grid-cols-2">
              {ECOSYSTEM_RESOURCES.map((r) => (
                <li key={r.id} className="bg-lagoon-900">
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="block h-full p-4 transition-colors hover:bg-lagoon-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold-400" data-testid={`link-resource-${r.id}`}>
                    <span className="block text-[11px] uppercase tracking-wider text-gold-400">{r.organization}</span>
                    <span className="mt-1 block text-sm font-semibold text-ivory-100">{r.title}</span>
                    <span className="sr-only"> (opens external site)</span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-ivory-300">External public resources, not TOMI publications or partnership claims.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function NetworkSection() {
  const fields = ['Name or display name', 'Organisation', 'Sectors', 'Expertise and offer', 'Country', 'Introduction', 'Collaboration interests', 'Website'];
  return (
    <section id="network" aria-labelledby="network-title" className="scroll-mt-16 bg-ivory-50 py-section-lg">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-5">
          <ArchivePhoto id="conversation" sizes="(min-width: 1024px) 38vw, 92vw" frameClassName="aspect-[4/5]" caption actions={false} />
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <div className="flex items-center gap-3"><Eyebrow>THE ONE NETWORK</Eyebrow><StatusPill status="live" /></div>
          <SectionTitle id="network-title">FIND THE PEOPLE WORTH MEETING.</SectionTitle>
          <p className="mt-5 text-ink-700 leading-relaxed">Professionals, entrepreneurs and experts discoverable by sector and interest. Profiles are private by default; only members who opt in appear publicly, and contact details are never exposed.</p>
          <ul className="mt-6 grid grid-cols-2 gap-x-6 text-sm text-ink-800" aria-label="What a profile can include">
            {fields.map((f) => <li key={f} className="border-b border-sand-300 py-2">{f}</li>)}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <ActionLink href={ROUTES.ecosystem} testId="link-network-directory">Public directory</ActionLink>
            <ActionLink href={ROUTES.people} variant="outline" testId="link-network-people">Member discovery</ActionLink>
            <ActionLink href={ROUTES.settings} variant="text" testId="link-network-profile">Edit your profile</ActionLink>
          </div>
        </div>
      </div>
    </section>
  );
}
