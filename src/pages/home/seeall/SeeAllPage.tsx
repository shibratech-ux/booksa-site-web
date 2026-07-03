import {
  AddRegular,
  ChevronLeftRegular,
  ChevronRightRegular,
  HeartRegular,
  LocationRegular,
  MaximizeRegular,
  SettingsRegular,
  StarFilled,
  SubtractRegular
} from '@fluentui/react-icons';
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { generatePath, useLocation, useNavigate } from 'react-router-dom';
import BooksaHeader from '@/components/layout/BooksaHeader';
import { HOME_SECTION_TITLES } from '@/pages/home/homeSectionTitles';
import type { Listing } from '@/pages/home/listing.types';
import { useTheme } from '@/theme/useTheme';
import { ROUTES } from '@/utils/constants';
import {
  persistListingContext,
  readPersistedSeeAllSectionTitle
} from '@/utils/navigationPersistence';

type Stay = {
  badge?: string;
  gallery: string[];
  location: string;
  meta: string;
  dates: string;
  price: number;
  nights: number;
  rating: string;
  url: string;
};

const filterChips = [
  'Filtres',
  'Hôtel',
  'Arrivée autonome',
  '1+ salles de bain',
  'Réservation instantanée',
  'Climatisation',
  'Wifi',
  'TV',
  'Animaux acceptés'
];

function createStayUrl(location: string, price: number) {
  return generatePath(ROUTES.listingDetail, {
    listingId: encodeURIComponent(`${location}-${price}`)
  });
}

const baseStays: Stay[] = [
  {
    badge: 'Hôtel vedette',
    gallery: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1501117716987-c8e1ecb210f7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80'
    ],
    location: 'Hotel Monterosa - Astotel',
    meta: 'Hôtel dans le 9e arrondissement',
    dates: 'juin 19-21',
    price: 398,
    nights: 2,
    rating: '4.79 (1530)',
    url: createStayUrl('Hotel Monterosa - Astotel', 398)
  },
  {
    badge: 'Hôtel vedette',
    gallery: [
      'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80'
    ],
    location: 'Hotel Lorette - Astotel',
    meta: 'Hôtel dans le 9e arrondissement',
    dates: 'juin 20-22',
    price: 298,
    nights: 2,
    rating: '4.78 (980)',
    url: createStayUrl('Hotel Lorette - Astotel', 298)
  },
  {
    gallery: [
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1501117716987-c8e1ecb210f7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80'
    ],
    location: 'Le 123 Elysees - Astotel',
    meta: 'Hôtel dans le 8e arrondissement',
    dates: 'juin 21-23',
    price: 352,
    nights: 2,
    rating: '4.86 (621)',
    url: createStayUrl('Le 123 Elysees - Astotel', 352)
  },
  {
    gallery: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'
    ],
    location: 'Hotel Bastille Opera',
    meta: 'Hôtel dans le 11e arrondissement',
    dates: 'juin 22-24',
    price: 264,
    nights: 2,
    rating: '4.72 (413)',
    url: createStayUrl('Hotel Bastille Opera', 264)
  },
  {
    badge: 'Hôtel vedette',
    gallery: [
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1501117716987-c8e1ecb210f7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80'
    ],
    location: 'Hotel du Louvre Kinshasa',
    meta: 'Hôtel dans le 1er arrondissement',
    dates: 'juin 23-25',
    price: 481,
    nights: 2,
    rating: '4.91 (1180)',
    url: createStayUrl('Hotel du Louvre Kinshasa', 481)
  },
  {
    gallery: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80'
    ],
    location: 'Hotel Marais Collection',
    meta: 'Hôtel dans le 3e arrondissement',
    dates: 'juin 24-26',
    price: 419,
    nights: 2,
    rating: '4.84 (702)',
    url: createStayUrl('Hotel Marais Collection', 419)
  }
];

const stays: Stay[] = [
  ...baseStays,
  ...Array.from({ length: 160 }, (_, index) => {
    const template = baseStays[index % baseStays.length];
    const dateStart = 25 + index;
    return {
      ...template,
      badge: index % 4 === 0 ? 'Hôtel vedette' : undefined,
      location: `${template.location} ${index + 1}`,
      dates: `juin ${dateStart}-${dateStart + 2}`,
      url: createStayUrl(`${template.location} ${index + 1}`, template.price)
    };
  })
];

const USD_TO_CDF_RATE = 2250;

function formatMapMarkerPriceInCdf(usdAmount: number) {
  return `CDF ${new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0
  }).format(usdAmount * USD_TO_CDF_RATE)}`;
}

function formatStayPriceInCdf(usdAmount: number) {
  return `CDF ${new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0
  }).format(usdAmount * USD_TO_CDF_RATE)}`;
}

function PageStructureShimmer() {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.colors.background, color: theme.colors.textPrimary }}>
      <BooksaHeader />
      <FilterBar />

      <main className="mx-auto max-w-[1500px] px-4 py-0 lg:h-[calc(100vh-168px)] lg:px-6 lg:overflow-hidden">
        <div className="grid gap-8 lg:h-full lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.95fr)]">
          <section className="space-y-6 lg:min-h-0 lg:overflow-y-auto lg:pr-2 scrollbar-visible">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="h-5 w-56 rounded-full shimmer-surface" />
              <div className="h-10 w-52 rounded-full shimmer-surface" />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <article key={`stay-skeleton-${index}`} className="group overflow-hidden">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] shimmer-surface">
                    <div className="absolute left-3 top-3 h-6 w-24 rounded-full shimmer-surface opacity-90" />
                    <div className="absolute right-3 top-3 h-8 w-8 rounded-full shimmer-surface opacity-90" />
                    <div className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full shimmer-surface opacity-90" />
                    <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full shimmer-surface opacity-90" />
                      <span className="h-1.5 w-1.5 rounded-full shimmer-surface opacity-70" />
                      <span className="h-1.5 w-1.5 rounded-full shimmer-surface opacity-70" />
                    </div>
                  </div>

                  <div className="space-y-2 px-1 pt-3">
                    <div className="h-4 w-4/5 rounded-full shimmer-surface" />
                    <div className="h-3.5 w-2/3 rounded-full shimmer-surface opacity-80" />
                    <div className="h-3.5 w-1/3 rounded-full shimmer-surface opacity-70" />
                    <div className="flex items-center justify-between pt-2">
                      <div className="h-4 w-36 rounded-full shimmer-surface opacity-80" />
                      <div className="h-4 w-16 rounded-full shimmer-surface opacity-80" />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <aside
            className="relative my-10 min-h-[250px] overflow-hidden rounded-[32px] border shadow-[0_18px_45px_rgba(15,23,42,0.08)] lg:h-full"
            style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}
          >
            <div className="absolute inset-0 shimmer-surface" />
            <div className="absolute left-4 top-4 h-10 w-24 rounded-full shimmer-surface opacity-90" />
            <div className="absolute right-4 top-4 flex flex-col gap-2">
              <div className="h-11 w-11 rounded-full shimmer-surface opacity-90" />
              <div className="h-11 w-11 rounded-full shimmer-surface opacity-90" />
              <div className="h-11 w-11 rounded-full shimmer-surface opacity-90" />
            </div>
            <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-center">
              <div className="h-10 w-32 rounded-full shimmer-surface opacity-90" />
            </div>
            <div className="absolute bottom-4 left-4 h-8 w-40 rounded-full shimmer-surface opacity-90" />
          </aside>
        </div>
      </main>
    </div>
  );
}

const mapMarkers = [
  { usd: 350, top: '18%', left: '58%' },
  { usd: 385, top: '35%', left: '32%' },
  { usd: 398, top: '40%', left: '48%' },
  { usd: 378, top: '39%', left: '64%' },
  { usd: 481, top: '73%', left: '34%' },
  { usd: 419, top: '86%', left: '30%' },
  { usd: 437, top: '83%', left: '60%' },
  { usd: 284, top: '96%', left: '14%' }
];

const mapPanelSizing = {
  height: '60vh',
  surfacePillHeight: 44,
  controlSize: 48,
  centerPillHeight: 46,
  markerPillHeight: 36,
  footerPillHeight: 34
} as const;

function FilterBar() {
  const { theme } = useTheme();
  return (
    <div className="border-b" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
      <div className="mx-auto flex w-full max-w-[1500px] justify-start gap-3 overflow-x-auto px-4 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:justify-center lg:px-6">
        {filterChips.map((chip, index) => (
          <button
            key={chip}
            type="button"
            className={`whitespace-nowrap rounded-full border px-4 py-2 text-[12px] font-medium transition ${
              index === 0
                ? 'shadow-sm'
                : 'hover:opacity-95'
            }`}
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: index === 0 ? theme.colors.textPrimary : theme.colors.border,
              color: index === 0 ? theme.colors.textPrimary : theme.colors.textSecondary
            }}
          >
            {index === 0 ? (
              <span className="inline-flex items-center gap-2">
                <SettingsRegular className="h-4 w-4" />
                {chip}
                <span
                  className="inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-semibold text-white"
                  style={{ backgroundColor: theme.colors.textPrimary }}
                >
                  1
                </span>
              </span>
            ) : (
              chip
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function StayCard({ stay }: { stay: Stay }) {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const galleryRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const listing: Listing = {
    badge: stay.badge,
    gallery: stay.gallery,
    image: stay.gallery[0],
    location: stay.location,
    price: formatStayPriceInCdf(stay.price),
    rating: stay.rating,
    title: stay.meta
  };

  const openListingDetail = () => {
    persistListingContext(listing);
    navigate(stay.url, { state: { listing } });
  };

  useEffect(() => {
    const gallery = galleryRef.current;
    if (!gallery) return;

    const updateActiveIndex = () => {
      const slideWidth = gallery.clientWidth || 1;
      const nextIndex = Math.round(gallery.scrollLeft / slideWidth);
      setActiveIndex(Math.min(stay.gallery.length - 1, Math.max(0, nextIndex)));
    };

    updateActiveIndex();
    gallery.addEventListener('scroll', updateActiveIndex, { passive: true });

    return () => {
      gallery.removeEventListener('scroll', updateActiveIndex);
    };
  }, [stay.gallery.length]);

  const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openListingDetail();
    }
  };

  const scrollGallery = (direction: -1 | 1) => {
    const gallery = galleryRef.current;
    if (!gallery) return;

    const nextIndex = Math.min(
      stay.gallery.length - 1,
      Math.max(0, activeIndex + direction)
    );

    gallery.scrollTo({
      left: nextIndex * gallery.clientWidth,
      behavior: 'smooth'
    });
  };

  return (
    <article
      className="group cursor-pointer overflow-hidden"
      onClick={openListingDetail}
      onKeyDown={handleCardKeyDown}
      role="button"
      tabIndex={0}
    >
      <div
        className="relative aspect-[4/3] overflow-hidden"
        style={{ backgroundColor: 'transparent' }}
      >
        <div
          ref={galleryRef}
          className="flex h-full w-full snap-x snap-mandatory overflow-x-auto rounded-[24px] scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {stay.gallery.map((image, index) => (
            <img
              key={`${stay.location}-${image}`}
            alt={`Image ${index + 1} de ${stay.location}`}
              className="h-full w-full flex-none snap-start object-cover transition duration-500 group-hover:scale-[1.03]"
              loading={index === 0 ? 'eager' : 'lazy'}
              src={image}
            />
          ))}
        </div>

        <div className="absolute left-3 top-3 flex items-center gap-2">
          {stay.badge ? (
            <span
              className="inline-flex rounded-full px-3 py-1.5 text-xs font-semibold shadow-md"
              style={{ backgroundColor: theme.colors.surface, color: theme.colors.textPrimary }}
            >
              {stay.badge}
            </span>
          ) : null}
        </div>

        <button
          type="button"
          aria-label={`Enregistrer ${stay.location}`}
          onClick={(event) => event.stopPropagation()}
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm transition hover:bg-black/35"
        >
          <HeartRegular className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          aria-label={`Photo précédente pour ${stay.location}`}
          onClick={(event) => {
            event.stopPropagation();
            scrollGallery(-1);
          }}
          className="absolute left-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-gray-900 opacity-0 shadow-md backdrop-blur-sm transition hover:bg-white group-hover:opacity-100"
        >
          <ChevronLeftRegular className="h-4 w-4" />
        </button>

        <button
          type="button"
          aria-label={`Photo suivante pour ${stay.location}`}
          onClick={(event) => {
            event.stopPropagation();
            scrollGallery(1);
          }}
          className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-gray-900 opacity-0 shadow-md backdrop-blur-sm transition hover:bg-white group-hover:opacity-100"
        >
          <ChevronRightRegular className="h-4 w-4" />
        </button>

        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
          {stay.gallery.map((_, index) => (
            <span
              key={`${stay.location}-dot-${index}`}
              className={`h-1.5 w-1.5 rounded-full transition ${
                index === activeIndex ? 'bg-white/95' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="space-y-1.5 px-1 pt-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[15px] font-medium leading-5" style={{ color: theme.colors.textPrimary }}>
              {stay.location}
            </h3>
            <p className="mt-1 text-[13px] leading-5" style={{ color: theme.colors.textSecondary }}>
              {stay.meta}
            </p>
            <p className="mt-0.5 text-[12px] font-medium leading-5" style={{ color: theme.colors.textSecondary }}>
              {stay.dates}
            </p>
          </div>
          <div className="flex items-center gap-1 text-[13px] font-medium" style={{ color: theme.colors.textPrimary }}>
            <StarFilled className="h-4 w-4 text-amber-400" />
            {stay.rating}
          </div>
        </div>

        <p className="text-[13px] leading-5" style={{ color: theme.colors.textPrimary }}>
          <span className="font-semibold underline decoration-[1.5px] underline-offset-2">{formatStayPriceInCdf(stay.price)}</span>
          <span className="text-gray-700"> pour {stay.nights} nuits</span>
        </p>
      </div>
    </article>
  );
}

function MapPanel() {
  const { theme } = useTheme();
  return (
    <aside
      className="relative my-10 overflow-hidden rounded-[32px] border shadow-[0_18px_45px_rgba(15,23,42,0.08)]"
      style={{
        backgroundColor: theme.colors.card,
        borderColor: theme.colors.border,
        height: mapPanelSizing.height,
        minHeight: mapPanelSizing.height
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(120deg, ${theme.colors.gradient.topLeft}, ${theme.colors.gradient.topRight}), radial-gradient(circle_at_30%_30%, ${theme.colors.surface}, transparent 28%), radial-gradient(circle_at_70%_20%, ${theme.colors.surface}, transparent 20%), radial-gradient(circle_at_60%_78%, ${theme.colors.surface}, transparent 24%)`
        }}
      />
      <div className="absolute inset-0 opacity-[0.55]">
        <div className="absolute left-[-10%] top-[18%] h-px w-[120%] rotate-[-12deg]" style={{ backgroundColor: theme.colors.border }} />
        <div className="absolute left-[-8%] top-[38%] h-px w-[124%] rotate-[-6deg]" style={{ backgroundColor: theme.colors.border }} />
        <div className="absolute left-[-5%] top-[55%] h-px w-[120%] rotate-[8deg]" style={{ backgroundColor: theme.colors.border }} />
        <div className="absolute left-[-8%] top-[78%] h-px w-[126%] rotate-[11deg]" style={{ backgroundColor: theme.colors.border }} />
        <div className="absolute left-[12%] top-0 h-full w-px" style={{ backgroundColor: theme.colors.border }} />
        <div className="absolute left-[34%] top-0 h-full w-px" style={{ backgroundColor: theme.colors.border }} />
        <div className="absolute left-[55%] top-0 h-full w-px" style={{ backgroundColor: theme.colors.border }} />
        <div className="absolute left-[78%] top-0 h-full w-px" style={{ backgroundColor: theme.colors.border }} />
      </div>

      <div
        className="absolute left-4 top-4 z-10 rounded-full px-4 text-sm font-medium shadow-md"
        style={{
          backgroundColor: theme.colors.surface,
          color: theme.colors.textPrimary,
          height: `${mapPanelSizing.surfacePillHeight}px`,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        Vue carte
      </div>

      <div className="absolute right-4 top-4 z-10 flex flex-col gap-2">
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full shadow-md transition hover:-translate-y-0.5"
          style={{
            backgroundColor: theme.colors.surface,
            color: theme.colors.textPrimary,
            width: `${mapPanelSizing.controlSize}px`,
            height: `${mapPanelSizing.controlSize}px`
          }}
        >
          <MaximizeRegular className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full shadow-md transition hover:-translate-y-0.5"
          style={{
            backgroundColor: theme.colors.surface,
            color: theme.colors.textPrimary,
            width: `${mapPanelSizing.controlSize}px`,
            height: `${mapPanelSizing.controlSize}px`
          }}
        >
          <AddRegular className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full shadow-md transition hover:-translate-y-0.5"
          style={{
            backgroundColor: theme.colors.surface,
            color: theme.colors.textPrimary,
            width: `${mapPanelSizing.controlSize}px`,
            height: `${mapPanelSizing.controlSize}px`
          }}
        >
          <SubtractRegular className="h-4 w-4" />
        </button>
      </div>

      <div className="absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 justify-center">
        <div
          className="rounded-full border px-4 text-sm font-semibold shadow-lg"
          style={{
            backgroundColor: theme.colors.surface,
            color: theme.colors.textPrimary,
            borderColor: theme.colors.border,
            height: `${mapPanelSizing.centerPillHeight}px`,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <span className="inline-flex items-center gap-2">
            <LocationRegular className="h-4 w-4" style={{ color: theme.colors.primary[500] }} />
            Kinshasa
          </span>
        </div>
      </div>

      {mapMarkers.map((marker) => (
        <div
          key={`${marker.usd}-${marker.top}-${marker.left}`}
          className="absolute z-10"
          style={{ left: marker.left, top: marker.top }}
        >
        <div
          className="rounded-full border px-3 py-1.5 text-sm font-semibold shadow-lg"
          style={{
            backgroundColor: theme.colors.surface,
            color: theme.colors.textPrimary,
            borderColor: theme.colors.border,
            minHeight: `${mapPanelSizing.markerPillHeight}px`,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <span className="inline-flex items-center gap-1.5">
            <span className="text-base" style={{ color: theme.colors.primary[500] }}>⌂</span>
            {formatMapMarkerPriceInCdf(marker.usd)}
            </span>
          </div>
        </div>
      ))}

      <div
        className="absolute bottom-4 left-4 z-10 rounded-full px-4 text-xs font-medium shadow-md"
        style={{
          backgroundColor: theme.colors.surface,
          color: theme.colors.textSecondary,
          height: `${mapPanelSizing.footerPillHeight}px`,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        Aperçu style Google Maps
      </div>
    </aside>
  );
}

export default function SeeAllPage() {
  const location = useLocation();
  const { theme } = useTheme();
  const [isReady, setIsReady] = useState(false);
  const sectionTitle =
    (location.state as { sectionTitle?: string } | null)?.sectionTitle ??
    readPersistedSeeAllSectionTitle() ??
    HOME_SECTION_TITLES.greatDealsHotels;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setIsReady(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  if (!isReady) {
    return <PageStructureShimmer />;
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: theme.colors.background, color: theme.colors.textPrimary }}
    >
      <BooksaHeader />
      <FilterBar />


      <main className="mx-auto max-w-[1500px] px-4 py-0 lg:h-[calc(100vh-168px)] lg:px-6 lg:overflow-hidden">
        <div className="grid gap-8 lg:h-full lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.95fr)]">
          <section
            className="space-y-6 lg:min-h-0 lg:overflow-y-auto lg:pr-2 scrollbar-visible"
            style={
              {
                '--scrollbar-thumb': 'transparent',
                '--scrollbar-thumb-hover': 'transparent',
                '--scrollbar-track': 'transparent'
              } as CSSProperties
            }
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h1 className="text-sm font-semibold tracking-tight sm:text-[1.23rem]">
                {sectionTitle}
              </h1>

              <div
                className="inline-flex my-6 items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold ring-1"
                // style={{
                //   backgroundColor: `${theme.colors.success}12`,
                //   color: theme.colors.success,
                //   borderColor: `${theme.colors.success}33`
                // }}
              >
                <span
                  className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] text-white"
                  style={{ backgroundColor: theme.colors.success }}
                >
                  %
                </span>
                Obtenez 15 % de crédit Booksa
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {stays.map((stay) => (
                <StayCard key={stay.location} stay={stay} />
              ))}
            </div>
          </section>
          
          <MapPanel />
        </div>
      </main>
    </div>
  );
}
