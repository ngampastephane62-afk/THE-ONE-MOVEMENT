import { ECOSYSTEM_PERSONAS } from '@/lib/ecosystem-resources';

interface Props {
  value: string | null;
  onChange: (id: string | null) => void;
}

export default function PersonaPicker({ value, onChange }: Props) {
  return (
    <div role="radiogroup" aria-label="Who are you?" className="flex flex-wrap gap-2">
      <button
        type="button"
        role="radio"
        aria-checked={value === null}
        onClick={() => onChange(null)}
        data-testid="button-persona-all"
        className={`px-4 py-2.5 text-xs uppercase tracking-[0.1em] border transition-colors ${value === null ? 'bg-lagoon-900 border-lagoon-900 text-gold-400' : 'border-sand-300 text-ink-700 hover:border-lagoon-600'}`}
      >
        Everyone
      </button>
      {ECOSYSTEM_PERSONAS.map((p) => {
        const active = value === p.id;
        return (
          <button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(active ? null : p.id)}
            data-testid={`button-persona-${p.id}`}
            className={`px-4 py-2.5 text-xs uppercase tracking-[0.1em] border transition-colors ${active ? 'bg-lagoon-900 border-lagoon-900 text-gold-400' : 'border-sand-300 text-ink-700 hover:border-lagoon-600'}`}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
