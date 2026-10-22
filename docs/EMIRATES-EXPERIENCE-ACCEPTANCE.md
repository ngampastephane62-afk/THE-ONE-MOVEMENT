# Thank You, Emirates — development acceptance

## Architecture

1. Approved introduction: existing UAE flag band, dunes artwork, panorama and
   hero composition; English, transliteration and genuine Arabic typography.
2. Seven Emirates: Natural Earth UAE outline and selected capital locator, one selected Emirate's
   information and portrait, direct selectors, previous/next and touch swipes.
3. Leadership: compact President introduction, optional Radix dialog showing one
   profile at a time, previous/next, direct selection, arrow keys and return/close.
4. Shared identity/culture: real Abu Dhabi skyline and Al Fahidi heritage photos,
   approved dunes artwork and the preserved CulturalStory content.
5. Global bridge: separate connecting-world sequence using Founder gold world
   artwork and lightweight animated routes starting at the UAE.
6. Global discovery: umbrella campaign, recognizable world artwork and six
   continent gateways closed by default; only one detail panel open at a time.
   Existing campaign configuration and editorial-directory boundaries preserved.
7. Human story and free four-step journey: account, verification, explicit network
   activation, consent and text/video submission through the unchanged form.
8. Secondary resources: original principles, platforms, pilot status, illustrative
   samples, recognition concepts, roadmap and source-labelled directories in
   closed disclosures; supporting portraits mount only on explicit expansion.

## Motion

See EMIRATES-MOTION-SPEC.md for the reference analysis and initial/trigger/
movement/timing/final-state table. Implemented masked grouped text entrances,
whole-phrase Arabic wipe, portrait inset masks, image push and opposing editorial
movement, selected-region tint, map focal shifts, drawn connectors and progressive
journey activation. No WebGL, new dependencies, scroll hijacking or autoplay sound.

Content is visible by default, armed only when observers are supported and reduced
motion is off. Page pause and reduced motion expose final readable states.
Continuous decoration pauses offscreen and in hidden tabs. The portalled dialog
inherits page pause and provides its own pause control. Arrow keys in comment
inputs do not switch portraits or discard comment drafts. Swipe ignores form
controls and predominantly vertical gestures.

## Sources and truthful availability

Names and roles checked against:
https://uaecabinet.ae/en/federal-supreme-council

Geographic source link verified:
https://u.ae/en/about-the-uae/the-seven-emirates

Existing portrait sources and credits are preserved and remain mixed, not
misrepresented as exclusively government images. Cabinet material retains its
dated editorial snapshot label rather than claiming a new verification.

The current development options endpoint lists the global Thanks the World
campaign as active. It does not list dedicated continent campaigns. The explorer
reports that distinction and offers real global and editorial-directory links.
North and South America use the API's geographic subregions, not an incorrect
assumption that all “Americas” countries belong to North America.

## Verification

- TypeScript and whitespace checks pass.
- 20 offline checks pass across Emirates rendering/navigation/motion contracts,
  complete ruler framing, accurate-outline locators, collapsed continent gateways,
  licensed photo/world imagery and existing gratitude sign-in intent rules.
- Screenshot inspection: approved introduction and genuine RTL Arabic at 390px;
  federation and natural-ratio President portrait at 390px; global gateways at
  320px; connecting-world composition at 1440px. No visible page overflow in these
  inspected views and no JavaScript errors reported by the capture browser.
- The member Emirates form, shared ruler data, original portrait component and
  worldwide campaign page are byte-for-byte unchanged from the starting snapshot.
- Only the frontend development workflow restarted; no API restart or mutation.

## Limits / not claimed

- No physical iPhone Safari, VoiceOver or hardware frame-rate test was performed.
- Placeholder diagrams and schematic disclaimers removed. UAE outline derives
  from public-domain Natural Earth data and retains the Oman enclave; locators
  represent emirate capitals, not invented internal administrative boundaries.
  Global routes are editorial connections on Founder artwork, not measured
  flight, trade or partnership data. Marker placement checked against the artwork.
- No public Emirates testimony endpoint was added. Existing Emirates posts stay
  in the signed-in member network; no fake or relabelled worldwide stories shown.
  A public Emirates gallery would need a separate, explicitly authorized consent
  and moderation path.
- No regional campaign was activated. Future configured campaigns link to the
  existing campaign explorer, where the visitor selects the named campaign;
  unsupported query-string filtering is not invented.
- No backend, schema, database, auth, payment, storage, membership permissions,
  account verification, consent, Founder controls or production system changed.
- No migrations or deployment performed.

## Files

- artifacts/web/src/pages/thanks-emirates/index.tsx
- artifacts/web/src/components/editorial/EmiratesHero.tsx (optional motion props)
- artifacts/web/src/components/emirates/ (focused chapter components, dialog,
  resources, local hooks and stylesheet)
- artifacts/web/src/lib/emirates-experience.ts
- artifacts/web/src/lib/emirates-geography.ts
- artifacts/web/public/images/emirates/ (two WebP photos, combined 122KB)
- artifacts/web/public/images/emirates/LICENSES.md (verified CC BY-SA 4.0 sources)
- artifacts/web/test/emirates-experience.test.mjs
- Reference MP4 excluded from Git/deployment; it is not a runtime asset.
