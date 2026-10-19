import { useEffect, useId, useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { EditorBottomSheet } from './EditorBottomSheet';

export type StayLengthField = 'minNights' | 'maxNights';

// TODO(team): move these bounds into src/domain (with tests) once availability has shared Firestore fields.
export const STAY_LENGTH_LIMIT = 365;

export function ListingStayLengthSheet({ open, field, minNights, maxNights, onClose, onSave }: {
  open: boolean;
  field: StayLengthField;
  minNights: number;
  maxNights: number;
  onClose: () => void;
  onSave: (nights: number) => Promise<void> | void;
}) {
  const { t } = useTranslation('dashboard');
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const savingRef = useRef(false);
  const current = field === 'minNights' ? minNights : maxNights;
  const lower = field === 'minNights' ? 1 : minNights;
  const upper = field === 'minNights' ? maxNights : STAY_LENGTH_LIMIT;
  const [value, setValue] = useState(String(current));
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const nights = /^\d+$/.test(value) ? Number(value) : NaN;
  const isValid = Number.isInteger(nights) && nights >= lower && nights <= upper;
  const canSave = isValid && nights !== current && !isSaving;

  useEffect(() => {
    if (!open) return;
    setValue(String(current));
    setSaveError(false);
  }, [open, current]);

  const save = async () => {
    if (!canSave || savingRef.current) return;
    savingRef.current = true;
    setIsSaving(true);
    setSaveError(false);
    try {
      await onSave(nights);
    } catch {
      setSaveError(true);
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  return (
    <EditorBottomSheet
      open={open}
      heading={t(`availabilitySheet.heading_${field}`)}
      closeLabel={t('availabilitySheet.close')}
      isSaving={isSaving}
      canSave={canSave}
      onClose={onClose}
      onSave={() => void save()}
      initialFocusRef={inputRef}
      bodyClassName="flex flex-col pb-6 pt-0 sm:min-h-[400px]"
    >
      <p className="shrink-0 text-center text-[0.830466rem] text-[var(--color-text-secondary)]">
        {t('availabilitySheet.perStay')}
      </p>

      <form
        onSubmit={(event) => { event.preventDefault(); void save(); }}
        className="flex flex-1 flex-col items-center justify-center py-12"
      >
        <label htmlFor={inputId} className="sr-only">{t(`availabilitySheet.heading_${field}`)}</label>
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          maxLength={3}
          value={value}
          disabled={isSaving}
          aria-invalid={!isValid}
          aria-describedby={!isValid ? `${inputId}-error` : undefined}
          onChange={(event) => { setValue(event.target.value.replace(/\D/g, '')); setSaveError(false); }}
          onFocus={(event) => event.target.select()}
          style={{ width: `${Math.max(1, value.length) + 1}ch` }}
          className="min-w-0 max-w-full rounded-button border-0 bg-transparent py-1 text-center text-5xl font-bold tracking-tight text-[var(--color-text-primary)] caret-[var(--color-text-primary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border)] disabled:opacity-60"
        />
        {!isValid ? (
          <p id={`${inputId}-error`} role="alert" className="mt-3 text-center text-sm text-[var(--color-danger)]">
            {t('availabilitySheet.invalid', { min: lower, max: upper })}
          </p>
        ) : null}
        {saveError ? (
          <p role="alert" className="mt-3 text-center text-sm text-[var(--color-danger)]">{t('availabilitySheet.saveError')}</p>
        ) : null}
      </form>

      {field === 'minNights' ? (
        <div className="shrink-0">
          {/* TODO(team): per-check-in-day minimums need their own screen and shared fields. */}
          <button
            type="button"
            disabled
            aria-describedby={`${inputId}-checkin-note`}
            className="flex min-h-16 w-full cursor-not-allowed items-center justify-between gap-3 rounded-card border border-[var(--color-border)] px-5 text-left text-[0.830466rem] font-medium"
          >
            {t('availabilitySheet.customizeByCheckIn')}
            <ChevronRight className="h-5 w-5 shrink-0" aria-hidden="true" />
          </button>
          <p id={`${inputId}-checkin-note`} className="mt-2 text-center text-xs text-[var(--color-text-secondary)]">
            {t('availabilitySheet.comingSoon')}
          </p>
        </div>
      ) : null}
    </EditorBottomSheet>
  );
}
