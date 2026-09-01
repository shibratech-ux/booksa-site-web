import { useMemo } from 'react';
import { AlertRegular, PanelLeftRegular, SearchRegular } from '@fluentui/react-icons';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store/app.store';
import { createAvatarFallback, cn } from '@/utils/helpers';
import { IconButton } from '@/components/ui/IconButton';
import { Button } from '@/components/ui/Button';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/language/LanguageSwitcher';

export function Header() {
  const { t } = useTranslation('navigation');
  const { t: tCommon } = useTranslation('common');
  const { toggleSidebar } = useAppStore();
  const { user } = useAuth();

  const initials = useMemo(() => createAvatarFallback(user?.name ?? tCommon('brand.defaultUser')), [tCommon, user]);

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-background)_78%,transparent)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 px-4 py-4 lg:px-8">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={toggleSidebar}
            leftIcon={<PanelLeftRegular className="h-4 w-4" />}
          >
            {t('menu')}
          </Button>
          <div className="search-surface hidden px-4 md:flex md:items-center md:gap-3">
            <SearchRegular className="h-5 w-5 text-[var(--color-text-secondary)]" />
            <input
            aria-label={tCommon('actions.search')}
            placeholder="Rechercher des rapports, des utilisateurs, des transactions..."
              className="w-72 bg-transparent text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-secondary)]"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher compact />
          <IconButton icon={<AlertRegular className="h-4 w-4" />} label={t('notifications')} />
          <div className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary-500)] text-sm font-bold text-white">
              {initials}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">{user?.name ?? tCommon('brand.defaultUser')}</p>
              <p className="text-xs text-[var(--color-text-secondary)]">{user?.role ?? 'Administrateur'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 md:hidden">
        <div className="search-surface flex items-center gap-3 px-4">
          <SearchRegular className="h-5 w-5 text-[var(--color-text-secondary)]" />
          <input
            aria-label={tCommon('actions.search')}
            placeholder="Rechercher..."
            className={cn('w-full bg-transparent text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-secondary)]')}
          />
        </div>
      </div>
    </header>
  );
}
