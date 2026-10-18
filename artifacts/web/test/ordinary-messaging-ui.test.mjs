import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

// Execute the real TSX handlers with simulated hooks and service boundaries.
// No browser, HTTP, application entrypoint, authentication or storage is loaded.
const root = resolve(import.meta.dirname, '../src/pages/member');
function fixture(page = 'Messages', { accepted = true, requestedByMe = true } = {}) {
  const slots = [];
  let cursor = 0, tree, rejectAction = '', confirmBlock = true, queryError = false;
  const actions = [], navigations = [], queryOptions = [];
  const other = { id: 2, fullName: 'Other member', sectors: [], bio: '', profileLayout: 'editorial' };
  const me = { id: 1, fullName: 'Own name' };
  const thread = { id: 8, other, accepted, requestedByMe, declined: false, unread: 0, updatedAt: '2026-10-18T00:00:00Z' };
  const data = { person: other, threads: [thread], messages: [{ id: 91, senderId: 2, text: 'Private conversation text', createdAt: thread.updatedAt }], posts: [] };
  const hooks = {
    useState: initial => {
      const i = cursor++;
      if (!(i in slots)) slots[i] = typeof initial === 'function' ? initial() : initial;
      return [slots[i], value => { slots[i] = typeof value === 'function' ? value(slots[i]) : value; }];
    },
    useRef: initial => { const i = cursor++; return slots[i] ??= { current: initial }; },
    useEffect: () => { cursor++; },
  };
  const api = {
    useGetNetworkState: (_params, options) => { queryOptions.push(options.query); return { data, isError: queryError }; },
    getGetNetworkStateQueryKey: params => ['/api/network/state', params],
  };
  const mocks = {
    react: hooks,
    'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
    wouter: { Link: 'a', useParams: () => ({ id: page === 'Messages' ? '8' : '2' }), useLocation: () => ['', href => navigations.push(href)] },
    '@workspace/api-client-react': api,
    '@tanstack/react-query': { useQueryClient: () => { throw Error('No professional action allowed'); } },
    '@/lib/sectors-data': { SECTORS: [] },
    '@/components/network/ProfileHero': { default: 'hero', appearanceOf: () => ({ layout: 'editorial', pos: 50, posts: 'list' }), onCoverBtn: 'button' },
    '@/components/network/PostCard': { default: 'post-card' },
    '@/components/network/ReportDialog': { default: 'report-dialog' },
    '@/components/ui/dialog': { Dialog: 'dialog', DialogContent: 'dialog-content', DialogTitle: 'dialog-title' },
    '@/lib/network-invitations': { publicProfileUrl: () => '/public-profile' },
    '@/components/network/kit': {
      Avatar: 'avatar', Badges: 'badges', Empty: 'empty', ErrorBox: 'error', Skeleton: 'skeleton',
      ago: () => 'now', btn: 'button', btnGhost: 'ghost', card: 'card', field: 'field',
      useAct: () => ({ pending: false, run: input => {
        actions.push(input);
        return rejectAction ? Promise.reject({ data: { error: rejectAction } }) : Promise.resolve({ id: 8 });
      } }),
    },
    './ctx': { useMe: () => ({ me, base: { threads: [] } }) },
  };
  function load(path) {
    const module = { exports: {} };
    const output = ts.transpileModule(readFileSync(path, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    runInNewContext(output, {
      module, exports: module.exports, confirm: () => confirmBlock,
      require: id => {
        if (id in mocks) return mocks[id];
        if (id === 'lucide-react') return new Proxy({}, { get: (_o, k) => String(k) });
        if (id === './proHooks') return load(resolve(root, 'proHooks.ts'));
        assert.fail(`Unexpected import blocked: ${id}`);
      },
    });
    return module.exports;
  }
  const Component = load(resolve(root, `${page}.tsx`)).default;
  function render() { cursor = 0; tree = Component(); }
  function nodes(node) {
    if (!node || typeof node !== 'object') return [];
    return [node, ...[node.props?.children, node.props?.actions].flat(Infinity).flatMap(child => nodes(child))];
  }
  const all = () => nodes(tree);
  function get(id) {
    const node = all().find(n => n.props?.['data-testid'] === id);
    assert.ok(node, id);
    return node.props;
  }
  function contents(node) {
    if (typeof node === 'string' || typeof node === 'number') return String(node);
    if (!node || typeof node !== 'object') return '';
    return [node.props?.children].flat(Infinity).map(child => contents(child)).join(' ');
  }
  async function settle() { await Promise.resolve(); await Promise.resolve(); render(); }
  render();
  return { get, all, contents: () => contents(tree), actions, navigations, queryOptions, render, settle, data,
    reject: message => { rejectAction = message; }, confirm: value => { confirmBlock = value; },
    queryError: value => { queryError = value; },
  };
}

test('first-contact form clearly requires a note and explains the exact free safety limits', () => {
  const f = fixture('Profile');
  f.get('button-request-message').onClick(); f.render();
  assert.equal(f.get('input-intro').required, true);
  assert.equal(f.get('button-send-request').disabled, true);
  const copy = f.contents();
  for (const text of ['Ordinary conversations are free', 'initial note required', '5 new requests', 'rolling 24 hours', '10 pending outgoing', 'no daily message quota', 'professional introductions remain a separate service']) assert.ok(copy.includes(text), text);
  const form = f.all().find(n => n.type === 'form' && n.props.onSubmit);
  form.props.onSubmit({ preventDefault() {} });
  assert.equal(f.actions.length, 0);
});

test('a valid initial note uses only ordinary messaging and preserves the note on quota rejection', async () => {
  const f = fixture('Profile');
  f.get('button-request-message').onClick(); f.render();
  f.get('input-intro').onChange({ target: { value: 'My voluntary initial note' } }); f.render();
  f.reject('You already have 10 pending outgoing requests.');
  f.all().find(n => n.type === 'form' && n.props.onSubmit).props.onSubmit({ preventDefault() {} });
  await f.settle();
  assert.equal(f.actions.length, 1);
  assert.equal(f.actions[0].action, 'thread.start');
  assert.equal(f.actions[0].targetId, 2);
  assert.equal(f.get('input-intro').value, 'My voluntary initial note');
  assert.ok(f.contents().includes('You already have 10 pending outgoing requests.'));
  assert.equal(f.navigations.length, 0);
});

test('accepted conversations expose ordinary text sending and existing safety actions', async () => {
  const f = fixture();
  assert.ok(f.contents().includes('Accepted conversations have no daily message quota'));
  assert.ok(f.contents().includes('Short-term security limits still apply'));
  f.get('button-block-thread');
  f.get('button-report-thread');
  f.get('input-message').onChange({ target: { value: 'An ordinary message' } }); f.render();
  f.all().find(n => n.type === 'form').props.onSubmit({ preventDefault() {} });
  await f.settle();
  assert.equal(f.actions[0].action, 'message.send');
  assert.equal(f.actions[0].id, 8);
  assert.equal(f.actions[0].text, 'An ordinary message');
});

test('unaccepted outgoing conversations have no send form; incoming requests expose explicit consent', () => {
  const outgoing = fixture('Messages', { accepted: false });
  outgoing.get('status-pending');
  assert.ok(!outgoing.all().some(n => n.props?.['data-testid'] === 'button-send-message'));
  assert.equal(outgoing.actions.length, 0);
  const incoming = fixture('Messages', { accepted: false, requestedByMe: false });
  incoming.get('button-accept-thread').onClick();
  assert.equal(incoming.actions[0].action, 'thread.accept');
  incoming.get('button-decline-thread');
});

test('blocking from the conversation hides messages and keeps reporting accessible without unblocking', async () => {
  const f = fixture();
  f.confirm(false);
  f.get('button-block-thread').onClick();
  assert.equal(f.actions.length, 0);
  f.confirm(true);
  f.get('button-block-thread').onClick();
  await f.settle();
  f.queryError(true); f.render();
  f.get('status-thread-blocked');
  assert.ok(!f.contents().includes('Private conversation text'));
  assert.ok(!f.all().some(n => n.props?.['data-testid'] === 'input-message'));
  assert.equal(f.queryOptions.at(-1).enabled, false);
  f.get('button-report-blocked-member').onClick(); f.render();
  const dialog = f.all().find(n => n.type === 'report-dialog');
  assert.equal(dialog.props.target.memberId, 2);
  assert.equal(f.actions.length, 1);
  assert.equal(f.actions[0].action, 'block');
  assert.equal(f.actions[0].accepted, true);
});

test('failed block does not claim success or erase the conversation draft', async () => {
  const f = fixture();
  f.get('input-message').onChange({ target: { value: 'My unsent draft' } }); f.render();
  f.reject('Block could not be saved.');
  f.get('button-block-thread').onClick(); await f.settle();
  assert.equal(f.get('input-message').value, 'My unsent draft');
  assert.ok(f.contents().includes('Block could not be saved.'));
  assert.ok(!f.all().some(n => n.props?.['data-testid'] === 'status-thread-blocked'));
});
