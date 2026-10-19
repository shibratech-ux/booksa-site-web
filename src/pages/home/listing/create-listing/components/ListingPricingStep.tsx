import { useId, useState } from 'react';
import { MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import type { ListingCategory } from '../listingCategories';
import { BasePriceDialog } from './BasePriceDialog';
import { WeekendAdjustmentDialog } from './WeekendAdjustmentDialog';

export const DEFAULT_LISTING_BASE_PRICE = 12500;

type ListingPricingStepProps = {
  category: ListingCategory;
  basePrice: number;
  weekendAdjustment: number;
  onBasePriceChange: (value: number) => void;
  onWeekendAdjustmentChange: (value: number) => void;
};

export function ListingPricingStep({
  category,
  basePrice,
  weekendAdjustment,
  onBasePriceChange,
  onWeekendAdjustmentChange
}: ListingPricingStepProps) {
  const [isBasePriceDialogOpen, setIsBasePriceDialogOpen] = useState(false);
  const [isWeekendDialogOpen, setIsWeekendDialogOpen] = useState(false);
  const { t, i18n } = useTranslation('dashboard');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const helpId = useId();
  const context = category.id === 'private-room' ? 'room' : category.id;
  const similarListingsLabel = t(`listingPricingStep.contexts.${context}.plural`);
  const adjustedPrice = Math.round(basePrice * (1 + weekendAdjustment / 100));

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="mx-auto flex min-h-0 w-full max-w-[560px] flex-1 flex-col justify-start overflow-y-auto px-8 pb-8 pt-12 sm:justify-center sm:px-10 sm:py-10"
    >
      <div className="mb-9 sm:mb-10">
        <h1 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
          {t('listingPricingStep.heading')}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)] sm:text-base">
          {t(`listingPricingStep.contexts.${context}.description`)}{' '}
          <button
            type="button"
            aria-expanded={isHelpOpen}
            aria-controls={helpId}
            onClick={() => setIsHelpOpen((current) => !current)}
            className="inline-flex min-h-11 items-center underline underline-offset-2"
          >
            {t('listingPricingStep.learnMore')}
          </button>
        </p>
        <p id={helpId} hidden={!isHelpOpen} className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
          {t(`listingPricingStep.contexts.${context}.help`)}
        </p>
      </div>

      <div className="grid gap-3">
        <button
          type="button"
          onClick={() => setIsBasePriceDialogOpen(true)}
          aria-haspopup="dialog"
          className="min-h-24 rounded-card border border-[var(--color-border)] px-5 py-3.5 text-left transition hover:border-[var(--color-text-primary)] focus-visible:border-[var(--color-text-primary)] sm:px-6"
        >
          <span className="block text-sm font-medium">{t('listingPricingStep.basePrice')}</span>
          <span className="mt-1 flex items-center text-3xl font-bold tracking-tight">
            {formatCurrency(basePrice, 'CDF', i18n.language)}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setIsWeekendDialogOpen(true)}
          aria-haspopup="dialog"
          className="grid min-h-24 grid-cols-[minmax(0,1fr)_auto] items-end gap-x-3 gap-y-1 rounded-card border border-[var(--color-border)] px-5 py-3.5 text-left transition hover:border-[var(--color-text-primary)] focus-visible:border-[var(--color-text-primary)] sm:gap-x-5 sm:px-6"
        >
          <span className="col-span-2 block text-sm font-medium">{t('listingPricingStep.weekendAdjustment')}</span>
          <span className="text-3xl font-bold tracking-tight">
            {weekendAdjustment > 0 ? '+' : ''}{formatNumber(weekendAdjustment, i18n.language)}%
          </span>
          <span className="max-w-44 pb-1 text-right text-xs leading-relaxed text-[var(--color-text-secondary)]">
            {t('listingPricingStep.weekendPrice', { price: formatCurrency(adjustedPrice, 'CDF', i18n.language) })}
          </span>
        </button>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={() => toast(t('listingPricingStep.similarUnavailable'))}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-xs font-medium shadow-sm transition hover:bg-[var(--color-surface-muted)] sm:text-sm"
        >
          <MapPin className="h-4 w-4 shrink-0 text-[var(--color-primary-500)]" aria-hidden="true" />
          {t(`listingPricingStep.contexts.${context}.similar`)}
        </button>
      </div>

      <BasePriceDialog
        open={isBasePriceDialogOpen}
        price={basePrice}
        similarListingsLabel={similarListingsLabel}
        onClose={() => setIsBasePriceDialogOpen(false)}
        onSave={onBasePriceChange}
      />
      <WeekendAdjustmentDialog
        open={isWeekendDialogOpen}
        basePrice={basePrice}
        adjustment={weekendAdjustment}
        similarListingsLabel={similarListingsLabel}
        onClose={() => setIsWeekendDialogOpen(false)}
        onSave={onWeekendAdjustmentChange}
      />
    </motion.section>
  );
}
