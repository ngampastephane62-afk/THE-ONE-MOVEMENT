import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { network, member, request } from './helpers/isolated-network.mjs';

// Real action/auth/state code, simulated PostgreSQL locks/transactions only.
// No HTTP listener, application startup, database, storage or Stripe connection.
const { state } = network;
const hour = 60 * 60 * 1000;
const start = (to, text = 'A required first note') => ({ action: 'thread.start', targetId: to.id, text });
beforeEach(() => {
  for (const value of Object.values(state)) {
    if (Array.isArray(value)) value.length = 0;
    else value.clear();
  }
  state.clock.set('now', Date.now());
});

function history(sender, hours = 1, options = {}) {
  const other = member();
  const thread = {
    id: state.threads.length + 1, memberA: Math.min(sender.id, other.id),
    memberB: Math.max(sender.id, other.id), requestedBy: sender.id,
    accepted: false, declined: false, updatedAt: new Date(state.clock.get('now')),
    ...options,
  };
  state.threads.push(thread);
  state.messages.push({
    id: state.messages.length + 1, threadId: thread.id, senderId: sender.id,
    text: 'Private initial note', createdAt: new Date(state.clock.get('now') - hours * hour), read: false,
  });
  return { other, thread, note: state.messages.at(-1) };
}

test('unpaid activated member can create a free request with exactly one initial note', async () => {
  const sender = member(), recipient = member();
  const result = await request(sender, start(recipient));
  assert.equal(result.statusCode, 200);
  assert.equal(state.threads.length, 1);
  assert.equal(state.threads[0].requestedBy, sender.id);
  assert.equal(state.threads[0].accepted, false);
  assert.equal(state.messages.length, 1);
  assert.equal(state.messages[0].text, 'A required first note');
  assert.equal(state.messages[0].senderId, sender.id);
  assert.deepEqual(state.paidCalls, []);
  assert.equal(state.paid.size, 0);
});

test('authentication, verified email and explicit network activation remain required', async () => {
  const recipient = member();
  assert.equal((await request(null, start(recipient))).statusCode, 401);
  assert.equal((await request(member({ verified: false }), start(recipient))).statusCode, 403);
  const inactive = member({ enabled: false });
  assert.equal((await request(inactive, start(recipient))).statusCode, 409);
  assert.equal(inactive.profile.enabled, false);
  assert.equal(state.threads.length, 0);
});

test('suspended senders and inactive or suspended recipients cannot start contact', async () => {
  const sender = member(), target = member();
  assert.equal((await request(member({ suspended: true }), start(target))).statusCode, 403);
  assert.equal((await request(sender, start(member({ suspended: true })))).statusCode, 404);
  assert.equal((await request(sender, start(member({ enabled: false })))).statusCode, 404);
  assert.equal((await request(sender, start(sender))).statusCode, 400);
  assert.equal(state.threads.length, 0);
});

test('new requests require a note and do not accept attachments or unknown input', async () => {
  const sender = member(), target = member();
  for (const text of ['', '   ', 'x'.repeat(3001)]) {
    assert.equal((await request(sender, start(target, text))).statusCode, 400);
  }
  assert.equal((await request(sender, { action: 'thread.start', targetId: target.id })).statusCode, 400);
  assert.equal((await request(sender, { ...start(target), attachments: ['file'] })).statusCode, 400);
  assert.equal(state.threads.length, 0);
});

test('both directions of blocking stop new requests and messages', async () => {
  const sender = member(), recipient = member();
  state.blocks.push({ blockerId: recipient.id, blockedId: sender.id });
  assert.equal((await request(sender, start(recipient))).statusCode, 404);
  assert.equal((await request(recipient, start(sender))).statusCode, 404);
  assert.equal(state.threads.length, 0);
});

test('five recent contacts, including accepted and declined contacts, do not prevent a sixth', async () => {
  const sender = member();
  for (let i = 0; i < 5; i++) history(sender, i + 1, { accepted: i % 2 === 0, declined: i % 2 !== 0 });
  const result = await request(sender, start(member()));
  assert.equal(result.statusCode, 200);
  assert.equal(state.threads.length, 6);
});

test('no daily or rolling-window product quota is applied', async () => {
  const sender = member();
  for (let i = 0; i < 4; i++) history(sender, 23.99, { accepted: true });
  history(sender, 24, { accepted: true });
  assert.equal((await request(sender, start(member()))).statusCode, 200);
  assert.equal((await request(sender, start(member()))).statusCode, 200);
});

test('later messages and thread.updatedAt do not change initial request age', async () => {
  const sender = member();
  for (let i = 0; i < 5; i++) {
    const { thread, other } = history(sender, 48, { accepted: true });
    state.messages.push({
      id: state.messages.length + 1, threadId: thread.id, senderId: other.id,
      createdAt: new Date(state.clock.get('now')), text: 'Recent reply',
    });
    thread.updatedAt = new Date(state.clock.get('now'));
  }
  assert.equal((await request(sender, start(member()))).statusCode, 200);
});

test('ten pending outgoing requests do not block another first contact', async () => {
  const sender = member();
  for (let i = 0; i < 10; i++) history(sender, 48);
  const result = await request(sender, start(member()));
  assert.equal(result.statusCode, 200);
  assert.equal(state.threads.length, 11);
});

test('pending and declined contact counts do not cap new conversations', async () => {
  const sender = member();
  for (let i = 0; i < 9; i++) history(sender, 48);
  history(sender, 48, { declined: true });
  assert.equal((await request(sender, start(member()))).statusCode, 200);
  assert.equal((await request(sender, start(member()))).statusCode, 200);
});

test('incoming requests, acceptance and replies do not consume outgoing quotas', async () => {
  const recipient = member(), sender = member();
  const created = await request(sender, start(recipient));
  assert.equal((await request(recipient, { action: 'thread.accept', id: created.payload.id })).statusCode, 200);
  assert.equal((await request(recipient, { action: 'message.send', id: created.payload.id, text: 'Reply' })).statusCode, 200);
  for (let i = 0; i < 5; i++) assert.equal((await request(recipient, start(member()))).statusCode, 200);
  assert.equal((await request(recipient, start(member()))).statusCode, 200);
});

test('opening or repeating an existing thread does not require another note or count', async () => {
  const sender = member();
  const existing = history(sender, 1);
  for (let i = 0; i < 4; i++) history(sender, 1);
  const result = await request(sender, { action: 'thread.start', targetId: existing.other.id });
  assert.equal(result.statusCode, 200);
  assert.equal(result.payload.id, existing.thread.id);
  assert.equal(state.threads.length, 5);
  assert.equal(state.messages.length, 5);
});

test('twelve concurrent first contacts succeed without daily quotas', async () => {
  const sender = member();
  const targets = Array.from({ length: 12 }, () => member());
  const results = await Promise.all(targets.map(target => request(sender, start(target))));
  assert.equal(results.filter(r => r.statusCode === 200).length, 12);
  assert.equal(state.threads.length, 12);
  assert.equal(state.messages.length, 12);
  assert.ok(state.transactionCalls.every(options => options?.isolationLevel === 'read committed'));
});

test('concurrent requests can exceed ten pending outgoing contacts', async () => {
  const sender = member();
  for (let i = 0; i < 9; i++) history(sender, 48);
  const targets = Array.from({ length: 6 }, () => member());
  const results = await Promise.all(targets.map(target => request(sender, start(target))));
  assert.equal(results.filter(r => r.statusCode === 200).length, 6);
  assert.equal(state.threads.length, 15);
});

test('concurrent duplicates and opposite-direction starts create one thread and one note', async () => {
  const a = member(), b = member();
  const results = await Promise.all([
    request(a, start(b)), request(b, start(a)),
    ...Array.from({ length: 5 }, () => request(a, start(b))),
  ]);
  assert.ok(results.every(r => r.statusCode === 200));
  assert.equal(new Set(results.map(r => r.payload.id)).size, 1);
  assert.equal(state.threads.length, 1);
  assert.equal(state.messages.length, 1);
  assert.equal(state.threads[0].accepted, false, 'Reciprocal first contact is not acceptance');
});

test('new contact no longer depends on quota reconstruction of unrelated historical notes', async () => {
  for (const kind of ['missing', 'sender', 'future']) {
    const sender = member();
    const old = history(sender);
    if (kind === 'missing') state.messages.splice(state.messages.indexOf(old.note), 1);
    if (kind === 'sender') old.note.senderId = old.other.id;
    if (kind === 'future') old.note.createdAt = new Date(state.clock.get('now') + hour);
    const before = state.threads.length;
    const result = await request(sender, start(member()));
    assert.equal(result.statusCode, 200);
    assert.equal(state.threads.length, before + 1);
  }
});

test('a failed initial-note insert rolls the new thread back and releases locks', async () => {
  const sender = member(), target = member();
  state.failures.add('messages.insert');
  await assert.rejects(request(sender, start(target)), /Isolated insert failure/);
  assert.equal(state.threads.length, 0);
  assert.equal(state.messages.length, 0);
  state.failures.clear();
  assert.equal((await request(sender, start(target))).statusCode, 200);
});

test('first note is immediate; only the recipient can open the conversation by replying', async () => {
  const sender = member(), recipient = member(), outsider = member();
  const created = await request(sender, start(recipient));
  const id = created.payload.id;
  assert.equal((await request(sender, { action: 'message.send', id, text: 'Too soon' })).statusCode, 403);
  assert.equal((await request(sender, { action: 'thread.accept', id })).statusCode, 403);
  assert.equal((await request(outsider, { action: 'thread.accept', id })).statusCode, 404);
  assert.equal((await request(outsider, { action: 'message.send', id, text: 'Not a participant' })).statusCode, 404);
  assert.equal((await request(recipient, { action: 'message.send', id, text: 'Reply opens the conversation' })).statusCode, 200);
  assert.equal(state.threads[0].accepted, true);
  assert.equal(state.messages.length, 2);
  assert.equal((await request(sender, { action: 'message.send', id, text: 'Now open' })).statusCode, 200);
});

test('decline restrictions persist until the recipient explicitly accepts again', async () => {
  const sender = member(), recipient = member();
  const created = await request(sender, start(recipient));
  const id = created.payload.id;
  assert.equal((await request(recipient, { action: 'thread.decline', id })).statusCode, 200);
  assert.equal((await request(sender, start(recipient))).statusCode, 403);
  assert.equal((await request(sender, { action: 'message.send', id, text: 'Declined' })).statusCode, 403);
  assert.equal((await request(recipient, { action: 'message.send', id, text: 'Cannot implicitly undo decline' })).statusCode, 403);
  assert.equal((await request(recipient, { action: 'thread.accept', id })).statusCode, 200);
  assert.equal((await request(sender, { action: 'message.send', id, text: 'Now accepted' })).statusCode, 200);
});

test('a failed reply does not accept the request or alter existing history', async () => {
  const sender = member(), recipient = member();
  const created = await request(sender, start(recipient));
  state.failures.add('messages.insert');
  await assert.rejects(request(recipient, { action: 'message.send', id: created.payload.id, text: 'Reply' }), /Isolated insert failure/);
  assert.equal(state.threads[0].accepted, false);
  assert.equal(state.messages.length, 1);
  state.failures.clear();
  assert.equal((await request(recipient, { action: 'message.send', id: created.payload.id, text: 'Retry' })).statusCode, 200);
  assert.equal(state.threads[0].accepted, true);
});

test('a concurrent decline cannot be overwritten by a stale recipient reply', async () => {
  const sender = member(), recipient = member();
  const created = await request(sender, start(recipient));
  const id = created.payload.id;
  const outcomes = await Promise.all([
    request(recipient, { action: 'thread.decline', id }),
    request(recipient, { action: 'message.send', id, text: 'Racing reply' }),
  ]);
  assert.equal(outcomes[0].statusCode, 200);
  assert.equal(outcomes[1].statusCode, 403);
  assert.equal(state.threads[0].declined, true);
  assert.equal(state.messages.length, 1);
});

test('ordinary members can communicate across sectors without a subscription or Founder privilege', async () => {
  const sender = member(), recipient = member();
  sender.row.activeSectors = ['fashion'];
  recipient.row.activeSectors = ['humanitarian-action'];
  const created = await request(sender, start(recipient));
  assert.equal(created.statusCode, 200);
  assert.equal((await request(recipient, { action: 'message.send', id: created.payload.id, text: 'Across sectors' })).statusCode, 200);
  assert.deepEqual(state.paidCalls, []);
});

test('accepted text conversations are unpaid and have no daily quota; technical limiter remains', async () => {
  const sender = member(), recipient = member();
  const created = await request(sender, start(recipient));
  const id = created.payload.id;
  await request(recipient, { action: 'thread.accept', id });
  for (let i = 0; i < 110; i++) {
    assert.equal((await request(sender, { action: 'message.send', id, text: `Ordinary message ${i}` })).statusCode, 200);
  }
  let last;
  for (let i = 0; i < 12; i++) last = await request(sender, { action: 'message.send', id, text: 'Technical burst limit' });
  assert.equal(last.statusCode, 429);
  assert.match(last.payload.error, /minute/);
  assert.deepEqual(state.paidCalls, []);
});

test('reporting after blocking does not unblock, accept or restore communication', async () => {
  const sender = member(), recipient = member();
  const created = await request(sender, start(recipient));
  const id = created.payload.id;
  assert.equal((await request(recipient, { action: 'block', targetId: sender.id, accepted: true })).statusCode, 200);
  const result = await request(recipient, { action: 'report', targetId: sender.id, text: 'Unwanted contact' });
  assert.equal(result.statusCode, 200);
  assert.equal(state.blocks.length, 1);
  assert.equal(state.threads[0].accepted, false);
  assert.equal(state.reports[0].memberId, sender.id);
  assert.equal('messages' in state.reports[0], false);
  assert.equal((await request(sender, { action: 'message.send', id, text: 'Blocked' })).statusCode, 403);
  assert.equal((await request(recipient, { action: 'thread.accept', id })).statusCode, 403);
  assert.equal((await request(recipient, { action: 'message.send', id, text: 'Also blocked' })).statusCode, 403);
  assert.equal((await request(recipient, start(sender))).statusCode, 404);
});

test('non-participant administrators receive no private messages or thread access', async () => {
  const sender = member(), recipient = member(), administrator = member();
  const created = await request(sender, start(recipient, 'Private message content'));
  const context = { member: administrator.row, clerkId: administrator.identity, founder: true };
  const result = await network.networkState(context, {});
  assert.deepEqual(result.threads, []);
  assert.deepEqual(result.messages, []);
  await assert.rejects(network.networkState(context, { thread: created.payload.id }), /Conversation not found/);
});

test('ordinary messaging makes no billing calls and does not change the existing publication policy', async () => {
  const sender = member(), target = member();
  assert.equal((await request(sender, start(target))).statusCode, 200);
  assert.deepEqual(state.paidCalls, []);
  for (let i = 0; i < 10; i++) {
    const follower = member({ referredBy: sender.id });
    state.follows.push({ followerId: follower.id, followingId: sender.id });
  }
  for (const kind of ['business', 'reel']) {
    // The existing posting-trials policy permits ordinary business publications.
    // Reels still need an actual video; this test does not touch storage.
    assert.equal((await request(sender, { action: 'post.create', kind, text: 'Commercial post' })).statusCode, kind === 'reel' ? 400 : 200);
  }
  assert.deepEqual(state.paidCalls, []);
});

test('all inbox pages and old conversation direct links remain available beyond one hundred threads', async () => {
  const sender = member();
  for (let i = 0; i < 105; i++) history(sender, 48);
  const context = { member: sender.row, clerkId: sender.identity, founder: false };
  const first = await network.networkState(context, {});
  assert.equal(first.threads.length, 100);
  assert.equal(first.nextThreadCursor, 6);
  const next = await network.networkState(context, { threadBefore: first.nextThreadCursor });
  assert.equal(next.threads.length, 5);
  assert.equal(next.nextThreadCursor, null);
  assert.equal(new Set([...first.threads, ...next.threads].map(t => t.id)).size, 105);
  const selected = await network.networkState(context, { thread: 1 });
  assert.ok(selected.threads.some(t => t.id === 1));
  assert.equal(selected.messages.length, 1);
  assert.equal(selected.messages[0].threadId, undefined, 'Only the existing response projection is exposed');
});

test('message pagination and unread counts do not truncate at the historical 5000-message window', async () => {
  const sender = member();
  const { thread, other } = history(sender, 48, { accepted: true });
  for (let i = 0; i < 5100; i++) state.messages.push({
    id: state.messages.length + 1, threadId: thread.id, senderId: other.id,
    text: 'Unread history', read: false, createdAt: new Date(),
  });
  const context = { member: sender.row, clerkId: sender.identity, founder: false };
  const first = await network.networkState(context, { thread: thread.id });
  assert.equal(first.messages.length, 100);
  assert.equal(first.messages.at(-1).id, 5101);
  assert.equal(first.nextMessageCursor, 5002);
  assert.equal(first.threads[0].unread, 5100);
  assert.equal(first.threads[0].lastMessage, 'Unread history');
  const older = await network.networkState(context, { thread: thread.id, messageBefore: first.nextMessageCursor });
  assert.equal(older.messages.at(-1).id, 5001);
  assert.equal(older.messages[0].id, 4902);
});

test('private inbox cursors do not reveal another member’s conversations', async () => {
  const sender = member(), outsider = member();
  const { thread } = history(sender);
  const context = { member: outsider.row, clerkId: outsider.identity, founder: true };
  const result = await network.networkState(context, { threadBefore: thread.id });
  assert.deepEqual(result.threads, []);
  await assert.rejects(network.networkState(context, { thread: thread.id }), /Conversation not found/);
});

test('professional introductions stay separate; ordinary messaging has no product quota query', () => {
  const professional = readFileSync(new URL('../src/routes/professional.ts', import.meta.url), 'utf8');
  const introduction = professional.slice(professional.indexOf('router.post("/professional/introductions"'));
  assert.ok(introduction.length > 0);
  assert.match(introduction.slice(0, introduction.indexOf('const parsed')), /if \(!who\.founder\) await requireMonthly/);
  const ordinary = readFileSync(new URL('../src/services/ordinaryMessaging.ts', import.meta.url), 'utf8');
  assert.match(ordinary, /clock_timestamp\(\)/);
  assert.doesNotMatch(ordinary, /LEFT JOIN LATERAL|recent >=|pending >=|requireMonthly|stripe|rolling 24-hour|10 pending/);
});

test('real Drizzle schemas compile the concurrency lock with bound IDs and no quota query', async () => {
  // Build SQL with the actual table definitions, but never import the DB pool,
  // database package entrypoint, auth service or application server.
  const schema = fileURLToPath(new URL('../../../lib/db/src/schema/network.ts', import.meta.url));
  const services = fileURLToPath(new URL('../src/services', import.meta.url));
  const output = await build({
    stdin: {
      contents: `export { startOrdinaryThread } from "./ordinaryMessaging"; export { calls } from "@workspace/db";`,
      resolveDir: services,
    },
    bundle: true, write: false, format: 'esm', platform: 'node',
    plugins: [{
      name: 'compile-sql-without-pool',
      setup(b) {
        b.onResolve({ filter: /^@workspace\/db$/ }, () => ({ path: 'db', namespace: 'sql-test' }));
        b.onResolve({ filter: /networkAuth$/ }, () => ({ path: 'errors', namespace: 'sql-test' }));
        b.onResolve({ filter: /networkState$/ }, () => ({ path: 'state', namespace: 'sql-test' }));
        b.onLoad({ filter: /.*/, namespace: 'sql-test' }, ({ path }) => ({
          loader: 'ts', resolveDir: services,
          contents: path === 'errors'
            ? 'export class NetworkError extends Error { constructor(public status: number, message: string) { super(message); } }'
            : path === 'state' ? 'export const ownThread = () => { throw Error("Not used by creation SQL test"); };'
            : `import { PgDialect } from "drizzle-orm/pg-core";
              export { networkProfiles, networkThreads, networkMessages } from ${JSON.stringify(schema)};
              export const calls = [];
              const dialect = new PgDialect();
              export const db = { transaction: async (run, options) => {
                calls.push(options);
                return run({
                  execute: async q => {
                    const compiled = dialect.sqlToQuery(q); calls.push(compiled);
                    return { rows: compiled.sql.includes("FOR UPDATE")
                      ? [{ member_id: 1 }, { member_id: 2 }]
                      : [{ recent: 5, pending: 0, invalid: 0 }] };
                  },
                  select: () => ({ from: () => ({ where: async () => [] }) }),
                  insert: () => { throw Error("Insert forbidden in SQL construction check"); },
                });
              } };`,
        }));
      },
    }],
  });
  const mod = await import(`data:text/javascript;base64,${Buffer.from(output.outputFiles[0].text).toString('base64')}`);
  await assert.rejects(mod.startOrdinaryThread(1, 2, () => 'Initial note'), /Insert forbidden/);
  assert.equal(mod.calls[0].isolationLevel, 'read committed');
  assert.deepEqual(mod.calls[1].params, [1, 2]);
  assert.match(mod.calls[1].sql, /ORDER BY "network_profiles"\."member_id" FOR UPDATE/);
  assert.equal(mod.calls.length, 2, 'Only the profile concurrency lock is queried');
});
