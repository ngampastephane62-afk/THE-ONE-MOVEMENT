/**
 * StatusNotice — shared institutional notice component.
 *
 * Two visual variants, both pixel-identical to their origin inline patterns:
 *
 *  • "institutional" (default) — light sand surface, gold dot, inline-flex.
 *    Origin: programs/detail.tsx participation section.
 *    Use on light backgrounds (ivory, white).
 *
 *  • "editorial" — dark lagoon-900 surface, block, role="status".
 *    Origin: news/index.tsx zero-articles state.
 *    Use on dark lagoon-900 band backgrounds.
 *
 * Props:
 *  message   — the notice text (required)
 *  variant   — "institutional" | "editorial", default "institutional"
 */

import React from 'react';

export interface StatusNoticeProps {
  message: string;
  variant?: 'institutional' | 'editorial';
}

export default function StatusNotice({
  message,
  variant = 'institutional',
}: StatusNoticeProps) {
  if (variant === 'editorial') {
    return (
      <div
        className="rounded-sm border border-gold-500/20 px-6 py-5 text-sm text-ivory-300 leading-relaxed"
        style={{ backgroundColor: 'hsl(187 67% 10%)' }}
        role="status"
      >
        {message}
      </div>
    );
  }

  // default: institutional (light sand surface with gold dot)
  return (
    <div
      className="inline-flex items-center gap-3 px-5 py-3 rounded-sharp mx-auto"
      style={{
        border: '1px solid hsl(36 26% 80%)',
        backgroundColor: 'hsl(40 71% 98%)',
      }}
    >
      {/* Subtle gold dot */}
      <span
        aria-hidden="true"
        style={{
          display: 'inline-block',
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          backgroundColor: 'hsl(39 52% 54%)',
          flexShrink: 0,
        }}
      />
      <p
        className="text-xs leading-relaxed"
        style={{ color: 'hsl(189 30% 45%)', letterSpacing: '0.03em' }}
      >
        {message}
      </p>
    </div>
  );
}
