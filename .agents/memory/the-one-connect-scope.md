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

Daily is the Founder's selected direction for calls, with an application-level
usage ceiling. This selection is not approval of a subscription or spending:
obtain the monthly budget before activating a billable service.

**Why:** The Founder selected Daily after being told that the selection alone
would trigger no subscription or billing and that budget approval would follow.
Daily's free allowance must not be described as a guaranteed billing cap.

**How to apply:** Design server-side usage controls before activation, explain
that a software ceiling is not a provider-enforced hard cap, and get explicit
approval for the remaining cost exposure.

Keep unrelated deferred migrations out of a newly authorized feature's apply
step. In particular, approval of Connect does not authorize the held newsletter
schema or enable its emails.

**Why:** The user chose to keep the newsletter SQL prepared without applying it,
then separately approved Connect phase 1 and SQL preparation only.

**How to apply:** Check applied hashes and pending order before applying
anything. Never run the whole pending queue, silently mark an earlier migration
applied, or advance Drizzle's high-water mark past a held migration. Review
and obtain approval for a coherent, selective integration of unapplied drafts.
