/** Conservative USD estimates, not a representation of the provider's invoice. */
export const CALL_LIMIT_MICRO_USD = 20_000_000;
export const CALL_ADMISSION_MICRO_USD = 18_000_000;
export const CALL_RESERVATION_MICRO_USD = 160_000; // 40 participant-minutes at the video rate.
export const CALL_RATE_MICRO_USD = 4_000;
export const CALL_LIVE_STATUSES = ["ringing", "provisioning", "active", "uncertain"] as const;

export function callWindow(now = new Date()) {
  const month = now.toISOString().slice(0, 7);
  const monthEnd = Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1);
  const expires = new Date(Math.min(now.getTime() + 15 * 60_000, monthEnd - 1000));
  if (expires.getTime() - now.getTime() < 120_000) return null;
  return { month, now, expires, ringExpires: new Date(now.getTime() + 45_000) };
}
export function admissionFits(committed: number, reserved: number, observed: number, threshold: number) {
  if (![committed, reserved, observed, threshold].every(n => Number.isSafeInteger(n) && n >= 0)) return false;
  // Reservations cover not-yet-finalized calls; an observation can only tighten admission.
  return Math.max(committed, observed) + reserved + CALL_RESERVATION_MICRO_USD <= Math.min(threshold, CALL_ADMISSION_MICRO_USD);
}
export function dailyPilotAllowed(env: NodeJS.ProcessEnv = process.env) {
  return env.TOMI_DAILY_PILOT === "development" && env.REPLIT_DEPLOYMENT !== "1" &&
    env.NODE_ENV !== "production" && !!env.DAILY_API_KEY;
}
