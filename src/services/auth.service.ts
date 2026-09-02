import {
  browserLocalPersistence,
  GoogleAuthProvider,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updatePassword
} from 'firebase/auth';
import { firebaseAuth, isFirebaseReady } from './firebase';
import { createAuthResponse } from './auth-user';
import type { AuthCredentials, AuthResponse } from '@/types/auth.types';

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

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  const { user } = await signInWithPopup(firebaseAuth, provider);

  return createAuthResponse(user);
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
