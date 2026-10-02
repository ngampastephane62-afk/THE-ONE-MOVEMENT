---
name: Browser media verification
description: Distinguishes missing proprietary codecs in the test browser from invalid Founder video assets.
---

The testing browser may lack H.264/AAC support. Check `canPlayType` before interpreting a demuxer “no supported streams” error as a corrupt video or failed delivery.

**Why:** A Founder-approved video passed full local decoding and HTTP range checks, but test Chromium returned no H.264/AAC support. Playback succeeded with VP9/Opus derived from the same footage.

**How to apply:** Diagnose codec availability and delivery separately. Preserve approved footage and native framing; use a same-footage WebM fallback when needed rather than replacing content or installing a video library. Do not assume every future browser build has the same codec limitation.