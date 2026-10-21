import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve, dirname } from 'node:path';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import ts from 'typescript';

// Isolated source/component checks only. No Clerk, application servers, HTTP or DB.
const root = resolve(import.meta.dirname, '../src');
const requireWeb = createRequire(new URL('../package.json', import.meta.url));
const React = requireWeb('react');
const runtime = requireWeb('react/jsx-runtime');
const { renderToStaticMarkup } = requireWeb('react-dom/server');

function fixture({ founder = true, search = '', loading = false, error = false } = {}) {
  const state = [], cache = new Map(), events = new Map(), focus = [], navigation = [];
  let cursor = 0, query = search;
  const me = { founder, fullName: '<Founder & TOMI>', email: 'DO_NOT_DISPLAY_PRIVATE_EMAIL' };
  const mocks = {
    react: {
      ...React,
      useState(initial) {
        const i = cursor++;
        if (!(i in state)) state[i] = typeof initial === 'function' ? initial() : initial;
        return [state[i], next => { state[i] = typeof next === 'function' ? next(state[i]) : next; }];
      },
      useRef(initial) {
        const i = cursor++;
        return state[i] ?? (state[i] = { current: initial });
      },
    },
    'react/jsx-runtime': Object.fromEntries(Object.entries(runtime).map(([name, fn]) => [
      name, ['jsx', 'jsxs'].includes(name) ? (type, props, ...rest) => {
        if (props?.['data-testid']) {
          events.set(props['data-testid'], props);
          if (typeof props.ref === 'function') props.ref({ focus: () => focus.push(props['data-testid']) });
        }
        return fn(type, props, ...rest);
      } : fn,
    ])),
    'react-helmet-async': { Helmet: () => null },
    wouter: {
      Link: ({ children, ...p }) => React.createElement('a', p, children),
      Redirect: ({ to }) => React.createElement('span', { 'data-redirect': to }),
      useSearch: () => query,
      useLocation: () => ['/member/admin', href => { navigation.push(href); query = href.split('?')[1] ?? ''; }],
    },
    '@workspace/api-client-react': {
      useGetNetworkState: () => ({ isLoading: loading, isError: error, data: { certifications: [], reports: [], members: [] } }),
      getGetNetworkStateQueryKey: () => ['isolated-network'],
    },
    '@/components/network/kit': {
      useAct: () => { throw new Error('Workspace must not use mutation hooks'); },
    },
  };
  const leafPanels = {
    '@/components/partners/MediaRequestsAdmin': 'media',
    '@/components/partners/PartnerIntroductionsAdmin': 'intros',
    '@/components/news/NewsArchiveAdmin': 'news',
    '@/components/humanitarian/OffersAdmin': 'offers',
  };
  function load(file, extraMocks = {}) {
    if (cache.has(file)) return cache.get(file);
    const module = { exports: {} };
    const code = ts.transpileModule(readFileSync(file, 'utf8'), {
      compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
      fileName: file,
    }).outputText;
    runInNewContext(code, {
      module, exports: module.exports, URLSearchParams,
      require(id) {
        if (id in extraMocks) return extraMocks[id];
        if (id in mocks) return mocks[id];
        if (id in leafPanels) return { default: () => React.createElement('div', { 'data-panel': leafPanels[id] }) };
        if (id === 'lucide-react') return requireWeb(id);
        if (id === './ctx') return { useMe: () => ({ me }) };
        if (id.endsWith('.css')) return {};
        if (id.startsWith('@/') || id.startsWith('.')) {
          const base = id.startsWith('@/') ? resolve(root, id.slice(2)) : resolve(dirname(file), id);
          const path = ['', '.ts', '.tsx'].map(ext => base + ext).find(existsSync);
          assert.ok(path, `Local dependency: ${id}`);
          return load(path, extraMocks);
        }
        assert.fail(`Unexpected dependency, network client or auth: ${id}`);
      },
    });
    cache.set(file, module.exports);
    return module.exports;
  }
  return {
    events, focus, navigation, me,
    load: path => load(resolve(root, path)),
    render(path = 'pages/member/FounderWorkspace.tsx') {
      cursor = 0; events.clear();
      return renderToStaticMarkup(React.createElement(load(resolve(root, path)).default));
    },
    renderAdmin() {
      // Only existing admin layout and deep-link selection; mutation controls aren't exercised.
      mocks['@/components/network/kit'] = {
        useAct: () => ({ pending: false, run: () => { throw new Error('No mutation permitted'); } }),
        Empty: ({ title }) => React.createElement('p', null, title),
        Skeleton: () => React.createElement('p', null, 'Loading existing administration'),
        ErrorBox: () => React.createElement('p', { role: 'alert' }, 'Existing admin error'),
      };
      return this.render('pages/member/Admin.tsx');
    },
  };
}

test('workspace rejects an ordinary member before rendering administrative links or identity', () => {
  const f = fixture({ founder: false }), html = f.render();
  assert.match(html, /data-redirect="\/member"/);
  assert.equal(f.events.has('page-founder-workspace'), false);
  assert.doesNotMatch(html, /Press archive|Founder Workspace|DO_NOT_DISPLAY/);
});

test('overview contains nine real sections and seven existing tools without fabricated production data', () => {
  const f = fixture(), html = f.render();
  const { FOUNDER_SECTIONS: sections, FOUNDER_TOOLS: tools } = f.load('components/founder/founder-workspace-config.ts');
  assert.equal(sections.length, 9);
  assert.equal(Object.keys(tools).length, 7);
  for (const s of sections) assert.ok(f.events.has(`nav-founder-${s.id}`), s.id);
  for (const tool of Object.values(tools)) assert.equal(f.events.get(`link-founder-tool-${tool.id}`).href, tool.href);
  assert.match(html, /&lt;Founder &amp; TOMI&gt;/);
  assert.doesNotMatch(html, /DO_NOT_DISPLAY_PRIVATE_EMAIL/);
  assert.equal(f.events.get('link-founder-member-dashboard').href, '/member');
  assert.equal(f.events.get('link-founder-public-site').href, '~/');
  assert.equal(f.events.get('nav-founder-overview')['aria-selected'], true);
  assert.equal(f.events.get('nav-founder-overview').tabIndex, 0);
});

test('all sections select their real panel and mark future CMS controls unavailable', () => {
  const f = fixture();
  const { FOUNDER_SECTIONS: sections } = f.load('components/founder/founder-workspace-config.ts');
  f.render();
  for (const s of sections) {
    f.events.get(`nav-founder-${s.id}`).onClick();
    const html = f.render();
    assert.ok(f.events.has(`panel-founder-${s.id}`), s.id);
    assert.equal(f.events.get(`nav-founder-${s.id}`)['aria-selected'], true);
    assert.equal(f.events.get(`nav-founder-${s.id}`).tabIndex, 0);
    if (s.status !== 'available') assert.ok(f.events.has(`status-unavailable-${s.id}`), s.id);
    assert.doesNotMatch(html, /<(?:input|textarea|form)\b/, 'No pretend editor or preferences form');
    assert.equal((html.match(/role="tabpanel"/g) ?? []).length, 1);
  }
});

test('section keyboard navigation wraps and moves focus with arrows, Home and End', () => {
  const f = fixture();
  f.render();
  let prevented = 0;
  const press = (id, key) => {
    f.events.get(`nav-founder-${id}`).onKeyDown({ key, preventDefault: () => prevented++ });
    f.render();
  };
  press('overview', 'ArrowRight');
  assert.ok(f.events.has('panel-founder-pages'));
  assert.equal(f.focus.at(-1), 'nav-founder-pages');
  press('pages', 'End');
  assert.ok(f.events.has('panel-founder-settings'));
  press('settings', 'ArrowRight');
  assert.ok(f.events.has('panel-founder-overview'));
  press('overview', 'ArrowLeft');
  assert.ok(f.events.has('panel-founder-settings'));
  press('settings', 'Home');
  assert.ok(f.events.has('panel-founder-overview'));
  assert.equal(prevented, 5);
});

test('every admin deep link opens its intended existing panel and malformed tabs fall back safely', () => {
  const helper = fixture().load('lib/admin-navigation.ts');
  for (const tab of helper.ADMIN_TABS) {
    assert.equal(helper.adminTabFromSearch(`?tab=${tab}`), tab);
    const f = fixture({ search: `tab=${tab}` }), html = f.renderAdmin();
    if (['news', 'media', 'intros', 'offers'].includes(tab)) assert.match(html, new RegExp(`data-panel="${tab}"`));
    if (tab === 'certs') assert.match(html, /No applications/);
    if (tab === 'reports') assert.match(html, /No reports/);
    if (tab === 'members') assert.match(html, /No suspended members/);
  }
  for (const input of ['', 'tab=unknown', 'tab=../../settings', 'tab=https://outside.invalid', 'founder=true']) {
    assert.equal(helper.adminTabFromSearch(input), 'certs');
  }
});

test('member gate, Founder-only navigation and inherited loading/error branches remain present', () => {
  const src = readFileSync(resolve(root, 'pages/member/index.tsx'), 'utf8');
  assert.match(src, /<Route path="\/member\/founder">\{me\.founder \? <FounderWorkspace \/> : <Redirect to="\/member" replace \/>\}<\/Route>/);
  assert.match(src, /<Route path="\/member\/admin">\{me\.founder \? <Admin \/>/);
  for (const id of ['nav-founder-workspace', 'nav-founder-workspace-mobile']) {
    const index = src.indexOf(`data-testid="${id}"`);
    assert.ok(index > 0);
    assert.ok(src.slice(Math.max(0, index - 900), index).includes('{me.founder && ('), `${id} is Founder-only`);
  }
  assert.match(src, /profileQ\.isLoading \|\| stateQ\.isLoading/);
  assert.match(src, /if \(stateQ\.isError\)/);
  assert.match(src, /stateQ\.refetch\(\)/);
  assert.match(src, /<Show when="signed-out"><Redirect to="\/sign-in"/);
  assert.match(fixture({ loading: true }).renderAdmin(), /Loading existing administration/);
  assert.match(fixture({ error: true }).renderAdmin(), /Existing admin error/);
});

test('existing sensitive API paths keep server-side Founder guards; workspace introduces no API client', () => {
  const api = resolve(root, '../../api-server/src');
  const auth = readFileSync(resolve(api, 'services/networkAuth.ts'), 'utf8');
  assert.match(auth, /if \(!identity\.verified\)/);
  assert.match(auth, /identity\.email === process\.env\.TOMI_FOUNDER_EMAIL/);
  assert.match(auth, /export function requireFounder/);
  assert.match(auth, /NetworkActor\)\.founder\) throw new NetworkError\(403/);
  for (const file of ['newsArchive.ts', 'mediaRequests.ts', 'partnerIntroductions.ts', 'magazineSubmissions.ts', 'humanitarian.ts']) {
    assert.match(readFileSync(resolve(api, 'routes', file), 'utf8'), /requireFounder\(res\)/, file);
  }
  const workspace = readFileSync(resolve(root, 'pages/member/FounderWorkspace.tsx'), 'utf8');
  assert.doesNotMatch(workspace, /fetch\(|api-client|useAct|useGet|localStorage|process\.env|clerk|stripe/i);
  assert.match(workspace, /prefers-reduced-motion:reduce/);
});
