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
 * Focus moves to the heading on mount (WCAG 2.1 SC 3.3.4 — focus after
 * dynamic content change). No account/approval claims per spec.
 */
export default function SuccessPanel({ submissionStatus }: SuccessPanelProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const statusLine =
    submissionStatus === 'updated'
      ? 'Your expression of interest has been updated.'
      : 'Your expression of interest has been received.';

  return (
    <div
      className="text-center flex flex-col items-center gap-6 py-12"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Decorative thread */}
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

      <p className="text-sand-400 leading-relaxed max-w-lg">
        Our team reviews every submission. You will receive official updates from
        the Movement as the member platform moves toward launch.
      </p>

      <GoldThread length="80px" className="my-2" />

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild size="lg">
          <Link href="/ecosystem">EXPLORE THE ECOSYSTEM</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/programs">DISCOVER THE PROGRAMS</Link>
        </Button>
      </div>
    </div>
  );
}
