import { motion } from 'framer-motion';

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
  const listingType = listingTypeLabel.toLocaleLowerCase();

  return (
    <motion.section
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-10 sm:py-10"
      aria-labelledby="listing-title-heading"
    >
      <div className="mx-auto flex min-h-full w-full max-w-[704px] flex-col justify-start py-2 sm:justify-center sm:py-6">
        <h1
          id="listing-title-heading"
          className="text-[32.928px] font-semibold leading-tight tracking-tight text-[var(--color-text-primary)] sm:text-4xl"
        >
          Now, let&apos;s give your {listingType} a title
        </h1>
        <p className="mt-2 text-base leading-relaxed text-[var(--color-text-secondary)] sm:text-lg">
          Short titles work best. Have fun with it—you can always change it later.
        </p>

        <label htmlFor="listing-title" className="sr-only">
          Listing title
        </label>
        <textarea
          id="listing-title"
          value={value}
          maxLength={MAXIMUM_TITLE_LENGTH}
          autoFocus
          onChange={(event) => onChange(event.target.value)}
          aria-describedby="listing-title-count"
          className="mt-6 min-h-[165px] w-full resize-none rounded-md border border-[var(--color-text-secondary)] bg-[var(--color-surface)] p-4 text-lg font-medium leading-relaxed text-[var(--color-text-primary)] outline-none transition placeholder:text-[var(--color-text-secondary)] focus:border-2 focus:border-[var(--color-text-primary)] sm:mt-8 sm:min-h-[204.6px] sm:p-5 sm:text-xl"
        />
        <p
          id="listing-title-count"
          className="mt-3 text-sm font-semibold text-[var(--color-text-secondary)]"
          aria-live="polite"
        >
          {value.length}/{MAXIMUM_TITLE_LENGTH}
        </p>
      </div>
    </motion.section>
  );
}

export { MAXIMUM_TITLE_LENGTH };
