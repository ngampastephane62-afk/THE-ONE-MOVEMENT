import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { beforeEach, test } from 'node:test';
import { projection, profileRoutes } from './helpers/isolated-profile-routes.mjs';
import { network, member } from './helpers/isolated-network.mjs';

const plain = x => JSON.parse(JSON.stringify(x));
const displayKeys = [
  'id', 'fullName', 'profession', 'organization', 'country', 'bio', 'offering', 'lookingFor', 'website',
  'instagramUrl', 'facebookUrl', 'tiktokUrl', 'linkedinUrl', 'sectors', 'isPublic',
  'profileLayout', 'coverPosition', 'postsLayout',
].sort();
const forbidden = ['clerkId', 'savedItems', 'publicMedia', 'email', 'phone', 'stripeCustomerId', 'privateSentinel', 'createdAt', 'updatedAt'];
const row = (extra = {}) => ({
  id: 1, clerkId: 'fixture-owner', fullName: 'Chosen Name', profession: '', organization: '',
  country: 'Unconfirmed legacy country', bio: '', offering: '', lookingFor: '', website: '',
  instagramUrl: '', facebookUrl: '', tiktokUrl: '', linkedinUrl: '', sectors: ['art'],
  savedItems: ['resource:sdgs'], isPublic: true, publicMedia: true,
  profileLayout: 'immersive', coverPosition: 50, postsLayout: 'grid',
  email: 'private@fixture.invalid', phone: 'private phone', stripeCustomerId: 'private billing',
  privateSentinel: 'future private input must not propagate', createdAt: new Date(), updatedAt: new Date(),
  ...extra,
});
const details = {
  enabled: true, founder: false, suspended: false, avatarUrl: '/authorized-avatar', coverUrl: null,
  followers: 3, following: 2, followed: true, blocked: false,
  badges: [{ role: 'speaker', program: 'summit', expiresAt: null, privateSentinel: 'private evidence' }],
  privateSentinel: 'never spread arbitrary presentation input',
};
function assertFiltered(value) {
  for (const key of forbidden) assert.equal(Object.hasOwn(value, key), false, key);
  assert.equal(JSON.stringify(value).includes('privateSentinel'), false);
}
beforeEach(() => {
  for (const value of Object.values(network.state)) {
    if (Array.isArray(value)) value.length = 0;
    else value.clear();
  }
});

test('owner projection preserves every existing output field and only owner extras', () => {
  const input = row();
  const owner = projection.projectOwnerProfile(input);
  assert.deepEqual(Object.keys(owner).sort(), [...displayKeys, 'savedItems', 'publicMedia'].sort());
  assert.deepEqual(plain(owner.savedItems), input.savedItems);
  assert.equal(owner.publicMedia, true);
  for (const key of forbidden.filter(k => !['savedItems', 'publicMedia'].includes(k))) assert.equal(Object.hasOwn(owner, key), false);
  owner.savedItems.push('local');
  owner.sectors.push('music');
  assert.equal(input.savedItems.length, 1);
  assert.equal(input.sectors.length, 1);
});

test('public projection matches the existing allowlist, ignoring all extra row data', () => {
  const value = projection.projectPublicProfile(row());
  assert.deepEqual(Object.keys(value).sort(), displayKeys);
  assert.equal(value.country, 'Unconfirmed legacy country');
  assertFiltered(value);
});

test('network and public-network projections allowlist details and nested badges', () => {
  for (const fn of [projection.projectNetworkMember, projection.projectPublicNetworkProfile]) {
    const value = fn(row(), details);
    assert.deepEqual(Object.keys(value).sort(), [...displayKeys, ...Object.keys(details).filter(k => k !== 'privateSentinel')].sort());
    assertFiltered(value);
    assert.deepEqual(plain(value.badges), [{ role: 'speaker', program: 'summit', expiresAt: null }]);
    assert.equal(value.avatarUrl, '/authorized-avatar');
  }
});

test('owner endpoint denies anonymous access and scopes authenticated reads to Clerk', async () => {
  const routes = profileRoutes([row(), row({ id: 2, clerkId: 'other', fullName: 'Other Name' })]);
  assert.equal((await routes.request('get', '/member/profile')).statusCode, 401);
  const own = await routes.request('get', '/member/profile', { identity: 'fixture-owner' });
  assert.equal(own.payload.profile.fullName, 'Chosen Name');
  assert.deepEqual(plain(own.payload.profile.savedItems), ['resource:sdgs']);
  assert.equal((await routes.request('get', '/member/profile', { identity: 'missing' })).payload.profile, null);
  assert.equal(own.headers['Cache-Control'], 'no-store');
});

test('existing profile editing returns the owned confirmed shape and rejects unknown fields', async () => {
  const existing = row();
  const routes = profileRoutes([existing]);
  const { id, ...body } = plain(projection.projectPublicProfile(existing));
  const save = await routes.request('put', '/member/profile', {
    identity: 'fixture-owner', body: { ...body, fullName: '  Confirmed Name  ', publicMedia: false },
  });
  assert.equal(save.statusCode, 200);
  assert.equal(save.payload.profile.fullName, 'Confirmed Name');
  assert.equal(save.payload.profile.publicMedia, false);
  assert.deepEqual(plain(save.payload.profile.savedItems), ['resource:sdgs']);
  assert.equal(routes.operations[0].set.enabled, undefined);
  const bad = await routes.request('put', '/member/profile', {
    identity: 'fixture-owner', body: { ...body, clerkId: 'another owner' },
  });
  assert.equal(bad.statusCode, 400);
  assert.equal(routes.operations.length, 1);
});

test('public directory retains listing, suspension, activation and media rules', async () => {
  const rows = [row(), row({ id: 2, isPublic: false }), row({ id: 3 }), row({ id: 4 })];
  const routes = profileRoutes(rows, [
    { memberId: 1, enabled: true, suspended: false, avatarId: 'photo-1' },
    { memberId: 3, enabled: true, suspended: true },
    { memberId: 4, enabled: false, suspended: false, avatarId: 'photo-4' },
  ], [
    { id: 'photo-1', ownerId: 1, ready: true },
    { id: 'photo-4', ownerId: 4, ready: true },
  ]);
  const res = await routes.request('get', '/ecosystem/members');
  assert.equal(res.statusCode, 200, JSON.stringify(res.payload));
  assert.deepEqual(plain(res.payload.members.map(m => m.id)), [1, 4]);
  assert.equal(res.payload.members[0].avatarUrl, '/api/community/media/photo-1');
  assert.equal(res.payload.members[1].avatarUrl, null);
  for (const m of res.payload.members) assertFiltered(m);
  rows[0].publicMedia = false;
  assert.equal((await routes.request('get', '/ecosystem/members')).payload.members[0].avatarUrl, null);
});

test('public detail keeps private and suspended profiles unavailable; inactive public profiles remain supported', async () => {
  for (const { isPublic, suspended, enabled, expected } of [
    { isPublic: false, suspended: false, enabled: true, expected: 404 },
    { isPublic: true, suspended: true, enabled: true, expected: 404 },
    { isPublic: true, suspended: false, enabled: false, expected: 200 },
  ]) {
    const routes = profileRoutes([row({ isPublic })], [{ memberId: 1, suspended, enabled }]);
    const res = await routes.request('get', '/community/profiles/:id', { id: '1' });
    assert.equal(res.statusCode, expected, JSON.stringify(res.payload));
    if (expected === 200) { assertFiltered(res.payload.profile); assert.equal(res.payload.profile.avatarUrl, null); }
  }
});

test('public detail preserves opt-in, readiness and ownership checks for photos and cover', async () => {
  const m = row(), p = { memberId: 1, enabled: true, suspended: false, avatarId: 'a', coverId: 'c' };
  const uploads = [
    { id: 'a', ownerId: 1, ready: true }, { id: 'c', ownerId: 1, ready: true },
  ];
  const routes = profileRoutes([m], [p], uploads);
  const read = async () => {
    const res = await routes.request('get', '/community/profiles/:id', { id: '1' });
    assert.equal(res.statusCode, 200, JSON.stringify(res.payload));
    return res.payload.profile;
  };
  assert.equal((await read()).avatarUrl, '/api/community/media/a');
  assert.equal((await read()).coverUrl, '/api/community/media/c');
  m.publicMedia = false;
  assert.equal((await read()).avatarUrl, null);
  m.publicMedia = true; p.enabled = false;
  assert.equal((await read()).coverUrl, null);
  p.enabled = true;
  uploads[0].ready = false;
  uploads[1].ownerId = 2;
  assert.equal((await read()).avatarUrl, null);
  assert.equal((await read()).coverUrl, null);
});

test('network state filters all nested representations without introducing owner/admin private access', async () => {
  const owner = member(), other = member(), hidden = member({ suspended: true });
  Object.assign(owner.row, row({ id: owner.id, clerkId: owner.identity }));
  Object.assign(other.row, row({ id: other.id, clerkId: other.identity, isPublic: false }));
  network.state.posts.push({ id: 1, authorId: other.id, hidden: false, kind: 'post', text: 'Post', mediaIds: [], createdAt: new Date(), updatedAt: new Date() });
  network.state.comments.push({ id: 1, postId: 1, authorId: owner.id, text: 'Reply', createdAt: new Date() });
  network.state.threads.push({ id: 1, memberA: owner.id, memberB: other.id, requestedBy: owner.id, accepted: true, declined: false, updatedAt: new Date() });
  network.state.certifications.push({ id: 1, memberId: other.id, role: 'speaker', program: 'summit', status: 'approved', evidenceIds: [], createdAt: new Date(), expiresAt: null });
  const context = { member: owner.row, clerkId: owner.identity, founder: true };
  const state = await network.networkState(context, { person: other.id });
  for (const value of [
    state.me, state.person, ...state.members, state.posts[0].author,
    state.posts[0].comments[0].author, state.threads[0].other, state.certifications[0].member,
  ]) { assert.ok(value); assertFiltered(value); }
  assert.equal(state.person.isPublic, false, 'Existing network access does not require public listing');
  network.state.blocks.push({ blockerId: owner.id, blockedId: other.id });
  const blocked = await network.networkState({ ...context, founder: false }, { person: other.id });
  assert.equal(blocked.posts.length, 0);
  assert.equal(blocked.threads.length, 0);
  assert.equal(blocked.members.some(m => m.id === other.id || m.id === hidden.id), false);
  // Existing own-block profile is retained so the owner can unblock/report.
  assert.equal(blocked.person.blocked, true);
  assertFiltered(blocked.person);
});

test('response contracts never inherit from write input or from owner responses', () => {
  const spec = readFileSync(new URL('../../../lib/api-spec/openapi.yaml', import.meta.url), 'utf8');
  for (const name of ['PublicMember', 'NetworkMember', 'MemberProfile']) {
    // Limit to the next component, not the next indented property.
    const block = spec.match(new RegExp(`^    ${name}:\\n[\\s\\S]*?(?=^    [A-Za-z]|$(?![\\s\\S]))`, 'm'))?.[0];
    assert.ok(block, name);
    assert.doesNotMatch(block, /schemas\/MemberProfileInput|schemas\/PublicMember|schemas\/MemberProfile"/);
    assert.match(block, /schemas\/ProfileDisplayFields/);
  }
});
