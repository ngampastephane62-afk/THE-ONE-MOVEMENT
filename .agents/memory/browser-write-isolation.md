---
name: Browser write isolation
description: Fail-closed request interception for browser tests that must not create real data.
---

For browser tests that must not write real business data, install a catch-all
mutation guard before interacting. Fulfil only the explicitly allowed fixture
request, and abort unexpected business POST/PUT/PATCH/DELETE requests.

**Why:** A singular-versus-plural endpoint mismatch let a synthetic inquiry reach
the development API even though the test intended a browser-only simulation.
A success screen does not prove that interception worked.

**How to apply:** Read the exact client endpoint and method rather than guessing.
Assert that the fixture handler actually ran. Keep genuine authentication
requests separately allowlisted only when authorized. If a write escapes,
stop submissions, identify only the synthetic record read-only, report the
incident, and obtain approval before deleting anything under a no-data-deletion
constraint. Do not broaden cleanup to other inquiries or reset shared state.

When real sign-in is not authorized, isolate protected UI in a same-origin
harness that imports the real components and redirects Clerk hooks only in that
fixture page; a test-only ClerkProvider can still load the real SDK.

**Why:** Blocking that SDK while leaving the provider mounted produces misleading
load failures before the member UI can be exercised.

**How to apply:** Keep the mutation guard, fulfil exact fixture reads/writes,
verify interception counters, and remove temporary files. Report these checks as
component-level verification, never as proof of live OAuth or Founder access.
