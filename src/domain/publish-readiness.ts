import { readIdentityVerification, type IdentityVerificationState } from './identity-verification';
import { readVerifiedPhone } from './phone-verification';

export type PublishReadiness = { phoneVerified: boolean; identity: IdentityVerificationState; ready: boolean };

/** A host can publish only once the profile phone passed OTP and the identity review is verified. */
export function readPublishReadiness(profile: unknown, uid: string): PublishReadiness {
  const phoneVerified = readVerifiedPhone(profile) !== null;
  const identity = readIdentityVerification(profile, uid);
  return { phoneVerified, identity, ready: phoneVerified && identity.status === 'verified' };
}
