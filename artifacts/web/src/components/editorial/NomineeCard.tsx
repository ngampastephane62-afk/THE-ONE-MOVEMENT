import { Link } from 'wouter';
import { ArrowUpRight } from 'lucide-react';
import type { AmbassadorProfile } from '@workspace/shared';
import { posterFor } from './posters';
import { WEALTH_ESTIMATES } from '@/lib/wealth-data';

export default function NomineeCard({ person, index, dark = false }: { person: AmbassadorProfile; index: number; dark?: boolean }) {
  const poster = posterFor(person.poster);
  return (
    <Link
      href={`/ambassadors/${person.slug}`}
      className="group block"
      data-testid={`card-nominee-${person.slug}`}
    >
      <div className={`relative overflow-hidden ${dark ? 'bg-lagoon-800' : 'bg-lagoon-900'}`}>
        {poster && (
          <img
            src={poster.src}
            alt={`${person.name} — official TOMI Ambassador of Peace nominee poster`}
            width={poster.width}
            height={poster.height}
            loading="lazy"
            className="block h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.02] motion-reduce:transform-none"
          />
        )}
        <span className="absolute left-4 top-4 font-mono text-[11px] tracking-widest text-gold-400">{String(index + 1).padStart(2, '0')}</span>
        <span className="absolute right-4 top-4 border border-gold-400/60 bg-lagoon-900/60 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-gold-400">Nominee</span>
      </div>
      <div className="pt-4">
        <p className={`font-display text-2xl leading-tight ${dark ? 'text-ivory-100' : 'text-ink-900'}`}>{person.name}</p>
        <p className={`mt-1 text-xs ${dark ? 'text-ivory-300' : 'text-ink-700'}`}>{person.role}</p>
        {WEALTH_ESTIMATES[person.slug] && <p className={`mt-3 text-xs ${dark ? 'text-gold-400' : 'text-gold-600'}`}>Estimated net worth: {WEALTH_ESTIMATES[person.slug]!.display}</p>}
        {WEALTH_ESTIMATES[person.slug] && <p className={`mt-1 text-[10px] ${dark ? 'text-ivory-300' : 'text-ink-700'}`}>{WEALTH_ESTIMATES[person.slug]!.publisher} · {WEALTH_ESTIMATES[person.slug]!.date} </p>}
      </div>
      <p className={`mt-3 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] ${dark ? 'text-gold-400' : 'text-gold-600'}`}>
        View profile <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </p>
    </Link>
  );
}
