import { useMemo, useState, type ReactNode } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeftRegular,
  CheckmarkRegular,
  StarFilled
} from '@fluentui/react-icons';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '@/utils/constants';
import type { Listing } from '@/pages/home/listing/listing.types';
import BooksaLogo from '@/components/layout/BooksaLogo';
import { ShimmerImage } from '@/components/ui/ShimmerImage';
import {
  readPersistedConfirmPayContext,
  readPersistedListingContext
} from '@/utils/navigationPersistence';

type ConfirmPayState = {
  listing?: Listing;
  nights?: number;
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
    return basePrice;
  }

  const nightlyRate = baseAmount / 2;
  return formatCurrencyValue(nightlyRate * normalizedNights);
}

function buildDateLabel(start: string | null | undefined, end: string | null | undefined, emptyLabel: string) {
  if (!start || !end) {
    return emptyLabel;
  }

  return `${formatDate(start, undefined, { month: 'short', day: 'numeric' })} – ${formatDate(end, undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

function PaymentChoice({
  active,
  description,
  onClick,
  title
}: {
  active: boolean;
  description?: string;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex w-full cursor-pointer items-start gap-4 px-0 py-0 text-left transition',
        active ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'
      ].join(' ')}
    >
      <span className="min-w-0 flex-1">
        <span className="block text-[11.76px] font-normal">{title}</span>
        {description ? <span className="mt-1 block text-[11.76px] leading-4 text-[var(--color-text-secondary)]">{description}</span> : null}
      </span>
      <span
        className={[
          'mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2',
          active ? 'border-[var(--color-text-primary)]' : 'border-[var(--color-border)]'
        ].join(' ')}
      >
        {active ? <span className="h-3 w-3 rounded-full bg-[var(--color-text-primary)]" /> : null}
      </span>
    </button>
  );
}

function SectionCard({
  children,
  title,
  subtitle
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-5 sm:px-6 sm:py-6">
      <div className="mb-5">
        <h2 className="text-xl font-semibold tracking-tight text-[var(--color-text-primary)]">{title}</h2>
        {subtitle ? <p className="mt-1 text-xs leading-6 text-[var(--color-text-secondary)]">{subtitle}</p> : null}
      </div>
      {children}
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

  const [selectedChoice, setSelectedChoice] = useState<'now' | 'later'>('now');

  const bookingSummary = useMemo(() => {
    const nights = Math.max(1, state?.nights ?? persistedState?.nights ?? 2);
    const guestCounts = state?.guestCounts ?? persistedState?.guestCounts;
    const total =
      state?.total ??
      persistedState?.total ??
      (listing ? getReservationPrice(listing.price, nights) : 'CDF 0');

    return {
      dates: buildDateLabel(
        state?.range?.start ?? persistedState?.range?.start,
        state?.range?.end ?? persistedState?.range?.end,
        t('selectDates')
      ),
      guests: guestCounts
        ? t('guests', { count: guestCounts.adults + guestCounts.children })
        : t('guests', { count: 1 }),
      nights,
      total
    };
  }, [listing, persistedState, state, t]);

  if (!listing) {
    return <Navigate to={ROUTES.home} replace />;
  }

  const roomImage = listing.gallery?.[0] ?? listing.image;
  return (
    <div className="min-h-screen bg-[var(--color-project-shell)] text-[var(--color-text-primary)]">
      <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto flex max-w-[1440px] items-center px-4 py-4 sm:px-6 lg:px-10">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex cursor-pointer items-center gap-2 text-[var(--color-text-primary)]"
            aria-label="Retour"
          >
            <BooksaLogo />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1120px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-[var(--shadow-xs)] ring-1 ring-[var(--color-border)] transition hover:-translate-y-0.5"
            aria-label="Retour"
          >
            <ArrowLeftRegular className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-[23.52px] font-bold tracking-tight text-[var(--color-text-primary)] sm:text-[26.88px]">Confirmer et payer</h1>
          </div>
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
          <section className="space-y-5">
            <SectionCard title="1. Choisissez quand payer">
              <div className="overflow-hidden rounded-xl bg-[var(--color-surface)]">
                <div className="border-b border-[var(--color-border)] px-0 py-2">
                  <PaymentChoice
                    active={selectedChoice === 'now'}
                    onClick={() => setSelectedChoice('now')}
                    title={`Payer ${bookingSummary.total} maintenant`}
                  />
                </div>
                <div className="px-0 py-5">
                  <PaymentChoice
                    active={selectedChoice === 'later'}
                    onClick={() => setSelectedChoice('later')}
                    title={`Payer ${formatCurrencyValue(0)} maintenant`}
                    description={`${bookingSummary.total} sera prélevé le 4 juillet. Aucun frais supplémentaire. Plus d’infos`}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  className="inline-flex min-h-12 min-w-[116px] cursor-pointer items-center justify-center rounded-lg bg-[var(--color-primary-500)] px-6 py-3 text-base font-semibold text-white transition hover:bg-[var(--color-primary-600)]"
                >
                  Suivant
                </button>
              </div>
            </SectionCard>

          </section>

          <aside className="space-y-4 lg:sticky lg:top-8 lg:self-start">
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-sm)] sm:p-6">
              <div className="flex gap-4">
                <ShimmerImage alt={listing.location} src={roomImage} className="h-[96px] w-[96px] rounded-[14px] object-cover" />
                <div className="min-w-0">
                  <h2 className="text-[15.12px] font-semibold leading-6 text-[var(--color-text-primary)]">
                    {listing.title ?? listing.location}
                  </h2>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                    <span className="inline-flex items-center gap-1">
                      <StarFilled className="h-4 w-4 text-[var(--color-primary-500)]" />
                      <span className="font-medium">{listing.rating}</span>
                    </span>
                    <span>•</span>
                    <span>Favori des voyageurs</span>
                  </div>
                </div>
              </div>

              <div className="my-4 h-px bg-[var(--color-border)]" />

              <div className="space-y-0">
                <div className="flex items-center justify-between gap-4 py-4">
                  <div>
                    <p className="text-xs font-medium text-[var(--color-text-primary)]">Annulation gratuite</p>
                    <p className="mt-1 text-xs leading-6 text-[var(--color-text-secondary)]">
                      Annulez avant le 12 juillet pour un remboursement complet. <span className="underline">Politique complète</span>
                    </p>
                  </div>
                </div>

                <div className="border-t border-[var(--color-border)] py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium text-[var(--color-text-primary)]">Dates</p>
                      <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{bookingSummary.dates}</p>
                    </div>
                    <button
                      type="button"
                      className="cursor-pointer rounded-full bg-[color-mix(in_srgb,var(--color-primary-500)_10%,white)] px-4 py-2 text-xs font-medium text-[var(--color-text-primary)]"
                    >
                      Modifier
                    </button>
                  </div>
                </div>

                <div className="border-t border-[var(--color-border)] py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium text-[var(--color-text-primary)]">{t('guests')}</p>
                      <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{bookingSummary.guests}</p>
                    </div>
                    <button
                      type="button"
                      className="cursor-pointer rounded-full bg-[color-mix(in_srgb,var(--color-primary-500)_10%,white)] px-4 py-2 text-xs font-medium text-[var(--color-text-primary)]"
                    >
                      {t('edit')}
                    </button>
                  </div>
                </div>

                <div className="border-t border-[var(--color-border)] py-4">
                  <p className="text-xs font-medium text-[var(--color-text-primary)]">{t('priceDetails')}</p>
                  <div className="mt-3 flex items-center justify-between gap-4 text-xs text-[var(--color-text-secondary)]">
                    <span>
                      {t('nightlyPrice', { count: bookingSummary.nights, price: formatCurrencyValue(parsePriceValue(listing.price) / 2) })}
                    </span>
                    <span>{bookingSummary.total}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-4 border-t border-[var(--color-border)] pt-4 text-[12.6px] font-semibold text-[var(--color-text-primary)]">
                    <span>{t('total')}</span>
                    <span>{bookingSummary.total}</span>
                  </div>
                  <button
                    type="button"
                    className="mt-3 cursor-pointer text-xs font-medium text-[var(--color-text-primary)] underline underline-offset-4"
                  >
                    Détail du prix
                  </button>
                </div>
              </div>

              <div className="mt-5">
                <button
                  type="button"
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-[16px] bg-[var(--color-primary-500)] px-5 py-4 text-sm font-normal text-white transition hover:bg-[var(--color-primary-600)]"
                >
                  Confirmer et payer
                </button>
                <p className="mt-3 text-center text-xs leading-5 text-[var(--color-text-secondary)]">
                  Vous ne serez pas débité avant d’avoir confirmé cette réservation.
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-[color-mix(in_srgb,var(--color-primary-500)_10%,white)] px-5 py-4 text-sm text-[var(--color-text-primary)]">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-primary-100)] text-[var(--color-primary-700)]">
                  <CheckmarkRegular className="h-4 w-4" />
                </div>
                <p className="leading-6">
                  Bonne trouvaille ! Ce logement est généralement réservé rapidement.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
