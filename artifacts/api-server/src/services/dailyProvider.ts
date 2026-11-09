export class DailyProviderError extends Error {
  constructor(public status: number) { super("Daily could not complete this request safely. Please try again later."); }
}
const API = "https://api.daily.co/v1";
async function request(path: string, method = "GET", body?: unknown): Promise<Record<string, any>> {
  if (!process.env.DAILY_API_KEY) throw new DailyProviderError(503);
  let response: Response;
  try {
    response = await fetch(`${API}${path}`, {
      method, redirect: "error", signal: AbortSignal.timeout(10_000),
      headers: { Authorization: `Bearer ${process.env.DAILY_API_KEY}`, "Content-Type": "application/json" },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  } catch { throw new DailyProviderError(503); }
  // Never propagate response bodies, API keys or meeting tokens to server logs.
  if (!response.ok) throw new DailyProviderError(response.status === 429 ? 429 : 503);
  try {
    const result = await response.json();
    if (!result || typeof result !== "object" || Array.isArray(result)) throw Error();
    return result;
  } catch { throw new DailyProviderError(503); }
}
export async function dailyDomain() {
  const d = await request("/");
  if (typeof d.domain_id !== "string" || !d.domain_id || typeof d.domain_name !== "string" ||
      !/^[a-z0-9-]+$/.test(d.domain_name) || d.config?.intercom_auto_record === true) throw new DailyProviderError(503);
  return { id: d.domain_id as string, name: d.domain_name as string };
}
export async function dailyMeetings(month: string, now = Date.now()) {
  const start = Math.floor(new Date(`${month}-01T00:00:00Z`).getTime() / 1000);
  const result: { room: string; duration: number; maxParticipants: number }[] = [];
  let cursor: string | undefined;
  for (let page = 0; page < 5; page++) {
    const params = new URLSearchParams({ timeframe_start: String(start), timeframe_end: String(Math.floor(now / 1000)),
      limit: "100", no_participants: "true" });
    if (cursor) params.set("starting_after", cursor);
    const d = await request(`/meetings?${params}`);
    if (!Array.isArray(d.data) || !Number.isSafeInteger(d.total_count) || d.total_count < 0) throw new DailyProviderError(503);
    for (const m of d.data) {
      if (typeof m.room !== "string" || !Number.isFinite(m.duration) || m.duration < 0 ||
          !Number.isSafeInteger(m.max_participants) || m.max_participants < 0) throw new DailyProviderError(503);
      result.push({ room: m.room, duration: m.duration, maxParticipants: m.max_participants });
    }
    if (result.length >= d.total_count) return result;
    const next = d.data.at(-1)?.id;
    if (typeof next !== "string" || next === cursor || !d.data.length) throw new DailyProviderError(503);
    cursor = next;
  }
  throw new DailyProviderError(503); // Truncated analytics is not zero usage.
}
export function roomProperties(mode: string, expiry: Date) {
  return {
    exp: Math.floor(expiry.getTime() / 1000), eject_at_room_exp: true, max_participants: 2,
    enforce_unique_user_ids: true, start_video_off: true, start_audio_off: true,
    enable_prejoin_ui: true, enable_knocking: false, enable_chat: false, enable_screenshare: false,
    enable_recording: false, enable_live_captions_ui: false,
    enable_transcription_storage: false, enable_dialout: false,
    permissions: { canSend: mode === "audio" ? ["audio"] : ["audio", "video"], canAdmin: false },
  };
}
export async function createDailyRoom(name: string, mode: string, expiry: Date) {
  const d = await request("/rooms", "POST", { name, privacy: "private", properties: roomProperties(mode, expiry) });
  if (d.name !== name || d.privacy !== "private" || d.config?.eject_at_room_exp !== true ||
      d.config?.max_participants !== 2 || d.config?.exp !== Math.floor(expiry.getTime() / 1000)) throw new DailyProviderError(503);
}
export async function dailyToken(name: string, user: number, fullName: string, mode: string, expiry: Date) {
  const d = await request("/meeting-tokens", "POST", { properties: {
    room_name: name, user_id: `tomi-${user}`, user_name: fullName.slice(0, 100), is_owner: false,
    exp: Math.floor(expiry.getTime() / 1000), eject_at_token_exp: true,
    start_audio_off: true, start_video_off: true, enable_screenshare: false, enable_recording_ui: false,
    permissions: { canSend: mode === "audio" ? ["audio"] : ["audio", "video"], canAdmin: false },
  } });
  if (typeof d.token !== "string" || !d.token) throw new DailyProviderError(503);
  return d.token as string;
}
export async function ejectDailyRoom(name: string, users: number[]) {
  await request(`/rooms/${encodeURIComponent(name)}/eject`, "POST", { user_ids: users.map(id => `tomi-${id}`), ban: true });
}
