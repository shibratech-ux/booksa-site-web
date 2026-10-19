export type Listing = {
  /** Firestore id for real listings; mock listings are keyed by location and price. */
  id?: string;
  badge?: string;
  image: string;
  location: string;
  price: string;
  /** Empty for listings without reviews yet. */
  rating: string;
  /** Replaces the default "pour 2 nuits" price context. */
  priceSuffix?: string;
  title?: string;
  description?: string;
  gallery?: string[];
  host?: string;
  roomType?: string;
  highlights?: string[];
  amenities?: string[];
};
