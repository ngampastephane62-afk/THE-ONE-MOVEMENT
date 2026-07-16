import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium',
    'transition-colors duration-150 ease-in-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
    'disabled:pointer-events-none disabled:opacity-40',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
    'hover-elevate active-elevate-2',
  ].join(' '),
  {
    variants: {
      variant: {
        // Primary: gold surface, ink text — the primary CTA
        default:
          'rounded-[var(--radius)] bg-primary text-primary-foreground border border-primary-border font-semibold tracking-wide',
        // Destructive: crimson, ivory text
        destructive:
          'rounded-[var(--radius)] bg-destructive text-destructive-foreground border border-destructive-border',
        // Secondary outline: ivory/sand border, ink text — reads as mid-weight action
        outline:
          'rounded-[var(--radius)] border [border-color:var(--button-outline)] bg-transparent shadow-xs active:shadow-none',
        // Secondary filled: ivory-200 surface
        secondary:
          'rounded-[var(--radius)] bg-secondary text-secondary-foreground border border-secondary-border',
        // Ghost: no fill, no border — lowest hierarchy
        ghost:
          'rounded-[var(--radius)] border border-transparent',
        // Link: text-only
        link:
          'text-primary underline-offset-4 hover:underline p-0 h-auto',
        // Gold outline: gold border + text — prominent on dark/ink surfaces
        'gold-outline':
          'rounded-[var(--radius)] border border-gold-500 text-gold-500 bg-transparent hover:bg-gold-500/10 font-semibold tracking-wide',
      },
      size: {
        default: 'min-h-10 px-5 py-2.5',
        sm:      'min-h-8 px-3.5 py-1.5 text-xs',
        lg:      'min-h-12 px-8 py-3 text-base',
        xl:      'min-h-14 px-10 py-3.5 text-base',
        icon:    'h-9 w-9',
      },
      loading: {
        true:  'opacity-70 pointer-events-none',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      loading: false,
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading = false, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, loading, className }))}
        ref={ref}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading && (
          <span
            className="inline-block h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
        )}
        {children}
      </Comp>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
