import { cn } from '@/lib/utils';
import { MaskLine, Rise, useInView } from '@/components/programs/editorial/motion';

interface SectionHeadingProps {
  /** Eyebrow line — small, uppercase, gold, appears above heading */
  eyebrow?: string;
  /** Use "\n" to split the heading into lines that reveal one by one. */
  heading: string;
  /** Optional subheading / body below the heading */
  subheading?: string;
  /** Draw a gold rule beneath the heading */
  thread?: boolean;
  align?: 'start' | 'center';
  size?: 'xl' | 'lg' | 'md';
  surface?: 'light' | 'dark';
  /** Heading level (default h2). Use h1 for page heroes. */
  as?: 'h1' | 'h2' | 'h3';
  id?: string;
  className?: string;
  /** Replaces the size class (bespoke page scales keep their layout). */
  headingClassName?: string;
  /** Colour the last line as an accent (e.g. 'text-gold-400'). */
  lastLineClassName?: string;
}

const sizeMap = {
  xl: 'text-display-xl',
  lg: 'text-display-lg',
  md: 'text-display-md',
};

/**
 * SectionHeading — the single shared cinematic heading system.
 * Sequence: label draws in → heading lines rise from masks (staggered)
 * → gold rule draws → supporting text rises. Scroll-triggered once.
 * Text is never permanently hidden: IntersectionObserver absence and
 * reduced-motion both resolve to the fully visible state.
 */
export default function SectionHeading({
  eyebrow,
  heading,
  subheading,
  thread = false,
  align = 'start',
  size = 'lg',
  surface = 'light',
  as: Tag = 'h2',
  id,
  className,
  headingClassName,
  lastLineClassName,
}: SectionHeadingProps) {
  const isDark = surface === 'dark';
  const [ref, shown] = useInView<HTMLDivElement>(0.15);
  const lines = heading.split('\n');

  return (
    <div
      ref={ref}
      className={cn('flex flex-col', align === 'center' ? 'items-center text-center' : 'items-start text-start', className)}
    >
      {eyebrow && (
        <Rise shown={shown} className="mb-3">
          <span className={cn('text-eyebrow', shown && 'tomi-label', isDark ? 'text-gold-400' : 'text-gold-600')}>{eyebrow}</span>
        </Rise>
      )}

      <Tag
        id={id}
        className={cn(headingClassName ?? sizeMap[size], isDark ? 'text-ivory-100' : 'text-ink-900', 'font-display')}
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {lines.map((l, i) => (
          <MaskLine key={i} shown={shown} delay={120 + i * 130} className={i === lines.length - 1 && lines.length > 1 ? lastLineClassName : undefined}>{l}</MaskLine>
        ))}
      </Tag>

      {thread && <span aria-hidden="true" className={cn('tomi-head-rule mt-5', align === 'center' && 'is-center', shown && 'is-on')} />}

      {subheading && (
        <Rise shown={shown} delay={420} as="p" className={cn('mt-4 max-w-xl leading-relaxed', isDark ? 'text-ivory-200' : 'text-ink-700')}>
          {subheading}
        </Rise>
      )}
    </div>
  );
}
