import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LISTING_TITLE_MAX_LENGTH } from '@/domain/listing';
import { EditorBottomSheet, editorSheetFieldClass } from './EditorBottomSheet';

export function ListingTitleSheet({
  open,
  title,
  onClose,
  onSave
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  onSave: (title: string) => Promise<void>;
}) {
  const { t } = useTranslation('dashboard');
  const primaryId = useId();
  const secondaryId = useId();
  const tipId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(title);
  const [isSaving, setIsSaving] = useState(false);
  const [isTipOpen, setIsTipOpen] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const isSavingRef = useRef(false);
  const trimmedValue = value.trim();
  const canSave = !isSaving && trimmedValue.length > 0 && trimmedValue.length <= LISTING_TITLE_MAX_LENGTH && trimmedValue !== title.trim();

  useEffect(() => {
    if (!open) return;
    setValue(title);
    setIsTipOpen(false);
    setSaveError(false);
  }, [open, title]);

  const save = async () => {
    if (!canSave || isSavingRef.current) return;
    isSavingRef.current = true;
    setIsSaving(true);
    setSaveError(false);
    try {
      await onSave(trimmedValue);
    } catch {
      setSaveError(true);
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  };

  return (
    <EditorBottomSheet
      open={open}
      heading={t('titleSheet.heading')}
      closeLabel={t('titleSheet.close')}
      isSaving={isSaving}
      canSave={canSave}
      onClose={onClose}
      onSave={() => void save()}
      initialFocusRef={inputRef}
      overlay={
        <div className="pointer-events-none absolute bottom-[calc(88px+env(safe-area-inset-bottom))] right-5 flex max-w-[calc(100%-40px)] flex-col items-end gap-3 sm:right-6">
          <AnimatePresence>
            {isTipOpen ? (
              <motion.p
                id={tipId}
                role="status"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="max-w-xs rounded-card bg-[var(--color-surface)] px-4 py-3 text-[0.72665775rem] leading-snug text-[var(--color-text-secondary)] shadow-[var(--shadow-md)] dark:border dark:border-[var(--color-border)]"
              >
                {t('titleSheet.tip')}
              </motion.p>
            ) : null}
          </AnimatePresence>
          <button
            type="button"
            onClick={() => setIsTipOpen((current) => !current)}
            aria-label={t('titleSheet.tipsLabel')}
            aria-expanded={isTipOpen}
            aria-controls={isTipOpen ? tipId : undefined}
            className="pointer-events-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface-muted)] text-[var(--color-warning)] transition hover:brightness-95"
          >
            <Lightbulb className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      }
    >
      <label htmlFor={primaryId} className={`${editorSheetFieldClass} relative cursor-text`}>
        <span className="absolute left-4 top-2 text-[0.6228495rem] text-[var(--color-text-secondary)]">
          {t('titleSheet.primaryLanguage')}
        </span>
        <input
          ref={inputRef}
          id={primaryId}
          value={value}
          maxLength={LISTING_TITLE_MAX_LENGTH}
          disabled={isSaving}
          aria-invalid={trimmedValue.length === 0}
          aria-describedby={`${primaryId}-count`}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              void save();
            }
          }}
          className="w-full bg-transparent outline-none disabled:opacity-70"
        />
      </label>
      <p id={`${primaryId}-count`} className="mt-3 text-[0.6228495rem] font-semibold text-[var(--color-text-secondary)]">
        {t('titleSheet.counter', { count: value.length, max: LISTING_TITLE_MAX_LENGTH })}
        {trimmedValue.length === 0 ? <span className="ml-2 font-normal text-[var(--color-danger)]">{t('titleSheet.required')}</span> : null}
      </p>
      {saveError ? (
        <p role="alert" className="mt-4 text-sm text-[var(--color-danger)]">
          {t('titleSaveError')}
        </p>
      ) : null}

      {/* TODO(team): no Firestore field stores translated titles yet; enable once the shape is agreed with the Flutter app. */}
      <label htmlFor={secondaryId} className={`${editorSheetFieldClass} relative mt-10 cursor-not-allowed opacity-70`}>
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[0.93427425rem] text-[var(--color-text-secondary)]">
          {t('titleSheet.secondaryLanguage')}
        </span>
        <input
          id={secondaryId}
          value=""
          disabled
          readOnly
          aria-describedby={`${secondaryId}-count`}
          className="w-full bg-transparent outline-none"
        />
      </label>
      <p id={`${secondaryId}-count`} className="mt-3 text-[0.6228495rem] font-semibold text-[var(--color-text-secondary)]">
        {t('titleSheet.counter', { count: 0, max: LISTING_TITLE_MAX_LENGTH })}
        <span className="ml-2 font-normal">{t('titleSheet.translationSoon')}</span>
      </p>
    </EditorBottomSheet>
  );
}
