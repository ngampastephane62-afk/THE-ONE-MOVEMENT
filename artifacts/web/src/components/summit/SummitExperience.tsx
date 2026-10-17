import { getProgrammeServiceOffers } from '@workspace/shared';
import ArchivePhoto from '@/components/ArchivePhoto';
import { ActionLink, Eyebrow, SectionTitle } from './SummitUI';
import { ROUTES, ZONES } from './summit-data';

export default function SummitExperience() {
  const speaker = getProgrammeServiceOffers('summit').find((o) => o.role === 'speaker');
  const fee = speaker?.priceUsd ?? null;
  return (
    <section id="experience" aria-labelledby="experience-title" className="scroll-mt-16 bg-ivory-100 py-section-lg border-t border-sand-200">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Eyebrow>THE ANNUAL SUMMIT EXPERIENCE</Eyebrow>
            <SectionTitle id="experience-title">MORE THAN A STAGE.<br />A CITY OF ZONES.</SectionTitle>
            <p className="mt-5 max-w-xl text-ink-700 leading-relaxed">Once a year the ecosystem meets in person. Keynotes are one part; the floor is built for showing, testing, learning and meeting.</p>
          </div>
          <div className="lg:col-span-4 lg:col-start-9">
            <ArchivePhoto id="summit-goma" caption="Archive · The One Summit, Goma, DRC" sizes="(min-width: 1024px) 30vw, 92vw" frameClassName="aspect-[4/3]" actions={false} />
          </div>
        </div>

        <ol className="mt-12 grid gap-px border border-sand-300 bg-sand-300 sm:grid-cols-2 lg:grid-cols-4">
          {ZONES.map((z, i) => (
            <li key={z.code} className={`group flex flex-col p-6 ${i === 6 ? 'bg-lagoon-900 text-ivory-100 sm:col-span-2 lg:col-span-1' : 'bg-ivory-50'}`} data-testid={`card-zone-${z.code}`}>
              <span className={`text-4xl leading-none ${i === 6 ? 'text-gold-400' : 'text-gold-600'}`} style={{ fontFamily: 'var(--font-display)' }} aria-hidden="true">{z.code}</span>
              <h3 className={`mt-5 text-sm font-semibold uppercase tracking-[0.12em] ${i === 6 ? 'text-ivory-100' : 'text-ink-900'}`}><span className="sr-only">Zone {z.code}: </span>{z.name}</h3>
              <p className={`mt-2 text-sm leading-relaxed ${i === 6 ? 'text-ivory-200' : 'text-ink-700'}`}>{z.line}</p>
            </li>
          ))}
          <li className="flex flex-col justify-center bg-ivory-100 p-6">
            <p className="text-xs leading-relaxed text-ink-700">Proposed zones. Specific activities, dates and venues depend on the confirmed event programme and are announced officially. No exhibitors, sponsors or speakers are implied.</p>
          </li>
        </ol>

        <div className="mt-10 flex flex-col gap-6 border-t border-sand-300 pt-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-3">
            <ActionLink href={ROUTES.exhibitor} testId="link-exhibit">Exhibit at the Summit</ActionLink>
            <ActionLink href={ROUTES.speaker} variant="outline" testId="link-share-expertise">Share your expertise</ActionLink>
            <ActionLink href={ROUTES.partnership} variant="outline" testId="link-explore-partnerships">Explore partnerships</ActionLink>
          </div>
          {fee !== null && (
            <p className="max-w-sm text-xs leading-relaxed text-ink-700" data-testid="text-speaker-fee">
              Speaking slots for non-sponsors carry a USD {fee.toLocaleString('en-US')} participation fee, agreed in a written scope.{' '}
              <ActionLink href={ROUTES.speakerSponsor} variant="text" testId="link-speaker-sponsor">Already a sponsor?</ActionLink>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
