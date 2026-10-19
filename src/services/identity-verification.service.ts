import { doc, getDoc, runTransaction, serverTimestamp, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';
import { firebaseAuth, firebaseDb, firebaseStorage } from './firebase';
import {
  IDENTITY_REVIEW_DELAY_MS,
  identityDetailsSchema,
  readIdentityVerification,
  selfieMetadataSchema,
  selfieStoragePath,
  selfieUploadSchema,
  sha256Hex,
  type IdentityDetails,
  type IdentityVerificationState,
  type SelfieMetadata,
  type SelfieUploadInput
} from '@/domain/identity-verification';

export type SelfieSubmissionErrorCode = 'unauthenticated' | 'session-changed' | 'invalid-image' | 'invalid-details' | 'already-verified' | 'upload-failed' | 'save-failed' | 'unavailable';
export class SelfieSubmissionError extends Error {
  constructor(public readonly code: SelfieSubmissionErrorCode) {
    super('Your selfie could not be submitted. Please try again.');
    this.name = 'SelfieSubmissionError';
  }
}

// Retain only Storage metadata after an uncertain Firestore failure so retries can
// reuse the uploaded object. Never delete an object whose commit may have succeeded.
const pendingUploads = new Map<string, SelfieMetadata>();
const object = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};

export async function submitCurrentUserSelfie(input: SelfieUploadInput): Promise<SelfieMetadata> {
  const user = firebaseAuth?.currentUser;
  if (!user) throw new SelfieSubmissionError('unauthenticated');
  const db = firebaseDb;
  const storage = firebaseStorage;
  if (!db || !storage) throw new SelfieSubmissionError('unavailable');
  const assertSession = () => {
    if (firebaseAuth?.currentUser !== user || user.uid !== input.expectedOwnerUid) {
      throw new SelfieSubmissionError('session-changed');
    }
  };
  assertSession();
  const parsed = selfieUploadSchema.safeParse(input);
  if (!parsed.success) throw new SelfieSubmissionError('invalid-image');
  const { photoId, image, width, height } = parsed.data;
  const bytes = await image.arrayBuffer();
  assertSession();
  const signature = new Uint8Array(bytes, 0, Math.min(3, bytes.byteLength));
  if (signature[0] !== 0xff || signature[1] !== 0xd8 || signature[2] !== 0xff) {
    throw new SelfieSubmissionError('invalid-image');
  }
  const sha256 = await sha256Hex(bytes);
  assertSession();
  const storagePath = selfieStoragePath(user.uid, photoId);
  const key = `${user.uid}:${photoId}`;
  const userRef = doc(db, 'users', user.uid);
  const existingPhoto = (profile: unknown): SelfieMetadata | null => {
    const candidate = object(object(object(profile).identityVerificationSubmission).selfie);
    if (candidate.id !== photoId) return null;
    const { uploadedAt: _uploadedAt, ...metadata } = candidate;
    const result = selfieMetadataSchema.safeParse(metadata);
    if (!result.success || result.data.storagePath !== storagePath || result.data.sha256 !== sha256 ||
        result.data.width !== width || result.data.height !== height || result.data.size !== image.size) {
      throw new SelfieSubmissionError('invalid-image');
    }
    return result.data;
  };

  const profile = await getDoc(userRef);
  assertSession();
  const committed = existingPhoto(profile.data());
  if (committed) { pendingUploads.delete(key); return committed; }
  let metadata = pendingUploads.get(key);
  if (metadata && (metadata.sha256 !== sha256 || metadata.width !== width || metadata.height !== height)) {
    throw new SelfieSubmissionError('invalid-image');
  }
  if (!metadata) {
    try {
      const result = await uploadBytes(ref(storage, storagePath), image, {
        contentType: 'image/jpeg',
        customMetadata: { ownerUid: user.uid, photoId, purpose: 'identity-verification' }
      });
      assertSession();
      metadata = selfieMetadataSchema.parse({
        id: photoId, storagePath: result.ref.fullPath, bucket: result.metadata.bucket,
        generation: result.metadata.generation, contentType: result.metadata.contentType,
        size: result.metadata.size, width, height, sha256
      });
      if (metadata.storagePath !== storagePath || metadata.size !== image.size) throw new SelfieSubmissionError('upload-failed');
      pendingUploads.set(key, metadata);
    } catch (error) {
      if (error instanceof SelfieSubmissionError) throw error;
      throw new SelfieSubmissionError('upload-failed');
    }
  }

  const photo = metadata;
  assertSession();
  try {
    await runTransaction(db, async transaction => {
      const currentProfile = await transaction.get(userRef);
      assertSession();
      if (existingPhoto(currentProfile.data())) return;
      transaction.set(userRef, {
        identityVerificationSubmission: { selfie: { ...photo, uploadedAt: serverTimestamp() } },
        updatedAt: serverTimestamp()
      }, { mergeFields: ['identityVerificationSubmission.selfie', 'updatedAt'] });
    });
  } catch (error) {
    if (error instanceof SelfieSubmissionError) throw error;
    throw new SelfieSubmissionError('save-failed');
  }
  pendingUploads.delete(key);
  return photo;
}

const profileState = (snapshot: { exists: () => boolean; data: () => unknown }, uid: string) =>
  readIdentityVerification(snapshot.exists() ? snapshot.data() : null, uid);

/**
 * Submits the selfie plus the declared document details and starts a simulated review.
 * A verified identity never regresses to pending.
 */
export async function submitCurrentUserIdentityVerification(
  details: IdentityDetails,
  selfie: SelfieUploadInput,
  { now = Date.now }: { now?: () => number } = {}
): Promise<IdentityVerificationState> {
  const user = firebaseAuth?.currentUser;
  if (!user) throw new SelfieSubmissionError('unauthenticated');
  const db = firebaseDb;
  if (!db) throw new SelfieSubmissionError('unavailable');
  const assertSession = () => {
    if (firebaseAuth?.currentUser !== user || user.uid !== selfie.expectedOwnerUid) throw new SelfieSubmissionError('session-changed');
  };
  assertSession();
  const parsed = identityDetailsSchema.safeParse(details);
  if (!parsed.success) throw new SelfieSubmissionError('invalid-details');
  const userRef = doc(db, 'users', user.uid);
  // Checked before uploading so a verified account never leaves an unused selfie in Storage.
  let current: IdentityVerificationState;
  try { current = profileState(await getDoc(userRef), user.uid); } catch { throw new SelfieSubmissionError('save-failed'); }
  assertSession();
  if (current.status === 'verified') throw new SelfieSubmissionError('already-verified');

  const photo = await submitCurrentUserSelfie(selfie);
  assertSession();
  try {
    return await runTransaction(db, async transaction => {
      const snapshot = await transaction.get(userRef);
      assertSession();
      if (profileState(snapshot, user.uid).status === 'verified') throw new SelfieSubmissionError('already-verified');
      const storedSelfie = (snapshot.data() as { identityVerificationSubmission?: { selfie?: { id?: unknown } } } | undefined)?.identityVerificationSubmission?.selfie;
      if (storedSelfie?.id !== photo.id) throw new SelfieSubmissionError('save-failed');
      const reviewAt = now() + IDENTITY_REVIEW_DELAY_MS;
      const { documentImages, ...rest } = parsed.data;
      transaction.set(userRef, {
        identityVerificationSubmission: {
          ...rest,
          documentImages: documentImages.back ? documentImages : { front: documentImages.front },
          status: 'pending',
          submittedAt: serverTimestamp(),
          reviewAt: Timestamp.fromMillis(reviewAt),
          verifiedAt: null
        },
        updatedAt: serverTimestamp()
      }, {
        mergeFields: ['countryCode', 'documentType', 'documentImages', 'legalName', 'status', 'submittedAt', 'reviewAt', 'verifiedAt']
          .map(field => `identityVerificationSubmission.${field}`).concat('updatedAt')
      });
      return { status: 'pending', reviewAt } as const;
    });
  } catch (error) {
    if (error instanceof SelfieSubmissionError) throw error;
    throw new SelfieSubmissionError('save-failed');
  }
}

/** Completes the simulated review once its review time has passed; otherwise returns the current state. */
export async function completeSimulatedIdentityReview(
  expectedUid: string,
  { now = Date.now }: { now?: () => number } = {}
): Promise<IdentityVerificationState> {
  const user = firebaseAuth?.currentUser;
  if (!user || user.uid !== expectedUid) throw new SelfieSubmissionError('session-changed');
  const db = firebaseDb;
  if (!db) throw new SelfieSubmissionError('unavailable');
  const assertSession = () => {
    if (firebaseAuth?.currentUser !== user) throw new SelfieSubmissionError('session-changed');
  };
  const userRef = doc(db, 'users', user.uid);
  try {
    const state = await runTransaction(db, async transaction => {
      const snapshot = await transaction.get(userRef);
      assertSession();
      const current = profileState(snapshot, user.uid);
      if (current.status !== 'pending' || now() < current.reviewAt) return current;
      transaction.set(userRef, {
        identityVerificationSubmission: { status: 'verified', verifiedAt: serverTimestamp() },
        updatedAt: serverTimestamp()
      }, { mergeFields: ['identityVerificationSubmission.status', 'identityVerificationSubmission.verifiedAt', 'updatedAt'] });
      return { status: 'verified' } as const;
    });
    assertSession();
    return state;
  } catch (error) {
    if (error instanceof SelfieSubmissionError) throw error;
    throw new SelfieSubmissionError('save-failed');
  }
}
