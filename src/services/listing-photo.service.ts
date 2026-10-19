import type { ListingPhoto } from '../domain/listing';
import { getOwnListingImageUrls } from '../domain/listing-photos';

// Photo writes only consider photos this document owns (its `listingPhotos` under the owner's Storage
// folder), matching what the editor shows; legacy fields and nested copies are ignored.
const ownPhotoUrls = (data: Record<string, unknown>) => getOwnListingImageUrls(data);
import { doc, getDoc, serverTimestamp, Timestamp, runTransaction } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { firebaseAuth, firebaseDb, firebaseStorage } from './firebase';

export type UploadedListingPhoto = ListingPhoto;

export type UploadedListingPhotoMap = Record<string, UploadedListingPhoto>;

export type ListingPhotoTourPhoto = {
  id: string;
  url: string;
  order: number;
};

export type ListingPhotoTourAssignment = ListingPhotoTourPhoto & {
  description?: string;
  roomId: string | null;
  roomLabel: string;
};

export type ListingPhotoTourRoom = {
  id: string;
  label: string;
  photos: Record<string, ListingPhotoTourPhoto>;
};

const createPhotoId = (index: number) => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 10)}`;
};

const sanitizeFileName = (fileName: string) => {
  const normalizedName = fileName
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalizedName || 'listing-photo';
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === 'object' && !Array.isArray(value));

const createRoomId = (label: string) =>
  label
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'room';

export function getPhotoTourRoomLabels(
  photoTour: unknown,
  photoUrls: string[]
): Array<string | undefined> {
  if (!isRecord(photoTour) || !isRecord(photoTour.photoAssignments)) {
    return photoUrls.map(() => undefined);
  }

  const labelsByUrl = new Map<string, string>();
  Object.values(photoTour.photoAssignments).forEach((assignment) => {
    if (!isRecord(assignment)) return;
    const photoUrl = typeof assignment.url === 'string' ? assignment.url : undefined;
    const roomLabel = typeof assignment.roomLabel === 'string' ? assignment.roomLabel : undefined;
    if (photoUrl && roomLabel) labelsByUrl.set(photoUrl, roomLabel);
  });

  return photoUrls.map((photoUrl) => labelsByUrl.get(photoUrl));
}

export function getPhotoTourDescriptions(
  photoTour: unknown,
  photoUrls: string[]
): string[] {
  if (!isRecord(photoTour) || !isRecord(photoTour.photoAssignments)) {
    return photoUrls.map(() => '');
  }

  const descriptionsByUrl = new Map<string, string>();
  Object.values(photoTour.photoAssignments).forEach((assignment) => {
    if (!isRecord(assignment)) return;
    const photoUrl = typeof assignment.url === 'string' ? assignment.url : undefined;
    const description = typeof assignment.description === 'string' ? assignment.description : '';
    if (photoUrl) descriptionsByUrl.set(photoUrl, description);
  });

  return photoUrls.map((photoUrl) => descriptionsByUrl.get(photoUrl) ?? '');
}

function buildPhotoTour(
  data: Record<string, unknown>, photoUrls: string[], roomLabels: string[], descriptions?: string[]
) {
  const storedUrls = new Set(ownPhotoUrls(data));
  if (photoUrls.length !== roomLabels.length || (descriptions && descriptions.length !== photoUrls.length) ||
      new Set(photoUrls).size !== photoUrls.length || photoUrls.some(url => !storedUrls.has(url))) {
    throw new Error('The listing photos changed. Please reload and try again.');
  }
  const storedListingPhotos = isRecord(data.listingPhotos)
    ? data.listingPhotos
    : {};
  const photoIdsByUrl = new Map<string, string>();
  Object.entries(storedListingPhotos).forEach(([storedPhotoId, storedPhoto]) => {
    if (!isRecord(storedPhoto)) return;
    const storedPhotoUrl = typeof storedPhoto.url === 'string' ? storedPhoto.url : undefined;
    const photoId = typeof storedPhoto.id === 'string' ? storedPhoto.id : storedPhotoId;
    if (storedPhotoUrl) photoIdsByUrl.set(storedPhotoUrl, photoId);
  });
  const storedDescriptionsByUrl = new Map<string, string>();
  const storedPhotoTour = data.photoTour;
  if (isRecord(storedPhotoTour) && isRecord(storedPhotoTour.photoAssignments)) {
    Object.values(storedPhotoTour.photoAssignments).forEach((assignment) => {
      if (!isRecord(assignment)) return;
      const url = typeof assignment.url === 'string' ? assignment.url : undefined;
      const description = typeof assignment.description === 'string' ? assignment.description : '';
      if (url) storedDescriptionsByUrl.set(url, description);
    });
  }

  const rooms: Record<string, ListingPhotoTourRoom> = {};
  const photoAssignments: Record<string, ListingPhotoTourAssignment> = {};
  const unassignedPhotos: Record<string, ListingPhotoTourPhoto> = {};

  photoUrls.forEach((url, order) => {
    const id = photoIdsByUrl.get(url) ?? `legacy-photo-${order + 1}`;
    const roomLabel = roomLabels[order]?.trim() || 'Unassigned';
    const description = (descriptions?.[order] ?? storedDescriptionsByUrl.get(url) ?? '').trim();
    const photo = { id, url, order };
    const assignmentDetails = description ? { description } : {};

    if (roomLabel === 'Unassigned') {
      photoAssignments[id] = { ...photo, ...assignmentDetails, roomId: null, roomLabel };
      unassignedPhotos[id] = photo;
      return;
    }

    const roomId = createRoomId(roomLabel);
    rooms[roomId] ??= { id: roomId, label: roomLabel, photos: {} };
    rooms[roomId].photos[id] = photo;
    photoAssignments[id] = { ...photo, ...assignmentDetails, roomId, roomLabel };
  });

  return { version: 1, rooms, photoAssignments, unassignedPhotos, updatedAt: serverTimestamp() };
}

export async function updateListingPhotoTour(
  listingId: string, photoUrls: string[], roomLabels: string[], descriptions?: string[], coverPhotoUrl?: string
): Promise<void> {
  const currentUser = firebaseAuth?.currentUser;
  if (!currentUser || !firebaseDb) throw new Error('You must be signed in to update a photo tour.');
  const reference = doc(firebaseDb, 'annonceslisting', listingId);
  await runTransaction(firebaseDb, async transaction => {
    if (firebaseAuth?.currentUser !== currentUser) throw new Error('Your session changed. Please try again.');
    const snapshot = await transaction.get(reference);
    if (firebaseAuth?.currentUser !== currentUser || !snapshot.exists() || snapshot.data().userUid !== currentUser.uid || snapshot.data().ownerUid !== currentUser.uid) {
      throw new Error('This listing does not belong to the signed-in user.');
    }
    const data = snapshot.data();
    if (ownPhotoUrls(data).length !== photoUrls.length) throw new Error('The listing photos changed. Please reload and try again.');
    if (coverPhotoUrl !== undefined && !photoUrls.includes(coverPhotoUrl)) throw new Error('Choose a cover from this listing’s photos.');
    transaction.update(reference, {
      photoTour: buildPhotoTour(data, photoUrls, roomLabels, descriptions),
      ...(coverPhotoUrl !== undefined ? {
        coverImageUrl: coverPhotoUrl,
        ...(isRecord(data.generatedSummary) ? { generatedSummary: { ...data.generatedSummary, coverImageUrl: coverPhotoUrl } } : {})
      } : {}),
      updatedAt: serverTimestamp()
    });
  });
  if (firebaseAuth?.currentUser !== currentUser) throw new Error('Your session changed. Please try again.');
}

export async function setListingCoverPhoto(listingId: string, photoUrl: string): Promise<void> {
  const currentUser = firebaseAuth?.currentUser;
  if (!currentUser) throw new Error('You must be signed in to update a listing photo.');
  if (!firebaseDb) throw new Error('Firestore is not configured.');

  const reference = doc(firebaseDb, 'annonceslisting', listingId);
  await runTransaction(firebaseDb, async transaction => {
    if (firebaseAuth?.currentUser !== currentUser) throw new Error('Your session changed. Please try again.');
    const snapshot = await transaction.get(reference);
    if (firebaseAuth?.currentUser !== currentUser || !snapshot.exists() || snapshot.data().userUid !== currentUser.uid || snapshot.data().ownerUid !== currentUser.uid) {
      throw new Error('This listing does not belong to the signed-in user.');
    }
    const data = snapshot.data();
    if (!ownPhotoUrls(data).includes(photoUrl)) throw new Error('Choose a cover from this listing’s photos.');
    transaction.update(reference, {
      coverImageUrl: photoUrl,
      ...(isRecord(data.generatedSummary) ? { generatedSummary: { ...data.generatedSummary, coverImageUrl: photoUrl } } : {}),
      updatedAt: serverTimestamp()
    });
  });
  if (firebaseAuth?.currentUser !== currentUser) throw new Error('Your session changed. Please try again.');
}

export async function removeListingPhotos(
  listingId: string,
  photoUrlsToDelete: string[],
  remainingPhotoUrls: string[],
  remainingRoomLabels: string[],
  remainingDescriptions: string[]
): Promise<void> {
  const currentUser = firebaseAuth?.currentUser;
  if (!currentUser) throw new Error('You must be signed in to delete a listing photo.');
  if (!firebaseDb) throw new Error('Firestore is not configured.');

  const reference = doc(firebaseDb, 'annonceslisting', listingId);
  const storagePaths = await runTransaction(firebaseDb, async transaction => {
    if (firebaseAuth?.currentUser !== currentUser) throw new Error('Your session changed. Please try again.');
    const snapshot = await transaction.get(reference);
    if (firebaseAuth?.currentUser !== currentUser || !snapshot.exists() || snapshot.data().userUid !== currentUser.uid || snapshot.data().ownerUid !== currentUser.uid) {
      throw new Error('This listing does not belong to the signed-in user.');
    }
    const data = snapshot.data();
    const storedPhotos = isRecord(data.listingPhotos) ? data.listingPhotos : {};
    const urlsToDelete = new Set(photoUrlsToDelete);
    const remaining = ownPhotoUrls(data).filter(url => !urlsToDelete.has(url));
    if (remaining.length !== remainingPhotoUrls.length || remaining.some(url => !remainingPhotoUrls.includes(url))) {
      throw new Error('The listing photos changed. Please reload and try again.');
    }
    const matchingEntries = Object.entries(storedPhotos).filter(([, photo]) =>
      isRecord(photo) && typeof photo.url === 'string' && urlsToDelete.has(photo.url)
    );
    if (urlsToDelete.size !== photoUrlsToDelete.length || matchingEntries.length !== urlsToDelete.size) {
      throw new Error('Choose photos from this listing to remove.');
    }
    const removedIds = new Set(matchingEntries.map(([id]) => id));
    // Own list is cover-first, so its first entry is the current (own) cover.
    const previousCover = ownPhotoUrls(data)[0] ?? '';
    const coverImageUrl = urlsToDelete.has(previousCover) ? remainingPhotoUrls[0] ?? '' : previousCover;
    transaction.update(reference, {
      listingPhotos: Object.fromEntries(Object.entries(storedPhotos).filter(([id]) => !removedIds.has(id))),
      photoTour: buildPhotoTour(data, remainingPhotoUrls, remainingRoomLabels, remainingDescriptions),
      coverImageUrl,
      ...(isRecord(data.generatedSummary) ? { generatedSummary: { ...data.generatedSummary, coverImageUrl } } : {}),
      updatedAt: serverTimestamp()
    });
    return matchingEntries.flatMap(([, photo]) =>
      isRecord(photo) && typeof photo.storagePath === 'string' && photo.storagePath.startsWith(`users/${currentUser.uid}/listing-photos/`)
        ? [photo.storagePath] : []
    );
  });
  if (firebaseAuth?.currentUser !== currentUser) throw new Error('Your session changed. Please try again.');

  if (storagePaths.length > 0 && firebaseStorage) {
    const storage = firebaseStorage;
    await Promise.allSettled(
      storagePaths.map((storagePath) => deleteObject(ref(storage, storagePath)))
    );
  }
}

export async function uploadListingPhotos(
  files: File[],
  onProgress?: (completed: number, total: number) => void,
  listingId?: string
): Promise<UploadedListingPhotoMap> {
  const currentUser = firebaseAuth?.currentUser;

  if (!currentUser) throw new Error('You must be signed in to upload listing photos.');
  if (!firebaseStorage || !firebaseDb) throw new Error('Firebase Storage is not configured.');
  if (!listingId) throw new Error('We could not upload your photos. Please try again.');
  if (files.length === 0) throw new Error('Select at least one photo to upload.');

  const storage = firebaseStorage;
  const uploadedPhotos: UploadedListingPhotoMap = {};
  const uploadedStoragePaths: string[] = [];

  if (listingId) {
    const listingSnapshot = await getDoc(doc(firebaseDb, 'annonceslisting', listingId));
    if (firebaseAuth?.currentUser !== currentUser || !listingSnapshot.exists() || listingSnapshot.data().userUid !== currentUser.uid || listingSnapshot.data().ownerUid !== currentUser.uid) {
      throw new Error('This listing draft does not belong to the signed-in user.');
    }
  }

  try {
    for (const [index, file] of files.entries()) {
      if (firebaseAuth?.currentUser !== currentUser) throw new Error('Upload interrupted.');
      if (!file.size || !file.type.startsWith('image/')) throw new Error(`${file.name} is not a supported image file.`);

      const photoId = createPhotoId(index);
      const storagePath = `users/${currentUser.uid}/listing-photos/${listingId}-${photoId}-${sanitizeFileName(file.name)}`;
      const storageReference = ref(storage, storagePath);
      const uploadResult = await uploadBytes(storageReference, file, {
        contentType: file.type,
        customMetadata: {
          ownerId: currentUser.uid,
          photoId,
          ...(listingId ? { listingId } : {})
        }
      });
      uploadedStoragePaths.push(storagePath);
      const url = await getDownloadURL(uploadResult.ref);
      uploadedPhotos[photoId] = {
        id: photoId,
        url,
        storagePath,
        originalName: file.name,
        contentType: file.type,
        size: file.size,
        uploadedAt: Timestamp.now(),
        order: index
      };
      onProgress?.(index + 1, files.length);
    }

    await runTransaction(firebaseDb, async transaction => {
      if (firebaseAuth?.currentUser !== currentUser) throw new Error('Upload interrupted.');
      const reference = doc(firebaseDb!, 'annonceslisting', listingId);
      const snapshot = await transaction.get(reference);
      if (firebaseAuth?.currentUser !== currentUser || !snapshot.exists() || snapshot.data().userUid !== currentUser.uid || snapshot.data().ownerUid !== currentUser.uid || !['draft', 'action-required', 'published', 'active'].includes(snapshot.data().status)) throw new Error('Upload interrupted.');
      const existing = snapshot.data().listingPhotos ?? {};
      const nextOrder = Math.max(-1, ...Object.values(existing).map(p => Number((p as UploadedListingPhoto).order) || 0)) + 1;
      Object.values(uploadedPhotos).forEach((photo, index) => { photo.order = nextOrder + index; });
      transaction.update(reference, {
        listingPhotos: { ...existing, ...uploadedPhotos },
        coverImageUrl: snapshot.data().coverImageUrl || Object.values(uploadedPhotos)[0].url,
        updatedAt: serverTimestamp()
      });
    });

    return uploadedPhotos;
  } catch (error) {
    await Promise.allSettled(
      uploadedStoragePaths.map((storagePath) => deleteObject(ref(storage, storagePath)))
    );
    throw new Error('We could not upload your photos. Please try again.');
  }
}
