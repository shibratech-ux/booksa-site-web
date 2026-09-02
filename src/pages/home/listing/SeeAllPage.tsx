import {
  ChevronLeftRegular,
  ChevronRightRegular,
  FilterRegular,
  HeartFilled,
  HeartRegular,
  LocationFilled,
  NavigationRegular,
  SearchRegular,
  StarFilled
} from '@fluentui/react-icons';
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';
import { FiMenu } from 'react-icons/fi';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  CircleHelp,
  CircleUserRound,
  Globe2,
  Heart,
  Luggage,
  MessageSquare,
  Settings2
} from 'lucide-react';
import BooksaLogo from '@/components/layout/BooksaLogo';
import MarketplaceMobileNav from '@/components/layout/MarketplaceMobileNav';
import { BooksaMap, type BooksaMapMarker } from '@/components/maps/BooksaMap';
import { ShimmerImage } from '@/components/ui/ShimmerImage';
import { useAuth } from '@/hooks/useAuth';
import { getUserProfileById } from '@/services/user.service';
import type { Listing } from './listing.types';
import { useTheme } from '@/theme/useTheme';
import { ROUTES } from '@/utils/constants';
import { formatCurrency } from '@/utils/formatters';
import { createAvatarFallback } from '@/utils/helpers';
import { persistListingContext } from '@/utils/navigationPersistence';
import {
  DEFAULT_MAP_VALUES,
  DEFAULT_MAP_VIEW,
  DEFAULT_STAY_NIGHTS,
  type SeeAllMapValue,
  usdToCdf
} from './seeAllMapDefaults';

const filters = [
  'Free parking',
  'Self check-in',
  'Wifi',
  '1+ bathrooms',
  'Air conditioning',
  'TV',
  'Allows pets',
  'Instant Book',
  'Kitchen'
] as const;

type FilterName = (typeof filters)[number];

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
    title: 'Home in Morningside',
    area: 'West Manor',
    details: '4 bedrooms · 4 beds · 4.5 baths',
    dates: 'Sep 11 – 13',
    price: 418,
    nights: 2,
    rating: 'New',
    amenities: ['Free parking', 'Self check-in', 'Wifi', '1+ bathrooms', 'Air conditioning', 'TV', 'Kitchen'],
    isNew: true
  },
  {
    badge: '🏆  Guest favorite',
    gallery: photos[1],
    title: 'Home in Sandton',
    area: '76b on Atholl',
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
    title: 'Villa in Morningside',
    area: 'Sandton Garden Villa',
    details: '5 bedrooms · 6 beds · 5 baths',
    dates: 'Nov 7 – 9',
    price: 643,
    nights: 2,
    rating: '4.91 (72)',
    amenities: ['Free parking', 'Wifi', '1+ bathrooms', 'Air conditioning', 'TV', 'Allows pets', 'Kitchen']
  },
  {
    gallery: photos[3],
    title: 'Apartment in Sandown',
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
  onClearFilters
}: {
  selectedFilters: FilterName[];
  onToggleFilter: (filter: FilterName) => void;
  onClearFilters: () => void;
}) {
  const { theme } = useTheme();
  const { user, status, logout } = useAuth();
  const navigate = useNavigate();
  const [firebaseProfile, setFirebaseProfile] = useState<Record<string, unknown> | null>(null);
  const [failedPhotoURL, setFailedPhotoURL] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuId = useId();
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const activeFilterCount = selectedFilters.length;
  const firebaseProfileName =
    typeof firebaseProfile?.name === 'string' ? firebaseProfile.name.trim() : '';
  const firebasePhotoURL =
    typeof firebaseProfile?.photoURL === 'string' && firebaseProfile.photoURL.trim()
      ? firebaseProfile.photoURL.trim()
      : undefined;
  const profileName = firebaseProfileName || user?.name?.trim() || 'Booksa';
  const photoURL = firebasePhotoURL || user?.avatarUrl?.trim() || undefined;
  const profileAvatarUrl = photoURL === failedPhotoURL ? undefined : photoURL;
  const profileInitials = createAvatarFallback(profileName) || 'B';

  useEffect(() => {
    let isActive = true;

    if (status !== 'authenticated' || !user?.id) {
      setFirebaseProfile(null);
      setFailedPhotoURL(null);
      return () => {
        isActive = false;
      };
    }

    setFirebaseProfile(null);
    setFailedPhotoURL(null);
    getUserProfileById(user.id)
      .then((profile) => {
        if (isActive) setFirebaseProfile(profile);
      })
      .catch((error) => {
        console.error('Unable to retrieve the connected user profile.', error);
      });

    return () => {
      isActive = false;
    };
  }, [status, user?.id]);

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
      <div className="mx-auto flex h-[98px] max-w-[1376px] items-center justify-between gap-6 px-4">
        <BooksaLogo className="h-9 w-[103px] shrink-0" />

        <button
          type="button"
          aria-label="Change search"
          className="hidden h-[46px] min-w-0 items-center rounded-full border pl-4 pr-1.5 shadow-[0_3px_12px_rgba(15,23,42,0.13)] transition hover:shadow-[0_5px_16px_rgba(15,23,42,0.16)] md:flex"
          style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}
        >
          <span className="mr-3 text-xl" aria-hidden="true">🏡</span>
          <span className="whitespace-nowrap text-[13px] font-semibold">Homes in Sandton</span>
          <span className="mx-4 h-7 w-px" style={{ backgroundColor: theme.colors.border }} />
          <span className="whitespace-nowrap text-[12px] font-medium">Any weekend</span>
          <span className="mx-4 h-7 w-px" style={{ backgroundColor: theme.colors.border }} />
          <span className="whitespace-nowrap text-[12px] font-medium">Add guests</span>
          <span
            className="ml-3 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white"
            style={{ backgroundColor: theme.colors.primary[500] }}
          >
            <SearchRegular className="h-4 w-4" />
          </span>
        </button>

        <div className="flex shrink-0 items-center gap-5">
          <button type="button" className="hidden text-[12px] font-semibold sm:block">Switch to hosting</button>
          
          <button
            type="button"
            aria-label={`Profile for ${profileName}`}
            onClick={() => navigate(ROUTES.hostProfile)}
            className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full text-sm font-semibold"
            style={{ backgroundColor: `${theme.colors.primary[500]}18`, color: theme.colors.primary[500] }}
          >
            {profileAvatarUrl ? (
              <ShimmerImage
                src={profileAvatarUrl}
                alt=""
                aria-hidden="true"
                referrerPolicy="no-referrer"
                className="block h-full w-full object-cover"
                onError={() => setFailedPhotoURL(profileAvatarUrl)}
              />
            ) : (
              profileInitials
            )}
          </button>
          
          
          
          <div ref={menuRef} className="relative">
            <button
              ref={menuButtonRef}
              type="button"
              aria-label={isMenuOpen ? 'Close account menu' : 'Open account menu'}
              aria-controls={menuId}
              aria-expanded={isMenuOpen}
              aria-haspopup="menu"
              onClick={() => setIsMenuOpen((open) => !open)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:opacity-80"
              style={{ backgroundColor: theme.colors.surfaceMuted }}
            >
              <FiMenu className="h-[18px] w-[18px]" aria-hidden="true" />
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
                  className="absolute right-0 top-full z-50 mt-4 w-[266px] overflow-hidden rounded-[14px] border py-2.5 text-left shadow-[0_16px_42px_rgba(15,23,42,0.18)]"
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
                    <button key={label} type="button" role="menuitem" onClick={action} className="flex w-full items-center gap-3 px-5 py-2.5 text-[12px] font-medium transition hover:bg-[var(--color-surface-muted)]">
                      <Icon className="h-[17px] w-[17px] shrink-0" aria-hidden="true" />
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
                    <button key={label} type="button" role="menuitem" onClick={action} className="flex w-full items-center gap-3 px-5 py-2.5 text-[12px] transition hover:bg-[var(--color-surface-muted)]">
                      <Icon className="h-[17px] w-[17px] shrink-0" aria-hidden="true" />
                      {label}
                    </button>
                  ))}

                  <div className="mx-5 my-2 h-px" style={{ backgroundColor: theme.colors.border }} />

                  <button type="button" role="menuitem" onClick={() => navigateFromMenu(ROUTES.hostListings)} className="flex w-full items-center justify-between gap-3 px-5 py-2 text-left transition hover:bg-[var(--color-surface-muted)]">
                    <span className="min-w-0">
                      <span className="block text-[12px] font-semibold">Become a host</span>
                      <span className="mt-0.5 block text-[10px] leading-4" style={{ color: theme.colors.textSecondary }}>
                        It&apos;s easy to start hosting and earn extra income.
                      </span>
                    </span>
                    <span className="shrink-0 text-[28px]" aria-hidden="true">🧑‍💼</span>
                  </button>

                  <div className="mx-5 my-2 h-px" style={{ backgroundColor: theme.colors.border }} />

                  {['Refer a Host', 'Find a co-host', 'Gift cards'].map((label) => (
                    <button key={label} type="button" role="menuitem" onClick={closeMenu} className="block w-full px-5 py-2.5 text-left text-[12px] transition hover:bg-[var(--color-surface-muted)]">
                      {label}
                    </button>
                  ))}

                  <div className="mx-5 my-2 h-px" style={{ backgroundColor: theme.colors.border }} />

                  <button
                    type="button"
                    role="menuitem"
                    disabled={isLoggingOut}
                    onClick={() => {
                      if (status === 'authenticated') {
                        void handleLogout();
                      } else {
                        navigateFromMenu(ROUTES.login);
                      }
                    }}
                    className="block w-full px-5 py-2.5 text-left text-[12px] transition hover:bg-[var(--color-surface-muted)] disabled:cursor-wait disabled:opacity-50"
                  >
                    {isLoggingOut ? 'Logging out…' : status === 'authenticated' ? 'Log out' : 'Log in or sign up'}
                  </button>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="mx-auto h-[53px] max-w-[1376px] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="mx-auto flex h-full w-max min-w-full items-center justify-center gap-2 px-4">
          <button
            type="button"
            aria-label={activeFilterCount ? `Clear ${activeFilterCount} selected filters` : 'Filters'}
            onClick={activeFilterCount ? onClearFilters : undefined}
            className="inline-flex h-[34px] shrink-0 items-center gap-2 rounded-full border px-3 text-[11px] font-medium transition"
            style={{
              borderColor: activeFilterCount ? theme.colors.primary[500] : theme.colors.border,
              backgroundColor: activeFilterCount ? `${theme.colors.primary[500]}12` : theme.colors.surface,
              color: activeFilterCount ? theme.colors.primary[500] : theme.colors.textPrimary
            }}
          >
            <FilterRegular className="h-4 w-4" /> Filters
            {activeFilterCount ? (
              <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-primary-500)] px-1 text-[9px] font-bold text-white">
                {activeFilterCount}
              </span>
            ) : null}
          </button>
          <span className="mx-1 h-6 w-px shrink-0" style={{ backgroundColor: theme.colors.border }} />
          {filters.map((filter) => {
            const isSelected = selectedFilters.includes(filter);
            return (
              <button
                key={filter}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onToggleFilter(filter)}
                className="h-[34px] shrink-0 whitespace-nowrap rounded-full border px-3.5 text-[10.5px] font-medium transition hover:-translate-y-px"
                style={{
                  borderColor: isSelected ? theme.colors.primary[500] : theme.colors.border,
                  backgroundColor: isSelected ? theme.colors.primary[500] : theme.colors.surface,
                  color: isSelected ? '#ffffff' : theme.colors.textPrimary,
                  boxShadow: isSelected ? `0 3px 10px ${theme.colors.primary[500]}28` : 'none'
                }}
              >
                {isSelected ? '✓ ' : ''}{filter}
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
  onClearFilters
}: {
  selectedFilters: FilterName[];
  onToggleFilter: (filter: FilterName) => void;
  onClearFilters: () => void;
}) {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const activeFilterCount = selectedFilters.length;

  return (
    <header
      className="relative z-30 border-b sm:hidden"
      style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}
    >
      <div className="grid h-[72px] grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-2 px-3">
        <button
          type="button"
          aria-label="Go back"
          onClick={() => navigate(-1)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full transition active:scale-95"
        >
          <ChevronLeftRegular className="h-5 w-5" />
        </button>

        <button
          type="button"
          aria-label="Change search"
          className="mx-auto flex h-[52px] w-full max-w-[250px] min-w-0 flex-col items-center justify-center rounded-full border px-4 text-center shadow-[0_5px_16px_rgba(15,23,42,0.10)]"
          style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}
        >
          <span className="w-full truncate text-[13px] font-semibold leading-5">Homes in Sandton</span>
          <span className="w-full truncate text-[10px] leading-4" style={{ color: theme.colors.textSecondary }}>
            Any weekend · Add guests
          </span>
        </button>

        <button
          type="button"
          aria-label={activeFilterCount ? `Clear ${activeFilterCount} selected filters` : 'Filters'}
          onClick={activeFilterCount ? onClearFilters : undefined}
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-full transition active:scale-95"
          style={{ color: activeFilterCount ? theme.colors.primary[500] : theme.colors.textPrimary }}
        >
          <FilterRegular className="h-5 w-5" />
          {activeFilterCount ? (
            <span className="absolute right-0.5 top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-primary-500)] px-1 text-[8px] font-bold text-white">
              {activeFilterCount}
            </span>
          ) : null}
        </button>
      </div>

      <div className="overflow-x-auto px-3 pb-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max gap-2">
          {filters.map((filter) => {
            const isSelected = selectedFilters.includes(filter);
            return (
              <button
                key={filter}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onToggleFilter(filter)}
                className="h-[34px] shrink-0 whitespace-nowrap rounded-full border px-3.5 text-[10.5px] font-medium transition active:scale-95"
                style={{
                  borderColor: isSelected ? theme.colors.primary[500] : theme.colors.border,
                  backgroundColor: isSelected ? theme.colors.primary[500] : theme.colors.surface,
                  color: isSelected ? '#ffffff' : theme.colors.textPrimary
                }}
              >
                {isSelected ? '✓ ' : ''}{filter}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}

function StayCard({ stay }: { stay: Stay }) {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const galleryRef = useRef<HTMLDivElement>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [saved, setSaved] = useState(false);

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

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openListing();
    }
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
    <article className="group min-w-0 cursor-pointer" onClick={openListing} onKeyDown={handleKeyDown} role="button" tabIndex={0}>
      <div className="relative aspect-[1.325] overflow-hidden rounded-[16px]" style={{ backgroundColor: theme.colors.surfaceMuted }}>
        <div ref={galleryRef} className="flex h-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {stay.gallery.map((image, index) => (
            <ShimmerImage
              key={`${stay.title}-${index}`}
              src={image}
              alt={`${stay.title}, photo ${index + 1}`}
              className="h-full w-full shrink-0 snap-start object-cover transition duration-500 group-hover:scale-[1.015]"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          ))}
        </div>

        {stay.badge ? (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-neutral-900 shadow-sm">
            {stay.badge}
          </span>
        ) : null}

        <button
          type="button"
          aria-label={saved ? `Remove ${stay.title} from saved` : `Save ${stay.title}`}
          onClick={(event) => {
            event.stopPropagation();
            setSaved((value) => !value);
          }}
          className="absolute right-3 top-3 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.65)]"
        >
          {saved ? <HeartFilled className="h-6 w-6 text-rose-500" /> : <HeartRegular className="h-6 w-6" />}
        </button>

        <button
          type="button"
          aria-label="Previous photo"
          onClick={(event) => { event.stopPropagation(); scrollGallery(-1); }}
          className="absolute left-2 top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-900 shadow group-hover:flex"
        >
          <ChevronLeftRegular className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Next photo"
          onClick={(event) => { event.stopPropagation(); scrollGallery(1); }}
          className="absolute right-2 top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-900 shadow group-hover:flex"
        >
          <ChevronRightRegular className="h-4 w-4" />
        </button>

        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {stay.gallery.map((_, index) => (
            <span key={index} className={`h-1.5 w-1.5 rounded-full ${index === activeImage ? 'bg-white' : 'bg-white/55'}`} />
          ))}
        </div>
      </div>

      <div className="px-1 pt-3 text-[12px] leading-[1.45]">
        <div className="flex items-start justify-between gap-2">
          <h2 className="truncate font-semibold">{stay.title}</h2>
          <span className="flex shrink-0 items-center gap-1">
            <StarFilled className="h-3 w-3" /> {stay.rating}
          </span>
        </div>
        <p style={{ color: theme.colors.textSecondary }}>{stay.area}</p>
        <p style={{ color: theme.colors.textSecondary }}>{stay.details}</p>
        <p style={{ color: theme.colors.textSecondary }}>{stay.dates}</p>
        <p className="mt-1.5"><span className="font-semibold underline underline-offset-2">{formatTwoNightPriceInCdf(stay.price)}</span> <span style={{ color: theme.colors.textSecondary }}>for {stay.nights} nights</span></p>
        <span className="mt-1 inline-flex rounded bg-neutral-100 px-1.5 py-0.5 text-[9px] font-medium text-neutral-600">Free cancellation</span>
      </div>
    </article>
  );
}

function createMapMarkers(values: SeeAllMapValue[]): BooksaMapMarker[] {
  return values.map((value) => ({
    id: value.id,
    label: formatTwoNightPriceInCdf(value.priceUsd),
    ariaLabel: `${value.listingTitle}, ${formatTwoNightPriceInCdf(value.priceUsd)} for ${DEFAULT_STAY_NIGHTS} nights`,
    latitude: value.latitude,
    longitude: value.longitude
  }));
}

function MapPanel({ values = DEFAULT_MAP_VALUES }: { values?: SeeAllMapValue[] }) {
  const markers = createMapMarkers(values);

  return (
    <aside className="relative mb-6 mt-10 hidden min-h-0 overflow-hidden rounded-[18px] bg-[#e9e7e2] lg:block">
      <BooksaMap
        title={`Map of stays in ${DEFAULT_MAP_VIEW.label}`}
        center={DEFAULT_MAP_VIEW.center}
        initialZoom={DEFAULT_MAP_VIEW.zoom}
        minZoom={DEFAULT_MAP_VIEW.minZoom}
        maxZoom={DEFAULT_MAP_VIEW.maxZoom}
        initialBounds={DEFAULT_MAP_VIEW.bounds}
        markers={markers}
        className="h-full w-full"
        renderMarker={(marker) => (
          <button type="button" aria-label={marker.ariaLabel} title={marker.ariaLabel} className="rounded-full border border-neutral-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-neutral-900 shadow-[0_2px_7px_rgba(0,0,0,0.24)] transition hover:scale-105">
            {marker.label}
          </button>
        )}
      >
        <button type="button" className="absolute bottom-[30%] right-[19%] z-20 flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-[11px] font-semibold text-neutral-800 shadow-md">
          <LocationFilled className="h-3.5 w-3.5" /> Kinshasa
        </button>
        <button type="button" aria-label="Use my location" className="absolute bottom-4 right-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-neutral-900 shadow-md">
          <NavigationRegular className="h-4 w-4" />
        </button>
      </BooksaMap>
    </aside>
  );
}

function MobileMapPanel({ values = DEFAULT_MAP_VALUES }: { values?: SeeAllMapValue[] }) {
  const compactCdf = new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1
  });
  const markers: BooksaMapMarker[] = values.slice(0, 5).map((value) => ({
    id: value.id,
    label: `CDF ${compactCdf.format(usdToCdf(value.priceUsd))}`,
    ariaLabel: `${value.listingTitle}, ${formatTwoNightPriceInCdf(value.priceUsd)} for ${DEFAULT_STAY_NIGHTS} nights`,
    latitude: value.latitude,
    longitude: value.longitude
  }));

  return (
    <div className="absolute inset-x-0 top-0 z-0 h-[clamp(160px,28dvh,224px)]">
      <BooksaMap
        title={`Map of stays in ${DEFAULT_MAP_VIEW.label}`}
        center={DEFAULT_MAP_VIEW.center}
        initialZoom={DEFAULT_MAP_VIEW.zoom}
        minZoom={DEFAULT_MAP_VIEW.minZoom}
        maxZoom={DEFAULT_MAP_VIEW.maxZoom}
        initialBounds={DEFAULT_MAP_VIEW.bounds}
        markers={markers}
        interactive={false}
        showControls={false}
        className="h-full w-full"
        renderMarker={(marker) => (
          <span
            aria-label={marker.ariaLabel}
            title={marker.ariaLabel}
            className="block whitespace-nowrap rounded-full border border-neutral-200 bg-white px-2.5 py-1.5 text-[10px] font-bold text-neutral-900 shadow-[0_2px_7px_rgba(0,0,0,0.22)]"
          >
            {marker.label}
          </span>
        )}
      >
        <span className="absolute left-1/2 top-[53%] z-20 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full bg-white px-2.5 py-1.5 text-[10px] font-semibold text-neutral-800 shadow-md">
          <LocationFilled className="h-3 w-3" /> Kinshasa
        </span>
      </BooksaMap>
    </div>
  );
}

export default function SeeAllPage() {
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
  const estimatedResultCount = selectedFilters.length
    ? Math.round((filteredStays.length / stays.length) * 1_000)
    : 1_000;
  const resultsTitle = selectedFilters.length === 0
    ? 'Over 1,000 homes in Sandton'
    : estimatedResultCount === 0
      ? 'No homes in Sandton'
      : `${estimatedResultCount.toLocaleString('en-US')} homes in Sandton`;

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
    <div className="h-[100dvh] overflow-hidden sm:h-screen sm:min-h-[640px]" style={{ backgroundColor: theme.colors.background, color: theme.colors.textPrimary }}>
      <SeeAllHeader
        selectedFilters={selectedFilters}
        onToggleFilter={toggleFilter}
        onClearFilters={() => setSelectedFilters([])}
      />

      <SeeAllMobileHeader
        selectedFilters={selectedFilters}
        onToggleFilter={toggleFilter}
        onClearFilters={() => setSelectedFilters([])}
      />

      <main className="relative isolate h-[calc(100dvh-117px)] overflow-hidden sm:hidden">
        <MobileMapPanel values={filteredMapValues} />

        <div
          ref={mobileScrollRef}
          className="absolute inset-0 z-10 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="h-[clamp(160px,28dvh,224px)] pointer-events-none" aria-hidden="true" />

          <section
            className="min-h-full rounded-t-[28px] px-4 pb-[calc(90px+env(safe-area-inset-bottom))] pt-4 shadow-[0_-6px_22px_rgba(15,23,42,0.12)]"
            style={{ backgroundColor: theme.colors.surface }}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full" style={{ backgroundColor: theme.colors.border }} />
            <h1 className="sr-only" aria-live="polite">{resultsTitle}</h1>
            <div className="mb-5 flex items-center justify-center gap-2 text-[11px] font-semibold">
              <span className="text-[21px]" aria-hidden="true">🏷️</span>
              Prices include all fees
            </div>

            {filteredStays.length ? (
              <div className="grid grid-cols-1 gap-y-8">
                {filteredStays.map((stay, index) => <StayCard key={`mobile-${stay.title}-${index}`} stay={stay} />)}
              </div>
            ) : (
              <div className="flex min-h-[260px] flex-col items-center justify-center px-5 text-center">
                <span className="text-4xl" aria-hidden="true">🏠</span>
                <h2 className="mt-4 text-base font-semibold">No homes match every selected filter</h2>
                <p className="mt-2 text-xs" style={{ color: theme.colors.textSecondary }}>
                  Try removing one or more filters to see additional stays.
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedFilters([])}
                  className="mt-5 rounded-full px-5 py-2.5 text-xs font-semibold text-white"
                  style={{ backgroundColor: theme.colors.primary[500] }}
                >
                  Clear all filters
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      <MarketplaceMobileNav />

      <main className="mx-auto hidden h-[calc(100vh-151px)] max-w-[1376px] px-4 sm:block">
        <div className="grid h-full gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(440px,1.03fr)] xl:grid-cols-[638px_minmax(0,1fr)] xl:gap-12">
          <section ref={resultsRef} className="min-h-0 overflow-y-auto pb-10 pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex h-[88px] items-center justify-between gap-4">
              <h1 aria-live="polite" className="text-[18px] font-semibold tracking-[-0.025em]">{resultsTitle}</h1>
              <span className="flex shrink-0 items-center gap-2 text-[12px] font-medium">
                <span className="text-[22px]" aria-hidden="true">🏷️</span> Prices include all fees
              </span>
            </div>

            {filteredStays.length ? (
              <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2">
                {filteredStays.map((stay, index) => <StayCard key={`${stay.title}-${index}`} stay={stay} />)}
              </div>
            ) : (
              <div className="flex min-h-[340px] flex-col items-center justify-center px-6 text-center">
                <span className="text-4xl" aria-hidden="true">🏠</span>
                <h2 className="mt-4 text-base font-semibold">No homes match every selected filter</h2>
                <p className="mt-2 max-w-sm text-xs" style={{ color: theme.colors.textSecondary }}>
                  Try removing one or more filters to see additional stays.
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedFilters([])}
                  className="mt-5 rounded-full px-5 py-2.5 text-xs font-semibold text-white"
                  style={{ backgroundColor: theme.colors.primary[500] }}
                >
                  Clear all filters
                </button>
              </div>
            )}
          </section>

          <MapPanel values={filteredMapValues} />
        </div>
      </main>
    </div>
  );
}
