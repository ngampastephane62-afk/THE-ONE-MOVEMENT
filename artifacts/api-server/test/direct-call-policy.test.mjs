import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
const bundled = await build({ entryPoints: ["src/services/callPolicy.ts"], bundle: true, write: false, format: "esm", platform: "node" });
const policy = await import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString("base64")}`);
const providerBundle = await build({ entryPoints: ["src/services/dailyProvider.ts"], bundle: true, write: false, format: "esm", platform: "node" });
const provider = await import(`data:text/javascript;base64,${Buffer.from(providerBundle.outputFiles[0].text).toString("base64")}`);

test("budget is USD 20 shared with an USD 18 admission threshold; no free allowance is assumed", () => {
  assert.equal(policy.CALL_LIMIT_MICRO_USD, 20_000_000);
  assert.equal(policy.CALL_ADMISSION_MICRO_USD, 18_000_000);
  assert.equal(policy.CALL_RESERVATION_MICRO_USD, 160_000);
  assert.equal(policy.admissionFits(0, 0, 0, 18_000_000), true);
  assert.equal(policy.admissionFits(17_840_000, 0, 0, 18_000_000), true);
  assert.equal(policy.admissionFits(17_840_001, 0, 0, 18_000_000), false);
  assert.equal(policy.admissionFits(0, 17_900_000, 0, 18_000_000), false);
  assert.equal(policy.admissionFits(0, 0, 17_900_000, 18_000_000), false);
  for (const n of [NaN, Infinity, -1, 1.3, Number.MAX_SAFE_INTEGER + 1]) {
    assert.equal(policy.admissionFits(0, 0, n, 18_000_000), false);
  }
});
test("calls expire in fifteen minutes, cannot cross the UTC budget month and stop near month-end", () => {
  const w = policy.callWindow(new Date("2026-11-10T10:00:00Z"));
  assert.equal(w.month, "2026-11");
  assert.equal(w.expires.toISOString(), "2026-11-10T10:15:00.000Z");
  assert.equal(w.ringExpires.toISOString(), "2026-11-10T10:00:45.000Z");
  assert.equal(policy.callWindow(new Date("2026-11-30T23:59:00Z")), null);
  assert.equal(policy.callWindow(new Date("2026-11-30T23:50:00Z")).expires.toISOString(), "2026-11-30T23:59:59.000Z");
});
test("production is closed even when the development flag or API key is present", () => {
  const env = { TOMI_DAILY_PILOT: "development", DAILY_API_KEY: "unit-placeholder" };
  assert.equal(policy.dailyPilotAllowed({ ...env, NODE_ENV: "development" }), true);
  assert.equal(policy.dailyPilotAllowed({ ...env, REPLIT_DEPLOYMENT: "1" }), false);
  assert.equal(policy.dailyPilotAllowed({ ...env, NODE_ENV: "production" }), false);
  assert.equal(policy.dailyPilotAllowed({ DAILY_API_KEY: "unit-placeholder" }), false);
  assert.equal(policy.dailyPilotAllowed({ TOMI_DAILY_PILOT: "development" }), false);
});
test("private room policy bounds participants, expenses and device consent", () => {
  const exp = new Date("2026-11-10T10:15:00Z");
  const room = provider.roomProperties("audio", exp);
  assert.equal(room.exp, Math.floor(exp.getTime() / 1000));
  assert.equal(room.eject_at_room_exp, true);
  assert.equal(room.max_participants, 2);
  assert.equal(room.enforce_unique_user_ids, true);
  assert.equal(room.start_video_off, true);
  assert.equal(room.start_audio_off, true);
  assert.equal(room.enable_recording, false);
  assert.equal(room.enable_dialout, false);
  assert.equal(room.enable_transcription_storage, false);
  assert.equal(room.enable_screenshare, false);
  assert.deepEqual(room.permissions, { canSend: ["audio"], canAdmin: false });
  assert.deepEqual(provider.roomProperties("video", exp).permissions.canSend, ["audio", "video"]);
});
test("provider failure or truncated analytics cannot turn into zero usage", async () => {
  const oldFetch = globalThis.fetch, key = process.env.DAILY_API_KEY;
  process.env.DAILY_API_KEY = "unit-placeholder";
  try {
    globalThis.fetch = async () => new Response("Unauthorized", { status: 401 });
    await assert.rejects(provider.dailyDomain(), provider.DailyProviderError);
    globalThis.fetch = async () => Response.json({ total_count: 2, data: [] });
    await assert.rejects(provider.dailyMeetings("2026-11"), provider.DailyProviderError);
    let pages = 0;
    globalThis.fetch = async () => Response.json(++pages === 1
      ? { total_count: 2, data: [{ id: "1", room: "fixture-a", duration: 12, max_participants: 2 }] }
      : { total_count: 2, data: [{ id: "2", room: "fixture-b", duration: 18, max_participants: 1 }] });
    assert.equal((await provider.dailyMeetings("2026-11")).length, 2);
  } finally { globalThis.fetch = oldFetch; if (key === undefined) delete process.env.DAILY_API_KEY; else process.env.DAILY_API_KEY = key; }
});
test("tokens are non-owner, scoped to one member and room, with provider-side ejection", async () => {
  const oldFetch = globalThis.fetch, key = process.env.DAILY_API_KEY;
  process.env.DAILY_API_KEY = "unit-placeholder";
  try {
    let sent;
    globalThis.fetch = async (_url, options) => { sent = JSON.parse(options.body); return Response.json({ token: "test-only-token" }); };
    const expiry = new Date("2026-11-10T10:15:00Z");
    assert.equal(await provider.dailyToken("fixture-room", 42, "Fixture", "audio", expiry), "test-only-token");
    assert.equal(sent.properties.room_name, "fixture-room");
    assert.equal(sent.properties.user_id, "tomi-42");
    assert.equal(sent.properties.is_owner, false);
    assert.equal(sent.properties.eject_at_token_exp, true);
    assert.equal(sent.properties.exp, expiry.getTime() / 1000);
    assert.deepEqual(sent.properties.permissions, { canSend: ["audio"], canAdmin: false });
    await provider.ejectDailyRoom("fixture-room", [42, 43]);
    assert.deepEqual(sent, { user_ids: ["tomi-42", "tomi-43"], ban: true });
  } finally { globalThis.fetch = oldFetch; if (key === undefined) delete process.env.DAILY_API_KEY; else process.env.DAILY_API_KEY = key; }
});
