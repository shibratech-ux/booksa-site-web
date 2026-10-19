import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatTime } from '@/utils/formatters';
import { EditorBottomSheet } from './EditorBottomSheet';
import { EditorOptionList } from './EditorOptionList';

// Latest hour guests can book for a same-day check-in, 6 = 6:00 AM … 24 = midnight (end of day).
// TODO(team): move into src/domain (with tests) once availability has shared Firestore fields.
export const SAME_DAY_CUTOFF_HOURS = Array.from({ length: 19 }, (_, index) => index + 6);

export function formatCutoffHour(hour: number) {
  return formatTime(new Date(2000, 0, 1, hour % 24, 0));
}

export function ListingSameDayCutoffSheet({ open, hour, onClose, onSave }: {
  open: boolean;
  hour: number;
  onClose: () => void;
  onSave: (hour: number) => Promise<void> | void;
}) {
  const { t, i18n } = useTranslation('dashboard');
  const selectedRef = useRef<HTMLInputElement>(null);
  const savingRef = useRef(false);
  const [value, setValue] = useState(hour);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const canSave = !isSaving && value !== hour;
  // Recomputed per language so times follow the active locale (12 h vs 24 h).
  const options = SAME_DAY_CUTOFF_HOURS.map((option) => ({ value: option, label: formatCutoffHour(option) }));

  useEffect(() => {
    if (!open) return;
    setValue(hour);
    setSaveError(false);
  }, [open, hour]);

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
      variant="picker"
      heading={t('availabilitySection.sameDayNotice')}
      description={t('sameDayCutoffSheet.description')}
      closeLabel={t('sameDayCutoffSheet.close')}
      isSaving={isSaving}
      canSave={canSave}
      onClose={onClose}
      onSave={() => void save()}
      initialFocusRef={selectedRef}
      bodyClassName="border-t border-[var(--color-border-subtle)] px-0 py-2 sm:px-0"
    >
      <EditorOptionList
        key={i18n.language}
        legend={t('sameDayCutoffSheet.description')}
        options={options}
        value={value}
        onChange={(next) => { setValue(next); setSaveError(false); }}
        selectedRef={selectedRef}
        disabled={isSaving}
      />
      {saveError ? (
        <p role="alert" className="px-6 pt-3 text-sm text-[var(--color-danger)] sm:px-8">{t('sameDayCutoffSheet.saveError')}</p>
      ) : null}
    </EditorBottomSheet>
  );
}
