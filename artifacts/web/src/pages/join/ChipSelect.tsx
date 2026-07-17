import { cn } from '@/lib/utils';

interface ChipOption {
  slug: string;
  label: string;
}

interface ChipSelectProps {
  options: ChipOption[];
  selected: string[];
  max: number;
  onChange: (next: string[]) => void;
  id?: string;
}

/**
 * ChipSelect — multi-select chip component for sector interests.
 *
 * Each chip is a <button type="button" aria-pressed> for full keyboard access.
 * The 4th selection is prevented with a visible "cap reached" message.
 * Live counter "X of {max} selected" is visible and aids screen readers.
 */
export default function ChipSelect({
  options,
  selected,
  max,
  onChange,
  id,
}: ChipSelectProps) {
  const atCap = selected.length >= max;

  function toggle(slug: string) {
    if (selected.includes(slug)) {
      onChange(selected.filter((s) => s !== slug));
    } else if (!atCap) {
      onChange([...selected, slug]);
    }
  }

  return (
    <div id={id}>
      {/* Live counter */}
      <p
        className="mb-3 text-xs text-sand-400"
        aria-live="polite"
        aria-atomic="true"
      >
        {selected.length} of {max} selected
        {atCap && (
          <span className="ml-2 text-coral-500 font-medium">
            — maximum reached
          </span>
        )}
      </p>

      {/* Chip grid */}
      <div
        role="group"
        aria-label={`Sector interests — select up to ${max}`}
        className="flex flex-wrap gap-2"
      >
        {options.map(({ slug, label }) => {
          const isSelected = selected.includes(slug);
          const isDisabled = atCap && !isSelected;

          return (
            <button
              key={slug}
              type="button"
              aria-pressed={isSelected}
              disabled={isDisabled}
              onClick={() => toggle(slug)}
              className={cn(
                'inline-flex items-center px-4 py-2 rounded-full text-sm font-medium',
                'transition-all duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lagoon-400 focus-visible:ring-offset-1',
                'disabled:opacity-40 disabled:cursor-not-allowed',
                // Unselected
                !isSelected && !isDisabled && [
                  'border border-sand-300 text-ink-700 bg-transparent',
                  'hover:border-lagoon-400 hover:text-lagoon-600',
                ],
                // Disabled (cap reached)
                !isSelected && isDisabled && [
                  'border border-sand-200 text-sand-300 bg-transparent',
                ],
                // Selected
                isSelected && [
                  'border border-lagoon-500 bg-lagoon-500/10 text-lagoon-700',
                ],
              )}
            >
              {isSelected && (
                <span aria-hidden="true" className="mr-1.5 text-lagoon-500">
                  ✓
                </span>
              )}
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
