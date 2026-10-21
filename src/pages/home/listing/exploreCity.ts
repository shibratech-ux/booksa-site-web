/** Count each listing once; equal counts keep the first city in display order. */
export function mostFrequentCity(listings: ReadonlyArray<{ city: string | null }>): string | null {
  const cities = new Map<string, { label: string; count: number }>();
  for (const listing of listings) {
    const label = listing.city?.trim();
    if (!label) continue;
    const key = label.normalize('NFC').toLowerCase();
    const city = cities.get(key);
    if (city) city.count += 1;
    else cities.set(key, { label, count: 1 });
  }

  let winner: { label: string; count: number } | undefined;
  for (const city of cities.values()) {
    if (!winner || city.count > winner.count) winner = city;
  }
  return winner?.label ?? null;
}
