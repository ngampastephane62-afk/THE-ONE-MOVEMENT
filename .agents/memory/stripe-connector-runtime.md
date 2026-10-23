---
name: Stripe connector transport and migration runtime
description: Why TOMI uses the connector proxy and preserves StripeSync's installed migration directory.
---

Use the current Replit connector proxy for Stripe's HTTP transport; do not assume the legacy connector response exposes a Stripe secret key.

An editor process can resolve the live Stripe connection even though the integration also has a separate development connection. Verify the actual `balance.livemode` response, not the app's `NODE_ENV` or a sandbox connection seen in the agent runtime. Refuse a live checkout when only testing was authorized.

**Why:** The agent-side development connection returned test mode while the running editor API's SDK returned live mode. The installed SDK exposed no environment-selection argument; official docs did not document one.

**How to apply:** Treat this as a connection-binding blocker, not permission to override runtime identity markers or substitute real payments for tests. Confirm the application itself reaches the intended test account before attempting transactions. Preserve the existing connector and require owner approval for account changes.

**Why:** The connected Stripe integration authenticated successfully through the connector SDK, but the legacy `include_secrets` response did not supply the `secret_key` expected by older integration examples. This was an interface mismatch, not proof that the user needed to reconnect.

**How to apply:** Keep authentication inside the connector transport. StripeSync's public Stripe client can use that same transport. Namespace its account-lookup identity by the actual connected account so development/live account changes cannot reuse an unrelated cached identity.

Preserve StripeSync's own installed-module location at runtime rather than bundling its migration loader into an application output directory.

**Why:** Its migration runner silently skips a missing adjacent migrations directory. A successful return can therefore leave the Stripe schema empty and make initialization fail later on missing tables.

**How to apply:** Keep the package external to the server bundle and verify synchronization reaches its ready state. A successful migration-function return alone is insufficient.
