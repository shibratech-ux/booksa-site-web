/**
 * Data model and sample content for SeeAllPage (Explore tab).
 *
 * Layout and visible values follow the Explore tab design reference (mobile screenshot, 360dp
 * wide). Values the screenshot does not show are marked `sample` and come from the Flutter app
 * (lib/pages/dashboard/overs/pages/overs_page.dart, dashboard_home_view.dart,
 * experiences_tab_view.dart). TODO(team): replace with live listings once the web reads them.
 */

/** Card geometry: 159.75×150.75 image, matching the Flutter kSmallStayImageSize and kLargeStayImageSize. */
export const EXPLORE_CARD_WIDTH = 159.75;
export const EXPLORE_CARD_IMAGE_HEIGHT = 150.75;
export const EXPLORE_STAY_NIGHTS = 2;

export type ExploreCard = {
  id: string;
  imageUrl: string;
  title: string;
  badge?: string;
  /** Total for EXPLORE_STAY_NIGHTS nights, in whole US dollars (display-only sample data). */
  priceUsd?: number;
  /** Pre-formatted price used when the item is not a nightly stay (experiences). */
  priceLabel?: string;
  /** Shown instead of a price when neither priceUsd nor priceLabel is set. */
  subtitle?: string;
  rating?: string;
};

export type ExploreSection = {
  id: string;
  title: string;
  subtitle?: string;
  /** Title handed to the map page by the header arrow; the arrow is inert when omitted. */
  mapTitle?: string;
  items: ExploreCard[];
};

export type ExploreCategory = 'all' | 'homes' | 'experiences' | 'services';

const unsplash = (photo: string) => `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=900&q=85`;

export const HOME_TAB_SECTIONS: ExploreSection[] = [
  {
    id: 'croissy-beaubourg',
    title: 'Popular homes in Croissy-Beaubourg',
    subtitle: 'Suburb east of Paris with forest trails',
    mapTitle: 'Popular homes in Croissy-Beaubourg',
    items: [
      { id: 'croissy-home', imageUrl: unsplash('photo-1600210492486-724fe5c67fb0'), title: 'Home in Croissy-Beaubourg', badge: 'Guest favorite', priceUsd: 185, rating: '4.93' },
      { id: 'roissy-en-brie', imageUrl: unsplash('photo-1600566753086-00f18fb6b3ea'), title: 'Apartment in Roissy-en-Brie', priceUsd: 303, rating: '5.0' },
      // sample: overs_page.dart 'lognes-l35'
      { id: 'lognes-l35', imageUrl: unsplash('photo-1600585154340-be6161a56a0c'), title: 'Apartment in Lognes', priceUsd: 163, rating: '4.71' }
    ]
  },
  {
    id: 'libreville',
    title: 'Stay in Libreville',
    subtitle: 'Gabonese capital with a seafront',
    mapTitle: 'Stay in Libreville',
    items: [
      { id: 'libreville-apartment', imageUrl: unsplash('photo-1522708323590-d24dbb6b0267'), title: 'Apartment in Libreville', priceUsd: 102, rating: '4.82' },
      { id: 'libreville-room', imageUrl: unsplash('photo-1505693416388-ac5ce068fe85'), title: 'Room in Libreville', badge: 'Guest favorite', priceUsd: 147, rating: '4.86' },
      // sample: third card is only partly visible in the reference
      { id: 'libreville-home', imageUrl: unsplash('photo-1560448204-e02f11c3d0e2'), title: 'Home in Libreville', priceUsd: 168, rating: '4.90' }
    ]
  },
  {
    id: 'pointe-noire',
    title: 'Stay in Pointe-Noire',
    // TODO(design): subtitle is cut off in the reference.
    mapTitle: 'Stay in Pointe-Noire',
    // sample: dashboard_home_view.dart Pointe-Noire defaults, CDF totals converted at USD_TO_CDF_RATE
    items: [
      { id: 'pointe-noire-apartment', imageUrl: unsplash('photo-1600607687939-ce8a6c25118c'), title: 'Apartment in Pointe-Noire', badge: 'Guest favorite', priceUsd: 93, rating: '4.86' },
      { id: 'pointe-noire-villa', imageUrl: unsplash('photo-1600566753190-17f0baa2a6c3'), title: 'Villa in Pointe-Noire', priceUsd: 135, rating: '4.95' },
      { id: 'pointe-noire-home', imageUrl: unsplash('photo-1600607687920-4e2a09cf159d'), title: 'Home in Pointe-Noire', priceUsd: 110, rating: '4.89' }
    ]
  }
];

/** sample: experiences_tab_view.dart */
export const EXPERIENCES_TAB_SECTIONS: ExploreSection[] = [
  {
    id: 'featured-experiences',
    title: 'Featured experiences',
    items: [
      { id: 'montmartre-walk', imageUrl: unsplash('photo-1500530855697-b586d89ba3ee'), title: 'Montmartre walk', subtitle: '2 hours', rating: '4.98' },
      { id: 'seine-photo-tour', imageUrl: unsplash('photo-1516306580123-e6e52b1b7b5f'), title: 'Seine photo tour', subtitle: '1.5 hours', rating: '4.95' },
      { id: 'french-pastry-class', imageUrl: unsplash('photo-1527631746610-bca00a040d60'), title: 'French pastry class', subtitle: '3 hours', rating: '4.97' },
      { id: 'sunset-jazz-cruise', imageUrl: unsplash('photo-1514525253161-7a46d19cd819'), title: 'Sunset jazz cruise', subtitle: '2 hours', rating: '4.91' }
    ]
  },
  {
    id: 'top-rated-paris',
    title: 'Top-rated in Paris',
    items: [
      { id: 'private-food-tasting', imageUrl: unsplash('photo-1517457373958-b7bdd4587205'), title: 'Private food tasting', badge: 'Local favorite', priceLabel: 'CDF 190,680 per guest', rating: '4.96' },
      { id: 'louvre-after-hours', imageUrl: unsplash('photo-1504384308090-c894fdcc538d'), title: 'Louvre after-hours tour', priceLabel: 'CDF 249,700 per guest', rating: '4.89' },
      { id: 'wine-and-cheese', imageUrl: unsplash('photo-1511578314322-379afb476865'), title: 'Wine and cheese evening', priceLabel: 'CDF 163,440 per guest', rating: '4.93' }
    ]
  }
];

/** Homes and Services reuse the home rails (Flutter ServicesTabView wraps the home view). */
export function getSectionsForCategory(category: ExploreCategory): ExploreSection[] {
  return category === 'experiences' ? EXPERIENCES_TAB_SECTIONS : HOME_TAB_SECTIONS;
}
