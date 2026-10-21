type StartupEnvironment = Readonly<Record<string, string | undefined>>;

/**
 * This controls automatic payment bootstrap only, not payment routes or business
 * rules. A preview must opt in explicitly; deployments always keep bootstrap.
 * Pure function so the policy can be checked before loading/running the server.
 */
export function stripeStartupMode(env: StartupEnvironment): "initialize" | "preview-skip" {
  if (env.NODE_ENV === "production" || env.REPLIT_DEPLOYMENT === "1") {
    return "initialize";
  }

  const replitEditor = !!env.REPL_ID && !!env.REPLIT_DEV_DOMAIN && !env.REPLIT_DEPLOYMENT;
  // REPLIT_ENVIRONMENT is not a documented app deployment indicator. It can
  // coexist with editor markers; never use it to infer the database/deployment.
  if (env.TOMI_PREVIEW_SKIP_STRIPE_INIT === "1") {
    if (env.NODE_ENV !== "development" || !replitEditor) {
      throw new Error("Stripe preview safeguard requires NODE_ENV=development in the Replit editor; refusing startup.");
    }
    return "preview-skip";
  }
  if (replitEditor) {
    throw new Error("Replit preview requires TOMI_PREVIEW_SKIP_STRIPE_INIT=1; refusing startup before payment initialization.");
  }
  return "initialize";
}
