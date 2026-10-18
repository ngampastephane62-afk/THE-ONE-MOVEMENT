import { ExternalLink, Bookmark, BookmarkCheck } from 'lucide-react';
import type { EcosystemResource } from '@/lib/ecosystem-resources';
import { formatChecked } from '@/lib/ecosystem-match';
import '@/styles/universe.css';

interface Props {
  resource: EcosystemResource;
  tone?: 'light' | 'dark';
  saved?: boolean;
  onToggleSave?: () => void;
  saving?: boolean;
}

export default function ResourceCard({ resource, tone = 'light', saved, onToggleSave, saving }: Props) {
  const dark = tone === 'dark';
  return (
    <article
      data-testid={`card-resource-${resource.id}`}
      className={`tomi-knowledge-card flex flex-col gap-3 border p-5 ${dark ? 'border-lagoon-600/60 bg-lagoon-900/60' : 'border-sand-200 bg-ivory-50'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className={`text-[10px] uppercase tracking-[0.16em] ${dark ? 'text-gold-400' : 'text-gold-700'}`}>
          {resource.kind} · {resource.organization}
        </p>
        {onToggleSave && (
          <button
            type="button"
            onClick={onToggleSave}
            disabled={saving}
            aria-pressed={saved}
            data-testid={`button-save-resource-${resource.id}`}
            className={`inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-1 text-[11px] uppercase tracking-wider disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 ${dark ? 'text-ivory-200 hover:text-gold-400' : 'text-lagoon-600 hover:text-gold-700'}`}
          >
            {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            {saved ? 'Saved' : 'Save'}
          </button>
        )}
      </div>
      <h4 className={`font-display text-base leading-snug ${dark ? 'text-ivory-100' : 'text-ink-900'}`}>{resource.title}</h4>
      <p className={`text-sm leading-relaxed ${dark ? 'text-ivory-300' : 'text-ink-700'}`}>{resource.description}</p>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
        <span className={`text-[11px] ${dark ? 'text-ivory-300/70' : 'text-sand-400'}`}>
          Official source · last checked {formatChecked(resource.checkedOn)}
        </span>
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          data-testid={`link-resource-${resource.id}`}
          className={`inline-flex min-h-11 items-center gap-1.5 text-xs font-semibold uppercase tracking-wider focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 ${dark ? 'text-gold-400 hover:text-gold-500' : 'text-lagoon-600 hover:text-gold-700'}`}
        >
          Visit official page <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </div>
    </article>
  );
}
