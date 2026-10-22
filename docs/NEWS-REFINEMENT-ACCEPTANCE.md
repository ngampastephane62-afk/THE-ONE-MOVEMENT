# News refinement — development acceptance

## Implemented structure

1. Latest published CMS story and “The Movement in Motion” introduction.
2. Featured published announcements, when there are eligible items.
3. Editorial discovery feed, with older/newer pagination.
4. Stories in Motion, including separately attributed curated source media.
5. Programme, event, humanitarian and opportunity updates.
6. Preserved historical archive, after earlier official-site reads; attribution
   policy and media enquiry follow it.

The same CMS story is not repeated in multiple groups. Unfilled sections do not
invent articles, partnerships or dates. The live development endpoint currently
provides the Uptown Dubai story as the latest CMS publication.

## Ordering and freshness

The existing public API reads only published revisions. Ordering uses the CMS
publication instant descending, then article id descending, matching the API.
The event/display date is not used. The page-one hero remains current while
older pages are browsed. Page one refreshes every 60 seconds while the tab is
active, on window focus and through existing CMS cache invalidation.

Fixtures verify that a newer publication replaces the hero, the previous hero
remains discoverable, all categories overflow without losing stories, and older
pagination does not replace the latest hero. No real article was published or
edited to test these behaviours.

## Motion and media

See NEWS-MOTION-SPEC.md for initial states, triggers, movements, durations, easing
and final states. Implemented coordinated masks, restrained media zoom, grouped
headline rises and opposing lateral compositions. The actual hero story gets its
own reveal after API loading. Reveals are one-shot, visible-first, focus-aware and
reduced-motion compatible; pause exposes final readable states.

Uploaded media retains its original endpoint and uncropped proportions.
Playback is user-controlled. Starting a native video pauses other native videos
inside News, including the curated player. Clicking Watch to open an embed stops
the page's native videos; starting another page video removes the embed.
Cross-origin player-internal playback cannot be observed without provider APIs.

Archive records have native horizontal scroll-snap galleries, labelled previous
and next controls and the existing full-screen viewer/deep links. The reaction
target follows the selected screenshot, including swipes. Existing photo
and video reactions use an opt-in compact row; default layouts elsewhere remain
unchanged. CMS articles use sharing only because no article likes/comments API
exists.

## Checks completed

- TypeScript passes.
- 33 offline tests pass: News grouping/rendering/gallery/media, publishing
  isolation/authorization and existing social/programme compatibility.
- Git whitespace checks pass.
- Development archive API response is byte-for-byte unchanged from the initial
  inventory: 4 records, 18 original captures.
- Real published cover endpoint returns a valid JPEG; no replacement asset made.
- Mobile preview inspected at 390px and archive preview at 320px; no visible
  horizontal overflow in inspected views. Development browser reports no JS error.

## Limits

- No real iPhone Safari hardware/FPS measurement was performed.
- The existing cover endpoint took roughly three seconds during inspection.
  Hero cover is eager/high priority, its frame is reserved, and a loading
  indicator prevents an unexplained blank while bytes arrive.
- The current CMS has no separate reel/interview/programme-update category and
  no dedicated event-date field. Existing video and programme-link fields are
  used without claiming additional CMS capabilities.
- No backend, database, storage, authentication, payment, member permissions,
  Founder workflow or production configuration changed. No migration,
  production write, backend restart or deployment was performed for this work.

## Main frontend files

- pages/news/index.tsx
- lib/news-feed.ts
- hooks/use-news-motion.ts
- styles/news-motion.css
- components/news-live/{LatestHero,StorySections,StoriesInMotion,PressArchive,CaptureGallery,parts}.tsx
- components/editorial/{GalleryActions,PhotoSetActions,NewsVideo}.tsx
- test/news-live.test.mjs
