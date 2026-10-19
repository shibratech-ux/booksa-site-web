import { ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { resolveListingPricing } from '@/domain/calendar';
import type { ListingDraft } from '@/services/listing-draft.service';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { ListingNightlyPriceSheet } from './ListingNightlyPriceSheet';
import { ListingWeekendAdjustmentSheet } from './ListingWeekendAdjustmentSheet';

export function ListingPricingSection({ listing, onOpenCalendar, onSavePrice, onSaveWeekendAdjustment }: {
  listing: ListingDraft;
  onOpenCalendar: () => void;
  onSavePrice: (price: number) => Promise<void>;
  onSaveWeekendAdjustment: (adjustment: number) => Promise<void>;
}) {
  const { t, i18n } = useTranslation('dashboard');
  const { basePrice, weekendAdjustment, currency } = resolveListingPricing(listing);
  const [isNightlyPriceOpen, setIsNightlyPriceOpen] = useState(false);
  const [isWeekendAdjustmentOpen, setIsWeekendAdjustmentOpen] = useState(false);

  return (
    <section aria-labelledby="listing-pricing-heading" className="max-w-xl">
      <h2 id="listing-pricing-heading" className="text-[1.660932rem] font-semibold leading-tight tracking-tight">
        {t('listingPricing.heading')}
      </h2>
      <p className="mt-3 text-[0.830466rem] leading-6 text-[var(--color-text-secondary)]">
        {t('listingPricing.subtitle')}
      </p>
      <details className="mt-1 text-[0.830466rem] leading-6 text-[var(--color-text-secondary)]">
        <summary className="flex min-h-11 w-fit cursor-pointer items-center rounded-button font-semibold underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
          {t('listingPricing.learnMore')}
        </summary>
        <p className="pb-3">{t('listingPricing.help')}</p>
      </details>

      <div className="mt-4 grid gap-4">
        <button
          type="button"
          onClick={() => setIsNightlyPriceOpen(true)}
          aria-haspopup="dialog"
          className="flex min-h-24 w-full items-center justify-between gap-4 rounded-card border border-[var(--color-border)] px-6 py-5 text-left transition hover:bg-[var(--color-surface-muted)]"
        >
          <span className="text-[0.830466rem] font-medium">{t('listingPricing.perNight')}</span>
          <span className="break-words text-right text-xl font-semibold">
            {basePrice === undefined ? t('listingPricing.notSet') : formatCurrency(basePrice, currency, i18n.language)}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setIsWeekendAdjustmentOpen(true)}
          aria-haspopup="dialog"
          className="flex min-h-24 w-full items-center justify-between gap-4 rounded-card border border-[var(--color-border)] px-6 py-5 text-left transition hover:bg-[var(--color-surface-muted)]"
        >
          <span className="text-[0.830466rem] font-medium">{t('listingPricing.weekendAdjustment')}</span>
          <span className="text-xl font-semibold">
            {formatNumber(weekendAdjustment / 100, i18n.language, { style: 'percent', signDisplay: 'always', maximumFractionDigits: 0 })}
          </span>
        </button>
      </div>

      {/* TODO(team): enable Smart Pricing once its shared contract and pricing behavior are agreed. */}
      <div className="mt-4 rounded-card border border-[var(--color-border)] px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 id="listing-smart-pricing-label" className="text-[0.830466rem] font-medium">{t('listingPricing.smartPricing')}</h3>
            <p id="listing-smart-pricing-description" className="mt-1 text-[0.830466rem] leading-snug text-[var(--color-text-secondary)]">
              {t('listingPricing.smartPricingDescription')}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={false}
            aria-labelledby="listing-smart-pricing-label"
            aria-describedby="listing-smart-pricing-description listing-smart-pricing-unavailable"
            disabled
            className="inline-flex min-h-11 min-w-11 shrink-0 cursor-not-allowed items-center justify-center opacity-60"
          >
            <span aria-hidden="true" className="inline-flex h-6 w-10 items-center rounded-full bg-[var(--color-text-secondary)] p-0.5">
              <span className="h-5 w-5 rounded-full bg-[var(--color-surface)]" />
            </span>
          </button>
        </div>
        <p id="listing-smart-pricing-unavailable" className="mt-3 text-xs text-[var(--color-text-secondary)]">{t('listingPricing.unavailable')}</p>
      </div>

      <button
        type="button"
        onClick={onOpenCalendar}
        className="mt-8 flex min-h-24 w-full items-start gap-3 rounded-card bg-[var(--color-surface-muted)] px-6 py-6 text-left text-[0.93427425rem] font-semibold leading-snug transition hover:brightness-95"
      >
        <ArrowUpRight className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <span>{t('listingPricing.calendar')}</span>
      </button>
      <ListingNightlyPriceSheet
        open={isNightlyPriceOpen}
        price={basePrice}
        currency={currency}
        onClose={() => setIsNightlyPriceOpen(false)}
        onSave={async (price) => {
          await onSavePrice(price);
          setIsNightlyPriceOpen(false);
        }}
      />
      <ListingWeekendAdjustmentSheet
        open={isWeekendAdjustmentOpen}
        adjustment={weekendAdjustment}
        basePrice={basePrice}
        currency={currency}
        onClose={() => setIsWeekendAdjustmentOpen(false)}
        onSave={async (adjustment) => {
          await onSaveWeekendAdjustment(adjustment);
          setIsWeekendAdjustmentOpen(false);
        }}
      />
    </section>
  );
}
