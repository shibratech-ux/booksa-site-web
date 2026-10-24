type FirebaseLikeError = { code?: unknown; message?: unknown };

import { FirebaseError } from 'firebase/app';

const AUTH_ERROR_KEYS = {
  'auth/invalid-credential': 'auth.invalidCredential',
  'auth/user-not-found': 'auth.userNotFound',
  'auth/wrong-password': 'auth.wrongPassword',
  'auth/email-already-in-use': 'auth.emailInUse',
  'auth/too-many-requests': 'auth.tooManyRequests',
  'auth/network-request-failed': 'auth.network',
  'auth/requires-recent-login': 'auth.requiresRecentLogin',
  'auth/popup-closed-by-user': 'auth.popupClosed',
  'auth/popup-blocked': 'auth.popupBlocked',
  'auth/cancelled-popup-request': 'auth.cancelledPopup',
  'auth/unauthorized-domain': 'auth.unauthorizedDomain',
  'auth/operation-not-allowed': 'auth.operationNotAllowed',
  'auth/account-exists-with-different-credential': 'auth.accountExistsWithDifferentCredential',
  'auth/user-disabled': 'auth.userDisabled',
  'auth/invalid-api-key': 'auth.invalidApiKey',
  'auth/app-not-authorized': 'auth.appNotAuthorized'
} as const;

export type FirebaseAuthErrorKey =
  | (typeof AUTH_ERROR_KEYS)[keyof typeof AUTH_ERROR_KEYS]
  | 'auth.generic';

export function getFirebaseAuthErrorKey(error: unknown): FirebaseAuthErrorKey {
  if (!error || typeof error !== 'object') return 'auth.generic';
  const code = (error as FirebaseLikeError).code;
  return typeof code === 'string' && code in AUTH_ERROR_KEYS
    ? AUTH_ERROR_KEYS[code as keyof typeof AUTH_ERROR_KEYS]
    : 'auth.generic';
}

export function logFirebaseAuthError(context: string, error: unknown): void {
  if (error instanceof FirebaseError) {
    console.error(`[Firebase Auth Error] ${context}`, {
      code: error.code,
      message: error.message,
      name: error.name
    });
  } else if (error && typeof error === 'object') {
    const errObj = error as FirebaseLikeError;
    console.error(`[Auth Error] ${context}`, {
      code: typeof errObj.code === 'string' ? errObj.code : 'unknown',
      message: typeof errObj.message === 'string' ? errObj.message : 'Unknown error'
    });
  } else {
    console.error(`[Auth Error] ${context}`, error);
  }
}
