import { useEffect, useId, useRef, useState } from 'react';
import { Clock3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { EditorBottomSheet } from './EditorBottomSheet';

export function ListingDirectionsSheet({ open, directions, onClose, onSave }: {
  open: boolean;
  directions: string;
  onClose: () => void;
  onSave: (directions: string) => void;
}) {
  const { t } = useTranslation('dashboard');
  const inputId = useId();
  const [value, setValue] = useState(directions);
  const savingRef = useRef(false);
  const canSave = value.trim() !== directions.trim();

  useEffect(() => {
    if (!open) return;
    setValue(directions);
    savingRef.current = false;
  }, [open, directions]);

  return (
    <EditorBottomSheet
      open={open}
      compact
      heading={t('arrivalGuide.sections.directions')}
      closeLabel={t('directionsSheet.close')}
      isSaving={false}
      canSave={canSave}
      onClose={onClose}
      onSave={() => {
        if (!canSave || savingRef.current) return;
        savingRef.current = true;
        onSave(value.trim());
      }}
      bodyClassName="pb-5 pt-6"
    >
      <label htmlFor={inputId} className="sr-only">{t('arrivalGuide.sections.directions')}</label>
      <textarea
        id={inputId}
        rows={7}
        value={value}
        onChange={event => setValue(event.target.value)}
        aria-describedby={`${inputId}-visibility ${inputId}-local`}
        placeholder={t('directionsSheet.placeholder')}
        className="block min-h-48 w-full resize-none rounded-field border-0 bg-[var(--color-surface)] p-0 text-base leading-relaxed text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-secondary)] focus-visible:ring-2 focus-visible:ring-[var(--color-border)]"
      />
      <p id={`${inputId}-visibility`} className="mt-6 flex items-center gap-2 text-xs leading-5 text-[var(--color-text-secondary)]">
        <Clock3 className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
        {t('directionsSheet.visibility')}
      </p>
      <p id={`${inputId}-local`} className="mt-2 text-xs leading-5 text-[var(--color-text-secondary)]">{t('directionsSheet.localOnly')}</p>
    </EditorBottomSheet>
  );
}
