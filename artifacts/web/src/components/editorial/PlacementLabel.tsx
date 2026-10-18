import '@/styles/worlds.css';

export type PlacementKind = 'editorial' | 'partner' | 'sponsored';

export const PLACEMENT_COPY: Record<PlacementKind, { label: string; note: string }> = {
  editorial: { label: 'Editorial', note: 'Presented as editorial coverage with its original attribution, not as evidence of a partnership or endorsement.' },
  partner: { label: 'Partner', note: 'A confirmed partner record. Partnership does not imply endorsement of every activity.' },
  sponsored: { label: 'Sponsored', note: 'Paid visibility. Sponsorship is not verification or endorsement.' },
};

/** Reusable placement label. Callers must pass the kind stated by the actual record; never infer it. */
export default function PlacementLabel({ kind, showNote = false, tone = 'light' }: { kind: PlacementKind; showNote?: boolean; tone?: 'light' | 'dark' }) {
  const c = PLACEMENT_COPY[kind];
  return (
    <span className="inline-flex flex-col gap-1">
      <span className={`pl-label pl-${kind} ${tone === 'dark' ? 'pl-dark' : ''}`} title={c.note} data-testid={`label-placement-${kind}`}>{c.label}</span>
      {showNote && <span className={`text-[11px] ${tone === 'dark' ? 'text-ivory-300' : 'text-ink-700'}`}>{c.note}</span>}
    </span>
  );
}
