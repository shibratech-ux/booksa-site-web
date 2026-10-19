import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { LucideIcon } from 'lucide-react';
import type { HouseRules } from '@/domain/listing';
import type { MapPoint } from '@/components/maps/BooksaMap';
import type { PublishedListingDetail } from '@/services/listing-catalog.service';
import { formatCurrency } from '@/utils/formatters';
import { getAmenityGroups } from '../create-listing/components/AmenitiesStep';
import { getListingCategory } from '../create-listing/listingCategories';
import { DEFAULT_MAP_VIEW } from '../seeAllMapDefaults';
import type { Listing } from '../listing.types';
import {
  sampleAmenityIds,
  sampleBasics,
  sampleDescription,
  sampleGallery,
  sampleHighlights,
  sampleHost,
  sampleReviewCount,
  type SampleHighlight
} from './sampleListingContent';

export type DetailAmenity = { id: string; label: string; icon: LucideIcon };
export type DetailAmenityGroup = { id: string; title: string; amenities: DetailAmenity[] };

/** One shape for real and sample listings so every section renders the same way. */
export type ListingDetailView = {
  source: 'published' | 'sample';
  title: string;
  subtitle: string;
  facts: string[];
  photos: string[];
  description: string;
  highlights: SampleHighlight[];
  hostName: string | null;
  isStay: boolean;
  basics: { bedrooms: number; beds: number };
  amenityGroups: DetailAmenityGroup[];
  amenityCount: number;
  place: { label: string; city: string; center: MapPoint };
  houseRules: string[];
  /** Sample-only social proof; real listings have no reviews or host stats yet. */
  sample: { rating: string; reviewCount: number; host: typeof sampleHost } | null;
  pricing: { kind: 'nightly'; nightlyPrice: number } | { kind: 'sample'; price: string };
  /** Legacy `Listing` passed to the photo tour and checkout pages. */
  contextListing: Listing;
};

type BookingT = ReturnType<typeof useTranslation<'booking'>>['t'];

function buildAmenityGroups(t: BookingT, categoryId: string | null, selectedIds: string[]): DetailAmenityGroup[] {
  const category = getListingCategory(categoryId) ?? getListingCategory('private-room');
  if (!category) return [];
  const labels = t('amenitiesStep.labels', { returnObjects: true }) as Record<string, string>;
  const groupLabels = t('amenitiesStep.groups', { returnObjects: true }) as Record<string, string>;
  const selected = new Set(selectedIds);
  return getAmenityGroups(category)
    .map(group => ({
      id: group.id,
      title: groupLabels[group.id] ?? group.title,
      amenities: group.amenities
        .filter(amenity => selected.has(amenity.id))
        .map(amenity => ({ id: amenity.id, label: labels[amenity.id] ?? amenity.label, icon: amenity.icon }))
    }))
    .filter(group => group.amenities.length > 0);
}

function buildHouseRules(t: BookingT, rules: HouseRules, maxGuests: number): string[] {
  const lines = maxGuests > 0 ? [t('listingDetail.maxGuests', { count: maxGuests })] : [];
  for (const [rule, value] of Object.entries(rules) as [keyof HouseRules, boolean | null][]) {
    if (value !== null) lines.push(t(`listingDetail.rules.${rule}.${value ? 'yes' : 'no'}`));
  }
  return lines;
}

function buildFacts(t: BookingT, basics: { guests: number; bedrooms: number; beds: number; bathrooms: number }) {
  return (['guests', 'bedrooms', 'beds', 'bathrooms'] as const)
    .filter(key => basics[key] > 0)
    .map(key => t(`listingDetail.facts.${key}`, { count: basics[key] }));
}

export function useListingDetailView(published: PublishedListingDetail | null, sample: Listing | null): ListingDetailView | null {
  const { t, i18n } = useTranslation('booking');

  return useMemo(() => {
    if (published) {
      const category = getListingCategory(published.category);
      const optionLabels = t('propertyTypeStep.options', { returnObjects: true }) as Record<string, string>;
      const type = optionLabels[published.listingOption] ?? t(`propertyTypeStep.categories.${published.category}`);
      const city = published.city ?? published.location;
      const amenityGroups = buildAmenityGroups(t, published.category, published.amenityIds);
      const isStay = published.category !== 'restaurant';
      return {
        source: 'published',
        title: published.title,
        subtitle: t('listingDetail.typeIn', { type, city: published.location }),
        facts: buildFacts(t, isStay ? published.basics : { ...published.basics, bedrooms: 0, beds: 0, bathrooms: 0 }),
        photos: published.photoUrls.length ? published.photoUrls : [published.coverImageUrl],
        description: published.description,
        highlights: category ? [{ icon: category.icon, title: type, description: t(`listingDetail.categoryHighlights.${published.category}`) }] : [],
        hostName: published.hostFirstName,
        isStay,
        basics: { bedrooms: published.basics.bedrooms, beds: published.basics.beds },
        amenityGroups,
        amenityCount: amenityGroups.reduce((total, group) => total + group.amenities.length, 0),
        place: { label: published.location, city, center: published.coordinates ?? DEFAULT_MAP_VIEW.center },
        houseRules: buildHouseRules(t, published.houseRules, published.basics.guests),
        sample: null,
        pricing: { kind: 'nightly', nightlyPrice: published.basePrice },
        contextListing: {
          id: published.id,
          image: published.coverImageUrl,
          gallery: published.photoUrls,
          title: published.title,
          location: published.location,
          // Checkout still reads prices as two-night totals (known pricing debt); keep its nightly line correct.
          price: formatCurrency(published.basePrice * 2, published.currency, i18n.resolvedLanguage),
          rating: ''
        }
      } satisfies ListingDetailView;
    }
    if (!sample) return null;
    const amenityGroups = buildAmenityGroups(t, 'private-room', sampleAmenityIds);
    return {
      source: 'sample',
      title: sample.title ?? sample.location,
      subtitle: sample.location,
      facts: buildFacts(t, sampleBasics),
      photos: sample.gallery?.length ? sample.gallery : [sample.image, ...sampleGallery.slice(1)],
      description: sample.description ?? sampleDescription,
      highlights: sampleHighlights,
      hostName: sample.host ?? sampleHost.name,
      isStay: true,
      basics: { bedrooms: sampleBasics.bedrooms, beds: sampleBasics.beds },
      amenityGroups,
      amenityCount: amenityGroups.reduce((total, group) => total + group.amenities.length, 0),
      place: { label: DEFAULT_MAP_VIEW.label, city: 'Kinshasa', center: DEFAULT_MAP_VIEW.center },
      houseRules: buildHouseRules(t, { petsAllowed: false, eventsAllowed: false, smokingAllowed: false, quietHours: true, commercialPhotographyAllowed: null }, sampleBasics.guests),
      sample: { rating: sample.rating, reviewCount: sampleReviewCount, host: sampleHost },
      pricing: { kind: 'sample', price: sample.price },
      contextListing: sample
    } satisfies ListingDetailView;
  }, [published, sample, t, i18n.resolvedLanguage]);
}
