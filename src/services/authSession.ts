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

  let sessionRevision = 0;
  unsubscribeFromTokenChanges = onIdTokenChanged(auth, async (user) => {
    const revision = ++sessionRevision;
    if (!user) {
      useAuthStore.getState().clearUser();
      return;
    }

    // Do not expose a previous account while claims and profile are being refreshed.
    // Hourly token refreshes keep the same uid and stay 'authenticated', so ProtectedRoute
    // does not unmount the open page.
    if (useAuthStore.getState().user?.id !== user.uid) {
      useAuthStore.getState().clearUser();
      useAuthStore.getState().setStatus('loading');
    }
    try {
      const response = await createAuthResponse(user);
      if (revision !== sessionRevision || auth.currentUser?.uid !== user.uid) return;
      useAuthStore.getState().setUser(response.user, response.token);
    } catch {
      if (revision !== sessionRevision) return;
      useAuthStore.getState().clearUser();
    }
  });
}
