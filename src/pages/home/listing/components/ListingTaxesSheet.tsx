import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EditorBottomSheet } from './EditorBottomSheet';
import { formatCurrency } from '@/utils/formatters';
import { ListingAddTaxForm, emptyTaxPreview, isTaxPreviewValid, type TaxPreview, type TaxName, type TaxType } from './ListingAddTaxForm';

export function ListingTaxesSheet({ open, onClose }: {
  open: boolean;
  onClose: () => void;
}) {
  const { t, i18n } = useTranslation('dashboard');
  const [showHelp, setShowHelp] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [draft, setDraft] = useState<TaxPreview>(emptyTaxPreview);
  // Preview settings stay in this page only; shared tax fields require Flutter agreement.
  const [taxes, setTaxes] = useState<TaxPreview[]>([]);
  const helpId = useId();
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const finishAdding = () => {
    setIsAdding(false);
    requestAnimationFrame(() => addButtonRef.current?.focus());
  };

  useEffect(() => {
    if (!open) return;
    setShowHelp(false);
    setIsAdding(false);
  }, [open]);

  return (
    <EditorBottomSheet
      open={open}
      heading={t(isAdding ? 'listingTaxesSheet.add' : 'listingTaxesSheet.heading')}
      closeLabel={t(isAdding ? 'listingAddTax.close' : 'listingTaxesSheet.close')}
      isSaving={false}
      canSave={isAdding && isTaxPreviewValid(draft)}
      onClose={() => isAdding ? finishAdding() : onClose()}
      onSave={() => {
        if (!isAdding || !isTaxPreviewValid(draft)) return;
        setTaxes(current => [...current, { ...draft, registration: draft.registration.trim() }]);
        finishAdding();
      }}
      showFooter={isAdding}
      bodyClassName="pb-8 pt-5"
    >
      {isAdding ? <ListingAddTaxForm value={draft} onChange={setDraft} /> : (
        <>
          <p className="text-sm leading-snug text-[var(--color-text-secondary)]">
            {t('listingTaxesSheet.introduction')}
          </p>
          <section aria-labelledby={`${helpId}-heading`} className="mt-2 rounded-card border border-[var(--color-border)] px-5 py-4">
            <h3 id={`${helpId}-heading`} className="text-sm font-semibold">{t('listingTaxesSheet.cardTitle')}</h3>
            <p className="mt-1 text-xs leading-snug text-[var(--color-text-secondary)] sm:text-sm">
              {t('listingTaxesSheet.description')}
            </p>
            <button
              type="button"
              aria-expanded={showHelp}
              aria-controls={helpId}
              onClick={() => setShowHelp(current => !current)}
              className="inline-flex min-h-11 items-center rounded-button text-xs font-medium text-[var(--color-text-secondary)] underline underline-offset-2 sm:text-sm"
            >
              {t('listingTaxesSheet.learnMore')}
            </button>
            <p id={helpId} hidden={!showHelp} className="mb-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {t('listingTaxesSheet.help')}
            </p>
            <div className="mt-1">
              <button
                type="button"
                ref={addButtonRef}
                onClick={() => { setDraft(emptyTaxPreview()); setIsAdding(true); }}
                className="inline-flex min-h-11 items-center justify-center rounded-button bg-[var(--color-surface-muted)] px-4 text-xs font-semibold transition hover:brightness-95 sm:text-sm"
              >
                {t('listingTaxesSheet.add')}
              </button>
            </div>
          </section>
          {taxes.length ? (
            <section className="mt-6" aria-label={t('listingAddTax.savedHeading')}>
              <h3 className="text-sm font-semibold">{t('listingAddTax.savedHeading')}</h3>
              <p role="status" className="mt-2 text-xs leading-relaxed text-[var(--color-text-secondary)]">{t('listingAddTax.savedNote')}</p>
              <ul className="mt-3 divide-y divide-[var(--color-border)]">
                {taxes.map((tax, index) => (
                  <li key={index} className="py-4 text-sm">
                    <span className="block font-medium">{t(`listingAddTax.names.${tax.name as TaxName}`)}</span>
                    <span className="mt-1 block text-[var(--color-text-secondary)]">
                      {formatCurrency(Number(tax.amount), 'CDF', i18n.language)} · {t(`listingAddTax.types.${tax.type as TaxType}`)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      )}
    </EditorBottomSheet>
  );
}
