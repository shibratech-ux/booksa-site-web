import { FiMinus, FiPlus } from 'react-icons/fi';
import { motion } from 'framer-motion';
import type { ListingCategory } from '../listingCategories';

export type ListingBasics = Record<string, number>;

type CounterDefinition = {
  id: string;
  label: string;
  minimum: number;
  maximum: number;
  initialValue: number;
};

const getCounterContent = (
  category: ListingCategory,
  listingTypeLabel: string,
  accessType: string
): { title: string; description: string; counters: CounterDefinition[] } => {
  const listingType = listingTypeLabel.toLocaleLowerCase();

  if (category.id === 'restaurant') {
    if (accessType === 'private-dining-area') {
      return {
        title: `Share some basics about your private ${listingType} area`,
        description: 'Add the capacity guests can reserve together. You’ll describe the menu and atmosphere later.',
        counters: [
          { id: 'guests', label: 'Private dining guests', minimum: 1, maximum: 100, initialValue: 8 },
          { id: 'tables', label: 'Dining tables', minimum: 1, maximum: 30, initialValue: 2 },
          { id: 'indoorSeats', label: 'Indoor seats', minimum: 0, maximum: 100, initialValue: 8 },
          { id: 'outdoorSeats', label: 'Outdoor seats', minimum: 0, maximum: 100, initialValue: 0 }
        ]
      };
    }

    if (accessType === 'shared-dining-area') {
      return {
        title: `Share some basics about reservations at your ${listingType}`,
        description: 'Set the capacity available for one booking while the venue remains open to other guests.',
        counters: [
          { id: 'guests', label: 'Guests per reservation', minimum: 1, maximum: 50, initialValue: 4 },
          { id: 'tables', label: 'Reservable tables', minimum: 1, maximum: 20, initialValue: 1 },
          { id: 'indoorSeats', label: 'Indoor reservable seats', minimum: 0, maximum: 100, initialValue: 4 },
          { id: 'outdoorSeats', label: 'Outdoor reservable seats', minimum: 0, maximum: 100, initialValue: 0 }
        ]
      };
    }

    return {
      title: `Share some basics about your ${listingType}`,
      description: 'Add the full venue capacity. You’ll provide cuisine, menus, service options, and hours later.',
      counters: [
        { id: 'guests', label: 'Total guest capacity', minimum: 1, maximum: 500, initialValue: 20 },
        { id: 'tables', label: 'Tables', minimum: 1, maximum: 100, initialValue: 5 },
        { id: 'indoorSeats', label: 'Indoor seats', minimum: 0, maximum: 500, initialValue: 20 },
        { id: 'outdoorSeats', label: 'Outdoor seats', minimum: 0, maximum: 500, initialValue: 0 }
      ]
    };
  }

  if (category.id === 'private-room') {
    if (accessType === 'shared-room') {
      return {
        title: `Share some basics about the shared space in your ${listingType}`,
        description: 'Tell guests how many people and sleeping arrangements share this room.',
        counters: [
          { id: 'guests', label: 'Guests', minimum: 1, maximum: 16, initialValue: 4 },
          { id: 'bedrooms', label: 'Shared bedrooms', minimum: 1, maximum: 10, initialValue: 1 },
          { id: 'beds', label: 'Beds', minimum: 1, maximum: 20, initialValue: 4 },
          { id: 'bathrooms', label: 'Shared bathrooms', minimum: 1, maximum: 10, initialValue: 1 }
        ]
      };
    }

    return {
      title: `Share some basics about your ${listingType}`,
      description:
        accessType === 'private-suite'
          ? 'Add the capacity of the complete private suite. You’ll describe its individual spaces later.'
          : 'Add the capacity of the private room. You’ll describe shared areas and amenities later.',
      counters: [
        { id: 'guests', label: 'Guests', minimum: 1, maximum: 16, initialValue: 2 },
        { id: 'bedrooms', label: accessType === 'private-suite' ? 'Private bedrooms' : 'Bedrooms', minimum: 1, maximum: 10, initialValue: 1 },
        { id: 'beds', label: 'Beds', minimum: 1, maximum: 20, initialValue: 1 },
        { id: 'bathrooms', label: accessType === 'private-suite' ? 'Private bathrooms' : 'Bathrooms', minimum: 1, maximum: 10, initialValue: 1 }
      ]
    };
  }

  if (accessType === 'shared-room') {
    return {
      title: `Share some basics about shared rooms in your ${listingType}`,
      description: 'Add the managed shared-room capacity. You’ll provide individual room types and amenities later.',
      counters: [
        { id: 'guests', label: 'Guests', minimum: 1, maximum: 100, initialValue: 4 },
        { id: 'bedrooms', label: 'Shared rooms', minimum: 1, maximum: 50, initialValue: 1 },
        { id: 'beds', label: 'Beds', minimum: 1, maximum: 100, initialValue: 4 },
        { id: 'bathrooms', label: 'Shared bathrooms', minimum: 1, maximum: 50, initialValue: 1 }
      ]
    };
  }

  return {
    title: `Share some basics about your ${listingType}`,
    description:
      accessType === 'entire-place'
        ? `Add the total capacity of the entire ${listingType}. You’ll add room types and amenities later.`
        : `Add the capacity of the private room guests can reserve in your ${listingType}.`,
    counters: [
      { id: 'guests', label: 'Guests', minimum: 1, maximum: 100, initialValue: accessType === 'private-room' ? 2 : 4 },
      { id: 'bedrooms', label: accessType === 'private-room' ? 'Guest rooms' : 'Bedrooms', minimum: 1, maximum: 50, initialValue: 1 },
      { id: 'beds', label: 'Beds', minimum: 1, maximum: 100, initialValue: 1 },
      { id: 'bathrooms', label: 'Bathrooms', minimum: 1, maximum: 50, initialValue: 1 }
    ]
  };
};

export function ListingBasicsStep({
  category,
  listingTypeLabel,
  accessType,
  values,
  onChange
}: {
  category: ListingCategory;
  listingTypeLabel: string;
  accessType: string;
  values: ListingBasics;
  onChange: (counterId: string, value: number) => void;
}) {
  const content = getCounterContent(category, listingTypeLabel, accessType);

  return (
    <motion.section
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-10 sm:py-10"
      aria-labelledby="listing-basics-title"
    >
      <div className="mx-auto w-full max-w-[704px]">
        <h1
          id="listing-basics-title"
          className="text-[32.928px] font-semibold leading-tight tracking-tight text-[var(--color-text-primary)] sm:text-4xl"
        >
          {content.title}
        </h1>
        <p className="mt-2 text-base leading-relaxed text-[var(--color-text-secondary)]">
          {content.description}
        </p>

        <div className="mt-9 divide-y divide-[var(--color-border)]">
          {content.counters.map(({ id, label, minimum, maximum, initialValue }) => {
            const value = values[id] ?? initialValue;

            return (
              <div key={id} className="flex min-h-[79.2px] items-center justify-between gap-3 py-3 sm:min-h-[90.2px] sm:gap-6 sm:py-4">
                <span className="text-lg font-medium text-[var(--color-text-primary)]">{label}</span>
                <div className="flex shrink-0 items-center gap-4">
                  <button
                    type="button"
                    onClick={() => onChange(id, Math.max(minimum, value - 1))}
                    disabled={value <= minimum}
                    aria-label={`Decrease ${label}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] transition hover:border-[var(--color-text-primary)] disabled:opacity-35"
                  >
                    <FiMinus className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <output className="w-7 text-center text-base font-medium" aria-label={`${label}: ${value}`}>
                    {value}
                  </output>
                  <button
                    type="button"
                    onClick={() => onChange(id, Math.min(maximum, value + 1))}
                    disabled={value >= maximum}
                    aria-label={`Increase ${label}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] transition hover:border-[var(--color-text-primary)] disabled:opacity-35"
                  >
                    <FiPlus className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
