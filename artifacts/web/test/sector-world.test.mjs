import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import ts from 'typescript';

// Isolated rendering and event tests only. No Clerk, database, network or app server.
const requireWeb = createRequire(new URL('../package.json', import.meta.url));
const React = requireWeb('react');
const runtime = requireWeb('react/jsx-runtime');
const { renderToStaticMarkup } = requireWeb('react-dom/server');
const root = resolve(import.meta.dirname, '../src');

function fixture({ base = '/', native, clipboard, reduced = false } = {}) {
  const slots = [], refs = [], events = new Map(), cache = new Map();
  const calls = { selects: 0, focus: [], scroll: [], queries: [] };
  let cursor = 0, refCursor = 0, active, props;
  const target = {
    scrollIntoView: x => calls.scroll.push(x),
    focus: x => calls.focus.push(x),
  };
  const mocks = {
    react: {
      ...React,
      useState(init) {
        const i = cursor++;
        if (!(i in slots)) slots[i] = typeof init === 'function' ? init() : init;
        return [slots[i], next => { slots[i] = typeof next === 'function' ? next(slots[i]) : next; }];
      },
      useRef() {
        const i = refCursor++;
        return refs[i] ??= { current: {
          select: () => calls.selects++,
          querySelector: x => { calls.queries.push(x); return target; },
        } };
      },
    },
    'react/jsx-runtime': Object.fromEntries(Object.entries(runtime).map(([key, value]) => [
      key, ['jsx', 'jsxs'].includes(key) ? (type, p, ...rest) => {
        if (p?.['data-testid']) events.set(p['data-testid'], p);
        return value(type, p, ...rest);
      } : value,
    ])),
    wouter: { Link: ({ children, ...p }) => React.createElement('a', p, children) },
  };
  function load(filename) {
    if (cache.has(filename)) return cache.get(filename);
    const source = ts.transpileModule(
      readFileSync(filename, 'utf8').replaceAll('import.meta.env.BASE_URL', JSON.stringify(base)),
      { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } },
    ).outputText;
    const module = { exports: {} };
    runInNewContext(source, {
      module, exports: module.exports, URL, URLSearchParams, DOMException,
      navigator: { share: native, clipboard },
      window: {
        location: { origin: 'https://fixture.invalid', search: '?invite=PRIVATE&sector=music', hash: '#private' },
        matchMedia: () => ({ matches: reduced }),
      },
      requestAnimationFrame: f => f(),
      require(id) {
        if (id.endsWith('.css')) return {};
        if (id in mocks) return mocks[id];
        if (id === 'lucide-react') return requireWeb(id);
        if (id.startsWith('@/') || id.startsWith('.')) {
          const path = id.startsWith('@/') ? resolve(root, id.slice(2)) : resolve(dirname(filename), id);
          const found = ['', '.ts', '.tsx'].map(ext => path + ext).find(existsSync);
          assert.ok(found, `Local dependency exists: ${id}`);
          return load(found);
        }
        assert.fail(`Forbidden runtime dependency: ${id}`);
      },
    }, { filename });
    cache.set(filename, module.exports);
    return module.exports;
  }
  function render(path = active, p = props) {
    active = path; props = p; cursor = 0; refCursor = 0; events.clear();
    return renderToStaticMarkup(load(resolve(root, path)).default(p));
  }
  return { render, events, calls, load: path => load(resolve(root, path)) };
}

const sharePath = 'components/ecosystem/SectorShare.tsx';
const worldPath = 'components/ecosystem/RealEstateWorld.tsx';
const sector = { slug: 'real-estate', name: 'Real Estate', descriptor: 'Places for people' };

test('all seventeen share URLs round-trip the existing route without private query state', () => {
  for (const base of ['/', '/nested/', '/nested']) {
    const f = fixture({ base });
    const { sectorShareUrl } = f.load(sharePath);
    const { sectorFromSearch } = f.load('components/ecosystem/sector-location.ts');
    for (const { slug } of f.load('lib/sectors-data.ts').SECTORS) {
      const url = new URL(sectorShareUrl(slug));
      assert.equal(url.origin, 'https://fixture.invalid');
      assert.equal(url.pathname, `${base.replace(/\/$/, '')}/ecosystem`);
      assert.equal(url.hash, '#explore');
      assert.equal(sectorFromSearch(url.search), slug);
      assert.deepEqual([...url.searchParams.keys()], ['sector']);
      assert.doesNotMatch(url.href, /PRIVATE|invite|#private/);
    }
    assert.equal(new URL(sectorShareUrl('javascript:bad')).search, '');
  }
});

test('clipboard success is only announced after the write succeeds', async () => {
  let copied;
  const f = fixture({ clipboard: { writeText: async x => { copied = x; } } });
  f.render(sharePath, { sector });
  assert.equal(f.events.has('button-share-sector'), false);
  await f.events.get('button-copy-sector-link').onClick();
  const html = f.render();
  assert.equal(copied, 'https://fixture.invalid/ecosystem?sector=real-estate#explore');
  assert.match(html, /Link copied to your clipboard/);
  assert.equal(f.events.has('input-sector-share-url'), false);
});

test('unavailable and rejected clipboard expose a labelled, selectable manual fallback', async () => {
  for (const clipboard of [undefined, { writeText: async () => { throw new Error('denied'); } }]) {
    const f = fixture({ clipboard });
    f.render(sharePath, { sector });
    await f.events.get('button-copy-sector-link').onClick();
    assert.match(f.render(), /copy it manually/);
    const field = f.events.get('input-sector-share-url');
    assert.equal(field.readOnly, true);
    assert.match(field['aria-label'], /Real Estate/);
    let selected = false;
    field.onFocus({ currentTarget: { select: () => { selected = true; } } });
    assert.equal(selected, true);
    assert.equal(f.events.get('status-share-sector').role, 'status');
  }
});

test('native sharing receives only the public sector URL and honest success feedback', async () => {
  let payload;
  const f = fixture({ native: async x => { payload = x; } });
  f.render(sharePath, { sector });
  await f.events.get('button-share-sector').onClick();
  assert.match(f.render(), /Shared/);
  assert.equal(payload.title, 'Real Estate · TOMI');
  assert.equal(payload.url, 'https://fixture.invalid/ecosystem?sector=real-estate#explore');
  assert.doesNotMatch(JSON.stringify(payload), /invite|PRIVATE/);
});

test('native cancellation is distinct from failure and never claims success', async () => {
  const f = fixture({ native: async () => { throw new DOMException('cancel', 'AbortError'); } });
  f.render(sharePath, { sector });
  await f.events.get('button-share-sector').onClick();
  const html = f.render();
  assert.match(html, /Sharing cancelled/);
  assert.doesNotMatch(html, /Shared\. Thank|Link copied/);
  assert.equal(f.events.has('input-sector-share-url'), false);
});

test('native share failure preserves a copy path and manual URL', async () => {
  const f = fixture({ native: async () => { throw new Error('unsupported'); } });
  f.render(sharePath, { sector });
  await f.events.get('button-share-sector').onClick();
  assert.match(f.render(), /Sharing failed/);
  assert.equal(f.events.has('input-sector-share-url'), true);
  assert.equal(f.events.has('button-copy-sector-link'), true);
});

test('pilot renders all five editorial chapters and six real participation routes', () => {
  const f = fixture(), html = f.render(worldPath);
  for (const chapter of ['discover', 'professions', 'learn', 'showcase', 'join']) {
    assert.ok(html.includes(`id="re-${chapter}"`));
    assert.ok(f.events.has(`button-chapter-re-${chapter}`));
  }
  for (const audience of ['professionals', 'creators', 'students', 'entrepreneurs', 'investors', 'organizations']) {
    const link = f.events.get(`link-join-${audience}`);
    assert.ok(['/sign-up', '/join', '/community'].includes(link.href));
  }
  assert.equal(f.events.get('link-showcase-member').href, '/member');
  assert.match(html, /Ordinary membership is free/);
  assert.match(html, /not courses or certifications/);
  assert.match(html, /not member profiles/);
  assert.match(html, /never grants professional, verified or ambassador status automatically/);
  assert.match(html, /Illustrative artwork\. Not a real building or project/);
  assert.doesNotMatch(html, /buy now|guaranteed return|certified partners|\/sectors\//i);
});

test('chapter navigation moves focus and consults current reduced-motion preference without changing hash', () => {
  for (const reduced of [false, true]) {
    const f = fixture({ reduced });
    f.render(worldPath);
    f.events.get('button-chapter-re-learn').onClick();
    assert.deepEqual(f.calls.queries, ['#re-learn']);
    assert.equal(f.calls.scroll[0].behavior, reduced ? 'auto' : 'smooth');
    assert.equal(f.calls.focus[0].preventScroll, true);
  }
  assert.doesNotMatch(readFileSync(resolve(root, worldPath), 'utf8'), /location\.hash\s*=/);
});

test('reusable chapter has a semantic heading and focus destination; art is not documentary', () => {
  const f = fixture();
  const html = f.render('components/ecosystem/SectorWorldChapter.tsx', {
    id: 'other-world', n: '01', eyebrow: 'Discover', title: 'A reusable chapter', children: 'Editorial content',
  });
  assert.match(html, /aria-labelledby="other-world-t"/);
  assert.match(html, /tabindex="-1"/);
  assert.match(html, /<h4 id="other-world-t"/);
  assert.match(f.render('components/ecosystem/ArchitectureSkyline.tsx'), /imagined city/);
});

test('styles preserve static reduced-motion content, responsive grids and touch-size controls', () => {
  const css = readFileSync(resolve(root, 'styles/sector-world.css'), 'utf8');
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /\.sw-tower, \.sw-discover-card \{ animation: none/);
  assert.match(css, /\.eco-paused \.sw-tower/);
  assert.match(css, /min-height: 44px/);
  assert.match(css, /focus-visible/);
  assert.match(css, /@media \(min-width: 640px\)/);
  assert.doesNotMatch(css, /\binfinite\b/);
});

test('existing explorer and official detail content retain their integration boundaries', () => {
  const explorer = readFileSync(resolve(root, 'components/ecosystem/SectorExplorer.tsx'), 'utf8');
  const detail = readFileSync(resolve(root, 'components/ecosystem/SectorDetail.tsx'), 'utf8');
  assert.match(explorer, /active\.slug === 'real-estate' \? <RealEstateWorld \/> : <SectorWorld/);
  for (const part of ['PersonaPicker', 'SectorDetail', 'SectorEmblem', 'input-sector-search']) assert.ok(explorer.includes(part));
  for (const part of ['ProgrammeLink', 'ResourceCard', 'programsForSector', 'resourcesForSector', 'SectorShare']) assert.ok(detail.includes(part));
  for (const file of ['SectorShare.tsx', 'RealEstateWorld.tsx', 'SectorWorldChapter.tsx']) {
    const source = readFileSync(resolve(root, `components/ecosystem/${file}`), 'utf8');
    assert.doesNotMatch(source, /fetch\(|useAct|mutate\(|localStorage|@workspace\/api-client|@clerk/);
  }
});
