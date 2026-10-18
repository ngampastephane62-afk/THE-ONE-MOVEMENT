import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

// In-memory unit harness only. No entrypoint, HTTP, Clerk service, DB, storage
// or browser is loaded. Component hooks are simulated, not a runtime UI test.
const requireWeb = createRequire(new URL('../package.json', import.meta.url));
const { QueryClient } = requireWeb('@tanstack/react-query');
const root = resolve(import.meta.dirname, '../src');
const ownKey = ['/api/member/profile'];
const stateKey = ['/api/network/state'];
const directoryKey = ['/api/ecosystem/members'];
const publicKey = id => [`/api/network/public/${id}`];
const plain = value => JSON.parse(JSON.stringify(value));

function fixture({ initial = {}, defaultName = 'Clerk initial name' } = {}) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  const slots = [];
  let cursor = 0;
  let effects = [];
  let tree;
  let request;
  const done = [];
  const drafts = [];
  const writes = [];
  const uploads = [];
  let uploadItems = [];
  let pendingSectorCleared = false;
  const profile = {
    id: 7, fullName: 'Chosen member name', profession: '', organization: '',
    country: '', bio: '', offering: '', lookingFor: '', website: '', sectors: [],
    isPublic: false, publicMedia: false, savedItems: [], ...initial,
  };
  const appearanceOf = p => ({
    layout: ['immersive', 'centered', 'editorial'].includes(p?.profileLayout) ? p.profileLayout : 'immersive',
    pos: typeof p?.coverPosition === 'number' && Number.isFinite(p.coverPosition) ? Math.min(100, Math.max(0, Math.round(p.coverPosition))) : 50,
    posts: p?.postsLayout === 'list' ? 'list' : 'grid',
  });
  const hooks = {
    useState: init => {
      const i = cursor++;
      if (!(i in slots)) slots[i] = typeof init === 'function' ? init() : init;
      return [slots[i], value => { slots[i] = typeof value === 'function' ? value(slots[i]) : value; }];
    },
    useRef: value => {
      const i = cursor++;
      if (!(i in slots)) slots[i] = { current: value };
      return slots[i];
    },
    useEffect: (effect, deps) => {
      const i = cursor++;
      if (!slots[i] || deps.some((value, n) => !Object.is(value, slots[i][n]))) effects.push(effect);
      slots[i] = deps;
    },
  };
  const api = {
    getGetMemberProfileQueryKey: () => ownKey,
    getGetEcosystemMembersQueryKey: () => directoryKey,
    getGetPublicNetworkProfileQueryKey: publicKey,
    useSaveMemberProfile: () => ({
      mutate: (variables, callbacks) => { writes.push(variables); request = callbacks; },
      isError: false, isPending: false,
    }),
    useGetMemberProfile: () => ({ data: qc.getQueryData(ownKey) }),
  };
  const mocks = {
    react: hooks,
    'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
    '@clerk/react': { useAuth: () => ({ userId: 'isolated' }), useUser: () => ({ user: { fullName: defaultName } }) },
    '@tanstack/react-query': { useQueryClient: () => qc },
    '@workspace/api-client-react': api,
    '@workspace/shared': { SOCIAL_PROFILES: [], normalizeSocialProfile: (_field, value) => value },
    '@/lib/network-invitations': { getPendingSector: () => null, clearPendingSector: () => { pendingSectorCleared = true; } },
    '@/lib/sectors-data': { SECTORS: [{ slug: 'business', name: 'Business' }] },
    '@/components/network/ProfileHero': { default: 'profile-hero', appearanceOf },
    '@/components/network/kit': {
      STATE_PREFIX: stateKey, btn: 'button', btnGhost: 'ghost', card: 'card', ACCEPT_IMG: 'image/*',
      useUploads: () => ({ items: uploadItems, busy: false, clear: () => { uploadItems = []; }, add: files => uploads.push(files) }),
      useAct: () => ({ run: data => { writes.push(data); return Promise.resolve(); } }),
    },
    wouter: { Link: 'a', useSearch: () => '', useLocation: () => ['/member/settings', () => {}] },
    lucide: {},
    [resolve(root, 'pages/member/AppearanceControls.tsx')]: { default: 'appearance-controls' },
    [resolve(root, 'pages/member/Workspace.tsx')]: { default: 'workspace' },
    [resolve(root, 'pages/member/ctx.ts')]: {
      useMe: () => ({ me: { ...profile, fullName: 'Stale context name', avatarUrl: '/private-photo', coverUrl: null } }),
    },
  };
  const cache = new Map();
  function load(filename) {
    if (filename in mocks) return mocks[filename];
    if (cache.has(filename)) return cache.get(filename);
    const output = ts.transpileModule(readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
      fileName: filename,
    }).outputText;
    const module = { exports: {} };
    runInNewContext(output, {
      module, exports: module.exports, URLSearchParams, URL,
      require: id => {
        if (id in mocks) return mocks[id];
        if (id === 'lucide-react') return new Proxy({}, { get: (_o, key) => String(key) });
        if (id.startsWith('.') || id.startsWith('@/')) {
          const base = id.startsWith('@/') ? resolve(root, id.slice(2)) : resolve(dirname(filename), id);
          const path = ['', '.ts', '.tsx'].map(ext => base + ext).find(existsSync);
          assert.ok(path, id);
          return load(path);
        }
        assert.fail(`Unexpected import blocked: ${id}`);
      },
    }, { filename });
    cache.set(filename, module.exports);
    return module.exports;
  }
  const helpers = load(resolve(root, 'pages/member/profile-sync.ts'));
  const Form = load(resolve(root, 'pages/member/ProfileForm.tsx')).default;
  qc.setQueryData(ownKey, { profile });
  let activeComponent;
  function render(Component = Form) {
    if (Component !== activeComponent) slots.length = 0;
    activeComponent = Component;
    cursor = 0;
    effects = [];
    tree = Component({ initial: profile, defaultName, onDone: value => done.push(value), onDraft: value => drafts.push(value) });
    for (const effect of effects) effect();
    return tree;
  }
  function nodes(node) {
    if (!node || typeof node !== 'object') return [];
    return [node, ...[node.props?.children].flat(Infinity).flatMap(child => nodes(child))];
  }
  function get(id) {
    const node = nodes(tree).find(n => n.props?.['data-testid'] === id);
    assert.ok(node, id);
    return node.props;
  }
  function change(field, value) { get(`input-${field}`).onChange({ target: { value } }); render(); }
  function submit() { get('form-member-profile').onSubmit({ preventDefault() {} }); render(); }
  async function succeed(overrides = {}) {
    await request.onSuccess({ profile: { ...profile, ...writes.at(-1).data, ...overrides } });
    render();
  }
  render();
  return {
    qc, profile, helpers, get, change, submit, succeed, render, load, nodes: () => nodes(tree),
    writes, done, drafts, uploads, get request() { return request; },
    setUploadItems: items => { uploadItems = items; },
    get cleared() { return pendingSectorCleared; },
  };
}

test('chosen name takes precedence over Clerk; initial prefill remains available', () => {
  const f = fixture();
  assert.equal(f.get('input-fullName').value, 'Chosen member name');
  assert.equal(f.helpers.profileInput(null, 'Voluntary Clerk name').fullName, 'Voluntary Clerk name');
  f.render();
  assert.equal(f.get('input-fullName').value, 'Chosen member name');
  assert.equal(f.writes.length, 0);
});

test('minimal profile can be saved with all completion details empty and private', async () => {
  const f = fixture();
  f.submit();
  const data = f.writes[0].data;
  for (const field of ['profession', 'bio', 'organization', 'country', 'website']) assert.equal(data[field], '');
  assert.deepEqual(plain(data.sectors), []);
  assert.equal(data.isPublic, false);
  assert.equal(data.publicMedia, false);
  assert.equal('enabled' in data, false);
  assert.equal('avatarUrl' in data, false);
  await f.succeed();
  assert.deepEqual(f.done, [false]);
  assert.equal(f.cleared, true);
});

test('confirmed normalized values replace the form and draft, not just the cache', async () => {
  const f = fixture();
  f.change('profession', '  Designer  ');
  f.change('website', 'https://example.org');
  f.submit();
  await f.succeed({ profession: 'Designer', website: 'https://example.org/' });
  assert.equal(f.get('input-profession').value, 'Designer');
  assert.equal(f.get('input-website').value, 'https://example.org/');
  assert.equal(f.drafts.at(-1).website, 'https://example.org/');
  assert.equal(f.qc.getQueryData(ownKey).profile.website, 'https://example.org/');
});

test('newer edits during a request survive while unchanged fields get normalization', async () => {
  const f = fixture();
  f.change('profession', '  Designer  ');
  f.change('website', 'https://example.org');
  f.submit();
  f.change('profession', 'Newer profession');
  f.change('bio', 'Written while saving');
  await f.succeed({ profession: 'Designer', website: 'https://example.org/' });
  assert.equal(f.get('input-profession').value, 'Newer profession');
  assert.equal(f.get('input-bio').value, 'Written while saving');
  assert.equal(f.get('input-website').value, 'https://example.org/');
  assert.equal(f.qc.getQueryData(ownKey).profile.profession, 'Designer');
  assert.deepEqual(f.done, [true]);
});

test('failed save preserves all draft fields and permits retry', () => {
  const f = fixture();
  f.change('profession', 'Unsaved role');
  f.submit();
  f.change('bio', 'Newer unsaved bio');
  f.request.onError(new Error('Isolated failure'));
  f.render();
  assert.equal(f.get('input-profession').value, 'Unsaved role');
  assert.equal(f.get('input-bio').value, 'Newer unsaved bio');
  assert.equal(f.qc.getQueryData(ownKey).profile.profession, '');
  assert.equal(f.cleared, false);
  assert.deepEqual(f.done, []);
  f.submit();
  assert.equal(f.writes.length, 2);
  assert.equal(f.writes[1].data.bio, 'Newer unsaved bio');
});

test('missing confirmed profile is not treated as successful synchronization', async () => {
  const f = fixture();
  f.change('bio', 'Keep me');
  f.submit();
  await f.request.onSuccess({ profile: null });
  f.render();
  assert.equal(f.get('input-bio').value, 'Keep me');
  assert.equal(f.cleared, false);
  assert.deepEqual(f.done, []);
  assert.ok(f.nodes().some(n => n.props?.role === 'alert'));
});

test('duplicate submissions are blocked until synchronization finishes', async () => {
  const f = fixture();
  f.submit();
  f.submit();
  assert.equal(f.writes.length, 1);
  assert.equal(f.get('button-save-profile').disabled, true);
  await f.succeed();
  assert.equal(f.get('button-save-profile').disabled, false);
});

test('own state updates immediately; media, activation, restrictions and other members are untouched', async () => {
  const f = fixture({ initial: { isPublic: true, publicMedia: false } });
  const owner = { ...f.profile, enabled: false, suspended: true, avatarUrl: '/private-new-photo', coverUrl: '/private-cover' };
  const other = { ...owner, id: 8, fullName: 'Other member' };
  f.qc.setQueryData([...stateKey, { view: 'home' }], { me: owner, members: [other], person: other });
  f.qc.setQueryData(directoryKey, { members: [] });
  f.qc.setQueryData(publicKey(7), { profile: { id: 7, publicMedia: false, avatarUrl: null } });
  f.change('profession', 'New role');
  f.submit();
  await f.succeed();
  const state = f.qc.getQueryData([...stateKey, { view: 'home' }]);
  assert.equal(state.me.profession, 'New role');
  assert.equal(state.me.enabled, false);
  assert.equal(state.me.suspended, true);
  assert.equal(state.me.avatarUrl, '/private-new-photo');
  assert.equal(state.me.coverUrl, '/private-cover');
  assert.equal(state.me.isPublic, true);
  assert.equal(state.me.publicMedia, false);
  assert.equal(state.members[0], other);
  assert.equal(state.person, other);
  for (const key of [stateKey.concat({ view: 'home' }), directoryKey, publicKey(7)]) assert.equal(f.qc.getQueryState(key).isInvalidated, true);
  assert.equal(f.qc.getQueryData(publicKey(7)).profile.avatarUrl, null);
});

test('a pending older profile read is cancelled before the saved result is cached', async () => {
  const f = fixture();
  let resolveOld;
  const oldRead = f.qc.fetchQuery({
    queryKey: ownKey, queryFn: () => new Promise(resolve => { resolveOld = resolve; }),
  }).catch(() => {});
  await f.helpers.synchronizeProfile(f.qc, { ...f.profile, fullName: 'Confirmed name' });
  resolveOld({ profile: { ...f.profile, fullName: 'Old name' } });
  await oldRead;
  assert.equal(f.qc.getQueryData(ownKey).profile.fullName, 'Confirmed name');
});

test('newer privacy opt-out wins over a pending successful response', async () => {
  const f = fixture({ initial: { isPublic: true, publicMedia: true } });
  f.submit();
  f.get('checkbox-isPublic').onChange({ target: { checked: false } });
  f.render();
  await f.succeed();
  assert.equal(f.get('checkbox-isPublic').checked, false);
  assert.equal(f.get('checkbox-publicMedia').checked, false);
  assert.deepEqual(f.done, [true]);
});

test('Settings preview uses confirmed profile fields instead of stale context; photo remains independent', () => {
  const f = fixture({ initial: { fullName: 'Confirmed display name', profession: 'Confirmed role' } });
  const Settings = f.load(resolve(root, 'pages/member/Settings.tsx')).default;
  f.render(Settings);
  const hero = f.nodes().find(n => n.type === 'profile-hero');
  assert.equal(hero.props.m.fullName, 'Confirmed display name');
  assert.equal(hero.props.m.profession, 'Confirmed role');
  assert.equal(hero.props.m.avatarUrl, '/private-photo');
  assert.equal(f.get('action-add-profile-photo').htmlFor, 'profile-photo-upload');
  // Render the existing media picker with isolated upload/action boundaries.
  const picker = hero.props.avatarTools;
  f.render(() => picker.type(picker.props));
  assert.equal(f.get('input-avatar').id, 'profile-photo-upload');
  f.get('input-avatar').onChange({ target: { files: ['isolated-image'], value: 'image' } });
  assert.equal(f.uploads.length, 1);
  assert.equal(f.writes.length, 0, 'Photo selection never submits profile fields or changes visibility');
});

test('completed photo upload associates only the photo, independently of unsaved profile fields', async () => {
  const f = fixture();
  const Settings = f.load(resolve(root, 'pages/member/Settings.tsx')).default;
  f.render(Settings);
  const hero = f.nodes().find(n => n.type === 'profile-hero');
  const picker = hero.props.avatarTools;
  f.setUploadItems([{ id: 91, status: 'done' }]);
  f.render(() => picker.type(picker.props));
  await Promise.resolve();
  assert.deepEqual(plain(f.writes), [{ action: 'profile.media', kind: 'avatar', mediaIds: [91] }]);
  assert.equal(f.qc.getQueryData(ownKey).profile.isPublic, false);
  assert.equal(f.qc.getQueryData(ownKey).profile.publicMedia, false);
  assert.deepEqual(f.done, []);
});

test('optional welcome guidance retains exploration and adds the existing profile destination', () => {
  const f = fixture();
  const Welcome = f.load(resolve(root, 'pages/member/MemberWelcome.tsx')).default;
  f.render(Welcome);
  assert.equal(f.get('link-welcome-profile').href, '/member/settings');
  assert.equal(f.get('link-welcome-discovery').href, '/member/settings?tab=workspace');
  assert.equal(f.get('link-welcome-people').href, '/member/people');
  assert.equal(f.writes.length, 0);
});

test('initialization source still preserves names and requires explicit activation', () => {
  // Static guard only: never import or run authentication/database code.
  const source = readFileSync(resolve(root, '../../api-server/src/services/networkAuth.ts'), 'utf8');
  assert.match(source, /if \(!member\) \{\s*const name = identity\.fullName/);
  assert.match(source, /enabled: false/);
  assert.match(source, /onConflictDoUpdate\(\{ target: networkProfiles\.memberId, set: \{ founder \} \}\)/);
  assert.doesNotMatch(source, /imageUrl|avatarUrl/);
});
