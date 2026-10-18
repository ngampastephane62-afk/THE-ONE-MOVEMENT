import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import '@/styles/universe.css';

interface ChapterProps {
  eyebrow?: string;
  index?: string;
  title: ReactNode;
  lede?: ReactNode;
  aside?: ReactNode;
  tone?: 'light' | 'dark';
  as?: 'h1' | 'h2';
  id?: string;
  className?: string;
}

/** Shared editorial heading for member and public surfaces: index, eyebrow, Cinzel title, lede and optional aside. */
export default function Chapter({ eyebrow, index, title, lede, aside, tone = 'light', as: H = 'h1', id, className }: ChapterProps) {
  const dark = tone === 'dark';
  return (
    <header className={cn('tomi-chapter tomi-chapter-anim flex flex-wrap items-end justify-between gap-4', className)} data-tone={tone}>
      <div className="min-w-0 max-w-2xl">
        {(index || eyebrow) && (
          <p className="flex items-center gap-3">
            {index && <span className="tomi-chapter-index">{index}</span>}
            {index && eyebrow && <span className="h-px w-6 bg-gold-500/60" aria-hidden="true" />}
            {eyebrow && <span className={cn('text-eyebrow', dark ? 'text-gold-400' : 'text-gold-700')}>{eyebrow}</span>}
          </p>
        )}
        <H id={id} className={cn('tomi-chapter-title mt-2', dark ? 'text-ivory-100' : 'text-ink-900')}>{title}</H>
        {lede && <div className={cn('mt-2 text-sm leading-relaxed', dark ? 'text-ivory-200' : 'text-ink-700')}>{lede}</div>}
      </div>
      {aside && <div className="shrink-0">{aside}</div>}
    </header>
  );
}
