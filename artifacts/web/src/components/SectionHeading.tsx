import { cn } from '@/lib/utils';
import GoldThread from './GoldThread';

interface SectionHeadingProps {
  /** Eyebrow line — small, uppercase, gold, appears above heading */
  eyebrow?: string;
  heading: string;
  /** Optional subheading / body below the heading */
  subheading?: string;
  /** Append a GoldThread below the heading */
  thread?: boolean;
  /** Text alignment — asymmetric (start) is default per composition rules */
  align?: 'start' | 'center';
  /** Heading size personality */
  size?: 'xl' | 'lg' | 'md';
  /** Light or dark surface context — determines text colours */
  surface?: 'light' | 'dark';
  className?: string;
}

const sizeMap = {
  xl: 'text-display-xl',
  lg: 'text-display-lg',
  md: 'text-display-md',
};

/**
 * SectionHeading — eyebrow + display heading + optional thread.
 *
 * Composition rules: default alignment is start (left in LTR).
 * The eyebrow is always gold; it "introduces" the section before
 * the large heading lands.
 */
export default function SectionHeading({
  eyebrow,
  heading,
  subheading,
  thread = false,
  align = 'start',
  size = 'lg',
  surface = 'light',
  className,
}: SectionHeadingProps) {
  const isDark = surface === 'dark';

  return (
    <div
      className={cn(
        'flex flex-col',
        align === 'center' ? 'items-center text-center' : 'items-start text-start',
        className,
      )}
    >
      {eyebrow && (
        <span
          className={cn(
            'text-eyebrow mb-3',
            isDark ? 'text-gold-400' : 'text-gold-600',
          )}
        >
          {eyebrow}
        </span>
      )}

      <h2
        className={cn(
          sizeMap[size],
          isDark ? 'text-ivory-100' : 'text-ink-900',
          'font-display',
        )}
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {heading}
      </h2>

      {thread && (
        <GoldThread
          className={cn('mt-5', align === 'center' ? 'self-stretch' : '')}
          length={align === 'center' ? '100%' : '200px'}
          node
        />
      )}

      {subheading && (
        <p
          className={cn(
            'mt-4 max-w-xl leading-relaxed',
            isDark ? 'text-ivory-200' : 'text-sand-400',
          )}
        >
          {subheading}
        </p>
      )}
    </div>
  );
}
