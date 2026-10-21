export const MAX_EXPLORE_RAILS = 10;
export const MAX_LISTINGS_PER_RAIL = 7;

export type ExploreRail<T extends { category: string }> = { key: string; category: T['category']; city: string | null; listings: T[] };

/**
 * One rail per tag + city (case-insensitive), biggest rails first; ties keep display order.
 * Listings without a city share one rail per tag. Caps rails and listings per rail.
 */
export function groupExploreRails<T extends { category: string; city: string | null }>(
  listings: ReadonlyArray<T>,
  maxRails = MAX_EXPLORE_RAILS,
  maxListings = MAX_LISTINGS_PER_RAIL
): ExploreRail<T>[] {
  const rails = new Map<string, ExploreRail<T>>();
  for (const listing of listings) {
    const city = listing.city?.trim() || null;
    const key = `${listing.category}:${city?.normalize('NFC').toLowerCase() ?? ''}`;
    const rail = rails.get(key);
    if (rail) rail.listings.push(listing);
    else rails.set(key, { key, category: listing.category, city, listings: [listing] });
  }

  return [...rails.values()]
    .map((rail, order) => ({ rail, order }))
    .sort((first, second) => second.rail.listings.length - first.rail.listings.length || first.order - second.order)
    .slice(0, maxRails)
    .map(({ rail }) => ({ ...rail, listings: rail.listings.slice(0, maxListings) }));
}
