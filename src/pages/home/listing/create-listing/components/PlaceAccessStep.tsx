import { useId } from 'react';
import { DoorOpen, House, UsersRound, UtensilsCrossed, type LucideIcon } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { ListingCategory, ListingCategoryOption } from '../listingCategories';

type AccessOption = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export const getAccessContent = (
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
  listingOption,
  value,
  everyBedroomHasLock,
  onBedroomLockChange,
  onChange
}: {
  category: ListingCategory;
  listingOption: ListingCategoryOption;
  value: string | null;
  everyBedroomHasLock: boolean | null;
  onBedroomLockChange: (hasLock: boolean) => void;
  onChange: (accessType: string) => void;
}) {
  const { t, i18n } = useTranslation('booking');
  const reduceMotion = useReducedMotion();
  const lockId = useId();
  const content = getAccessContent(category, listingOption.label);
  const propertyLabels = t('propertyTypeStep.options', { returnObjects: true });
  const propertyLabel = propertyLabels[listingOption.id as keyof typeof propertyLabels];
  const propertyType = propertyLabel.toLocaleLowerCase(i18n.resolvedLanguage ?? 'fr');
  const title = t(`placeAccessStep.titles.${category.id}`, { propertyType });
  const optionCopy = category.id === 'private-room'
    ? t('placeAccessStep.roomOptions', { returnObjects: true, propertyType })
    : t('placeAccessStep.options', { returnObjects: true, propertyType });

  return (
    <motion.section
      initial={{ opacity: 0, x: reduceMotion ? 0 : 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: reduceMotion ? 0 : -24 }}
      transition={{ duration: reduceMotion ? 0 : 0.25, ease: 'easeOut' }}
      className="min-h-0 flex-1 overflow-y-auto px-5 pb-8 pt-5 sm:px-10 sm:pb-10 sm:pt-8"
      aria-labelledby="place-access-title"
    >
      <div className="mx-auto w-full max-w-2xl">
        <h1
          id="place-access-title"
          className="max-w-xl text-2xl font-semibold leading-tight tracking-tight text-[var(--color-text-primary)] sm:text-4xl"
        >
          {title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
          {t('placeAccessStep.selection', {
            category: t(`propertyTypeStep.categories.${category.id}`),
            propertyType: propertyLabel
          })}
        </p>
        <div className="mt-6 space-y-3 sm:mt-8" role="group" aria-labelledby="place-access-title">
          {content.options.map(({ id, icon: Icon }) => {
            const selected = value === id;
            const copy = optionCopy[id as keyof typeof optionCopy];

            return (
              <button
                key={id}
                type="button"
                aria-pressed={selected}
                onClick={() => onChange(id)}
                className={`flex min-h-28 w-full items-center gap-4 rounded-card border px-4 py-5 text-left transition-colors hover:border-[var(--color-text-primary)] sm:min-h-28 sm:gap-5 sm:px-6 sm:py-5 ${
                  selected
                    ? 'border-[var(--color-text-primary)] bg-[var(--color-surface-muted)] ring-1 ring-[var(--color-text-primary)]'
                    : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-muted)]'
                }`}
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-semibold leading-snug text-[var(--color-text-primary)]">{copy.title}</span>
                  <span className="mt-1 block max-w-md text-sm leading-snug text-[var(--color-text-secondary)]">
                    {copy.description}
                  </span>
                </span>
                <Icon className="h-7 w-7 shrink-0 sm:h-8 sm:w-8" strokeWidth={1.5} aria-hidden="true" />
              </button>
            );
          })}
        </div>
        {value === 'private-room' || value === 'private-suite' ? (
          <fieldset className="mt-8" aria-describedby={`${lockId}-hint`}>
            <legend className="text-base font-semibold text-[var(--color-text-primary)]">
              {t('placeAccessStep.bedroomLock.question')}
            </legend>
            <p id={`${lockId}-hint`} className="mt-2 text-sm text-[var(--color-text-secondary)]">
              {t('placeAccessStep.bedroomLock.hint')}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {[true, false].map((answer) => (
                <label
                  key={String(answer)}
                  className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-button border px-4 py-3 text-sm text-[var(--color-text-primary)] ${
                    everyBedroomHasLock === answer
                      ? 'border-[var(--color-text-primary)] bg-[var(--color-surface-muted)]'
                      : 'border-[var(--color-border)]'
                  }`}
                >
                  <input
                    type="radio"
                    name={lockId}
                    checked={everyBedroomHasLock === answer}
                    onChange={() => onBedroomLockChange(answer)}
                    required
                    className="h-4 w-4 accent-[var(--color-text-primary)]"
                  />
                  {t(answer ? 'placeAccessStep.bedroomLock.yes' : 'placeAccessStep.bedroomLock.no')}
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}
      </div>
    </motion.section>
  );
}
