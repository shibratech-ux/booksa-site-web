import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from '@/utils/constants';
import { navigationIcons } from '@/icons/navigation.icons';
import { cn } from '@/utils/helpers';
import type { FluentIcon } from '@fluentui/react-icons';
import { useTranslation } from 'react-i18next';

type NavPath = (typeof NAV_ITEMS)[number]['path'];

const navIconMap: Partial<Record<NavPath, FluentIcon>> = {
  '/': navigationIcons.dashboard
};

type MobileNavProps = {
  variant?: 'fixed' | 'absolute';
  hideHome?: boolean;
};

export function MobileNav({ variant = 'fixed', hideHome = false }: MobileNavProps) {
  const { t } = useTranslation('navigation');
  const visibleItems = hideHome ? NAV_ITEMS.filter((item) => item.path !== '/') : NAV_ITEMS;

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <nav
      className={cn(
        'inset-x-0 bottom-0 z-30 min-h-16 border-t border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-background)_92%,transparent)] px-2 py-2 backdrop-blur-xl lg:hidden',
        variant === 'fixed' ? 'fixed' : 'absolute'
      )}
    >
      <div className="grid grid-cols-1 gap-1">
        {visibleItems.map((item) => {
          const Icon = navIconMap[item.path] ?? navigationIcons.dashboard;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                cn(
                  'flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl py-2 text-[9.24px] font-semibold transition',
                  isActive
                    ? 'bg-[color-mix(in_srgb,var(--color-primary-500)_14%,transparent)] text-[var(--color-primary-500)]'
                    : 'text-[var(--color-text-secondary)]'
                )
              }
            >
              <Icon className="h-6 w-6" />
              <span>{t(item.labelKey)}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
