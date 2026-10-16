import { Link } from 'wouter';
import { ArrowUpRight } from 'lucide-react';
import type { AmbassadorProfile } from '@workspace/shared';
import { posterFor } from './posters';

export default function NomineeCard({ person, index, dark = false }: { person: AmbassadorProfile; index: number; dark?: boolean }) {
  const poster = posterFor(person.poster);
  return (
    <Link
      href={`/ambassadors/${person.slug}`}
      className="group block"
      data-testid={`card-nominee-${person.slug}`}
    >
      <div className={`relative aspect-[4/5] overflow-hidden ${dark ? 'bg-lagoon-800' : 'bg-lagoon-900'}`}>
        {poster && (
          <img
            src={poster.src}
            alt={`${person.name} — official TOMI Ambassador of Peace nominee poster`}
            loading="lazy"
            className={`h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.04] ${poster.orientation === 'landscape' ? 'object-cover object-left' : 'object-cover object-top'}`}
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-lagoon-900/90 via-lagoon-900/10 to-transparent" />
        <span className="absolute left-4 top-4 font-mono text-[11px] tracking-widest text-gold-400">{String(index + 1).padStart(2, '0')}</span>
        <span className="absolute right-4 top-4 border border-gold-400/60 bg-lagoon-900/60 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-gold-400">Nominee</span>
        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="font-display text-2xl leading-tight text-ivory-100">{person.name}</p>
          <p className="mt-1 text-xs text-ivory-300">{person.role}</p>
        </div>
      </div>
      <p className={`mt-3 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] ${dark ? 'text-gold-400' : 'text-gold-600'}`}>
        View profile <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </p>
    </Link>
  );
}
