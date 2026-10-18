---
name: Profile privacy boundaries
description: Keep future private profile inputs separate from shared display contracts, server projections and browser caches.
---

Future private profile fields must be added to owner input/output deliberately, never to a shared display contract or projection by default. A public or network response must not inherit its fields from the write-input or owner-response contract.

**Why:** The Founder authorized establishing privacy boundaries while preserving current response compatibility, not changing access permissions. Automatic inheritance would make future private fields appear publicly supported before their privacy policy exists.

**How to apply:** Keep explicit allowlists for public, authorized network and owner representations, including nested members. Projection is not authorization: existing ownership, activation, suspension, blocking and media checks must still run. Preserve optional legacy contract properties without treating them as permissions or introducing new emitted fields.

Owner save responses must not be spread into public/directory caches or network display objects. Keep any immediate owner-network cache synchronization explicitly allowlisted; re-fetch other representations through their server authorization.

**Why:** The owner response has a different privacy boundary from every representation viewed by another person. Input fields will expand as international identity is introduced.

**How to apply:** Preserve confirmed saves, failed drafts, newer edits, independent photos and cancellation of stale reads. Adding future owner fields requires reviewing the cache allowlist rather than copying an expanding input object.

Connection graphics must be explicitly illustrative when verified public geography is unavailable. Never position real members on a globe or infer nationality, residence, city or language from their existing profile information.

**Why:** The Founder’s Global Universe mandate asks for cultural connection without invented member locations, and requires a separate database mandate before introducing international identity fields.

**How to apply:** Use symbolic connections and existing authorized profile information only. Prepare adaptable layouts without exposing empty private-field slots, adding inferred values or expanding any display contract.
