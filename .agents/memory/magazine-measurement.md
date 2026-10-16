---
name: Magazine reading and measurement
description: Public magazine library, genuine digital reading statistics, and Drizzle aggregate timestamp decoding.
---

Tropik should be presented as a library with a book-opening, page-turning reading experience and automatically measured statistics alongside it.

**Why:** The owner explicitly requested the library presentation, an electronic book rather than a long cover gallery, and visible statistics that help visitors understand the magazine's value.

**How to apply:** Keep the complete editorial selection distinct from cover-only previews and the free media kit. Additional covers do not imply that corresponding complete issues or paid reading subscriptions exist.

Digital reading sessions are not unique people, subscribers, or Instagram audiences. Do not backfill them from social screenshots or promotional reach. Automated clients and privacy opt-outs must not inflate the public counters.

**Why:** Genuine social proof requires consistent definitions and a clear starting point, not plausible-looking historical numbers.

**How to apply:** Preserve the public counting definitions, including visible reading time, revisited-page/session deduplication and explicit zero/error states. Identify separately sourced social audiences as such.

Raw PostgreSQL timestamp aggregates through the installed Drizzle driver can return strings even when the TypeScript SQL expression is annotated as `Date`.

**Why:** An empty aggregate concealed this mismatch; the first nonempty result failed when a Date method was invoked. A TypeScript annotation does not install a runtime decoder.

**How to apply:** Explicitly decode aggregated timestamps or use an appropriate Drizzle mapper. Verify both empty and nonempty results.
