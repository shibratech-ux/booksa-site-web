import { z } from 'zod';

// Store international E.164 numbers, independent of display formatting.
export const phoneNumberSchema = z.string().trim()
  .transform(value => value.replace(/[\s()-]/g, ''))
  .pipe(z.string().regex(/^\+[1-9]\d{7,14}$/));
export const phonePinSchema = z.string().regex(/^\d{6}$/);

// Simulated OTP policy. Delivery is in-app only: no SMS provider is involved.
export const PHONE_OTP_TTL_MS = 10 * 60 * 1000;
export const PHONE_OTP_RESEND_COOLDOWN_MS = 60 * 1000;
export const PHONE_OTP_MAX_ATTEMPTS = 5;

/**
 * `users/{uid}.phoneVerification`. Only a salted hash of the code is stored; the pending
 * challenge is cleared once it is verified, expired or out of attempts.
 */
const millisSchema = z.custom<{ toMillis: () => number }>(value =>
  Boolean(value) && typeof (value as { toMillis?: unknown }).toMillis === 'function');
export const pendingPhoneOtpSchema = z.object({
  phoneNumber: phoneNumberSchema,
  codeHash: z.string().regex(/^[0-9a-f]{64}$/),
  attempts: z.number().int().min(0).max(PHONE_OTP_MAX_ATTEMPTS),
  requestedAt: millisSchema,
  expiresAt: millisSchema
});
export type PendingPhoneOtp = z.infer<typeof pendingPhoneOtpSchema>;

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};

export function readPendingPhoneOtp(profile: unknown): PendingPhoneOtp | null {
  const result = pendingPhoneOtpSchema.safeParse(record(record(profile).phoneVerification).pending);
  return result.success ? result.data : null;
}

/** A phone counts as confirmed only while the profile number is the one that passed OTP. */
export function readVerifiedPhone(profile: unknown): string | null {
  const data = record(profile);
  const verified = phoneNumberSchema.safeParse(record(data.phoneVerification).verifiedPhoneNumber);
  return verified.success && data.phoneNumber === verified.data ? verified.data : null;
}

export function generatePhoneOtp(random: (values: Uint32Array) => Uint32Array = values => crypto.getRandomValues(values)): string {
  // Rejection sampling keeps every 6-digit code equally likely.
  const limit = Math.floor(0x1_0000_0000 / 1_000_000) * 1_000_000;
  const buffer = new Uint32Array(1);
  for (;;) {
    const [value] = random(buffer);
    if (value < limit) return String(value % 1_000_000).padStart(6, '0');
  }
}

/** Binds the code to the account and number so a hash cannot be replayed elsewhere. */
export async function hashPhoneOtp(uid: string, phoneNumber: string, code: string): Promise<string> {
  const bytes = new TextEncoder().encode(`booksa-phone-otp:${uid}:${phoneNumber}:${code}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}
