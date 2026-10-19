// Read-side helpers that turn the photo fields of an `annonceslisting` document into display URLs.
// Pure functions: no Firebase or UI imports, so they can be unit-tested and shared.

const PHOTO_URL_KEYS = ['url', 'imageUrl', 'photoUrl', 'downloadURL', 'downloadUrl'] as const;

export type ListingPhotoSource = {
  listingPhotos?: unknown;
  imageUrls?: unknown;
  images?: unknown;
  photos?: unknown;
  user?: unknown;
  coverImageUrl?: unknown;
  coverImage?: unknown;
  generatedSummary?: { coverImageUrl?: unknown } | null;
};

export const findPhotoUrl = (value: unknown): string | undefined => {
  if (typeof value === 'string') return /^https?:\/\//i.test(value) ? value : undefined;
  if (!value || typeof value !== 'object') return undefined;

  const photo = value as Record<string, unknown>;
  for (const key of PHOTO_URL_KEYS) {
    const candidate = photo[key];
    if (typeof candidate === 'string' && /^https?:\/\//i.test(candidate)) return candidate;
  }
  return undefined;
};

const photoOrder = (value: unknown) => {
  const order = value && typeof value === 'object' ? (value as Record<string, unknown>).order : undefined;
  return typeof order === 'number' && Number.isFinite(order) ? order : Number.POSITIVE_INFINITY;
};

// Arrays keep their order; maps (Flutter/web `listingPhotos`) are sorted by each photo's `order` field.
const collectPhotoUrls = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(findPhotoUrl).filter((url): url is string => Boolean(url));
  if (!value || typeof value !== 'object') return [];

  return Object.values(value as Record<string, unknown>)
    .map((photo, index) => ({ photo, index }))
    .sort((first, second) => photoOrder(first.photo) - photoOrder(second.photo) || first.index - second.index)
    .map(({ photo }) => findPhotoUrl(photo))
    .filter((url): url is string => Boolean(url));
};

/** Every photo of the listing, de-duplicated, in host order. */
export function getListingPhotoUrls(listing: ListingPhotoSource): string[] {
  const user = listing.user && typeof listing.user === 'object' ? (listing.user as Record<string, unknown>) : {};

  return [
    ...new Set([
      ...collectPhotoUrls(listing.listingPhotos),
      ...collectPhotoUrls(listing.imageUrls),
      ...collectPhotoUrls(listing.images),
      ...collectPhotoUrls(listing.photos),
      ...collectPhotoUrls(user.listingPhotos)
    ])
  ];
}

/** The chosen cover when it is one of the listing's photos, otherwise the first photo. */
export function getListingCoverUrl(listing: ListingPhotoSource): string | undefined {
  const photoUrls = getListingPhotoUrls(listing);
  if (photoUrls.length === 0) return undefined;

  const photoUrlSet = new Set(photoUrls);
  const preferredCover = [listing.generatedSummary?.coverImageUrl, listing.coverImageUrl, listing.coverImage]
    .map(findPhotoUrl)
    .find((url) => url && photoUrlSet.has(url));

  return preferredCover ?? photoUrls[0];
}

/** Cover first, then the remaining photos in order; `limit` caps the result (e.g. 3 for the photo tour preview). */
export function getListingImageUrls(listing: ListingPhotoSource, limit?: number): string[] {
  const coverUrl = getListingCoverUrl(listing);
  const urls = [...new Set([...(coverUrl ? [coverUrl] : []), ...getListingPhotoUrls(listing)])];
  return limit === undefined ? urls : urls.slice(0, limit);
}

const TRUSTED_PHOTO_HOSTS = ['firebasestorage.googleapis.com', 'storage.googleapis.com'];

const isTrustedPhotoUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && TRUSTED_PHOTO_HOSTS.includes(url.hostname);
  } catch {
    return false;
  }
};

/**
 * Only the photos this `annonceslisting` document stores in its own `listingPhotos` field: https Firebase
 * Storage URLs whose `storagePath` is under `users/{ownerUid}/listing-photos/`, in host order with the cover
 * first. Legacy `imageUrls`/`images`/`photos`, the nested `user` copy and anything else are ignored, and a
 * document without an `ownerUid` yields no photos because ownership cannot be checked.
 */
export function getOwnListingImageUrls(listing: ListingPhotoSource & { ownerUid?: unknown }, limit?: number): string[] {
  if (typeof listing.ownerUid !== 'string' || !listing.ownerUid.trim()) return [];
  const pathPrefix = `users/${listing.ownerUid}/listing-photos/`;
  const photos = Array.isArray(listing.listingPhotos)
    ? listing.listingPhotos
    : listing.listingPhotos && typeof listing.listingPhotos === 'object'
      ? Object.values(listing.listingPhotos as Record<string, unknown>)
      : [];

  const ownUrls = [
    ...new Set(
      photos
        .map((photo, index) => ({ photo, index }))
        .filter(({ photo }) => {
          const storagePath = photo && typeof photo === 'object' ? (photo as Record<string, unknown>).storagePath : undefined;
          return typeof storagePath === 'string' && storagePath.startsWith(pathPrefix);
        })
        .sort((first, second) => photoOrder(first.photo) - photoOrder(second.photo) || first.index - second.index)
        .map(({ photo }) => findPhotoUrl(photo))
        .filter((url): url is string => Boolean(url) && isTrustedPhotoUrl(url!))
    )
  ];

  const ownUrlSet = new Set(ownUrls);
  const coverUrl = [listing.generatedSummary?.coverImageUrl, listing.coverImageUrl, listing.coverImage]
    .map(findPhotoUrl)
    .find((url) => url && ownUrlSet.has(url));
  const urls = coverUrl ? [coverUrl, ...ownUrls.filter((url) => url !== coverUrl)] : ownUrls;
  return limit === undefined ? urls : urls.slice(0, limit);
}
