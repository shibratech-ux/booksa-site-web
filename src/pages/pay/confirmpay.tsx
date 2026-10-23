import { useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Check, Minus, Plus, Star, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ReservationSimulationError, type SimulatedReservation } from '@/domain/reservation-simulator';
import { countStayNights, quoteStay } from '@/domain/pricing';
import { ShimmerImage } from '@/components/ui/ShimmerImage';
import { useReservationSimulatorStore } from '@/store/reservation-simulator.store';
import { useAuthStore } from '@/store/auth.store';
import type { Listing } from '@/pages/home/listing/listing.types';
import type { StayRange } from '@/pages/home/listing/detail/StayCalendar';
import { StayDatesSheet } from './StayDatesSheet';
import { formatCalendarDate, formatCurrency } from '@/utils/formatters';
import { ROUTES } from '@/utils/constants';
import {
  readPersistedConfirmPayContext,
  readPersistedListingContext
} from '@/utils/navigationPersistence';

type ConfirmPayState = {
  requestId?: string;
  listing?: Listing;
  nights?: number;
  nightlyPriceCdf?: number;
  guestCapacity?: number;
  ownedByCurrentUser?: boolean;
  range?: {
    end?: string | null;
    start?: string | null;
  };
  guestCounts?: {
    adults: number;
    children: number;
    infants: number;
    pets: number;
  };
  total?: string;
};

// Sample card prices are stored as two-night display totals. Keep this legacy fallback
// for direct checkout visits; normal navigation passes the selected total in state.
function getReservationPrice(basePrice: string, nights: number) {
  const numericValue = Number.parseInt(basePrice.replace(/[^\d]/g, ''), 10);
  if (!Number.isFinite(numericValue) || numericValue <= 0) return basePrice;
  return formatCurrency(Math.round((numericValue / 2) * Math.max(1, nights)), 'CDF');
}

function buildDateLabel(start: string | null | undefined, end: string | null | undefined, emptyLabel: string) {
  if (!start || !end || !countStayNights(start, end)) return emptyLabel;
  return formatCalendarDate(start, undefined, { month: 'short', day: 'numeric' }) +
    ' – ' + formatCalendarDate(end, undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function PaymentChoice({ active, description, onClick, title }: {
  active: boolean;
  description?: string;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="flex min-h-16 w-full items-center gap-4 px-4 py-3 text-left"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{title}</span>
        {description ? <span className="mt-1 block text-xs leading-5 text-[var(--color-text-secondary)]">{description}</span> : null}
      </span>
      <span className={'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ' +
        (active ? 'border-[var(--color-text-primary)]' : 'border-[var(--color-border)]')} aria-hidden="true">
        {active ? <span className="h-3 w-3 rounded-full bg-[var(--color-text-primary)]" /> : null}
      </span>
    </button>
  );
}

function GuestCounter({ label, count, decreaseLabel, increaseLabel, onDecrease, onIncrease, decreaseDisabled, increaseDisabled }: {
  label: string;
  count: number;
  decreaseLabel: string;
  increaseLabel: string;
  onDecrease: () => void;
  onIncrease: () => void;
  decreaseDisabled: boolean;
  increaseDisabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <button type="button" onClick={onDecrease} disabled={decreaseDisabled} aria-label={decreaseLabel} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-border)] disabled:opacity-40"><Minus className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" /></button>
        <span className="w-5 text-center text-sm tabular-nums">{count}</span>
        <button type="button" onClick={onIncrease} disabled={increaseDisabled} aria-label={increaseLabel} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-border)] disabled:opacity-40"><Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" /></button>
      </div>
    </div>
  );
}

export default function ConfirmPayPage() {
  const { t } = useTranslation('booking');
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as ConfirmPayState | null;
  const persistedState = readPersistedConfirmPayContext<ConfirmPayState>();
  const listing = state?.listing ?? persistedState?.listing ?? readPersistedListingContext<Listing>();
  const guestUid = useAuthStore(store => store.user?.id ?? null);
  const submitSimulation = useReservationSimulatorStore(store => store.submit);
  const [requestId] = useState(() => state?.requestId ?? persistedState?.requestId ?? crypto.randomUUID());
  const initialRange = state?.range ?? persistedState?.range;
  const [range, setRange] = useState<StayRange>(() => ({ start: initialRange?.start ?? null, end: initialRange?.end ?? null }));
  const [datesOpen, setDatesOpen] = useState(false);

  const [selectedChoice, setSelectedChoice] = useState<'now' | 'later'>('now');
  const [guestCounts, setGuestCounts] = useState(() => {
    const initial = state?.guestCounts ?? persistedState?.guestCounts;
    const adults = initial?.adults;
    const children = initial?.children;
    return {
      adults: typeof adults === 'number' && Number.isInteger(adults) && adults > 0 ? adults : 1,
      children: typeof children === 'number' && Number.isInteger(children) && children >= 0 ? children : 0
    };
  });
  const [guestsExpanded, setGuestsExpanded] = useState(false);
  const [showPriceDetails, setShowPriceDetails] = useState(false);
  const [reservation, setReservation] = useState<SimulatedReservation | null>(null);
  const [simulationError, setSimulationError] = useState<string | null>(null);

  const bookingSummary = useMemo(() => {
    const nights = countStayNights(range.start ?? '', range.end ?? '') ?? Math.max(1, state?.nights ?? persistedState?.nights ?? 2);
    const datesChanged = range.start !== (initialRange?.start ?? null) || range.end !== (initialRange?.end ?? null);
    const nightlyPriceCdf = state?.nightlyPriceCdf ?? persistedState?.nightlyPriceCdf;
    const quote = nightlyPriceCdf === undefined ? null : quoteStay(nightlyPriceCdf, nights);
    return {
      dates: buildDateLabel(range.start, range.end, t('selectDates')),
      guests: t('guests', { count: guestCounts.adults + guestCounts.children }),
      nights,
      total: !datesChanged && (state?.total ?? persistedState?.total)
        ? (state?.total ?? persistedState?.total ?? '')
        : quote ? formatCurrency(quote.total, quote.currency)
          : listing ? getReservationPrice(listing.price, nights) : ''
    };
  }, [guestCounts, initialRange?.start, initialRange?.end, listing, persistedState, range, state, t]);

  if (!listing) return <Navigate to={ROUTES.home} replace />;

  const roomImage = listing.gallery?.[0] ?? listing.image;
  const guestCapacity = state?.guestCapacity ?? persistedState?.guestCapacity;
  const adjustGuests = (kind: 'adults' | 'children', delta: number) => setGuestCounts(current => {
    const next = { ...current, [kind]: current[kind] + delta };
    if (next.adults < 1 || next.children < 0 || (guestCapacity && next.adults + next.children > guestCapacity)) return current;
    return next;
  });
  const close = () => navigate(-1);
  const completeSimulation = () => {
    if (state?.ownedByCurrentUser ?? persistedState?.ownedByCurrentUser) {
      setSimulationError(t('reservationSimulator.ownListing'));
      return;
    }
    try {
      const result = submitSimulation({
        requestId,
        listingKey: listing.id ?? `sample:${listing.location}:${listing.title ?? ''}:${listing.price}:${listing.image}`,
        listingTitle: listing.title ?? listing.location,
        listingLocation: listing.location,
        imageUrl: roomImage,
        guestUid,
        checkIn: range.start ?? '',
        checkOut: range.end ?? '',
        adults: guestCounts.adults,
        children: guestCounts.children,
        guestCapacity,
        totalLabel: bookingSummary.total,
        nightlyPriceCdf: state?.nightlyPriceCdf ?? persistedState?.nightlyPriceCdf,
        paymentTiming: selectedChoice
      });
      if (result.status !== 'confirmed') {
        setSimulationError(t('reservationSimulator.invalid'));
        return;
      }
      setReservation(result);
      setSimulationError(null);
    } catch (error) {
      setSimulationError(t(error instanceof ReservationSimulationError && error.code === 'unavailable'
        ? 'reservationSimulator.unavailable' : 'reservationSimulator.invalid'));
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-text-primary)]">
      <header className="mx-auto flex max-w-[1040px] justify-end px-4 py-3 sm:px-8">
        <button
          type="button"
          onClick={close}
          aria-label={t('reviewContinue.close')}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-[var(--color-surface-muted)]"
        >
          <X className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
        </button>
      </header>

      {reservation ? (
        <main className="mx-auto max-w-xl px-5 py-16 text-center">
          <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-surface-muted)]">
            <Check className="h-7 w-7" strokeWidth={1.5} aria-hidden="true" />
          </span>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">{t('reservationSimulator.confirmedTitle')}</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">{t('reservationSimulator.confirmedDescription')}</p>
          <div className="mt-6 rounded-card border border-[var(--color-border)] p-5 text-left">
            <p className="font-semibold">{reservation.listingTitle}</p>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{bookingSummary.dates} · {bookingSummary.guests}</p>
            <p className="mt-2 text-sm font-semibold">{reservation.totalCdf === null ? reservation.totalLabel : formatCurrency(reservation.totalCdf, 'CDF')}</p>
            <p className="mt-3 text-xs text-[var(--color-text-secondary)]">{t('reservationSimulator.reference', { id: reservation.requestId.slice(0, 8) })}</p>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {guestUid ? <button type="button" onClick={() => navigate(ROUTES.trips)} className="min-h-12 rounded-button bg-[var(--color-text-primary)] px-6 text-sm font-semibold text-[var(--color-surface)]">{t('reservationSimulator.viewTrips')}</button> : null}
            <button type="button" onClick={close} className="min-h-12 rounded-button bg-[var(--color-surface-muted)] px-6 text-sm font-semibold">{t('reviewContinue.backToListing')}</button>
          </div>
        </main>
      ) : (
        <>
          <main className="mx-auto max-w-[1040px] px-5 pb-32 pt-1 sm:px-8 lg:pb-16 lg:pt-8">
            <h1 className="text-[24px] font-semibold tracking-tight sm:text-3xl">{t('reviewContinue.title')}</h1>

            <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-12">
              <aside className="order-1 rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-5 lg:order-2">
                <div className="flex gap-3">
                  <ShimmerImage alt="" src={roomImage} className="h-20 w-20 shrink-0 rounded-card object-cover" />
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold leading-5">{listing.title ?? listing.location}</h2>
                    {listing.rating ? (
                      <p className="mt-1.5 flex items-center gap-1 text-xs">
                        <Star className="h-3 w-3" fill="currentColor" strokeWidth={1.5} aria-hidden="true" />
                        {listing.rating}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 border-t border-[var(--color-border-subtle)] py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold">{t('reviewContinue.dates')}</h3>
                      <p className="mt-1 text-xs">{bookingSummary.dates}</p>
                    </div>
                    <button type="button" onClick={() => setDatesOpen(true)} className="min-h-11 shrink-0 rounded-button bg-[var(--color-surface-muted)] px-4 text-xs font-semibold">
                      {t('reviewContinue.change')}
                    </button>
                  </div>
                </div>

                <div className="border-t border-[var(--color-border-subtle)] py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold">{t('reviewContinue.guests')}</h3>
                      <p className="mt-1 text-xs">{bookingSummary.guests}</p>
                    </div>
                    <button type="button" onClick={() => setGuestsExpanded(value => !value)} aria-expanded={guestsExpanded} className="min-h-11 shrink-0 rounded-button bg-[var(--color-surface-muted)] px-4 text-xs font-semibold">{t('reviewContinue.change')}</button>
                  </div>
                  {guestsExpanded ? (
                    <div className="mt-3 border-t border-[var(--color-border-subtle)] pt-2">
                      <GuestCounter label={t('reservationSimulator.adults')} count={guestCounts.adults} decreaseLabel={t('reservationSimulator.removeAdult')} increaseLabel={t('reservationSimulator.addAdult')} onDecrease={() => adjustGuests('adults', -1)} onIncrease={() => adjustGuests('adults', 1)} decreaseDisabled={guestCounts.adults <= 1} increaseDisabled={Boolean(guestCapacity && guestCounts.adults + guestCounts.children >= guestCapacity)} />
                      <GuestCounter label={t('reservationSimulator.children')} count={guestCounts.children} decreaseLabel={t('reservationSimulator.removeChild')} increaseLabel={t('reservationSimulator.addChild')} onDecrease={() => adjustGuests('children', -1)} onIncrease={() => adjustGuests('children', 1)} decreaseDisabled={guestCounts.children <= 0} increaseDisabled={Boolean(guestCapacity && guestCounts.adults + guestCounts.children >= guestCapacity)} />
                      {guestCapacity ? <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{t('reservationSimulator.guestLimit', { count: guestCapacity })}</p> : null}
                    </div>
                  ) : null}
                </div>

                <div className="border-t border-[var(--color-border-subtle)] py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold">{t('reviewContinue.totalPrice')}</h3>
                      <p className="mt-1 text-xs">{bookingSummary.total}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPriceDetails(value => !value)}
                      aria-expanded={showPriceDetails}
                      className="min-h-11 shrink-0 rounded-button bg-[var(--color-surface-muted)] px-4 text-xs font-semibold"
                    >
                      {t(showPriceDetails ? 'reviewContinue.hideDetails' : 'reviewContinue.details')}
                    </button>
                  </div>
                  {showPriceDetails ? (
                    <p className="mt-3 text-xs leading-5 text-[var(--color-text-secondary)]">
                      {t('reviewContinue.priceSummary', { count: bookingSummary.nights, total: bookingSummary.total })}
                    </p>
                  ) : null}
                </div>

                <div className="border-t border-[var(--color-border-subtle)] pt-3">
                  <h3 className="text-sm font-semibold">{t('reviewContinue.cancellation')}</h3>
                  <p className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)]">{t('reviewContinue.cancellationHint')}</p>
                </div>
              </aside>

              <section className="order-2 lg:order-1">
                <h2 className="mb-3 text-base font-semibold">{t('reviewContinue.paymentTitle')}</h2>
                <div className="divide-y divide-[var(--color-border-subtle)] overflow-hidden rounded-card border border-[var(--color-border)]">
                  <PaymentChoice
                    active={selectedChoice === 'now'}
                    onClick={() => setSelectedChoice('now')}
                    title={t('reviewContinue.payNow', { total: bookingSummary.total })}
                  />
                  <PaymentChoice
                    active={selectedChoice === 'later'}
                    onClick={() => setSelectedChoice('later')}
                    title={t('reviewContinue.payLater')}
                    description={t('reviewContinue.paymentNotice')}
                  />
                </div>
                <p className="mt-3 text-xs leading-5 text-[var(--color-text-secondary)]">{t('reviewContinue.previewNotice')}</p>
                {simulationError ? <p role="alert" className="mt-3 text-sm text-[var(--color-danger)]">{simulationError}</p> : null}
                <button
                  type="button"
                  onClick={completeSimulation}
                  className="mt-6 hidden min-h-12 w-full rounded-button bg-[var(--color-text-primary)] px-6 text-sm font-semibold text-[var(--color-surface)] lg:block"
                >
                  {t('reservationSimulator.confirmAction')}
                </button>
              </section>
            </div>
          </main>

          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-5 pb-[max(10px,env(safe-area-inset-bottom))] pt-3 lg:hidden">
            {simulationError ? <p role="alert" className="mb-2 text-xs text-[var(--color-danger)]">{simulationError}</p> : null}
            <button
              type="button"
              onClick={completeSimulation}
              className="min-h-11 w-full rounded-button bg-[var(--color-text-primary)] px-6 text-sm font-semibold text-[var(--color-surface)]"
            >
              {t('reservationSimulator.confirmAction')}
            </button>
          </div>
        </>
      )}
      <StayDatesSheet open={datesOpen} range={range} onClose={() => setDatesOpen(false)} onSave={nextRange => { setRange(nextRange); setSimulationError(null); setDatesOpen(false); }} />
    </div>
  );
}
