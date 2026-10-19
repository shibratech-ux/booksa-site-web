import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { ListingCategory } from '../listingCategories';

const MAXIMUM_DESCRIPTION_LENGTH = 500;

const highlightPhrases: Record<string, string> = {
  peaceful: 'peaceful',
  unique: 'one-of-a-kind',
  'family-friendly': 'family-friendly',
  stylish: 'stylish',
  central: 'centrally located',
  spacious: 'spacious',
  'exceptional-service': 'known for thoughtful service',
  luxurious: 'luxurious',
  romantic: 'romantic',
  'great-coffee': 'a great destination for coffee lovers',
  'live-music': 'brought to life with live music',
  'chef-led': 'guided by a talented chef',
  private: 'private',
  cozy: 'cozy',
  'work-friendly': 'well suited for work and longer stays',
  'welcoming-host': 'hosted with warmth and care'
};

const joinPhrases = (phrases: string[]) => {
  if (phrases.length === 0) return '';
  if (phrases.length === 1) return phrases[0];
  return `${phrases[0]} and ${phrases[1]}`;
};

export function createListingDescription({
  category,
  listingTypeLabel,
  accessType,
  highlightIds
}: {
  category: ListingCategory;
  listingTypeLabel: string;
  accessType: string;
  highlightIds: string[];
}) {
  const listingType = listingTypeLabel.toLocaleLowerCase();
  const qualities = joinPhrases(
    highlightIds.map((highlightId) => highlightPhrases[highlightId]).filter(Boolean)
  );
  const qualityText = qualities ? `${qualities} ` : '';

  if (category.id === 'restaurant') {
    const serviceText =
      accessType === 'entire-venue'
        ? 'Reserve the entire venue for an exclusive occasion.'
        : accessType === 'private-dining-area'
          ? 'Enjoy a dedicated private dining area for your group.'
          : 'Join the atmosphere of the main dining room alongside other guests.';

    return `Discover a ${qualityText}dining experience at this ${listingType}. ${serviceText}`;
  }

  if (category.id === 'private-room') {
    const privacyText =
      accessType === 'private-suite'
        ? 'The complete suite gives guests extra comfort and privacy.'
        : accessType === 'shared-room'
          ? 'The sleeping space and shared areas create an easygoing social stay.'
          : 'Guests have their own room with access to the shared areas of the property.';

    return `Settle into this ${qualityText}${listingType}. ${privacyText}`;
  }

  const stayText =
    accessType === 'entire-place'
      ? 'Guests have the full property to themselves for a comfortable, memorable stay.'
      : accessType === 'shared-room'
        ? 'The managed shared-room setup offers a welcoming and practical stay.'
        : 'Guests enjoy a private room along with access to the property’s shared spaces.';

  return `Enjoy a ${qualityText}stay at this ${listingType}. ${stayText}`;
}

export function ListingDescriptionStep({
  category,
  value,
  onChange
}: {
  category: ListingCategory;
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation('booking');
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={{ opacity: 0, x: reduceMotion ? 0 : 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: reduceMotion ? 0 : -24 }}
      transition={{ duration: reduceMotion ? 0 : 0.25, ease: 'easeOut' }}
      className="min-h-0 flex-1 overflow-y-auto px-6 pb-8 pt-5 sm:px-10 sm:py-10"
      aria-labelledby="listing-description-heading"
    >
      <div className="mx-auto flex min-h-full w-full max-w-xl flex-col justify-start sm:justify-center sm:py-6">
        <h1
          id="listing-description-heading"
          className="text-2xl font-semibold leading-tight tracking-tight text-[var(--color-text-primary)] sm:text-3xl"
        >
          {t('listingDescriptionStep.title')}
        </h1>
        <p id="listing-description-hint" className="mt-3 text-base leading-6 text-[var(--color-text-secondary)]">
          {t(`listingDescriptionStep.subtitle.${category.id}`)}
        </p>

        <label htmlFor="listing-description" className="sr-only">
          {t('listingDescriptionStep.label')}
        </label>
        <textarea
          id="listing-description"
          value={value}
          maxLength={MAXIMUM_DESCRIPTION_LENGTH}
          onChange={(event) => onChange(event.target.value)}
          aria-describedby="listing-description-hint listing-description-count"
          className="mt-8 min-h-64 w-full resize-y rounded-field border border-[var(--color-text-secondary)] bg-[var(--color-surface)] p-5 text-base leading-7 text-[var(--color-text-primary)] outline-none transition-shadow focus:border-[var(--color-text-primary)] focus:ring-1 focus:ring-[var(--color-text-primary)] sm:min-h-72 sm:p-6 sm:text-lg"
        />
        <p
          id="listing-description-count"
          className="mt-3 text-xs font-semibold text-[var(--color-text-secondary)]"
          aria-live="polite"
        >
          {value.length}/{MAXIMUM_DESCRIPTION_LENGTH}
        </p>
      </div>
    </motion.section>
  );
}

export { MAXIMUM_DESCRIPTION_LENGTH };
