import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, CircleHelp, Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { listingBasePriceSchema } from '@/domain/listing';
import { currencySymbol } from '@/utils/compactAmount';
import { formatCurrency } from '@/utils/formatters';
import { EditorBottomSheet } from './EditorBottomSheet';

export function ListingNightlyPriceSheet({ open, price, currency, onClose, onSave }: {
  open: boolean;
  price?: number;
  currency: string;
  onClose: () => void;
  onSave: (price: number) => Promise<void>;
}) {
  const { t, i18n } = useTranslation('dashboard');
  const inputId = useId();
  const helpId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const savingRef = useRef(false);
  const [value, setValue] = useState(String(price ?? ''));
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const parsed = listingBasePriceSchema.safeParse(/^\d+$/.test(value) ? Number(value) : NaN);
  const isValid = parsed.success;
  const canSave = isValid && parsed.data !== price && !isSaving;

  useEffect(() => {
    if (!open) return;
    setValue(String(price ?? ''));
    setSaveError(false);
    setShowHelp(false);
    setShowDetails(false);
  }, [open, price]);

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
      heading={t('nightlyPriceSheet.heading')}
      closeLabel={t('nightlyPriceSheet.close')}
      isSaving={isSaving}
      canSave={canSave}
      onClose={onClose}
      onSave={() => void save()}
      bodyClassName="flex flex-col pb-6 pt-4 sm:min-h-[400px]"
      headerAction={
        <button
          type="button"
          aria-label={t('nightlyPriceSheet.helpLabel')}
          aria-expanded={showHelp}
          aria-controls={showHelp ? helpId : undefined}
          onClick={() => setShowHelp(current => !current)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-[var(--color-surface-muted)]"
        >
          <CircleHelp className="h-5 w-5" aria-hidden="true" />
        </button>
      }
    >
      {showHelp ? (
        <p id={helpId} className="shrink-0 rounded-card bg-[var(--color-surface-muted)] p-4 text-sm leading-relaxed text-[var(--color-text-secondary)]">
          {t('nightlyPriceSheet.help')}
        </p>
      ) : null}

      <form onSubmit={(event) => { event.preventDefault(); void save(); }} className="flex flex-1 flex-col items-center justify-center py-10">
        <label htmlFor={inputId} className="sr-only">{t('nightlyPriceSheet.inputLabel', { currency })}</label>
        <div className="flex w-full items-center justify-center gap-2">
          <span aria-hidden="true" className="text-3xl font-semibold tracking-tight sm:text-4xl">{currencySymbol(currency)}</span>
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={value}
            disabled={isSaving}
            aria-invalid={!isValid}
            aria-describedby={`${inputId}-note${!isValid ? ` ${inputId}-error` : ''}`}
            onChange={(event) => { setValue(event.target.value); setSaveError(false); }}
            onFocus={(event) => event.target.select()}
            style={{ width: `${Math.max(1, Math.min(value.length, 7))}ch` }}
            className="min-w-0 max-w-full rounded-button border-0 bg-transparent py-1 text-center text-4xl font-bold tracking-tight text-[var(--color-text-primary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border)] disabled:opacity-60 sm:text-5xl"
          />
          <button
            type="button"
            disabled={isSaving}
            aria-label={t('nightlyPriceSheet.edit')}
            onClick={() => inputRef.current?.focus()}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition hover:bg-[var(--color-surface-muted)] disabled:opacity-50"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {!isValid ? (
          <p id={`${inputId}-error`} role="alert" className="mt-3 text-center text-sm text-[var(--color-danger)]">{t('nightlyPriceSheet.invalid')}</p>
        ) : null}
        <p id={`${inputId}-note`} className="mt-3 text-center text-sm text-[var(--color-text-secondary)]">{t('nightlyPriceSheet.beforeFees')}</p>
        <button
          type="button"
          aria-expanded={showDetails}
          aria-controls={showDetails ? `${inputId}-details` : undefined}
          onClick={() => setShowDetails(current => !current)}
          className="mt-1 inline-flex min-h-11 items-center gap-2 rounded-button px-2 text-sm"
        >
          {t('nightlyPriceSheet.details')}
          <ChevronDown aria-hidden="true" className={`h-4 w-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
        </button>
        {showDetails ? (
          <div id={`${inputId}-details`} className="mt-3 w-full rounded-card border border-[var(--color-border)] p-4 text-sm">
            <div className="flex flex-wrap justify-between gap-3 font-medium">
              <span>{t('listingPricing.perNight')}</span>
              <span>{parsed.success ? formatCurrency(parsed.data, currency, i18n.language) : '—'}</span>
            </div>
            <p className="mt-3 leading-relaxed text-[var(--color-text-secondary)]">{t('nightlyPriceSheet.feesNote')}</p>
          </div>
        ) : null}
        {saveError ? <p role="alert" className="mt-4 text-center text-sm text-[var(--color-danger)]">{t('nightlyPriceSheet.saveError')}</p> : null}
      </form>

      {/* TODO(team): enable comparisons when comparable listing data is available. */}
      <div className="shrink-0 text-center">
        <button type="button" disabled aria-describedby={`${inputId}-similar`} className="min-h-11 cursor-not-allowed rounded-full border border-[var(--color-border)] px-5 text-sm text-[var(--color-text-secondary)]">
          {t('nightlyPriceSheet.similar')}
        </button>
        <p id={`${inputId}-similar`} className="mt-2 text-xs text-[var(--color-text-secondary)]">{t('nightlyPriceSheet.similarUnavailable')}</p>
      </div>
    </EditorBottomSheet>
  );
}
