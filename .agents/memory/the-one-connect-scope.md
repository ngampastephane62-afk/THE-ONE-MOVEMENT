---
name: The One Connect mandate
description: Preserve messaging and privacy; approve phased expansion and external calling costs before implementation.
---

The One Connect expands the existing messaging product; it must not replace
the app, member IDs or conversation history. Implement essential messaging
first only after approval; calls, conferences and advanced collaboration
are separate phases. Do not activate paid providers without Founder approval.

**Why:** The supplied Connect mandate explicitly requires an audit, provider
comparison and usage-based cost estimates before coding, not an all-at-once build.

**How to apply:** Preserve Clerk, messaging consent/anti-spam and existing
commercial boundaries. Founder can organize cross-sector meetings across all
17 sectors, but administrative privileges never grant access to other people's
private messages, calls or chat attachments. Themes are personal; presence
needs privacy controls, recording is off by default, and no E2EE/background-call
claim is permitted without implementation and real verification.

Daily is the Founder's selected provider for calls, with an application-level
usage ceiling and an approved monthly budget of **USD 20**. This does not
authorize publication or unrelated paid services.

**Why:** The Founder selected Daily, then explicitly supplied USD 20 when asked
for the maximum monthly budget, after being warned that Daily has no guaranteed
provider-enforced hard cap. Its free allowance is not a guaranteed billing cap.

**How to apply:** Design conservative server-side usage controls before
activation, include in-progress reservations in the budget and fail closed
when usage cannot be established. Do not treat this budget as permission to
spend beyond USD 20 or promise a provider-level hard cap.

Keep unrelated deferred migrations out of a newly authorized feature's apply
step. In particular, approval of Connect does not authorize the held newsletter
schema or enable its emails.

**Why:** The user chose to keep the newsletter SQL prepared without applying it,
then separately approved Connect phase 1 and SQL preparation only.

**How to apply:** Check applied hashes and pending order before applying
anything. Never run the whole pending queue, silently mark an earlier migration
applied, or advance Drizzle's high-water mark past a held migration. Review
and obtain approval for a coherent, selective integration of unapplied drafts.
