import { z } from 'zod';

export const MAX_SELFIE_BYTES = 10 * 1024 * 1024;
export const selfieUploadSchema = z.object({
  photoId: z.string().uuid(),
  expectedOwnerUid: z.string().min(1).refine(value => !value.includes('/')),
  image: z.instanceof(Blob).refine(image => image.type === 'image/jpeg' && image.size > 0 && image.size <= MAX_SELFIE_BYTES),
  width: z.number().int().min(1).max(4096),
  height: z.number().int().min(1).max(4096)
}).strict();

export const selfieMetadataSchema = z.object({
  id: z.string().uuid(),
  storagePath: z.string().min(1),
  bucket: z.string().min(1),
  generation: z.string().min(1),
  contentType: z.literal('image/jpeg'),
  size: z.number().int().min(1).max(MAX_SELFIE_BYTES),
  width: z.number().int().min(1).max(4096),
  height: z.number().int().min(1).max(4096),
  sha256: z.string().regex(/^[a-f0-9]{64}$/)
}).strict();

export type SelfieUploadInput = z.infer<typeof selfieUploadSchema>;
export type SelfieMetadata = z.infer<typeof selfieMetadataSchema>;

export const selfieStoragePath = (uid: string, photoId: string) =>
  `users/${uid}/identity-verification/selfies/${photoId}.jpg`;

// Simulated identity review. ID document images never leave the browser: only their
// fingerprints and the declared details are stored on `users/{uid}.identityVerificationSubmission`.
export const IDENTITY_REVIEW_DELAY_MS = 30 * 1000;
export const MAX_IDENTITY_DOCUMENT_BYTES = 10 * 1024 * 1024;
export const identityDocumentTypes = ['drivers-license', 'passport', 'identity-card'] as const;
export type IdentityDocumentType = typeof identityDocumentTypes[number];
export const identityDocumentSides = (type: IdentityDocumentType) => type === 'passport' ? ['front'] as const : ['front', 'back'] as const;

const identityDocumentImageSchema = z.object({
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  contentType: z.enum(['image/jpeg', 'image/png']),
  size: z.number().int().min(1).max(MAX_IDENTITY_DOCUMENT_BYTES)
}).strict();
const nameSchema = (min: number) => z.string().trim().min(min).max(100);

export const identityDetailsSchema = z.object({
  countryCode: z.string().regex(/^[A-Z]{2}$/),
  documentType: z.enum(identityDocumentTypes),
  documentImages: z.object({ front: identityDocumentImageSchema, back: identityDocumentImageSchema.optional() }).strict(),
  legalName: z.object({ firstName: nameSchema(1), lastName: nameSchema(1), preferredFirstName: nameSchema(0) }).strict()
}).strict().refine(details => (details.documentType === 'passport') === !details.documentImages.back);

export type IdentityDocumentImage = z.infer<typeof identityDocumentImageSchema>;
export type IdentityDetails = z.infer<typeof identityDetailsSchema>;
export type IdentityDocumentDetails = Omit<IdentityDetails, 'legalName'>;

export type IdentityVerificationState =
  | { status: 'not-started' | 'selfie-submitted' | 'verified' }
  | { status: 'pending'; reviewAt: number };

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};

/** Reads the review state; a status without a valid owned selfie and details counts as not started. */
export function readIdentityVerification(profile: unknown, uid: string): IdentityVerificationState {
  const submission = record(record(profile).identityVerificationSubmission);
  const { uploadedAt: _uploadedAt, ...selfie } = record(submission.selfie);
  const photo = selfieMetadataSchema.safeParse(selfie);
  if (!photo.success || photo.data.storagePath !== selfieStoragePath(uid, photo.data.id)) return { status: 'not-started' };
  const details = identityDetailsSchema.safeParse({
    countryCode: submission.countryCode,
    documentType: submission.documentType,
    documentImages: submission.documentImages,
    legalName: submission.legalName
  });
  if (!details.success) return { status: 'selfie-submitted' };
  if (submission.status === 'verified') return { status: 'verified' };
  const reviewAt = submission.reviewAt as { toMillis?: unknown } | null | undefined;
  if (submission.status === 'pending' && typeof reviewAt?.toMillis === 'function') {
    const millis = Number(reviewAt.toMillis());
    if (Number.isFinite(millis)) return { status: 'pending', reviewAt: millis };
  }
  return { status: 'selfie-submitted' };
}

export async function sha256Hex(bytes: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), value => value.toString(16).padStart(2, '0')).join('');
}
