---
name: Named OpenAPI request schemas
description: Prevent duplicate type exports when Orval emits both Zod validation and TypeScript request definitions.
---

Use named component schemas referenced by request bodies instead of inline request-object schemas in this workspace's OpenAPI contract.

**Why:** Inline request objects can make Orval emit a request-body type with the same name as its Zod validator. Re-exporting validation and generated types through the shared barrel then fails TypeScript compilation.

**How to apply:** Define the request object once under component schemas and reference it from the operation, then run code generation and the library typecheck.
