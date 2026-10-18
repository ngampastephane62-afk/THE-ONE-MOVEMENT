import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createNavigationScroll } from '../src/lib/navigation-scroll.ts';

// No React app, server, credentials, network, or storage is used by this harness.
function fixture(start = '/web/news') {
  const events = new EventTarget();
  const calls = [];
  const targets = new Map();
  const named = new Map();
  const browser = {
    location: new URL(start, 'https://isolated.invalid'),
    history: { scrollRestoration: 'auto', state: { untouched: true } },
    document: {
      getElementById: (id) => targets.get(id) ?? null,
      getElementsByName: (id) => named.get(id) ?? [],
    },
    scrollTo: (options) => calls.push(['top', options]),
    addEventListener: (...args) => events.addEventListener(...args),
    removeEventListener: (...args) => events.removeEventListener(...args),
  };
  const scroll = createNavigationScroll(browser);
  let notifications = 0;
  const unsubscribe = scroll.subscribe(() => { notifications++; });
  const go = (url, kind = 'pushState') => {
    browser.location = new URL(url, browser.location);
    events.dispatchEvent(new Event(kind));
    scroll.afterCommit(scroll.getSnapshot());
  };
  const anchor = (id, byName = false) => {
    const element = { scrollIntoView: (options) => calls.push([id, options]) };
    if (byName) named.set(id, [element]);
    else targets.set(id, element);
  };
  return { browser, scroll, calls, go, anchor, unsubscribe, notifications: () => notifications };
}

test('new page push starts at top, including path-based artifact routing', () => {
  const f = fixture();
  f.go('/web/programs');
  assert.deepEqual(f.calls, [['top', { top: 0, left: 0, behavior: 'instant' }]]);
});

test('new page replacement also starts at top', () => {
  const f = fixture();
  f.go('/web/community', 'replaceState');
  assert.equal(f.calls[0][0], 'top');
});

test('initial load and reload are not repositioned', () => {
  for (const url of ['/web/news', '/web/news#section', '/web/media?video=film']) {
    const f = fixture(url);
    f.scroll.afterCommit(f.scroll.getSnapshot());
    assert.deepEqual(f.calls, []);
  }
});

test('Back and Forward preserve native restoration, including subsequent hashchange', () => {
  const f = fixture();
  f.anchor('story');
  f.go('/web/media#story', 'popstate');
  f.go('/web/media#story', 'hashchange');
  f.go('/web/news', 'popstate');
  assert.deepEqual(f.calls, []);
  assert.equal(f.browser.history.scrollRestoration, 'auto');
  assert.deepEqual(f.browser.history.state, { untouched: true });
});

test('an explicit new-page anchor takes precedence over top', () => {
  const f = fixture();
  f.anchor('story');
  f.go('/web/media#story');
  assert.deepEqual(f.calls, [['story', { block: 'start', behavior: 'instant' }]]);
});

test('same-page Wouter anchors scroll after commit', () => {
  const f = fixture();
  f.anchor('article');
  f.go('/web/news#article');
  assert.equal(f.calls[0][0], 'article');
});

test('native hash events and encoded or named anchors are supported', () => {
  const f = fixture();
  f.anchor('our mission');
  f.go('/web/news#our%20mission', 'hashchange');
  f.anchor('legacy-anchor', true);
  f.go('/web/news#legacy-anchor');
  assert.deepEqual(f.calls.map((call) => call[0]), ['our mission', 'legacy-anchor']);
});

test('missing and malformed anchors never force top or throw', () => {
  const f = fixture();
  f.go('/web/media#dynamic-video');
  f.go('/web/partners#%E0%A4%A');
  assert.deepEqual(f.calls, []);
});

test('query-only filters, reader state, and media selection keep local behavior', () => {
  const f = fixture('/web/tropik-magazine');
  f.go('?read=1');
  f.go('?read=1&page=5');
  f.go('?video=selected', 'replaceState');
  assert.deepEqual(f.calls, []);
});

test('new page with query resets before the existing local handler can select media', () => {
  const f = fixture();
  f.go('/web/media?video=chosen');
  f.calls.push(['existing-media-handler']);
  assert.deepEqual(f.calls.map((call) => call[0]), ['top', 'existing-media-handler']);
});

test('unchanged URLs and ordinary in-page interactions do not reposition', () => {
  const f = fixture();
  f.go('/web/news', 'replaceState');
  assert.deepEqual(f.calls, []);
  assert.equal(f.notifications(), 0);
});

test('outdated commits cannot reset a more recent navigation', () => {
  const f = fixture();
  const old = f.scroll.getSnapshot();
  f.go('/web/programs#later');
  f.scroll.afterCommit(old);
  assert.deepEqual(f.calls, []);
});

test('unmount removes listeners; remount does not duplicate notifications', () => {
  const f = fixture();
  f.unsubscribe();
  f.go('/web/media');
  assert.equal(f.notifications(), 0);
  const unsubscribe = f.scroll.subscribe(() => {});
  f.go('/web/programs');
  assert.equal(f.calls.length, 1);
  unsubscribe();
});

test('integration is layout-effect based with no rendered UI or menu changes', () => {
  const component = readFileSync(new URL('../src/components/NavigationScroll.tsx', import.meta.url), 'utf8');
  const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
  assert.match(component, /useLayoutEffect\(\(\) => \{\s*scroll\.afterCommit\(navigation\)/);
  assert.match(component, /return null;/);
  assert.match(app, /<WouterRouter base=\{basePath\}>\s*<NavigationScroll \/>/);
});
