import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from '@/utils/constants';
import { navigationIcons } from '@/icons/navigation.icons';
import { cn } from '@/utils/helpers';
import type { FluentIcon } from '@fluentui/react-icons';

type NavPath = (typeof NAV_ITEMS)[number]['path'];

const navIconMap: Partial<Record<NavPath, FluentIcon>> = {
  '/': navigationIcons.dashboard
};

type MobileNavProps = {
  variant?: 'fixed' | 'absolute';
  hideHome?: boolean;
};

export function MobileNav({ variant = 'fixed', hideHome = false }: MobileNavProps) {
  const visibleItems = hideHome ? NAV_ITEMS.filter((item) => item.path !== '/') : NAV_ITEMS;

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <nav
      className={cn(
        'inset-x-0 bottom-0 z-30 border-t border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-background)_88%,transparent)] px-2 py-2 backdrop-blur-xl lg:hidden',
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
                  'flex flex-col items-center justify-center gap-1 rounded-2xl py-2 text-[11px] font-medium transition',
                  isActive
                    ? 'bg-[color-mix(in_srgb,var(--color-primary-500)_14%,transparent)] text-[var(--color-primary-500)]'
                    : 'text-[var(--color-text-secondary)]'
                )
              }
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
