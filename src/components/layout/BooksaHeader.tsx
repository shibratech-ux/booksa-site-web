import BooksaLogo from './BooksaLogo';
import { GlobeRegular, PanelLeftRegular, SearchRegular, DismissRegular } from '@fluentui/react-icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import appleLogo from '@/assets/images/appel-logo.png';
import googleLogo from '@/assets/images/google-logo.png';
import { useTheme } from '@/theme/useTheme';
import { ROUTES } from '@/utils/constants';

type NavigationItem = {
  label: string;
  icon: string;
  path: string;
  badge?: string;
};

const navigationItems: NavigationItem[] = [
  {
    label: 'Logements',
    icon: '🏠',
    path: ROUTES.home
  },
  {
    label: 'Expériences',
    icon: '🎈',
    path: ROUTES.experiences
  },
  {
    label: 'Services',
    icon: '🔔',
    path: ROUTES.services
  }
] as const;

const activeTabUnderline = {
  type: 'spring',
  stiffness: 520,
  damping: 34,
  mass: 0.8
} as const;

const searchFieldItems = [
  { label: 'Où', value: 'Rechercher des destinations' },
  { label: 'Quand', value: 'Ajouter des dates' },
  { label: 'Qui', value: 'Ajouter des voyageurs' }
] as const;

function SearchField({ collapsed = false }: { collapsed?: boolean }) {
  const { theme } = useTheme();
  const isCompact = collapsed;

  return (
    <motion.button
      type="button"
      aria-label="Rechercher des destinations, des dates et des voyageurs"
      layout
      animate={{
        width: isCompact ? '42%' : '100%',
        maxWidth: isCompact ? 440 : 660,
        height: isCompact ? 46 : 'auto'
      }}
      transition={{ type: 'spring', stiffness: 260, damping: 30, mass: 1 }}
      className={`flex items-center rounded-full border text-left shadow-[0_18px_50px_rgba(15,23,42,0.10)] transition hover:shadow-[0_22px_60px_rgba(15,23,42,0.12)] ${
        isCompact ? 'mx-6 w-full justify-between px-0 lg:mx-10' : 'w-full'
      }`}
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border
      }}
    >
      <div
        className={`flex w-full items-center ${
          isCompact ? 'px-1.5 py-1.5 lg:px-2.5 lg:py-2.5' : 'px-1.5 py-1.5 sm:px-3 sm:py-3'
        }`}
      >
        {searchFieldItems.map((field, index) => (
          <div key={field.label} className="flex min-w-0 flex-1 items-center">
            <div className={`min-w-0 ${isCompact ? 'px-3 py-1' : 'px-5 py-1.5'}`}>
              <p
                className={`font-semibold ${isCompact ? 'text-[13px] lg:text-[12px]' : 'text-[14px] lg:text-[13px]'}`}
                style={{ color: theme.colors.textPrimary }}
              >
                {field.label}
              </p>
              <p
                className={`truncate ${isCompact ? 'text-[13px] lg:text-[12px]' : 'text-[14px] lg:text-[13px]'}`}
                style={{ color: theme.colors.textSecondary }}
              >
                {field.value}
              </p>
            </div>

            {index < 2 ? (
              <div
                className="hidden h-9 w-px sm:block"
                aria-hidden="true"
                style={{ backgroundColor: theme.colors.border }}
              />
            ) : null}
          </div>
        ))}

        <span
          className={`ml-2 inline-flex shrink-0 items-center justify-center rounded-full text-white shadow-[0_12px_26px_rgba(56,92,255,0.38)] ${
            isCompact ? 'h-10 w-10' : 'h-12 w-12'
          }`}
          style={{ backgroundColor: theme.colors.primary[500] }}
        >
          <SearchRegular className={isCompact ? 'h-4 w-4' : 'h-5 w-5'} aria-hidden="true" />
        </span>
      </div>
    </motion.button>
  );
}

function LoginSignupDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { theme } = useTheme();
  const [identifier, setIdentifier] = useState('');

  useEffect(() => {
    if (!open || typeof document === 'undefined') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6 backdrop-blur-[2px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        onMouseDown={(event) => event.stopPropagation()}
        className="relative w-full max-w-[460px] rounded-[30px] px-5 pb-6 pt-5 shadow-[0_30px_90px_rgba(15,23,42,0.28)] sm:px-6 sm:pb-7 sm:pt-6"
        style={{
          backgroundColor: theme.colors.surface,
          border: `1px solid ${theme.colors.border}`
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full transition"
          style={{ color: theme.colors.textSecondary }}
        >
          <DismissRegular className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="mx-auto flex max-w-[360px] flex-col items-stretch">
          <div className="mb-4 flex justify-center">
            <BooksaLogo className="h-10 w-[110px]" />
          </div>

          <h2
            className="text-center text-[25px] font-semibold tracking-[-0.02em] sm:text-[28px]"
            style={{ color: theme.colors.textPrimary }}
          >
            Log in or sign up
          </h2>

          <div className="mt-6">
            <input
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              type="text"
              placeholder="Phone number or email"
              className="h-[60px] w-full rounded-2xl border border-slate-300 px-4 text-[16px] text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-slate-400"
              style={{
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border,
                color: theme.colors.textPrimary,
                caretColor: theme.colors.primary[500]
              }}
            />
          </div>

          <p className="mt-3 text-[13px] leading-5" style={{ color: theme.colors.textSecondary }}>
            We’ll send a confirmation code by text or email. Message and data rates apply.{' '}
            <a
              href="#"
              className="font-semibold underline underline-offset-2"
              style={{ color: theme.colors.textPrimary }}
            >
              Privacy Policy
            </a>
          </p>

          <button
            type="button"
            className="mt-4 inline-flex h-12 items-center justify-center rounded-[14px] text-[16px] font-semibold text-white transition hover:opacity-95"
            style={{
              backgroundImage: `linear-gradient(90deg, ${theme.colors.primary[500]} 0%, ${theme.colors.secondary} 100%)`
            }}
          >
            Continue
          </button>

          <div className="mt-4 flex items-center gap-3" style={{ color: theme.colors.textSecondary }}>
            <span className="h-px flex-1" style={{ backgroundColor: theme.colors.border }} />
            <span className="text-sm">or</span>
            <span className="h-px flex-1" style={{ backgroundColor: theme.colors.border }} />
          </div>

          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              aria-label="Continue with Google"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border text-[18px] shadow-sm transition"
              style={{
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                color: theme.colors.textSecondary
              }}
              >
              <img src={googleLogo} alt="" aria-hidden="true" className="h-6 w-6 object-contain" />
            </button>
            <button
              type="button"
              aria-label="Continue with Apple"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border text-[18px] shadow-sm transition"
              style={{
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                color: theme.colors.textPrimary
              }}
              >
              <img src={appleLogo} alt="" aria-hidden="true" className="h-15 w-15 object-contain" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}

function CompactMobileHeader() {
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-[1500px] px-4 pb-3 pt-4 sm:px-5 lg:hidden">
      <button
        type="button"
        aria-label="Rechercher"
        className="mx-auto flex w-full max-w-[300px] items-center justify-center gap-2 rounded-full border px-4 py-4 text-[15px] font-semibold shadow-[0_14px_32px_rgba(15,23,42,0.10)]"
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          color: theme.colors.textPrimary
        }}
      >
        <SearchRegular className="h-4 w-4 shrink-0" aria-hidden="true" style={{ color: theme.colors.textPrimary }} />
        <span>Lancer la recherche</span>
      </button>

      <nav aria-label="Primary" className="mt-4 flex items-start justify-center gap-7">
        {navigationItems.map((item) => (
          <button
            key={item.label}
            type="button"
            className="relative flex cursor-pointer flex-col items-center gap-1"
            onClick={() => navigate(item.path)}
            style={{ color: location.pathname === item.path ? theme.colors.textPrimary : theme.colors.textSecondary }}
          >
            <span className="relative inline-flex items-center justify-center">
              <span className="text-[28px] leading-none">{item.icon}</span>
              {item.badge ? (
                <span
                  className="absolute -right-5 -top-2 rounded-full px-1.5 py-0.5 text-[8px] font-bold tracking-[0.14em] text-white shadow-sm"
                  style={{ backgroundColor: theme.colors.textPrimary }}
                >
                  {item.badge}
                </span>
              ) : null}
            </span>

            <span className="text-[14px] font-medium leading-none">{item.label}</span>

            {location.pathname === item.path ? (
              <motion.span
                layoutId="booksa-mobile-active-tab"
                transition={activeTabUnderline}
                className="h-0.5 w-10 rounded-full"
                style={{ backgroundColor: theme.colors.textPrimary }}
              />
            ) : (
              <span className="h-0.5 w-10 rounded-full bg-transparent" />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}

export default function BooksaHeader() {
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);

  useEffect(() => {
    const updateCollapseState = () => {
      setIsCollapsed(window.scrollY > 24);
    };

    updateCollapseState();
    window.addEventListener('scroll', updateCollapseState, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateCollapseState);
    };
  }, []);

  function handleNavigate(path: string) {
    navigate(path);
  }

  return (
    <header
      className="sticky top-0 z-30 border-b"
      style={{
        backgroundColor: theme.colors.background,
        borderColor: theme.colors.border
      }}
    >
      <motion.div
        className="mx-auto hidden max-w-[1500px] overflow-hidden px-4 lg:block lg:px-8"
        animate={{
          minHeight: isCollapsed ? 124 : 184,
          paddingTop: isCollapsed ? 8 : 24,
          paddingBottom: isCollapsed ? 10 : 0
        }}
        transition={{ type: 'spring', stiffness: 220, damping: 28, mass: 1.05 }}
      >
        <motion.div
          className="flex items-start justify-between gap-6"
          animate={{ alignItems: isCollapsed ? 'center' : 'flex-start' }}
          transition={{ type: 'spring', stiffness: 220, damping: 28, mass: 1.05 }}
        >
          <BooksaLogo className="h-10 w-[108px] shrink-0" />

          <nav aria-label="Primary" className="flex flex-1 items-start justify-center gap-8 pt-1">
            {navigationItems.map((item) => (
              <button
                key={item.label}
                type="button"
                className="relative flex cursor-pointer flex-col items-center gap-1 transition"
                onClick={() => handleNavigate(item.path)}
                style={{ color: location.pathname === item.path ? theme.colors.textPrimary : theme.colors.textSecondary }}
              >
                <span className="flex items-center gap-1.5 text-[14px] font-medium">
                  <span className="text-[26px] leading-none">{item.icon}</span>
                  <span className="relative">
                    {item.label}
                    {item.badge ? (
                      <span
                        className="absolute -right-8 -top-3 rounded-full px-1.5 py-0.5 text-[9px] font-bold tracking-[0.14em] text-white shadow-sm"
                        style={{ backgroundColor: theme.colors.textPrimary }}
                      >
                        {item.badge}
                      </span>
                    ) : null}
                  </span>
                </span>

                {location.pathname === item.path ? (
                  <motion.span
                    layoutId="booksa-desktop-active-tab"
                    transition={activeTabUnderline}
                    className="mt-2 h-0.5 w-20 rounded-full"
                    style={{ backgroundColor: theme.colors.textPrimary }}
                  />
                ) : (
                  <span className="mt-2 h-0.5 w-20 rounded-full bg-transparent" />
                )}
              </button>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2 pt-1">
            <button
              type="button"
              className="rounded-full px-4 py-2 text-[15px] font-medium transition hover:opacity-90"
              style={{ color: theme.colors.textPrimary }}
              onClick={() => setIsLoginDialogOpen(true)}
            >
              Devenir hôte
            </button>
            <button
              type="button"
              aria-label="Langue"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:opacity-90"
              style={{
                backgroundColor: theme.colors.surface,
                color: theme.colors.textSecondary
              }}
            >
              <GlobeRegular className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:opacity-90"
              style={{
                backgroundColor: theme.colors.surface,
                color: theme.colors.textSecondary
              }}
            >
              <PanelLeftRegular className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </motion.div>

        <motion.div
          className="flex justify-center overflow-hidden"
          animate={{
            opacity: isCollapsed ? 0 : 1,
            height: isCollapsed ? 0 : 'auto',
            marginTop: isCollapsed ? 0 : 20,
            paddingBottom: isCollapsed ? 0 : 20
          }}
          transition={{ type: 'spring', stiffness: 180, damping: 24, mass: 1.1 }}
        >
          <SearchField collapsed={isCollapsed} />
        </motion.div>
      </motion.div>

      <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-3 max-[611px]:hidden lg:hidden">
        <BooksaLogo className="h-8 w-[96px]" />

        <div className="flex items-center gap-2">
          <button
            type="button"
              aria-label="Langue"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full"
            style={{
              backgroundColor: theme.colors.surface,
              color: theme.colors.textSecondary
            }}
          >
            <GlobeRegular className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full"
            style={{
              backgroundColor: theme.colors.surface,
              color: theme.colors.textSecondary
            }}
          >
            <PanelLeftRegular className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-[1500px] px-4 pb-3 max-[611px]:hidden lg:hidden">
        <button
          type="button"
          aria-label="Rechercher des destinations, des dates et des voyageurs"
          className="flex w-full items-center justify-between gap-4 rounded-full border px-4 py-3 text-left shadow-[0_18px_50px_rgba(15,23,42,0.10)]"
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border
          }}
        >
          <div>
            <p className="text-[13px] font-semibold" style={{ color: theme.colors.textPrimary }}>
              Où allez-vous ?
            </p>
            <p className="text-[12px]" style={{ color: theme.colors.textSecondary }}>
              Rechercher des destinations, des dates et des voyageurs
            </p>
          </div>
          <span
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white shadow-[0_12px_26px_rgba(56,92,255,0.38)]"
            style={{ backgroundColor: theme.colors.primary[500] }}
          >
            <SearchRegular className="h-4 w-4" aria-hidden="true" />
          </span>
        </button>
      </div>

      <div className="hidden max-[611px]:block">
        <CompactMobileHeader />
      </div>

      <LoginSignupDialog open={isLoginDialogOpen} onClose={() => setIsLoginDialogOpen(false)} />
    </header>
  );
}
