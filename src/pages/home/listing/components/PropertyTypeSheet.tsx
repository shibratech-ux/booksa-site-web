import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { ChevronDown, Minus, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  LOCK_REQUIRED_ACCESS,
  applyPropertyTypeChange,
  type PropertyTypeChange
} from '@/domain/listing';
import { getListingCategory } from '../create-listing/listingCategories';
import { getAccessContent } from '../create-listing/components/PlaceAccessStep';
import { EditorBottomSheet, editorSheetFieldClass } from './EditorBottomSheet';

const helperClass = 'mt-2 text-[0.6228495rem] leading-snug text-[var(--color-text-secondary)]';

function SheetSelect({
  label,
  value,
  disabled,
  helper,
  onChange,
  children
}: {
  label: string;
  value: string;
  disabled?: boolean;
  helper?: ReactNode;
  onChange?: (value: string) => void;
  children: ReactNode;
}) {
  const id = useId();

  return (
    <div>
      <label htmlFor={id} className={`${editorSheetFieldClass} relative ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
        <span className="absolute left-4 top-2 text-[0.6228495rem] text-[var(--color-text-secondary)]">{label}</span>
        <select
          id={id}
          value={value}
          disabled={disabled}
          aria-describedby={helper ? `${id}-helper` : undefined}
          onChange={(event) => onChange?.(event.target.value)}
          className="w-full appearance-none bg-transparent pr-8 outline-none disabled:cursor-not-allowed"
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2" aria-hidden="true" />
      </label>
      {helper ? <p id={`${id}-helper`} className={helperClass}>{helper}</p> : null}
    </div>
  );
}

// TODO(team): floors, year built and size have no Firestore field yet; enable once the shape is agreed with the Flutter app.
function DisabledStepper({ label }: { label: string }) {
  return (
    <div className="flex min-h-14 items-center justify-between gap-4 opacity-70" aria-disabled="true">
      <span className="text-[0.93427425rem] font-medium leading-snug">{label}</span>
      <span className="flex shrink-0 items-center gap-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text-secondary)]">
          <Minus className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="w-4 text-center text-[0.93427425rem]">1</span>
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text-secondary)]">
          <Plus className="h-4 w-4" aria-hidden="true" />
        </span>
      </span>
    </div>
  );
}

export function PropertyTypeSheet({
  open,
  flowDraft,
  onClose,
  onSave
}: {
  open: boolean;
  flowDraft: Record<string, unknown>;
  onClose: () => void;
  onSave: (change: PropertyTypeChange) => Promise<void>;
}) {
  const { t } = useTranslation('dashboard');
  const lockId = useId();
  const category = getListingCategory(typeof flowDraft.listingCategory === 'string' ? flowDraft.listingCategory : null);
  const saved: PropertyTypeChange = {
    listingOption: typeof flowDraft.listingOption === 'string' ? flowDraft.listingOption : '',
    placeAccess: typeof flowDraft.placeAccess === 'string' ? flowDraft.placeAccess : '',
    everyBedroomHasLock: typeof flowDraft.everyBedroomHasLock === 'boolean' ? flowDraft.everyBedroomHasLock : null
  };
  const [draft, setDraft] = useState(saved);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const isSavingRef = useRef(false);
  const selectedOption = category?.options.find((option) => option.id === draft.listingOption);
  const accessOptions = category ? getAccessContent(category, selectedOption?.label ?? '').options : [];
  const selectedAccess = accessOptions.find((option) => option.id === draft.placeAccess);
  const needsLockAnswer = LOCK_REQUIRED_ACCESS.includes(draft.placeAccess);
  const isChanged =
    draft.listingOption !== saved.listingOption ||
    draft.placeAccess !== saved.placeAccess ||
    draft.everyBedroomHasLock !== saved.everyBedroomHasLock;
  const validation = applyPropertyTypeChange(flowDraft, draft);
  const canSave = Boolean(category) && isChanged && validation.valid;

  useEffect(() => {
    if (!open) return;
    setDraft(saved);
    setSaveError(false);
    // Reset only when the sheet opens; `saved` is derived from flowDraft on every render.
  }, [open]);

  const save = async () => {
    if (!canSave || isSavingRef.current) return;
    isSavingRef.current = true;
    setIsSaving(true);
    setSaveError(false);
    try {
      await onSave(draft);
    } catch {
      setSaveError(true);
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  };

  return (
    <EditorBottomSheet
      open={open}
      heading={t('propertyTypeSheet.heading')}
      closeLabel={t('propertyTypeSheet.close')}
      isSaving={isSaving}
      canSave={canSave}
      onClose={onClose}
      onSave={() => void save()}
    >
      {category ? (
        <div className="grid gap-6">
          <SheetSelect
            label={t('propertyTypeSheet.category')}
            value={category.id}
            disabled
            helper={t('propertyTypeSheet.categoryLocked')}
          >
            <option value={category.id}>{category.label}</option>
          </SheetSelect>

          <SheetSelect
            label={t('propertyTypeSheet.propertyType')}
            value={draft.listingOption}
            disabled={isSaving}
            helper={category.shortDescription}
            onChange={(listingOption) => setDraft((current) => ({ ...current, listingOption }))}
          >
            {selectedOption ? null : <option value="" disabled>{t('propertyTypeSheet.choose')}</option>}
            {category.options.map((option) => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </SheetSelect>

          <SheetSelect
            label={t('propertyTypeSheet.listingType')}
            value={draft.placeAccess}
            disabled={isSaving}
            helper={selectedAccess?.description}
            onChange={(placeAccess) => setDraft((current) => ({ ...current, placeAccess }))}
          >
            {selectedAccess ? null : <option value="" disabled>{t('propertyTypeSheet.choose')}</option>}
            {accessOptions.map((option) => (
              <option key={option.id} value={option.id}>{option.title}</option>
            ))}
          </SheetSelect>

          {needsLockAnswer ? (
            <fieldset aria-describedby={draft.everyBedroomHasLock === null ? `${lockId}-hint` : undefined}>
              <legend className="text-[0.93427425rem] font-medium">{t('propertyTypeSheet.lockQuestion')}</legend>
              <div className="mt-3 flex gap-3">
                {[true, false].map((answer) => (
                  <label
                    key={String(answer)}
                    className={`inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-button border px-4 text-[0.830466rem] font-semibold transition ${
                      draft.everyBedroomHasLock === answer
                        ? 'border-[var(--color-text-primary)] ring-1 ring-[var(--color-text-primary)]'
                        : 'border-[var(--color-border)] hover:border-[var(--color-text-primary)]'
                    }`}
                  >
                    <input
                      type="radio"
                      name={lockId}
                      className="sr-only"
                      checked={draft.everyBedroomHasLock === answer}
                      disabled={isSaving}
                      onChange={() => setDraft((current) => ({ ...current, everyBedroomHasLock: answer }))}
                    />
                    {answer ? t('propertyTypeSheet.yes') : t('propertyTypeSheet.no')}
                  </label>
                ))}
              </div>
              {draft.everyBedroomHasLock === null ? (
                <p id={`${lockId}-hint`} className={helperClass}>{t('propertyTypeSheet.lockRequired')}</p>
              ) : null}
            </fieldset>
          ) : null}

          {isChanged && validation.errors.includes('listingBasics') ? (
            <p role="alert" className="text-[0.72665775rem] text-[var(--color-danger)]">
              {t('propertyTypeSheet.countersInvalid')}
            </p>
          ) : null}
          {saveError ? (
            <p role="alert" className="text-[0.72665775rem] text-[var(--color-danger)]">
              {t('propertyTypeSheet.saveError')}
            </p>
          ) : null}

          <section aria-labelledby={`${lockId}-details`} className="grid gap-4 border-t border-[var(--color-border-subtle)] pt-6">
            <p id={`${lockId}-details`} className="text-[0.6228495rem] font-semibold text-[var(--color-text-secondary)]">
              {t('propertyTypeSheet.detailsSoon')}
            </p>
            <DisabledStepper label={t('propertyTypeSheet.floorCount')} />
            <DisabledStepper label={t('propertyTypeSheet.listingFloor')} />
            <label className={`${editorSheetFieldClass} relative cursor-not-allowed opacity-70`}>
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[0.93427425rem] text-[var(--color-text-secondary)]">
                {t('propertyTypeSheet.yearBuilt')}
              </span>
              <input disabled readOnly value="" className="w-full bg-transparent outline-none" />
            </label>
            <div>
              <div className="grid grid-cols-2 overflow-hidden rounded-field border border-[var(--color-border)] opacity-70">
                <label className="relative block min-h-14 cursor-not-allowed border-r border-[var(--color-border)] px-4">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[0.93427425rem] text-[var(--color-text-secondary)]">
                    {t('propertyTypeSheet.propertySize')}
                  </span>
                  <input disabled readOnly value="" className="h-14 w-full bg-transparent outline-none" />
                </label>
                <label className="relative flex min-h-14 cursor-not-allowed items-center justify-between px-4 text-[0.93427425rem] text-[var(--color-text-secondary)]">
                  {t('propertyTypeSheet.unit')}
                  <ChevronDown className="h-5 w-5 text-[var(--color-text-primary)]" aria-hidden="true" />
                  <select disabled className="sr-only" aria-label={t('propertyTypeSheet.unit')} />
                </label>
              </div>
              <p className={helperClass}>{t('propertyTypeSheet.propertySizeHelper')}</p>
            </div>
          </section>
        </div>
      ) : (
        <p role="alert" className="text-[0.830466rem] text-[var(--color-text-secondary)]">
          {t('propertyTypeSheet.unknownCategory')}
        </p>
      )}
    </EditorBottomSheet>
  );
}
