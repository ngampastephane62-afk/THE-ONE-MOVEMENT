import type { ReactNode } from 'react';

/** Presentation only: reusable world chapters do not infer participation or permissions. */
export default function SectorWorldChapter({ id, n, eyebrow, title, children, light }: {
  id: string;
  n: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
  light?: boolean;
}) {
  return (
    <section id={id} tabIndex={-1} className={`sw-chapter ${light ? 'sw-light' : ''}`} aria-labelledby={`${id}-t`}>
      <div className="sw-chapter-head">
        <span className="sw-chapter-num" aria-hidden="true">{n}</span>
        <div>
          <p className={`text-eyebrow ${light ? 'text-gold-700' : 'text-gold-400'}`}>{eyebrow}</p>
          <h4 id={`${id}-t`} className={`mt-2 text-display-md ${light ? 'text-ink-900' : 'text-ivory-100'}`}>{title}</h4>
        </div>
      </div>
      {children}
    </section>
  );
}
