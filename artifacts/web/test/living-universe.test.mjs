import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve, dirname } from 'node:path';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import ts from 'typescript';

// Real components, isolated React hooks and router: no API, auth, DB or browser.
const requireWeb = createRequire(new URL('../package.json', import.meta.url));
const React = requireWeb('react');
const runtime = requireWeb('react/jsx-runtime');
const { renderToStaticMarkup } = requireWeb('react-dom/server');
const root = resolve(import.meta.dirname, '../src');

function fixture({ directory = [] } = {}) {
  const cache = new Map(), events = new Map(), slots = [], effects = [], listeners = new Map(), dispatched = [];
  const scrolls = [], focus = [];
  let cursor = 0, active, props;
  const mocks = {
    react: {
      ...React,
      useState(initial) {
        const i = cursor++;
        if (!(i in slots)) slots[i] = typeof initial === 'function' ? initial() : initial;
        return [slots[i], next => { slots[i] = typeof next === 'function' ? next(slots[i]) : next; }];
      },
      useMemo: factory => factory(),
      useRef: initial => ({ current: initial }),
      useEffect: effect => { effects.push(effect); },
    },
    'react/jsx-runtime': Object.fromEntries(Object.entries(runtime).map(([key, value]) => [
      key, ['jsx', 'jsxs'].includes(key) ? (type, p, ...rest) => {
        if (p?.['data-testid']) events.set(p['data-testid'], p);
        return value(type, p, ...rest);
      } : value,
    ])),
    wouter: {
      Link: ({ children, ...p }) => React.createElement('a', p, children),
      useSearch: () => '',
    },
    '@clerk/react': { useAuth: () => ({ isSignedIn: false }) },
    '@workspace/api-client-react': {
      useGetEcosystemMembers: () => ({ data: { members: directory }, isLoading: false, isError: false }),
    },
    '@/lib/utils': { cn: (...xs) => xs.filter(Boolean).join(' ') },
  };
  function load(filename) {
    if (cache.has(filename)) return cache.get(filename);
    const source = readFileSync(filename, 'utf8').replaceAll('import.meta.env.BASE_URL', '"/"');
    const module = { exports: {} };
    runInNewContext(ts.transpileModule(source, {
      compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
      fileName: filename,
    }).outputText, {
      module, exports: module.exports, URL, URLSearchParams,
      CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } },
      window: {
        matchMedia: () => ({ matches: true }), setTimeout: fn => fn(),
        addEventListener: (name, fn) => listeners.set(name, fn),
        removeEventListener: name => listeners.delete(name),
        dispatchEvent: event => { dispatched.push(event); listeners.get(event.type)?.(event); },
      },
      document: {
        getElementById: () => ({
          scrollIntoView: opts => scrolls.push(opts),
          querySelector: () => ({ focus: opts => focus.push(opts) }),
        }),
        querySelector: () => null,
      },
      require(id) {
        if (id.endsWith('.css')) return {};
        if (id in mocks) return mocks[id];
        if (id === 'lucide-react') return requireWeb(id);
        if (id.startsWith('@/') || id.startsWith('.')) {
          const base = id.startsWith('@/') ? resolve(root, id.slice(2)) : resolve(dirname(filename), id);
          const found = ['', '.ts', '.tsx'].map(ext => base + ext).find(existsSync);
          assert.ok(found, `Local dependency exists: ${id}`);
          return load(found);
        }
        assert.fail(`Network/auth/other dependency forbidden: ${id}`);
      },
    }, { filename });
    cache.set(filename, module.exports);
    return module.exports;
  }
  function render(path = active, p = props) {
    active = path; props = p; cursor = 0; events.clear();
    return renderToStaticMarkup(React.createElement(load(resolve(root, path)).default, p));
  }
  return { render, events, effects, listeners, dispatched, scrolls, focus, load: path => load(resolve(root, path)) };
}

test('configuration covers exactly the seventeen existing sectors, with distinct illustrative motifs', () => {
  const f = fixture();
  const { SECTORS } = f.load('lib/sectors-data.ts');
  const { WORLD_CONFIG, getWorldConfig } = f.load('components/ecosystem/worlds/world-config.ts');
  assert.deepEqual(Object.keys(WORLD_CONFIG).sort(), Array.from(SECTORS, s => s.slug).sort());
  assert.equal(new Set(Object.values(WORLD_CONFIG).map(c => c.motif)).size, 17);
  for (const s of SECTORS) {
    const config = getWorldConfig(s.slug);
    assert.equal(config.slug, s.slug);
    assert.ok(config.intro && config.headline.length === 3);
    // Real Estate keeps its richer existing authored chapters, not config copy.
    if (s.slug !== 'real-estate') {
      assert.ok(config.discover.length >= 3);
      assert.ok(config.learn.length >= 3);
    }
  }
  assert.equal(getWorldConfig('private-unknown'), undefined);
});

test('all sixteen new worlds render every chapter and only real programme/resource destinations', () => {
  const f = fixture();
  const { SECTORS } = f.load('lib/sectors-data.ts');
  const { PROGRAMS } = f.load('lib/programs-data.ts');
  const { ECOSYSTEM_RESOURCES } = f.load('lib/ecosystem-resources.ts');
  const { WORLD_CHAPTERS } = f.load('components/ecosystem/worlds/world-config.ts');
  for (const sector of SECTORS.filter(s => s.slug !== 'real-estate')) {
    const html = f.render('components/ecosystem/worlds/SectorWorld.tsx', { slug: sector.slug });
    assert.ok(f.events.has(`world-hero-${sector.slug}`));
    for (const chapter of WORLD_CHAPTERS) {
      assert.ok(f.events.has(`chapter-${chapter.id}-${sector.slug}`), `${sector.slug}: ${chapter.id}`);
      assert.ok(html.includes(`id="w-${sector.slug}-${chapter.id}"`));
      assert.ok(f.events.has(`button-world-chapter-${sector.slug}-${chapter.id}`));
    }
    for (const [id, p] of f.events) {
      if (id.startsWith(`link-world-programme-${sector.slug}-`)) {
        assert.ok(PROGRAMS.some(program => p.href === `/programs/${program.slug}`));
      }
      if (id.startsWith(`link-world-resource-${sector.slug}-`)) {
        assert.ok(ECOSYSTEM_RESOURCES.some(r => r.url === p.href && r.sectors.includes(sector.slug)));
        assert.match(p.rel, /noopener/);
      }
    }
    assert.equal(f.events.get(`link-world-join-${sector.slug}`).href, '/join');
    assert.match(html, /Editorial orientation topics, not courses or certifications/);
    assert.match(html, /Roles in this world, not member profiles/);
    assert.match(html, /Illustrative motif/);
    assert.match(html, /Ordinary membership is free/);
  }
  assert.equal(f.render('components/ecosystem/worlds/SectorWorld.tsx', { slug: 'unknown' }), '');
});

test('discovery entries have unique identities and allowlisted existing destinations', () => {
  const f = fixture();
  const { DISCOVERY_ENTRIES, GUIDE_STEPS } = f.load('components/discovery/discovery-index.ts');
  const { SECTORS } = f.load('lib/sectors-data.ts');
  const { PROGRAMS } = f.load('lib/programs-data.ts');
  const pages = new Set(['/community', '/opportunities', '/thanks-world', '/thanks-emirates', '/the-one-documentary', '/news', '/media', '/tropik-magazine', '/partners', '/impact', '/join']);
  assert.equal(new Set(DISCOVERY_ENTRIES.map(e => e.id)).size, DISCOVERY_ENTRIES.length);
  for (const entry of [...DISCOVERY_ENTRIES, ...GUIDE_STEPS]) {
    const url = new URL(entry.href, 'https://isolated.invalid');
    if (url.pathname === '/ecosystem') {
      assert.ok(SECTORS.some(s => s.slug === url.searchParams.get('sector')));
      assert.equal(url.hash, '#explore');
    } else if (url.pathname.startsWith('/programs/')) {
      assert.ok(PROGRAMS.some(p => url.pathname === `/programs/${p.slug}`));
    } else assert.ok(pages.has(url.pathname), url.pathname);
    assert.equal(url.origin, 'https://isolated.invalid');
    assert.equal(url.searchParams.has('invite'), false);
  }
});

test('all Founder example searches find appropriate existing content without inventing results', () => {
  const f = fixture();
  const { DISCOVERY_EXAMPLES, matchDiscovery } = f.load('components/discovery/discovery-index.ts');
  const expected = ['world-technology', 'world-fashion', 'page-thanks-world', 'world-real-estate', 'world-humanitarian-action'];
  DISCOVERY_EXAMPLES.forEach((query, i) => {
    const results = matchDiscovery(query);
    assert.ok(results.some(r => r.id === expected[i]), query);
    assert.ok(results.length <= 6);
  });
  for (const q of ['', '  ', 'I want to', 'zzzxnonexistent', '<script>alert(9)</script>']) {
    assert.equal(matchDiscovery(q).length, 0, q);
  }
  assert.equal(matchDiscovery('fashion', 1).length, 1);
  assert.equal(matchDiscovery('fashion', 1)[0].id, 'world-fashion');
});

test('discovery input, empty recovery, examples and TOMI AI guided answer are functional in isolation', () => {
  const f = fixture(), path = 'components/discovery/GlobalDiscovery.tsx';
  let html = f.render(path);
  assert.match(html, /This is not an AI assistant yet/);
  assert.equal(f.events.has('link-guide-go'), false);
  f.events.get('input-global-discovery').onChange({ target: { value: 'zzzxnonexistent' } });
  f.render();
  assert.ok(f.events.has('text-discovery-empty'));
  f.events.get('button-discovery-clear').onClick();
  f.render();
  assert.equal(f.events.get('input-global-discovery').value, '');
  assert.equal(f.events.has('text-discovery-empty'), false);
  f.events.get('button-discovery-example-1').onClick();
  f.render();
  assert.equal(f.events.get('link-discovery-result-world-fashion').href, '/ecosystem?sector=fashion#explore');
  f.events.get('button-guide-learn').onClick();
  html = f.render();
  assert.ok(f.events.has('text-guide-answer'));
  assert.equal(f.events.get('button-guide-learn')['aria-pressed'], true);
  assert.equal(f.events.get('link-guide-go').href, '/ecosystem?sector=education#explore');
  assert.match(html, /fixed answers that link to real pages/);
});

test('new motion styles support pause and reduced motion without new heavy dependencies', () => {
  const css = readFileSync(resolve(root, 'styles/worlds.css'), 'utf8');
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /eco-paused/);
  const sources = ['components/discovery/discovery-index.ts', 'components/discovery/GlobalDiscovery.tsx', 'components/ecosystem/worlds/SectorWorld.tsx', 'components/ecosystem/worlds/world-config.ts']
    .map(path => readFileSync(resolve(root, path), 'utf8')).join('\n');
  assert.doesNotMatch(sources, /fetch\(|localStorage|@clerk|@workspace\/api|WebGL|three\/|openai|anthropic/);
});

test('world directory navigation filters only existing public results, focuses the filter and cleans up', () => {
  const f = fixture({ directory: [
    { id: 1, fullName: 'Isolated Architect', sectors: ['real-estate'], website: '', avatarUrl: null },
    { id: 2, fullName: 'Isolated Musician', sectors: ['music'], website: '', avatarUrl: null },
  ] });
  const path = 'components/ecosystem/MemberDirectory.tsx';
  let html = f.render(path);
  assert.match(html, /Isolated Architect/);
  assert.match(html, /Isolated Musician/);
  const cleanup = f.effects[0]();
  const nav = f.load('components/ecosystem/directory-navigation.ts');
  nav.showListedMembers('real-estate');
  html = f.render();
  assert.equal(f.events.get('select-member-sector').value, 'real-estate');
  assert.match(html, /Isolated Architect/);
  assert.doesNotMatch(html, /Isolated Musician/);
  assert.equal(f.scrolls[0].behavior, 'auto');
  assert.equal(f.focus[0].preventScroll, true);
  nav.showListedMembers('unknown-private');
  assert.equal(f.dispatched.length, 1);
  cleanup();
  assert.equal(f.listeners.size, 0);
});

test('future concepts have no activation, upload or checkout and brands link only real pages', () => {
  const f = fixture();
  const html = f.render('components/ecosystem/EcosystemConcepts.tsx');
  assert.match(html, /THE ONE KEY/);
  assert.match(html, /not available today/);
  assert.match(html, /exploring the seventeen worlds never require it/);
  assert.match(html, /THE ONE CREATIVE SPACE/);
  assert.match(html, /editorial approval before publication/);
  assert.match(html, /No shared legal ownership is asserted/);
  assert.ok(f.events.has('text-brand-oye'));
  assert.equal(f.events.has('link-brand-oye'), false);
  assert.equal(f.events.get('link-creative-space-enquiry').href, '/join#institutional-inquiry');
  assert.doesNotMatch(html, /type="file"|checkout|subscribe now|buy now/i);
});

test('cultural presets preserve DRC origins, UAE themes and verified dates without duplicating the timeline', () => {
  const f = fixture();
  for (const preset of ['world', 'emirates', 'documentary']) {
    const html = f.render('components/editorial/CulturalStory.tsx', { preset });
    assert.ok(f.events.has(`section-cultural-story-${preset}`));
    if (preset === 'documentary') {
      assert.match(html, /10 YEARS ONE RECORD/);
      for (const place of ['Bukavu', 'Goma', 'Kinshasa', 'Dubai']) assert.ok(html.includes(place));
      assert.match(html, /not film release dates/);
      assert.match(html, /in development, subject to final confirmation/);
    } else {
      assert.doesNotMatch(html, /aria-label="Movement journey"/);
      if (preset === 'world') assert.match(html, /Democratic Republic of Congo/);
      else for (const theme of ['Architecture', 'Arabic design', 'Hospitality', 'Innovation']) assert.ok(html.includes(theme));
    }
  }
});

test('placement labels distinguish coverage, partners and sponsorship without unsupported payment claims', () => {
  const f = fixture();
  for (const kind of ['editorial', 'partner', 'sponsored']) {
    const html = f.render('components/editorial/PlacementLabel.tsx', { kind, showNote: true });
    assert.ok(f.events.has(`label-placement-${kind}`));
    if (kind === 'editorial') assert.doesNotMatch(html, /No payment involved/);
    if (kind === 'sponsored') assert.match(html, /Sponsorship is not verification or endorsement/);
  }
});
