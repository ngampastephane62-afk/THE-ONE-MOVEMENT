import { ECOSYSTEM_PERSONAS } from '@/lib/ecosystem-resources';

interface Props {
  value: string | null;
  onChange: (id: string | null) => void;
}

export default function PersonaPicker({ value, onChange }: Props) {
  return (
    <div role="radiogroup" aria-label="Personalize your discovery (optional)" className="flex flex-wrap gap-2">
      <button
        type="button"
        role="radio"
        aria-checked={value === null}
        onClick={() => onChange(null)}
        data-testid="button-persona-all"
        className={`min-h-[44px] px-4 py-2.5 text-xs uppercase tracking-[0.1em] border transition-colors ${value === null ? 'bg-gold-500 border-gold-500 text-ink-900' : 'border-ivory-100/25 text-ivory-200 hover:border-gold-400'}`}
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
            className={`min-h-[44px] px-4 py-2.5 text-xs uppercase tracking-[0.1em] border transition-colors ${active ? 'bg-gold-500 border-gold-500 text-ink-900' : 'border-ivory-100/25 text-ivory-200 hover:border-gold-400'}`}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
