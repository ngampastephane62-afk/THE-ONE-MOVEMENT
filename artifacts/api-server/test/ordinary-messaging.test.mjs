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

test('accepted and declined requests both count within the rolling 24 hours', async () => {
  const sender = member();
  for (let i = 0; i < 5; i++) history(sender, i + 1, { accepted: i % 2 === 0, declined: i % 2 !== 0 });
  const result = await request(sender, start(member()));
  assert.equal(result.statusCode, 429);
  assert.match(result.payload.error, /rolling 24-hour/);
  assert.equal(state.threads.length, 5);
});

test('rolling cutoff expires old requests exactly at 24 hours, not at midnight', async () => {
  const sender = member();
  for (let i = 0; i < 4; i++) history(sender, 23.99, { accepted: true });
  history(sender, 24, { accepted: true });
  assert.equal((await request(sender, start(member()))).statusCode, 200);
  assert.equal((await request(sender, start(member()))).statusCode, 429);
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

test('ten pending outgoing requests block another first contact even if all are old', async () => {
  const sender = member();
  for (let i = 0; i < 10; i++) history(sender, 48);
  const result = await request(sender, start(member()));
  assert.equal(result.statusCode, 429);
  assert.match(result.payload.error, /10 pending outgoing/);
  assert.equal(state.threads.length, 10);
});

test('nine pending requests permit exactly one more; declined requests are not pending', async () => {
  const sender = member();
  for (let i = 0; i < 9; i++) history(sender, 48);
  history(sender, 48, { declined: true });
  assert.equal((await request(sender, start(member()))).statusCode, 200);
  assert.equal((await request(sender, start(member()))).statusCode, 429);
});

test('incoming requests, acceptance and replies do not consume outgoing quotas', async () => {
  const recipient = member(), sender = member();
  const created = await request(sender, start(recipient));
  assert.equal((await request(recipient, { action: 'thread.accept', id: created.payload.id })).statusCode, 200);
  assert.equal((await request(recipient, { action: 'message.send', id: created.payload.id, text: 'Reply' })).statusCode, 200);
  for (let i = 0; i < 5; i++) assert.equal((await request(recipient, start(member()))).statusCode, 200);
  assert.equal((await request(recipient, start(member()))).statusCode, 429);
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

test('concurrent first-contact attempts cannot exceed five; locking is transactional', async () => {
  const sender = member();
  const targets = Array.from({ length: 12 }, () => member());
  const results = await Promise.all(targets.map(target => request(sender, start(target))));
  assert.equal(results.filter(r => r.statusCode === 200).length, 5);
  assert.equal(results.filter(r => r.statusCode === 429).length, 7);
  assert.equal(state.threads.length, 5);
  assert.equal(state.messages.length, 5);
  assert.ok(state.transactionCalls.every(options => options?.isolationLevel === 'read committed'));
});

test('concurrent requests cannot exceed ten pending outgoing contacts', async () => {
  const sender = member();
  for (let i = 0; i < 9; i++) history(sender, 48);
  const targets = Array.from({ length: 6 }, () => member());
  const results = await Promise.all(targets.map(target => request(sender, start(target))));
  assert.equal(results.filter(r => r.statusCode === 200).length, 1);
  assert.equal(state.threads.length, 10);
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

test('missing, misattributed or future-dated historical initial notes fail closed', async () => {
  for (const kind of ['missing', 'sender', 'future']) {
    const sender = member();
    const old = history(sender);
    if (kind === 'missing') state.messages.splice(state.messages.indexOf(old.note), 1);
    if (kind === 'sender') old.note.senderId = old.other.id;
    if (kind === 'future') old.note.createdAt = new Date(state.clock.get('now') + hour);
    const before = state.threads.length;
    const result = await request(sender, start(member()));
    assert.equal(result.statusCode, 409);
    assert.match(result.payload.error, /history could not be verified/);
    assert.equal(state.threads.length, before);
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

test('consent is required; only recipient can accept; decline restrictions persist', async () => {
  const sender = member(), recipient = member(), outsider = member();
  const created = await request(sender, start(recipient));
  const id = created.payload.id;
  assert.equal((await request(sender, { action: 'message.send', id, text: 'Too soon' })).statusCode, 403);
  assert.equal((await request(recipient, { action: 'message.send', id, text: 'Too soon' })).statusCode, 403);
  assert.equal((await request(sender, { action: 'thread.accept', id })).statusCode, 403);
  assert.equal((await request(outsider, { action: 'thread.accept', id })).statusCode, 404);
  assert.equal((await request(recipient, { action: 'thread.decline', id })).statusCode, 200);
  assert.equal((await request(sender, start(recipient))).statusCode, 403);
  assert.equal((await request(sender, { action: 'message.send', id, text: 'Declined' })).statusCode, 403);
  assert.equal((await request(recipient, { action: 'thread.accept', id })).statusCode, 200);
  assert.equal((await request(sender, { action: 'message.send', id, text: 'Now accepted' })).statusCode, 200);
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

test('Business and Reels retain their subscription gate; ordinary messaging makes no billing calls', async () => {
  const sender = member(), target = member();
  assert.equal((await request(sender, start(target))).statusCode, 200);
  assert.deepEqual(state.paidCalls, []);
  for (let i = 0; i < 10; i++) {
    const follower = member({ referredBy: sender.id });
    state.follows.push({ followerId: follower.id, followingId: sender.id });
  }
  for (const kind of ['business', 'reel']) {
    assert.equal((await request(sender, { action: 'post.create', kind, text: 'Commercial post' })).statusCode, 402);
  }
  assert.deepEqual(state.paidCalls, [sender.id, sender.id]);
});

test('professional introductions remain on their separate paid handler; quota SQL is creation-based', () => {
  const professional = readFileSync(new URL('../src/routes/professional.ts', import.meta.url), 'utf8');
  const introduction = professional.slice(professional.indexOf('router.post("/professional/introductions"'));
  assert.ok(introduction.length > 0);
  assert.match(introduction.slice(0, introduction.indexOf('const parsed')), /if \(!who\.founder\) await requireMonthly/);
  const quota = readFileSync(new URL('../src/services/ordinaryMessaging.ts', import.meta.url), 'utf8');
  assert.match(quota, /ORDER BY \$\{messages\.id\} ASC LIMIT 1/);
  assert.match(quota, /clock_timestamp\(\)/);
  assert.doesNotMatch(quota, /threads\.updatedAt|requireMonthly|stripe|messages\.text/);
});

test('real Drizzle schemas compile lock and quota SQL with bound IDs and no message contents', async () => {
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
        b.onLoad({ filter: /.*/, namespace: 'sql-test' }, ({ path }) => ({
          loader: 'ts', resolveDir: services,
          contents: path === 'errors'
            ? 'export class NetworkError extends Error { constructor(public status: number, message: string) { super(message); } }'
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
  await assert.rejects(mod.startOrdinaryThread(1, 2, () => 'Initial note'), e => e.status === 429);
  assert.equal(mod.calls[0].isolationLevel, 'read committed');
  assert.deepEqual(mod.calls[1].params, [1, 2]);
  assert.match(mod.calls[1].sql, /ORDER BY "network_profiles"\."member_id" FOR UPDATE/);
  assert.deepEqual(mod.calls[2].params, [1]);
  assert.match(mod.calls[2].sql, /LEFT JOIN LATERAL/);
  assert.match(mod.calls[2].sql, /"network_messages"\."thread_id" = "network_threads"\."id"/);
  assert.doesNotMatch(mod.calls[2].sql, /"text"|"updated_at"/);
});
