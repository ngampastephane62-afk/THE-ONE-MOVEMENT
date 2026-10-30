---
name: Clerk browser fixture addresses
description: Address validation encountered in the managed Clerk browser-testing helper.
---

For programmatic browser-test identities, generate unique disposable addresses
under `example.com` rather than `.test`.

**Why:** The managed Clerk test helper rejected an otherwise valid unique
`.test` address, while the equivalent `example.com` fixture worked. This was an
identity-provider validation issue, not a TOMI onboarding failure.

**How to apply:** Use the approved testing helper with overridden login claims.
Never change provider settings or weaken application authentication to get a
fixture through. Do not send emails to fixture addresses; isolate writes to the
new test identity and clean up only its own test posts.
