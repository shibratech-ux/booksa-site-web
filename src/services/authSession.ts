import {
  browserLocalPersistence,
  onIdTokenChanged,
  setPersistence,
  type Unsubscribe,
  type User
} from 'firebase/auth';
import { firebaseAuth } from '@/services/firebase';
import { useAuthStore } from '@/store/auth.store';
import type { AuthUser } from '@/types/auth.types';

let unsubscribeFromTokenChanges: Unsubscribe | null = null;

function toAuthUser(user: User): AuthUser {
  return {
    id: user.uid,
    name: user.displayName ?? 'Utilisateur Booksa',
    email: user.email ?? '',
    role: 'admin',
    avatarUrl: user.photoURL ?? undefined
  };
}

export function startAuthSessionPersistence(): void {
  if (!firebaseAuth || unsubscribeFromTokenChanges) return;

  const auth = firebaseAuth;
  useAuthStore.getState().setStatus('loading');

  void setPersistence(auth, browserLocalPersistence).catch(() => {
    // Firebase retains its available persistence fallback in restricted browsers.
  });

  unsubscribeFromTokenChanges = onIdTokenChanged(auth, async (user) => {
    if (!user) {
      useAuthStore.getState().clearUser();
      return;
    }

    try {
      const token = await user.getIdToken();
      useAuthStore.getState().setUser(toAuthUser(user), token);
    } catch {
      useAuthStore.getState().clearUser();
    }
  });
}
