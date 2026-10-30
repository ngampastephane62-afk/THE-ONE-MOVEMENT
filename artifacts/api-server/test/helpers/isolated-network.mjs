import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

// Real auth, write guards, action handler and network state; no app/router startup.
// All identity, database and billing boundaries are replaced before module import.
const root = fileURLToPath(new URL('../../', import.meta.url));
const services = `${root}/src/services`;
const fixtures = `
export const state = {
  members: [], profiles: [], posts: [], follows: [], blocks: [], uploads: [],
  comments: [], likes: [], views: [], threads: [], messages: [], certifications: [],
  reports: [], audit: [], identities: new Map(), paid: new Set(), paidCalls: [],
  clock: new Map(), failures: new Set(), transactionCalls: [],
};
function table(name) {
  return new Proxy({ table: name }, { get: (obj, key) =>
    key === "table" ? name : { table: name, key } });
}
export const ecosystemMembersTable = table("members"), networkProfiles = table("profiles"),
  networkPosts = table("posts"), networkFollows = table("follows"),
  networkBlocks = table("blocks"), networkUploads = table("uploads"),
  networkComments = table("comments"), networkLikes = table("likes"),
  networkViews = table("views"), networkThreads = table("threads"),
  networkMessages = table("messages"), networkCertifications = table("certifications"),
  networkReports = table("reports"), networkAudit = table("audit");
function value(column, context) {
  return column && typeof column === "object" && column.table
    ? Object.hasOwn(column, "key") ? context[column.table]?.[column.key] : context[column.table] : column;
}
export const eq = (a, b) => c => value(a, c) === value(b, c);
export const ne = (a, b) => c => value(a, c) !== value(b, c);
export const lt = (a, b) => c => value(a, c) < value(b, c);
export const inArray = (a, list) => c => list.includes(value(a, c));
export const isNull = a => c => value(a, c) == null;
export const and = (...args) => c => args.filter(Boolean).every(p => p(c));
export const or = (...args) => c => args.filter(Boolean).some(p => p(c));
export const sql = (strings, ...values) => {
  const expression = strings.join(" ");
  if (/coalesce/i.test(expression))
    return c => value(values[0], c) ?? value(values[1], c);
  if (/^exists/i.test(expression.trim())) return c => {
    const source = values[0].table;
    return state[source].some(row => {
      const context = { ...c, [source]: row };
      if (source === "posts")
        return value(values[1], context) === value(values[2], context) && value(values[3], context) === false;
      return (value(values[1], context) === value(values[2], context) && value(values[3], context) === value(values[4], context)) ||
        (value(values[5], context) === value(values[6], context) && value(values[7], context) === value(values[8], context));
    });
  };
  return { count: true, strings: expression, values };
};
export const desc = column => column;
const rowLocks = new Map();
function mutation(execute) {
  let result;
  const run = () => result ??= execute();
  return {
    then: (resolve, reject) => Promise.resolve().then(run).then(resolve, reject),
    returning: () => Promise.resolve().then(run),
  };
}
export const db = {
  select: projection => ({ from: table => {
    let contexts = state[table.table].map(row => ({ [table.table]: row }));
    let limit = Infinity;
    const query = {
      innerJoin(other, condition) {
        contexts = contexts.flatMap(c => state[other.table]
          .map(row => ({ ...c, [other.table]: row })).filter(condition));
        return query;
      },
      where(condition) { if (condition) contexts = contexts.filter(condition); return query; },
      orderBy() { return query; },
      limit(n) { limit = n; return query; },
      then(resolve, reject) {
        const rows = projection?.value?.count ? [{ value: contexts.length }]
          : contexts.slice(0, limit).map(c => projection
            ? Object.fromEntries(Object.entries(projection).map(([k, v]) => [k, value(v, c)]))
            : c[table.table]);
        return Promise.resolve(rows).then(resolve, reject);
      },
    };
    return query;
  } }),
  insert(table) { const undo = this.undo; return { values: values => {
    const execute = conflict => {
      if (state.failures.has(table.table + ".insert")) throw Error("Isolated insert failure");
      const rows = state[table.table];
      const existing = rows.find(row => table.table === "profiles"
        ? row.memberId === values.memberId : table.table === "members"
        ? row.clerkId === values.clerkId : table.table === "follows"
        ? row.followerId === values.followerId && row.followingId === values.followingId
        : table.table === "threads" ? row.memberA === values.memberA && row.memberB === values.memberB
        : table.table === "blocks" ? row.blockerId === values.blockerId && row.blockedId === values.blockedId
        : false);
      if (existing) { if (conflict?.set) Object.assign(existing, conflict.set); return []; }
      const now = new Date(state.clock.get("now") ?? Date.now());
      const row = { id: rows.length + 1, hidden: false, accepted: false, declined: false, createdAt: now, updatedAt: now, ...values };
      if (row.createdAt?.strings?.includes("clock_timestamp()")) row.createdAt = now;
      rows.push(row);
      undo?.push(() => { const index = rows.indexOf(row); if (index >= 0) rows.splice(index, 1); });
      return [row];
    };
    return Object.assign(mutation(() => execute()), {
      onConflictDoNothing: () => mutation(() => execute()),
      onConflictDoUpdate: conflict => mutation(() => execute(conflict)),
    });
  } }; },
  update: table => ({ set: changes => ({ where: condition => mutation(() => {
    const rows = state[table.table].filter(row => condition({ [table.table]: row }));
    rows.forEach(row => Object.assign(row, changes));
    return rows;
  }) }) }),
  delete: table => ({ where: condition => mutation(() => {
    state[table.table] = state[table.table].filter(row => !condition({ [table.table]: row }));
    return [];
  }) }),
  transaction: async (run, options) => {
    state.transactionCalls.push(options);
    const releases = [], undo = [];
    const tx = { ...db, undo, execute: async query => {
      const ids = query.values.filter(value => typeof value === "number");
      if (query.strings.includes("FOR UPDATE")) {
        for (const id of [...new Set(ids)].sort((a, b) => a - b)) {
          const previous = rowLocks.get(id) ?? Promise.resolve();
          let release;
          const current = new Promise(resolve => { release = resolve; });
          rowLocks.set(id, current);
          await previous;
          releases.push(() => { release(); if (rowLocks.get(id) === current) rowLocks.delete(id); });
        }
        return { rows: state.profiles.filter(p => ids.includes(p.memberId)).map(p => ({ member_id: p.memberId })) };
      }
      if (!query.strings.includes("LEFT JOIN LATERAL")) throw Error("Unexpected SQL in isolated fixture");
      const self = ids.at(-1), now = state.clock.get("now") ?? Date.now();
      let recent = 0, pending = 0, invalid = 0;
      for (const thread of state.threads.filter(t => t.requestedBy === self)) {
        const first = state.messages.filter(m => m.threadId === thread.id).sort((a, b) => a.id - b.id)[0];
        const at = first?.createdAt?.getTime();
        if (!first || first.senderId !== self || !Number.isFinite(at) || at > now) invalid++;
        if (at > now - 24 * 60 * 60 * 1000) recent++;
        if (!thread.accepted && !thread.declined) pending++;
      }
      return { rows: [{ recent, pending, invalid }] };
    } };
    try { return await run(tx); }
    catch (error) { for (const revert of undo.reverse()) revert(); throw error; }
    finally { for (const release of releases.reverse()) release(); }
  },
};
export const getAuth = req => ({ userId: req.identity ?? null });
export const clerkClient = { users: { getUser: async id => {
  const identity = state.identities.get(id);
  if (!identity) throw Error("Unknown isolated identity");
  return {
    firstName: "Isolated", lastName: "Member", createdAt: Date.now(),
    primaryEmailAddressId: "primary",
    emailAddresses: [{ id: "primary", emailAddress: id + "@fixture.invalid",
      verification: { status: identity.verified === false ? "unverified" : "verified" } }],
  };
} } };
`;
const output = await build({
  stdin: {
    contents: `
      export { networkAuth, networkEnabled, networkWrite } from "./src/services/networkAuth";
      export { networkAction } from "./src/services/networkActions";
      export { networkState, visibleMember, qualifiedInviteCount } from "./src/services/networkState";
      export { state } from "@workspace/db";
    `,
    resolveDir: root,
  },
  bundle: true, write: false, platform: 'node', format: 'esm',
  define: { 'process.env.TOMI_FOUNDER_EMAIL': '""' },
  plugins: [{
    name: 'isolated-network-no-services',
    setup(b) {
      b.onResolve({ filter: /^@workspace\/db$|^@clerk\/express$|^drizzle-orm$/ },
        () => ({ path: 'fixtures', namespace: 'isolated' }));
      b.onResolve({ filter: /\/(clerkProxyMiddleware|networkFiles|networkPayments|monthlyMembership)$/ },
        ({ path }) => ({ path: path.split('/').at(-1), namespace: 'isolated' }));
      b.onLoad({ filter: /.*/, namespace: 'isolated' }, ({ path }) => {
        let contents;
        if (path === 'fixtures') contents = fixtures;
        else if (path === 'clerkProxyMiddleware') {
          contents = 'export const getClerkProxyHost = req => req.get("host");';
        } else if (path === 'networkFiles') {
          const source = readFileSync(`${services}/networkFiles.ts`, 'utf8');
          // Only the real DB-only media ownership/DTO functions; exclude cloud SDK.
          contents = `import { db, networkUploads as uploads } from "@workspace/db";
            import { eq, and, inArray } from "drizzle-orm";
            import { NetworkError } from "./networkAuth";
            import { isCampaignPath, isReservedMediaPath } from "./mediaIsolation";
            ${source.slice(source.indexOf('export async function ownedMedia'))}
            export const completeUpload = () => { throw Error("Storage is forbidden"); };`;
        } else if (path === 'monthlyMembership') {
          contents = `import { state } from "@workspace/db";
            import { NetworkError } from "./networkAuth";
            export async function requireMonthly(id) {
              state.paidCalls.push(id);
              if (!state.paid.has(id)) throw new NetworkError(402, "Subscription required");
            }`;
        } else if (path === 'networkPayments') {
          contents = `export const DOCUMENTS = [], PACKAGE_DEFINITIONS = [], customPackages = [], stripeReady = false;
            export async function catalog() { return []; }
            export const checkout = () => { throw Error("Payments are forbidden"); };`;
        } else throw Error(`Unexpected isolated import: ${path}`);
        return { contents, loader: 'ts', resolveDir: services };
      });
    },
  }],
});
export const network = await import(
  `data:text/javascript;base64,${Buffer.from(`${output.outputFiles[0].text}\n//# sourceURL=isolated-network-fixture.mjs`).toString('base64')}`
);

let identitySequence = 0;
export function member(options = {}) {
  const { state } = network;
  const id = state.members.length + 1;
  const identity = `isolated-${++identitySequence}`;
  const row = { id, clerkId: identity, fullName: 'Isolated Member', sectors: [],
    isPublic: false, publicMedia: false };
  state.members.push(row);
  state.profiles.push({ memberId: id, enabled: true, suspended: false, founder: false,
    inviteCode: `00000000-0000-4000-8000-${String(id).padStart(12, '0')}`,
    createdAt: new Date(Date.now() - 60_000), referredBy: null, ...options });
  state.identities.set(identity, options);
  return { id, identity, row, profile: state.profiles.at(-1) };
}

export async function request(who, body, headers = {}) {
  const req = {
    identity: who?.identity, body,
    get: name => ({ origin: 'https://fixture.invalid', host: 'fixture.invalid', ...headers })[name],
  };
  const res = { locals: {}, statusCode: 200, payload: undefined,
    set() { return this; }, status(code) { this.statusCode = code; return this; },
    json(payload) { this.payload = payload; return this; } };
  try {
    for (const middleware of [network.networkAuth, network.networkEnabled, network.networkWrite]) {
      let next = false;
      await middleware(req, res, () => { next = true; });
      if (!next) return res;
    }
    res.payload = await network.networkAction(req, res);
  } catch (error) {
    if (!error.status) throw error;
    res.statusCode = error.status;
    res.payload = { error: error.message };
  }
  return res;
}
