import ArchivePhoto from '@/components/ArchivePhoto';
import { ActionLink, Eyebrow, SectionTitle } from './SummitUI';
import { IMPACT_FOCUS, PATHWAYS, ROUTES } from './summit-data';

const MEDIA_FORMATS = ['Founder interviews', 'Business stories', 'Innovation reports', 'Expert conversations', 'Podcasts', 'Educational videos', 'Sector insights', 'Impact stories'];

export function MediaSection() {
  return (
    <section id="media" aria-labelledby="media-title" className="scroll-mt-16 bg-ivory-50 py-section-lg border-t border-sand-200">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Eyebrow>THE ONE MEDIA</Eyebrow>
            <SectionTitle id="media-title">STORIES THAT RUN ALL YEAR.</SectionTitle>
            <p className="mt-5 text-ink-700 leading-relaxed">An editorial and educational channel for the ecosystem. Editorial choices stay independent: participation fees never buy coverage.</p>
            <ul className="mt-6 flex flex-wrap gap-2" aria-label="Formats">
              {MEDIA_FORMATS.map((f) => <li key={f} className="bg-ivory-200 px-2.5 py-1 text-[11px] uppercase tracking-wider text-ink-700">{f}</li>)}
            </ul>
            <div className="mt-8"><ActionLink href={ROUTES.media} testId="link-media">Visit The One Media</ActionLink></div>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:col-span-6 lg:col-start-7">
            <ArchivePhoto id="institutional-dialogue" caption sizes="(min-width: 1024px) 24vw, 46vw" frameClassName="aspect-[3/4]" actions={false} />
            <div className="mt-10"><ArchivePhoto id="global-encounter" caption sizes="(min-width: 1024px) 24vw, 46vw" frameClassName="aspect-[3/4]" actions={false} /></div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ImpactSection() {
  return (
    <section id="impact" aria-labelledby="impact-title" className="scroll-mt-16 bg-lagoon-900 py-section-lg text-ivory-100">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-5">
          <Eyebrow dark>THE ONE IMPACT</Eyebrow>
          <SectionTitle id="impact-title" dark>FROM CONVERSATION TO PROJECT.</SectionTitle>
          <ol className="mt-8 space-y-4">
            {[['Learn', 'Understand the problem with people who know it.'], ['Collaborate', 'Bring the right sectors to one table.'], ['Develop', 'Shape proposals that can stand on evidence.']].map(([h, t], i) => (
              <li key={h} className="flex gap-4">
                <span className="font-mono text-gold-400" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <span><span className="block font-semibold uppercase tracking-wider text-sm">{h}</span><span className="text-sm text-ivory-300">{t}</span></span>
              </li>
            ))}
          </ol>
          <div className="mt-8"><ActionLink href={ROUTES.impact} testId="link-impact">Explore impact</ActionLink></div>
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <h3 className="text-eyebrow text-gold-400">FOCUS AREAS</h3>
          <ul className="mt-4 grid grid-cols-1 gap-px bg-ivory-100/10 sm:grid-cols-2">
            {IMPACT_FOCUS.map((f) => <li key={f} className="bg-lagoon-900 px-4 py-4 text-sm text-ivory-200">{f}</li>)}
          </ul>
          <p className="mt-4 text-xs text-ivory-300">Focus areas describe intent. No project is presented as funded or implemented without published evidence.</p>
        </div>
      </div>
    </section>
  );
}

export function ParticipationSection() {
  return (
    <section id="participate" aria-labelledby="participate-title" className="scroll-mt-16 bg-ivory-100 py-section-lg border-t border-sand-200">
      <div className="mx-auto max-w-7xl px-6">
        <Eyebrow>MEMBERSHIP AND PARTICIPATION</Eyebrow>
        <SectionTitle id="participate-title">FIND YOUR WAY IN.</SectionTitle>
        <p className="mt-4 max-w-2xl text-ink-700">Creating an account and a member profile is free. Enquiries are read by the team, who reply with next steps; submitting one does not confirm a place, partnership or price.</p>
        <ul className="mt-10 grid gap-px border border-sand-300 bg-sand-300 sm:grid-cols-2 lg:grid-cols-3">
          {PATHWAYS.map((p, i) => (
            <li key={p.who} className="flex flex-col bg-ivory-50 p-6" data-testid={`card-pathway-${i}`}>
              <h3 className="text-lg text-ink-900" style={{ fontFamily: 'var(--font-display)' }}>{p.who}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-700"><span className="font-semibold text-lagoon-700">Next step: </span>{p.next}</p>
              <div className="mt-5"><ActionLink href={p.href} variant="text" testId={`link-pathway-${i}`}>{p.label}</ActionLink></div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function FinalCTA() {
  return (
    <section aria-labelledby="final-title" className="relative overflow-hidden bg-lagoon-900 py-section-lg text-ivory-100">
      <div className="mx-auto max-w-5xl px-6">
        <h2 id="final-title" className="text-[clamp(1.8rem,5vw,3.6rem)] leading-[1.05]" style={{ fontFamily: 'var(--font-display)' }}>
          YOUR KNOWLEDGE HAS VALUE.<br />
          <span className="text-ivory-300">YOUR BUSINESS HAS POTENTIAL.</span><br />
          <span className="text-gold-300">YOUR IDEAS DESERVE A PLATFORM.</span>
        </h2>
        <p className="mt-6 max-w-xl text-lg text-ivory-200">Join a community built around learning, collaboration, opportunity and impact.</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <ActionLink href={ROUTES.signUp} testId="link-final-member">Become a member</ActionLink>
          <ActionLink href={ROUTES.settings} variant="ghost-dark" testId="link-final-list">List your business</ActionLink>
          <ActionLink href={ROUTES.knowledgeEnquiry} variant="ghost-dark" testId="link-final-expertise">Share your expertise</ActionLink>
          <ActionLink href={ROUTES.partnership} variant="ghost-dark" testId="link-final-partner">Become a partner</ActionLink>
        </div>
        <p className="mt-12 text-sm font-semibold tracking-wide text-gold-300">WE ARE ONE <span className="mx-2 opacity-40" aria-hidden="true">—</span><span lang="ar" dir="rtl" style={{ fontFamily: 'var(--font-arabic)' }}>نحن واحد</span></p>
      </div>
    </section>
  );
}
