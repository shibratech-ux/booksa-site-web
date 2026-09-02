import { AnimatePresence, motion } from 'framer-motion';
import { getListingCategory, listingCategories } from '../listingCategories';

export function PropertyTypeStep({
  categoryValue,
  optionValue,
  onCategoryChange,
  onOptionChange
}: {
  categoryValue: string | null;
  optionValue: string | null;
  onCategoryChange: (category: string) => void;
  onOptionChange: (option: string) => void;
}) {
  const selectedCategory = getListingCategory(categoryValue);

  return (
    <motion.section
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="min-h-0 flex-1 overflow-y-auto px-5 pb-8 pt-5 sm:px-10 sm:pb-10 sm:pt-4"
      aria-labelledby="property-type-title"
    >
      <div className="mx-auto w-full max-w-[704px]">
        <h1
          id="property-type-title"
          className="text-left text-[32.928px] font-semibold leading-tight tracking-tight text-[var(--color-text-primary)] sm:text-center sm:text-4xl"
        >
          Which of these best describes your place?
        </h1>
        <p className="mt-2 max-w-[572px] text-left text-sm leading-relaxed text-[var(--color-text-secondary)] sm:mx-auto sm:mt-3 sm:text-center sm:text-base">
          Choose a category and we’ll tailor the listing details to the experience you offer.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:mt-8 sm:gap-4 md:grid-cols-3" role="group" aria-label="Listing category">
          {listingCategories.map(({ id, label, shortDescription, icon: Icon, informationSections }) => {
            const selected = categoryValue === id;

            return (
              <button
                key={id}
                type="button"
                aria-pressed={selected}
                onClick={() => onCategoryChange(id)}
                className={`flex min-h-[145.2px] flex-col items-start rounded-md border bg-[var(--color-surface)] p-4 text-left transition hover:-translate-y-0.5 hover:border-[var(--color-text-primary)] hover:shadow-[var(--shadow-sm)] sm:min-h-[198px] sm:p-5 md:min-h-[242px] ${
                  selected
                    ? 'border-[var(--color-text-primary)] ring-2 ring-[var(--color-text-primary)]'
                    : 'border-[var(--color-border)]'
                }`}
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-sm bg-[var(--color-surface-muted)]">
                  <Icon className="h-6 w-6" strokeWidth={1.8} aria-hidden="true" />
                </span>
                <span className="mt-4 text-xl font-semibold text-[var(--color-text-primary)]">{label}</span>
                <span className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                  {shortDescription}
                </span>
                <span className="mt-4 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                  We’ll cover
                </span>
                <span className="mt-2 flex flex-wrap gap-1.5">
                  {informationSections.map(({ id: informationId, title }) => (
                    <span
                      key={informationId}
                      className="rounded-sm bg-[var(--color-surface-muted)] px-2 py-1 text-xs font-medium text-[var(--color-text-primary)]"
                    >
                      {title}
                    </span>
                  ))}
                </span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {selectedCategory ? (
            <motion.div
              key={selectedCategory.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="mt-12 border-t border-[var(--color-border)] pt-9"
            >
              <h2 className="text-2xl font-semibold leading-tight tracking-tight text-[var(--color-text-primary)] sm:text-3xl">
                {selectedCategory.optionsTitle}
              </h2>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                Select the option that most closely matches your listing.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3" role="group" aria-label={selectedCategory.optionsTitle}>
                {selectedCategory.options.map(({ id, label, icon: Icon }) => {
                  const selected = optionValue === id;

                  return (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => onOptionChange(id)}
                      className={`flex min-h-[105.6px] flex-col items-start justify-center rounded-md border bg-[var(--color-surface)] px-4 py-3 text-left transition hover:border-[var(--color-text-primary)] ${
                        selected
                          ? 'border-[var(--color-text-primary)] ring-2 ring-[var(--color-text-primary)]'
                          : 'border-[var(--color-border)]'
                      }`}
                    >
                      <Icon className="h-6 w-6" strokeWidth={1.8} aria-hidden="true" />
                      <span className="mt-2 text-base font-semibold text-[var(--color-text-primary)]">
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
