import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve, dirname } from 'node:path';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

// Render real frontend components with isolated identity/query/router boundaries.
// No application startup, HTTP, credentials, database, browser or storage access.
const requireWeb = createRequire(new URL('../package.json', import.meta.url));
const React = requireWeb('react');
const runtime = requireWeb('react/jsx-runtime');
const { renderToStaticMarkup } = requireWeb('react-dom/server');
const root = resolve(import.meta.dirname, '../src');

function fixture({ sectors = [], search = '', savedItems = [], isPublic = false } = {}) {
  const profile = { id: 1, fullName: 'Isolated member', sectors, savedItems, isPublic, followers: 0, following: 0 };
  const clicks = new Map();
  const writes = [];
  const navigations = [];
  const cache = new Map();
  let currentSearch = search;
  const mocks = {
    react: React,
    'react/jsx-runtime': Object.fromEntries(Object.entries(runtime).map(([key, value]) => [
      key, key === 'jsx' || key === 'jsxs' ? (type, props, ...rest) => {
        if (props?.onClick && props['data-testid']) clicks.set(props['data-testid'], props.onClick);
        return value(type, props, ...rest);
      } : value,
    ])),
    wouter: {
      Link: ({ children, ...props }) => React.createElement('a', props, children),
      useSearch: () => currentSearch,
      useLocation: () => ['/member/settings', (href) => {
        navigations.push(href);
        currentSearch = new URL(href, 'https://isolated.invalid').search.slice(1);
      }],
    },
    '@clerk/react': { useUser: () => ({ user: { fullName: profile.fullName } }) },
    '@tanstack/react-query': { useQueryClient: () => ({ setQueryData: (...args) => writes.push(args) }) },
    '@workspace/api-client-react': {
      useGetMemberProfile: () => ({ data: { profile } }),
      getGetMemberProfileQueryKey: () => ['isolated-profile'],
      useToggleMemberSavedItem: () => ({ mutate: (...args) => writes.push(args), isPending: false }),
    },
    '@/components/network/kit': {
      btn: 'button', btnGhost: 'button-ghost', card: 'card',
      useAct: () => ({ run: (data) => { writes.push(data); return Promise.resolve(); }, pending: false }),
      useUploads: () => ({ items: [], busy: false }),
      Avatar: () => null, Skeleton: () => null, ErrorBox: () => null,
    },
    '@/components/network/ProfileHero': {
      default: () => null, appearanceOf: () => ({ layout: 'classic', pos: 50, posts: 'list' }),
    },
    [resolve(root, 'pages/member/ProfileForm.tsx')]: { default: () => React.createElement('div', { 'data-testid': 'isolated-profile-form' }) },
    [resolve(root, 'pages/member/ctx.ts')]: { useMe: () => ({ me: profile }) },
  };

  function compile(source, filename) {
    const output = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
      fileName: filename,
    }).outputText;
    const module = { exports: {} };
    runInNewContext(output, {
      URLSearchParams,
      module, exports: module.exports,
      require: (id) => {
        if (id in mocks) return mocks[id];
        if (id.startsWith('@/') || id.startsWith('.')) {
          const base = id.startsWith('@/') ? resolve(root, id.slice(2)) : resolve(dirname(filename), id);
          const path = ['', '.ts', '.tsx'].map(ext => base + ext).find(existsSync);
          assert.ok(path, `Local module exists: ${id}`);
          return load(path);
        }
        assert.ok(['react', 'react/jsx-runtime', 'lucide-react'].includes(id), `Unexpected module blocked: ${id}`);
        return requireWeb(id);
      },
    }, { filename });
    return module.exports;
  }
  function load(path) {
    if (path in mocks) return mocks[path];
    if (!cache.has(path)) cache.set(path, compile(readFileSync(path, 'utf8'), path));
    return cache.get(path);
  }
  function component(name, props = {}) {
    const C = load(resolve(root, `pages/member/${name}.tsx`)).default;
    return renderToStaticMarkup(React.createElement(C, { profile, onEdit: () => {}, ...props }));
  }
  function activation() {
    // Extract only the unchanged activation boundary plus its updated presentation;
    // importing the member entrypoint would load auth, API and unrelated routes.
    const path = resolve(root, 'pages/member/index.tsx');
    const source = ts.createSourceFile(path, readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const fn = source.statements.find(n => ts.isFunctionDeclaration(n) && n.name?.text === 'ActivationPrompt');
    const C = compile(`import { useState } from 'react';
      import { Link } from 'wouter';
      import { useAct } from '@/components/network/kit';
      ${fn.getText(source)}
      export default ActivationPrompt;`, path).default;
    return renderToStaticMarkup(React.createElement(C));
  }
  return { component, activation, load, clicks, writes, navigations, profile };
}

test('welcome gives three existing destinations without activation or writes', () => {
  const f = fixture();
  const html = f.component('MemberWelcome');
  for (const href of ['/member/settings?tab=workspace', '/member/people', '/ecosystem']) assert.ok(html.includes(`href="${href}"`));
  for (const phrase of ['I belong.', 'I can connect.', 'I can contribute.', 'I can grow.', 'membership is free', 'profile is optional', 'explicit activation', 'does not require ten invitations', 'certification is separate', 'paid promotion does not grant official recognition', 'messaging features']) assert.ok(html.includes(phrase), phrase);
  assert.equal(f.writes.length, 0);
});

test('activation remains explicit and uses the original consent action', () => {
  const f = fixture();
  const html = f.activation();
  assert.ok(html.includes('Activate my network profile'));
  assert.ok(html.includes('public directory setting does not change'));
  assert.ok(html.includes('does not unlock every specialized service'));
  assert.equal(f.writes.length, 0);
  f.clicks.get('button-activate')();
  assert.deepEqual(JSON.parse(JSON.stringify(f.writes)), [{ action: 'join', accepted: true }]);
});

test('Workspace with no sectors shows the real general catalogue without saving preferences', () => {
  const f = fixture();
  const html = f.component('Workspace');
  const { PROGRAMS } = f.load(resolve(root, 'lib/programs-data.ts'));
  const { ECOSYSTEM_RESOURCES } = f.load(resolve(root, 'lib/ecosystem-resources.ts'));
  for (const p of PROGRAMS) assert.ok(html.includes(`card-program-${p.slug}`));
  for (const r of ECOSYSTEM_RESOURCES) assert.ok(html.includes(`card-resource-${r.id}`));
  assert.ok(html.includes('No sectors selected'));
  assert.ok(html.includes('Explore programmes'));
  assert.equal(f.profile.sectors.length, 0);
  assert.equal(f.writes.length, 0);
});

test('all 17 sectors use the existing deterministic matching functions', () => {
  const base = fixture();
  const { SECTORS } = base.load(resolve(root, 'lib/sectors-data.ts'));
  const { PROGRAMS } = base.load(resolve(root, 'lib/programs-data.ts'));
  const { ECOSYSTEM_RESOURCES } = base.load(resolve(root, 'lib/ecosystem-resources.ts'));
  const match = base.load(resolve(root, 'lib/ecosystem-match.ts'));
  assert.equal(SECTORS.length, 17);
  for (const sector of SECTORS) {
    const f = fixture({ sectors: [sector.slug] });
    const html = f.component('Workspace');
    const programs = match.programsForSectors([sector.slug]).map(p => p.slug);
    const resources = match.resourcesForSectors([sector.slug]).map(r => r.id);
    for (const p of PROGRAMS) assert.equal(html.includes(`card-program-${p.slug}`), programs.includes(p.slug), sector.slug);
    for (const r of ECOSYSTEM_RESOURCES) assert.equal(html.includes(`card-resource-${r.id}`), resources.includes(r.id), sector.slug);
    assert.ok(html.includes('href="/member/people"'));
    assert.ok(html.includes('href="/ecosystem"'));
    assert.ok(html.includes('not your browsing activity'));
    assert.equal(f.writes.length, 0);
  }
});

test('multiple explicit sectors preserve deduplicated catalogue matches', () => {
  const f = fixture({ sectors: ['education', 'fashion'] });
  const html = f.component('Workspace');
  const match = f.load(resolve(root, 'lib/ecosystem-match.ts'));
  for (const p of match.programsForSectors(f.profile.sectors)) {
    assert.equal(html.split(`data-testid="card-program-${p.slug}"`).length - 1, 1);
  }
});

test('bookmarks remain bookmarks and render existing saved items', () => {
  const f = fixture({ savedItems: ['program:summit'] });
  const html = f.component('Workspace');
  assert.ok(html.includes('row-saved-program:summit'));
  assert.ok(html.includes('does not register you or guarantee a place'));
  assert.ok(html.includes('Listing does not imply partnership'));
  assert.equal(f.writes.length, 0);
  f.clicks.get('button-remove-program:summit')();
  assert.deepEqual(JSON.parse(JSON.stringify(f.writes[0][0])), { data: { itemId: 'program:summit', saved: false } });
});

test('visibility remains the profile setting, not a discovery side effect', () => {
  assert.ok(fixture().component('Workspace').includes('Private — not in the directory'));
  assert.ok(fixture({ isPublic: true }).component('Workspace').includes('Visible in the public directory'));
});

test('direct URL and reload open the existing Workspace; no second page or identity', () => {
  for (let visit = 0; visit < 2; visit++) {
    const f = fixture({ search: 'tab=workspace' });
    const html = f.component('Settings');
    assert.ok(html.includes('text-discovery-basis'));
    assert.ok(!html.includes('isolated-profile-form'));
    assert.equal(f.writes.length, 0);
  }
});

test('profile is still the default for missing or unknown tab values', () => {
  for (const search of ['', 'tab=unknown']) {
    const html = fixture({ search }).component('Settings');
    assert.ok(html.includes('isolated-profile-form'));
    assert.ok(!html.includes('text-discovery-basis'));
  }
});

test('tab navigation and edit action stay on Settings and preserve unrelated query parameters', () => {
  const f = fixture({ search: 'source=welcome' });
  f.component('Settings');
  f.clicks.get('tab-settings-workspace')();
  assert.equal(f.navigations.at(-1), '/member/settings?source=welcome&tab=workspace');
  assert.ok(f.component('Settings').includes('text-discovery-basis'));
  f.clicks.get('button-edit-profile')();
  assert.equal(f.navigations.at(-1), '/member/settings?source=welcome');
  assert.ok(f.component('Settings').includes('isolated-profile-form'));
  assert.equal(f.writes.length, 0);
});

test('welcome is scoped to feed entry; activation and optional prompts keep their existing conditions', () => {
  const source = readFileSync(resolve(root, 'pages/member/index.tsx'), 'utf8');
  assert.ok(source.includes("(loc === '/member' || loc === '/member/') && <MemberWelcome />"));
  assert.ok(source.includes('me.enabled ? <PendingInvitation /> : !personalPage && <ActivationPrompt />'));
  assert.ok(source.includes("hidden || !me.enabled || (me.profession && me.sectors.length && me.bio)"));
  assert.ok(source.includes("clearPendingSector(); setDismissed(true)"));
});
