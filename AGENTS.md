# AGENTS.md — Booksa website

Instructions for AI coding agents (Codex, Cursor, Copilot, Gemini, Claude…) working in **this repository, which is the Booksa website only**. The Android app (Flutter) lives in a separate repo (`TODO(team): link`) and shares the same Firebase project and Firestore documents. `CLAUDE.md` imports this file and adds Claude Code–specific workflow.

> `TODO(team)` = not yet confirmed; ask before relying on it.
> **[target]** = product rule for new code, not yet implemented on the web. Don't claim it exists; don't break it in new code.

## Project at a glance

| | |
|---|---|
| Product | Airbnb-style booking simulator: guests browse and book stays/experiences/services; hosts create and manage listings |
| This repo | React 18 + TypeScript + Vite SPA, deployed to Netlify (`netlify.toml`) |
| Other surfaces | Flutter Android app (separate repo) · admin: not started |
| Backend | Firebase Auth, Firestore, Storage (`src/services/firebase.ts`); optional REST via `VITE_API_BASE_URL` (`src/services/api.ts`) |
| Real today | Auth (email + Google), profile/settings, host listing wizard, photo upload |
| Mock / UI-only today | Guest listings, search, map results, checkout, trips, messages, wishlists, reviews, experiences, services |
| Simulated by design | Payments, payouts, refunds, taxes: no real money, no real card data |

## Commands

| Task | Command |
|---|---|
| Install | `npm ci` |
| Dev server | `npm run dev` |
| Typecheck | `npm run typecheck` |
| Tests | `npm run test:listing` (only suite; Firebase is replaced by `tests/listing-firebase.mock.ts`) |
| Build | `npm run build` (tsc + vite) |
| Preview build | `npm run preview` |

No linter or formatter is configured. Match the surrounding style (2 spaces, single quotes, semicolons).

**Forbidden for agents:** `./deploy.sh`, `./update_github_netlify.sh` (they `git add` everything, commit and push, which triggers a Netlify deploy), `firebase deploy`, any write to a live Firebase project, `git push` without being asked.

## Repository layout

```
src/domain/           business types, Zod schemas, validation (listing.ts)
src/services/         Firebase/Axios access: *.service.ts, one file per area
src/store/            Zustand stores (auth, app), persisted to localStorage
src/pages/            route screens; listing features under pages/home/listing/
src/components/ui/    shared primitives (Button, Input, Modal, SelectField, ShimmerImage…)
src/components/       layout, maps (BooksaMap), auth, home rails, common states
src/theme/ + src/index.css   design tokens (CSS variables + Tailwind @theme)
src/i18n/             i18next: fr (default), en, sw, ln × 7 namespaces
src/utils/            constants (ROUTES, STORAGE_KEYS), formatters, helpers
tests/                node:test suites bundled by esbuild
docs/                 listing-creation.md, visual-redesign.md (route inventory)
.agents/skills/       project skills: maps, rails, dialogs, 3D icons, brand copy
```

Not wired into any route: `components/layout/{Sidebar,Header}.tsx`, `components/charts/`, `hooks/useApi.ts`, `services/{user.listUsers,transaction}.service.ts`. Don't extend them without asking.

## Architecture

```
Page (useState/useEffect) → service function → Firebase SDK (Firestore | Storage | Auth)
                        ↘ Zustand store (auth session, UI prefs)
```

1. Pages and components never import `firebase/*` directly. They call `src/services/*`.
2. Services own collection names, Storage paths and document mapping, and they check auth before every access (`requireCurrentUser` in `listing-draft.service.ts`).
3. Write paths validate through `src/domain/*` before writing (`validateListing`, `normalizeFlowDraft`).
4. Firestore is the source of truth. localStorage holds only UI/navigation context (`utils/navigationPersistence.ts`, `STORAGE_KEYS`).
5. **Firestore documents are a contract shared with the Flutter app.** Collections in use: `users/{uid}`, `annonceslisting/{id}`. Storage: `users/{uid}/listing-photos/…`. `resumePath: '/host/listing/create'` is the Flutter path. Keep it as is (`listingResume.ts` maps it to React routes).
6. React Query is configured in `main.tsx` but unused. `TODO(team)`: adopt it for new data-fetching or keep `useEffect`?

Planned collections **[target]**, `TODO(team): confirm names`: `listings/{id}/availability`, `bookings`, `threads/{id}/messages`, `reviews`, `wishlists`.

## Domain rules

Treat these as invariants. Code that breaks one is wrong even if it compiles.

### Identity & ownership
- Roles come only from the Firebase custom claim `role` ∈ `user|admin|manager|analyst|support`, default `user` (`services/auth-user.ts`). Never trust a role from Firestore or the client.
- Any signed-in user can host. Guest/host/both + separate admin is **[target]**, `TODO(team)`.
- Only the owner edits a listing: writes require `ownerUid === userUid === auth.uid` and re-check the session after each read (`assertOwner`/`assertSession` in `listing-draft.service.ts`). Keep these checks even once rules exist.
- `firestore.rules` / `storage.rules` are **not in this repo** (`TODO(team)`: where are they?). Client checks are the only enforcement visible here.
- Hosts cannot book their own listings **[target]**.

### Listing lifecycle (implemented)
- Status: `draft → action-required` (wizard finalization, `generateCurrentUserListing`) `→ published | active` (not set by web code).
- `action-required`, `published` and `active` never regress to `draft`. Draft updates are silently skipped for them (tested).
- Only `draft` (and legacy `in-progress`) listings can be deleted from the web.
- Draft writes whitelist editable fields. Identity fields (`ownerUid`, `userUid`, `user`, `createdAt`) never come from the client.
- Validation rejects unknown catalog IDs and extra `flowDraft` keys. A new wizard field needs `flowSchema` + `normalizeFlowDraft` + Flutter agreement.
- Finalization requires ≥5 uploaded photos, no pending uploads, a cover image from the listing's photos and a confirmed location with valid lat/lng/timezone.
- Photo URLs must be `https://firebasestorage.googleapis.com` or `storage.googleapis.com`. Storage paths must start with `users/{ownerUid}/listing-photos/`.

### Dates & availability [target]
- Store instants in UTC (Firestore `serverTimestamp`); display in the listing's time zone (`confirmedLocation.location.timezone`, already stored).
- Stays are half-open `[checkIn, checkOut)`. Enforce min/max nights and host-blocked dates.
- No overlapping confirmed bookings per listing. Check and write in one Firestore transaction or Cloud Function, never a client read-then-write.

### Booking lifecycle [target]
```
pending   → confirmed | declined | expired
confirmed → cancelled_by_guest | cancelled_by_host | completed
```
- No other transitions. Record actor + timestamp on each. Use a client-generated request ID for idempotency.

### Money
- Listing currency is **CDF** (`generatedSummary.currency`). `flowDraft.basePrice` is an integer 1–9,999,999. `TODO(team)`: whole francs or minor units?
- **[target]** Integer minor units + ISO code, never floats. `total = nightly × nights + cleaning + service + taxes − discounts`, computed by one shared pricing module.
- Known debt: guest pages parse display strings and divide by 2 (`ListingDetailPage.tsx`, `confirmpay.tsx`). Fee rates (10% guest, 3% host) live only in `BasePriceDialog.tsx`. `USD_TO_CDF_RATE` is hard-coded in `seeAllMapDefaults.ts`. Don't copy these patterns. Ask before changing any of them.
- Payments are simulated. Never add inputs that collect real card numbers.

### Reviews & messaging [target]
- Review only after `completed`; one review per side per booking.
- Threads belong to a listing (and booking); only the two participants can read them.

## Code conventions

- Files: `PascalCase.tsx` components/pages, `kebab-case.service.ts`, `*.store.ts`, `*.types.ts`. Import via `@/…`.
- New screen: page in `src/pages/<area>/`, path in `ROUTES` (`utils/constants.ts`), lazy route in `routes/AppRouter.tsx` (inside `ProtectedRoute` if it needs auth). Example: `pages/home/listing/HostListingsPage.tsx`.
- New data call: async function in `src/services/<area>.service.ts`. Example: `listing-draft.service.ts`: auth guard, `runTransaction`, owner + status checks, generic user-facing error.
- New model/validation: Zod schema + type in `src/domain/<area>.ts`. Example: `domain/listing.ts`. Don't import UI components into new domain files. Existing listing catalogs in step components are known debt.
- Errors: services throw `Error` with a user-safe message. Auth errors map to i18n keys via `utils/firebaseErrors.ts`. Never swallow without a fallback UI.
- Every data-loading screen handles loading, empty, error and success (`components/common/{LoadingScreen,EmptyState,ErrorState}.tsx`).
- User-facing text goes through i18next (`useTranslation('<ns>')`) with keys in all 4 locales (ln/sw may fall back to fr). Format money/dates with `utils/formatters.ts`, always passing the currency. Product name is always **Booksa** (`.agents/skills/booksa-brand-language`).

## Design & accessibility

- Colors, radii and type come from CSS variables / Tailwind theme in `src/index.css` and `src/theme/`: `var(--color-text-primary)`, `var(--color-surface)`, `rounded-card`, `rounded-dialog`, `rounded-button`. No new hex values, arbitrary shadows or `text-gray-*`.
- Brand primary: `TODO(team)`. `Button` uses hard-coded pink `#E61E4D` while `theme/colors.ts` primary is blue `#2563eb`. Don't add a third.
- Icons: `lucide-react` only (`.agents/skills/lucide-icons`): light 1.5 stroke everywhere, 16px base (`--icon-small`, set by `svg.lucide` in `src/index.css`); decorative 3D art via `ThreeDIcon`.
- Reuse `components/ui/*` first. Maps: `BooksaMap` only. Rails: `marketplace-reference-*` classes. Dialogs: `ui/Modal.tsx` + `.agents/skills/dialog-motion`.
- Dark mode via `[data-theme="dark"]`; check both themes.
- No design yet? Build a functional placeholder with existing tokens, add `// TODO(design): …` and report it. Don't invent final visuals.
- Accessible names on icon buttons, `role="dialog"` + focus handling for overlays, ≥44px touch targets (`min-h-11`), images through `ShimmerImage` (placeholder + fallback), decorative images `alt=""`.
- Responsive: verify 375 / 768 / 1280px at least (`docs/visual-redesign.md`).

## Skills matrix

| # | Skill | Where | Pattern in repo |
|---|---|---|---|
| 1 | React + TS pages, React Router | `src/pages`, `routes/AppRouter.tsx` | ✅ `HostListingsPage.tsx` |
| 2 | Zustand state | `src/store` | ✅ `auth.store.ts` |
| 3 | Firestore modeling, transactions, owner guards | `src/services` | ✅ `listing-draft.service.ts` |
| 4 | Firestore & Storage security rules | not in repo | ❌ `TODO(team)` |
| 5 | Firebase Auth + custom claims | identity | ✅ `auth-user.ts`, `authSession.ts` |
| 6 | Zod validation at write boundary | `src/domain` | ✅ `domain/listing.ts` |
| 7 | Date ranges & time zones (dayjs) | calendar, availability | ❌ no tz plugin, no pattern |
| 8 | Money & pricing in minor units | pricing, checkout | ❌ string parsing today |
| 9 | State machines | listing ✅, booking ❌ | ⚠️ `listing-draft.service.ts` statuses |
| 10 | Storage upload & media | photos | ✅ `listing-photo.service.ts` |
| 11 | Maps (OpenStreetMap on web) | search, listing, trips | ✅ `BooksaMap.tsx` + skill |
| 12 | Real-time messaging + push | threads | ❌ none |
| 13 | Tailwind 4 tokens, dark mode, motion | all UI | ✅ `index.css`, `ui/Modal.tsx` |
| 14 | i18next + locale formatting | all copy | ✅ `src/i18n`, `utils/formatters.ts` |
| 15 | Contract parity with Flutter | `annonceslisting`, `users` | ⚠️ `listingResume.ts`, `docs/listing-creation.md` |
| 16 | node:test + Firebase test double | `tests/` | ✅ `tests/listing.test.ts` |
| 17 | Icons: `lucide-react` only, light 1.5 stroke, 16px base | all UI | ✅ `.agents/skills/lucide-icons`, `svg.lucide` in `src/index.css` |

Shared back navigation on the website uses `src/components/ui/BackButton.tsx` (built on `IconButton`): a 44px circular button with Lucide `ArrowLeft`, a 20px icon and 1.5 stroke. Pass a translated `label` and an explicit `onClick` handler; use `variant="muted"` or `variant="outlined"` when the page needs a background or border. See [the Lucide icons skill](.agents/skills/lucide-icons/SKILL.md). Examples: Accessibility features, Amenities and House rules.

## Testing

- Required unit tests for any change to: listing validation/lifecycle, pricing, availability/overlap, booking transitions, date/time zone conversion.
- Tests live in `tests/<area>.test.ts`. Firestore/Storage are swapped for `tests/listing-firebase.mock.ts` by the esbuild alias in `tests/run-listing-tests.mjs`. A new suite needs a runner entry and a `package.json` script (ask first).
- No emulator or rules tests exist yet (`TODO(team)`).

## Boundaries

**Always:** read the page, its service and `src/domain` before editing; keep changes scoped; run `npm run typecheck`, `npm run test:listing`, `npm run build`.

**Ask first:** changing a Firestore field, collection or Storage path · listing status or booking state machine · pricing formula, fees, currency · adding a dependency · new `package.json` scripts · deleting files or data · touching the dashboard scaffold.

**Never:** commit secrets or `.env*` (except `.env.example`) · read or print `.env.local` · run deploy scripts or `firebase deploy` · edit `package-lock.json` by hand, `dist/`, `*.tsbuildinfo` · collect real payment data.

## Commits & PRs

- Branches: `feature/<name>`, `fix/<name>`, `chore/<name>`.
- Commits: Conventional Commits, `feat(listing): …`, `fix(auth): …` (history before this file is free-form).
- PR: what changed, skills touched (matrix #), screenshots (light + dark, mobile + desktop) for UI, open `TODO(team)` / `TODO(design)`.
- A Firestore shape change must be confirmed against the Flutter app before merge.

## Definition of done

- [ ] `npm run typecheck`, `npm run test:listing`, `npm run build` pass
- [ ] Tests added/updated for domain logic
- [ ] Domain rules above still hold
- [ ] Loading / empty / error states handled
- [ ] Tokens only; strings in i18n
- [ ] Flutter impact checked for shared documents
- [ ] Open TODOs listed in the PR

## Keeping docs in sync

This file is the shared source of truth; `CLAUDE.md` imports it. The product-wide rules (domain rules, skills matrix) must match the mobile repo's `AGENTS.md`. Change both in the same change set.

## Open questions — TODO(team)

- Flutter repo location; who owns the Firestore schema
- Where Firestore/Storage rules live; rules-test location; CI
- `basePrice` unit; official fee/tax rates; USD↔CDF handling
- Brand primary color (pink vs blue)
- Guest/host role model; Cloud Functions vs client transactions for booking
- Collection names for bookings, availability, threads, reviews, wishlists
- React Query adoption; fate of the dashboard scaffold
