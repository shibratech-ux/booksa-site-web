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
import type { AuthCredentials, AuthResponse, AuthUser } from '@/types/auth.types';
import dayjs from 'dayjs';

const mockUser: AuthUser = {
  id: 'usr_001',
  name: 'Jordan Wells',
  email: 'jordan.wells@booksa.io',
  role: 'admin'
};

export async function signIn(credentials: AuthCredentials): Promise<AuthResponse> {
  if (isFirebaseReady && firebaseAuth) {
    await setPersistence(firebaseAuth, browserLocalPersistence);
    const { user } = await signInWithEmailAndPassword(
      firebaseAuth,
      credentials.email,
      credentials.password
    );

    return {
      user: {
        id: user.uid,
        name: user.displayName ?? 'Utilisateur Booksa',
        email: user.email ?? credentials.email,
        role: 'admin',
        avatarUrl: user.photoURL ?? undefined
      },
      token: await user.getIdToken()
    };
  }

  return {
    user: {
      ...mockUser,
      email: credentials.email
    },
    token: `mock-token-${dayjs().unix()}`
  };
}

export async function signInWithGoogle(): Promise<AuthResponse> {
  if (!isFirebaseReady || !firebaseAuth) {
    throw new Error('Firebase authentication is not configured.');
  }

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  await setPersistence(firebaseAuth, browserLocalPersistence);
  const { user } = await signInWithPopup(firebaseAuth, provider);

  return {
    user: {
      id: user.uid,
      name: user.displayName ?? 'Utilisateur Booksa',
      email: user.email ?? '',
      role: 'admin',
      avatarUrl: user.photoURL ?? undefined
    },
    token: await user.getIdToken()
  };
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
