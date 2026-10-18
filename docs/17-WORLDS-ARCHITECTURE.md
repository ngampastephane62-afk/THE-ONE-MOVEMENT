# TOMI — 17 Worlds: visual and future editing architecture

> Historical pilot delivery. The later comprehensive frontend directive authorizes
> all seventeen worlds; see [LIVING-GLOBAL-UNIVERSE.md](LIVING-GLOBAL-UNIVERSE.md).
> The editor and backend restrictions below remain in force.

## Mandate and boundaries

This document accompanies the Founder’s “Phase 3 — Master Task 1”.
Only the Real Estate world is implemented as a visual pilot. The other sixteen
directions and both future architectures below are proposals, not released
features. Ordinary community membership remains free. No sector visit saves an
interest, grants professional status, activates the network or creates an invitation.
Backend, database, authentication, messaging, payments, entitlements and Founder
permissions remain unchanged. No production deployment is authorized.

## 1. Existing architecture findings

- There is one public `/ecosystem` route, not seventeen independent sector pages.
  `sector-location.ts` allowlists the seventeen registry slugs and constructs
  `/ecosystem?sector=<slug>#explore`. Unknown selections fall back safely.
- `EcosystemHero` and `SectorUniverse` provide the existing animated sector entry;
  `SectorExplorer` supplies persona/search filters and selection buttons.
  `SectorDetail` supplies sector identity, contribution, professional role labels,
  programme links and hand-curated official public knowledge.
- `sectors-data.ts` is the source of truth for names, slugs and programme
  associations. The comment about “sector page coming soon” predates the current
  query-based navigation; it must not be interpreted as authorization for invented
  `/sectors/*` routes.
- `MemberDirectory` uses the existing public directory API with its own search
  and sector filter. Its real loading/error/empty states must remain visible.
  Changing a world is not authorization to expose additional members.
- Programme links resolve against the existing six-programme registry. Knowledge
  resources are external official links, not TOMI courses or partner claims.
- `JoinPaths`, `/join`, `/sign-up` and the existing member workspace provide
  participation. Existing follow, message, reporting, blocking and post actions
  belong to the member network; they must not be simulated in sector artwork.
- The homepage atlas, shared sector emblems and chapter components already
  establish common visual language. The pilot extends this language rather than
  replacing the homepage, navigation or member shell.
- Current imagery includes Founder event/cultural archives, licensed regional
  composites and programme artwork. None should be presented as property stock,
  available developments or professional portfolios. A news asset depicting
  Burj Khalifa belongs to a separate EMAAR announcement; that attribution does
  not establish a general marketing licence for the Real Estate pilot.
- Existing layout supports mobile navigation, responsive sector grids and hash
  navigation. These behaviors remain the baseline, not a new scroll controller.

## 2. Reusable visual contract

Use the existing `Sector` registry as identity input. A world layer may add
presentation, but may not overwrite registry slugs, programme relationships,
profile authorization or membership eligibility.

Separate responsibilities:

1. **World composition** — hero, editorial narrative and visual motifs.
2. **World chapter** — semantic, individually addressable content sections.
3. **World actions** — genuine navigation and accessible local feedback.
4. **World artwork** — clearly attributed imagery or explicitly illustrative art.
5. **Sector sharing** — a public allowlisted route, never account state or tracking.
6. **Existing sector detail** — preserved programmes/resources and contribution.

Keep common type, lagoon/ivory/gold identity, controls and navigation consistent.
Change composition, framing, material, photographic subject and motif per world.
Use CSS and existing dependencies; do not add a graphics engine to every sector.
Do not load sixteen future worlds into the first pilot.

## 3. Visual concepts for all seventeen sectors

These are creative directions, not assertions about TOMI members or partners.
The pilot supplies a reusable foundation; it does not implement all these designs.

| Existing sector / slug | Hero and storytelling concept | Motif, motion and discovery direction | Future asset requirement |
| --- | --- | --- | --- |
| Fashion / `fashion` | Atelier to runway: the human craft behind cultural expression | Textile folds, measured editorial cuts; reveal craft and existing fashion programmes | Approved atelier photographs with identifiable-person permission; retain supplied programme covers |
| Music / `music` | Listening room opening onto a shared stage | Fine waveform-like lines and static score marks; never autoplay audio | Licensed performance/studio photographs and separately cleared audio if later approved |
| Dance / `dance` | Choreography as dialogue across cultures | Sweeping trajectories and sequence frames; motion remains optional | Authorized dancers and cultural context; no fabricated choreography credits |
| Film / `film` | From a single frame to a story across borders | Film-frame rhythm, restrained cuts, existing media discovery | Licensed production stills; native ratios and playback controls |
| Art / `art` | A gallery of perspectives, with room to look closely | Curatorial spacing, pigment/material details, gentle image reveals | Artwork reproduction rights plus artist and work credits |
| Business / `business` | Enterprise built through people and exchange | Structured editorial columns and linked paths to existing opportunities | Authorized enterprise/workshop portraits; no invented corporate clients |
| Investment / `investment` | Long-term thinking and responsible capital | Layered horizons and calm transitions; education before enquiries | Licensed places/enterprise photography; no return charts, fictitious deals or financial assurances |
| Tourism / `tourism` | Journeys through places and their living cultures | Landscape windows, route-like illustrative connections | Location-credited photographs with rights and accurate cultural descriptions |
| Diplomacy / `diplomacy` | A space for listening, dialogue and cultural bridges | Architectural symmetry, circular dialogue motif, slow reveals | Approved institutional archive only; flags and buildings do not imply endorsement |
| Innovation / `innovation` | Ideas moving from question to experiment | Sketch overlays and prototype details, short local transitions | Cleared research/prototype imagery; no fictional TOMI research programme |
| Technology / `technology` | Human intention behind connected tools | Fine circuitry-inspired geometry; avoid a fake live-data dashboard | Licensed tool/lab imagery; no fabricated live network or member geography |
| NGOs / `ngos` | Organized care, knowledge and collective effort | Editorial field notes and interwoven paths | Consent-based field imagery; identify organizations only with evidence |
| Media / `media` | Witness, context and voices | Editorial masthead rhythm, photographic contact sheets | Cleared newsroom/production imagery; distinguish News from the Media catalogue |
| Education / `education` | Knowledge passed between generations | Open-page planes, notebook lines, calm discovery | Authorized learning-space photographs; no invented courses, teachers or certificates |
| Real Estate / `real-estate` | Architecture, cities and responsible places to live and work | Architectural planes, skyline depth and measured chapter reveals; the implemented pilot | Cleared documentary architecture, sustainable development, residential and design-studio photographs |
| Health & Care / `health-care` | Care grounded in dignity and knowledge | Soft daylight, generous reading space, gentle transitions | Explicitly consented non-sensitive care imagery; no diagnosis or invented clinical affiliations |
| Humanitarian Action / `humanitarian-action` | Humanity and agency before spectacle | Ground-level storytelling and purposeful paths to existing impact work | Approved, dignified field imagery; safeguard children and vulnerable people; separate giving from commercial services |

### Visual media acceptance

For each future image record source, author, licence, permitted commercial use,
required attribution, consent where relevant, and local/storage asset identifier.
Document cropping and focal point. Never use a famous building as an endorsement,
a generic rendering as an actual listing, or a photograph as evidence of member
participation. Illustrative artwork must be labelled, not passed off as documentary
photography. Missing photography is a delivery limitation, not a reason to insert
unverified stock or testimonials.

## 4. Sector-sharing architecture

Reuse the canonical query/hash destination. Derive the origin from the browser
hosting the site and apply the artifact base path once. Reconstruct the URL from
the sector registry rather than copying the current location: never retain invite
codes, arbitrary search parameters, private identifiers or account URLs.

Provide native sharing where supported plus an explicit copy action. Cancellation
does not mean successful sharing. Clipboard rejection must provide a selectable
manual URL and an accurate failure message. No share count, tracking pixel,
invitation database, mandatory recruitment or automatic social posting is added.
Development sharing deliberately produces a development link; do not hardcode or
guess a production domain. Sharing permissions and clipboard behavior still need
real-device verification.

## 5. Shareable professional profiles — proposal only

### Existing capabilities inspected

- `/community/members/:id` already loads a server-approved public profile.
  Unavailable/private profiles have an explicit unavailable state.
- `/member/profile/:id` is the authenticated network view, not the URL to
  advertise as a universally public portfolio.
- The owner's profile already conditionally displays a public-link copy panel.
- Public presentation uses existing sector associations, biography, offers and
  looking-for text. Profile media obeys the existing public-media choice.
  Public profile pages do not expose member posts or conversations.
- Following, messaging and activation already have real controls and consent
  boundaries; the public page points into those existing flows rather than
  inventing public comments or automatic follows.

### Recommended next separately authorized scope

1. Reuse the existing public-profile route and copy control. Do not introduce a
   parallel identity, new public profile table or new invitation requirement.
2. Offer an owner-only “Preview public profile” using the public representation,
   not the more permissive owner payload. Show which text and media are visible.
3. Only offer public sharing after the existing public-visibility choice is
   confirmed. Changing visibility remains an explicit existing owner action,
   never a side effect of pressing Share.
4. Add native sharing and accurate cancellation/error feedback using a public URL.
   Review the existing public-link origin configuration separately before reuse;
   this pilot does not change it or claim deployment-domain verification.
5. Use existing profession, organization and chosen sectors. Label them as
   self-described, not certified, vetted or TOMI-endorsed.
6. Keep professional portfolios within existing authorized profile/post
   capabilities. Posts remain member-only. Public portfolio blocks, document
   downloads or public media galleries need a new privacy/content mandate.
7. Do not expose phone, email, identity documents, account settings, private
   messages, drafts or inferred geography. An owner preview and any share-card
   cache need explicit public-field allowlists, not owner-response spreads.
8. Social preview cards require a separately approved server-rendering design:
   public-only projection, public-media checks, appropriate unavailable responses,
   no private information in metadata, cache expiry/invalidation on withdrawal.
   Do not promise instant deletion of copies cached by external social services.

Acceptance before implementation: private-to-public-to-private tests, logged-out
availability, opted-out media, suspended/unavailable profiles, blocked-member
boundaries for authenticated views, failed copy, share cancellation and no
automatic follow. All are future verification, not tests performed by this pilot.

## 6. The One Creative Studio — architecture proposal only

**No editor, draft database, publication service or new admin permission is
implemented here.** Future work requires an explicit separate mandate, schema
review and permission approval.

### Editing model

Use a versioned, validated document that references allowlisted component/block
types and stable sector/page identifiers. Begin with existing reusable chapters,
image/text pairs, programme references and participation links. An editor may
change approved text, reference licensed assets, select bounded motion presets,
set safe links and reorder permitted sections. It may not edit executable JSX,
raw script, arbitrary CSS, permissions, pricing or member identity.

Require per-block field schemas, text length limits, accessible headings, valid
alt text, safe URL schemes and internal-route validation. References to programmes
must resolve to the existing registry, not duplicate programme data.

### Roles and authorization

Preserve current Founder privileges. Propose separate capabilities for viewing
previews, editing drafts, reviewing and publishing; have the Founder approve the
mapping to existing roles. Enforce every capability on the server. Hiding buttons
is not authorization. Editors cannot grant themselves publication rights.

### Drafts, review and versions

Proposed flow: create draft from published version → validate changes → preview
unpublished version → request review → explicit authorized publication.
Save immutable versions with author, timestamp, base version and a change summary.
Use optimistic concurrency so one editor cannot silently overwrite another.
Publishing must atomically select a validated version; a restore creates a new
version rather than deleting history. Autosave is never publication.

### Preview and publication boundary

Use authenticated preview URLs or short-lived, scoped preview authorization;
never publicly expose drafts through predictable asset paths. Preview renders the
same allowlisted blocks and responsive theme as the published page. Mark previews
clearly and prevent indexing. Re-check authorization and validation at publication,
record an audit event and invalidate appropriate page/asset caches. Do not deploy
application code as a side effect of editing content. Initial authoring support
and production release approval remain separate.

### Safe asset management

Use the project's existing App Storage architecture for approved future uploads,
not database blobs or public temporary folders. Keep draft/raw files private,
validate type/size and actual bytes, scan appropriately, record rights/source and
consent, strip sensitive metadata and produce optimized approved variants.
Only approved publication creates a public reference. Asset deletion must check
version references and retention; replacing an image cannot break published
versions or reveal private originals. SVG uploads need special sanitization or
conversion; never execute uploaded markup.

### Motion, mobile and localization

Allow bounded presets and durations, never arbitrary animation code. Respect
reduced motion, offer pause for sustained motion and use static mobile fallbacks.
Preview phone/tablet/desktop, keyboard focus and reading order before publishing.
Version content per locale with explicit translation/review status; missing
translations must not silently claim approval. Do not copy one language's image
alt text into every locale as a substitute for translation.

### Future acceptance checks

Unauthorized editing/publishing and stale-version rejection; draft isolation;
malicious links/markup/uploads; licence metadata; asset reference integrity;
atomic publication/restore; public cache invalidation; localization review;
keyboard and reduced motion; responsive preview parity. Any database evolution
requires the existing generate → review → migrate process under new authorization.

## 7. Runtime verification boundaries

Isolated source/component tests, TypeScript and a Vite build can check rendering,
URL logic and API-free event behavior. They do not prove device Web Share support,
clipboard permissions, production availability, image rights, real member
discovery, account permissions or authenticated profile visibility.

Verify phone/tablet/desktop and reduced motion with the actual pilot after
implementation. Do not treat a screenshot at the top of `/ecosystem` as visual
verification of a pilot further down the page. No production member data or
backend restart is needed or permitted for this mandate.

## 8. Delivered implementation and checks

### IMPLEMENTED

The Real Estate pilot appears below the existing sector grid only when Real Estate
is selected. It contains original labelled architectural SVG artwork, five
addressable editorial chapters, six professional-role descriptions, five learning
topics, a link to the existing member space and six participation audiences.
Existing programmes, curated resources, member directory and join paths remain.
All seventeen selected-sector panels expose clean public-link sharing controls.
Reusable `SectorWorldChapter`, `ArchitectureSkyline` and `SectorShare` components
and the shared `sw-*` visual styles support subsequent sector work.

### TESTED IN ISOLATION

- 77 tests in the main isolated frontend pass, including 11 new sector-world
  tests; the 5 fashion tests pass separately with the installed `tsx` loader:
  **82 passed, zero failures**.
- New coverage: all seventeen sector links and nested base paths; no invitation
  or private query leakage; clipboard success/unavailability/rejection; native
  share success/cancellation/failure; chapter focus and reduced-motion scrolling;
  truthful editorial content and real participation destinations.
- Frontend TypeScript and Vite production build passed. The build reports an
  existing tooltip sourcemap diagnostic and a large-chunk warning. The main
  JavaScript chunk is approximately 2.01 MB / 561 KB gzip; no bundle-splitting
  refactor was authorized or performed.
- Protected-file SHA-256 comparison: 154 API, database, API-contract/client and
  frontend-library files unchanged. Whitespace validation passed.
- Only the web workflow was restarted; its Vite log shows a successful startup.
  Existing API Stripe synchronization failures remain outside this mandate.

### Browser observation, not interaction testing

The full desktop page was captured and visually inspected, including all five
pilot chapters and the sharing control. A 390-pixel phone screenshot verifies
only the existing page opening, not the lower pilot chapters. Screenshots showed
no application render error; the browser reported the expected development-key
notice. No screenshot clicked, shared, copied, signed in or edited a profile.

### NOT VERIFIED IN BROWSER

Native device sharing, clipboard permission errors, chapter-button keyboard/focus
behavior, motion-preference changes during a session, pilot layout on actual
iPhone/Android/tablet devices, and authenticated member destinations. Isolated
tests cover event branches but do not replace these device checks. No claim of
production readiness or deployment is made.

### Missing visual assets

Cleared documentary photographs of architecture, sustainable buildings,
residential developments, cities and design studios are still needed for the
photographic direction. The pilot intentionally uses original illustrative
artwork instead of implying a licence or endorsement. The seventeen-world table
above identifies the remaining sector-specific asset needs.

### Exact delivery files

Modified:

- `artifacts/web/src/components/ecosystem/SectorDetail.tsx`
- `artifacts/web/src/components/ecosystem/SectorExplorer.tsx`

Added:

- `artifacts/web/src/components/ecosystem/ArchitectureSkyline.tsx`
- `artifacts/web/src/components/ecosystem/RealEstateWorld.tsx`
- `artifacts/web/src/components/ecosystem/SectorShare.tsx`
- `artifacts/web/src/components/ecosystem/SectorWorldChapter.tsx`
- `artifacts/web/src/styles/sector-world.css`
- `artifacts/web/test/sector-world.test.mjs`
- `docs/17-WORLDS-ARCHITECTURE.md`

Project memory also records the Founder's scope boundary in
`.agents/memory/sector-world-mandate.md`, indexed by `.agents/memory/MEMORY.md`.
The pre-existing `.replit` modification and uploaded mandate were not edited.
