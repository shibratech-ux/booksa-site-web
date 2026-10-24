import {
  browserLocalPersistence,
  GoogleAuthProvider,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updatePassword
} from 'firebase/auth';
import { firebaseAuth, isFirebaseReady } from './firebase';
import { createAuthResponse } from './auth-user';
import type { AuthCredentials, AuthResponse } from '@/types/auth.types';
import { logFirebaseAuthError } from '@/utils/firebaseErrors';

let googleProviderInstance: GoogleAuthProvider | null = null;

function getGoogleAuthProvider(): GoogleAuthProvider {
  if (!googleProviderInstance) {
    googleProviderInstance = new GoogleAuthProvider();
    googleProviderInstance.setCustomParameters({ prompt: 'select_account' });
  }
  return googleProviderInstance;
}

export async function signIn(credentials: AuthCredentials): Promise<AuthResponse> {
  if (!isFirebaseReady || !firebaseAuth) {
    throw new Error('Firebase authentication is not configured.');
  }

  await setPersistence(firebaseAuth, browserLocalPersistence);
  const { user } = await signInWithEmailAndPassword(
    firebaseAuth,
    credentials.email,
    credentials.password
  );

  return createAuthResponse(user, credentials.email);
}

export async function signInWithGoogle(): Promise<AuthResponse> {
  if (!isFirebaseReady || !firebaseAuth) {
    throw new Error('Firebase authentication is not configured.');
  }

  const provider = getGoogleAuthProvider();

  try {
    const { user } = await signInWithPopup(firebaseAuth, provider);
    return await createAuthResponse(user);
  } catch (error: unknown) {
    logFirebaseAuthError('signInWithGoogle popup error', error);
    const code = error && typeof error === 'object' && 'code' in error ? (error as { code: unknown }).code : '';

    // Fall back to redirect ONLY if popup was blocked by browser
    if (code === 'auth/popup-blocked') {
      try {
        await signInWithRedirect(firebaseAuth, provider);
      } catch (redirectError) {
        logFirebaseAuthError('signInWithGoogle redirect error', redirectError);
        throw redirectError;
      }
    }
    throw error;
  }
}

export async function signOutUser(): Promise<void> {
  if (isFirebaseReady && firebaseAuth) {
    await signOut(firebaseAuth);
  }
}

export async function updateLoggedInUserPassword(password: string): Promise<void> {
  const currentUser = firebaseAuth?.currentUser;

  if (!currentUser) {
    throw new Error('You must be signed in to update your password.');
  }

  await updatePassword(currentUser, password);
}
