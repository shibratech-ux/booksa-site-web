import { useEffect, useId, useRef, useState } from 'react';
import { Minus, Plus, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getListingGuestLimits, isValidListingGuestCount } from '@/domain/listing';
import { formatNumber } from '@/utils/formatters';
import { EditorBottomSheet } from './EditorBottomSheet';

export function ListingGuestCountSheet({ open, guests, flowDraft, onClose, onSave }: {
  open: boolean;
  guests: number;
  flowDraft: unknown;
  onClose: () => void;
  onSave: (guests: number) => Promise<void>;
}) {
  const { t, i18n } = useTranslation('dashboard');
  const promptId = useId();
  const [value, setValue] = useState(guests);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const savingRef = useRef(false);
  const limits = getListingGuestLimits(flowDraft);
  const canSave = !isSaving && value !== guests && isValidListingGuestCount(flowDraft, value);

  useEffect(() => {
    if (!open) return;
    setValue(guests);
    setSaveError(false);
  }, [open, guests]);

  const changeCount = (delta: number) => {
    if (!limits || savingRef.current) return;
    setValue(current => Math.min(limits.maximum, Math.max(limits.minimum, current + delta)));
    setSaveError(false);
  };

  const save = async () => {
    if (!canSave || savingRef.current) return;
    savingRef.current = true;
    setIsSaving(true);
    setSaveError(false);
    try {
      await onSave(value);
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
      heading={t('guestCountSheet.heading')}
      closeLabel={t('guestCountSheet.close')}
      isSaving={isSaving}
      canSave={canSave}
      onClose={onClose}
      onSave={() => void save()}
      compact
      bodyClassName="pb-6 pt-4"
    >
      <div className="flex flex-col items-center py-4 sm:py-6">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]">
          <Users className="h-6 w-6" aria-hidden="true" />
        </span>
        <p id={promptId} className="mt-6 max-w-60 text-center text-base leading-snug text-[var(--color-text-secondary)]">
          {t('guestCountSheet.prompt')}
        </p>
        <div role="group" aria-labelledby={promptId} className="mt-6 grid w-full grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-4">
          <button type="button" onClick={() => changeCount(-1)} disabled={isSaving || !limits || value <= limits.minimum}
            aria-label={t('guestCountSheet.decrease')}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-surface-muted)] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40">
            <Minus className="h-4 w-4" aria-hidden="true" />
          </button>
          <output aria-live="polite" aria-atomic="true" aria-label={t('guestCountSheet.heading')}
            className={`text-center font-semibold leading-none tracking-tight tabular-nums ${value >= 100 ? 'text-7xl' : 'text-8xl'}`}>
            {formatNumber(value, i18n.language)}
          </output>
          <button type="button" onClick={() => changeCount(1)} disabled={isSaving || !limits || value >= limits.maximum}
            aria-label={t('guestCountSheet.increase')}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-surface-muted)] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40">
            <Plus className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <p className="mt-5 text-center text-xs text-[var(--color-text-secondary)]">
          {limits ? t('guestCountSheet.limits', { min: formatNumber(limits.minimum, i18n.language), max: formatNumber(limits.maximum, i18n.language) }) : t('guestCountSheet.unavailable')}
        </p>
        {saveError ? <p role="alert" className="mt-4 text-center text-sm text-[var(--color-danger)]">{t('guestCountSheet.saveError')}</p> : null}
      </div>
    </EditorBottomSheet>
  );
}
