import { useId, useState } from 'react';
import { CalendarCheck } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { ListingCategory } from '../listingCategories';

export type BookingSetting = 'review-first' | 'instant-book';

type BookingSettingsStepProps = {
  category: ListingCategory;
  value: BookingSetting;
  onChange: (value: BookingSetting) => void;
};

const options = ['review-first', 'instant-book'] as const;

export function BookingSettingsStep({
  category,
  value,
  onChange
}: BookingSettingsStepProps) {
  const { t } = useTranslation('booking');
  const id = useId();
  const reduceMotion = useReducedMotion();
  const [showHelp, setShowHelp] = useState(false);
  const context = category.id === 'restaurant' ? 'restaurant' : category.id === 'private-room' ? 'room' : 'hotel';

  return (
    <motion.section
      initial={{ opacity: 0, y: reduceMotion ? 0 : 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: reduceMotion ? 0 : -24 }}
      transition={{ duration: reduceMotion ? 0 : 0.35, ease: 'easeOut' }}
      aria-labelledby={`${id}-title`}
      className="flex min-h-0 flex-1 overflow-y-auto overscroll-contain"
    >
      <div className="mx-auto w-full max-w-[680px] px-5 pb-10 pt-5 sm:px-10 sm:py-10 lg:my-auto">
        <h1 id={`${id}-title`} className="text-2xl font-semibold leading-tight tracking-tight sm:text-[32px]">
          {t(`bookingSettingsStep.${context}.title`)}
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)] sm:text-base">
          {t('bookingSettingsStep.subtitle')}{' '}
          <button
            type="button"
            aria-expanded={showHelp}
            aria-controls={`${id}-help`}
            onClick={() => setShowHelp((current) => !current)}
            className="-my-2 inline-flex min-h-11 items-center rounded-button font-medium underline underline-offset-2 hover:text-[var(--color-text-primary)]"
          >
            {t('bookingSettingsStep.learnMore')}
          </button>
        </p>
        <p id={`${id}-help`} hidden={!showHelp} className="mt-4 rounded-card bg-[var(--color-surface-muted)] p-4 text-sm leading-6 text-[var(--color-text-secondary)]">
          {t(`bookingSettingsStep.${context}.help`)}
        </p>

        <div className="mt-7 grid gap-3 sm:mt-8" role="radiogroup" aria-labelledby={`${id}-title`}>
          {options.map((option) => {
            const recommended = option === 'review-first';
            const descriptionId = `${id}-${option}-description`;

            return (
              <label key={option} className="relative block cursor-pointer">
                <input
                  type="radio"
                  name={`${id}-booking-setting`}
                  value={option}
                  checked={value === option}
                  onChange={() => onChange(option)}
                  aria-describedby={descriptionId}
                  className="peer sr-only"
                />
                <span className="grid min-h-20 grid-cols-[1fr_auto] items-start gap-5 rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-5 transition-colors hover:border-[var(--color-text-primary)] peer-checked:border-[var(--color-text-primary)] peer-checked:bg-[var(--color-surface-muted)] peer-checked:ring-1 peer-checked:ring-[var(--color-text-primary)] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-[var(--color-text-primary)] peer-disabled:cursor-wait peer-disabled:opacity-50 sm:px-6 sm:py-6">
                  <span>
                    <span className="block text-base font-semibold leading-6">{t(`bookingSettingsStep.${context}.${option}.title`)}</span>
                    {recommended ? (
                      <span className="mt-0.5 block text-sm font-medium leading-5 text-[var(--color-success)]">{t('bookingSettingsStep.recommended')}</span>
                    ) : null}
                    <span id={descriptionId} className="mt-1 block text-sm leading-5 text-[var(--color-text-secondary)]">
                      {t(`bookingSettingsStep.${context}.${option}.description`)}
                    </span>
                  </span>
                  {recommended ? <CalendarCheck className="mt-0.5 h-7 w-7 shrink-0" strokeWidth={1.5} aria-hidden="true" /> : null}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
