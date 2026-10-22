# News — motion specification

## Reference analysis

The supplied 24-second clip is a filmed screen demonstration, not a clean animation
export. Its handheld camera movement is not a UI effect to reproduce. The relevant
screen sequences combine lateral compositions, grouped typography, a restrained
push into media, layered light behind text and coordinated transitions between
editorial arrangements. The original green branding, logos and artwork are not
reused. Timing below is the original TOMI adaptation, not measured source timing.

| Sequence | Initial state | Trigger | Movement | Duration | Easing | Final state |
|---|---|---|---|---|---|---|
| Latest hero | Media slightly enlarged, clipped; grouped title below mask | First viewport entry | Mask opens, image settles from 1.06 scale, title rises in grouped lines | Media 1100ms; title 850ms, 140ms line stagger | cubic-bezier(.22,1,.36,1) | Full readable composition |
| Story metadata | Category/date, summary and action offset 12px | Hero media starts settling | Category, summary, then action move upward in sequence | 600ms each, 120ms stagger | Same ease | Visible, interactive content |
| Editorial feed | Alternating media crop and grouped text offset | First entry into viewport | Media mask opens; text moves from the opposing direction and settles | 850–1000ms; small stagger | Same ease | Static readable story |
| Motion stories | Poster or player framed with title offset sideways | First viewport entry | Media scales 1.04→1; title translates up to 24px laterally | 900ms | Same ease | User-controlled playback |
| Programme updates | Heading below line mask, image framed | First viewport entry | Heading rises as artwork settles | 850ms | Same ease | Clear existing destination |
| Historical archive | Capture within its original uncropped frame | First entry; user gallery controls | Masked reveal and optional local horizontal capture navigation | 700–900ms | Same ease | Attributed readable record |

## Constraints

- No scroll interception, mandatory intro or navigation delay.
- One-shot section reveals; slow desktop-only parallax if used, not mobile.
- Visible-first content, reveal on keyboard focus, reduced-motion/static fallbacks.
- User pause reveals final states rather than freezing hidden content.
- Stop ambient motion outside the viewport and while the document is hidden.
- No automatic sound or multiple autoplay videos; user playback only.
- Existing CMS publication timestamps drive latest sorting, never event dates.
- Historical coverage and published editorial news remain distinct.
