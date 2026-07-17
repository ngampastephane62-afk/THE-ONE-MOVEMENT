import { cn } from '@/lib/utils';
import type { Program } from '@/lib/programs-data';

interface SelectableProgramCardProps {
  program: Program;
  isSelected: boolean;
  onToggle: (slug: string) => void;
}

/**
 * SelectableProgramCard — a program interest toggle card.
 *
 * Implemented as a <button aria-pressed> for full keyboard/screen-reader
 * support. Shows program name and tagline. Min 44px touch target.
 */
export default function SelectableProgramCard({
  program,
  isSelected,
  onToggle,
}: SelectableProgramCardProps) {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={() => onToggle(program.slug)}
      className={cn(
        'relative flex flex-col items-start text-left w-full p-5 rounded-sm',
        'transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lagoon-400 focus-visible:ring-offset-1',
        // Base
        !isSelected && [
          'border border-sand-300 bg-ivory-50',
          'hover:border-lagoon-400',
        ],
        // Selected
        isSelected && [
          'border border-lagoon-500 bg-lagoon-500/8',
        ],
      )}
    >
      {/* Selection indicator */}
      {isSelected && (
        <span
          aria-hidden="true"
          className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-lagoon-500"
        />
      )}

      <span
        className={cn(
          'text-xs font-semibold tracking-widest font-display uppercase',
          isSelected ? 'text-lagoon-700' : 'text-ink-600',
        )}
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {program.name}
      </span>

      <span
        className={cn(
          'mt-1 text-xs leading-snug',
          isSelected ? 'text-ink-700' : 'text-sand-400',
        )}
      >
        {program.tagline}
      </span>
    </button>
  );
}
