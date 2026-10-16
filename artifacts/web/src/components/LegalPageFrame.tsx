import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'wouter';
import HeroSurface from '@/components/HeroSurface';
import GoldThread from '@/components/GoldThread';

interface LegalPageFrameProps {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
}

/**
 * Shared frame for public legal pages.
 *
 * INTERNAL LAUNCH NOTE: The content in these pages is an operational baseline
 * and requires final UAE legal counsel review before public launch. This note
 * is intentionally kept in source and is not rendered to visitors.
 */
export default function LegalPageFrame({
  eyebrow,
  title,
  intro,
  children,
}: LegalPageFrameProps) {
  return (
    <div className="bg-ivory-100">
      <HeroSurface minHeight="44vh">
        <div className="mx-auto w-full max-w-5xl px-6 py-20 lg:py-28">
          <p className="text-eyebrow text-gold-400 mb-5">{eyebrow}</p>
          <h1
            className="max-w-4xl text-display-lg text-ivory-100 uppercase leading-tight"
            style={{ fontFamily: 'var(--font-display)', textWrap: 'balance' } as CSSProperties}
          >
            {title}
          </h1>
          <GoldThread className="mt-8" length="220px" node />
          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-ivory-200">
            {intro}
          </p>
          <p className="mt-5 text-xs uppercase tracking-[0.16em] text-ivory-400">
            Last updated 16 October 2026
          </p>
        </div>
      </HeroSurface>

      <div className="mx-auto max-w-4xl px-6 py-16 lg:py-24">
        <div className="space-y-0 text-ink-700">{children}</div>
        <div className="mt-14 border-t border-sand-200 pt-8">
          <Link
            href="/"
            className="text-sm font-semibold uppercase tracking-wide text-lagoon-700 underline decoration-gold-500 decoration-2 underline-offset-4 hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2"
          >
            Return to The One Movement
          </Link>
        </div>
      </div>
    </div>
  );
}

export function LegalSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="border-t border-sand-200 py-10 first:border-t-0 first:pt-0">
      <h2
        className="text-2xl font-semibold uppercase tracking-wide text-ink-900"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {title}
      </h2>
      <div className="mt-5 space-y-4 text-base leading-8">{children}</div>
    </section>
  );
}

export function LegalList({ children }: { children: ReactNode }) {
  return <ul className="list-disc space-y-2 ps-6">{children}</ul>;
}