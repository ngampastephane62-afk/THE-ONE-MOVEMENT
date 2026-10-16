import { ArrowUpRight } from 'lucide-react';
import { leaderFor } from './introductions';

/** Verified leader and actual role, or an honest placeholder. Never a contact route. */
export default function LeaderLine({ partnerId, tone = 'light' }: { partnerId: number; tone?: 'light' | 'dark' }) {
  const l = leaderFor(partnerId);
  const dark = tone === 'dark';
  const muted = dark ? 'text-ivory-300' : 'text-ink-600';
  if (!l) {
    return (
      <div className="min-h-[3.25rem]" data-testid={`leader-pending-${partnerId}`}>
        <p className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${muted}`}>Leadership</p>
        <p className={`mt-0.5 text-xs italic ${muted}`}>Leadership details not yet confirmed</p>
      </div>
    );
  }
  return (
    <div className="min-h-[3.25rem]" data-testid={`leader-${partnerId}`}>
      <p className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${muted}`}>Leadership</p>
      <p className={`mt-0.5 text-sm font-semibold leading-snug ${dark ? 'text-ivory-100' : 'text-ink-900'}`} translate="no">{l.name}</p>
      <p className={`text-xs leading-snug ${dark ? 'text-ivory-200' : 'text-ink-700'}`}>{l.role}</p>
      {l.scope && <p className={`text-[11px] leading-snug ${muted}`}>{l.scope}</p>}
      <a href={l.sourceUrl} target="_blank" rel="noreferrer" className={`mt-0.5 inline-flex min-h-8 items-center gap-1 text-[11px] underline underline-offset-2 ${muted}`} data-testid={`leader-source-${partnerId}`}>
        <span>Source</span><ArrowUpRight className="h-3 w-3" aria-hidden />
      </a>
    </div>
  );
}
