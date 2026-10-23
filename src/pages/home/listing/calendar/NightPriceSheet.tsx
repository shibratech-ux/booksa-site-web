import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { CircleHelp, Pencil, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/components/ui/Modal';
import { listingBasePriceSchema } from '@/domain/listing';
import { currencySymbol } from '@/utils/compactAmount';

type NightPriceSheetProps = {
  open: boolean;
  /** Short date for the header, e.g. "Oct 23". */
  dateLabel: string;
  /** Price currently shown for the night (custom price, or base price with weekend adjustment). */
  price: number;
  basePrice: number;
  /** Weekend adjustment (%) applied to this night, 0 when none. */
  weekendAdjustment: number;
  isCustom: boolean;
  currency: string;
  locale: string;
  formatPrice: (value: number) => string;
  onClose: () => void;
  onSave: (price: number) => void;
  onReset: () => void;
};

/**
 * Airbnb-style editor for one night's price: date header, large editable amount and a full-width Save,
 * on a dark sheet. Same 1–9,999,999 whole-unit bounds as the listing base price.
 */
export function NightPriceSheet({
  open,
  dateLabel,
  price,
  basePrice,
  weekendAdjustment,
  isCustom,
  currency,
  locale,
  formatPrice,
  onClose,
  onSave,
  onReset
}: NightPriceSheetProps) {
  const { t } = useTranslation('dashboard');
  const inputId = useId();
  const helpId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(String(price));
  const [showHelp, setShowHelp] = useState(false);
  const parsed = listingBasePriceSchema.safeParse(/^\d+$/.test(value) ? Number(value) : NaN);
  // The field shows the amount in the locale's currency format (grouping, symbol before or after);
  // `value` keeps the raw digits.
  const format = useMemo(() => {
    const grouping = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
    let symbolFirst = true;
    try {
      const parts = new Intl.NumberFormat(locale, { style: 'currency', currency, currencyDisplay: 'narrowSymbol' }).formatToParts(1);
      symbolFirst = parts.findIndex((part) => part.type === 'currency') < parts.findIndex((part) => part.type === 'integer');
    } catch {
      // Unknown currency code: keep the symbol first.
    }
    return { grouping, symbol: currencySymbol(currency, locale), symbolFirst };
  }, [currency, locale]);
  const displayValue = value ? format.grouping.format(Number(value)) : '';
  const canSave = parsed.success && parsed.data !== price;

  useEffect(() => {
    if (!open) return;
    setValue(String(price));
    setShowHelp(false);
  }, [open, price]);

  const save = () => {
    if (parsed.success && canSave) onSave(parsed.data);
  };

  const note = isCustom
    ? t('calendar.priceSheet.customNote', { price: formatPrice(basePrice) })
    : weekendAdjustment
      ? t('calendar.priceSheet.weekendNote', { percent: `${weekendAdjustment > 0 ? '+' : ''}${weekendAdjustment}%` })
      : t('calendar.priceSheet.baseNote');

  return (
    <Modal
      open={open}
      title={t('calendar.priceSheet.title', { date: dateLabel })}
      onClose={onClose}
      variant="bottom-sheet"
      sheetTone="inverse"
      headerAction={
        <div className="grid grid-cols-[44px_minmax(0,1fr)_44px] items-center">
          <button
            type="button"
            aria-label={t('calendar.priceSheet.help')}
            aria-expanded={showHelp}
            aria-controls={showHelp ? helpId : undefined}
            onClick={() => setShowHelp((current) => !current)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-[color-mix(in_srgb,var(--color-surface)_12%,transparent)]"
          >
            <CircleHelp className="h-5 w-5" aria-hidden="true" />
          </button>
          <p className="truncate text-center text-[15px] font-semibold">{dateLabel}</p>
          <button
            type="button"
            aria-label={t('calendar.priceSheet.close')}
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-[color-mix(in_srgb,var(--color-surface)_12%,transparent)]"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      }
    >
      <form
        onSubmit={(event) => { event.preventDefault(); save(); }}
        className="flex min-h-full flex-col"
      >
        {showHelp ? (
          <p id={helpId} className="rounded-card bg-[color-mix(in_srgb,var(--color-surface)_10%,transparent)] p-4 text-sm leading-relaxed opacity-80">
            {t('calendar.priceSheet.helpText')}
          </p>
        ) : null}

        <div className="flex flex-1 flex-col items-center justify-center py-12">
          <label htmlFor={inputId} className="sr-only">{t('calendar.priceSheet.inputLabel', { date: dateLabel })}</label>
          <div className="flex max-w-full items-center justify-center gap-2">
            {format.symbolFirst ? <span aria-hidden="true" className="text-3xl font-bold tracking-tight">{format.symbol}</span> : null}
            <input
              ref={inputRef}
              id={inputId}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={displayValue}
              aria-invalid={!parsed.success}
              aria-describedby={`${inputId}-note${parsed.success ? '' : ` ${inputId}-error`}`}
              onChange={(event) => setValue(event.target.value.replace(/\D/g, '').replace(/^0+/, '').slice(0, 7))}
              onFocus={(event) => event.target.select()}
              style={{ width: `${Math.max(1, displayValue.length)}ch` }}
              className="min-w-0 max-w-full border-0 bg-transparent py-1 text-center text-[56px] font-bold leading-none tracking-[-0.03em] text-inherit caret-current shadow-none outline-none"
            />
            {format.symbolFirst ? null : <span aria-hidden="true" className="text-3xl font-bold tracking-tight">{format.symbol}</span>}
            <button
              type="button"
              aria-label={t('calendar.priceSheet.edit')}
              onClick={() => inputRef.current?.focus()}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-surface)_18%,transparent)]">
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </button>
          </div>
          {!parsed.success ? (
            <p id={`${inputId}-error`} role="alert" className="mt-3 text-center text-sm">{t('calendar.priceSheet.invalid')}</p>
          ) : null}
          <p id={`${inputId}-note`} className="mt-4 text-center text-[13px]">{note}</p>
          {isCustom ? (
            <button type="button" onClick={onReset} className="mt-2 min-h-11 px-2 text-[13px] underline underline-offset-4">
              {t('calendar.priceSheet.reset')}
            </button>
          ) : null}
        </div>

        {/* TODO(team): guest total (fee rates live only in BasePriceDialog), last-minute discount and
            similar-listing ranges from the design need shared pricing data before they can be shown. */}
        <p className="mb-4 rounded-card bg-[color-mix(in_srgb,var(--color-surface)_10%,transparent)] px-4 py-3 text-center text-[13px] leading-relaxed opacity-80">
          {t('calendar.priceSheet.localOnly')}
        </p>
        <button
          type="submit"
          disabled={!canSave}
          className="min-h-12 w-full rounded-card bg-[var(--color-surface)] px-6 text-sm font-semibold text-[var(--color-text-primary)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[color-mix(in_srgb,var(--color-surface)_10%,transparent)] disabled:text-[color-mix(in_srgb,var(--color-surface)_40%,transparent)]"
        >
          {t('calendar.priceSheet.save')}
        </button>
      </form>
    </Modal>
  );
}
