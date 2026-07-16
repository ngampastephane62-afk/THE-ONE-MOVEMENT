import * as React from 'react';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────────────────────────────────────
   Card — three personalities:
   • Default (ivory): light reading surface, sharp radius, sand border
   • Dark / Cinematic: ink-800 surface, gold accent detail, for hero areas
   • Program: ivory with a GoldThread accent inset at the top-start edge
   ───────────────────────────────────────────────────────────────────────────── */

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'dark' | 'program';
}

const cardVariantClasses: Record<NonNullable<CardProps['variant']>, string> = {
  default:
    'bg-card text-card-foreground border border-card-border rounded-sharp shadow-sm',
  dark:
    'bg-ink-800 text-ivory-100 border border-ink-600 rounded-sharp shadow-lg',
  program:
    'bg-card text-card-foreground border border-card-border rounded-sharp shadow-sm relative overflow-hidden',
};

// Thin gold accent line running along the top edge (program variant motif)
const ProgramAccentLine = () => (
  <span
    aria-hidden="true"
    className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500"
  />
);

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariantClasses[variant], className)}
      {...props}
    >
      {variant === 'program' && <ProgramAccentLine />}
      {children}
    </div>
  ),
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('font-display font-semibold leading-snug tracking-wide', className)}
    style={{ fontFamily: 'var(--font-display)' }}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm text-muted-foreground leading-relaxed', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
