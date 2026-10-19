import { useId, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ListingCategory } from '../listingCategories';

export type HostingType = 'individual' | 'business';
export type SafetyDetailId = 'exterior-camera' | 'noise-monitor' | 'weapons';

const safetyOptions: SafetyDetailId[] = ['exterior-camera', 'noise-monitor', 'weapons'];

export function ListingSafetyDetailsStep({
  categoryId = 'hotel',
  hostingType,
  selectedSafetyDetailIds,
  onHostingTypeChange,
  onSafetyDetailsChange
}: {
  categoryId?: ListingCategory['id'];
  hostingType: HostingType;
  selectedSafetyDetailIds: SafetyDetailId[];
  onHostingTypeChange: (hostingType: HostingType) => void;
  onSafetyDetailsChange: (detailIds: SafetyDetailId[]) => void;
}) {
  const { t } = useTranslation('dashboard');
  const helpId = useId();
  const hostingName = useId();
  const helpRef = useRef<HTMLParagraphElement>(null);
  const [showHelp, setShowHelp] = useState(false);
  const reduceMotion = useReducedMotion();
  const toggleSafetyDetail = (detailId: SafetyDetailId) => {
    onSafetyDetailsChange(
      selectedSafetyDetailIds.includes(detailId)
        ? selectedSafetyDetailIds.filter((currentId) => currentId !== detailId)
        : [...selectedSafetyDetailIds, detailId]
    );
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: reduceMotion ? 0 : 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: reduceMotion ? 0 : -24 }}
      transition={{ duration: reduceMotion ? 0 : 0.35, ease: 'easeOut' }}
      className="mx-auto flex min-h-0 w-full max-w-[640px] flex-1 flex-col overflow-y-auto overscroll-contain px-6 pb-8 pt-3 sm:px-10 sm:py-8"
    >
      <h1 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
        {t('listingSafetyStep.heading')}
      </h1>

      <fieldset className="mt-5 min-w-0">
        <legend className="flex max-w-full items-center gap-1 text-sm font-semibold sm:text-base">
          {t(`listingSafetyStep.prompts.${categoryId}`)}
          <button
            type="button"
            aria-label={t('listingSafetyStep.helpLabel')}
            aria-expanded={showHelp}
            aria-controls={helpId}
            onClick={() => {
              setShowHelp((current) => !current);
              if (!showHelp) window.requestAnimationFrame(() => helpRef.current?.scrollIntoView({ block: 'nearest' }));
            }}
            className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full hover:bg-[var(--color-surface-muted)]"
          >
            <Info className="h-4 w-4" aria-hidden="true" />
          </button>
        </legend>
        <p ref={helpRef} id={helpId} hidden={!showHelp} className="mb-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
          {t('listingSafetyStep.help')}
        </p>
        <div>
          {safetyOptions.map((id) => {
            const selected = selectedSafetyDetailIds.includes(id);
            return (
              <label key={id} className="flex min-h-11 cursor-pointer items-center justify-between gap-4 py-1 text-sm sm:text-base">
                <span>{t(`listingSafetyStep.options.${id}`)}</span>
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => toggleSafetyDetail(id)}
                  className="peer sr-only"
                />
                <span
                  className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-xs border transition peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-[var(--color-text-primary)] ${
                    selected
                      ? 'border-[var(--color-text-primary)] bg-[var(--color-text-primary)] text-[var(--color-surface)]'
                      : 'border-[var(--color-border)] bg-[var(--color-surface)]'
                  }`}
                  aria-hidden="true"
                >
                  {selected ? <Check className="h-4 w-4" /> : null}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-6 border-t border-[var(--color-border)] pt-6 text-sm leading-relaxed sm:text-base">
        <h2 className="font-semibold">{t('listingSafetyStep.important')}</h2>
        <p className="mt-2">{t('listingSafetyStep.cameras')}</p>
        <p className="mt-4">{t('listingSafetyStep.responsibilities')}</p>
      </div>

      <details className="mt-5 text-sm">
        <summary className="min-h-11 cursor-pointer content-center rounded-button font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-text-primary)]">
          {t('listingSafetyStep.hostingDetails')}
        </summary>
        <fieldset className="mt-2">
          <legend className="font-semibold">{t('listingSafetyStep.hostingQuestion')}</legend>
          {(['individual', 'business'] as const).map((value) => (
            <label key={value} className="flex min-h-11 cursor-pointer items-center gap-3 py-2">
              <input
                type="radio"
                name={hostingName}
                value={value}
                checked={hostingType === value}
                onChange={() => onHostingTypeChange(value)}
                className="h-5 w-5 shrink-0 accent-[var(--color-text-primary)]"
              />
              {t(`listingSafetyStep.hosting.${value}`)}
            </label>
          ))}
        </fieldset>
      </details>
    </motion.section>
  );
}
