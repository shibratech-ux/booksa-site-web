export type SeeAllMapValue = {
  id: string;
  listingTitle: string;
  priceUsd: number;
  latitude: number;
  longitude: number;
};

export const USD_TO_CDF_RATE = 2_250;
export const DEFAULT_STAY_NIGHTS = 2;

export function usdToCdf(usdAmount: number) {
  return Math.round(usdAmount * USD_TO_CDF_RATE);
}

export const DEFAULT_MAP_VIEW = {
  label: 'Kinshasa, DR Congo',
  center: {
    latitude: -4.3276,
    longitude: 15.3136
  },
  zoom: 13,
  minZoom: 11,
  maxZoom: 16,
  bounds: {
    north: -4.22,
    east: 15.43,
    south: -4.43,
    west: 15.2
  }
} as const;

/** Fallback listing values shown until live search results provide map coordinates. */
export const DEFAULT_MAP_VALUES: SeeAllMapValue[] = [
  { id: 'gombe-riverside', listingTitle: 'Gombe riverside apartment', priceUsd: 418, latitude: -4.305, longitude: 15.313 },
  { id: 'lingwala-home', listingTitle: 'Modern home in Lingwala', priceUsd: 954, latitude: -4.321, longitude: 15.299 },
  { id: 'barumbu-villa', listingTitle: 'Private villa in Barumbu', priceUsd: 643, latitude: -4.315, longitude: 15.337 },
  { id: 'kintambo-apartment', listingTitle: 'Apartment in Kintambo', priceUsd: 365, latitude: -4.333, longitude: 15.274 },
  { id: 'ngaliema-retreat', listingTitle: 'Ngaliema garden retreat', priceUsd: 752, latitude: -4.376, longitude: 15.242 },
  { id: 'bandalungwa-suite', listingTitle: 'Bandalungwa private suite', priceUsd: 510, latitude: -4.347, longitude: 15.284 },
  { id: 'kalamu-loft', listingTitle: 'Kalamu designer loft', priceUsd: 269, latitude: -4.351, longitude: 15.315 },
  { id: 'limete-house', listingTitle: 'Limete family house', priceUsd: 1_127, latitude: -4.383, longitude: 15.349 },
  { id: 'lemba-studio', listingTitle: 'Lemba modern studio', priceUsd: 206, latitude: -4.417, longitude: 15.34 },
  { id: 'kasa-vubu-flat', listingTitle: 'Kasa-Vubu city flat', priceUsd: 385, latitude: -4.338, longitude: 15.302 },
  { id: 'masina-cottage', listingTitle: 'Masina guest cottage', priceUsd: 284, latitude: -4.388, longitude: 15.391 }
];
