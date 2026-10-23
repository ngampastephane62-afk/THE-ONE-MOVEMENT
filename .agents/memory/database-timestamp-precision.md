---
name: Database timestamp precision
description: Exact timestamp guards must preserve PostgreSQL microseconds rather than tool-formatted milliseconds.
---

When an authorized, narrowly targeted database write uses a timestamp as an
optimistic guard, fetch that timestamp with `::text` and bind the exact result.
Do not reconstruct it from a tool-formatted ISO timestamp.

**Why:** SQL tool output can serialize timestamps through JavaScript, truncating
PostgreSQL microseconds to milliseconds. Equality against that displayed value
can fail even when the intended row is unchanged.

**How to apply:** Keep all identity/status guards intact if a write returns no
rows. Read only the approved target, preserve full timestamp precision and
recheck; never weaken the WHERE clause just to make the write succeed.
