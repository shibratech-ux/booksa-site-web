import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const MAXIMUM_TITLE_LENGTH = 50;

export function ListingTitleStep({
  listingTypeLabel,
  value,
  onChange
}: {
  listingTypeLabel: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const { t, i18n } = useTranslation('booking');
  const listingType = listingTypeLabel.toLocaleLowerCase(i18n.language);

  return (
    <motion.section
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-5 sm:px-10 sm:py-10"
      aria-labelledby="listing-title-heading"
    >
      <div className="mx-auto flex min-h-full w-full max-w-[704px] flex-col justify-start sm:justify-center sm:py-6">
        <h1
          id="listing-title-heading"
          className="text-2xl font-semibold leading-tight tracking-tight text-[var(--color-text-primary)] sm:text-4xl"
        >
          {t('listingTitleStep.title', { listingType })}
        </h1>
        <p id="listing-title-hint" className="mt-2 text-base leading-5 text-[var(--color-text-secondary)] sm:text-lg">
          {t('listingTitleStep.subtitle')}
        </p>

        <label htmlFor="listing-title" className="sr-only">
          {t('listingTitleStep.label')}
        </label>
        <textarea
          id="listing-title"
          value={value}
          maxLength={MAXIMUM_TITLE_LENGTH}
          onChange={(event) => onChange(event.target.value)}
          aria-describedby="listing-title-hint listing-title-count"
          className="mt-6 h-44 w-full resize-y rounded-field border border-[var(--color-text-secondary)] bg-[var(--color-surface)] p-6 text-lg font-normal leading-6 text-[var(--color-text-primary)] outline-none transition placeholder:text-[var(--color-text-secondary)] focus:border-2 focus:border-[var(--color-text-primary)] sm:mt-8 sm:h-52 sm:p-5 sm:text-xl"
        />
        <p
          id="listing-title-count"
          className="mt-4 text-xs font-semibold text-[var(--color-text-secondary)]"
          aria-live="polite"
        >
          {value.length}/{MAXIMUM_TITLE_LENGTH}
        </p>
      </div>
    </motion.section>
  );
}

export { MAXIMUM_TITLE_LENGTH };
