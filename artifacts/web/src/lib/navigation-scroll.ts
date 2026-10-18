type NavigationKind = 'initial' | 'pushState' | 'replaceState' | 'popstate' | 'hashchange';
type Navigation = { url: string; previousPathname: string; kind: NavigationKind };
const events = ['pushState', 'replaceState', 'popstate', 'hashchange'] as const;

/**
 * Observe Wouter's existing history events; never patch history or change its
 * scrollRestoration setting. Apply only after React has committed the new page.
 */
export function createNavigationScroll(browser: Window) {
  let navigation: Navigation = {
    url: browser.location.href,
    previousPathname: browser.location.pathname,
    kind: 'initial',
  };
  const listeners = new Set<() => void>();
  const onNavigation = (event: Event) => {
    const url = browser.location.href;
    // A traversal can also emit hashchange. Do not override native restoration.
    if (url === navigation.url) return;
    navigation = {
      url,
      previousPathname: new URL(navigation.url).pathname,
      kind: event.type as NavigationKind,
    };
    listeners.forEach((listener) => listener());
  };

  return {
    getSnapshot: () => navigation,
    subscribe(listener: () => void) {
      if (!listeners.size) events.forEach((event) => browser.addEventListener(event, onNavigation));
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        if (!listeners.size) events.forEach((event) => browser.removeEventListener(event, onNavigation));
      };
    },
    afterCommit(current: Navigation) {
      if (current !== navigation || current.url !== browser.location.href) return;
      // Preserve initial loading/reloading and browser Back/Forward restoration.
      if (current.kind === 'initial' || current.kind === 'popstate') return;
      const url = new URL(current.url);
      if (url.hash) {
        let id: string;
        try {
          id = decodeURIComponent(url.hash.slice(1));
        } catch {
          return;
        }
        const target = browser.document.getElementById(id)
          ?? browser.document.getElementsByName(id)[0];
        // Missing/dynamic media targets remain the responsibility of their
        // existing page handlers. Never replace an explicit destination with top.
        target?.scrollIntoView({ block: 'start', behavior: 'instant' });
        return;
      }
      if (url.pathname !== current.previousPathname) {
        browser.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
      // Query-only updates and in-page interactions retain their own behavior.
    },
  };
}
