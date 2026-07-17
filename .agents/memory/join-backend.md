---
name: Join Stage 1 Backend
description: Conventions and decisions from the Stage 1 join-interest and institutional-inquiry backend implementation.
---

## Key decisions

**lib/shared package**: Created `lib/shared` as a new workspace package (`@workspace/shared`) containing taxonomy constants only. Added `"composite": true, "emitDeclarationOnly": true` tsconfig (no "types" key — pure constants, no Node APIs). Must run `npx tsc -b lib/shared` before api-server typecheck resolves it.

**Enum convention**: All status/type enums are `text()` columns with TS comments — no `pgEnum` in this project. Consistent with all existing tables.

**Array columns**: `text("col").array()` — used for sectorSlugs and programSlugs, consistent with `profiles.languages`.

**Trust proxy**: `app.set("trust proxy", 1)` added to app.ts before any middleware. Required for req.ip to resolve correctly behind Replit's reverse proxy (otherwise all requests share loopback IP and rate limiting is disabled).

**Rate limiter**: In-memory fixed-window, 5 req / 10 min per IP, per-route separate instances. State lost on restart (documented, acceptable Stage 1). Tests use X-Forwarded-For with distinct IPs to simulate different clients in local dev.

**Upsert transaction**: join_interests uses `tx.select().for("update")` row-lock + conditional branch (insert/update/safe-path) to handle converted/archived records without creating duplicates. The unique index on email_normalized is the final guarantor.

**Zod choice**: Did NOT add zod to api-server. Used plain typed validator functions to strictly honor "do not add any dependency."

**Why:**  Spec was explicit: no new dependencies. Plain validators are more transparent and have no transitive dep risk.

**How to apply:** Future route handlers follow the same pattern unless the project explicitly adds zod to @workspace/api-server's direct deps.
