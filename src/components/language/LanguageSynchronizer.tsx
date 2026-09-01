import { useEffect, useRef } from 'react';
import i18n from '@/i18n';
import { normalizeLanguage } from '@/i18n/types';
import { getUserLanguage } from '@/services/language.service';
import { useAuthStore } from '@/store/auth.store';
import { STORAGE_KEYS } from '@/utils/constants';

export function LanguageSynchronizer() {
  const userId = useAuthStore((state) => state.user?.id);
  const authStatus = useAuthStore((state) => state.status);
  const requestId = useRef(0);

  useEffect(() => {
    if (authStatus === 'loading') return;

    const currentRequest = ++requestId.current;
    if (!userId) return;

    void getUserLanguage(userId)
      .then(async (profileLanguage) => {
        if (requestId.current !== currentRequest || !profileLanguage) return;
        const currentLanguage = normalizeLanguage(i18n.resolvedLanguage ?? i18n.language);
        if (profileLanguage === currentLanguage) return;

        window.localStorage.setItem(STORAGE_KEYS.language, profileLanguage);
        await i18n.changeLanguage(profileLanguage);
      })
      .catch(() => {
        // Local/browser language remains usable when the profile is unavailable.
      });
  }, [authStatus, userId]);

  return null;
}
