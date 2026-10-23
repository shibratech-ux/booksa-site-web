import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { generatePath, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import BooksaHeader from '@/components/layout/BooksaHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { BackButton } from '@/components/ui/BackButton';
import { ShimmerImage } from '@/components/ui/ShimmerImage';
import { parseRestaurantBookingSearch, type RestaurantPreviewPaymentMethod } from '@/domain/restaurant-booking';
import { quoteRestaurantVisit } from '@/domain/pricing';
import { getPublishedListingDetail, type PublishedListingDetail } from '@/services/listing-catalog.service';
import { ROUTES } from '@/utils/constants';
import { formatCurrency, formatDate, formatTime } from '@/utils/formatters';

type ListingState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'not-found' }
  | { status: 'loaded'; listing: PublishedListingDetail };

const paymentLabelKeys = {
  card: 'restaurantDates.cardMethod',
  mpesa: 'restaurantDates.mpesaMethod',
  airtelMoney: 'restaurantDates.airtelMoneyMethod',
  orangeMoney: 'restaurantDates.orangeMoneyMethod',
  paypal: 'restaurantDates.paypalMethod',
  googlePay: 'restaurantDates.googlePayMethod',
  applePay: 'restaurantDates.applePayMethod',
  cash: 'restaurantDates.cashMethod'
} as const satisfies Record<RestaurantPreviewPaymentMethod, string>;

export default function RestaurantBookingPage() {
  const { t, i18n } = useTranslation('booking');
  const navigate = useNavigate();
  const location = useLocation();
  const { listingId = '' } = useParams<{ listingId: string }>();
  const selection = useMemo(() => parseRestaurantBookingSearch(location.search), [location.search]);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<ListingState>({ status: 'loading' });
  const listingPath = listingId ? generatePath(ROUTES.listingDetail, { listingId }) : ROUTES.restaurants;

  useEffect(() => {
    if (!selection || !listingId) return;
    let active = true;
    setState({ status: 'loading' });
    getPublishedListingDetail(listingId)
      .then(listing => { if (active) setState(listing && listing.category === 'restaurant' ? { status: 'loaded', listing } : { status: 'not-found' }); })
      .catch(() => { if (active) setState({ status: 'error' }); });
    return () => { active = false; };
  }, [listingId, selection, attempt]);

  const quote = selection && state.status === 'loaded'
    ? quoteRestaurantVisit(state.listing.basePrice, selection.adults, selection.children)
    : null;
  const exceedsCapacity = Boolean(selection && state.status === 'loaded' && state.listing.basics.guests > 0 && selection.adults + selection.children > state.listing.basics.guests);
  const invalid = !selection || !listingId || (state.status === 'loaded' && (!quote || exceedsCapacity));

  return <div className="min-h-dvh bg-[var(--color-surface)] text-[var(--color-text-primary)]">
    <div className="hidden md:block"><BooksaHeader /></div>
    <header className="mx-auto flex max-w-2xl items-center px-4 py-3 sm:px-6">
      <BackButton label={t('restaurantBooking.backToRestaurant')} onClick={() => navigate(listingPath)} />
      <span className="ml-3 text-sm font-semibold">{t('restaurantBooking.title')}</span>
    </header>
    <main className="mx-auto w-full max-w-2xl px-5 pb-12 pt-7 sm:px-6">
      {invalid ? <EmptyState
        title={t('restaurantBooking.invalidTitle')}
        description={t('restaurantBooking.invalidDescription')}
        actionLabel={t('restaurantBooking.backToRestaurant')}
        onAction={() => navigate(listingPath)}
      /> : state.status === 'loading' ? <LoadingScreen fullScreen={false} label={t('listingDetail.loading')} /> : state.status === 'error' ? <ErrorState description={t('listingDetail.loadError')} onRetry={() => setAttempt(value => value + 1)} /> : state.status === 'not-found' ? <EmptyState
        title={t('listingDetail.notFound')}
        description={t('listingDetail.notFoundHint')}
        actionLabel={t('restaurantBooking.backToRestaurant')}
        onAction={() => navigate(listingPath)}
      /> : selection && quote ? <>
        <div className="mb-6 grid grid-cols-3 gap-1" role="progressbar" aria-label={t('restaurantBooking.title')} aria-valuemin={1} aria-valuemax={3} aria-valuenow={3} aria-valuetext={t('restaurantBooking.stepThreeOfThree')}>
          <span className="h-1 bg-[var(--color-text-primary)]" /><span className="h-1 bg-[var(--color-text-primary)]" /><span className="h-1 bg-[var(--color-text-primary)]" />
        </div>
        <p className="mb-4 text-xs font-semibold text-[var(--color-text-secondary)]">{t('restaurantBooking.stepThreeOfThree')}</p>
        <div className="mb-4 inline-flex min-h-11 items-center gap-2 rounded-button bg-[var(--color-surface-muted)] px-4 text-sm font-semibold">
          <CheckCircle2 className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
          {t('restaurantBooking.previewReady')}
        </div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t('restaurantBooking.title')}</h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{t('restaurantBooking.subtitle')}</p>

        <h2 id="restaurant-booking-details-heading" className="mb-3 mt-8 text-lg font-semibold">{t('restaurantBooking.details')}</h2>
        <section className="overflow-hidden rounded-card border border-[var(--color-border-subtle)]" aria-labelledby="restaurant-booking-details-heading">
          <div className="flex items-center gap-4 p-4">
            <ShimmerImage src={state.listing.coverImageUrl} alt="" className="h-20 w-20 shrink-0 rounded-card object-cover" />
            <div className="min-w-0"><h2 className="font-semibold leading-snug">{state.listing.title}</h2><p className="mt-1 text-sm text-[var(--color-text-secondary)]">{state.listing.city ?? state.listing.location}</p></div>
          </div>
          <dl className="divide-y divide-[var(--color-border-subtle)] border-t border-[var(--color-border-subtle)] px-4">
            <div className="flex justify-between gap-5 py-4 text-sm"><dt className="font-semibold">{t('restaurantDetail.date')}</dt><dd className="text-right">{formatDate(`${selection.date}T12:00:00`, i18n.resolvedLanguage, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</dd></div>
            <div className="flex justify-between gap-5 py-4 text-sm"><dt className="font-semibold">{t('restaurantBooking.time')}</dt><dd className="text-right">{formatTime(`${selection.date}T${selection.time}:00`, i18n.resolvedLanguage)}</dd></div>
            <div className="flex justify-between gap-5 py-4 text-sm"><dt className="font-semibold">{t('restaurantDetail.guests')}</dt><dd className="text-right">{t('restaurantDates.adults', { count: selection.adults })}{selection.children ? ` · ${t('restaurantDates.children', { count: selection.children })}` : ''}</dd></div>
            <div className="flex justify-between gap-5 py-4 text-sm"><dt className="font-semibold">{t('restaurantBooking.paymentMethod')}</dt><dd className="text-right">{t(paymentLabelKeys[selection.paymentMethod])}</dd></div>
            <div className="flex justify-between gap-5 py-4 text-sm"><dt className="font-semibold">{t('restaurantDates.estimatedTotal')}</dt><dd className="text-right font-semibold">{formatCurrency(quote.total, quote.currency, i18n.resolvedLanguage)}</dd></div>
          </dl>
        </section>

        <section className="mt-5 rounded-card bg-[var(--color-surface-muted)] p-4">
          <h2 className="text-sm font-semibold">{t('restaurantBooking.nextStepsTitle')}</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{t('restaurantBooking.previewNotice')}</p>
        </section>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <button type="button" className="flex min-h-12 w-full items-center justify-center rounded-button bg-[var(--color-text-primary)] px-4 text-sm font-semibold text-[var(--color-surface)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary-500)]" onClick={() => navigate(listingPath)}>{t('restaurantBooking.backToRestaurant')}</button>
          <button type="button" className="flex min-h-12 w-full items-center justify-center rounded-button border border-[var(--color-border)] px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary-500)]" onClick={() => navigate(ROUTES.restaurants)}>{t('restaurantBooking.browseRestaurants')}</button>
        </div>
      </> : null}
    </main>
  </div>;
}
