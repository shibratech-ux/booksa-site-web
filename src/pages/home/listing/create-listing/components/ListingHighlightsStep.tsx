import {
  Armchair,
  BedDouble,
  Briefcase,
  Building2,
  ChefHat,
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
import { motion } from 'framer-motion';
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

const getAccessLabel = (categoryId: ListingCategory['id'], accessType: string | null) => {
  if (categoryId === 'restaurant') {
    if (accessType === 'entire-venue') return 'Entire venue';
    if (accessType === 'private-dining-area') return 'Private dining area';
    if (accessType === 'shared-dining-area') return 'Shared dining area';
    return 'Dining experience';
  }

  if (categoryId === 'private-room') {
    if (accessType === 'private-suite') return 'Private suite';
    if (accessType === 'shared-room') return 'Shared room';
    return 'Private room';
  }

  if (accessType === 'entire-place') return 'Entire property';
  if (accessType === 'private-room') return 'Private room';
  if (accessType === 'shared-room') return 'Shared room';
  return 'Guest stay';
};

const getHighlightContent = (
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
  const content = getHighlightContent(category, listingTypeLabel, accessType);
  const accessLabel = getAccessLabel(category.id, accessType);
  const selectionLimitReached = selectedHighlights.length >= MAXIMUM_HIGHLIGHTS;
  const CategoryIcon = category.icon;

  const toggleHighlight = (highlightId: string) => {
    if (selectedHighlights.includes(highlightId)) {
      onChange(selectedHighlights.filter((selectedId) => selectedId !== highlightId));
      return;
    }

    if (!selectionLimitReached) onChange([...selectedHighlights, highlightId]);
  };

  return (
    <motion.section
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-10 sm:py-10"
      aria-labelledby="listing-highlights-heading"
    >
      <div className="mx-auto flex min-h-full w-full max-w-[680px] flex-col justify-start py-2 sm:justify-center sm:py-6">
        <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full bg-[var(--color-surface-muted)] px-3 py-2 text-sm font-semibold text-[var(--color-text-secondary)]">
          <CategoryIcon className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
          <span>{category.label}</span>
          <span aria-hidden="true">·</span>
          <span>{listingTypeLabel}</span>
          <span aria-hidden="true">·</span>
          <span>{accessLabel}</span>
        </div>

        <h1
          id="listing-highlights-heading"
          className="text-[28px] font-semibold leading-tight tracking-tight text-[var(--color-text-primary)] sm:text-4xl"
        >
          {content.title}
        </h1>
        <p className="mt-2 max-w-[660px] text-base leading-relaxed text-[var(--color-text-secondary)] sm:text-lg">
          {content.description}
        </p>

        <div className="mt-8 flex flex-wrap gap-3" role="group" aria-label={`${category.label} highlights`}>
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
                className={`inline-flex min-h-12 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition sm:min-h-14 sm:gap-3 sm:px-5 sm:text-base ${
                  selected
                    ? 'border-[var(--color-text-primary)] bg-[var(--color-text-primary)] text-[var(--color-surface)] shadow-[var(--shadow-sm)]'
                    : unavailable
                      ? 'cursor-not-allowed border-[var(--color-border)] opacity-45'
                      : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:-translate-y-0.5 hover:border-[var(--color-text-primary)] hover:shadow-[var(--shadow-sm)]'
                }`}
              >
                <Icon className="h-6 w-6" strokeWidth={1.7} aria-hidden="true" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        <p className="mt-4 text-sm text-[var(--color-text-secondary)]" aria-live="polite">
          {selectedHighlights.length}/{MAXIMUM_HIGHLIGHTS} selected
          {selectionLimitReached ? ' — remove one to choose a different highlight' : ''}
        </p>
      </div>
    </motion.section>
  );
}

export { MAXIMUM_HIGHLIGHTS };
