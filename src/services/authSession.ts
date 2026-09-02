import {
  browserLocalPersistence,
  onIdTokenChanged,
  setPersistence,
  type Unsubscribe
} from 'firebase/auth';
import { firebaseAuth } from '@/services/firebase';
import { createAuthResponse } from '@/services/auth-user';
import { useAuthStore } from '@/store/auth.store';

let unsubscribeFromTokenChanges: Unsubscribe | null = null;

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
      const response = await createAuthResponse(user);
      useAuthStore.getState().setUser(response.user, response.token);
    } catch {
      useAuthStore.getState().clearUser();
    }
  });
}
