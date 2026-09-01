import { deleteField, doc, getDoc, serverTimestamp, Timestamp, updateDoc, writeBatch } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { firebaseAuth, firebaseDb, firebaseStorage } from './firebase';

export type UploadedListingPhoto = {
  id: string;
  url: string;
  storagePath: string;
  originalName: string;
  contentType: string;
  size: number;
  uploadedAt: Timestamp;
};

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

export async function updateListingPhotoTour(
  listingId: string,
  photoUrls: string[],
  roomLabels: string[],
  descriptions?: string[]
): Promise<void> {
  const currentUser = firebaseAuth?.currentUser;

  if (!currentUser) throw new Error('You must be signed in to update a photo tour.');
  if (!firebaseDb) throw new Error('Firestore is not configured.');
  if (photoUrls.length !== roomLabels.length) {
    throw new Error('Every listing photo must have a matching room assignment.');
  }

  const reference = doc(firebaseDb, 'annonceslisting', listingId);
  const listingSnapshot = await getDoc(reference);
  if (!listingSnapshot.exists() || listingSnapshot.data().userUid !== currentUser.uid) {
    throw new Error('This listing does not belong to the signed-in user.');
  }

  const storedListingPhotos = isRecord(listingSnapshot.data().listingPhotos)
    ? listingSnapshot.data().listingPhotos
    : {};
  const photoIdsByUrl = new Map<string, string>();
  Object.entries(storedListingPhotos).forEach(([storedPhotoId, storedPhoto]) => {
    if (!isRecord(storedPhoto)) return;
    const storedPhotoUrl = typeof storedPhoto.url === 'string' ? storedPhoto.url : undefined;
    const photoId = typeof storedPhoto.id === 'string' ? storedPhoto.id : storedPhotoId;
    if (storedPhotoUrl) photoIdsByUrl.set(storedPhotoUrl, photoId);
  });
  const storedDescriptionsByUrl = new Map<string, string>();
  const storedPhotoTour = listingSnapshot.data().photoTour;
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

  await updateDoc(reference, {
    photoTour: {
      version: 1,
      rooms,
      photoAssignments,
      unassignedPhotos,
      updatedAt: serverTimestamp()
    },
    updatedAt: serverTimestamp()
  });
}

export async function setListingCoverPhoto(listingId: string, photoUrl: string): Promise<void> {
  const currentUser = firebaseAuth?.currentUser;
  if (!currentUser) throw new Error('You must be signed in to update a listing photo.');
  if (!firebaseDb) throw new Error('Firestore is not configured.');

  const reference = doc(firebaseDb, 'annonceslisting', listingId);
  const snapshot = await getDoc(reference);
  if (!snapshot.exists() || snapshot.data().userUid !== currentUser.uid) {
    throw new Error('This listing does not belong to the signed-in user.');
  }

  await updateDoc(reference, { coverImageUrl: photoUrl, updatedAt: serverTimestamp() });
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
  const snapshot = await getDoc(reference);
  if (!snapshot.exists() || snapshot.data().userUid !== currentUser.uid) {
    throw new Error('This listing does not belong to the signed-in user.');
  }

  const storedPhotos = isRecord(snapshot.data().listingPhotos)
    ? snapshot.data().listingPhotos
    : {};
  const urlsToDelete = new Set(photoUrlsToDelete);
  const matchingEntries = Object.entries(storedPhotos).filter(([, value]) =>
    isRecord(value) && typeof value.url === 'string' && urlsToDelete.has(value.url)
  );
  const storagePaths = matchingEntries.flatMap(([, photo]) =>
    isRecord(photo) && typeof photo.storagePath === 'string' ? [photo.storagePath] : []
  );

  await updateListingPhotoTour(
    listingId,
    remainingPhotoUrls,
    remainingRoomLabels,
    remainingDescriptions
  );

  const coverImageUrl = urlsToDelete.has(snapshot.data().coverImageUrl)
    ? remainingPhotoUrls[0] ?? ''
    : snapshot.data().coverImageUrl;
  await updateDoc(reference, {
    ...Object.fromEntries(
      matchingEntries.map(([photoId]) => [`listingPhotos.${photoId}`, deleteField()])
    ),
    coverImageUrl,
    updatedAt: serverTimestamp()
  });

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
  if (files.length === 0) throw new Error('Select at least one photo to upload.');

  const storage = firebaseStorage;
  const uploadedPhotos: UploadedListingPhotoMap = {};
  const uploadedStoragePaths: string[] = [];

  if (listingId) {
    const listingSnapshot = await getDoc(doc(firebaseDb, 'annonceslisting', listingId));
    if (!listingSnapshot.exists() || listingSnapshot.data().userUid !== currentUser.uid) {
      throw new Error('This listing draft does not belong to the signed-in user.');
    }
  }

  try {
    for (const [index, file] of files.entries()) {
      if (!file.type.startsWith('image/')) throw new Error(`${file.name} is not a supported image file.`);

      const photoId = createPhotoId(index);
      const storagePath = `users/${currentUser.uid}/listing-photos/${photoId}-${sanitizeFileName(file.name)}`;
      const storageReference = ref(storage, storagePath);
      const uploadResult = await uploadBytes(storageReference, file, {
        contentType: file.type,
        customMetadata: {
          ownerId: currentUser.uid,
          photoId,
          ...(listingId ? { listingId } : {})
        }
      });
      const url = await getDownloadURL(uploadResult.ref);

      uploadedStoragePaths.push(storagePath);
      uploadedPhotos[photoId] = {
        id: photoId,
        url,
        storagePath,
        originalName: file.name,
        contentType: file.type,
        size: file.size,
        uploadedAt: Timestamp.now()
      };
      onProgress?.(index + 1, files.length);
    }

    const photoWriteBatch = writeBatch(firebaseDb);
    photoWriteBatch.set(
      doc(firebaseDb, 'users', currentUser.uid),
      {
        listingPhotos: uploadedPhotos,
        updatedAt: serverTimestamp()
      },
      {
        mergeFields: [
          ...Object.keys(uploadedPhotos).map((photoId) => `listingPhotos.${photoId}`),
          'updatedAt'
        ]
      }
    );

    if (listingId) {
      const coverImageUrl = Object.values(uploadedPhotos)[0]?.url;
      photoWriteBatch.set(
        doc(firebaseDb, 'annonceslisting', listingId),
        {
          listingPhotos: uploadedPhotos,
          ...(coverImageUrl ? { coverImageUrl } : {}),
          updatedAt: serverTimestamp()
        },
        {
          mergeFields: [
            ...Object.keys(uploadedPhotos).map((photoId) => `listingPhotos.${photoId}`),
            ...(coverImageUrl ? ['coverImageUrl'] : []),
            'updatedAt'
          ]
        }
      );
    }

    await photoWriteBatch.commit();

    return uploadedPhotos;
  } catch (error) {
    await Promise.allSettled(
      uploadedStoragePaths.map((storagePath) => deleteObject(ref(storage, storagePath)))
    );
    throw error;
  }
}
