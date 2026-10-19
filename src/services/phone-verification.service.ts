import { doc, runTransaction, serverTimestamp, Timestamp } from 'firebase/firestore';
import {
  generatePhoneOtp,
  hashPhoneOtp,
  PHONE_OTP_MAX_ATTEMPTS,
  PHONE_OTP_RESEND_COOLDOWN_MS,
  PHONE_OTP_TTL_MS,
  phoneNumberSchema,
  phonePinSchema,
  readPendingPhoneOtp
} from '@/domain/phone-verification';
import { firebaseAuth, firebaseDb } from './firebase';

export type PhoneVerificationErrorCode = 'session' | 'unavailable' | 'invalidPhone' | 'invalidCode' | 'expired' | 'attempts' | 'throttled' | 'generic';
export class PhoneVerificationError extends Error {
  constructor(public readonly code: PhoneVerificationErrorCode, public readonly retryAfterSeconds?: number) {
    super('Phone confirmation could not be completed. Please try again.');
    this.name = 'PhoneVerificationError';
  }
}

/** The simulated SMS. The plain code exists only in memory and is shown in-app. */
export type SimulatedPhoneOtp = { phoneNumber: string; code: string; expiresAt: number };

const PENDING_FIELD = 'phoneVerification.pending';

/**
 * Simulated OTP flow stored on `users/{uid}`. Every read/write runs in a transaction bound to
 * one authenticated session; the profile keeps only a salted hash of the code.
 */
export function createPhoneVerification(expectedUid: string, { now = Date.now }: { now?: () => number } = {}) {
  const auth = firebaseAuth;
  const db = firebaseDb;
  const user = auth?.currentUser;
  if (!auth || !db) throw new PhoneVerificationError('unavailable');
  if (!user || user.uid !== expectedUid) throw new PhoneVerificationError('session');
  const profileRef = doc(db, 'users', user.uid);
  let disposed = false;
  let busy = false;
  let challengePhone: string | null = null;
  const assertSession = () => {
    if (disposed || auth.currentUser !== user || user.uid !== expectedUid) throw new PhoneVerificationError('session');
  };
  const perform = async <T,>(operation: () => Promise<T>): Promise<T> => {
    assertSession();
    if (busy) throw new PhoneVerificationError('generic');
    busy = true;
    try {
      const result = await operation();
      assertSession();
      return result;
    } catch (error) {
      throw error instanceof PhoneVerificationError ? error : new PhoneVerificationError('generic');
    } finally { busy = false; }
  };

  return {
    send: (input: string) => perform<SimulatedPhoneOtp>(async () => {
      const phone = phoneNumberSchema.safeParse(input);
      if (!phone.success) throw new PhoneVerificationError('invalidPhone');
      const code = generatePhoneOtp();
      const codeHash = await hashPhoneOtp(user.uid, phone.data, code);
      assertSession();
      const outcome = await runTransaction(db, async transaction => {
        const snapshot = await transaction.get(profileRef);
        assertSession();
        const requestedAt = now();
        const previous = readPendingPhoneOtp(snapshot.exists() ? snapshot.data() : null);
        const waitMs = previous ? previous.requestedAt.toMillis() + PHONE_OTP_RESEND_COOLDOWN_MS - requestedAt : 0;
        if (waitMs > 0) return { throttled: Math.ceil(waitMs / 1000) } as const;
        const expiresAt = requestedAt + PHONE_OTP_TTL_MS;
        transaction.set(profileRef, {
          phoneVerification: {
            pending: {
              phoneNumber: phone.data,
              codeHash,
              attempts: 0,
              requestedAt: Timestamp.fromMillis(requestedAt),
              expiresAt: Timestamp.fromMillis(expiresAt)
            }
          },
          updatedAt: serverTimestamp()
        }, { mergeFields: [PENDING_FIELD, 'updatedAt'] });
        return { expiresAt } as const;
      });
      assertSession();
      if ('throttled' in outcome) throw new PhoneVerificationError('throttled', outcome.throttled);
      challengePhone = phone.data;
      return { phoneNumber: phone.data, code, expiresAt: outcome.expiresAt };
    }),
    confirm: (pin: string) => perform(async () => {
      if (!phonePinSchema.safeParse(pin).success) throw new PhoneVerificationError('invalidCode');
      const phone = challengePhone;
      if (!phone) throw new PhoneVerificationError('expired');
      const codeHash = await hashPhoneOtp(user.uid, phone, pin);
      assertSession();
      const outcome = await runTransaction(db, async transaction => {
        const snapshot = await transaction.get(profileRef);
        assertSession();
        const pending = readPendingPhoneOtp(snapshot.exists() ? snapshot.data() : null);
        // A newer request (another tab) replaces this one; never verify a number the user did not see.
        if (!pending || pending.phoneNumber !== phone) return 'expired' as const;
        const clearPending = () => transaction.set(profileRef, { phoneVerification: { pending: null }, updatedAt: serverTimestamp() }, { mergeFields: [PENDING_FIELD, 'updatedAt'] });
        if (now() >= pending.expiresAt.toMillis()) { clearPending(); return 'expired' as const; }
        if (pending.codeHash !== codeHash) {
          const attempts = pending.attempts + 1;
          if (attempts >= PHONE_OTP_MAX_ATTEMPTS) { clearPending(); return 'attempts' as const; }
          transaction.set(profileRef, { phoneVerification: { pending: { attempts } } }, { mergeFields: [`${PENDING_FIELD}.attempts`] });
          return 'invalidCode' as const;
        }
        // Verification and the profile number are written together, so they can never disagree.
        transaction.set(profileRef, {
          phoneNumber: phone,
          phoneVerification: { pending: null, verifiedPhoneNumber: phone, verifiedAt: serverTimestamp() },
          updatedAt: serverTimestamp()
        }, { mergeFields: ['phoneNumber', PENDING_FIELD, 'phoneVerification.verifiedPhoneNumber', 'phoneVerification.verifiedAt', 'updatedAt'] });
        return 'verified' as const;
      });
      assertSession();
      if (outcome !== 'invalidCode') challengePhone = null;
      if (outcome !== 'verified') throw new PhoneVerificationError(outcome);
      return phone;
    }),
    dispose: () => { disposed = true; challengePhone = null; }
  };
}

export type PhoneVerification = ReturnType<typeof createPhoneVerification>;
