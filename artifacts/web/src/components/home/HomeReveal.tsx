import { type CSSProperties, type ElementType, type ReactNode, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Home-only progressive reveal. Always visible by default (no hidden pre-state).
 * Below-the-fold elements get a one-shot entrance animation just before they
 * enter the viewport. Focus arriving first, reduced motion, or no
 * IntersectionObserver keeps the element static.
 */
export default function HomeReveal({ children, className, variant = 'rise', delay = 0, as: Tag = 'div' }: {
  children: ReactNode; className?: string; variant?: 'rise' | 'curtain' | 'sweep' | 'editorial' | 'mask'; delay?: number; as?: ElementType;
}) {
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState<'static' | 'in'>('static');
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return; // above/at fold: static
    let done = false;
    const io = new IntersectionObserver(([en]) => {
      if (en.isIntersecting && !done) { done = true; setState('in'); io.disconnect(); }
    }, { rootMargin: '0px 0px 40px 0px', threshold: 0 });
    io.observe(el);
    const onFocus = () => { done = true; io.disconnect(); };
    el.addEventListener('focusin', onFocus);
    return () => { io.disconnect(); el.removeEventListener('focusin', onFocus); };
  }, []);
  return (
    <Tag ref={ref} className={cn('hx', `hx--${variant}`, className)} data-hx={state} style={{ '--hx-delay': `${delay}ms` } as CSSProperties}>
      {children}
    </Tag>
  );
}
