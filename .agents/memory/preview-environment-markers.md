---
name: Preview environment indicators
description: Avoid false production classifications when authorizing a safe API preview startup.
---

Do not infer an application's deployment or database environment from
`REPLIT_ENVIRONMENT`. Although platform-managed, it is not documented as the
application deployment indicator and can coexist with editor markers.

**Why:** Treating its `production` label as authoritative falsely blocked the
authorized editor startup. Official documentation identifies `REPLIT_DEPLOYMENT=1`
as the published-app indicator and describes editor and published databases as
separate platform-managed environments.

**How to apply:** Use documented deployment indicators, the managed service's
development/production configuration and an explicit preview-only opt-in.
Never override runtime markers or inspect connection secrets to force a start.
Keep production bootstrap behavior intact; tests must not contact production
data or trigger Stripe initialization, migrations, webhooks or synchronization.
