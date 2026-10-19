import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { EditorBottomSheet } from './EditorBottomSheet';

// TODO(design): sub-reason copy is a placeholder until the removal survey is designed.
const REMOVAL_REASONS = {
  noLongerAble: ['moving', 'situation', 'time', 'rules'],
  notReady: ['prepare', 'learn', 'later'],
  expectedMore: ['requests', 'tools', 'support'],
  moreMoney: ['earnings', 'fees', 'prices'],
  smoother: ['communication', 'houseRules', 'damage'],
  duplicate: ['mistake', 'otherListing']
} as const;
type ReasonId = keyof typeof REMOVAL_REASONS;
const REASON_IDS = Object.keys(REMOVAL_REASONS) as ReasonId[];

// Finalized listings can't be removed from the web, so Next only explains that.
// TODO(team): the reasons aren't stored anywhere yet.
export function ListingRemoveSheet({ open, onClose, onOpenListings }: {
  open: boolean;
  onClose: () => void;
  onOpenListings: () => void;
}) {
  const { t } = useTranslation('dashboard');
  const [step, setStep] = useState<'reasons' | 'unavailable'>('reasons');
  const [expanded, setExpanded] = useState<ReasonId[]>([]);
  const [checked, setChecked] = useState<string[]>([]);
  const unavailableMessageRef = useRef<HTMLParagraphElement>(null);
  const baseId = useId();

  useEffect(() => {
    if (!open) return;
    setStep('reasons');
    setExpanded([]);
    setChecked([]);
  }, [open]);

  useEffect(() => {
    if (step === 'unavailable') requestAnimationFrame(() => unavailableMessageRef.current?.focus());
  }, [step]);

  const toggleExpanded = (reason: ReasonId) =>
    setExpanded(current => current.includes(reason) ? current.filter(id => id !== reason) : [...current, reason]);
  const toggleChecked = (key: string) =>
    setChecked(current => current.includes(key) ? current.filter(id => id !== key) : [...current, key]);

  const isReasons = step === 'reasons';
  const heading = isReasons ? t('listingRemoveSheet.heading') : t('listingRemoveSheet.unavailableHeading');

  return (
    <EditorBottomSheet
      open={open}
      heading={heading}
      headingVisuallyHidden
      closeLabel={t('listingRemoveSheet.close')}
      isSaving={false}
      canSave={!isReasons || checked.length > 0}
      saveLabel={isReasons ? t('listingRemoveSheet.next') : t('listingPreferences.openListings')}
      onClose={onClose}
      onSave={() => (isReasons ? setStep('unavailable') : onOpenListings())}
      bodyClassName="pb-6 pt-2"
    >
      {isReasons ? (
        <>
          <p aria-hidden="true" className="text-[1.375rem] font-semibold leading-tight">{heading}</p>
          <p className="mt-1 text-base leading-6 text-[var(--color-text-secondary)]">{t('listingRemoveSheet.chooseAll')}</p>
          <ul className="mt-6">
            {REASON_IDS.map(reason => {
              const isOpen = expanded.includes(reason);
              const panelId = `${baseId}-${reason}`;
              const selectedCount = REMOVAL_REASONS[reason].filter(sub => checked.includes(`${reason}.${sub}`)).length;
              const optionLabels = t(`listingRemoveSheet.reasons.${reason}.options`, { returnObjects: true }) as Record<string, string>;
              return (
                <li key={reason}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggleExpanded(reason)}
                    className="flex min-h-[60px] w-full items-center justify-between gap-4 rounded-button py-3 text-left transition hover:bg-[var(--color-surface-muted)]"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-base leading-6">{t(`listingRemoveSheet.reasons.${reason}.label`)}</span>
                      {selectedCount > 0 ? (
                        <span className="block text-sm leading-5 text-[var(--color-text-secondary)]">{t('listingRemoveSheet.selected', { count: selectedCount })}</span>
                      ) : null}
                    </span>
                    <ChevronDown className={`h-5 w-5 shrink-0 text-[var(--color-text-secondary)] transition-transform motion-reduce:transition-none ${isOpen ? 'rotate-180' : ''}`} strokeWidth={1.5} aria-hidden="true" />
                  </button>
                  <fieldset id={panelId} hidden={!isOpen} className="pb-3 pl-1">
                    <legend className="sr-only">{t(`listingRemoveSheet.reasons.${reason}.label`)}</legend>
                    {REMOVAL_REASONS[reason].map(sub => {
                      const key = `${reason}.${sub}`;
                      return (
                        <label key={key} className="flex min-h-11 cursor-pointer items-center gap-3 text-sm leading-5">
                          <input
                            type="checkbox"
                            checked={checked.includes(key)}
                            onChange={() => toggleChecked(key)}
                            className="h-5 w-5 shrink-0 accent-[var(--color-text-primary)]"
                          />
                          <span>{optionLabels[sub]}</span>
                        </label>
                      );
                    })}
                  </fieldset>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <div>
          <p aria-hidden="true" className="text-[1.375rem] font-semibold leading-tight">{heading}</p>
          <p ref={unavailableMessageRef} tabIndex={-1} className="mt-3 text-base leading-6 text-[var(--color-text-secondary)] outline-none">{t('listingPreferences.rows.removeListing.help')}</p>
        </div>
      )}
    </EditorBottomSheet>
  );
}
