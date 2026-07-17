import { cn } from '@/lib/utils';
import type { PathDefinition } from './join-data';

interface PathCardProps {
  path: PathDefinition;
  isSelected: boolean;
  onSelect: (path: PathDefinition) => void;
}

/**
 * PathCard — one of five path options in the "Choose Your Path" section.
 *
 * Implemented as a <button> with aria-pressed for full keyboard + screen-reader
 * support. Min 44px touch target. No color-only state — selected state uses
 * border + background change.
 */
export default function PathCard({ path, isSelected, onSelect }: PathCardProps) {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={() => onSelect(path)}
      className={cn(
        // Layout
        'relative flex flex-col items-start text-left w-full p-6 rounded-sm',
        // Min 44px height (padding ensures this)
        'min-h-[5.5rem]',
        // Transitions
        'transition-all duration-200',
        // Focus visible
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-lagoon-900',
        // Base state — subtle lagoon-800 bg, lagoon-700 border
        !isSelected && [
          'border border-lagoon-700/50 bg-lagoon-800/40',
          'hover:border-gold-500/60 hover:bg-lagoon-800/70',
        ],
        // Selected state — gold border, slightly lighter bg, gold label
        isSelected && [
          'border border-gold-500 bg-lagoon-800/80',
          'shadow-[0_0_0_1px_hsl(39_52%_54%/0.3)]',
        ],
      )}
    >
      {/* Selected indicator dot */}
      {isSelected && (
        <span
          aria-hidden="true"
          className="absolute top-4 right-4 w-2 h-2 rounded-full bg-gold-500"
        />
      )}

      <span
        className={cn(
          'text-sm font-semibold tracking-widest font-display',
          isSelected ? 'text-gold-400' : 'text-ivory-200',
        )}
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {path.label}
      </span>

      <span
        className={cn(
          'mt-1.5 text-xs leading-relaxed',
          isSelected ? 'text-ivory-200' : 'text-ivory-300/70',
        )}
      >
        {path.desc}
      </span>

      {/* Institutional paths hint */}
      {path.scrollsToInquiry && (
        <span className="mt-2 text-xs text-gold-500/80 font-medium">
          Inquiry pathway ↓
        </span>
      )}
    </button>
  );
}
