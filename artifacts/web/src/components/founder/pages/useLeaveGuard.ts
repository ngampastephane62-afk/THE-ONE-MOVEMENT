import { useEffect, useRef, type MutableRefObject } from 'react';

/**
 * Guards leaving the editor while `activeRef.current` is true:
 * - tab close / reload (beforeunload),
 * - same-origin in-app anchor clicks (wouter Links included), captured before React handles them,
 * - browser back/forward via a sentinel history entry.
 * Modified clicks (new tab/window), downloads, target=_blank, external links and same-page hash links are never blocked.
 */
export function useLeaveGuard(activeRef: MutableRefObject<boolean>, message: string) {
  const msgRef = useRef(message); msgRef.current = message;

  useEffect(() => {
    const before = (e: BeforeUnloadEvent) => { if (activeRef.current) { e.preventDefault(); e.returnValue = ''; } };

    const click = (e: MouseEvent) => {
      if (!activeRef.current || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!a || a.hasAttribute('download')) return;
      const target = a.getAttribute('target');
      if (target && target !== '_self') return;
      let url: URL;
      try { url = new URL(a.href, window.location.href); } catch { return; }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return; // hash or same page
      if (!window.confirm(msgRef.current)) { e.preventDefault(); e.stopPropagation(); }
      else activeRef.current = false;
    };

    // Sentinel entry: Back first lands on a duplicate of this URL (no route change), where we can ask.
    let sentinel = false;
    const arm = () => {
      if (activeRef.current && !sentinel) { window.history.pushState({ ...(window.history.state ?? {}), homeEditorGuard: true }, '', window.location.href); sentinel = true; }
    };
    const pop = () => {
      if (!sentinel) return;
      sentinel = false;
      if (!activeRef.current) return;
      if (window.confirm(msgRef.current)) { activeRef.current = false; window.history.back(); }
      else arm();
    };
    const tick = window.setInterval(arm, 500);

    window.addEventListener('beforeunload', before);
    document.addEventListener('click', click, true);
    window.addEventListener('popstate', pop);
    return () => {
      window.clearInterval(tick);
      window.removeEventListener('beforeunload', before);
      document.removeEventListener('click', click, true);
      window.removeEventListener('popstate', pop);
    };
  }, [activeRef]);
}
