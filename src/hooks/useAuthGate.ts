import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';

/**
 * Lets signed-out guests browse, and asks them to sign in only when they act
 * (reserve, save…). Render `<AuthRequiredSheet {...authSheet} />` next to the gated action;
 * after sign-in, LoginPage returns to the current path.
 */
export function useAuthGate() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const status = useAuthStore((state) => state.status);
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [destination, setDestination] = useState<string | null>(null);

  /** `next` overrides where sign-in returns to, e.g. checkout once its context is persisted. */
  const requireAuth = (next?: string) => {
    if (isAuthenticated) return true;
    // The Firebase session is still being restored after a reload; don't prompt yet.
    if (status === 'loading') return false;
    setDestination(next ?? null);
    setOpen(true);
    return false;
  };

  return {
    requireAuth,
    authSheet: {
      open,
      from: destination ? { pathname: destination } : { pathname: location.pathname, search: location.search, hash: location.hash },
      onClose: () => setOpen(false)
    }
  };
}
