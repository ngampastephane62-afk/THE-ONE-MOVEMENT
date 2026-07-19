import { useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
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
 */
export default function SuccessPanel({ submissionStatus }: SuccessPanelProps) {
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
        Our team reviews every submission. You will receive official updates from
        the Movement as the member platform moves toward launch.
      </p>

      <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center pt-2">
        <Button asChild size="lg">
          <Link href="/ecosystem">EXPLORE THE ECOSYSTEM</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/programs">DISCOVER THE PROGRAMS</Link>
        </Button>
        <Button asChild variant="ghost" size="lg">
          <Link href="/">RETURN HOME</Link>
        </Button>
      </div>
    </div>
  );
}
