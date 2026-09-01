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

export const SANDTON_MAP_VIEW = {
  label: 'Sandton, South Africa',
  center: {
    latitude: -26.095,
    longitude: 28.055
  },
  zoom: 13,
  minZoom: 11,
  maxZoom: 16,
  bounds: {
    north: -26.035,
    east: 28.105,
    south: -26.145,
    west: 27.99
  }
} as const;

/** Demo search results positioned around Sandton until live listing coordinates are available. */
export const SANDTON_MAP_VALUES: SeeAllMapValue[] = [
  { id: 'morningside-home', listingTitle: 'Home in Morningside', priceUsd: 418, latitude: -26.0863, longitude: 28.0577 },
  { id: 'atholl-home', listingTitle: 'Home in Atholl', priceUsd: 954, latitude: -26.118, longitude: 28.072 },
  { id: 'sandown-villa', listingTitle: 'Villa in Sandown', priceUsd: 643, latitude: -26.103, longitude: 28.073 },
  { id: 'benmore-apartment', listingTitle: 'Apartment in Benmore Gardens', priceUsd: 365, latitude: -26.098, longitude: 28.044 },
  { id: 'bryanston-retreat', listingTitle: 'Bryanston garden retreat', priceUsd: 752, latitude: -26.056, longitude: 28.022 },
  { id: 'rivonia-suite', listingTitle: 'Rivonia private suite', priceUsd: 510, latitude: -26.057, longitude: 28.061 },
  { id: 'sandton-loft', listingTitle: 'Sandton designer loft', priceUsd: 269, latitude: -26.108, longitude: 28.056 },
  { id: 'hyde-park-house', listingTitle: 'Hyde Park family house', priceUsd: 1_127, latitude: -26.124, longitude: 28.035 },
  { id: 'illovo-studio', listingTitle: 'Illovo modern studio', priceUsd: 206, latitude: -26.127, longitude: 28.051 },
  { id: 'river-club-flat', listingTitle: 'River Club city flat', priceUsd: 385, latitude: -26.074, longitude: 28.031 },
  { id: 'paulshof-cottage', listingTitle: 'Paulshof guest cottage', priceUsd: 284, latitude: -26.038, longitude: 28.052 }
];
