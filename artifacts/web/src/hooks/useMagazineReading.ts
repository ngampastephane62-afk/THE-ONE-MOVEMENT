import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getGetMagazineStatisticsQueryKey, recordMagazineReadingEvent, type MagazineReadingInput } from '@workspace/api-client-react';

const EDITION = 'tropik-editorial-2026' as const;
const SESSION_KEY = 'tropik-reading-session';
let temporarySession: string | undefined;

function readingSession() {
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing && uuid.test(existing)) return existing;
    const id = crypto.randomUUID();
    window.sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    // Storage can be unavailable in private browsing. Never block reading.
    return temporarySession ??= crypto.randomUUID();
  }
}

/** Measures only an open, visible book. Reloads and revisited pages deduplicate on the server. */
export function useMagazineReading(active: boolean, pages: number[]) {
  const ref = useRef<HTMLDivElement>(null);
  const client = useQueryClient();
  const sent = useRef(new Set<string>());
  const seen = useRef(new Set<number>());
  const exposures = useRef(new Map<number, number>());
  const elapsed = useRef(0);
  const openedAt = useRef<number | null>(null);
  const visiblePages = useRef(pages);
  visiblePages.current = pages;
  const queue = useRef(Promise.resolve());

  useEffect(() => {
    const node = ref.current;
    if (!active || !node || navigator.webdriver || navigator.doNotTrack === '1' ||
      ('globalPrivacyControl' in navigator && navigator.globalPrivacyControl === true) ||
      /bot\b|spider|crawler/i.test(navigator.userAgent)) return;
    let inView = false;
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting && entry.intersectionRatio >= 0.25; }, { threshold: 0.25 });
    observer.observe(node);
    const id = readingSession();
    const send = (event: MagazineReadingInput['event'], page?: number) => {
      const key = event === 'page' ? `page:${page}` : event;
      if (sent.current.has(key)) return;
      sent.current.add(key);
      queue.current = queue.current.then(async () => {
        try {
          const result = await recordMagazineReadingEvent({ editionId: EDITION, sessionId: id, event, ...(page === undefined ? {} : { page }) });
          if (!result.recorded) { sent.current.delete(key); return; }
          if (event === 'open') openedAt.current = Date.now();
          void client.invalidateQueries({ queryKey: getGetMagazineStatisticsQueryKey() });
        } catch {
          // Retry on the next visible tick; a statistics outage must not interrupt the book.
          sent.current.delete(key);
        }
      });
    };
    let previousTick = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      const delta = Math.min((now - previousTick) / 1000, 1.5);
      previousTick = now;
      if (!inView || document.visibilityState !== 'visible') return;
      elapsed.current += delta;
      if (elapsed.current >= 2) send('open');
      for (const page of visiblePages.current) {
        if (!Number.isInteger(page) || page < 0 || page > 12) continue;
        const duration = (exposures.current.get(page) ?? 0) + delta;
        exposures.current.set(page, duration);
        if (duration >= 2) { seen.current.add(page); send('page', page); }
      }
      if (elapsed.current >= 32 && seen.current.size >= 2 && openedAt.current !== null && Date.now() - openedAt.current >= 30_000) send('engaged');
    }, 1000);
    return () => { observer.disconnect(); window.clearInterval(timer); };
  }, [active, client]);
  return ref;
}
