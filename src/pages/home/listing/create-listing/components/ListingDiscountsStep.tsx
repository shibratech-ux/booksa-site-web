import { useId, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '@/utils/formatters';
import type { ListingCategory } from '../listingCategories';

export type DiscountId = 'new-listing' | 'last-minute' | 'weekly' | 'monthly';

export const DEFAULT_SELECTED_DISCOUNT_IDS: DiscountId[] = [
  'new-listing',
  'last-minute',
  'weekly',
  'monthly'
];

export const discountOptions: Array<{
  id: DiscountId;
  percentage: number;
  title: string;
  description: string;
  fixedPercentage?: boolean;
}> = [
  {
    id: 'new-listing',
    percentage: 20,
    title: 'New listing promotion',
    description: 'Available until your listing has 3 reviews or gets booked 10 times',
    fixedPercentage: true
  },
  {
    id: 'last-minute',
    percentage: 16,
    title: 'Last-minute discount',
    description: 'For stays booked 14 days or less before arrival'
  },
  {
    id: 'weekly',
    percentage: 5,
    title: 'Weekly discount',
    description: 'For stays of 7 nights or more'
  },
  {
    id: 'monthly',
    percentage: 15,
    title: 'Monthly discount',
    description: 'For stays of 28 nights or more'
  }
];

export function ListingDiscountsStep({
  categoryId = 'hotel',
  selectedDiscountIds,
  onChange
}: {
  categoryId?: ListingCategory['id'];
  selectedDiscountIds: DiscountId[];
  onChange: (discountIds: DiscountId[]) => void;
}) {
  const { t } = useTranslation('booking');
  const idPrefix = useId();
  const reduceMotion = useReducedMotion();
  const [showHelp, setShowHelp] = useState(false);
  const isRestaurant = categoryId === 'restaurant';
  const visibleOptions = isRestaurant
    ? discountOptions.filter(({ id }) => id === 'new-listing' || id === 'last-minute')
    : discountOptions;
  const toggleDiscount = (discountId: DiscountId) => {
    onChange(
      selectedDiscountIds.includes(discountId)
        ? selectedDiscountIds.filter((currentId) => currentId !== discountId)
        : [...selectedDiscountIds, discountId]
    );
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: reduceMotion ? 0 : 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: reduceMotion ? 0 : -24 }}
      transition={{ duration: reduceMotion ? 0 : 0.35, ease: 'easeOut' }}
      aria-labelledby={`${idPrefix}-title`}
      className="flex min-h-0 flex-1 overflow-y-auto overscroll-contain"
    >
      <div className="mx-auto w-full max-w-[680px] px-5 pb-5 pt-5 sm:px-10 sm:py-8 lg:my-auto">
        <div className="mb-6">
          <h1 id={`${idPrefix}-title`} className="text-2xl font-semibold leading-tight tracking-tight sm:text-[32px]">{t('listingDiscountsStep.title')}</h1>
          <p className="mt-2 text-base leading-5 text-[var(--color-text-secondary)] sm:leading-6">
            {t(`listingDiscountsStep.subtitle.${categoryId}`)}
          </p>
        </div>

        <div className="grid gap-3.5" role="group" aria-labelledby={`${idPrefix}-title`}>
          {visibleOptions.map(({ id, percentage, fixedPercentage }) => {
            const selected = selectedDiscountIds.includes(id);
            const titleId = `${idPrefix}-${id}-title`;
            const percentageId = `${idPrefix}-${id}-percentage`;
            const descriptionId = `${idPrefix}-${id}-description`;

            return (
              <label key={id} className="relative block cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => toggleDiscount(id)}
                  aria-labelledby={titleId}
                  aria-describedby={`${percentageId} ${descriptionId}`}
                  className="peer sr-only"
                />
                <span className="grid min-h-[88px] grid-cols-[56px_minmax(0,1fr)_20px] items-center gap-4 rounded-card border border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] px-4 py-5 transition-colors hover:border-[var(--color-text-secondary)] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-[var(--color-text-primary)] peer-disabled:cursor-wait peer-disabled:opacity-50 sm:grid-cols-[64px_minmax(0,1fr)_20px] sm:px-6">
                  <span
                    id={percentageId}
                    className={`inline-flex min-h-10 w-full items-center justify-center whitespace-nowrap text-base font-semibold tabular-nums ${
                      fixedPercentage
                        ? ''
                        : 'rounded-button border border-[var(--color-text-secondary)] bg-[var(--color-surface)] px-2'
                    }`}
                  >
                    {formatNumber(percentage / 100, undefined, { style: 'percent', maximumFractionDigits: 0 })}
                  </span>
                  <span className="min-w-0">
                    <span id={titleId} className="block text-base font-medium leading-5">{t(`listingDiscountsStep.options.${id}.title`)}</span>
                    <span id={descriptionId} className="mt-1 block text-sm leading-[1.3] text-[var(--color-text-secondary)]">
                      {id === 'last-minute' && isRestaurant
                        ? t('listingDiscountsStep.restaurantLastMinute')
                        : t(`listingDiscountsStep.options.${id}.description`)}
                    </span>
                  </span>
                  <span
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-xs border transition-colors ${
                      selected
                        ? 'border-[var(--color-text-primary)] bg-[var(--color-text-primary)] text-[var(--color-surface)]'
                        : 'border-[var(--color-text-secondary)] bg-[var(--color-surface)]'
                    }`}
                    aria-hidden="true"
                  >
                    {selected ? <Check className="h-4 w-4" strokeWidth={1.5} /> : null}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
        <p className="mt-3 text-center text-xs leading-5 text-[var(--color-text-secondary)]">
          {t('listingDiscountsStep.note')}{' '}
          <button
            type="button"
            aria-expanded={showHelp}
            aria-controls={`${idPrefix}-help`}
            onClick={() => setShowHelp((current) => !current)}
            className="-my-2 inline-flex min-h-11 items-center rounded-button underline underline-offset-2 hover:text-[var(--color-text-primary)]"
          >
            {t('listingDiscountsStep.learnMore')}
          </button>
        </p>
        <p id={`${idPrefix}-help`} hidden={!showHelp} className="mt-3 rounded-card bg-[var(--color-surface-muted)] p-4 text-sm leading-6 text-[var(--color-text-secondary)]">
          {t(`listingDiscountsStep.help.${isRestaurant ? 'restaurant' : 'stays'}`)}
        </p>
      </div>
    </motion.section>
  );
}
