import type { ReactNode } from 'react';
import { Link } from 'wouter';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { STATUS_LABEL, type FeatureStatus } from './summit-data';

export function StatusPill({ status, dark = false }: { status: FeatureStatus; dark?: boolean }) {
  const tone =
    status === 'live'
      ? dark ? 'border-emerald-300/50 text-emerald-200' : 'border-lagoon-600/40 text-lagoon-700'
      : dark ? 'border-gold-400/60 text-gold-300' : 'border-gold-600/60 text-gold-700';
  return (
    <span className={`inline-flex items-center gap-1.5 border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${tone}`} data-testid={`status-${status}`}>
      <span aria-hidden="true" className={`h-1.5 w-1.5 rotate-45 ${status === 'live' ? 'bg-current' : 'border border-current'}`} />
      {STATUS_LABEL[status]}
    </span>
  );
}

const focus = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2';

/** Smart link: hash anchors stay plain <a>, in-app routes use wouter Link. */
export function ActionLink({ href, children, variant = 'solid', testId, className = '' }: { href: string; children: ReactNode; variant?: 'solid' | 'outline' | 'text' | 'ghost-dark'; testId?: string; className?: string }) {
  const styles = {
    solid: 'bg-gold-500 text-ink-900 hover:bg-gold-400 px-6 py-3.5',
    outline: 'border border-lagoon-900/30 text-lagoon-900 hover:border-lagoon-900 hover:bg-lagoon-900 hover:text-ivory-100 px-6 py-3.5',
    'ghost-dark': 'border border-ivory-100/30 text-ivory-100 hover:border-gold-400 hover:text-gold-300 px-6 py-3.5',
    text: 'text-lagoon-700 hover:text-gold-700 underline-offset-4 hover:underline',
  }[variant];
  const cls = `group inline-flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] transition-colors duration-200 ${styles} ${focus} ${className}`;
  const Icon = href.startsWith('#') ? ArrowRight : ArrowUpRight;
  const inner = (<>{children}<Icon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" /></>);
  if (href.startsWith('#')) return <a href={href} className={cls} data-testid={testId}>{inner}</a>;
  return <Link href={href} className={cls} data-testid={testId}>{inner}</Link>;
}

export function Eyebrow({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return <p className={`text-eyebrow ${dark ? 'text-gold-400' : 'text-gold-700'}`}>{children}</p>;
}

export function SectionTitle({ id, children, dark = false, className = '' }: { id: string; children: ReactNode; dark?: boolean; className?: string }) {
  return (
    <h2 id={id} className={`mt-3 text-[clamp(1.9rem,4.6vw,3.4rem)] leading-[1] tracking-[-0.01em] ${dark ? 'text-ivory-100' : 'text-ink-900'} ${className}`} style={{ fontFamily: 'var(--font-display)' }}>
      {children}
    </h2>
  );
}
