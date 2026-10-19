import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LISTING_DESCRIPTION_MAX_LENGTH, listingDescriptionSchema } from '@/domain/listing';
import { EditorBottomSheet } from './EditorBottomSheet';

export function ListingDescriptionSheet({ open, description, onClose, onSave }: {
  open: boolean;
  description: string;
  onClose: () => void;
  onSave: (description: string) => Promise<void>;
}) {
  const { t } = useTranslation('dashboard');
  const inputId = useId();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const savingRef = useRef(false);
  const [value, setValue] = useState(description);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const parsed = listingDescriptionSchema.safeParse(value);
  const canSave = parsed.success && parsed.data !== description.trim() && !isSaving;

  useEffect(() => {
    if (!open) return;
    setValue(description);
    setSaveError(false);
  }, [open, description]);

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
      heading={t('descriptionSection.listingDescription')}
      closeLabel={t('descriptionSheet.close')}
      isSaving={isSaving}
      canSave={canSave}
      onClose={onClose}
      onSave={() => void save()}
      initialFocusRef={inputRef}
    >
      <p id={`${inputId}-help`} className="mb-6 text-sm leading-relaxed text-[var(--color-text-secondary)]">
        {t('descriptionSheet.help')}
      </p>
      <label htmlFor={inputId} className="sr-only">{t('descriptionSection.listingDescription')}</label>
      <textarea
        ref={inputRef}
        id={inputId}
        rows={9}
        value={value}
        maxLength={LISTING_DESCRIPTION_MAX_LENGTH}
        disabled={isSaving}
        aria-invalid={!parsed.success}
        aria-describedby={`${inputId}-help ${inputId}-count${!parsed.success ? ` ${inputId}-error` : ''}`}
        onChange={(event) => { setValue(event.target.value); setSaveError(false); }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && (event.metaKey || event.ctrlKey) && !event.nativeEvent.isComposing) {
            event.preventDefault();
            void save();
          }
        }}
        className="block min-h-60 w-full resize-y rounded-field border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-base leading-relaxed text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-text-primary)] focus:ring-1 focus:ring-[var(--color-text-primary)] disabled:opacity-60"
      />
      <p id={`${inputId}-count`} className="mt-3 text-sm font-medium text-[var(--color-text-secondary)]">
        {t('descriptionSheet.counter', { count: value.length, max: LISTING_DESCRIPTION_MAX_LENGTH })}
      </p>
      {!parsed.success ? <p id={`${inputId}-error`} role="alert" className="mt-3 text-sm text-[var(--color-danger)]">{t('descriptionSheet.invalid')}</p> : null}
      {saveError ? <p role="alert" className="mt-4 text-sm text-[var(--color-danger)]">{t('descriptionSheet.saveError')}</p> : null}
    </EditorBottomSheet>
  );
}
