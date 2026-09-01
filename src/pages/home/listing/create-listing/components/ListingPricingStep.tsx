import { useState } from 'react';
import { motion } from 'framer-motion';
import type { ListingCategory } from '../listingCategories';
import { BasePriceDialog } from './BasePriceDialog';
import { WeekendAdjustmentDialog } from './WeekendAdjustmentDialog';

const priceFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
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
  const isRestaurant = category.id === 'restaurant';
  const adjustedPrice = Math.round(basePrice * (1 + weekendAdjustment / 100));

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="mx-auto flex min-h-0 w-full max-w-[660px] flex-1 flex-col justify-start overflow-y-auto px-5 py-6 sm:justify-center sm:px-10 sm:py-8"
    >
      <div className="mb-6 sm:mb-10">
        <h1 className="text-[28px] font-bold leading-tight tracking-tight sm:text-4xl">
          Now, set your prices
        </h1>
        <p className="mt-2 max-w-[620px] text-sm leading-snug text-[var(--color-text-secondary)] sm:text-lg">
          These suggestions are based on guest demand for similar {isRestaurant ? 'restaurants' : 'listings'}.{' '}
          <button type="button" className="font-medium underline underline-offset-2">
            Learn more
          </button>
        </p>
      </div>

      <div className="grid gap-3">
        <button
          type="button"
          onClick={() => setIsBasePriceDialogOpen(true)}
          aria-haspopup="dialog"
          className="min-h-[88px] rounded-[var(--radius-lg)] border border-[var(--color-border)] px-5 py-4 text-left transition hover:border-[var(--color-text-primary)] focus-visible:border-[var(--color-text-primary)] sm:px-6"
        >
          <span className="block text-sm font-medium">Base price</span>
          <span className="mt-1 flex items-center text-3xl font-bold tracking-tight">
            FC {priceFormatter.format(basePrice)}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setIsWeekendDialogOpen(true)}
          aria-haspopup="dialog"
          className="grid min-h-[100px] grid-cols-1 items-center gap-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] px-5 py-4 text-left transition hover:border-[var(--color-text-primary)] focus-visible:border-[var(--color-text-primary)] sm:grid-cols-[1fr_auto] sm:gap-5 sm:px-6"
        >
          <span>
            <span className="block text-sm font-medium">Weekend adjustment</span>
            <span className="mt-1 flex items-center text-3xl font-bold tracking-tight">
              {weekendAdjustment > 0 ? '+' : ''}{weekendAdjustment}%
            </span>
          </span>
          <span className="text-left text-xs text-[var(--color-text-secondary)] sm:text-right sm:text-sm">
            FC {priceFormatter.format(adjustedPrice)} for Fri and Sat
          </span>
        </button>
      </div>

      <BasePriceDialog
        open={isBasePriceDialogOpen}
        price={basePrice}
        similarListingsLabel={isRestaurant ? 'restaurants' : 'listings'}
        onClose={() => setIsBasePriceDialogOpen(false)}
        onSave={onBasePriceChange}
      />
      <WeekendAdjustmentDialog
        open={isWeekendDialogOpen}
        basePrice={basePrice}
        adjustment={weekendAdjustment}
        similarListingsLabel={isRestaurant ? 'restaurants' : 'listings'}
        onClose={() => setIsWeekendDialogOpen(false)}
        onSave={onWeekendAdjustmentChange}
      />
    </motion.section>
  );
}
