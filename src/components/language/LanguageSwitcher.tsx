import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import {
  isSupportedLanguage,
  normalizeLanguage,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage
} from '@/i18n/types';
import { updateUserLanguage } from '@/services/language.service';
import { useAuthStore } from '@/store/auth.store';
import { STORAGE_KEYS } from '@/utils/constants';
import { SelectField } from '@/components/ui/SelectField';
import { Globe2 } from 'lucide-react';

type LanguageSwitcherProps = {
  compact?: boolean;
  iconOnly?: boolean;
  fullWidth?: boolean;
  className?: string;
};

export function LanguageSwitcher({
  compact = false,
  iconOnly = false,
  fullWidth = false,
  className = ''
}: LanguageSwitcherProps) {
  const { t } = useTranslation('settings');
  const userId = useAuthStore((state) => state.user?.id);
  const selectedLanguage = normalizeLanguage(i18n.resolvedLanguage ?? i18n.language);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'saved' | 'error'>('idle');
  const changeId = useRef(0);

  const changeLanguage = async (language: SupportedLanguage) => {
    const currentChange = ++changeId.current;
    window.localStorage.setItem(STORAGE_KEYS.language, language);
    await i18n.changeLanguage(language);

    if (!userId) {
      setSyncStatus('idle');
      return;
    }

    setSyncStatus('syncing');
    try {
      await updateUserLanguage(userId, language);
      if (changeId.current === currentChange) setSyncStatus('saved');
    } catch (error) {
      console.error('Unable to synchronize the language preference.', error);
      if (changeId.current === currentChange) setSyncStatus('error');
    }
  };

  if (iconOnly) {
    return (
      <div className={`relative h-10 w-10 shrink-0 rounded-full bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] transition hover:bg-[var(--color-border-subtle)] focus-within:ring-2 focus-within:ring-[var(--color-primary-500)] focus-within:ring-offset-2 ${className}`}>
        <Globe2 className="pointer-events-none absolute left-1/2 top-1/2 h-[18px] w-[18px] -translate-x-1/2 -translate-y-1/2" aria-hidden="true" />
        <select
          value={selectedLanguage}
          aria-label={t('language.label')}
          title={t('language.label')}
          onChange={(event) => {
            if (isSupportedLanguage(event.target.value)) void changeLanguage(event.target.value);
          }}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        >
          {SUPPORTED_LANGUAGES.map(({ code, label }) => (
            <option key={code} value={code}>{label}</option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className={className}>
      {!compact ? (
        <label htmlFor="booksa-language" className="mb-2 block text-sm font-semibold">
          {t('language.label')}
        </label>
      ) : null}
      <SelectField
        id={compact ? undefined : 'booksa-language'}
        value={selectedLanguage}
        onChange={(event) => {
          if (isSupportedLanguage(event.target.value)) void changeLanguage(event.target.value);
        }}
        aria-label={compact ? t('language.label') : undefined}
        containerClassName={
          compact ? 'inline-block w-auto min-w-36' : fullWidth ? 'w-full' : 'max-w-sm'
        }
        className={`${compact ? 'h-10 rounded-md pl-3 pr-10 text-sm' : 'font-medium'} focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)]`}
      >
        {SUPPORTED_LANGUAGES.map(({ code, label }) => (
          <option key={code} value={code}>{label}</option>
        ))}
      </SelectField>
      {!compact ? (
        <p className={`mt-3 text-sm ${syncStatus === 'error' ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-secondary)]'}`} role="status" aria-live="polite">
          {syncStatus === 'syncing'
            ? t('language.syncing')
            : syncStatus === 'saved'
              ? t('language.saved')
              : syncStatus === 'error'
                ? t('language.localOnly')
                : !userId
                  ? t('language.anonymous')
                  : ''}
        </p>
      ) : null}
    </div>
  );
}
