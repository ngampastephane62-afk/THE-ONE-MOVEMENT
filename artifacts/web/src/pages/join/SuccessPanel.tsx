import { useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { useAuth } from '@clerk/react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import GoldThread from '@/components/GoldThread';

interface SuccessPanelProps {
  /** "received" for first submission, "updated" for duplicate-email update */
  submissionStatus: 'received' | 'updated';
}

/**
 * SuccessPanel — replaces the form on confirmed backend success.
 *
 * Focus moves to the heading on mount (WCAG 2.1 SC 3.3.4).
 * Viewport scrolls to the heading, respecting prefers-reduced-motion.
 * Background: light lagoon-tinted surface with gold top accent — never a
 * plain white box.
 *
 * SLOT FIX: Converted <Button asChild> to buttonVariants + <Link> pattern.
 * Radix Slot v1.2 requires a single React child; Button always renders
 * {loading && <spinner>} + {children} which produces two JSX positions
 * (even when loading=false, the expression is `false` + children). Using
 * buttonVariants directly on the <Link> element eliminates the Slot and
 * ensures a single root element with the correct styles.
 */
export default function SuccessPanel({ submissionStatus }: SuccessPanelProps) {
  const { isSignedIn } = useAuth();
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const heading = headingRef.current;
    if (!heading) return;
    heading.focus();
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    heading.scrollIntoView({
      behavior: prefersReduced ? 'auto' : 'smooth',
      block: 'center',
    });
  }, []);

  const statusLine =
    submissionStatus === 'updated'
      ? 'Your expression of interest has been updated.'
      : 'Your expression of interest has been received.';

  return (
    <div
      className="text-center flex flex-col items-center gap-6 rounded-sm -mx-8 -my-8 px-8 py-16 overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, hsl(187 30% 96%) 0%, hsl(38 40% 97%) 100%)',
        borderTop: '3px solid hsl(43 80% 60%)',
      }}
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Single motif — GoldThread */}
      <GoldThread length="80px" node className="mb-2" />

      <h2
        ref={headingRef}
        tabIndex={-1}
        className="text-display-lg font-display text-ink-900 outline-none"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        WELCOME TO THE BEGINNING.
      </h2>

      <p className="text-ink-800 text-lg leading-relaxed max-w-lg">{statusLine}</p>

      <p className="text-ink-600 text-sm leading-relaxed max-w-lg">
        Our team reviews every submission. You may receive relevant official
        updates as programs and future platform plans are confirmed.
      </p>

      <p className="text-ink-600 text-xs leading-relaxed max-w-lg">
        This form is not an account. {isSignedIn ? 'Your member network is ready.' : 'To join the member network, create an account and verify your email address.'}
      </p>

      <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center pt-2">
        <Link
          href={isSignedIn ? '/member' : '/sign-up'}
          data-testid="link-success-primary"
          className={cn(
            buttonVariants({ size: 'lg' }),
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400 focus-visible:outline-offset-2',
          )}
        >
          {isSignedIn ? 'OPEN MY NETWORK' : 'CREATE MY ACCOUNT'}
        </Link>
        <Link
          href="/ecosystem"
          className={cn(
            buttonVariants({ variant: 'outline', size: 'lg' }),
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400 focus-visible:outline-offset-2',
          )}
        >
          EXPLORE THE ECOSYSTEM
        </Link>
        <Link
          href="/programs"
          className={cn(
            buttonVariants({ variant: 'outline', size: 'lg' }),
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400 focus-visible:outline-offset-2',
          )}
        >
          DISCOVER THE PROGRAMS
        </Link>
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'lg' }),
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400 focus-visible:outline-offset-2',
          )}
        >
          RETURN HOME
        </Link>
      </div>
    </div>
  );
}
