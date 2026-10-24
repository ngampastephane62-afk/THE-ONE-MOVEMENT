---
name: Named OpenAPI request schemas
description: Prevent duplicate type exports when Orval emits both Zod validation and TypeScript request definitions.
---

Use named component schemas referenced by request bodies instead of inline request-object schemas in this workspace's OpenAPI contract.

**Why:** Inline request objects can make Orval emit a request-body type with the same name as its Zod validator. Re-exporting validation and generated types through the shared barrel then fails TypeScript compilation.

**How to apply:** Define the request object once under component schemas and reference it from the operation, then run code generation and the library typecheck.

Check generated string-format validators against the installed Zod major before relying on them.

**Why:** Orval generated a top-level `zod.email()` for an OpenAPI email format, but this workspace's validation package uses Zod 3, which does not expose that API. Generation succeeded while the downstream library typecheck failed.

**How to apply:** Until generation targets a compatible Zod API, keep email constraints explicit in the server validator and the browser form; do not hand-edit generated files to hide the incompatibility.

Do not rely on generator auto-detection of library majors in this workspace; pnpm catalog version references can prevent it from resolving the intended Zod and React Query majors.

**Why:** After upgrading Orval, generation silently targeted Zod 4 despite the validation package using Zod 3. A successful generation alone was not evidence of compatibility.

**How to apply:** Keep explicit compatible generation targets, and typecheck regenerated client and validators together. Fix generation configuration rather than manually repairing generated output.

Zod record parsing can silently discard reserved object keys instead of rejecting them.

**Why:** A validation test demonstrated that an input record containing an own `__proto__` key could parse successfully after that key disappeared.

**How to apply:** When record keys have a business whitelist, validate the original input keys before parsing as well as validating the parsed values. Do not mistake silent key removal for explicit rejection.
