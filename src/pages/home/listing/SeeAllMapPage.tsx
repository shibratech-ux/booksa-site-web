import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  Check,
  CircleHelp,
  CircleUserRound,
  Globe2,
  Heart,
  House,
  Luggage,
  MessageSquare,
  Settings2,
  Tag,
  ChevronLeft,
  ChevronRight,
  ListFilter,
  Search,
  Star,
  Menu
} from 'lucide-react';
import { AuthRequiredSheet } from '@/components/auth/AuthRequiredSheet';
import { SearchDialog } from '@/components/home/SearchDialog';
import { BackButton } from '@/components/ui/BackButton';
import { Modal } from '@/components/ui/Modal';
import BooksaLogo from '@/components/layout/BooksaLogo';
import { LanguageSwitcher } from '@/components/language/LanguageSwitcher';
import MarketplaceMobileNav from '@/components/layout/MarketplaceMobileNav';
import { BooksaMap, type BooksaMapMarker } from '@/components/maps/BooksaMap';
import { Button } from '@/components/ui/Button';
import { ShimmerImage } from '@/components/ui/ShimmerImage';
import { useAuth } from '@/hooks/useAuth';
import { useAuthGate } from '@/hooks/useAuthGate';
import type { Listing } from './listing.types';
import { useTheme } from '@/theme/useTheme';
import { ROUTES } from '@/utils/constants';
import { formatCurrency } from '@/utils/formatters';
import { persistListingContext } from '@/utils/navigationPersistence';
import {
  DEFAULT_MAP_VALUES,
  DEFAULT_MAP_VIEW,
  DEFAULT_STAY_NIGHTS,
  type SeeAllMapValue,
  usdToCdf
} from './seeAllMapDefaults';

const filters = [
  'Self check-in',
  'Instant Book',
  'Free parking',
  '1+ bathrooms',
  'Air conditioning',
  'Wifi',
  'TV',
  'Allows pets',
  'Kitchen'
] as const;

type FilterName = (typeof filters)[number];

const quickFilters: FilterName[] = [
  'Allows pets',
  'Free parking',
  'TV',
  'Wifi',
  'Air conditioning',
  'Self check-in',
  'Instant Book'
];

type Stay = {
  badge?: string;
  gallery: string[];
  title: string;
  area: string;
  details: string;
  dates: string;
  price: number;
  nights: number;
  rating: string;
  amenities: FilterName[];
  isNew?: boolean;
};

const photos = [
  [
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=900&q=85'
  ],
  [
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1600566753051-f0b89df2dd90?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=900&q=85'
  ],
  [
    'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1600210491369-e753d80a41f3?auto=format&fit=crop&w=900&q=85'
  ],
  [
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=85'
  ]
];

const baseStays: Stay[] = [
  {
    gallery: photos[0],
    title: 'Apartment in Gombe',
    area: 'Riverside city view',
    details: '4 bedrooms · 4 beds · 4.5 baths',
    dates: 'Sep 11 – 13',
    price: 418,
    nights: 2,
    rating: 'New',
    amenities: ['Free parking', 'Self check-in', 'Wifi', '1+ bathrooms', 'Air conditioning', 'TV', 'Kitchen'],
    isNew: true
  },
  {
    badge: 'Guest favorite',
    gallery: photos[1],
    title: 'Home in Ngaliema',
    area: 'Garden residence',
    details: '6 bedrooms · 6 beds · 4 baths',
    dates: 'Oct 16 – 18',
    price: 954,
    nights: 2,
    rating: '4.98 (49)',
    amenities: ['Free parking', 'Self check-in', 'Wifi', '1+ bathrooms', 'Air conditioning', 'TV', 'Instant Book', 'Kitchen']
  },
  {
    badge: 'Superhost',
    gallery: photos[2],
    title: 'Villa in Ma Campagne',
    area: 'Private garden villa',
    details: '5 bedrooms · 6 beds · 5 baths',
    dates: 'Nov 7 – 9',
    price: 643,
    nights: 2,
    rating: '4.91 (72)',
    amenities: ['Free parking', 'Wifi', '1+ bathrooms', 'Air conditioning', 'TV', 'Allows pets', 'Kitchen']
  },
  {
    gallery: photos[3],
    title: 'Apartment in Lingwala',
    area: 'Modern central retreat',
    details: '3 bedrooms · 3 beds · 2 baths',
    dates: 'Sep 26 – 28',
    price: 365,
    nights: 2,
    rating: '4.87 (38)',
    amenities: ['Self check-in', 'Wifi', '1+ bathrooms', 'Air conditioning', 'TV', 'Allows pets', 'Instant Book', 'Kitchen']
  }
];

const stays = [
  ...baseStays,
  ...Array.from({ length: 20 }, (_, index) => ({
    ...baseStays[index % baseStays.length],
    title: `${baseStays[index % baseStays.length].title} ${index + 2}`
  }))
];

function formatTwoNightPriceInCdf(usdAmount: number) {
  return formatCurrency(usdToCdf(usdAmount), 'CDF');
}

function matchesFilters(stay: Stay, selectedFilters: FilterName[]) {
  return selectedFilters.every((filter) => stay.amenities.includes(filter));
}

function SeeAllHeader({
  selectedFilters,
  onToggleFilter,
  onOpenSearch,
  onOpenFilters
}: {
  selectedFilters: FilterName[];
  onToggleFilter: (filter: FilterName) => void;
  onOpenSearch: () => void;
  onOpenFilters: () => void;
}) {
  const { theme } = useTheme();
  const { status, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuId = useId();
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const { t } = useTranslation('navigation');
  const activeFilterCount = selectedFilters.length;

  useEffect(() => {
    if (!isMenuOpen) return;

    const focusFrame = window.requestAnimationFrame(() => {
      menuRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus();
    });
    const handleMouseDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setIsMenuOpen(false);
    };
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);
  const navigateFromMenu = (path: string) => {
    closeMenu();
    navigate(path);
  };
  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
      closeMenu();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleMenuKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    const items = Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)') ?? []);
    const activeIndex = items.indexOf(document.activeElement as HTMLButtonElement);
    const direction = event.key === 'ArrowDown' ? 1 : -1;
    const nextIndex = activeIndex < 0
      ? 0
      : (activeIndex + direction + items.length) % items.length;
    items[nextIndex]?.focus();
  };

  return (
    <header
      className="relative z-30 hidden border-b sm:block"
      style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}
    >
      <div className="marketplace-reference-container mx-auto flex h-24 items-center justify-between gap-4 px-4 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:px-0">
        <BooksaLogo className="h-9 w-[104px] shrink-0" />

        <button
          type="button"
          aria-label={t('openSearch')}
          onClick={onOpenSearch}
          className="flex h-[46px] min-w-0 flex-1 items-center rounded-full border pl-3 pr-1.5 text-left shadow-sm transition hover:shadow-md md:max-w-[466px] lg:w-[466px] lg:justify-self-center"
          style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}
        >
          <House className="mr-2 h-5 w-5 shrink-0" aria-hidden="true" />
          <span className="min-w-0 truncate text-[13px] font-semibold">{t('mapResults.destination')}</span>
          <span className="mx-2 hidden h-6 w-px shrink-0 md:block" style={{ backgroundColor: theme.colors.border }} />
          <span className="hidden whitespace-nowrap text-[13px] font-medium md:block">{t('mapResults.anyWeekend')}</span>
          <span className="mx-2 hidden h-6 w-px shrink-0 md:block" style={{ backgroundColor: theme.colors.border }} />
          <span className="hidden whitespace-nowrap text-[13px] font-medium md:block">{t('addGuests')}</span>
          <span
            className="ml-auto inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white"
            style={{ backgroundColor: theme.colors.primary[500] }}
          >
            <Search className="h-[15px] w-[15px]" aria-hidden="true" />
          </span>
        </button>

        <div className="flex shrink-0 items-center justify-end gap-3 lg:justify-self-end">
          <button
            type="button"
            onClick={() => navigate(ROUTES.hostListings)}
            className="hidden whitespace-nowrap rounded-full px-3 py-3 text-[13px] font-semibold transition hover:bg-[var(--color-surface-muted)] xl:block"
          >
            Become a host
          </button>

          <LanguageSwitcher iconOnly />

          <div ref={menuRef} className="relative">
            <button
              ref={menuButtonRef}
              type="button"
              aria-label={isMenuOpen ? 'Close account menu' : 'Open account menu'}
              aria-controls={menuId}
              aria-expanded={isMenuOpen}
              aria-haspopup="menu"
              onClick={() => setIsMenuOpen((open) => !open)}
              className="inline-flex h-10 max-sm:h-11 max-sm:w-11 w-10 items-center justify-center rounded-full transition hover:opacity-80"
              style={{ backgroundColor: theme.colors.surfaceMuted }}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>

            <AnimatePresence>
              {isMenuOpen ? (
                <motion.div
                  id={menuId}
                  role="menu"
                  aria-label="Account menu"
                  onKeyDown={handleMenuKeyDown}
                  initial={{ opacity: 0, scale: 0.97, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: 14 }}
                  transition={{ type: 'spring', stiffness: 360, damping: 28, mass: 0.8 }}
                  className="absolute right-0 top-full z-50 mt-4 w-[292.6px] overflow-hidden rounded-menu border py-2.5 text-left shadow-[var(--shadow-lg)]"
                  style={{
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    color: theme.colors.textPrimary
                  }}
                >
                  {[
                    { label: 'Wishlists', Icon: Heart, action: closeMenu },
                    { label: 'Trips', Icon: Luggage, action: closeMenu },
                    { label: 'Messages', Icon: MessageSquare, action: () => navigateFromMenu(ROUTES.messages) },
                    { label: 'Profile', Icon: CircleUserRound, action: () => navigateFromMenu(ROUTES.hostProfile) }
                  ].map(({ label, Icon, action }) => (
                    <button key={label} type="button" role="menuitem" onClick={action} className="flex w-full items-center gap-3 px-5 py-2.5 text-sm font-medium transition hover:bg-[var(--color-surface-muted)]">
                      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                      {label}
                    </button>
                  ))}

                  <div className="mx-5 my-2 h-px" style={{ backgroundColor: theme.colors.border }} />

                  {[
                    { label: 'Notifications', Icon: Bell, action: closeMenu },
                    { label: 'Account settings', Icon: Settings2, action: () => navigateFromMenu(ROUTES.hostAccountSettings) },
                    { label: 'Languages & currency', Icon: Globe2, action: closeMenu },
                    { label: 'Help Center', Icon: CircleHelp, action: closeMenu }
                  ].map(({ label, Icon, action }) => (
                    <button key={label} type="button" role="menuitem" onClick={action} className="flex w-full items-center gap-3 px-5 py-2.5 text-sm transition hover:bg-[var(--color-surface-muted)]">
                      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                      {label}
                    </button>
                  ))}

                  <div className="mx-5 my-2 h-px" style={{ backgroundColor: theme.colors.border }} />

                  <button type="button" role="menuitem" onClick={() => navigateFromMenu(ROUTES.hostListings)} className="flex w-full items-center justify-between gap-3 px-5 py-2 text-left transition hover:bg-[var(--color-surface-muted)]">
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">Become a host</span>
                      <span className="mt-0.5 block text-xs leading-4" style={{ color: theme.colors.textSecondary }}>
                        It&apos;s easy to start hosting and earn extra income.
                      </span>
                    </span>
                    <span className="shrink-0 text-3xl" aria-hidden="true">🧑‍💼</span>
                  </button>

                  <div className="mx-5 my-2 h-px" style={{ backgroundColor: theme.colors.border }} />

                  {['Refer a Host', 'Find a co-host', 'Gift cards'].map((label) => (
                    <button key={label} type="button" role="menuitem" onClick={closeMenu} className="block w-full px-5 py-2.5 text-left text-sm transition hover:bg-[var(--color-surface-muted)]">
                      {label}
                    </button>
                  ))}

                  <div className="mx-5 my-2 h-px" style={{ backgroundColor: theme.colors.border }} />

                  <Button
                    variant="ghost"
                    size="sm"
                    role="menuitem"
                    loading={isLoggingOut}
                    onClick={() => {
                      if (status === 'authenticated') {
                        void handleLogout();
                      } else {
                        navigateFromMenu(ROUTES.login);
                      }
                    }}
                    whileHover={{}}
                    whileTap={{}}
                    className="h-auto min-h-0 w-full justify-start rounded-none px-5 py-2.5 text-left text-sm font-normal hover:translate-y-0 hover:bg-[var(--color-surface-muted)] hover:shadow-none disabled:cursor-wait disabled:opacity-50"
                  >
                    {isLoggingOut ? 'Logging out…' : status === 'authenticated' ? 'Log out' : 'Log in or sign up'}
                  </Button>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="marketplace-reference-container mx-auto h-16 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="mx-auto flex h-full w-max min-w-full items-center justify-center gap-2 px-4 pb-2 lg:px-0">
          <button
            type="button"
            aria-label={t('mapResults.filters')}
            onClick={onOpenFilters}
            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-3 text-[12px] font-medium transition"
            style={{
              borderColor: activeFilterCount ? theme.colors.textPrimary : theme.colors.border,
              backgroundColor: activeFilterCount ? theme.colors.surfaceMuted : theme.colors.surface,
              color: theme.colors.textPrimary
            }}
          >
            <ListFilter className="h-4 w-4" aria-hidden="true" /> {t('mapResults.filters')}
            {activeFilterCount ? (
              <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-primary-500)] px-1 text-xs font-bold text-white">
                {activeFilterCount}
              </span>
            ) : null}
          </button>
          <span className="mx-1 h-5 w-px shrink-0" style={{ backgroundColor: theme.colors.border }} />
          {quickFilters.map((filter) => {
            const isSelected = selectedFilters.includes(filter);
            return (
              <button
                key={filter}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onToggleFilter(filter)}
                className="min-h-11 shrink-0 whitespace-nowrap rounded-full border px-3.5 text-[12px] font-medium transition hover:-translate-y-px"
                style={{
                  borderColor: isSelected ? theme.colors.textPrimary : theme.colors.border,
                  backgroundColor: isSelected ? theme.colors.surfaceMuted : theme.colors.surface,
                  color: theme.colors.textPrimary
                }}
              >
                {isSelected ? <Check className="mr-1 inline-block h-4 w-4" aria-hidden="true" /> : null}{t(`mapResults.amenities.${filter}`)}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}

function SeeAllMobileHeader({
  selectedFilters,
  onToggleFilter,
  onOpenSearch,
  onOpenFilters
}: {
  selectedFilters: FilterName[];
  onToggleFilter: (filter: FilterName) => void;
  onOpenSearch: () => void;
  onOpenFilters: () => void;
}) {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation('navigation');
  const activeFilterCount = selectedFilters.length;

  return (
    <header
      className="relative z-30 shrink-0 border-b sm:hidden"
      style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}
    >
      <div className="grid h-20 grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-2 px-3">
        <BackButton label={t('mapResults.back')} onClick={() => navigate(-1)} />

        <button
          type="button"
          aria-label={t('openSearch')}
          onClick={onOpenSearch}
          className="mx-auto flex h-14 w-full max-w-[360px] min-w-0 flex-col items-center justify-center rounded-full border px-4 text-center shadow-[var(--shadow-sm)]"
          style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}
        >
          <span className="w-full truncate text-sm font-semibold leading-5">{t('mapResults.destination')}</span>
          <span className="w-full truncate text-xs leading-4" style={{ color: theme.colors.textSecondary }}>
            {t('mapResults.anyWeekend')} · {t('addGuests')}
          </span>
        </button>

        <button
          type="button"
          aria-label={t('mapResults.filters')}
          onClick={onOpenFilters}
          className="relative inline-flex h-10 max-sm:h-11 max-sm:w-11 w-10 items-center justify-center rounded-full transition active:scale-95"
          style={{ color: activeFilterCount ? theme.colors.primary[500] : theme.colors.textPrimary }}
        >
          <ListFilter className="h-5 w-5" aria-hidden="true" />
          {activeFilterCount ? (
            <span className="absolute right-0.5 top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-primary-500)] px-1 text-xs font-bold text-white">
              {activeFilterCount}
            </span>
          ) : null}
        </button>
      </div>

      <div className="overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max gap-2">
          {quickFilters.map((filter) => {
            const isSelected = selectedFilters.includes(filter);
            return (
              <button
                key={filter}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onToggleFilter(filter)}
                className="min-h-11 shrink-0 whitespace-nowrap rounded-full border px-4 text-xs font-medium transition hover:bg-[var(--color-surface-muted)] active:scale-95"
                style={{
                  borderColor: isSelected ? theme.colors.textPrimary : theme.colors.border,
                  backgroundColor: isSelected ? theme.colors.surfaceMuted : theme.colors.surface,
                  color: theme.colors.textPrimary
                }}
              >
                {isSelected ? <Check className="mr-1 inline-block h-4 w-4" aria-hidden="true" /> : null}{t(`mapResults.amenities.${filter}`)}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}

function StayCard({ stay }: { stay: Stay }) {
  const { t } = useTranslation('navigation');
  const { theme } = useTheme();
  const navigate = useNavigate();
  const galleryRef = useRef<HTMLDivElement>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [saved, setSaved] = useState(false);
  const { requireAuth, authSheet } = useAuthGate();

  const listing: Listing = {
    badge: stay.badge,
    gallery: stay.gallery,
    image: stay.gallery[0],
    location: stay.title,
    price: formatTwoNightPriceInCdf(stay.price),
    rating: stay.rating,
    title: stay.area
  };

  const openListing = () => {
    persistListingContext(listing);
    navigate(generatePath(ROUTES.listingDetail, { listingId: encodeURIComponent(`${stay.title}-${stay.price}`) }), {
      state: { listing }
    });
  };

  const scrollGallery = (direction: -1 | 1) => {
    const gallery = galleryRef.current;
    if (!gallery) return;
    const next = Math.max(0, Math.min(stay.gallery.length - 1, activeImage + direction));
    gallery.scrollTo({ left: gallery.clientWidth * next, behavior: 'smooth' });
    setActiveImage(next);
  };

  useEffect(() => {
    const gallery = galleryRef.current;
    if (!gallery) return;
    const update = () => setActiveImage(Math.round(gallery.scrollLeft / Math.max(1, gallery.clientWidth)));
    gallery.addEventListener('scroll', update, { passive: true });
    return () => gallery.removeEventListener('scroll', update);
  }, []);

  return (
    <article className="group min-w-0">
      <div className="relative aspect-[1.04/1] overflow-hidden rounded-card" style={{ backgroundColor: theme.colors.surfaceMuted }}>
        <div ref={galleryRef} className="flex h-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {stay.gallery.map((image, index) => (
            <button
              key={`${stay.title}-${index}`}
              type="button"
              tabIndex={index === activeImage ? 0 : -1}
              onClick={openListing}
              aria-label={t('mapResults.openStay', { title: stay.title })}
              className="h-full w-full shrink-0 snap-start overflow-hidden focus-visible:outline focus-visible:-outline-offset-4 focus-visible:outline-[var(--color-text-primary)]"
            >
              <ShimmerImage
                src={image}
                alt={t('mapResults.photo', { title: stay.title, count: index + 1 })}
                className="h-full w-full object-cover transition duration-500 motion-reduce:transition-none group-hover:scale-[1.015]"
                loading="lazy"
              />
            </button>
          ))}
        </div>

        {stay.badge ? (
          <span className="absolute left-3 top-3 rounded-full bg-[var(--color-surface-raised)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text-primary)] shadow-sm">
            {stay.badge}
          </span>
        ) : null}

        <button
          type="button"
          aria-label={t(saved ? 'removeFromFavorites' : 'addToFavorites')}
          aria-pressed={saved}
          onClick={(event) => {
            event.stopPropagation();
            if (requireAuth()) setSaved((value) => !value);
          }}
          className="absolute right-2 top-2 inline-flex h-11 w-11 items-center justify-center rounded-full text-white bg-[var(--color-overlay)] transition hover:scale-105"
        >
          {saved ? <Heart className="h-6 w-6 text-[var(--color-primary-500)]" fill="currentColor" aria-hidden="true" /> : <Heart className="h-6 w-6" aria-hidden="true" />}
        </button>

        <button
          type="button"
          aria-label={t('mapResults.previousPhoto')}
          disabled={activeImage === 0}
          onClick={(event) => { event.stopPropagation(); scrollGallery(-1); }}
          className="absolute left-2 top-1/2 hidden h-11 w-11 disabled:invisible -translate-y-1/2 items-center justify-center rounded-full bg-[var(--color-surface-raised)] text-[var(--color-text-primary)] shadow-sm group-hover:flex group-focus-within:flex"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label={t('mapResults.nextPhoto')}
          disabled={activeImage === stay.gallery.length - 1}
          onClick={(event) => { event.stopPropagation(); scrollGallery(1); }}
          className="absolute right-2 top-1/2 hidden h-11 w-11 disabled:invisible -translate-y-1/2 items-center justify-center rounded-full bg-[var(--color-surface-raised)] text-[var(--color-text-primary)] shadow-sm group-hover:flex group-focus-within:flex"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {stay.gallery.map((_, index) => (
            <span key={index} className={`h-1.5 w-1.5 rounded-full ${index === activeImage ? 'bg-white' : 'bg-white/55'}`} />
          ))}
        </div>
      </div>

      <div className="pt-3 text-sm leading-5">
        <div className="flex items-start justify-between gap-2">
          <h2 className="min-w-0 truncate font-semibold"><button type="button" onClick={openListing} className="max-w-full truncate text-left hover:underline">{stay.title}</button></h2>
          <span className="flex shrink-0 items-center gap-1">
            <Star className="h-3 w-3" fill="currentColor" aria-hidden="true" /> {stay.isNew ? t('mapResults.new') : stay.rating}
          </span>
        </div>
        <p style={{ color: theme.colors.textSecondary }}>{stay.area}</p>
        <p style={{ color: theme.colors.textSecondary }}>{stay.details}</p>
        <p style={{ color: theme.colors.textSecondary }}>{stay.dates}</p>
        <p className="mt-1.5"><span className="font-semibold underline underline-offset-2">{formatTwoNightPriceInCdf(stay.price)}</span> <span style={{ color: theme.colors.textSecondary }}>{t('mapResults.nights', { count: stay.nights })}</span></p>
        <span className="mt-1 inline-flex rounded-pill bg-[var(--color-surface-muted)] px-1.5 py-0.5 text-xs font-medium text-[var(--color-text-secondary)]">{t('mapResults.freeCancellation')}</span>
      </div>
      <AuthRequiredSheet {...authSheet} />
    </article>
  );
}

function createMapMarkers(values: SeeAllMapValue[], markerLabel: (value: SeeAllMapValue) => string): BooksaMapMarker[] {
  return values.map((value) => ({
    id: value.id,
    label: formatTwoNightPriceInCdf(value.priceUsd),
    ariaLabel: markerLabel(value),
    latitude: value.latitude,
    longitude: value.longitude
  }));
}

function MapPanel({ values = DEFAULT_MAP_VALUES }: { values?: SeeAllMapValue[] }) {
  const { t } = useTranslation('navigation');
  const markers = createMapMarkers(values, (value) => t('mapResults.markerLabel', { title: value.listingTitle, price: formatTwoNightPriceInCdf(value.priceUsd), count: DEFAULT_STAY_NIGHTS }));

  return (
    <aside className="relative my-6 hidden min-h-0 overflow-hidden bg-[var(--color-surface-muted)] lg:block">
      <BooksaMap
        title={t('mapResults.mapTitle', { city: DEFAULT_MAP_VIEW.label })}
        center={DEFAULT_MAP_VIEW.center}
        initialZoom={DEFAULT_MAP_VIEW.zoom}
        minZoom={DEFAULT_MAP_VIEW.minZoom}
        maxZoom={DEFAULT_MAP_VIEW.maxZoom}
        initialBounds={DEFAULT_MAP_VIEW.bounds}
        markers={markers}
        interactive={false}
        controlLayout="split"
        className="h-full w-full rounded-none!"
        renderMarker={(marker) => (
          <span aria-label={marker.ariaLabel} title={marker.ariaLabel} className="block whitespace-nowrap rounded-full border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-2 text-xs font-semibold text-[var(--color-text-primary)] shadow-[var(--shadow-sm)]">
            {marker.label}
          </span>
        )}
      />
    </aside>
  );
}

function MobileMapPanel({ values = DEFAULT_MAP_VALUES }: { values?: SeeAllMapValue[] }) {
  const { t, i18n } = useTranslation('navigation');
  const compactCdf = new Intl.NumberFormat(i18n.resolvedLanguage, {
    notation: 'compact',
    maximumFractionDigits: 1
  });
  const markers: BooksaMapMarker[] = values.map((value) => ({
    id: value.id,
    label: `CDF ${compactCdf.format(usdToCdf(value.priceUsd))}`,
    ariaLabel: t('mapResults.markerLabel', { title: value.listingTitle, price: formatTwoNightPriceInCdf(value.priceUsd), count: DEFAULT_STAY_NIGHTS }),
    latitude: value.latitude,
    longitude: value.longitude
  }));

  return (
    <div className="absolute inset-x-0 top-0 z-0 h-[clamp(220px,34dvh,300px)]">
      <BooksaMap
        title={t('mapResults.mapTitle', { city: DEFAULT_MAP_VIEW.label })}
        center={DEFAULT_MAP_VIEW.center}
        initialZoom={DEFAULT_MAP_VIEW.zoom}
        minZoom={DEFAULT_MAP_VIEW.minZoom}
        maxZoom={DEFAULT_MAP_VIEW.maxZoom}
        initialBounds={DEFAULT_MAP_VIEW.bounds}
        markers={markers}
        interactive={false}
        showExpandControl={false}
        controlLayout="split"
        className="h-full w-full rounded-none!"
        renderMarker={(marker) => (
          <span
            aria-label={marker.ariaLabel}
            title={marker.ariaLabel}
            className="block whitespace-nowrap rounded-pill border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-2.5 py-1.5 text-xs font-bold text-[var(--color-text-primary)] shadow-sm"
          >
            {marker.label}
          </span>
        )}
      />
    </div>
  );
}

export default function SeeAllMapPage() {
  const { t } = useTranslation('navigation');
  const [searchOpen, setSearchOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<FilterName[]>([]);
  const { theme } = useTheme();
  const resultsRef = useRef<HTMLElement>(null);
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const [selectedFilters, setSelectedFilters] = useState<FilterName[]>([]);
  const filteredStays = useMemo(
    () => stays.filter((stay) => matchesFilters(stay, selectedFilters)),
    [selectedFilters]
  );
  const filteredMapValues = useMemo(
    () => DEFAULT_MAP_VALUES.filter((_, index) => matchesFilters(baseStays[index % baseStays.length], selectedFilters)),
    [selectedFilters]
  );
  const resultsTitle = t('mapResults.resultCount', { count: filteredStays.length });

  const openFilters = () => {
    setDraftFilters(selectedFilters);
    setFiltersOpen(true);
  };

  const toggleFilter = (filter: FilterName) => {
    setSelectedFilters((current) =>
      current.includes(filter)
        ? current.filter((item) => item !== filter)
        : [...current, filter]
    );
  };

  useEffect(() => {
    resultsRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    mobileScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedFilters]);

  return (
    <div className="flex h-dvh flex-col overflow-hidden" style={{ backgroundColor: theme.colors.surface, color: theme.colors.textPrimary }}>
      <SeeAllHeader
        selectedFilters={selectedFilters}
        onToggleFilter={toggleFilter}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenFilters={openFilters}
      />

      <SeeAllMobileHeader
        selectedFilters={selectedFilters}
        onToggleFilter={toggleFilter}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenFilters={openFilters}
      />

      <main className="relative isolate min-h-0 flex-1 overflow-hidden pb-[calc(64px+env(safe-area-inset-bottom))] sm:hidden">
        <MobileMapPanel values={filteredMapValues} />

        <div
          ref={mobileScrollRef}
          className="pointer-events-none absolute inset-x-0 top-0 bottom-[calc(64px+env(safe-area-inset-bottom))] z-10 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="h-[clamp(220px,34dvh,300px)]" aria-hidden="true" />

          <section
            className="pointer-events-auto relative min-h-full rounded-t-dialog px-5 pb-8 pt-2 shadow-[var(--shadow-md)]"
            style={{ backgroundColor: theme.colors.surface }}
          >
            <div className="mx-auto mb-5 h-1 w-8 rounded-full" style={{ backgroundColor: theme.colors.border }} />
            <h1 className="sr-only" aria-live="polite">{resultsTitle}</h1>
            <div className="mb-5 flex items-center justify-center gap-2 text-[13px] font-semibold">
              <Tag className="h-6 w-6 text-[var(--color-primary-500)]" aria-hidden="true" />
              {t('mapResults.feesIncluded')}
            </div>

            {filteredStays.length ? (
              <div className="grid grid-cols-1 gap-y-8">
                {filteredStays.map((stay, index) => <StayCard key={`mobile-${stay.title}-${index}`} stay={stay} />)}
              </div>
            ) : (
              <div className="flex min-h-[286px] flex-col items-center justify-center px-5 text-center">
                <House className="h-10 w-10 text-[var(--color-text-secondary)]" aria-hidden="true" />
                <h2 className="mt-4 text-base font-semibold">{t('mapResults.emptyTitle')}</h2>
                <p className="mt-2 text-xs" style={{ color: theme.colors.textSecondary }}>
                  {t('mapResults.emptyDescription')}
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedFilters([])}
                  className="mt-5 rounded-button px-5 py-2.5 text-xs font-semibold text-white"
                  style={{ backgroundColor: theme.colors.primary[500] }}
                >
                  {t('mapResults.clearFilters')}
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      <MarketplaceMobileNav />

      <main className="marketplace-reference-container mx-auto hidden min-h-0 flex-1 px-6 sm:block lg:px-0">
        <div className="grid h-full min-h-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.03fr)] xl:gap-12">
          <section ref={resultsRef} className="min-h-0 min-w-0 overflow-y-auto pb-10 pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex min-h-24 flex-wrap items-center justify-between gap-x-4 gap-y-2 py-5">
              <h1 aria-live="polite" className="text-[20px] font-semibold tracking-[-0.025em]">{resultsTitle}</h1>
              <span className="flex shrink-0 items-center gap-2 text-[13px] font-medium">
                <Tag className="h-6 w-6 shrink-0 text-[var(--color-primary-500)]" aria-hidden="true" /> {t('mapResults.feesIncluded')}
              </span>
            </div>

            {filteredStays.length ? (
              <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2">
                {filteredStays.map((stay, index) => <StayCard key={`${stay.title}-${index}`} stay={stay} />)}
              </div>
            ) : (
              <div className="flex min-h-[374px] flex-col items-center justify-center px-6 text-center">
                <House className="h-10 w-10 text-[var(--color-text-secondary)]" aria-hidden="true" />
                <h2 className="mt-4 text-base font-semibold">{t('mapResults.emptyTitle')}</h2>
                <p className="mt-2 max-w-sm text-xs" style={{ color: theme.colors.textSecondary }}>
                  {t('mapResults.emptyDescription')}
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedFilters([])}
                  className="mt-5 rounded-button px-5 py-2.5 text-xs font-semibold text-white"
                  style={{ backgroundColor: theme.colors.primary[500] }}
                >
                  {t('mapResults.clearFilters')}
                </button>
              </div>
            )}
          </section>

          <MapPanel values={filteredMapValues} />
        </div>
      </main>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
      <Modal
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title={t('mapResults.filters')}
        variant="sheet"
        footer={
          <div className="flex items-center justify-between gap-4">
            <button type="button" onClick={() => setDraftFilters([])} className="min-h-11 text-sm font-semibold underline underline-offset-4">
              {t('mapResults.clearFilters')}
            </button>
            <Button onClick={() => { setSelectedFilters(draftFilters); setFiltersOpen(false); }}>
              {t('mapResults.showHomes', { count: stays.filter((stay) => matchesFilters(stay, draftFilters)).length })}
            </Button>
          </div>
        }
      >
        <h2 className="mb-2 text-lg font-semibold">{t('mapResults.amenitiesTitle')}</h2>
        <p className="mb-6 text-sm text-[var(--color-text-secondary)]">{t('mapResults.amenitiesDescription')}</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filters.map((filter) => (
            <label key={filter} className="flex min-h-14 cursor-pointer items-center justify-between gap-3 rounded-card border border-[var(--color-border)] px-4 py-3 text-sm has-[:checked]:border-[var(--color-text-primary)] has-[:checked]:bg-[var(--color-surface-muted)]">
              {t(`mapResults.amenities.${filter}`)}
              <input
                type="checkbox"
                checked={draftFilters.includes(filter)}
                onChange={() => setDraftFilters((current) => current.includes(filter) ? current.filter((item) => item !== filter) : [...current, filter])}
                className="h-5 w-5 shrink-0 accent-[var(--color-text-primary)]"
              />
            </label>
          ))}
        </div>
      </Modal>
    </div>
  );
}
