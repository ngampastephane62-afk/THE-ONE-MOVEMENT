import { Link } from 'wouter';
import { ArrowUpRight, Bookmark, BookmarkCheck } from 'lucide-react';
import type { Program } from '@/lib/programs-data';
import '@/styles/universe.css';

interface Props {
  program: Program;
  tone?: 'light' | 'dark';
  saved?: boolean;
  onToggleSave?: () => void;
  saving?: boolean;
}

export default function ProgrammeLink({ program, tone = 'light', saved, onToggleSave, saving }: Props) {
  const dark = tone === 'dark';
  return (
    <div
      data-testid={`card-program-${program.slug}`}
      data-program={program.slug}
      className={`tomi-programme tomi-programme-link group flex items-center justify-between gap-3 border px-4 py-3 transition-colors ${dark ? 'border-gold-500/30 hover:border-gold-400' : 'border-sand-200 bg-ivory-50 hover:border-gold-500'}`}
    >
      <Link
        href={`/programs/${program.slug}`}
        data-testid={`link-program-${program.slug}`}
        className="flex min-h-11 min-w-0 flex-1 flex-col justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
      >
        <span className={`block font-display text-sm tracking-wide ${dark ? 'text-ivory-100' : 'text-ink-900'}`}>{program.name}</span>
        <span className={`block text-xs ${dark ? 'text-ivory-300' : 'text-ink-700'}`}>{program.tagline}</span>
      </Link>
      <div className="flex items-center gap-2 shrink-0">
        {onToggleSave && (
          <button
            type="button"
            onClick={onToggleSave}
            disabled={saving}
            aria-pressed={saved}
            aria-label={saved ? `Remove ${program.name} from saved` : `Save ${program.name}`}
            data-testid={`button-save-program-${program.slug}`}
            className={`inline-flex min-h-11 min-w-11 items-center justify-center disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 ${dark ? 'text-ivory-200 hover:text-gold-400' : 'text-lagoon-600 hover:text-gold-700'}`}
          >
            {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          </button>
        )}
        <ArrowUpRight className={`h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ${dark ? 'text-gold-400' : 'text-gold-600'}`} aria-hidden="true" />
      </div>
    </div>
  );
}
