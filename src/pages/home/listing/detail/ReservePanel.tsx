import { useTranslation } from 'react-i18next';
import { countStayNights, quoteStay } from '@/domain/pricing';
import { formatCurrency } from '@/utils/formatters';
import type { ListingDetailView } from './useListingDetailView';
import type { StayRange } from './StayCalendar';

const SAMPLE_DEFAULT_NIGHTS = 2;

// Known pricing debt, kept only for the sample cards: their display price is a two-night total.
// Do not reuse for real listings; they go through `quoteStay` in src/domain/pricing.ts.
function sampleReservationPrice(price: string, nights: number) {
  const amount = Number.parseInt(price.replace(/[^\d]/g, ''), 10);
  return Number.isFinite(amount) && amount > 0 ? formatCurrency(Math.round((amount / 2) * nights), 'CDF') : price;
}

export type ReserveSummary = {
  /** Valid half-open stay, or null while dates are missing. */
  nights: number | null;
  amountLabel: string;
  contextLabel: string;
  total: string | null;
};

export function useReserveSummary(view: ListingDetailView, range: StayRange): ReserveSummary {
  const { t, i18n } = useTranslation('booking');
  const language = i18n.resolvedLanguage;
  const nights = range.start && range.end ? countStayNights(range.start, range.end) : null;
  const dates = range.start && range.end
    ? t('listingDetail.calendar.range', {
      start: new Intl.DateTimeFormat(language, { day: 'numeric', month: 'short' }).format(new Date(`${range.start}T12:00:00`)),
      end: new Intl.DateTimeFormat(language, { day: 'numeric', month: 'short' }).format(new Date(`${range.end}T12:00:00`))
    })
    : '';

  if (view.pricing.kind === 'nightly') {
    const quote = nights ? quoteStay(view.pricing.nightlyPrice, nights) : null;
    if (!quote) {
      return {
        nights: null,
        amountLabel: t('listingDetail.perNight', { price: formatCurrency(view.pricing.nightlyPrice, 'CDF', language) }),
        contextLabel: t('listingDetail.addDates'),
        total: null
      };
    }
    const total = formatCurrency(quote.total, quote.currency, language);
    return { nights: quote.nights, amountLabel: total, contextLabel: t('listingDetail.reserveFor', { nights: t('forNights', { count: quote.nights }), dates }), total };
  }

  const sampleNights = nights ?? SAMPLE_DEFAULT_NIGHTS;
  const total = sampleReservationPrice(view.pricing.price, sampleNights);
  return {
    nights: sampleNights,
    amountLabel: total,
    contextLabel: dates ? t('listingDetail.reserveFor', { nights: t('forNights', { count: sampleNights }), dates }) : t('forNights', { count: sampleNights }),
    total
  };
}

const reserveButton = 'min-h-12 rounded-button bg-[var(--color-primary-500)] px-6 text-base font-semibold text-white transition hover:bg-[var(--color-primary-600)] active:scale-[0.98]';

export function MobileReserveBar({ summary, onReserve }: { summary: ReserveSummary; onReserve: () => void }) {
  const { t } = useTranslation('booking');
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-border)] bg-[var(--color-surface)] pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-5 py-3 sm:px-6">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold underline underline-offset-2 sm:text-base">{summary.amountLabel}</p>
          <p className="mt-0.5 truncate text-xs text-[var(--color-text-secondary)] sm:text-sm">{summary.contextLabel}</p>
        </div>
        <button type="button" onClick={onReserve} className={`${reserveButton} w-[42%] shrink-0 rounded-full sm:w-auto`}>
          {t('reserve')}
        </button>
      </div>
    </div>
  );
}

export function DesktopReserveCard({ summary, onReserve }: { summary: ReserveSummary; onReserve: () => void }) {
  const { t } = useTranslation('booking');
  return (
    <div className="rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-md)]">
      <p className="text-xl font-semibold">{summary.amountLabel}</p>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{summary.contextLabel}</p>
      <button type="button" onClick={onReserve} className={`${reserveButton} mt-5 w-full`}>
        {t('reserve')}
      </button>
      {!summary.nights ? <p className="mt-3 text-center text-xs text-[var(--color-text-secondary)]">{t('listingDetail.calendar.addDatesHint')}</p> : null}
    </div>
  );
}
