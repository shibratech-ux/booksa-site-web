---
name: booksa-maps
description: Build or update maps in this project using the shared OpenStreetMap-based BooksaMap component. Use for location previews, listing maps, service maps, map markers, geographic defaults, or map controls; do not add one-off map iframes or static-map images.
---

# Booksa Maps

Keep every user-visible project map consistent by using `src/components/maps/BooksaMap.tsx`.

## Project conventions

- Pass numeric `{ latitude, longitude }` coordinates to `center`; do not construct OpenStreetMap URLs inside feature components.
- Use Kinshasa, DR Congo from `src/pages/home/listing/seeAllMapDefaults.ts` only when a screen needs a fallback and has no meaningful location of its own.
- Pass `initialBounds` for search-result maps that must show a region. For a single location, let `BooksaMap` calculate local bounds from `center` and `initialZoom`.
- Pass geographic `markers` for results that should remain correctly positioned when zoom changes. Use `renderMarker` only when the default label pill does not communicate the needed value.
- Use `interactive={false}` and `showControls={false}` for compact read-only previews. Keep controls enabled for maps intended for exploration.
- Preserve the attribution rendered by `BooksaMap`. Do not cover it with feature overlays.
- Keep map-specific overlays as children of `BooksaMap` and give interactive controls accessible names.
- Clip every map image/surface with `rounded-[19px]`. Keep this radius on the shared `BooksaMap` root and do not override it with another rounding utility or a smaller-radius clipping parent.

## Listing search defaults

The fallback Kinshasa marker list and view live in `src/pages/home/listing/seeAllMapDefaults.ts`. Listing prices are stored there as two-night USD totals and displayed in CDF through `usdToCdf`; reuse `DEFAULT_STAY_NIGHTS` and the shared formatter rather than introducing another conversion rate.

Replace fallback markers with API values through component props when real coordinates are available. Do not mutate the fallback list to represent transient search results.

## Validate

- Check that zooming retains correct marker positions and filters markers outside the visible bounds.
- Check interactive and read-only map variants at their actual rendered sizes.
- Run `npm run typecheck` after map changes and `npm run build` when shared map behavior changes.
