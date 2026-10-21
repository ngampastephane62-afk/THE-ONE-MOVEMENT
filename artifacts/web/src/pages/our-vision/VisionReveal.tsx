import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

/** Page-local enhancement: content is never hidden while waiting for motion. */
export default function VisionReveal({ children, className = '', delay = 0 }: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    let bypass = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (!bypass) setEntered(true);
        observer.disconnect();
      }
    }, { threshold: 0, rootMargin: '0px 0px 30px 0px' });
    const onFocus = () => { bypass = true; observer.disconnect(); };
    element.addEventListener('focusin', onFocus);
    observer.observe(element);
    return () => {
      observer.disconnect();
      element.removeEventListener('focusin', onFocus);
    };
  }, []);
  return <div ref={ref} className={`tv-reveal ${className}`} data-entered={entered}
    style={{ '--tv-delay': `${delay}ms` } as CSSProperties}>{children}</div>;
}
