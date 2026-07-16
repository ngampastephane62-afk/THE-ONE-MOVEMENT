import { cn } from '@/lib/utils';

/**
 * Skeleton — loading placeholder using a gold shimmer sweep.
 * The shimmer is CSS-only and respects prefers-reduced-motion.
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-sharp bg-sand-100 overflow-hidden relative',
        'before:absolute before:inset-0',
        'before:bg-gradient-to-r before:from-transparent before:via-gold-400/20 before:to-transparent',
        'before:bg-[length:400%_100%] before:animate-shimmer',
        '@media(prefers-reduced-motion:reduce):before:animate-none',
        className,
      )}
      aria-hidden="true"
      {...props}
    />
  );
}

export { Skeleton };
