/** Explicit opt-in for this editor only; never enables test donations on a deployment. */
export function humanitarianTestAuthorized(env: Readonly<Record<string, string | undefined>>) {
  return env.TOMI_HUMANITARIAN_TEST_AUTHORIZED === "true"
    && env.NODE_ENV === "development"
    && !!env.REPL_ID && !!env.REPLIT_DEV_DOMAIN && !env.REPLIT_DEPLOYMENT;
}
