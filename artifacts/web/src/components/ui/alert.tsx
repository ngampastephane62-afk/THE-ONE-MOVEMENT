import * as React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const alertVariants = cva(
  [
    'relative w-full rounded-sharp border-s-2 px-4 py-3.5 text-sm',
    '[&>svg+div]:translate-y-[-2px]',
    '[&>svg]:absolute [&>svg]:start-4 [&>svg]:top-3.5',
    '[&>svg~*]:ps-7',
  ].join(' '),
  {
    variants: {
      variant: {
        // Default / info: sand surface, sand border
        default:
          'bg-sand-100/50 border-sand-300 text-foreground [&>svg]:text-muted-foreground',
        // Info: ivory with gold accent
        info:
          'bg-gold-400/8 border-gold-500 text-foreground [&>svg]:text-gold-600',
        // Success: muted green-ish (we stay within our palette using ivory+gold as positive)
        success:
          'bg-ivory-50 border-gold-500 text-foreground [&>svg]:text-gold-600',
        // Warning: warm sand with gold border
        warning:
          'bg-ivory-100 border-gold-500 text-foreground [&>svg]:text-gold-500',
        // Error / destructive: crimson
        destructive:
          'bg-crimson-700/8 border-crimson-700 text-destructive [&>svg]:text-destructive',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
));
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn('mb-1 font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm leading-relaxed [&_p]:leading-relaxed', className)}
    {...props}
  />
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
