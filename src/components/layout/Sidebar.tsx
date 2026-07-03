import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store/app.store';
import { NAV_ITEMS } from '@/utils/constants';
import { navigationIcons } from '@/icons/navigation.icons';
import { cn } from '@/utils/helpers';
import { Button } from '@/components/ui/Button';
import type { FluentIcon } from '@fluentui/react-icons';

type NavPath = (typeof NAV_ITEMS)[number]['path'];

const navIconMap: Partial<Record<NavPath, FluentIcon>> = {
  '/': navigationIcons.dashboard
};

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useAppStore();
  const { logout, user } = useAuth();

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-primary-500)] text-white shadow-[0_20px_60px_rgba(56,92,255,0.28)]">
          <span className="text-lg font-black">ED</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">Booksa</p>
          <p className="text-xs text-[var(--color-text-secondary)]">Suite de tableau de bord</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = navIconMap[item.path] ?? navigationIcons.dashboard;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition',
                  isActive
                    ? 'bg-[color-mix(in_srgb,var(--color-primary-500)_14%,transparent)] text-[var(--color-primary-500)] ring-1 ring-[color-mix(in_srgb,var(--color-primary-500)_24%,transparent)]'
                    : 'text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-[var(--color-text-primary)]'
                )
              }
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-6 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">Connecté en tant que</p>
        <p className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">{user?.name ?? 'Utilisateur Booksa'}</p>
        <p className="text-xs text-[var(--color-text-secondary)]">{user?.email ?? 'utilisateur@booksa.io'}</p>
        <Button variant="secondary" className="mt-4 w-full" onClick={logout}>
          Se déconnecter
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden h-screen w-72 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-sidebar)] px-5 py-6 lg:block">
        {sidebarContent}
      </aside>

      <AnimatePresence>
        {sidebarOpen ? (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              aria-label="Fermer la barre latérale"
              className="absolute inset-0 bg-[var(--color-overlay)] backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ duration: 0.25 }}
              className="absolute left-0 top-0 h-full w-72 border-r border-[var(--color-border)] bg-[var(--color-sidebar)] px-5 py-6 shadow-2xl"
            >
              {sidebarContent}
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
