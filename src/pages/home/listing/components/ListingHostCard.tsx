import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShimmerImage } from '@/components/ui/ShimmerImage';
import { getLoggedInUserProfile } from '@/services/user.service';
import { useAuthStore } from '@/store/auth.store';

type ProfileState = {
  userId: string;
  status: 'loading' | 'success' | 'error';
  profile?: Record<string, unknown>;
};

export function profileString(profile: Record<string, unknown> | undefined, ...keys: string[]) {
  return keys.map((key) => profile?.[key])
    .find((value): value is string => typeof value === 'string' && Boolean(value.trim()))?.trim();
}

export function profileCreatedDate(value: unknown): Date | null {
  let date: Date | null = null;
  if (value instanceof Date) date = value;
  else if (typeof value === 'string' && value.trim()) date = new Date(value);
  else if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    const result: unknown = value.toDate();
    if (result instanceof Date) date = result;
  }
  return date && Number.isFinite(date.getTime()) ? date : null;
}

export function hostDisplayName(profile: Record<string, unknown> | undefined, accountName: string | undefined, fallback: string) {
  return profileString(profile, 'name', 'displayName', 'fullName') ||
    [profileString(profile, 'firstName'), profileString(profile, 'lastName')].filter(Boolean).join(' ') ||
    accountName?.trim() || fallback;
}

export function hostAvatarUrl(profile: Record<string, unknown> | undefined, accountAvatarUrl: string | undefined) {
  return profileString(profile, 'avatarUrl', 'photoURL', 'photoUrl') || accountAvatarUrl;
}

export type HostSummary = { name: string; avatarUrl?: string };

// Loads the signed-in host's `users/{uid}` profile, falling back to the auth account while loading or on error.
export function useHostProfile() {
  const user = useAuthStore((state) => state.user);
  const { t } = useTranslation('dashboard');
  const [state, setState] = useState<ProfileState | null>(null);
  const [attempt, setAttempt] = useState(0);
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;
    let active = true;
    setState({ userId, status: 'loading' });

    getLoggedInUserProfile(userId)
      .then((profile) => {
        if (active) setState({ userId, status: 'success', profile });
      })
      .catch(() => {
        if (active) setState({ userId, status: 'error' });
      });

    return () => { active = false; };
  }, [userId, attempt]);

  // Scope results to the current identity during render, before effect cleanup runs.
  const current = userId && state?.userId === userId ? state : null;
  const profile = current?.profile;
  const loading = Boolean(userId && (!current || current.status === 'loading'));
  const name = hostDisplayName(profile, user?.name, t('listingHost.fallbackName'));
  const avatarUrl = hostAvatarUrl(profile, user?.avatarUrl);
  const avatarKey = `${userId}:${avatarUrl}`;
  const createdDate = profileCreatedDate(profile?.createdAt);

  return {
    userId,
    loading,
    error: current?.status === 'error',
    name,
    avatarUrl,
    avatarKey,
    createdDate,
    retry: () => setAttempt((value) => value + 1)
  };
}

// `onOpen` makes the whole card clickable via a stretched button; the retry button stays above it.
export function ListingHostCard({ className, onOpen }: { className: string; onOpen?: (host: HostSummary) => void }) {
  const { t, i18n } = useTranslation('dashboard');
  const [failedAvatar, setFailedAvatar] = useState<string | null>(null);
  const { userId, loading, error, name, avatarUrl, avatarKey, createdDate, retry } = useHostProfile();

  return (
    <section className={`${className} ${onOpen ? 'relative transition hover:shadow-[var(--shadow-md)]' : ''}`} aria-busy={loading}>
      <h2 className="text-[0.830466rem] font-semibold">{t('listingHost.heading')}</h2>
      {onOpen ? (
        <button
          type="button"
          onClick={() => onOpen({ name, avatarUrl: avatarUrl && failedAvatar !== avatarKey ? avatarUrl : undefined })}
          aria-haspopup="dialog"
          aria-label={t('hostProfileSheet.open')}
          className="absolute inset-0 rounded-card"
        />
      ) : null}
      <div className="mt-1.5 flex flex-col items-center py-5 text-center text-[0.72665775rem] leading-6 text-[var(--color-text-primary)]">
        <span className="inline-flex h-[calc(var(--spacing)*28.8)] w-[calc(var(--spacing)*28.8)] items-center justify-center overflow-hidden rounded-full bg-[var(--color-primary-100)] text-[1.660932rem] font-semibold text-[var(--color-primary-700)]">
          {avatarUrl && failedAvatar !== avatarKey ? (
            <ShimmerImage src={avatarUrl} alt="" className="h-full w-full object-cover" onError={() => setFailedAvatar(avatarKey)} />
          ) : name.charAt(0).toLocaleUpperCase(i18n.language)}
        </span>
        <span className="mt-4 max-w-full break-words font-semibold">{name}</span>
        {createdDate ? (
          <span className="text-[0.6228495rem] text-[var(--color-text-secondary)]">
            {t('listingHost.memberSince', { year: new Intl.DateTimeFormat(i18n.language, { year: 'numeric' }).format(createdDate) })}
          </span>
        ) : null}
        {loading ? <span role="status" className="text-[var(--color-text-secondary)]">{t('listingHost.loading')}</span> : null}
        {error ? (
          <div className="mt-3 text-[var(--color-text-secondary)]">
            <p role="status">{t('listingHost.loadError')}</p>
            <button type="button" onClick={retry} className="relative z-10 min-h-11 rounded-button px-4 font-semibold text-[var(--color-text-primary)] underline">
              {t('listingHost.retry')}
            </button>
          </div>
        ) : null}
        {!userId ? <p role="status" className="text-[var(--color-text-secondary)]">{t('listingHost.signedOut')}</p> : null}
      </div>
    </section>
  );
}
