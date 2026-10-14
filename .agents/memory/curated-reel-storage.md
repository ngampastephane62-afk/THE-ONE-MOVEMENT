---
name: Curated reel storage
description: Tradeoff for serving a small fixed set of uploaded public videos safely from App Storage.
---

Cancelling a Google Cloud Storage SDK read stream before its HTTP response arrives can cause an uncaught internal pipeline error when a browser aborts a video request.

**Why:** This happened while closing a browser during homepage reel loading; the error occurred inside the SDK rather than the application's stream error handler.

**How to apply:** For a small, fixed set of curated videos, completed downloads cached in a bounded asset set can safely serve browser byte ranges without tying cloud-stream lifetime to client connections. Do not generalize whole-file caching to arbitrary uploads or an unbounded library; use an appropriately cancellable or direct storage delivery mechanism there.
