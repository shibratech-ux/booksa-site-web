import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export type DiscountId = 'new-listing' | 'last-minute' | 'weekly' | 'monthly';

export const DEFAULT_SELECTED_DISCOUNT_IDS: DiscountId[] = [
  'new-listing',
  'last-minute',
  'weekly',
  'monthly'
];

const discountOptions: Array<{
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
  selectedDiscountIds,
  onChange
}: {
  selectedDiscountIds: DiscountId[];
  onChange: (discountIds: DiscountId[]) => void;
}) {
  const toggleDiscount = (discountId: DiscountId) => {
    onChange(
      selectedDiscountIds.includes(discountId)
        ? selectedDiscountIds.filter((currentId) => currentId !== discountId)
        : [...selectedDiscountIds, discountId]
    );
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="mx-auto flex min-h-0 w-full max-w-[781px] flex-1 flex-col overflow-y-auto px-5 py-6 sm:px-10 sm:py-8"
    >
      <div className="mb-8">
        <h1 className="text-[32.928px] font-semibold leading-tight tracking-tight sm:text-4xl">Add discounts</h1>
        <p className="mt-2 text-base text-[var(--color-text-secondary)] sm:text-lg">
          Help your place stand out to get booked faster and earn your first reviews.
        </p>
      </div>

      <div className="grid gap-4">
        {discountOptions.map(({ id, percentage, title, description, fixedPercentage }) => {
          const selected = selectedDiscountIds.includes(id);

          return (
            <button
              key={id}
              type="button"
              role="checkbox"
              aria-checked={selected}
              onClick={() => toggleDiscount(id)}
              className="grid min-h-[105.6px] grid-cols-[48px_1fr_28px] items-center gap-3 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-4 text-left transition hover:border-[var(--color-text-primary)] sm:min-h-[118.8px] sm:grid-cols-[60px_1fr_32px] sm:gap-4 sm:px-6"
            >
              <span
                className={`inline-flex w-fit items-center justify-center text-base font-bold ${
                  fixedPercentage
                    ? ''
                    : 'min-w-[48.4px] rounded-sm border border-[var(--color-text-secondary)] px-2 py-2 sm:min-w-[66px] sm:px-3'
                }`}
              >
                {percentage}%
              </span>
              <span className="min-w-0">
                <span className="block text-base font-medium">{title}</span>
                <span className="mt-1 block text-sm leading-snug text-[var(--color-text-secondary)]">
                  {description}
                </span>
              </span>
              <span
                className={`inline-flex h-[24.2px] w-[24.2px] items-center justify-center rounded-sm border transition ${
                  selected
                    ? 'border-[var(--color-text-primary)] bg-[var(--color-text-primary)] text-[var(--color-surface)]'
                    : 'border-[var(--color-text-secondary)] bg-[var(--color-surface)]'
                }`}
                aria-hidden="true"
              >
                {selected ? <Check className="h-4 w-4" strokeWidth={3} /> : null}
              </span>
            </button>
          );
        })}
      </div>
    </motion.section>
  );
}
