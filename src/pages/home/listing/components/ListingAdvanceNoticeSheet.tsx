import { useEffect, useId, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { EditorBottomSheet } from './EditorBottomSheet';
import { EditorOptionList } from './EditorOptionList';

// Days of notice before arrival; 0 = same day.
// TODO(team): move into src/domain (with tests) once availability has shared Firestore fields.
export const ADVANCE_NOTICE_OPTIONS = [0, 1, 2, 3, 7] as const;
export type AdvanceNoticeDays = (typeof ADVANCE_NOTICE_OPTIONS)[number];

export type AdvanceNoticeSetting = {
  days: AdvanceNoticeDays;
  allowShorterNoticeRequests: boolean;
};

export function useAdvanceNoticeLabel() {
  const { t } = useTranslation('dashboard');
  return (days: AdvanceNoticeDays) =>
    days === 0 ? t('availabilitySection.sameDay') : t('advanceNoticeSheet.days', { count: days });
}

export function ListingAdvanceNoticeSheet({ open, setting, onClose, onSave }: {
  open: boolean;
  setting: AdvanceNoticeSetting;
  onClose: () => void;
  onSave: (setting: AdvanceNoticeSetting) => Promise<void> | void;
}) {
  const { t } = useTranslation('dashboard');
  const labelFor = useAdvanceNoticeLabel();
  const switchLabelId = useId();
  const switchDescriptionId = useId();
  const selectedRef = useRef<HTMLInputElement>(null);
  const savingRef = useRef(false);
  const [days, setDays] = useState<AdvanceNoticeDays>(setting.days);
  const [allowRequests, setAllowRequests] = useState(setting.allowShorterNoticeRequests);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const canSave =
    !isSaving && (days !== setting.days || allowRequests !== setting.allowShorterNoticeRequests);

  useEffect(() => {
    if (!open) return;
    setDays(setting.days);
    setAllowRequests(setting.allowShorterNoticeRequests);
    setSaveError(false);
  }, [open, setting.days, setting.allowShorterNoticeRequests]);

  const save = async () => {
    if (!canSave || savingRef.current) return;
    savingRef.current = true;
    setIsSaving(true);
    setSaveError(false);
    try {
      await onSave({ days, allowShorterNoticeRequests: allowRequests });
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
      heading={t('availabilitySection.advanceNotice')}
      description={t('advanceNoticeSheet.description')}
      closeLabel={t('advanceNoticeSheet.close')}
      isSaving={isSaving}
      canSave={canSave}
      onClose={onClose}
      onSave={() => void save()}
      initialFocusRef={selectedRef}
      bodyClassName="px-0 pb-2 pt-0 sm:px-0"
    >
      <EditorOptionList
        legend={t('advanceNoticeSheet.description')}
        options={ADVANCE_NOTICE_OPTIONS.map((option) => ({ value: option, label: labelFor(option) }))}
        value={days}
        onChange={(next) => { setDays(next); setSaveError(false); }}
        selectedRef={selectedRef}
        disabled={isSaving}
      />

      <div className="mt-2 flex items-start justify-between gap-4 border-t border-[var(--color-border-subtle)] px-6 pb-2 pt-5 sm:px-8">
        <div className="min-w-0">
          <p id={switchLabelId} className="text-[0.830466rem] font-medium leading-snug">{t('advanceNoticeSheet.allowRequests')}</p>
          <p id={switchDescriptionId} className="mt-1 text-[0.830466rem] leading-snug text-[var(--color-text-secondary)]">
            {t('advanceNoticeSheet.allowRequestsDescription')}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={allowRequests}
          aria-labelledby={switchLabelId}
          aria-describedby={switchDescriptionId}
          disabled={isSaving}
          onClick={() => { setAllowRequests((current) => !current); setSaveError(false); }}
          className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center disabled:opacity-60"
        >
          <span
            aria-hidden="true"
            className={`inline-flex h-8 w-12 items-center rounded-full p-1 transition-colors ${
              allowRequests ? 'bg-[var(--color-text-primary)]' : 'bg-[var(--color-border)]'
            }`}
          >
            <span
              className={`inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-text-primary)] transition-transform ${
                allowRequests ? 'translate-x-4' : 'translate-x-0'
              }`}
            >
              {allowRequests ? <Check className="h-3.5 w-3.5" /> : null}
            </span>
          </span>
        </button>
      </div>

      {saveError ? (
        <p role="alert" className="px-6 pt-3 text-sm text-[var(--color-danger)] sm:px-8">{t('advanceNoticeSheet.saveError')}</p>
      ) : null}
    </EditorBottomSheet>
  );
}
