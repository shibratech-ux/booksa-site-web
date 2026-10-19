import { useEffect, useId, useRef, useState } from 'react';
import { CircleHelp, Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { listingWeekendAdjustmentSchema } from '@/domain/listing';
import { weekendNightlyPrice } from '@/domain/calendar';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { EditorBottomSheet } from './EditorBottomSheet';

export function ListingWeekendAdjustmentSheet({ open, adjustment, basePrice, currency, onClose, onSave }: {
  open: boolean;
  adjustment: number;
  basePrice?: number;
  currency: string;
  onClose: () => void;
  onSave: (adjustment: number) => Promise<void>;
}) {
  const { t, i18n } = useTranslation('dashboard');
  const inputId = useId();
  const helpId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const savingRef = useRef(false);
  const [value, setValue] = useState(String(adjustment));
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const parsed = listingWeekendAdjustmentSchema.safeParse(/^[+-]?\d+$/.test(value) ? Number(value) : NaN);
  const canSave = parsed.success && parsed.data !== adjustment && !isSaving;

  useEffect(() => {
    if (!open) return;
    setValue(String(adjustment));
    setSaveError(false);
    setShowHelp(false);
  }, [open, adjustment]);

  const changeValue = (next: string) => {
    setValue(next);
    setSaveError(false);
  };

  const save = async () => {
    if (!parsed.success || !canSave || savingRef.current) return;
    savingRef.current = true;
    setIsSaving(true);
    setSaveError(false);
    try {
      await onSave(parsed.data);
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
      heading={t('listingPricing.weekendAdjustment')}
      closeLabel={t('weekendAdjustmentSheet.close')}
      isSaving={isSaving}
      canSave={canSave}
      onClose={onClose}
      onSave={() => void save()}
      bodyClassName="flex flex-col pb-6 pt-4 sm:min-h-[400px]"
      headerAction={
        <button type="button" aria-label={t('weekendAdjustmentSheet.helpLabel')} aria-expanded={showHelp}
          aria-controls={showHelp ? helpId : undefined} onClick={() => setShowHelp(current => !current)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-[var(--color-surface-muted)]">
          <CircleHelp className="h-5 w-5" aria-hidden="true" />
        </button>
      }
    >
      {showHelp ? <p id={helpId} className="shrink-0 rounded-card bg-[var(--color-surface-muted)] p-4 text-sm leading-relaxed text-[var(--color-text-secondary)]">{t('weekendAdjustmentSheet.help')}</p> : null}
      <form onSubmit={(event) => { event.preventDefault(); void save(); }} className="flex flex-1 flex-col items-center justify-center py-10">
        <label htmlFor={inputId} className="sr-only">{t('weekendAdjustmentSheet.inputLabel')}</label>
        <div className="flex w-full items-center justify-center gap-2">
          <input ref={inputRef} id={inputId} type="text" inputMode="text" autoComplete="off"
            value={value} disabled={isSaving} aria-invalid={!parsed.success}
            aria-describedby={`${inputId}-note${!parsed.success ? ` ${inputId}-error` : ''}`}
            onChange={(event) => changeValue(event.target.value)} onFocus={(event) => event.target.select()}
            style={{ width: `${Math.max(1, Math.min(value.length, 4))}ch` }}
            className="min-w-0 max-w-full rounded-button border-0 bg-transparent py-1 text-center text-5xl font-bold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border)] disabled:opacity-60" />
          <span aria-hidden="true" className="text-4xl font-semibold">%</span>
          <button type="button" disabled={isSaving} aria-label={t('weekendAdjustmentSheet.edit')} onClick={() => inputRef.current?.focus()}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition hover:bg-[var(--color-surface-muted)] disabled:opacity-50">
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        {!parsed.success ? <p id={`${inputId}-error`} role="alert" className="mt-3 text-center text-sm text-[var(--color-danger)]">{t('weekendAdjustmentSheet.invalid')}</p> : null}
        <p id={`${inputId}-note`} className="mt-4 text-center text-sm text-[var(--color-text-secondary)]">{t('weekendAdjustmentSheet.note')}</p>
        <div className="mt-8 w-full max-w-sm">
          <label htmlFor={`${inputId}-slider`} className="sr-only">{t('weekendAdjustmentSheet.slider')}</label>
          <input id={`${inputId}-slider`} type="range" min={-99} max={99} step={1}
            value={parsed.success ? parsed.data : adjustment} disabled={isSaving}
            aria-valuetext={formatNumber((parsed.success ? parsed.data : adjustment) / 100, i18n.language, { style: 'percent', signDisplay: 'always' })}
            onChange={(event) => changeValue(event.target.value)}
            className="min-h-11 w-full cursor-pointer accent-[var(--color-text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60" />
          <div aria-hidden="true" className="flex justify-between text-xs text-[var(--color-text-secondary)]">
            {[-99, 0, 99].map(percent => (
              <span key={percent}>{formatNumber(percent / 100, i18n.language, { style: 'percent', signDisplay: 'exceptZero' })}</span>
            ))}
          </div>
        </div>
        <div className="mt-8 w-full rounded-card border border-[var(--color-border)] p-4 text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">{t('weekendAdjustmentSheet.preview')}</p>
          <p className="mt-2 text-2xl font-semibold">
            {parsed.success && basePrice !== undefined
              ? formatCurrency(weekendNightlyPrice(basePrice, parsed.data), currency, i18n.language)
              : t('listingPricing.notSet')}
          </p>
          <p className="mt-2 text-xs text-[var(--color-text-secondary)]">{t('nightlyPriceSheet.beforeFees')}</p>
        </div>
        {saveError ? <p role="alert" className="mt-4 text-center text-sm text-[var(--color-danger)]">{t('weekendAdjustmentSheet.saveError')}</p> : null}
      </form>
    </EditorBottomSheet>
  );
}
