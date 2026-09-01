import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
  type Timestamp
} from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import { firebaseAuth, firebaseDb, firebaseStorage } from './firebase';

export type ListingDraft = {
  id: string;
  userUid: string;
  ownerUid?: string;
  userRef?: unknown;
  contact?: DocumentData;
  status: 'draft' | 'action-required' | 'active' | 'in-progress';
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
  user?: DocumentData;
  generatedListing?: GeneratedListingSummary;
  generatedAt?: Timestamp;
};

export type GeneratedListingSummary = {
  title: string;
  type: string;
  location: string;
  basePrice: number;
  currency: 'CDF';
  coverImageUrl?: string;
};

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
      where('userUid', '==', currentUser.uid)
    )
  );

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
    query(collection(db, 'annonceslisting'), where('userUid', '==', currentUser.uid))
  );

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

  if (!snapshot.exists() || snapshot.data().userUid !== currentUser.uid) {
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

const toDisplayLabel = (value: unknown, fallback: string) => {
  if (typeof value !== 'string' || !value.trim()) return fallback;
  return value
    .trim()
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

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
    listingData.generatedListing?.coverImageUrl,
    listingData.coverImageUrl,
    listingData.coverPhotoUrl,
    listingData.coverImage,
    ...imageMaps
  ]
    .map(findListingImageUrl)
    .find(Boolean);
}

export async function generateCurrentUserListing(
  listingId: string,
  flowDraft: Record<string, unknown>,
  confirmedLocation: Record<string, unknown>
): Promise<GeneratedListingSummary> {
  const { db, currentUser } = requireCurrentUser();
  const reference = doc(db, 'annonceslisting', listingId);
  const snapshot = await getDoc(reference);

  if (!snapshot.exists() || snapshot.data().userUid !== currentUser.uid) {
    throw new Error('This listing draft does not belong to the signed-in user.');
  }

  const listingData = snapshot.data();
  const coverImageUrl = getListingDocumentCoverImage(listingData);

  const address =
    confirmedLocation.address && typeof confirmedLocation.address === 'object'
      ? (confirmedLocation.address as Record<string, unknown>)
      : {};
  const locationParts = [address.city, address.region, address.country].filter(
    (part): part is string => typeof part === 'string' && Boolean(part.trim())
  );
  const basePrice =
    typeof flowDraft.basePrice === 'number' && Number.isFinite(flowDraft.basePrice)
      ? flowDraft.basePrice
      : 0;
  const generatedListing: GeneratedListingSummary = {
    title:
      typeof flowDraft.listingTitle === 'string' && flowDraft.listingTitle.trim()
        ? flowDraft.listingTitle.trim()
        : 'Untitled listing',
    type: toDisplayLabel(flowDraft.listingOption, 'Property'),
    location: locationParts.join(', ') || 'Location not provided',
    basePrice,
    currency: 'CDF',
    ...(coverImageUrl ? { coverImageUrl } : {})
  };

  await updateDoc(reference, {
    status: 'action-required',
    flowDraft,
    confirmedLocation,
    generatedListing,
    generatedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return generatedListing;
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

  if (!snapshot.exists() || snapshot.data().userUid !== currentUser.uid) {
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

export async function updateCurrentUserDraft(
  listingId: string,
  updates: Record<string, unknown>
): Promise<void> {
  const { db, currentUser } = requireCurrentUser();
  const reference = doc(db, 'annonceslisting', listingId);
  const snapshot = await getDoc(reference);

  if (!snapshot.exists() || snapshot.data().userUid !== currentUser.uid) {
    throw new Error('This listing draft does not belong to the signed-in user.');
  }

  await updateDoc(reference, {
    ...updates,
    updatedAt: serverTimestamp()
  });
}
