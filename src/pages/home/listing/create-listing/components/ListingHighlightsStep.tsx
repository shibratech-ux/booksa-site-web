import {
  Armchair,
  BedDouble,
  Briefcase,
  Building2,
  ChefHat,
  Check,
  Coffee,
  ConciergeBell,
  Crown,
  Heart,
  MapPin,
  Maximize,
  Moon,
  Music,
  ShieldCheck,
  Sparkles,
  Users,
  type LucideIcon
} from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { ListingCategory } from '../listingCategories';

const MAXIMUM_HIGHLIGHTS = 2;

type HighlightOption = {
  id: string;
  label: string;
  icon: LucideIcon;
};

type HighlightContent = {
  title: string;
  description: string;
  options: HighlightOption[];
};

const hotelHighlights: HighlightOption[] = [
  { id: 'peaceful', label: 'Peaceful', icon: Moon },
  { id: 'unique', label: 'Unique', icon: Sparkles },
  { id: 'family-friendly', label: 'Family-friendly', icon: Users },
  { id: 'stylish', label: 'Stylish', icon: Building2 },
  { id: 'central', label: 'Central', icon: MapPin },
  { id: 'spacious', label: 'Spacious', icon: Maximize },
  { id: 'exceptional-service', label: 'Great service', icon: ConciergeBell },
  { id: 'luxurious', label: 'Luxurious', icon: Crown }
];

const restaurantHighlights: HighlightOption[] = [
  { id: 'romantic', label: 'Romantic', icon: Heart },
  { id: 'unique', label: 'Unique', icon: Sparkles },
  { id: 'family-friendly', label: 'Family-friendly', icon: Users },
  { id: 'stylish', label: 'Stylish', icon: Armchair },
  { id: 'central', label: 'Central', icon: MapPin },
  { id: 'great-coffee', label: 'Great coffee', icon: Coffee },
  { id: 'live-music', label: 'Live music', icon: Music },
  { id: 'chef-led', label: 'Chef-led', icon: ChefHat }
];

const privateRoomHighlights: HighlightOption[] = [
  { id: 'private', label: 'Private', icon: ShieldCheck },
  { id: 'peaceful', label: 'Peaceful', icon: Moon },
  { id: 'cozy', label: 'Cozy', icon: BedDouble },
  { id: 'work-friendly', label: 'Work-friendly', icon: Briefcase },
  { id: 'central', label: 'Central', icon: MapPin },
  { id: 'spacious', label: 'Spacious', icon: Maximize },
  { id: 'stylish', label: 'Stylish', icon: Building2 },
  { id: 'welcoming-host', label: 'Welcoming host', icon: Users }
];

export const getHighlightContent = (
  category: ListingCategory,
  listingTypeLabel: string,
  accessType: string | null
): HighlightContent => {
  const listingType = listingTypeLabel.toLocaleLowerCase();

  if (category.id === 'restaurant') {
    const experience =
      accessType === 'entire-venue'
        ? 'exclusive venue booking'
        : accessType === 'private-dining-area'
          ? 'private dining experience'
          : 'guest dining experience';

    return {
      title: `What makes your ${listingType} worth a visit?`,
      description: `Choose up to 2 highlights that best capture the ${experience}. We’ll use them to start your description.`,
      options: restaurantHighlights
    };
  }

  if (category.id === 'private-room') {
    const privacyDescription =
      accessType === 'private-suite'
        ? 'the comfort and privacy of the complete suite'
        : accessType === 'shared-room'
          ? 'the atmosphere of the shared stay'
          : 'the comfort and character of the private room';

    return {
      title: `What makes your ${listingType} feel welcoming?`,
      description: `Choose up to 2 highlights that describe ${privacyDescription}. We’ll use them to start your description.`,
      options: privateRoomHighlights
    };
  }

  const stayDescription =
    accessType === 'entire-place'
      ? 'the complete property experience'
      : accessType === 'shared-room'
        ? 'the managed shared-room experience'
        : 'the guest room experience';

  return {
    title: `What makes your ${listingType} a great stay?`,
    description: `Choose up to 2 highlights that best describe ${stayDescription}. We’ll use them to start your description.`,
    options: hotelHighlights
  };
};

export function ListingHighlightsStep({
  category,
  listingTypeLabel,
  accessType,
  selectedHighlights,
  onChange
}: {
  category: ListingCategory;
  listingTypeLabel: string;
  accessType: string | null;
  selectedHighlights: string[];
  onChange: (highlightIds: string[]) => void;
}) {
  const { t, i18n } = useTranslation('booking');
  const reduceMotion = useReducedMotion();
  const content = getHighlightContent(category, listingTypeLabel, accessType);
  const option = category.options.find(option => option.label === listingTypeLabel);
  const listingType = t(`propertyTypeStep.options.${option?.id}`, { defaultValue: listingTypeLabel }).toLocaleLowerCase(i18n.language);
  const selectionLimitReached = selectedHighlights.length >= MAXIMUM_HIGHLIGHTS;

  const toggleHighlight = (highlightId: string) => {
    if (selectedHighlights.includes(highlightId)) {
      onChange(selectedHighlights.filter((selectedId) => selectedId !== highlightId));
      return;
    }

    if (!selectionLimitReached) onChange([...selectedHighlights, highlightId]);
  };

  return (
    <motion.section
      initial={{ opacity: 0, x: reduceMotion ? 0 : 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: reduceMotion ? 0 : -24 }}
      transition={{ duration: reduceMotion ? 0 : 0.25, ease: 'easeOut' }}
      className="min-h-0 flex-1 overflow-y-auto px-6 pb-8 pt-5 sm:px-10 sm:py-10"
      aria-labelledby="listing-highlights-heading"
    >
      <div className="mx-auto flex min-h-full w-full max-w-[704px] flex-col justify-start sm:justify-center sm:py-6">
        <h1
          id="listing-highlights-heading"
          className="text-2xl font-semibold leading-tight tracking-tight text-[var(--color-text-primary)] sm:text-4xl"
        >
          {t(`listingHighlightsStep.titles.${category.id}`, { listingType })}
        </h1>
        <p id="listing-highlights-hint" className="mt-3 max-w-xl text-base leading-relaxed text-[var(--color-text-secondary)] sm:text-lg">
          {t('listingHighlightsStep.subtitle', { maximum: MAXIMUM_HIGHLIGHTS })}
        </p>

        <div className="mt-7 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4" role="group" aria-labelledby="listing-highlights-heading" aria-describedby="listing-highlights-hint listing-highlights-count">
          {content.options.map(({ id, label, icon: Icon }) => {
            const selected = selectedHighlights.includes(id);
            const unavailable = selectionLimitReached && !selected;

            return (
              <button
                key={id}
                type="button"
                aria-pressed={selected}
                aria-disabled={unavailable}
                onClick={() => toggleHighlight(id)}
                className={`relative flex min-h-28 min-w-0 flex-col items-start justify-between gap-5 rounded-card border p-4 text-left text-[var(--color-text-primary)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-text-primary)] sm:min-h-32 sm:p-5 ${
                  selected
                    ? 'border-[var(--color-text-primary)] bg-[var(--color-surface-muted)] ring-1 ring-[var(--color-text-primary)]'
                    : unavailable
                      ? 'cursor-not-allowed border-[var(--color-border)] bg-[var(--color-surface)] opacity-50'
                      : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)]'
                }`}
              >
                <Icon className="h-7 w-7 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                {selected ? (
                  <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-text-primary)] text-[var(--color-surface)]">
                    <Check className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
                  </span>
                ) : null}
                <span className="break-words text-sm font-semibold leading-snug sm:text-base">{t(`listingHighlightsStep.options.${id}`, { defaultValue: label })}</span>
              </button>
            );
          })}
        </div>

        <div id="listing-highlights-count" className="mt-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm text-[var(--color-text-secondary)]" role="status" aria-live="polite" aria-atomic="true">
          <p className="font-medium text-[var(--color-text-primary)]">{t('listingHighlightsStep.selected', { count: selectedHighlights.length, maximum: MAXIMUM_HIGHLIGHTS })}</p>
          {selectionLimitReached ? <p>{t('listingHighlightsStep.limitHint')}</p> : null}
        </div>
      </div>
    </motion.section>
  );
}

export { MAXIMUM_HIGHLIGHTS };
