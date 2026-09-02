import { DoorOpen, House, UsersRound, UtensilsCrossed, type LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ListingCategory } from '../listingCategories';

type AccessOption = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

const getAccessContent = (
  category: ListingCategory,
  listingTypeLabel: string
): { title: string; context: string; options: AccessOption[] } => {
  const listingType = listingTypeLabel.toLocaleLowerCase();

  if (category.id === 'hotel') {
    return {
      title: `How will guests stay at this ${listingType}?`,
      context: `You selected ${listingTypeLabel} in the Hotel category. Choose how much of the property each booking includes.`,
      options: [
      {
        id: 'entire-place',
          title: `The entire ${listingType}`,
          description: `Guests reserve the whole ${listingType} and have it to themselves.`,
        icon: House
      },
      {
        id: 'private-room',
          title: 'A private room',
          description: `Guests have their own room in the ${listingType}, plus access to shared spaces.`,
        icon: DoorOpen
      },
      {
        id: 'shared-room',
          title: 'A shared room',
          description: `Guests share a sleeping room in the ${listingType}, with staff or a host available onsite.`,
        icon: UsersRound
      }
      ]
    };
  }

  if (category.id === 'restaurant') {
    return {
      title: `How will guests experience this ${listingType}?`,
      context: `You selected ${listingTypeLabel} in the Restaurant category. Choose the type of dining access guests can reserve.`,
      options: [
      {
        id: 'entire-venue',
        title: 'An entire venue',
          description: `Guests reserve the full ${listingType} for an exclusive dining experience.`,
        icon: House
      },
      {
        id: 'private-dining-area',
        title: 'A private dining area',
          description: `Guests have a dedicated room or section inside the ${listingType}.`,
        icon: DoorOpen
      },
      {
        id: 'shared-dining-area',
        title: 'A shared dining area',
          description: `Guests dine in the main ${listingType} space alongside other customers.`,
        icon: UtensilsCrossed
      }
      ]
    };
  }

  return {
    title: 'What type of private space will guests have?',
    context: `You selected ${listingTypeLabel}. Choose the privacy arrangement that best describes the guest experience.`,
    options: [
      {
        id: 'private-suite',
        title: 'A private suite',
        description: `Guests have a bedroom and additional private spaces within the ${listingType}.`,
        icon: House
      },
      {
        id: 'private-room',
        title: 'A private room',
        description: `Guests have their own bedroom in the ${listingType}, plus access to shared areas.`,
        icon: DoorOpen
      },
      {
        id: 'shared-room',
        title: 'A shared room',
        description: `Guests share the sleeping space in the ${listingType} with other people.`,
        icon: UsersRound
      }
    ]
  };
};

export function PlaceAccessStep({
  category,
  listingTypeLabel,
  value,
  onChange
}: {
  category: ListingCategory;
  listingTypeLabel: string;
  value: string | null;
  onChange: (accessType: string) => void;
}) {
  const content = getAccessContent(category, listingTypeLabel);

  return (
    <motion.section
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-10 sm:py-10"
      aria-labelledby="place-access-title"
    >
      <div className="mx-auto w-full max-w-[704px]">
        <h1
          id="place-access-title"
          className="text-[32.928px] font-semibold leading-tight tracking-tight text-[var(--color-text-primary)] sm:text-4xl"
        >
          {content.title}
        </h1>
        <p className="mt-2 max-w-[638px] text-sm leading-relaxed text-[var(--color-text-secondary)] sm:mt-3 sm:text-base">
          {content.context}
        </p>

        <div className="mt-8 space-y-3" role="group" aria-label={content.title}>
          {content.options.map(({ id, title, description, icon: Icon }) => {
            const selected = value === id;

            return (
              <button
                key={id}
                type="button"
                aria-pressed={selected}
                onClick={() => onChange(id)}
                className={`flex min-h-[96.8px] w-full items-center gap-4 rounded-md border bg-[var(--color-surface)] px-4 py-4 text-left transition hover:border-[var(--color-text-primary)] sm:min-h-[110px] sm:gap-5 sm:px-6 sm:py-5 ${
                  selected
                    ? 'border-[var(--color-text-primary)] ring-2 ring-[var(--color-text-primary)]'
                    : 'border-[var(--color-border)]'
                }`}
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-xl font-semibold text-[var(--color-text-primary)]">{title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-[var(--color-text-secondary)]">
                    {description}
                  </span>
                </span>
                <Icon className="h-8 w-8 shrink-0" strokeWidth={1.7} aria-hidden="true" />
              </button>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
