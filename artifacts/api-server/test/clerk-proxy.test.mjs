import assert from 'node:assert/strict';
import { createServer, request } from 'node:http';
import { once } from 'node:events';
import { gzipSync } from 'node:zlib';
import { test } from 'node:test';
import express from 'express';
import { CLERK_PROXY_PATH, createClerkProxy, getClerkProxyHost } from '../src/middlewares/clerkProxyMiddleware.ts';

// Only loopback servers and a synthetic key are used. No Clerk, email, Stripe,
// database, or environment-secret operations occur in these regression tests.
const TEST_KEY = 'test-only-not-a-real-key';
const payload = Buffer.from('{"ok":true}');
const compressed = gzipSync(payload);

async function listen(server, t) {
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise((resolve) => {
    server.close(resolve);
    server.closeAllConnections();
  }));
  return `http://127.0.0.1:${server.address().port}`;
}

function send(url, { method = 'GET', headers = {}, body } = {}) {
  return new Promise((resolve, reject) => {
    const req = request(url, { method, headers }, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve({
        status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks),
      }));
      res.on('error', reject);
    });
    req.on('error', reject);
    req.setTimeout(5000, () => req.destroy(new Error('Proxy request timed out')));
    req.end(body);
  });
}

test('public hostname selection preserves custom-domain and forwarded-host behavior', () => {
  assert.equal(getClerkProxyHost({ headers: { 'x-forwarded-host': 'public.example, edge.internal', host: 'internal' } }), 'public.example');
  assert.equal(getClerkProxyHost({ headers: { 'x-forwarded-host': ['public.example', 'edge.internal'] } }), 'public.example');
  assert.equal(getClerkProxyHost({ headers: { host: 'public.example' } }), 'public.example');
});

test('Clerk proxy retains production request, response, and failure behavior', async (t) => {
  const upstream = createServer(async (req, res) => {
    if (req.url === '/drop') {
      req.socket.destroy();
      return;
    }
    if (req.url === '/compressed') {
      res.writeHead(200, { 'content-encoding': 'gzip', 'content-type': 'application/json' });
      res.write(compressed.subarray(0, 5));
      res.end(compressed.subarray(5));
      return;
    }
    if (req.url === '/asset') {
      res.writeHead(200, { 'content-length': payload.length });
      res.end(payload);
      return;
    }
    if (req.url === '/empty') {
      res.writeHead(204);
      res.end();
      return;
    }
    if (req.method === 'HEAD') {
      res.writeHead(200, { 'content-length': payload.length });
      res.end();
      return;
    }
    if (req.url === '/oauth_callback') {
      res.writeHead(303, {
        location: '/member',
        'set-cookie': ['first=one; HttpOnly; Secure', 'second=two; HttpOnly; Secure'],
      });
      res.end();
      return;
    }
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({
      url: req.url, method: req.method, body: Buffer.concat(chunks).toString(),
      proxyUrl: req.headers['clerk-proxy-url'],
      keyMatches: req.headers['clerk-secret-key'] === TEST_KEY,
      ip: req.headers['x-forwarded-for'],
      contentType: req.headers['content-type'],
    }));
  });
  const target = await listen(upstream, t);
  const app = express();
  app.use(CLERK_PROXY_PATH, createClerkProxy({ target, secretKey: TEST_KEY }));
  app.use(express.json());
  const base = `${await listen(createServer(app), t)}${CLERK_PROXY_PATH}`;

  const response = await send(`${base}/v1/client?test=one%20two`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-host': 'public.example, edge.internal',
      'x-forwarded-proto': 'https',
      'x-forwarded-for': '192.0.2.1, 192.0.2.2',
    },
    body: '{"raw":"preserved"}',
  });
  assert.equal(response.status, 200);
  assert.deepEqual(JSON.parse(response.body), {
    url: '/v1/client?test=one%20two', method: 'POST', body: '{"raw":"preserved"}',
    proxyUrl: `https://public.example${CLERK_PROXY_PATH}`,
    keyMatches: true, ip: '192.0.2.1', contentType: 'application/json',
  });
  assert.equal(response.headers['clerk-secret-key'], undefined);
  assert.equal(response.headers['transfer-encoding'], undefined);
  assert.equal(Number(response.headers['content-length']), response.body.length);

  const asset = await send(`${base}/asset`);
  assert.deepEqual(asset.body, payload);
  assert.equal(Number(asset.headers['content-length']), payload.length);

  const gzip = await send(`${base}/compressed`);
  assert.deepEqual(gzip.body, compressed);
  assert.equal(gzip.headers['content-encoding'], 'gzip');
  assert.equal(gzip.headers['transfer-encoding'], undefined);
  assert.equal(Number(gzip.headers['content-length']), compressed.length);

  const empty = await send(`${base}/empty`);
  assert.equal(empty.status, 204);
  assert.equal(empty.body.length, 0);
  assert.equal(empty.headers['content-length'], undefined);

  const head = await send(`${base}/asset`, { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.equal(head.body.length, 0);
  assert.equal(Number(head.headers['content-length']), payload.length);

  const redirect = await send(`${base}/oauth_callback`);
  assert.equal(redirect.status, 303);
  assert.equal(redirect.headers.location, '/member');
  assert.equal(redirect.headers['set-cookie'].length, 2);

  const dropped = await send(`${base}/drop`);
  assert.equal(dropped.status, 502);
  assert.equal(dropped.body.length, 0);
  assert.equal(dropped.headers['content-length'], '0');
  assert.equal((await send(`${base}/asset`)).status, 200, 'upstream failure must not crash the proxy');
});
