---
name: Dependency security remediation
description: How to handle vulnerabilities without a patched upstream release while preserving production authentication.
---

Prefer removing an unnecessary dependency chain over suppressing its advisory or maintaining a local fork. Do not relax the minimum release age to install a just-published update when an older patched release is available.

**Why:** The braces stack-overflow advisory had no fixed upstream release. It was pulled in by glob matching that the production authentication proxy did not use, and by a preview file search replaceable with Node's native implementation. Keeping the existing network engine avoided replacing the actual authentication transport.

**How to apply:** Check all workspace consumers before removing a transitive package. When simplifying the production auth proxy, preserve custom-domain headers, raw bodies, cookies, redirects, compressed bytes and Content-Length handling. Validate those with loopback upstream regression tests; the development preview does not exercise production-only proxying. Never label an advisory resolved merely because a request path appears unreachable.
