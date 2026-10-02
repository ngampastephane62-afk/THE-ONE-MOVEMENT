---
name: Browser media verification
description: Distinguishes missing codecs or failed browser infrastructure from invalid Founder video assets.
---

The testing browser may lack H.264/AAC support. Check `canPlayType` before interpreting a demuxer “no supported streams” error as a corrupt video or failed delivery.

**Why:** A Founder-approved video passed full local decoding and HTTP range checks, but test Chromium returned no H.264/AAC support. Playback succeeded with VP9/Opus derived from the same footage.

**How to apply:** Diagnose codec availability and delivery separately. Preserve approved footage and native framing; use a same-footage WebM fallback when needed rather than replacing content or installing a video library. Do not assume every future browser build has the same codec limitation.

Browser verification can terminate independently of the application: the managed browser has closed mid-census, and a separate local Chromium process has exited with SIGBUS (135).

**Why:** Both failures interrupted responsive verification while completed route/image checks passed and the web/API services remained available.

**How to apply:** Preserve completed results and explicitly mark remaining widths or interactions unverified. Distinguish browser-process failure from an application crash; use delivery, decoding and API checks for independent evidence, without claiming they prove browser controls or responsive layouts.