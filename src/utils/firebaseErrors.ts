type FirebaseLikeError = { code?: unknown; message?: unknown };

const AUTH_ERROR_KEYS = {
  'auth/invalid-credential': 'auth.invalidCredential',
  'auth/user-not-found': 'auth.userNotFound',
  'auth/wrong-password': 'auth.wrongPassword',
  'auth/email-already-in-use': 'auth.emailInUse',
  'auth/too-many-requests': 'auth.tooManyRequests',
  'auth/network-request-failed': 'auth.network',
  'auth/requires-recent-login': 'auth.requiresRecentLogin'
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
  if (!import.meta.env.DEV) return;

  const firebaseError =
    error && typeof error === 'object' ? (error as FirebaseLikeError) : null;
  const code = typeof firebaseError?.code === 'string' ? firebaseError.code : 'unknown';
  const message =
    typeof firebaseError?.message === 'string'
      ? firebaseError.message
      : 'No Firebase error message was provided.';

  console.error(context, code, message);
}
