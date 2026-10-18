import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { readFileSync } from 'node:fs';
import { network, member, request } from './helpers/isolated-network.mjs';

const { state, networkState, qualifiedInviteCount } = network;
const post = { action: 'post.create', kind: 'post', text: 'A community contribution' };
const context = who => ({ member: who.row, clerkId: who.identity, founder: false });
beforeEach(() => {
  for (const value of Object.values(state)) {
    if (Array.isArray(value)) value.length = 0;
    else value.clear();
  }
});

test('zero invitations and no subscription allow an ordinary post and its edit', async () => {
  const who = member();
  assert.equal(await qualifiedInviteCount(who.id), 0);
  const response = await request(who, post);
  assert.equal(response.statusCode, 200);
  assert.equal(state.posts[0].authorId, who.id);
  const edited = await request(who, { ...post, action: 'post.edit', id: response.payload.id, text: 'Updated contribution' });
  assert.equal(edited.statusCode, 200);
  assert.equal(state.posts[0].text, 'Updated contribution');
  assert.deepEqual(state.paidCalls, []);
  assert.equal(state.paid.size, 0);
});

test('default ordinary post kind also publishes with zero invitations', async () => {
  const who = member();
  assert.equal((await request(who, { action: 'post.create', text: 'Ordinary update' })).statusCode, 200);
  assert.equal(state.posts[0].kind, 'post');
});

test('real network state opens the composer at zero and retains the referral counter', async () => {
  const who = member();
  const result = await networkState(context(who), {});
  assert.deepEqual(result.growth, {
    inviteCode: who.profile.inviteCode, qualifiedInvites: 0, requiredInvites: 0, canPost: true,
  });
  who.profile.enabled = false;
  assert.equal((await networkState(context(who), {})).growth.canPost, false);
});

test('anonymous, unverified and inactive members remain unable to publish', async () => {
  assert.equal((await request(null, post)).statusCode, 401);
  assert.equal((await request(member({ verified: false }), post)).statusCode, 403);
  const inactive = member({ enabled: false });
  assert.equal((await request(inactive, post)).statusCode, 409);
  assert.equal(inactive.profile.enabled, false);
  assert.equal(state.posts.length, 0);
});

test('explicit activation is still required and publishing preserves visibility choices', async () => {
  const who = member({ enabled: false });
  assert.equal((await request(who, { action: 'join', accepted: true })).statusCode, 200);
  const before = structuredClone(who.row);
  assert.equal((await request(who, post)).statusCode, 200);
  assert.deepEqual(who.row, before);
  assert.equal(who.row.isPublic, false);
  assert.equal(who.row.publicMedia, false);
});

test('suspended members remain restricted without changing suspension', async () => {
  const who = member({ suspended: true });
  assert.equal((await request(who, post)).statusCode, 403);
  assert.equal(who.profile.suspended, true);
  assert.equal(state.posts.length, 0);
});

test('a member cannot edit another member publication or spoof its owner', async () => {
  const owner = member();
  const other = member();
  const created = await request(owner, post);
  assert.equal((await request(other, { ...post, action: 'post.edit', id: created.payload.id })).statusCode, 404);
  assert.equal((await request(other, { ...post, memberId: owner.id })).statusCode, 400);
  assert.equal(state.posts[0].authorId, owner.id);
});

test('empty, oversized and unknown publication kinds remain rejected', async () => {
  const who = member();
  for (const body of [
    { ...post, text: '' }, { ...post, text: 'x'.repeat(5001) }, { ...post, kind: 'unknown' },
  ]) assert.equal((await request(who, body)).statusCode, 400);
  assert.equal(state.posts.length, 0);
});

test('real media ownership checks reject foreign and unfinished uploads', async () => {
  const who = member();
  const other = member();
  const mediaId = '11111111-1111-4111-8111-111111111111';
  state.uploads.push({ id: mediaId, ownerId: other.id, ready: true, contentType: 'image/png' });
  assert.equal((await request(who, { ...post, mediaIds: [mediaId] })).statusCode, 400);
  Object.assign(state.uploads[0], { ownerId: who.id, ready: false });
  assert.equal((await request(who, { ...post, mediaIds: [mediaId] })).statusCode, 400);
  state.uploads[0].ready = true;
  assert.equal((await request(who, { ...post, mediaIds: [mediaId] })).statusCode, 200);
});

test('cross-origin requests and the existing mutation rate limit remain enforced', async () => {
  const who = member();
  assert.equal((await request(who, post, { origin: 'https://other.invalid' })).statusCode, 403);
  for (let i = 0; i < 120; i++) assert.equal((await request(who, post)).statusCode, 200);
  assert.equal((await request(who, post)).statusCode, 429);
  assert.equal(state.posts.length, 120);
});

async function referrals(who, count) {
  for (let i = 0; i < count; i++) {
    const invited = member();
    const response = await request(invited, {
      action: 'referral.claim', accepted: true, kind: who.profile.inviteCode,
    });
    assert.equal(response.statusCode, 200);
  }
}

test('voluntary invitations still credit real claim/follow records exactly once', async () => {
  const who = member();
  const invited = member();
  const claim = { action: 'referral.claim', accepted: true, kind: who.profile.inviteCode };
  assert.equal((await request(invited, claim)).statusCode, 200);
  assert.equal(invited.profile.referredBy, who.id);
  assert.equal(state.follows.length, 1);
  assert.equal(await qualifiedInviteCount(who.id), 1);
  assert.equal((await request(invited, claim)).statusCode, 409);
  const records = structuredClone({ profiles: state.profiles, follows: state.follows });
  assert.equal((await request(who, post)).statusCode, 200);
  assert.deepEqual({ profiles: state.profiles, follows: state.follows }, records);
  invited.profile.suspended = true;
  assert.equal(await qualifiedInviteCount(who.id), 0);
  invited.profile.suspended = false;
  state.follows.length = 0;
  assert.equal(await qualifiedInviteCount(who.id), 0);
});

test('blocked members cannot claim referrals or view the blocked member posts', async () => {
  const who = member();
  const other = member();
  await request(other, post);
  state.blocks.push({ blockerId: who.id, blockedId: other.id });
  assert.equal((await request(who, {
    action: 'referral.claim', accepted: true, kind: other.profile.inviteCode,
  })).statusCode, 403);
  const result = await networkState(context(who), {});
  assert.equal(result.posts.length, 0);
  assert.equal(result.members.some(m => m.id === other.id), false);
});

test('specialized Business/Reels keep both referral and subscription access controls', async () => {
  const who = member();
  state.paid.add(who.id);
  for (const kind of ['business', 'reel']) {
    assert.equal((await request(who, { ...post, kind })).statusCode, 403);
  }
  await referrals(who, 10);
  state.paid.delete(who.id);
  for (const kind of ['business', 'reel']) {
    assert.equal((await request(who, { ...post, kind })).statusCode, 402);
  }
  state.paid.add(who.id);
  assert.equal((await request(who, { ...post, kind: 'business' })).statusCode, 200);
  assert.equal((await request(who, { ...post, kind: 'reel' })).statusCode, 400);
  const mediaId = '22222222-2222-4222-8222-222222222222';
  state.uploads.push({ id: mediaId, ownerId: who.id, ready: true, contentType: 'video/mp4' });
  assert.equal((await request(who, { ...post, kind: 'reel', mediaIds: [mediaId] })).statusCode, 200);
});

test('moderation remains Founder-only and hidden posts stay out of the feed', async () => {
  const who = member();
  const created = await request(who, post);
  assert.equal((await request(who, {
    action: 'moderate.post', id: created.payload.id, accepted: true, text: 'Attempted moderation',
  })).statusCode, 403);
  state.posts[0].hidden = true;
  assert.equal((await networkState(context(who), {})).posts.length, 0);
});

test('invitation UI no longer uses a ten-person target to gate ordinary publication', () => {
  const read = path => readFileSync(new URL(`../../web/src/${path}`, import.meta.url), 'utf8');
  const invitation = read('components/network/InvitationProgress.tsx');
  assert.doesNotMatch(invitation, /requiredInvites \|\| 10|needed before you can post|Posting opens once 10/);
  assert.match(invitation, /No invitations are required/);
  assert.match(invitation, /growth\.qualifiedInvites/);
  assert.match(invitation, /button-copy-invite/);
  assert.match(read('pages/member/Membership.tsx'), /Ordinary posts are free after explicit network activation/);
  assert.match(read('pages/member/Ecosystem.tsx'), /sans invitation obligatoire/);
});
