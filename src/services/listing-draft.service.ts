import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  runTransaction,
  where,
  type DocumentData,
  type Timestamp
} from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import { applyPropertyTypeChange, isValidListingGuestCount, listingBasePriceSchema, listingWeekendAdjustmentSchema, listingTitleSchema, normalizeFlowDraft, validateListing, record, type ValidationInput, type GeneratedSummary, type PropertyTypeChange, houseRulesSchema, type HouseRules, hasLegacyPhotoOrder } from '../domain/listing';
import { firebaseAuth, firebaseDb, firebaseStorage } from './firebase';
import { listingDescriptionSchema, parseListingAmenityIds } from '../domain/listing';
import { readPublishReadiness } from '../domain/publish-readiness';

export type ListingDraft = {
  id: string;
  userUid: string;
  ownerUid?: string;
  userRef?: unknown;
  contact?: DocumentData;
  status: 'draft' | 'action-required' | 'active' | 'published' | 'in-progress';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  resumePath?: string;
  resumePage?: string;
  confirmedLocation?: DocumentData;
  flowDraft?: DocumentData;
  coverImageUrl?: unknown;
  coverImage?: unknown;
  images?: unknown;
  photos?: unknown;
  listingPhotos?: DocumentData;
  photoTour?: DocumentData;
  houseRules?: DocumentData;
  user?: DocumentData;
  generatedSummary?: GeneratedListingSummary;
  generatedAt?: Timestamp;
};

export type GeneratedListingSummary = GeneratedSummary;

const requireCurrentUser = () => {
  const currentUser = firebaseAuth?.currentUser;
  if (!firebaseDb || !currentUser) {
    throw new Error('You must be signed in to manage listing drafts.');
  }

  return { db: firebaseDb, currentUser };
};

export async function listCurrentUserDrafts(): Promise<ListingDraft[]> {
  const { db, currentUser } = requireCurrentUser();
  const snapshot = await getDocs(
    query(
      collection(db, 'annonceslisting'),
      where('ownerUid', '==', currentUser.uid)
    )
  );

  assertSession(currentUser);
  return snapshot.docs
    .map((draftDocument) => ({
      ...draftDocument.data(),
      id: draftDocument.id
    }) as ListingDraft)
    .filter((draft) => draft.status === 'draft')
    .sort((first, second) => {
      const firstUpdatedAt = (first.updatedAt ?? first.createdAt)?.toMillis() ?? 0;
      const secondUpdatedAt = (second.updatedAt ?? second.createdAt)?.toMillis() ?? 0;
      return secondUpdatedAt - firstUpdatedAt;
    });
}

export async function listCurrentUserListings(): Promise<ListingDraft[]> {
  const { db, currentUser } = requireCurrentUser();
  const snapshot = await getDocs(
    query(collection(db, 'annonceslisting'), where('ownerUid', '==', currentUser.uid))
  );

  assertSession(currentUser);
  return snapshot.docs
    .map((listingDocument) => {
      const listingData = listingDocument.data();
      const coverImageUrl = getListingDocumentCoverImage(listingData);

      return {
        ...listingData,
        id: listingDocument.id,
        ...(coverImageUrl ? { coverImageUrl } : {})
      } as ListingDraft;
    })
    .sort((first, second) => {
      const firstUpdatedAt = (first.updatedAt ?? first.createdAt)?.toMillis() ?? 0;
      const secondUpdatedAt = (second.updatedAt ?? second.createdAt)?.toMillis() ?? 0;
      return secondUpdatedAt - firstUpdatedAt;
    });
}

export async function getCurrentUserListing(listingId: string): Promise<ListingDraft> {
  const { db, currentUser } = requireCurrentUser();
  const snapshot = await getDoc(doc(db, 'annonceslisting', listingId));

  if (!snapshot.exists() || snapshot.data().userUid !== currentUser.uid || snapshot.data().ownerUid !== currentUser.uid || firebaseAuth?.currentUser !== currentUser) {
    throw new Error('This listing does not exist or does not belong to the signed-in user.');
  }

  const listingData = snapshot.data();
  const coverImageUrl = getListingDocumentCoverImage(listingData);
  return {
    ...listingData,
    id: snapshot.id,
    ...(coverImageUrl ? { coverImageUrl } : {})
  } as ListingDraft;
}

// Follow one document; never trust identity fields supplied by the document itself.
export function subscribeToCurrentUserListing(
  listingId: string,
  onChange: (listing: ListingDraft) => void,
  onError: (error: Error) => void
): () => void {
  let active = true;
  let unsubscribe: (() => void) | undefined;
  const fail = () => {
    if (!active) return;
    active = false;
    unsubscribe?.();
    onError(new Error('We could not load your Booksa listing. Please try again.'));
  };

  try {
    const { db, currentUser } = requireCurrentUser();
    unsubscribe = onSnapshot(doc(db, 'annonceslisting', listingId), (snapshot) => {
      if (!active) return;
      let listing: ListingDraft;
      try {
        assertSession(currentUser);
        if (!snapshot.exists()) throw new Error();
        const data = snapshot.data();
        assertOwner(data, currentUser.uid);
        const coverImageUrl = getListingDocumentCoverImage(data);
        listing = { ...data, id: snapshot.id, ...(coverImageUrl ? { coverImageUrl } : {}) } as ListingDraft;
      } catch {
        fail();
        return;
      }
      onChange(listing);
    }, fail);
    if (!active) unsubscribe();
  } catch {
    fail();
  }

  return () => {
    active = false;
    unsubscribe?.();
  };
}

function findListingImageUrl(value: unknown): string | undefined {
  if (typeof value === 'string') return /^https?:\/\//i.test(value) ? value : undefined;
  if (Array.isArray(value)) return value.map(findListingImageUrl).find(Boolean);
  if (!value || typeof value !== 'object') return undefined;

  const image = value as Record<string, unknown>;
  for (const key of [
    'coverImageUrl',
    'coverPhotoUrl',
    'imageUrl',
    'photoUrl',
    'downloadURL',
    'downloadUrl',
    'url',
    'src'
  ]) {
    const imageUrl = findListingImageUrl(image[key]);
    if (imageUrl) return imageUrl;
  }
  return Object.values(image).map(findListingImageUrl).find(Boolean);
}

const isImageMap = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length > 0);

function getListingDocumentCoverImage(listingData: DocumentData) {
  const imageMaps = [
    listingData.listingPhotos,
    listingData.images,
    listingData.photos,
    listingData.user?.listingPhotos
  ];
  if (!imageMaps.some(isImageMap)) return undefined;

  return [
    listingData.generatedSummary?.coverImageUrl,
    listingData.coverImageUrl,
    listingData.coverPhotoUrl,
    listingData.coverImage,
    ...imageMaps
  ]
    .map(findListingImageUrl)
    .find(Boolean);
}

const WRITE_ERROR = 'We could not save your Booksa listing. Please review it and try again.';

const assertSession = (user: NonNullable<NonNullable<typeof firebaseAuth>['currentUser']>) => {
  if (firebaseAuth?.currentUser !== user) throw new Error(WRITE_ERROR);
};
const assertOwner = (data: DocumentData, uid: string) => {
  if (data.ownerUid !== uid || data.userUid !== uid) throw new Error(WRITE_ERROR);
};

export async function createCurrentUserDraft(): Promise<string> {
  try {
    const { db, currentUser } = requireCurrentUser();
    const reference = doc(collection(db, 'annonceslisting'));
    const userRef = doc(db, 'users', currentUser.uid);
    await runTransaction(db, async transaction => {
      assertSession(currentUser);
      const profile = await transaction.get(userRef);
      const existing = await transaction.get(reference);
      assertSession(currentUser);
      if (existing.exists()) { assertOwner(existing.data(), currentUser.uid); throw new Error(WRITE_ERROR); }
      const user = profile.data() ?? {};
      const text = (v: unknown) => typeof v === 'string' ? v : null;
      transaction.set(reference, {
        id: reference.id, userUid: currentUser.uid, ownerUid: currentUser.uid, userRef,
        contact: { uid: currentUser.uid, name: currentUser.displayName || text(user.name),
          email: currentUser.email || text(user.email), phoneNumber: currentUser.phoneNumber || text(user.phoneNumber), photoUrl: currentUser.photoURL || null },
        user: { ...user, uid: currentUser.uid }, status: 'draft', resumePath: '/host/listing/create', resumePage: 'address',
        createdAt: serverTimestamp(), updatedAt: serverTimestamp()
      }, { merge: true });
    });
    assertSession(currentUser);
    return reference.id;
  } catch { throw new Error(WRITE_ERROR); }
}

export async function generateCurrentUserListing(
  listingId: string, flowDraft: Record<string, unknown>, confirmedLocation: Record<string, unknown>, pendingPhotos: unknown[] = []
): Promise<GeneratedListingSummary> {
  try {
    const { db, currentUser } = requireCurrentUser();
    const result = await runTransaction(db, async transaction => {
      assertSession(currentUser);
      const reference = doc(db, 'annonceslisting', listingId);
      const snapshot = await transaction.get(reference);
      assertSession(currentUser);
      if (!snapshot.exists()) throw new Error(WRITE_ERROR);
      const data = snapshot.data();
      assertOwner(data, currentUser.uid);
      if (data.status !== 'draft') throw new Error(WRITE_ERROR);
      const validated = validateListing({ ...data, flowDraft, confirmedLocation, pendingPhotos }, currentUser.uid, true);
      if (!validated.valid || !validated.confirmedLocation) throw new Error(WRITE_ERROR);
      const flow = validated.flowDraft, location = validated.confirmedLocation;
      const generatedSummary: GeneratedListingSummary = {
        title: flow.listingTitle, type: flow.listingOption,
        location: [location.address.city, location.address.region, location.address.country].filter(Boolean).join(', '),
        basePrice: flow.basePrice, currency: 'CDF', coverImageUrl: data.coverImageUrl
      };
      transaction.update(reference, {
        flowDraft: flow, confirmedLocation: location, listingPhotos: validated.listingPhotos,
        coverImageUrl: data.coverImageUrl, status: 'action-required', generatedAt: serverTimestamp(), updatedAt: serverTimestamp(),
        generatedSummary, title: flow.listingTitle, description: flow.listingDescription, basePrice: flow.basePrice,
        imageUrls: Object.values(validated.listingPhotos).sort((a,b) => a.order - b.order).map(p => p.url), resumePage: 'completion'
      });
      return generatedSummary;
    });
    assertSession(currentUser);
    return result;
  } catch { throw new Error(WRITE_ERROR); }
}

const FINALIZED_EDITABLE_STATUSES = new Set(['action-required', 'published', 'active']);

export async function updateCurrentUserListingAmenities(listingId: string, amenityIds: string[]): Promise<void> {
  try {
    const { db, currentUser } = requireCurrentUser();
    await runTransaction(db, async transaction => {
      assertSession(currentUser);
      const reference = doc(db, 'annonceslisting', listingId);
      const snapshot = await transaction.get(reference);
      assertSession(currentUser);
      if (!snapshot.exists()) throw new Error(WRITE_ERROR);
      const data = snapshot.data();
      assertOwner(data, currentUser.uid);
      const validated = parseListingAmenityIds(data.flowDraft, amenityIds);
      if (!FINALIZED_EDITABLE_STATUSES.has(data.status) || validated === null) throw new Error(WRITE_ERROR);
      transaction.update(reference, {
        flowDraft: { ...record(data.flowDraft), amenityIds: validated },
        updatedAt: serverTimestamp()
      });
    });
    assertSession(currentUser);
  } catch { throw new Error(WRITE_ERROR); }
}

export async function updateCurrentUserListingDescription(listingId: string, description: string): Promise<string> {
  try {
    const listingDescription = listingDescriptionSchema.parse(description);
    const { db, currentUser } = requireCurrentUser();
    await runTransaction(db, async transaction => {
      assertSession(currentUser);
      const reference = doc(db, 'annonceslisting', listingId);
      const snapshot = await transaction.get(reference);
      assertSession(currentUser);
      if (!snapshot.exists()) throw new Error(WRITE_ERROR);
      const data = snapshot.data();
      assertOwner(data, currentUser.uid);
      if (!FINALIZED_EDITABLE_STATUSES.has(data.status)) throw new Error(WRITE_ERROR);
      transaction.update(reference, {
        flowDraft: { ...record(data.flowDraft), listingDescription },
        description: listingDescription,
        updatedAt: serverTimestamp()
      });
    });
    assertSession(currentUser);
    return listingDescription;
  } catch { throw new Error(WRITE_ERROR); }
}

export async function updateCurrentUserListingGuestCount(listingId: string, guests: number): Promise<number> {
  try {
    const { db, currentUser } = requireCurrentUser();
    await runTransaction(db, async transaction => {
      assertSession(currentUser);
      const reference = doc(db, 'annonceslisting', listingId);
      const snapshot = await transaction.get(reference);
      assertSession(currentUser);
      if (!snapshot.exists()) throw new Error(WRITE_ERROR);
      const data = snapshot.data();
      assertOwner(data, currentUser.uid);
      if (!FINALIZED_EDITABLE_STATUSES.has(data.status) || !isValidListingGuestCount(data.flowDraft, guests)) throw new Error(WRITE_ERROR);
      const flowDraft = record(data.flowDraft);
      transaction.update(reference, {
        flowDraft: { ...flowDraft, listingBasics: { ...record(flowDraft.listingBasics), guests } },
        updatedAt: serverTimestamp()
      });
    });
    assertSession(currentUser);
    return guests;
  } catch { throw new Error(WRITE_ERROR); }
}

// Saves house rules and the guest maximum together, so the House rules page commits in one write.
export async function updateCurrentUserListingHouseRules(
  listingId: string, update: { houseRules: HouseRules; guests: number }
): Promise<{ houseRules: HouseRules; guests: number }> {
  try {
    const parsedRules = houseRulesSchema.safeParse(update.houseRules);
    if (!parsedRules.success) throw new Error(WRITE_ERROR);
    const { db, currentUser } = requireCurrentUser();
    await runTransaction(db, async transaction => {
      assertSession(currentUser);
      const reference = doc(db, 'annonceslisting', listingId);
      const snapshot = await transaction.get(reference);
      assertSession(currentUser);
      if (!snapshot.exists()) throw new Error(WRITE_ERROR);
      const data = snapshot.data();
      assertOwner(data, currentUser.uid);
      if (!FINALIZED_EDITABLE_STATUSES.has(data.status) || !isValidListingGuestCount(data.flowDraft, update.guests)) throw new Error(WRITE_ERROR);
      const flowDraft = record(data.flowDraft);
      transaction.update(reference, {
        houseRules: parsedRules.data,
        flowDraft: { ...flowDraft, listingBasics: { ...record(flowDraft.listingBasics), guests: update.guests } },
        updatedAt: serverTimestamp()
      });
    });
    assertSession(currentUser);
    return { houseRules: parsedRules.data, guests: update.guests };
  } catch { throw new Error(WRITE_ERROR); }
}

export async function updateCurrentUserListingWeekendAdjustment(listingId: string, adjustment: number): Promise<number> {
  try {
    const weekendAdjustment = listingWeekendAdjustmentSchema.parse(adjustment);
    const { db, currentUser } = requireCurrentUser();
    await runTransaction(db, async transaction => {
      assertSession(currentUser);
      const reference = doc(db, 'annonceslisting', listingId);
      const snapshot = await transaction.get(reference);
      assertSession(currentUser);
      if (!snapshot.exists()) throw new Error(WRITE_ERROR);
      const data = snapshot.data();
      assertOwner(data, currentUser.uid);
      if (!FINALIZED_EDITABLE_STATUSES.has(data.status)) throw new Error(WRITE_ERROR);
      transaction.update(reference, {
        flowDraft: { ...record(data.flowDraft), weekendAdjustment },
        updatedAt: serverTimestamp()
      });
    });
    assertSession(currentUser);
    return weekendAdjustment;
  } catch { throw new Error(WRITE_ERROR); }
}

export async function updateCurrentUserListingBasePrice(listingId: string, price: number): Promise<number> {
  try {
    const basePrice = listingBasePriceSchema.parse(price);
    const { db, currentUser } = requireCurrentUser();
    await runTransaction(db, async transaction => {
      assertSession(currentUser);
      const reference = doc(db, 'annonceslisting', listingId);
      const snapshot = await transaction.get(reference);
      assertSession(currentUser);
      if (!snapshot.exists()) throw new Error(WRITE_ERROR);
      const data = snapshot.data();
      assertOwner(data, currentUser.uid);
      if (!FINALIZED_EDITABLE_STATUSES.has(data.status)) throw new Error(WRITE_ERROR);
      transaction.update(reference, {
        flowDraft: { ...record(data.flowDraft), basePrice },
        generatedSummary: { ...record(data.generatedSummary), basePrice },
        basePrice,
        updatedAt: serverTimestamp()
      });
    });
    assertSession(currentUser);
    return basePrice;
  } catch { throw new Error(WRITE_ERROR); }
}

// Edits the title of a finalized listing without touching its status. Drafts keep using the wizard sync.
export async function updateCurrentUserListingTitle(listingId: string, title: string): Promise<string> {
  try {
    const parsedTitle = listingTitleSchema.safeParse(title);
    if (!parsedTitle.success) throw new Error(WRITE_ERROR);
    const listingTitle = parsedTitle.data;
    const { db, currentUser } = requireCurrentUser();
    await runTransaction(db, async transaction => {
      assertSession(currentUser);
      const reference = doc(db, 'annonceslisting', listingId);
      const snapshot = await transaction.get(reference);
      assertSession(currentUser);
      if (!snapshot.exists()) throw new Error(WRITE_ERROR);
      const data = snapshot.data();
      assertOwner(data, currentUser.uid);
      if (!FINALIZED_EDITABLE_STATUSES.has(data.status)) throw new Error(WRITE_ERROR);
      transaction.update(reference, {
        flowDraft: { ...record(data.flowDraft), listingTitle },
        generatedSummary: { ...record(data.generatedSummary), title: listingTitle },
        title: listingTitle,
        updatedAt: serverTimestamp()
      });
    });
    assertSession(currentUser);
    return listingTitle;
  } catch { throw new Error(WRITE_ERROR); }
}

// Edits property and listing type of a finalized listing. The category stays fixed and the status is untouched.
export async function updateCurrentUserListingPropertyType(listingId: string, change: PropertyTypeChange): Promise<PropertyTypeChange> {
  try {
    const { db, currentUser } = requireCurrentUser();
    await runTransaction(db, async transaction => {
      assertSession(currentUser);
      const reference = doc(db, 'annonceslisting', listingId);
      const snapshot = await transaction.get(reference);
      assertSession(currentUser);
      if (!snapshot.exists()) throw new Error(WRITE_ERROR);
      const data = snapshot.data();
      assertOwner(data, currentUser.uid);
      if (!FINALIZED_EDITABLE_STATUSES.has(data.status)) throw new Error(WRITE_ERROR);
      const applied = applyPropertyTypeChange(data.flowDraft, {
        listingOption: change.listingOption, placeAccess: change.placeAccess, everyBedroomHasLock: change.everyBedroomHasLock
      });
      if (!applied.valid) throw new Error(WRITE_ERROR);
      transaction.update(reference, {
        flowDraft: applied.flowDraft,
        generatedSummary: { ...record(data.generatedSummary), type: change.listingOption },
        updatedAt: serverTimestamp()
      });
    });
    assertSession(currentUser);
    return change;
  } catch { throw new Error(WRITE_ERROR); }
}

export type ListingPublishErrorCode = 'verification-required' | 'not-publishable' | 'generic';
export class ListingPublishError extends Error {
  constructor(public readonly code: ListingPublishErrorCode) {
    super('We could not publish your Booksa listing. Please try again.');
    this.name = 'ListingPublishError';
  }
}

/**
 * `action-required → published`. Ownership, status and the host's phone/identity verification
 * are re-read inside the transaction so a stale editor can never publish an unverified listing.
 * The same transaction records the listing in `users/{uid}.readyListings.{listingId}`.
 * Already published or active listings are returned unchanged, only backfilling a missing ready entry.
 */
export async function publishCurrentUserListing(listingId: string): Promise<'published' | 'active'> {
  try {
    // The id becomes a Firestore field path segment below; auto-generated ids always match.
    if (!/^[A-Za-z0-9_-]{1,128}$/.test(listingId)) throw new ListingPublishError('not-publishable');
    const { db, currentUser } = requireCurrentUser();
    const status = await runTransaction(db, async transaction => {
      assertSession(currentUser);
      const reference = doc(db, 'annonceslisting', listingId);
      const userRef = doc(db, 'users', currentUser.uid);
      const snapshot = await transaction.get(reference);
      const profile = await transaction.get(userRef);
      assertSession(currentUser);
      if (!snapshot.exists()) throw new ListingPublishError('not-publishable');
      const data = snapshot.data();
      assertOwner(data, currentUser.uid);
      const profileData = profile.exists() ? profile.data() : null;
      const markReady = () => transaction.set(userRef, {
        readyListings: { [listingId]: { listingId, status: 'ready', readyAt: serverTimestamp() } },
        updatedAt: serverTimestamp()
      }, { mergeFields: [`readyListings.${listingId}`, 'updatedAt'] });
      if (data.status === 'published' || data.status === 'active') {
        if (record(record(profileData?.readyListings)[listingId]).status !== 'ready') markReady();
        return data.status as 'published' | 'active';
      }
      if (data.status !== 'action-required') throw new ListingPublishError('not-publishable');
      if (!readPublishReadiness(profileData, currentUser.uid).ready) {
        throw new ListingPublishError('verification-required');
      }
      transaction.update(reference, { status: 'published', publishedAt: serverTimestamp(), updatedAt: serverTimestamp() });
      markReady();
      return 'published' as const;
    });
    assertSession(currentUser);
    return status;
  } catch (error) {
    throw error instanceof ListingPublishError ? error : new ListingPublishError('generic');
  }
}

const findStoragePaths = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.flatMap(findStoragePaths);
  if (!value || typeof value !== 'object') return [];

  const record = value as Record<string, unknown>;
  const ownPath = typeof record.storagePath === 'string' ? [record.storagePath] : [];
  return [...ownPath, ...Object.values(record).flatMap(findStoragePaths)];
};

export async function removeCurrentUserDraft(listingId: string): Promise<void> {
  const { db, currentUser } = requireCurrentUser();
  const reference = doc(db, 'annonceslisting', listingId);
  const snapshot = await getDoc(reference);

  if (!snapshot.exists() || snapshot.data().userUid !== currentUser.uid || snapshot.data().ownerUid !== currentUser.uid || firebaseAuth?.currentUser !== currentUser) {
    throw new Error('This listing draft does not belong to the signed-in user.');
  }
  if (snapshot.data().status !== 'draft' && snapshot.data().status !== 'in-progress') {
    throw new Error('Only listings that are in progress can be removed here.');
  }

  const storagePaths = [...new Set(findStoragePaths(snapshot.data().listingPhotos))];
  await deleteDoc(reference);

  if (firebaseStorage && storagePaths.length > 0) {
    const storage = firebaseStorage;
    await Promise.allSettled(
      storagePaths.map((storagePath) => deleteObject(ref(storage, storagePath)))
    );
  }
}

export async function updateCurrentUserDraft(listingId: string, updates: Record<string, unknown>): Promise<void> {
  try {
    const { db, currentUser } = requireCurrentUser();
    await runTransaction(db, async transaction => {
      assertSession(currentUser);
      const reference = doc(db, 'annonceslisting', listingId);
      const snapshot = await transaction.get(reference);
      assertSession(currentUser);
      if (!snapshot.exists()) throw new Error(WRITE_ERROR);
      const data = snapshot.data();
      assertOwner(data, currentUser.uid);
      if (['action-required', 'published', 'active'].includes(data.status)) return;
      if (data.status !== 'draft') throw new Error(WRITE_ERROR);
      const editable: Record<string, unknown> = {};
      for (const key of ['flowDraft', 'addressDraft', 'confirmedLocation', 'mapPosition', 'resumePath', 'resumePage', 'listingPhotos', 'coverImageUrl', 'photoCleanupPaths']) {
        if (updates[key] !== undefined) editable[key] = updates[key];
      }
      if (editable.confirmedLocation && !editable.addressDraft) editable.addressDraft = record(editable.confirmedLocation).address;
      const candidate = { ...data, ...editable };
      const result = validateListing(candidate as ValidationInput, currentUser.uid);
      if (!result.valid) throw new Error(WRITE_ERROR);
      if (editable.flowDraft) editable.flowDraft = normalizeFlowDraft(editable.flowDraft);
      if (editable.confirmedLocation) editable.confirmedLocation = result.confirmedLocation;
      if (editable.listingPhotos || hasLegacyPhotoOrder(data.listingPhotos)) editable.listingPhotos = result.listingPhotos;
      if (editable.photoCleanupPaths && (!Array.isArray(editable.photoCleanupPaths) || !editable.photoCleanupPaths.every(p => typeof p === 'string' && p.startsWith(`users/${currentUser.uid}/listing-photos/`)))) throw new Error(WRITE_ERROR);
      if (editable.resumePath !== undefined && typeof editable.resumePath !== 'string') throw new Error(WRITE_ERROR);
      if (editable.mapPosition) {
        const position = record(editable.mapPosition);
        if (typeof position.latitude !== 'number' || !Number.isFinite(position.latitude) || Math.abs(position.latitude) > 90 || typeof position.longitude !== 'number' || !Number.isFinite(position.longitude) || Math.abs(position.longitude) > 180) throw new Error(WRITE_ERROR);
      }
      if (editable.mapPosition) { const p = record(editable.mapPosition); editable.mapPosition = { latitude: p.latitude, longitude: p.longitude }; }
      const address = record(candidate.addressDraft);
      transaction.update(reference, {
        ...editable, id: listingId, status: 'draft',
        address: ['streetAddress', 'apartment', 'city', 'region', 'postalCode', 'country'].map(k => address[k]).filter(Boolean).join(', '),
        countryRegion: address.country ?? '', streetAddress: address.streetAddress ?? '', updatedAt: serverTimestamp()
      });
    });
    assertSession(currentUser);
  } catch { throw new Error(WRITE_ERROR); }
}

// Keep progress writes ordered across wizard sections and Save & exit.
const pendingDraftUpdates = new Map<string, Promise<void>>();

export async function queueCurrentUserDraftUpdate(listingId: string, updates: Record<string, unknown>): Promise<void> {
  const { currentUser } = requireCurrentUser();
  const previous = pendingDraftUpdates.get(listingId) ?? Promise.resolve();
  const pending = previous.catch(() => {}).then(async () => {
    assertSession(currentUser);
    await updateCurrentUserDraft(listingId, updates);
  });
  pendingDraftUpdates.set(listingId, pending);

  try {
    await pending;
  } finally {
    if (pendingDraftUpdates.get(listingId) === pending) pendingDraftUpdates.delete(listingId);
  }
}
