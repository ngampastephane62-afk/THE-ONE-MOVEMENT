import { cn } from '@/lib/utils';

interface StatBlockProps {
  /** The headline number / value — rendered in display-xl Cinzel */
  value: string;
  /** Descriptive label below the number */
  label: string;
  /** Light or dark surface — controls text colours */
  surface?: 'light' | 'dark';
  className?: string;
}

/**
 * StatBlock — a scale-contrast element.
 *
 * Pairs one enormous display number with a quiet small label —
 * deliberately asymmetric in weight. Use in groups to show impact
 * metrics, reach statistics, or programme counts.
 *
 * Composition: place three StatBlocks in a loose grid alongside a
 * SectionHeading for a powerful scale-contrast section.
 */
export default function StatBlock({
  value,
  label,
  surface = 'light',
  className,
}: StatBlockProps) {
  const isDark = surface === 'dark';

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <span
        className={cn(
          'text-display-xl leading-none tabular-nums',
          isDark ? 'text-gold-400' : 'text-ink-900',
        )}
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {value}
      </span>
      <span
        className={cn(
          'text-eyebrow',
          isDark ? 'text-ivory-300' : 'text-sand-400',
        )}
      >
        {label}
      </span>
    </div>
  );
}
