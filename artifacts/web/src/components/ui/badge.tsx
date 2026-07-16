import * as React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  [
    'whitespace-nowrap inline-flex items-center gap-1',
    'rounded-[var(--radius)] border px-2.5 py-0.5 text-xs font-semibold',
    'transition-colors duration-150',
    'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
    'hover-elevate',
  ].join(' '),
  {
    variants: {
      variant: {
        // Default: gold surface (primary accent)
        default:
          'border-transparent bg-primary text-primary-foreground shadow-xs',
        // Gold: bright gold-400 on ink — for dark surfaces
        gold:
          'border-transparent bg-gold-400 text-ink-900 shadow-xs',
        // Verified: gold-500 border + gold text — prestige indicator
        verified:
          'border-gold-500 bg-gold-500/10 text-gold-600 font-semibold',
        // Secondary: muted fill
        secondary:
          'border-transparent bg-secondary text-secondary-foreground',
        // Destructive: crimson
        destructive:
          'border-transparent bg-destructive text-destructive-foreground shadow-xs',
        // Outline: minimal, ink-on-ivory
        outline:
          'text-foreground border [border-color:var(--badge-outline)]',
        // Crimson: for tags, data accents — use sparingly
        crimson:
          'border-transparent bg-crimson-700 text-ivory-50 shadow-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
