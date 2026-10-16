---
name: Editorial portrait sourcing
description: Non-obvious Wikimedia thumbnail and rate-limit constraints for sourcing public-figure portraits.
---

Use the exact thumbnail URL returned by Wikimedia rather than replacing the numeric width with an arbitrary preferred size.

**Why:** The media endpoint accepts a constrained set of thumbnail sizes; rewriting a working 330px URL to 640px returned HTTP 400 for most portraits despite valid source files.

**How to apply:** Resize locally after download. Preserve the original file page for author/licence attribution; derive its filename from the original image URL, not a presumed path segment.

Avoid many individual biography summary requests for a large directory. Use bounded batches or the pageimages query API, keep successful results, and source missing portraits from official publisher images rather than repeated blind retries.

**Why:** Large summary-request batches were rate-limited even when individual discovery requests succeeded.

**How to apply:** Cache/materialise public portraits in App Storage, retain explicit credits, and never substitute a similarly named relative or a group image without an honest caption.
