# Video collection refinement

## Publication and provenance

- The 29-second awareness film keeps its exact original MP4, poster and
  `documentary-teaser-03` engagement identity. It now carries the Founder's
  supplied peace/unity/MONUSCO campaign copy, without CANAL+ attribution or
  documentary-teaser wording.
- The MONUSCO relationship is attributed to this specific campaign only.
  Founder review: confirm any formal institutional credit or partnership wording
  against the campaign's original materials before a release. No additional
  UN-wide endorsement or platform sponsorship is claimed.
- The 76-second, 7-second and 61-second entries are archived in the curated
  catalogue and excluded on every surface consuming this collection, including
  the alternate Partners presentation. Files, historical metadata, endpoints
  and engagement records remain untouched.
- TV5MONDE Afrique / France 24 and Radio Okapi remain in the collection.
  Thus Media retains three published films, while Partners presents the single
  awareness film. No unrelated video was removed to force a one-video layout.

## Presentation

Reusable cinematic cards coordinate title, category, original-ratio native
player, description/caption and the existing compact Like/Comment/Share row.
No initial autoplay; sequential playback is opt-in. Original player controls,
playsInline, metadata ratios and object-contain protect subjects on mobile.
Reduced motion, keyboard focus and unsupported IntersectionObserver retain
readable, functional final content.

## Future Founder publishing

The original curated collection was a code catalogue, not a Founder-editable CMS.
The existing **Founder → News** editor already supports video uploads and
YouTube/Vimeo references, drafts, scheduling, publication, archiving and rights
confirmation. It is unchanged. Published articles containing an actual video
now also appear through the same cinematic system below the curated Media
collection; draft and unpublished snapshots never enter that feed.

Publish a video-bearing News article to add a video independently. Existing
public News endpoints, media authorization, pagination, refresh and unpublish
rules are reused. Older pages are available through “Explore more published
video stories.” CMS articles retain their existing story/share functionality;
no unsupported per-article likes/comments namespace was invented.

## Protected scope

No schema, migration, backend, authentication, membership/Founder permissions,
Stripe, original media, production configuration or deployment changes.
No engagement counts reset or historical records deleted.

## Verification

- 12 targeted catalogue/presentation/engagement tests pass; web TypeScript passes.
- The exact original awareness MP4 fully decodes with FFmpeg (exit 0);
  its H.264 dimensions are 1280×678. Media delivery supports HTTP 206 ranges.
- Mobile Chromium checked the corrected content, archived-entry absence,
  preserved unrelated players, compact share menu/Escape, signed-out comments,
  default autoplay off, reduced-motion readability and shared-link focus.
- Both 390px and 320px cinematic cards fit; the Partners alternate collection
  contains the single corrected awareness card. The current published CMS video
  appeared without a feed error.
- Safari/WebKit and a physical iPhone were unavailable. Test Chromium explicitly
  lacks H.264 codec support, so actual playback remains unverified there; its
  demuxer error is not evidence of a corrupt original file.
- At 320px, page-level overflow outside the video collection remains: Media
  inquiry links and Partners history columns/carousels/notification wrappers.
  The video cards, titles and action rows themselves stay in bounds. These
  unrelated sections were not altered under the targeted scope restriction.
