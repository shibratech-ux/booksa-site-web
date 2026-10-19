import { motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getListingCategory } from '../listingCategories';

const categoryOrder = ['hotel', 'private-room', 'restaurant'] as const;

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
  const { t } = useTranslation('booking');
  const reduceMotion = useReducedMotion();
  const optionLabels = t('propertyTypeStep.options', { returnObjects: true });

  return (
    <motion.section
      initial={{ opacity: 0, x: reduceMotion ? 0 : 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: reduceMotion ? 0 : 24 }}
      transition={{ duration: reduceMotion ? 0 : 0.25, ease: 'easeOut' }}
      className="min-h-0 flex-1 overflow-y-auto px-5 pb-8 pt-5 sm:px-10 sm:pb-10 sm:pt-8"
      aria-labelledby="property-type-title"
    >
      <div className="mx-auto w-full max-w-[704px]">
        <h1
          id="property-type-title"
          className="max-w-xl text-2xl font-semibold leading-tight tracking-tight text-[var(--color-text-primary)] sm:text-4xl"
        >
          {t('propertyTypeStep.title')}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)] sm:text-base">
          {t('propertyTypeStep.subtitle')}
        </p>

        <div className="mt-8 space-y-10 sm:mt-10 sm:space-y-12">
          {categoryOrder.map((categoryId) => {
            const category = getListingCategory(categoryId)!;

            return (
              <section key={category.id} aria-labelledby={`property-category-${category.id}`}>
                <h2
                  id={`property-category-${category.id}`}
                  className="mb-4 text-xl font-semibold text-[var(--color-text-primary)] sm:mb-5 sm:text-2xl"
                >
                  {t(`propertyTypeStep.categories.${category.id}`)}
                </h2>
                <div
                  className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4"
                  role="group"
                  aria-labelledby={`property-category-${category.id}`}
                >
                  {category.options.map(({ id, icon: Icon }) => {
                    const selected = categoryValue === category.id && optionValue === id;

                    return (
                      <button
                        key={`${category.id}-${id}`}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => {
                          if (categoryValue !== category.id) onCategoryChange(category.id);
                          onOptionChange(id);
                        }}
                        className={`relative flex min-h-28 min-w-0 flex-col items-start justify-between gap-4 rounded-card border p-4 text-left text-[var(--color-text-primary)] transition-colors sm:min-h-32 sm:p-5 ${
                          selected
                            ? 'border-[var(--color-text-primary)] bg-[var(--color-surface-muted)] ring-1 ring-[var(--color-text-primary)]'
                            : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)]'
                        }`}
                      >
                        <Icon className="h-7 w-7 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                        {selected ? (
                          <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-text-primary)] text-[var(--color-surface)]">
                            <Check className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
                          </span>
                        ) : null}
                        <span className="break-words text-sm font-semibold leading-snug sm:text-base">
                          {optionLabels[id as keyof typeof optionLabels]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
