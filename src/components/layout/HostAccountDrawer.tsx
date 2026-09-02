import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  FiBell,
  FiBookOpen,
  FiGlobe,
  FiHelpCircle,
  FiLogOut,
  FiPlus,
  FiSettings,
  FiUserPlus,
  FiUsers,
  FiX
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/utils/constants';
import { useTranslation } from 'react-i18next';
import type { AccountSettingsSection } from '@/pages/home/listing/account-settings/components/AccountSettingsSidebar';

type DrawerAction = {
  icon: typeof FiSettings;
  labelKey:
    | 'drawer.accountSettings'
    | 'drawer.languagesCurrency'
    | 'drawer.hostResources'
    | 'drawer.getHelp'
    | 'drawer.findCoHost'
    | 'drawer.newListing'
    | 'drawer.referHost';
  path?: string;
  section?: AccountSettingsSection;
};

const drawerActions: DrawerAction[] = [
  { icon: FiSettings, labelKey: 'drawer.accountSettings', path: ROUTES.hostAccountSettings },
  { icon: FiGlobe, labelKey: 'drawer.languagesCurrency', path: ROUTES.hostAccountSettings, section: 'languages-currency' },
  { icon: FiBookOpen, labelKey: 'drawer.hostResources' },
  { icon: FiHelpCircle, labelKey: 'drawer.getHelp' },
  { icon: FiUserPlus, labelKey: 'drawer.findCoHost' },
  { icon: FiPlus, labelKey: 'drawer.newListing', path: ROUTES.hostListingSetup },
  { icon: FiUsers, labelKey: 'drawer.referHost' }
];

export const hostOnboardingImages = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=400&q=80'
];

export function HostAccountDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const { t } = useTranslation('dashboard');
  const { t: tCommon } = useTranslation('common');
  const { t: tNavigation } = useTranslation('navigation');
  const { logout } = useAuth();
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, open]);

  const openPath = (path?: string, section?: AccountSettingsSection) => {
    if (!path) return;
    onClose();
    navigate(path, { state: section ? { section } : undefined });
  };

  const handleLogout = async () => {
    onClose();
    await logout();
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[100] bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onClose}
        >
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="host-menu-title"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 330, damping: 34 }}
            onMouseDown={(event) => event.stopPropagation()}
            className="absolute right-0 top-0 flex h-full w-full max-w-[528px] flex-col overflow-hidden rounded-lg bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-[var(--shadow-xl)]"
          >
            <div className="flex items-center justify-end gap-3 px-6 pb-2 pt-7 sm:px-10">
              <button
                type="button"
                aria-label={tNavigation('notifications')}
                className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-[var(--color-surface-muted)] transition hover:brightness-95"
              >
                <FiBell className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label={tNavigation('closeMenu')}
                className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-[var(--color-surface-muted)] transition hover:brightness-95"
              >
                <FiX className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-8 sm:px-12">
              <h2 id="host-menu-title" className="mt-7 text-[37.53792px] font-semibold tracking-[-0.04em]">
                {t('drawer.title')}
              </h2>

              <section className="mt-10 rounded-sm bg-[var(--color-surface-muted)] p-5 text-center">
                <div className="relative mx-auto h-36 max-w-[313.5px]" aria-hidden="true">
                  {hostOnboardingImages.map((image, index) => {
                    const offset = (index - 1) * 68;
                    const rotation = (index - 1) * 9;

                    return (
                      <motion.img
                        key={image}
                        src={image}
                        alt=""
                        className="absolute left-1/2 top-1/2 -ml-14 -mt-12 h-24 w-28 rounded-sm border-4 border-[var(--color-surface-muted)] object-cover shadow-[var(--shadow-sm)]"
                        initial={
                          shouldReduceMotion ? false : { x: 0, y: 0, rotate: 0, scale: 0.82, opacity: 0 }
                        }
                        animate={
                          shouldReduceMotion
                            ? { x: offset, rotate: rotation, opacity: 1 }
                            : { x: offset, y: [0, -5, 0], rotate: rotation, scale: 1, opacity: 1 }
                        }
                        transition={
                          shouldReduceMotion
                            ? { duration: 0 }
                            : {
                                x: { type: 'spring', stiffness: 240, damping: 20, delay: index * 0.1 },
                                rotate: {
                                  type: 'spring',
                                  stiffness: 240,
                                  damping: 20,
                                  delay: index * 0.1
                                },
                                scale: {
                                  type: 'spring',
                                  stiffness: 240,
                                  damping: 20,
                                  delay: index * 0.1
                                },
                                opacity: { duration: 0.25, delay: index * 0.1 },
                                y: {
                                  duration: 0.7,
                                  delay: 0.45 + index * 0.1,
                                  ease: 'easeInOut'
                                }
                              }
                        }
                        style={{
                          zIndex: index === 1 ? 2 : 1
                        }}
                      />
                    );
                  })}
                </div>
                <h3 className="text-xl font-semibold">{t('drawer.newToBooksa')}</h3>
                <p className="mx-auto mt-1 max-w-xs text-sm leading-5 text-[var(--color-text-secondary)]">
                  {t('drawer.onboarding')}
                </p>
                <button
                  type="button"
                  onClick={() => openPath(ROUTES.hostListingSetup)}
                  className="mt-6 w-full rounded-md bg-[var(--color-surface)] px-5 py-3 text-sm font-semibold shadow-[var(--shadow-sm)] transition hover:brightness-95"
                >
                  {tCommon('actions.start')}
                </button>
              </section>

              <nav aria-label={t('drawer.hostAccountMenu')} className="mt-9 space-y-1">
                {drawerActions.map(({ icon: Icon, labelKey, path, section }) => (
                  <button
                    key={labelKey}
                    type="button"
                    onClick={() => openPath(path, section)}
                    className="flex w-full items-center gap-5 rounded-md px-1 py-3.5 text-left transition hover:bg-[var(--color-surface-muted)]"
                  >
                    <Icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                    <span className="text-base">{t(labelKey)}</span>
                  </button>
                ))}
              </nav>

              <div className="mt-5 border-t border-[var(--color-border)] pt-5">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-5 rounded-md px-1 py-3.5 text-left transition hover:bg-[var(--color-surface-muted)]"
                >
                  <FiLogOut className="h-6 w-6" aria-hidden="true" />
                  <span className="text-base">{tNavigation('logout')}</span>
                </button>
              </div>
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
