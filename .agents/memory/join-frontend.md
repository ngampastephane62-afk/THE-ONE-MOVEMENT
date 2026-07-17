---
name: Join Page Frontend
description: Architecture decisions and conventions from the Stage 1 /join page frontend implementation.
---

## Key decisions

**@workspace/shared in web**: Added `"@workspace/shared": "workspace:*"` to `artifacts/web/package.json` (devDependencies) and added `{ "path": "../../lib/shared" }` to the references array in `artifacts/web/tsconfig.json`. Vite resolves the TypeScript source directly via pnpm symlink — no compilation step needed for dev/build.

**File structure**: All /join page code lives inside `artifacts/web/src/pages/join/` — `index.tsx` (main page), `join-data.ts` (display labels, paths, FAQ, consent text), plus six scoped components: `PathCard`, `ChipSelect`, `SelectableProgramCard`, `InterestForm`, `InquiryForm`, `SuccessPanel`.

**Taxonomy boundary**: Only `CATEGORIES_BY_GROUP` and `ORGANIZATION_TYPES` are imported from `@workspace/shared` in join-data.ts. Sector/program display data comes from the existing `sectors-data.ts` and `programs-data.ts` (already in the web artifact). Do not re-import sector/program slugs from taxonomy in frontend — use the existing data files.

**PathCard → form wiring**: `index.tsx` holds `activePath` (string | null) state. Derived `activeGroup` is passed to `InterestForm` as `preselectedGroup` prop. `useEffect` in `InterestForm` syncs it to the `audienceGroup` field and resets `category` on change. Institutional paths (`scrollsToInquiry: true`) smooth-scroll to `#institutional-inquiry`; joinable paths scroll to `#interest-form`.

**API URLs**: Frontend calls `/api/join-interest` and `/api/institutional-inquiry` as root-relative paths. The Replit proxy routes `/api/*` to the api-server (port 8080). Do not use BASE_URL prefix for API calls — the API is a separate artifact at a fixed path.

**Form error handling**:
- Client validation fires on submit (not on blur) — `validate()` returns `Record<string, string>`.
- On client error: set `errors` state, call `errorSummaryRef.current?.focus()` inside `requestAnimationFrame` for screen-reader reliability.
- On backend 400 with `error.fields`: map fields directly to `errors` state.
- On 429 / 500: set `apiMessage` string; do NOT clear form fields (retry preserves values).
- On 200 updated or 201 received: set `successStatus`, switch `status` to `'success'` → renders `SuccessPanel`.

**SuccessPanel**: Replaces the form on success. Focus moves to heading via `useRef` + `useEffect` on mount (WCAG 2.1 SC 3.3.4). `tabIndex={-1}` on heading, `outline-none` CSS class.

**No new npm packages**: `@workspace/shared` is a workspace-internal package, not a new external npm dependency. This satisfies the "no new dependencies" constraint.

**Why:**  The spec was explicit about file boundaries and the shared taxonomy. Keeping all join code scoped inside `pages/join/` makes the boundary visible; no shared component was modified.

**How to apply:** Future page-level forms should follow the same pattern — scoped data file, scoped components, single index.tsx that orchestrates state, pre-populated fields via props and useEffect.
