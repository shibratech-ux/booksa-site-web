import {
  ArrowLeftRegular,
  CalendarRegular,
  VehicleCarRegular,
  CheckmarkCircleRegular,
  ChevronDownRegular,
  ChevronLeftRegular,
  ChevronRightRegular,
  ChevronUpRegular,
  DismissRegular,
  FoodRegular,
  HeartRegular,
  KeyRegular,
  SearchRegular,
  ShieldCheckmarkRegular,
  ShieldRegular,
  ShareRegular,
  SparkleRegular,
  StarFilled,
  TreeEvergreenRegular,
  TvRegular,
  WaterRegular,
  WasherRegular,
  Wifi1Regular,
  ChatRegular,
  BuildingRegular
} from '@fluentui/react-icons';

import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import dayjs, { type Dayjs } from 'dayjs';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { useTranslation } from 'react-i18next';
import BooksaHeader from '@/components/layout/BooksaHeader';
import { ShimmerImage } from '@/components/ui/ShimmerImage';
import Footer from '@/components/layout/Footer';
import { ChooseRoomButton } from '@/components/ui/ChooseRoomButton';
import type { FluentIcon } from '@fluentui/react-icons';
import type { Listing } from './listing.types';
import { ROUTES } from '@/utils/constants';
import {
  persistConfirmPayContext,
  persistPhotoTourContext,
  readPersistedListingContext
} from '@/utils/navigationPersistence';

type ListingDetailState = {
  listing?: Listing;
};

function buildFallbackListing(listingId?: string): Listing | null {
  if (!listingId) {
    return null;
  }

  const decodedListingId = decodeURIComponent(listingId);
  const match = decodedListingId.match(/^(.*?)-(?:CDF\s*)?([\d,]+)$/);

  if (!match) {
    return null;
  }

  const locationLabel = match[1].trim();
  const priceLabel = `CDF ${match[2]}`;

  return {
    image: fallbackGallery[0],
    gallery: fallbackGallery,
    location: locationLabel,
    price: priceLabel,
    rating: '4.8',
    title: locationLabel
  };
}

const fallbackGallery = [
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1600&q=80'
];

const amenityIcons = [
  { label: 'Wifi', icon: Wifi1Regular },
  { label: 'TV', icon: TvRegular },
  { label: 'Climatisation', icon: BuildingRegular },
  { label: 'Cuisine', icon: FoodRegular },
  { label: 'Parking gratuit', icon: VehicleCarRegular },
  { label: 'Lave-linge', icon: WasherRegular }
];

const thingsToKnow = [
  {
    title: 'Conditions de réservation',
    icon: CheckmarkCircleRegular,
    description: ['Réservation à partir de 18 ans.', 'Pièce d’identité avec photo et carte bancaire requises.', 'Chambres 100 % non-fumeurs.']
  },
  {
    title: 'Règles du logement',
    icon: SearchRegular,
    description: ['Arrivée après 15 h 00', 'Départ avant 11 h 00', 'Animaux non admis']
  },
  {
    title: 'Sécurité et logement',
    icon: ShieldRegular,
    description: ['Choisissez une chambre pour voir les détails de sécurité', 'Détecteur de fumée installé', 'Accès sécurisé']
  }
];

const reviews = [
  {
    name: 'Angie',
    meta: 'Séjour de quelques nuits',
    location: 'Kinshasa, France',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    text:
      'Propre, calme et très bien situé. La chambre était lumineuse et confortable, et l’arrivée s’est faite simplement.'
  },
  {
    name: 'Theresa',
    meta: 'Séjour de quelques nuits',
    location: 'Brussels, Belgium',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
    text:
      'Le séjour était soigné et agréable. L’hôte répondait rapidement, et le logement correspondait bien aux photos.'
  },
  {
    name: 'Maria J',
    meta: 'Séjour d’une nuit',
    location: 'Mexico City, Mexico',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    text:
      'Un lieu confortable à l’ambiance agréable. Très pratique pour découvrir la ville et se déplacer.'
  },
  {
    name: 'Amine',
    meta: 'Séjour de quelques nuits',
    location: 'Casablanca, Morocco',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    text:
      'Service chaleureux, nuits calmes et espace propice à la détente après une longue journée.'
  }
];

type ReviewItem = (typeof reviews)[number];

const reviewTags = [
  { label: 'Décoration', count: 3 },
  { label: 'Propreté', count: 6 },
  { label: 'Hospitalité', count: 7 },
  { label: 'Rapport qualité-prix', count: 4 },
  { label: 'Wifi', count: 2 }
];

function formatPriceLabel(price: string) {
  return price.startsWith('CDF') ? price : `CDF ${price}`;
}

function parsePriceValue(price: string) {
  const numericValue = Number.parseInt(price.replace(/[^\d]/g, ''), 10);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function formatCurrencyValue(value: number) {
  return formatCurrency(Math.round(value), 'CDF');
}

function getReservationPrice(basePrice: string, nights: number) {
  const baseAmount = parsePriceValue(basePrice);
  const normalizedNights = Math.max(1, nights);

  if (!baseAmount) {
    return formatPriceLabel(basePrice);
  }

  const nightlyRate = baseAmount / 2;
  return formatCurrencyValue(nightlyRate * normalizedNights);
}

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-slate-200 bg-white px-4 py-3">
      <p className="text-[10.86624px] font-semibold uppercase tracking-[0.12em] text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="space-y-1">
      <h2 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-[21.73248px]">{title}</h2>
      {subtitle ? <p className="text-sm leading-6 text-gray-600">{subtitle}</p> : null}
    </div>
  );
}

function MobileGalleryHero({
  images,
  listing,
  onOpenTour,
  onBack
}: {
  images: string[];
  listing: Listing;
  onBack: () => void;
  onOpenTour: () => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="-mx-4 -my-5 md:hidden sm:-mx-6 sm:-my-8">
      <div className="relative overflow-hidden">
        <div
          className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onScroll={(event) => {
            const container = event.currentTarget;
            const nextIndex = Math.round(container.scrollLeft / container.clientWidth);
            setActiveIndex(Math.min(images.length - 1, Math.max(0, nextIndex)));
          }}
        >
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={onOpenTour}
              className="relative block w-full shrink-0 snap-center"
              aria-label={`Ouvrir la photo ${index + 1}`}
            >
              <ShimmerImage
                src={image}
                alt={`${listing.location} - photo ${index + 1}`}
                className="h-[387.2px] w-full object-cover"
              />
            </button>
          ))}
        </div>

        <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-white/90 text-gray-900 shadow-[var(--shadow-sm)] backdrop-blur"
            aria-label="Retour"
          >
            <ArrowLeftRegular className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-white/90 text-gray-900 shadow-[var(--shadow-sm)] backdrop-blur"
              aria-label="Partager"
            >
              <ShareRegular className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-white/90 text-gray-900 shadow-[var(--shadow-sm)] backdrop-blur"
              aria-label="Enregistrer"
            >
              <HeartRegular className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="absolute bottom-4 right-4 rounded-sm bg-black/70 px-3 py-1.5 text-xs font-medium text-white">
          {activeIndex + 1} / {images.length}
        </div>
      </div>

      <div className="-mt-5 rounded-sm bg-white px-5 pt-10 text-center shadow-[0_-4px_16px_rgba(15,23,42,0.06)]">
        <h1 className="text-[21.73248px] font-medium tracking-tight text-gray-900">
          {listing.title ?? 'Hôtel à Goma, RD.congo'}
        </h1>
        <p className="mt-2 text-[12.84192px] leading-5 text-gray-500">{listing.location}</p>
        <p className="mt-1 text-[12.84192px] leading-5 text-gray-500">
          2 voyageurs · 1 chambre · 1 lit · 1 salle de bain
        </p>
      </div>
    </div>
  );
}

function MobileBookingBar({
  listingPrice,
  nights = 2,
  dateRange = '24 juil. – 26 juil.',
  onReserve
}: {
  listingPrice: string;
  nights?: number;
  dateRange?: string;
  onReserve?: () => void;
}) {
  const { t } = useTranslation('booking');
  const reservationPrice = getReservationPrice(listingPrice, nights);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--color-border)] lg:hidden">
      <div className="mx-auto max-w-lg">
        <div className="flex items-center justify-between border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-4 shadow-[0_-12px_32px_rgba(15,23,42,0.12)]">
          <div>
            <div className="text-sm font-bold leading-none text-[var(--color-text-primary)]">{reservationPrice}</div>
            <div className="mt-1.5 text-xs font-normal text-[var(--color-text-secondary)]">
              {t('forNights', { count: nights })} · {dateRange}
            </div>
          </div>

          <button
            type="button"
            onClick={onReserve}
            className="min-h-12 min-w-[140.8px] rounded-md bg-[var(--color-primary-500)] px-6 py-3 text-base font-semibold text-white transition-all duration-200 hover:bg-[var(--color-primary-600)] active:scale-95"
          >
            {t('reserve')}
          </button>
        </div>
      </div>
    </div>
  );
}

type GuestCounts = {
  adults: number;
  children: number;
  infants: number;
  pets: number;
};

type CalendarRange = {
  start: Dayjs | null;
  end: Dayjs | null;
};

type AmenityGroup = {
  title: string;
  items: Array<{
    label: string;
    icon: FluentIcon;
  }>;
};

type HostHighlight = {
  description: string;
  icon: FluentIcon;
  title: string;
};

const guestRows: Array<{
  key: keyof GuestCounts;
  title: string;
  subtitle: string;
  max: number;
  note?: string;
}> = [
  { key: 'adults', title: 'Adultes', subtitle: '13 ans et plus', max: 12 },
  { key: 'children', title: 'Enfants', subtitle: 'De 2 à 12 ans', max: 12 },
  { key: 'infants', title: 'Bébés', subtitle: 'Moins de 2 ans', max: 5 },
  {
    key: 'pets',
    title: 'Animaux',
    subtitle: 'Vous venez avec un animal d’assistance ?',
    max: 5,
    note: 'Ce logement accueille au maximum 12 voyageurs, bébés non compris. Les animaux ne sont pas admis.'
  }
];

const amenityGroups: AmenityGroup[] = [
  {
    title: 'Vues panoramiques',
    items: [
      { label: 'Vue sur le jardin', icon: TreeEvergreenRegular }
    ]
  },
  {
    title: 'Salle de bain',
    items: [
      { label: 'Produits de nettoyage', icon: SparkleRegular },
      { label: 'Savon pour le corps', icon: WaterRegular },
      { label: 'Eau chaude', icon: WaterRegular }
    ]
  },
  {
    title: 'Chambre et linge',
    items: [
      { label: 'Lave-linge', icon: WasherRegular }
    ]
  }
];

const hostHighlights: HostHighlight[] = [
  {
    icon: WaterRegular,
    title: 'Plongez directement',
    description: 'C’est l’un des rares lieux du secteur avec piscine.'
  },
  {
    icon: KeyRegular,
    title: 'Arrivée simple et fluide',
    description: 'Les voyageurs récents ont adoré le démarrage fluide de ce séjour.'
  },
  {
    icon: ChatRegular,
    title: 'Communication exceptionnelle de l’hôte',
    description: 'Les voyageurs récents ont attribué 5 étoiles à Pamela pour sa communication.'
  }
];

const calendarWeekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const initialCalendarMonth = dayjs('2026-06-01');
const todayStart = dayjs().startOf('day');
const initialCalendarRange: CalendarRange = {
  start: dayjs('2026-06-19'),
  end: dayjs('2026-06-21')
};

function AmenityIcon({ icon: Icon }: { icon: FluentIcon }) {
  return <Icon className="h-5 w-5 shrink-0 text-gray-700" strokeWidth={1.8} />;
}

function buildMonthCells(month: Dayjs) {
  const startOfMonth = month.startOf('month');
  const leadingDays = startOfMonth.day();
  const daysInMonth = month.daysInMonth();
  const totalCells = Math.ceil((leadingDays + daysInMonth) / 7) * 7;

  return Array.from({ length: totalCells }, (_, index) => {
    const dayNumber = index - leadingDays + 1;
    if (dayNumber < 1 || dayNumber > daysInMonth) {
      return null;
    }

    return startOfMonth.date(dayNumber);
  });
}

function isSameDay(dateA: Dayjs | null, dateB: Dayjs | null) {
  return Boolean(dateA && dateB && dateA.isSame(dateB, 'day'));
}

function isInRange(date: Dayjs, start: Dayjs | null, end: Dayjs | null) {
  if (!start || !end) return false;
  return date.isAfter(start, 'day') && date.isBefore(end, 'day');
}

function isPastDate(date: Dayjs) {
  return date.isBefore(todayStart, 'day');
}

function DateRangePicker({
  range,
  onRangeChange
}: {
  range: CalendarRange;
  onRangeChange: Dispatch<SetStateAction<CalendarRange>>;
}) {
  const { t } = useTranslation('booking');
  const [leftMonth, setLeftMonth] = useState(initialCalendarMonth);

  const rightMonth = leftMonth.add(1, 'month');
  const nights = range.start && range.end ? Math.max(1, range.end.diff(range.start, 'day')) : 0;

  const months = [leftMonth, rightMonth];
  const headingText = range.start && range.end
    ? t('nightsInCity', { count: nights, city: 'Le Cap' })
    : t('selectDates');

  const handleDaySelect = (date: Dayjs) => {
    if (isPastDate(date)) {
      return;
    }

    onRangeChange((current) => {
      if (!current.start || (current.start && current.end)) {
        return { start: date, end: null };
      }

      if (date.isBefore(current.start, 'day')) {
        return { start: date, end: current.start };
      }

      return { start: current.start, end: date };
    });
  };

  return (
    <section 
    className="border-t border-slate-200 pt-10 lg:pt-20">
      <div className="overflow-hidden px-0 py-0">
        <div className="px-0 sm:px-0">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-[17.78112px] font-medium tracking-[-0.03em] text-gray-900 sm:text-[17.78112px]">
                {headingText}
              </h3>
              <p className="mt-1 text-[12.84192px] text-gray-500 sm:text-[11.85408px]">
                {range.start && range.end
                  ? `${range.start.format('MMM D, YYYY')} - ${range.end.format('MMM D, YYYY')}`
                : 'Sélectionnez vos dates'}
              </p>
            </div>
          </div>

          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              aria-label="Mois précédent"
              onClick={() => setLeftMonth((current) => current.subtract(1, 'month'))}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-gray-400 transition hover:bg-slate-100 hover:text-gray-900"
            >
              <ChevronLeftRegular className="h-5 w-5" />
            </button>

            <div className="grid flex-1 grid-cols-1 px-4 sm:px-8 lg:grid-cols-2">
              {months.map((month, index) => (
                <h4
                  key={`${month.format('YYYY-MM')}-label`}
                  className={`text-center text-[12.84192px] font-semibold tracking-tight text-gray-900 sm:text-[13.82976px] ${index === 1 ? 'hidden lg:block' : ''}`}
                >
                  {month.format('MMMM YYYY')}
                </h4>
              ))}
            </div>

            <button
              type="button"
              aria-label="Mois suivant"
              onClick={() => setLeftMonth((current) => current.add(1, 'month'))}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-gray-400 transition hover:bg-slate-100 hover:text-gray-900"
            >
              <ChevronRightRegular className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
            {months.map((month, index) => {
              const cells = buildMonthCells(month);

              return (
                <div key={month.format('YYYY-MM')} className={`space-y-5 ${index === 1 ? 'hidden lg:block' : ''}`}>
                  <div className="grid grid-cols-7 gap-y-1 text-center">
                    {calendarWeekdays.map((weekday) => (
                      <div key={`${month.format('YYYY-MM')}-${weekday}`} className="pb-3 text-[9.8784px] font-medium text-gray-500">
                        {weekday}
                      </div>
                    ))}

                    {cells.map((date, index) => {
                      if (!date) {
                        return <div key={`empty-${month.format('YYYY-MM')}-${index}`} className="h-12" />;
                      }

                      const isStart = isSameDay(date, range.start);
                      const isEnd = isSameDay(date, range.end);
                      const inRange = isInRange(date, range.start, range.end);
                      const isSelected = isStart || isEnd;
                      const isLeading = range.start && date.isBefore(range.start, 'day');
                      const disabled = isPastDate(date);

                      return (
                        <button
                          key={date.format('YYYY-MM-DD')}
                          type="button"
                          disabled={disabled}
                          onClick={() => handleDaySelect(date)}
                          className={[
                            'relative flex h-10 w-10 items-center justify-center text-[10.86624px] font-medium transition',
                            isSelected
                              ? 'z-10 text-white'
                              : inRange
                                ? 'text-gray-900'
                                : isLeading
                                  ? 'text-gray-300'
                                  : disabled
                                    ? 'cursor-not-allowed text-gray-300'
                                    : 'text-gray-900 hover:bg-slate-100'
                          ].join(' ')}
                          aria-label={date.format('MMMM D, YYYY')}
                        >
                          {inRange ? (
                            <span className="absolute inset-y-1 left-0 right-0 bg-slate-100" />
                          ) : null}
                          {isStart || isEnd ? (
                            <span className="absolute inset-0 rounded-sm bg-gray-900" />
                          ) : null}
                          <span className="relative z-10">{date.date()}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-7 flex items-center justify-between">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-gray-700 transition hover:bg-slate-100"
              aria-label="Ouvrir les raccourcis clavier"
            >
              <CalendarRegular className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => onRangeChange({ start: null, end: null })}
              className="text-[12.84192px] font-medium text-gray-900 underline underline-offset-4 transition hover:text-gray-600"
            >
              Effacer les dates
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function GuestCounter({
  title,
  subtitle,
  value,
  max,
  note,
  onDecrease,
  onIncrease
}: {
  title: string;
  subtitle: string;
  value: number;
  max: number;
  note?: string;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  const disabledDecrease = value <= 0;
  const disabledIncrease = value >= max;

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 pr-2">
        <p className="text-[12.84192px] font-medium text-gray-900">{title}</p>
        <p className={`text-[10.86624px] leading-5 ${note ? 'underline underline-offset-2' : 'text-gray-600'}`}>
          {subtitle}
        </p>
        {note ? <p className="mt-1 text-[7.90272px] leading-5 text-gray-600">{note}</p> : null}
      </div>

      <div className="flex items-center gap-4 pt-1">
        <button
          type="button"
          aria-label={`Diminuer ${title}`}
          disabled={disabledDecrease}
          onClick={onDecrease}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-slate-100 text-gray-500 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="text-xl leading-none">−</span>
        </button>
        <span className="min-w-4 text-center text-[12.84192px] font-medium text-gray-900">{value}</span>
        <button
          type="button"
          aria-label={`Augmenter ${title}`}
          disabled={disabledIncrease}
          onClick={onIncrease}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-slate-100 text-gray-500 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="text-xl leading-none">+</span>
        </button>
      </div>
    </div>
  );
}

function GuestPickerDialog({
  open,
  counts,
  onClose,
  onChange
}: {
  open: boolean;
  counts: GuestCounts;
  onClose: () => void;
  onChange: (key: keyof GuestCounts, delta: number) => void;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (open) {
      window.addEventListener('keydown', onKeyDown);
      return () => window.removeEventListener('keydown', onKeyDown);
    }

    return undefined;
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="absolute left-1/2 top-full z-40 mt-2 w-[min(100vw-2rem,360px)] -translate-x-1/2">
      <div className="rounded-lg border border-slate-200 bg-white shadow-[var(--shadow-lg)]">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <div>
            <p className="text-[10.86624px] font-semibold uppercase tracking-[0.12em] text-gray-500">Voyageurs</p>
            <p className="mt-1 text-sm font-medium text-gray-900">
              {Object.values(counts).reduce((sum, value) => sum + value, 0) || 1} voyageur
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-500 transition hover:bg-slate-100 hover:text-gray-900"
            aria-label="Fermer le sélecteur de voyageurs"
          >
          <ChevronUpRegular className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          {guestRows.map(({ key, title, subtitle, max, note }) => (
            <GuestCounter
              key={key}
              title={title}
              subtitle={subtitle}
              value={counts[key]}
              max={max}
              note={note}
              onDecrease={() => onChange(key, -1)}
              onIncrease={() => onChange(key, 1)}
            />
          ))}
        </div>

        <div className="flex justify-end px-5 pb-4">
          <button
            type="button"
            onClick={onClose}
            className="text-base font-medium text-gray-900 transition hover:text-gray-700"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

function AmenitiesDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (!open) {
      return undefined;
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 py-6 backdrop-blur-[2px]">
      <button
        type="button"
        aria-label="Fermer la fenêtre des équipements"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />

      <div className="modal-animation relative z-10 w-full max-w-[836px] overflow-hidden rounded-lg bg-white shadow-[var(--shadow-xl)]" role="dialog" aria-modal="true">
        <div className="flex items-start justify-between px-6 pb-2 pt-5 sm:px-8 sm:pt-6">
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la fenêtre des équipements"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-gray-900 transition hover:bg-slate-100"
          >
            <DismissRegular className="h-5 w-5" />
          </button>
          <div className="w-10" />
        </div>

        <div className="max-h-[74vh] overflow-y-auto px-6 pb-8 pt-4 sm:px-8">
          <h2 className="text-[20.74464px] font-medium tracking-[-0.03em] text-gray-900">
            Ce que propose ce logement
          </h2>

          <div className="mt-8 space-y-9">
            {amenityGroups.map((group, groupIndex) => (
              <section key={group.title} className="space-y-4">
                <h3 className="text-[17.78112px] font-semibold tracking-tight text-gray-900">{group.title}</h3>

                <div className="bg-white">
                  {group.items.map((item, itemIndex) => {
                    const isLast = itemIndex === group.items.length - 1;
                    return (
                      <div
                        key={item.label}
                        className={`flex items-center gap-4 py-4 ${!isLast ? 'border-b border-slate-200' : ''}`}
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center">
                          <AmenityIcon icon={item.icon} />
                        </div>
                        <p className="text-[15.80544px] font-medium text-gray-800">{item.label}</p>
                      </div>
                    );
                  })}
                </div>

                {groupIndex === amenityGroups.length - 1 ? null : <div className="h-px bg-transparent" />}
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function GuestReviewsDialog({
  open,
  onClose,
  reviewItems
}: {
  open: boolean;
  onClose: () => void;
  reviewItems: ReviewItem[];
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (!open) {
      return undefined;
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/45 px-4 py-6 backdrop-blur-[2px]">
      <button
        type="button"
        aria-label="Fermer la fenêtre des avis"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />

      <div className="relative z-10 mt-2 flex h-[min(88vh,820px)] w-full max-w-[902px] flex-col overflow-hidden rounded-lg bg-white shadow-[var(--shadow-xl)]" role="dialog" aria-modal="true">
        <div className="flex items-start justify-between px-6 pb-2 pt-6 sm:px-8">
          <div className="space-y-2">
            <h2 className="text-[20.74464px] font-medium tracking-[-0.04em] text-gray-900">113 avis de voyageurs</h2>
            <button type="button" className="text-sm text-gray-500 underline underline-offset-4 hover:text-gray-700">
              Comment fonctionnent les avis
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la fenêtre des avis"
            className="inline-flex cursor-pointer h-10 w-10 items-center justify-center rounded-md text-gray-900 transition hover:bg-slate-100"
          >
            <DismissRegular className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 pt-6 sm:px-8">
          <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {reviewTags.map((tag) => (
              <button
                key={tag.label}
                type="button"
                className="inline-flex shrink-0 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-[0_8px_18px_rgba(15,23,42,0.04)] transition hover:bg-slate-50"
              >
                <span>{tag.label}</span>
                <span className="text-gray-500">{tag.count}</span>
              </button>
            ))}
            <button
              type="button"
              className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-gray-700 shadow-[0_8px_18px_rgba(15,23,42,0.04)] transition hover:bg-slate-50"
              aria-label="Afficher plus de tags d’avis"
            >
              <ChevronRightRegular className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* <div className="mt-5 border-t border-slate-200 px-6 py-5 sm:px-8">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              className="inline-flex h-14 w-14 items-center justify-center rounded-sm border border-slate-200 bg-white text-gray-700 transition hover:bg-slate-50"
              aria-label="Rechercher dans les avis"
            >
              <SearchRegular className="h-2.5 w-2.5" />
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-sm border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-slate-50"
            >
              <span>Les plus pertinents</span>
              <ChevronDownRegular className="h-4 w-4" />
            </button>
          </div>
        </div> */}

        <div className="flex-1 overflow-y-auto px-6 pb-8 sm:px-8">
          <div className="space-y-8">
            {reviewItems.map((review, index) => (
              <article key={`${review.name}-${review.location}-${index}`} className="border-b border-slate-200 pb-8 last:border-b-0">
                <div className="flex items-start gap-4">
                  <ShimmerImage
                    alt={review.name}
                    className="h-12 w-12 rounded-sm object-cover ring-1 ring-slate-200"
                    src={review.avatarUrl}
                  />
                  <div className="min-w-0">
                    <h3 className="text-[16.79328px] font-semibold text-gray-900">{review.name}</h3>
                    <p className="text-sm text-gray-500">{review.location}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm text-gray-700">
                  <div className="flex items-center gap-0.5 text-gray-900">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <StarFilled key={starIndex} className="h-3.5 w-3.5 text-gray-900" />
                    ))}
                  </div>
                  <span>·</span>
                  <span>{review.meta}</span>
                </div>

                <p className="mt-4 max-w-3xl text-[14.8176px] leading-7 text-gray-700">{review.text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}



function BookingCard({
  listing,
  price,
  nights,
  range
}: {
  listing: Listing;
  price: string;
  nights: number;
  range: CalendarRange;
}) {
  const { t, i18n } = useTranslation('booking');
  const [guestPickerOpen, setGuestPickerOpen] = useState(false);
  const [guestCounts, setGuestCounts] = useState<GuestCounts>({
    adults: 1,
    children: 0,
    infants: 0,
    pets: 0
  });

  const guestTotal = guestCounts.adults + guestCounts.children;
  const checkInLabel = range.start
    ? formatDate(range.start.toDate(), i18n.resolvedLanguage)
    : t('selectDates');
  const checkOutLabel = range.end
    ? formatDate(range.end.toDate(), i18n.resolvedLanguage)
    : t('selectDates');
  const navigate = useNavigate();

  const updateGuestCount = (key: keyof GuestCounts, delta: number) => {
    setGuestCounts((current) => ({
      ...current,
      [key]: Math.max(0, current[key] + delta)
    }));
  };

  return (
    <div className="relative mt-10 rounded-sm border border-slate-200 bg-white p-5 sm:p-6">
      <div className="mt-4">
        <p className="text-[17.78112px] font-semibold tracking-tight text-gray-900">
          <span>{getReservationPrice(price, nights)}</span>
          <span className="px-2 text-sm font-normal text-gray-600">{t('forNights', { count: nights })}</span>
        </p>
      </div>

      <div className="mt-4 overflow-hidden rounded-sm border border-slate-300">
        <div className="grid grid-cols-2 divide-x divide-slate-300 border-b border-slate-300">
          <div className="px-4 py-3">
            <p className="text-[9.8784px] font-semibold uppercase tracking-[0.12em] text-gray-500">{t('checkIn')}</p>
            <p className="mt-1 text-xs font-medium text-gray-900">{checkInLabel}</p>
          </div>
          <div className="px-4 py-3">
            <p className="text-[10.86624px] font-semibold uppercase tracking-[0.12em] text-gray-500">{t('checkOut')}</p>
            <p className="mt-1 text-xs font-medium text-gray-900">{checkOutLabel}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setGuestPickerOpen((current) => !current)}
          className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-slate-50"
        >
          <div>
            <p className="text-[9.8784px] font-semibold uppercase tracking-[0.12em] text-gray-500">{t('guests')}</p>
            <p className="mt-1 text-xs font-medium text-gray-900">
              {t('guests', { count: guestTotal })}
            </p>
          </div>
          <ChevronUpRegular className={`h-4 w-4 text-gray-500 transition ${guestPickerOpen ? '' : 'rotate-180'}`} />
        </button>
      </div>

      <div className="relative h-0">
        <GuestPickerDialog
          open={guestPickerOpen}
          counts={guestCounts}
          onClose={() => setGuestPickerOpen(false)}
          onChange={updateGuestCount}
        />
      </div>

      <div className="mt-3 rounded-sm bg-slate-100 px-4 py-2 text-center text-[11.85408px] font-medium text-gray-700">
        Annulation gratuite
      </div>

      <ChooseRoomButton
        onClick={() => {
          const nextBookingState = {
            listing,
            nights,
            range: {
              start: range.start?.toISOString() ?? null,
              end: range.end?.toISOString() ?? null
            },
            guestCounts,
            total: getReservationPrice(price, nights)
          };

          persistConfirmPayContext(nextBookingState);
          navigate(ROUTES.confirmPay, {
            state: nextBookingState
          });
        }}
      >
        <span className="text-sm font-normal">Réserver</span>
      </ChooseRoomButton>

      <p className="mt-3 text-center text-xs text-gray-500">Vous ne serez pas encore débité</p>
    </div>
  );
}

function RoomCard({ listing, nights }: { listing: Listing; nights: number }) {
  const { t } = useTranslation('booking');
  const roomImage = listing.gallery?.[0] ?? listing.image;

  return (
    <div className="flex flex-col overflow-hidden rounded-sm border border-slate-200 bg-white md:flex-row">
      <div className="md:w-[264px]">
        <ShimmerImage alt={listing.location} className="h-full w-full object-cover md:min-h-[187px]" src={roomImage} />
      </div>
      <div className="flex flex-1 flex-col justify-center gap-1 p-5">
        <h3 className="text-lg font-semibold tracking-tight text-gray-900">Chambre simple</h3>
        <p className="text-sm text-gray-500">1 lit simple - 107 pi²</p>
        <p className="text-sm font-semibold text-gray-900">
          <span className="underline">{getReservationPrice(listing.price, nights)}</span>{' '}
          <span className="font-normal text-gray-600">{t('forNights', { count: nights })}</span>
        </p>
      </div>
    </div>
  );
}

function HostHighlightsCard({ hostName = 'Pamela' }: { hostName?: string }) {
  return (
    <section className="pt-8">
      <div className="py-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-rose-100 text-base font-medium text-rose-700">
            {hostName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-[15.80544px] font-medium tracking-tight text-gray-900">Hébergé par {hostName}</h3>
            <p className="mt-1 text-xs text-gray-500">2 ans d’hébergement</p>
          </div>
        </div>

        <div className="my-6 h-px bg-slate-200" />

        <div className="space-y-6">
          {hostHighlights.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center text-gray-900">
                <Icon className="h-5 w-5" strokeWidth={1.8} />
              </div>
              <div className="min-w-0">
                <h4 className="text-[13.82976px] font-medium tracking-tight text-gray-900">{title}</h4>
                <p className="mt-1 text-[13.82976px] font-normal leading-4 text-gray-500">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function ListingDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { listingId } = useParams<{ listingId: string }>();
  const state = location.state as ListingDetailState | null;
  const listing = state?.listing ?? readPersistedListingContext<Listing>() ?? buildFallbackListing(listingId);
  const [amenitiesOpen, setAmenitiesOpen] = useState(false);
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const [range, setRange] = useState<CalendarRange>(initialCalendarRange);

  if (!listing) {
    return <Navigate to={ROUTES.home} replace />;
  }

  const gallery = listing.gallery?.length ? listing.gallery : [listing.image, ...fallbackGallery.slice(1)];
  const heroImage = gallery[0] ?? listing.image;
  const secondaryImages = gallery.slice(1, 5);
  const nights = range.start && range.end ? Math.max(1, range.end.diff(range.start, 'day')) : 2;
  const mobileDateRange = range.start && range.end ? `${range.start.format('D MMM')} – ${range.end.format('D MMM')}` : '24 juil. – 26 juil.';
  const bookingState = {
    listing,
    nights,
    range: {
      start: range.start?.toISOString() ?? null,
      end: range.end?.toISOString() ?? null
    },
    guestCounts: { adults: 1, children: 0, infants: 0, pets: 0 },
    total: getReservationPrice(listing.price, nights)
  };

  const handleMobileReserve = () => {
    persistConfirmPayContext(bookingState);
    navigate(ROUTES.confirmPay, {
      state: bookingState
    });
  };

  return (
    <div className="min-h-screen bg-[var(--color-project-shell)] text-gray-900">
      <div className="hidden min-[612px]:block">
        <BooksaHeader />
      </div>

      <main className="mx-auto max-w-[1650px] px-0 py-5 sm:px-6 sm:py-8 lg:px-44">

        <div id="photos" className="space-y-5">
          <div className="hidden items-start justify-between gap-4 lg:flex">
            <div>
              <h1 className="text-[21.73248px] font-medium tracking-tight text-gray-900 sm:text-[23.70816px]">
                {listing.location}
              </h1>

            </div>
          </div>

          <MobileGalleryHero
            images={gallery}
            listing={listing}
            onBack={() => navigate(-1)}
            onOpenTour={() => {
              persistPhotoTourContext({ listing });
              navigate(ROUTES.photoTour, { state: { listing } });
            }}
          />

          <div className="hidden gap-1.5 overflow-hidden rounded-sm md:grid">
            <div className="grid gap-1.5 lg:grid-cols-[2fr_1fr_1fr]">
              <button
              onClick={() => {
                persistPhotoTourContext({ listing });
                navigate(ROUTES.photoTour, { state: { listing } });
              }}
              type="button" className="group cursor-pointer relative overflow-hidden">
                <ShimmerImage alt={listing.location} className="h-full min-h-[429px] w-full object-cover transition duration-500 group-hover:scale-[1.03]" src={heroImage} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/12 via-transparent to-transparent" />
              </button>

              <div className="grid gap-1.5">
                {secondaryImages.slice(0, 2).map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => {
                      persistPhotoTourContext({ listing });
                      navigate(ROUTES.photoTour, { state: { listing } });
                    }}
                    className="group relative cursor-pointer overflow-hidden"
                  >
                    <ShimmerImage
                      alt={`Vue ${index + 2} de ${listing.location}`}
                      className="h-full min-h-[206.8px] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                      src={image}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/12 via-transparent to-transparent" />
                  </button>
                ))}
              </div>

              <div className="grid gap-1.5">
                {secondaryImages.slice(2, 4).map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => {
                      persistPhotoTourContext({ listing });
                      navigate(ROUTES.photoTour, { state: { listing } });
                    }}
                    className="group relative cursor-pointer overflow-hidden"
                  >
                    <ShimmerImage
                      alt={`Vue ${index + 4} de ${listing.location}`}
                      className="h-full min-h-[206.8px] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                      src={image}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/12 via-transparent to-transparent" />
                    {index === 1 ? (
                      <span className="absolute bottom-4 right-4 rounded-sm bg-white px-4 py-2 text-xs font-semibold text-gray-900 shadow-[var(--shadow-sm)] transition group-hover:-translate-y-0.5 group-hover:shadow-[var(--shadow-md)]">
                        Voir toutes les photos
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="space-y-8">
            <div className="hidden gap-6 md:grid xl:grid-cols-[minmax(0,1fr)_105px]">
              <div className="w-full space-y-5">
                <SectionHeading
                  title={listing.title ?? 'Hôtel à Goma, RD.congo'}
                />

                <p className="max-w-3xl text-sm sm:text-[15.80544px] font-normal leading-6 text-gray-600">
                  Un séjour lumineux et raffiné, avec des finitions soignées, une arrivée simple et le calme
                  nécessaire pour une courte escapade ou un séjour plus long. L’ensemble est présenté dans un style
                  clair et apaisant pour que le prix, la note et les détails pratiques se lisent d’un coup d’œil.
                </p>
              </div>

            </div>

            <HostHighlightsCard hostName={listing.host ?? 'Pamela'} />

            <section id="rooms" className="space-y-4 border-t border-slate-200 pt-8">
              <SectionHeading title="Choisissez votre chambre" subtitle="Choisissez la chambre qui correspond le mieux à votre voyage et à votre budget." />
              <RoomCard listing={listing} nights={nights} />
              <button
                type="button"
                className="w-full rounded-md bg-slate-100 px-5 py-4 text-sm font-semibold text-gray-800 transition hover:bg-slate-200"
              >
                Voir les 2 chambres
              </button>
            </section>

            

            <section id="amenities" className="space-y-5 border-t border-slate-200 pt-8">
              <SectionHeading title="Ce que propose ce logement" />
              <div className="grid gap-4 sm:grid-cols-2">
                {amenityIcons.map(({ label, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-3 rounded-sm px-4 py-4">
                    <Icon className="h-5 w-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                  </div>
                ))}
              </div>
              <button
                  type="button"
                  onClick={() => setAmenitiesOpen(true)}
                  className="rounded-md bg-slate-100 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-slate-200"
                >
                  Voir les 20 équipements
                </button>
              </section>

              <DateRangePicker range={range} onRangeChange={setRange} />

            <section id="reviews" className="space-y-5 border-t border-slate-200 pt-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="text-[20.74464px] font-medium tracking-tight text-gray-900">
                    <span className="inline-flex items-center gap-2">
                      <StarFilled className="h-5 w-5 text-slate-900" />
                      {listing.rating} - 113 avis
                    </span>
                  </h2>
                  <button type="button" className="mt-2 text-xs text-gray-500 font-medium underline underline-offset-4">
                    Voir toutes les notes
                  </button>
                </div>
              </div>

              <div className="-mx-4 flex w-screen gap-0 overflow-x-auto pb-2 [scrollbar-width:none] md:mx-0 md:grid md:w-auto md:grid-cols-2 md:gap-5 md:overflow-visible [&::-webkit-scrollbar]:hidden">
                {reviews.map((review) => (
                  <article
                    key={`${review.name}-${review.location}`}
                    className="w-screen shrink-0 border-r border-slate-200 px-4 pr-6 md:w-auto md:shrink md:border-r-0 md:px-0 md:pr-0"
                  >
                    <div className="flex items-center gap-3">
                      <ShimmerImage
                        alt={review.name}
                        className="h-12 w-12 rounded-sm object-cover ring-1 ring-slate-200"
                        src={review.avatarUrl}
                      />
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">{review.name}</h3>
                        <p className="text-xs text-gray-500">{review.location}</p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm font-medium text-gray-700">{review.meta}</p>
                    <p className="mt-2 text-sm leading-6 text-gray-600">{review.text}</p>
                  </article>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setReviewsOpen(true)}
                  className="rounded-md bg-slate-100 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-slate-200"
                >
                  Voir les 113 avis
                </button>
                <button
                  type="button"
                  className="text-sm text-gray-500 underline underline-offset-4"
                >
                  Comment fonctionnent les avis
                </button>
              </div>
            </section>

            <section id="location" className="space-y-5 border-t border-slate-200 pt-8">
              <SectionHeading title="Où vous serez" subtitle="Kinshasa, France" />
              <div className="overflow-hidden rounded-sm border border-slate-200 bg-white">
                <div className="relative h-[308px] bg-[radial-gradient(circle_at_20%_20%,rgba(246,199,105,0.35),transparent_20%),radial-gradient(circle_at_70%_30%,rgba(244,114,182,0.22),transparent_18%),linear-gradient(180deg,#f8fafc,#eef2ff)]">
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent" />
                  <div className="absolute left-6 top-6 rounded-sm bg-white/95 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm">
                    Aperçu de la carte
                  </div>
                </div>
              </div>
            </section>

            <section id="things-to-know" className="space-y-5 border-t border-slate-200 pt-8">
              <SectionHeading title="À savoir" />
              <div className="grid gap-5 xl:grid-cols-3">
                {thingsToKnow.map(({ title, icon: Icon, description }) => (
                  <div key={title} className="rounded-sm p-5 ">
                    <Icon className="h-6 w-6 text-gray-700" />
                    <h3 className="mt-4 text-sm font-semibold text-gray-900">{title}</h3>
                    <ul className="mt-3 space-y-1 text-sm leading-5 text-gray-600">
                      {description.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          </section>

          <aside className="hidden space-y-4 lg:sticky lg:top-24 lg:block lg:self-start">
            <BookingCard listing={listing} price={listing.price} nights={nights} range={range} />

            <div className="rounded-sm border border-slate-200 bg-white p-5 text-sm text-gray-600 sm:p-6">
              <p className="font-medium text-gray-900">Signaler ce logement</p>
              <p className="mt-2 leading-6">
                Nous pouvons afficher cela comme action d’assistance plus tard si vous voulez un parcours Booksa
                plus complet.
              </p>
            </div>
          </aside>
        </div>
      </main>

      <MobileBookingBar
        listingPrice={listing.price}
        nights={nights}
        dateRange={mobileDateRange}
        onReserve={handleMobileReserve}
      />

<div className="mx-auto max-w-[1650px] px-10 py-8 lg:px-44">

      <MeetYourHost />
    </div>
      <Footer />
      <AmenitiesDialog open={amenitiesOpen} onClose={() => setAmenitiesOpen(false)} />
      <GuestReviewsDialog open={reviewsOpen} onClose={() => setReviewsOpen(false)} reviewItems={reviews} />
    </div>
  );
}


// MeetYourHost.tsx
export  function MeetYourHost() {
  return (
    <section className="w-full border-t border-gray-200 bg-white px-6 py-10">
        <h2 className="mb-6 text-[20.74464px] font-medium text-neutral-900">
        Rencontrez votre hôte
      </h2>

      <div className="grid gap-10 md:grid-cols-[420px_1fr]">
        {/* Host Card */}
        <div className="rounded-sm bg-white/12 p-8 shadow-2xl shadow-gray-300/90 ring-1 ring-gray-100">
          <div className="flex items-center justify-between gap-8">
            <div className="flex flex-1 flex-col items-center">
              <div className="relative mb-3 flex h-24 w-24 items-center justify-center rounded-sm bg-pink-100">
                <span className="text-3xl font-bold text-rose-700">P</span>

                <div className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-sm bg-rose-600 text-white shadow-md">
                  <CheckmarkCircleRegular className="h-5 w-5 text-white" />
                </div>
              </div>

              <h3 className="text-3xl font-bold text-neutral-900">Pamela</h3>
              <p className="text-sm text-neutral-500">Hôte</p>
            </div>

            <div className="w-28 space-y-3">
              <Stat value="317" label="Avis" />
              <Stat value="4.74 ★" label="Note" />
              <Stat value="2" label="Années d’hébergement" last />
            </div>
          </div>
        </div>

        {/* Host Details */}
        <div className="flex flex-col justify-between">
          <div>
            <h3 className="mb-4 text-xl font-semibold text-neutral-900">
              Détails de l’hôte
            </h3>

            <p className="text-base text-neutral-800">
              Taux de réponse : 100 %
              <br />
              Répond en moins d’une heure
            </p>

            <button className="mt-8 rounded-md bg-neutral-100 px-7 py-4 text-base font-semibold text-neutral-900 transition hover:bg-neutral-200">
              Envoyer un message à l’hôte
            </button>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-7">
            <div className="flex items-center font-normal gap-4 text-sm text-neutral-500">
              <ShieldCheckmarkRegular className="h-6 w-6 text-rose-500" />
              <p>
                Pour protéger votre paiement, utilisez toujours Booksa pour envoyer de l’argent
                et communiquer avec les hôtes.
              </p>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
}

type StatProps = {
  value: string;
  label: string;
  last?: boolean;
};

function Stat({ value, label, last }: StatProps) {
  return (
    <div className={last ? "" : "border-b border-gray-200 pb-3"}>
      <p className="text-md font-medium text-neutral-900">{value}</p>
      <p className="text-xs font-medium text-neutral-700">{label}</p>
    </div>
  );
}
