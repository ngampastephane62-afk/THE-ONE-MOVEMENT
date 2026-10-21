import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import { build, transformSync } from 'esbuild';

// Execute the actual route handlers, projections and generated validators.
// No Express listener, DB connection, Clerk client, storage SDK or billing import.
const root = fileURLToPath(new URL('../../', import.meta.url));
const validation = await build({
  stdin: { contents: 'export { SaveMemberProfileBody, ToggleMemberSavedItemBody } from "@workspace/api-zod";', resolveDir: root },
  bundle: true, write: false, platform: 'node', format: 'esm',
});
const validators = await import(`data:text/javascript;base64,${Buffer.from(validation.outputFiles[0].text).toString('base64')}`);
export const projection = load(`${root}/src/services/profileProjection.ts`, {});
function load(path, dependencies) {
  const output = transformSync(readFileSync(path, 'utf8'), { loader: 'ts', format: 'cjs' }).code;
  const module = { exports: {} };
  runInNewContext(output, {
    module, exports: module.exports, URL, Date,
    require(id) { assert.ok(id in dependencies, `Unexpected import forbidden: ${id}`); return dependencies[id]; },
  }, { filename: path });
  return module.exports;
}

export function profileRoutes(memberRows, profileRows = [], uploadRows = []) {
  const tables = {};
  const table = (name, rows) => tables[name] = new Proxy({ rows, name }, {
    get: (target, key) => key in target ? target[key] : { table: name, key },
  });
  const members = table('members', memberRows), profiles = table('profiles', profileRows);
  const uploads = table('uploads', uploadRows);
  const follows = table('follows', []), certificates = table('certificates', []);
  const value = (x, c) => x?.rows ? c[x.name] : x?.table ? c[x.table]?.[x.key] : x;
  const eq = (a, b) => c => value(a, c) === value(b, c);
  const and = (...args) => c => args.every(p => !p || p(c));
  const or = (...args) => c => args.some(p => p(c));
  const operations = [];
  const db = {
    select(fields) { return { from(t) {
      let contexts = t.rows.map(row => ({ [t.name]: row })), maximum = Infinity;
      const query = {
        leftJoin(other, condition) {
          contexts = contexts.flatMap(c => {
            const matches = other.rows.map(r => ({ ...c, [other.name]: r })).filter(condition);
            return matches.length ? matches : [{ ...c, [other.name]: null }];
          }); return query;
        },
        where(condition) { if (condition) contexts = contexts.filter(condition); return query; },
        orderBy() { return query; },
        limit(n) { maximum = n; return query; },
        then(resolve, reject) {
          const rows = contexts.slice(0, maximum).map(c => fields
            ? Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, value(v, c)])) : c[t.name]);
          return Promise.resolve(rows).then(resolve, reject);
        },
      };
      return query;
    } }; },
    insert(t) { return { values(data) {
      return { onConflictDoUpdate({ set }) {
        const row = t.rows.find(r => r.clerkId === data.clerkId);
        assert.ok(row, 'Fixture only updates an existing owned profile');
        operations.push({ data, set });
        Object.assign(row, set);
        return { returning: async () => [row] };
      } };
    } }; },
  };
  const routes = new Map();
  function Router() {
    const router = {};
    for (const method of ['get', 'put', 'post', 'use']) router[method] = (path, ...handlers) => {
      routes.set(`${method} ${path}`, handlers); return router;
    };
    return router;
  }
  class NetworkError extends Error { constructor(status, message) { super(message); this.status = status; } }
  const forbid = () => { throw Error('Runtime service forbidden'); };
  const noop = () => {};
  const deps = {
    express: { Router },
    '@clerk/express': { getAuth: req => ({ userId: req.identity }) },
    '@workspace/db': {
      db, ecosystemMembersTable: members, networkProfiles: profiles, networkUploads: uploads,
      networkFollows: follows, networkCertifications: certificates, networkPosts: {},
    },
    '@workspace/api-zod': validators,
    'drizzle-orm': {
      eq, and, or, isNull: x => c => value(x, c) == null,
      desc: x => x, sql: () => 0,
    },
    '@workspace/shared': { SOCIAL_PROFILES: [], normalizeSocialProfile: forbid },
    '../middlewares/clerkProxyMiddleware': { getClerkProxyHost: () => 'fixture.invalid' },
    '../services/profileProjection': projection,
    '../services/networkAuth': { NetworkError, networkAuth: noop, networkEnabled: noop, networkWrite: noop, actor: forbid },
    '../services/networkActions': { networkAction: forbid },
    '../services/networkState': { activeBadge: () => false, networkState: forbid, visibleMember: forbid },
    '../services/networkFiles': { requestUpload: forbid, objectFile: forbid },
    '../services/mediaIsolation': load(`${root}/src/services/mediaIsolation.ts`, {}),
    '../services/networkPayments': { DOCUMENTS: [], paymentStatus: forbid },
  };
  load(`${root}/src/routes/member.ts`, deps);
  load(`${root}/src/routes/network.ts`, deps);
  async function request(method, path, { identity, body, id } = {}) {
    const req = {
      identity, body, params: { id },
      get: name => ({ origin: 'https://fixture.invalid', 'sec-fetch-site': 'same-origin' })[name],
    };
    const res = {
      statusCode: 200, headers: {}, payload: null, locals: {},
      set(key, v) { typeof key === 'string' ? this.headers[key] = v : Object.assign(this.headers, key); return this; },
      status(code) { this.statusCode = code; return this; },
      json(payload) { this.payload = payload; return this; },
    };
    try {
      for (const handler of routes.get(`${method} ${path}`) ?? []) {
        let next = false;
        await handler(req, res, () => { next = true; });
        if (!next) break;
      }
    } catch (e) { res.statusCode = e.status ?? 500; res.payload = { error: e.message }; }
    return res;
  }
  return { request, operations };
}
