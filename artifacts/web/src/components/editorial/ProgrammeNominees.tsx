import { Link } from 'wouter';
import { AMBASSADOR_STATUS_NOTE, getAmbassadorsForProgramme, type AmbassadorProgramme } from '@workspace/shared';
import NomineeCard from './NomineeCard';

const COPY: Record<AmbassadorProgramme, { eyebrow: string; heading: string; lede: string }> = {
  awards: { eyebrow: 'AMBASSADOR OF PEACE · NOMINEES', heading: 'The nominees, profiled.', lede: 'Each nominee has one shared profile covering their work, businesses, public impact and official links.' },
  summit: { eyebrow: 'THE ONE SUMMIT · ANNOUNCED SPEAKERS', heading: 'Voices announced for the stage.', lede: 'The announced Summit speakers are also the Ambassador of Peace nominees. Their appearances are planned.' },
  'fashion-week': { eyebrow: 'FASHION WEEK · RED CARPET', heading: 'Announced for the red carpet.', lede: 'The announced red carpet participants are also the Ambassador of Peace nominees. Their appearances are planned.' },
};

export default function ProgrammeNominees({ programme }: { programme: AmbassadorProgramme }) {
  const people = getAmbassadorsForProgramme(programme);
  if (people.length === 0) return null;
  const c = COPY[programme];
  return (
    <section className="bg-lagoon-900 py-section-lg text-ivory-100" data-testid={`section-nominees-${programme}`}>
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="text-eyebrow text-gold-400">{c.eyebrow}</p>
            <h2 className="mt-4 font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.02]">{c.heading}</h2>
          </div>
          <p className="text-ivory-300 lg:col-span-4 lg:col-start-9">{c.lede}</p>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {people.map((p, i) => <NomineeCard key={p.slug} person={p} index={i} dark />)}
        </div>
        <div className="mt-10 flex flex-col gap-4 border-t border-gold-500/25 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-xs leading-relaxed text-ivory-300">{AMBASSADOR_STATUS_NOTE}</p>
          <Link href="/ambassadors" className="shrink-0 text-xs font-semibold uppercase tracking-[0.2em] text-gold-400 underline-offset-4 hover:underline" data-testid={`link-all-nominees-${programme}`}>All nominees</Link>
        </div>
      </div>
    </section>
  );
}
