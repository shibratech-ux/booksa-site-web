import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
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

export async function signOutUser(): Promise<void> {
  if (isFirebaseReady && firebaseAuth) {
    await signOut(firebaseAuth);
  }
}
