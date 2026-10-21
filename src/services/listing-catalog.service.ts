import { collection, doc, getDoc, getDocs, limit, query, where } from 'firebase/firestore';
import { getOwnListingImageUrls } from '@/domain/listing-photos';
import { readHouseRules, record, type HouseRules } from '@/domain/listing';
import { firebaseAuth, firebaseDb } from './firebase';

// Category ids from the "Which of these best describes your place?" step (`flowDraft.listingCategory`).
export const exploreCategoryIds = ['hotel', 'private-room', 'restaurant'] as const;
export type ExploreCategoryId = typeof exploreCategoryIds[number];

/** Guest-safe projection: host identity and contact fields stored on the listing are never returned. */
export type PublishedListingSummary = {
  id: string;
  category: ExploreCategoryId;
  title: string;
  location: string;
  city: string | null;
  coverImageUrl: string;
  basePrice: number;
  currency: 'CDF';
  publishedAt: number;
};

/** Everything the guest listing page needs. Host details are limited to a first name. */
export type PublishedListingDetail = PublishedListingSummary & {
  description: string;
  listingOption: string;
  placeAccess: string;
  photoUrls: string[];
  basics: { guests: number; bedrooms: number; beds: number; bathrooms: number };
  amenityIds: string[];
  houseRules: HouseRules;
  coordinates: { latitude: number; longitude: number } | null;
  hostFirstName: string | null;
};

const MAX_PUBLISHED_LISTINGS = 60;
const LOAD_ERROR = 'We could not load listings on Booksa. Please try again.';

const text = (value: unknown) => typeof value === 'string' && value.trim() ? value.trim() : null;

function toSummary(id: string, data: Record<string, unknown>): PublishedListingSummary | null {
  const flowDraft = record(data.flowDraft);
  const summary = record(data.generatedSummary);
  const category = exploreCategoryIds.find(categoryId => categoryId === flowDraft.listingCategory);
  const title = text(flowDraft.listingTitle) ?? text(summary.title);
  const location = text(summary.location);
  const basePrice = typeof flowDraft.basePrice === 'number' ? flowDraft.basePrice : summary.basePrice;
  // Only photos stored under the owner's Storage folder, on a trusted Firebase host.
  const [coverImageUrl] = getOwnListingImageUrls(data as Parameters<typeof getOwnListingImageUrls>[0], 1);
  if (!category || !title || !location || !coverImageUrl) return null;
  if (typeof basePrice !== 'number' || !Number.isInteger(basePrice) || basePrice < 1) return null;
  const publishedAt = data.publishedAt as { toMillis?: () => number } | null | undefined;
  return {
    id, category, title, location,
    city: text(record(record(data.confirmedLocation).address).city),
    coverImageUrl, basePrice, currency: 'CDF',
    publishedAt: typeof publishedAt?.toMillis === 'function' ? publishedAt.toMillis() : 0
  };
}

const count = (value: unknown) => typeof value === 'number' && Number.isInteger(value) && value >= 0 ? value : 0;
const firstName = (user: Record<string, unknown>) =>
  text(user.preferredFirstName) ?? text(user.firstName) ?? text(user.name)?.split(/\s+/)[0] ?? null;

function toDetail(id: string, data: Record<string, unknown>): PublishedListingDetail | null {
  const summary = toSummary(id, data);
  if (!summary) return null;
  const flowDraft = record(data.flowDraft);
  const basics = record(flowDraft.listingBasics);
  const confirmed = record(data.confirmedLocation);
  const point = record(confirmed.location);
  const latitude = point.latitude;
  const longitude = point.longitude;
  const validPoint = typeof latitude === 'number' && typeof longitude === 'number' &&
    Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180;
  return {
    ...summary,
    description: text(flowDraft.listingDescription) ?? text(data.description) ?? '',
    listingOption: text(flowDraft.listingOption) ?? '',
    placeAccess: text(flowDraft.placeAccess) ?? '',
    photoUrls: getOwnListingImageUrls(data as Parameters<typeof getOwnListingImageUrls>[0]),
    basics: { guests: count(basics.guests), bedrooms: count(basics.bedrooms), beds: count(basics.beds), bathrooms: count(basics.bathrooms) },
    amenityIds: Array.isArray(flowDraft.amenityIds) ? flowDraft.amenityIds.filter((value): value is string => typeof value === 'string') : [],
    houseRules: readHouseRules(data.houseRules),
    coordinates: validPoint ? { latitude, longitude } : null,
    hostFirstName: firstName(record(data.user))
  };
}

/** One published listing for the guest detail page; drafts and unpublished listings are not returned. */
export async function getPublishedListingDetail(listingId: string): Promise<PublishedListingDetail | null> {
  // A reload restores the Firebase session asynchronously; wait instead of reporting signed-out.
  await firebaseAuth?.authStateReady?.();
  const currentUser = firebaseAuth?.currentUser;
  if (!firebaseDb || !currentUser) throw new Error('You must be signed in to view this listing.');
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(listingId)) return null;
  try {
    const snapshot = await getDoc(doc(firebaseDb, 'annonceslisting', listingId));
    if (firebaseAuth?.currentUser !== currentUser) throw new Error(LOAD_ERROR);
    if (!snapshot.exists()) return null;
    const data = snapshot.data();
    return data.status === 'published' ? toDetail(snapshot.id, data) : null;
  } catch {
    throw new Error(LOAD_ERROR);
  }
}

/**
 * Listings deployed from the editor ("Ready for guests"): `status == 'published'`, which Deploy writes
 * in the same transaction as `users/{uid}.readyListings.{listingId}`. Newest first.
 */
export async function listPublishedListings(): Promise<PublishedListingSummary[]> {
  // A reload restores the Firebase session asynchronously; wait instead of reporting signed-out.
  await firebaseAuth?.authStateReady?.();
  const currentUser = firebaseAuth?.currentUser;
  if (!firebaseDb || !currentUser) throw new Error('You must be signed in to browse listings.');
  try {
    const snapshot = await getDocs(query(
      collection(firebaseDb, 'annonceslisting'),
      where('status', '==', 'published'),
      limit(MAX_PUBLISHED_LISTINGS)
    ));
    if (firebaseAuth?.currentUser !== currentUser) throw new Error(LOAD_ERROR);
    return snapshot.docs
      .map(listingDocument => toSummary(listingDocument.id, listingDocument.data()))
      .filter((listing): listing is PublishedListingSummary => listing !== null)
      .sort((first, second) => second.publishedAt - first.publishedAt);
  } catch {
    throw new Error(LOAD_ERROR);
  }
}
