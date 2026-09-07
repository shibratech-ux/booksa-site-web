# Booksa visual redesign

## Route inventory

React Router's `AppRouter.tsx` owns all routes. `/` and `/homes` share `MainLayout` → `HomePage`; the two listing-creation entry points share `CreateListingPage`. Protected routes remain guarded by `ProtectedRoute`.

| Route | Page source | Shared components |
| --- | --- | --- |
| `/` | `src/pages/home/listing/HomePage.tsx` | `Footer`, `BooksaHeader`, `ShimmerImage` |
| `/homes` | `src/pages/home/listing/HomePage.tsx` | `Footer`, `BooksaHeader`, `ShimmerImage` |
| `/experiences` | `src/pages/home/experiences/ExperiencesPage.tsx` | `ExploreRail`, `BooksaHeader`, `Footer` |
| `/experiences/:experienceId` | `src/pages/home/experiences/ExperienceDetailPage.tsx` | `BooksaLogo`, `ShimmerImage` |
| `/services` | `src/pages/home/services/ServicesPage.tsx` | `ExploreRail`, `BooksaHeader`, `Footer` |
| `/services/:serviceId` | `src/pages/home/services/ServiceDetailPage.tsx` | `BooksaHeader`, `Footer`, `ShimmerImage`, `BooksaMap` |
| `/see-all` | `src/pages/home/listing/SeeAllPage.tsx` | `BooksaLogo`, `LanguageSwitcher`, `MarketplaceMobileNav`, `BooksaMap`, `Button`, `ShimmerImage` |
| `/phototour` | `src/pages/home/listing/PhotoTourPage.tsx` | `ShimmerImage` |
| `/confirm-pay` | `src/pages/pay/confirmpay.tsx` | `BooksaLogo`, `ShimmerImage` |
| `/listing/:listingId` | `src/pages/home/listing/ListingDetailPage.tsx` | `BooksaHeader`, `ShimmerImage`, `Footer`, `ChooseRoomButton` |
| `/login` | `src/pages/auth/LoginPage.tsx` | `BooksaLogo`, `LoginForm`, `RememberedUserLogin`, `Button`, `SocialLoginButtons` |
| `/trips` | `src/pages/trips/TripsPage.tsx` | `MarketplaceMobileNav`, `BooksaMap`, `ThreeDIcon` |
| `/messages` | `src/pages/messages/MessagesPage.tsx` | `MarketplaceMobileNav` |
| `/host/listings` | `src/pages/home/listing/HostListingsPage.tsx` | `BooksaLogo`, `HostAccountDrawer`, `ShimmerImage`, `ThreeDIcon` |
| `/host/listings/setup` | `src/pages/home/listing/create-listing/ListingSetupPage.tsx` | `BooksaLogo`, `ShimmerImage` |
| `/host/listings/create` | `src/pages/home/listing/create-listing/CreateListingPage.tsx` | `BooksaLogo`, `ShimmerImage` |
| `/host/listings/create/sections/:sectionId` | `src/pages/home/listing/create-listing/ListingSectionPage.tsx` | `BooksaLogo`, `Button`, `ShimmerImage` |
| `/host/listings/create-from-existing` | `src/pages/home/listing/create-listing/CreateListingPage.tsx` | `BooksaLogo`, `ShimmerImage` |
| `/host/profile` | `src/pages/home/listing/HostProfilePage.tsx` | `BooksaLogo`, `HostAccountDrawer`, `MarketplaceMobileNav`, `ThreeDIcon` |
| `/host/account-settings` | `src/pages/home/listing/account-settings/AccountSettingsPage.tsx` | `BooksaLogo` |
| `*` | `src/pages/NotFound/NotFoundPage.tsx` | `Button` |

## Shared implementation

- `src/index.css` and `src/theme/`: 4px spacing, 12–16px body/metadata scale, 20–32px headings, Booksa pink, neutral surfaces, 8/12/16/24px radii, restrained shadows. The existing local Plus Jakarta Sans font remains. Light is the initial preference; stored preferences and dark mode remain supported.
- `Button`, `IconButton`, `Input`, `SelectField`, `Badge`, `Modal`: consistent control proportions, outline variant, disabled/focus styles, associated form descriptions, modal focus containment, Escape/backdrop dismissal, focus restoration and viewport scrolling.
- `SocialLoginButtons`: shared full-width provider actions for the login page. Existing provider callbacks and errors remain intact.
- `BooksaHeader`, `MarketplaceMobileNav`, `Footer`: 80px collapsed desktop header, segmented search, systematic icon sizes, mobile safe-area navigation, quieter footer sections.
- `ExploreRail` and `HomePage`: shared marketplace widths and aspect ratio retained; consistent rounded image tiles, saved actions, badges and rail controls.

## Page refinements

Marketplace pages inherit the shared rails and theme. Listing and experience detail pages use a 1200px outer container; service detail removes oversized tablet padding. Photo tours use a 1280px container. Host listings/profile, account settings and listing setup use bounded desktop containers and flexible columns. Listing creation removes rigid column minimums. Trips uses a flowing mobile map/panel composition instead of a clipped fixed-height panel. Messages uses readable controls and pill filters. Login uses a bordered desktop panel and full-width provider actions. Checkout uses the detail container and rounded summary panel. Not-found and all account/listing-step fragments inherit the shared scale.

## Preservation

Routes, services, Firebase configuration, authentication callbacks, hooks, data and mutations are preserved. Existing unavailable actions and sample data were not replaced or implemented as part of the visual redesign. The known Google API-key referrer rejection requires Cloud Console configuration; this UI change does not resolve it.

## Reference

Original implementation informed by the user's design brief and the public marketplace structure at [Airbnb’s public homepage](https://www.airbnb.com/) (reviewed September 7, 2026). No third-party source code or proprietary font was copied.

## Verification

| Check | Result |
| --- | --- |
| `npm run typecheck` | Passed after final source changes. |
| `npm run build` | Passed after final source changes; all lazy page chunks emitted. |
| `git diff --check` | Passed. |
| Lint | No lint script/configuration is provided by this project. |
| Route inventory | 21 route entries covering 19 page components, including aliases and not-found. |
| Responsive route sweep | 126 samples: every route at 375, 430, 768, 1024, 1280 and 1440px. The sweep found a listing review-rail overflow; the corrected layout was subsequently verified at all six widths through real card navigation. |
| Protected-route guards | All nine protected entry points redirect an anonymous visitor to login. |
| Account panels | All eight account sections checked at all six widths: 48 samples without document overflow. |
| Service booking bar | Verified on mobile after removing the overlapping marketplace navigation from this detail page. |
| Existing interactions | Favorite toggle, listing-card navigation with navigation state, login required-field validation and credential-step transition, message filter selection and message search passed. |
| Shared controls | Browser-only fixture verified modal initial focus, Tab/Shift+Tab containment, Escape, backdrop dismissal, restored trigger focus, input description association and select error semantics. |
| Theme | Persisted dark-mode login rendered and reviewed; Tailwind dark utilities follow the stored data-theme preference. Apple provider icon remains visible in dark mode. |
| Browser runtime | No uncaught JavaScript errors in the route sweep or final interaction suite. |
| Brand review | No Airbnb references in rendered source or page metadata. |

### Verification boundaries

Protected layouts were rendered in an isolated browser context with only the frontend route guard substituted for visual inspection. Normal anonymous redirects were tested separately. No authenticated account, payment, upload, publishing or Google sign-in operation was submitted, and no backend credentials or fabricated user records were introduced. Existing account error/empty states remain visible when account data cannot load.

Some pre-existing remote image URLs did not load and the configured map provider rejected local-preview requests. Their data and integrations are unchanged; successful live asset delivery and authenticated backend flows require a configured environment. Existing placeholder actions remain as they were.

The temporary Playwright installation and browser harnesses live under `/tmp/booksa-browser` and `/tmp/booksa-visual`; no application dependencies or lockfiles were changed for testing. Route measurements and browser screenshots are in `/tmp/booksa-visual`.
