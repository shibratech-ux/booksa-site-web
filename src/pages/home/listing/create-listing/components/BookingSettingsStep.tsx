import { CalendarCheck, Zap, type LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ListingCategory } from '../listingCategories';

export type BookingSetting = 'review-first' | 'instant-book';

type BookingSettingsStepProps = {
  category: ListingCategory;
  listingTypeLabel: string;
  value: BookingSetting;
  onChange: (value: BookingSetting) => void;
};

type SettingOption = {
  id: BookingSetting;
  title: string;
  description: string;
  icon: LucideIcon;
  recommended?: boolean;
};

const getContent = (categoryId: string, listingTypeLabel: string) => {
  if (categoryId === 'restaurant') {
    return {
      title: 'Pick your reservation settings',
      subtitle: 'Choose how guests reserve your restaurant. You can change this at any time.',
      options: [
        {
          id: 'review-first' as const,
          title: 'Approve your first 5 reservations',
          description: `Review requests for your ${listingTypeLabel.toLowerCase()}, then switch to instant reservations.`,
          icon: CalendarCheck,
          recommended: true
        },
        {
          id: 'instant-book' as const,
          title: 'Use instant reservations',
          description: 'Let guests reserve automatically.',
          icon: Zap
        }
      ] satisfies SettingOption[]
    };
  }

  return {
    title: 'Pick your booking settings',
    subtitle: 'You can change this at any time.',
    options: [
      {
        id: 'review-first' as const,
        title: 'Approve your first 5 bookings',
        description:
          'Start by reviewing reservation requests, then switch to Instant Book, so guests can book automatically.',
        icon: CalendarCheck,
        recommended: true
      },
      {
        id: 'instant-book' as const,
        title: 'Use Instant Book',
        description: `Let guests book your ${listingTypeLabel.toLowerCase()} automatically.`,
        icon: Zap
      }
    ] satisfies SettingOption[]
  };
};

export function BookingSettingsStep({
  category,
  listingTypeLabel,
  value,
  onChange
}: BookingSettingsStepProps) {
  const content = getContent(category.id, listingTypeLabel);

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="mx-auto flex min-h-0 w-full max-w-[792px] flex-1 flex-col justify-start overflow-y-auto px-5 py-6 sm:justify-center sm:px-10 sm:py-10"
    >
      <div className="mb-10">
        <h1 className="text-[32.928px] font-semibold leading-tight tracking-tight sm:text-4xl">{content.title}</h1>
        <p className="mt-2 text-base text-[var(--color-text-secondary)] sm:text-lg">
          {content.subtitle}{' '}
          <button type="button" className="font-medium underline underline-offset-2">
            Learn more
          </button>
        </p>
      </div>

      <div className="grid gap-3" role="radiogroup" aria-label={content.title}>
        {content.options.map((option) => {
          const Icon = option.icon;
          const isSelected = value === option.id;

          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(option.id)}
              className={`grid min-h-[101.2px] grid-cols-[1fr_auto] items-center gap-3 rounded-md border bg-[var(--color-surface)] px-4 py-4 text-left transition hover:border-[var(--color-text-primary)] sm:min-h-[110px] sm:gap-6 sm:px-6 sm:py-5 ${
                isSelected
                  ? 'border-[var(--color-text-primary)] ring-1 ring-[var(--color-text-primary)]'
                  : 'border-[var(--color-border)]'
              }`}
            >
              <span>
                <span className="block text-lg font-semibold">{option.title}</span>
                {option.recommended ? (
                  <span className="mt-1 block text-sm font-medium text-green-600">Recommended</span>
                ) : null}
                <span className="mt-1 block max-w-[572px] text-sm leading-snug text-[var(--color-text-secondary)]">
                  {option.description}
                </span>
              </span>
              <Icon className="h-8 w-8 shrink-0 stroke-[1.6]" aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </motion.section>
  );
}
