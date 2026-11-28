type Env = Readonly<Record<string, string | undefined>>;

/**
 * True on a production deployment: Replit sets REPLIT_DEPLOYMENT=1; other hosts
 * (e.g. Fly) declare APP_ENV=production explicitly.
 */
export function isProductionDeployment(env: Env = process.env) {
  return env.REPLIT_DEPLOYMENT === "1" || env.APP_ENV?.trim().toLowerCase() === "production";
}

/** Public host used for the Stripe managed webhook: Replit's first domain, else TOMI_PUBLIC_SITE_URL. */
export function publicWebhookHost(env: Env = process.env) {
  const replit = env.REPLIT_DOMAINS?.split(",")[0]?.trim();
  if (replit) return replit;
  try { return env.TOMI_PUBLIC_SITE_URL ? new URL(env.TOMI_PUBLIC_SITE_URL).host : undefined; }
  catch { return undefined; }
}
