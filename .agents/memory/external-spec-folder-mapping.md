---
name: External spec folder structure vs monorepo conventions
description: What to do when a pasted project brief dictates a folder layout (/client, /server, /shared) that doesn't match the pnpm workspace's artifacts/lib conventions.
---

When a user pastes an external project spec (e.g. from another AI builder) that
prescribes a folder structure like `/client/src/...`, `/server/routes`,
`/shared/schema`, do not create those literal top-level directories in this
monorepo. Map each prescribed location onto the existing workspace convention
instead:

- `client/src/components|pages|styles|lib` → `artifacts/<slug>/src/...`
- `server/routes` → `artifacts/api-server/src/routes/`
- `server/middleware` → `artifacts/api-server/src/middlewares/`
- `server/services` → `artifacts/api-server/src/services/`
- `shared/schema` → `lib/db/src/schema/`

**Why:** The workspace already has a fixed pnpm-workspace layout (artifacts +
lib) with its own routing, workflow, and codegen conventions. Recreating a
foreign layout on top would fight the proxy/workflow system and duplicate the
existing api-server/db packages.

**How to apply:** When such a spec arrives, tell the user (or just note in the
status doc) that the equivalent local paths were used, and otherwise follow
the spec's content requirements (tables, pages, endpoints) exactly.
