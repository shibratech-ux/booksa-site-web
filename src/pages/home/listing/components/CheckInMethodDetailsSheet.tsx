import { useEffect, useId, useRef, useState } from 'react';
import { Clock3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { EditorBottomSheet } from './EditorBottomSheet';
import type { CheckInMethodId } from './ListingCheckInMethodPage';

export const CHECK_IN_DETAILS_MAX_LENGTH = 500;

// "Add smart lock details" step: free-text entry instructions for the chosen check-in method.
export function CheckInMethodDetailsSheet({ open, method, details, onClose, onSave }: {
  open: boolean;
  method: CheckInMethodId | null;
  details: string;
  onClose: () => void;
  onSave: (details: string) => Promise<void> | void;
}) {
  const { t } = useTranslation('dashboard');
  const inputId = useId();
  const noteId = useId();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState(details);
  const trimmed = value.trim();
  // Saving needs text, or an edit to existing text (so a host can clear what they wrote).
  const canSave = trimmed !== details.trim() && (trimmed.length > 0 || details.trim().length > 0);
  const heading = method ? t(`checkInMethod.methods.${method}.detailsHeading`) : '';

  useEffect(() => {
    if (open) setValue(details);
  }, [open, details]);

  return (
    <EditorBottomSheet
      open={open && method !== null}
      heading={heading}
      closeLabel={t('checkInMethod.backToMethods')}
      closeIcon="back"
      cancelStyle="outlined"
      isSaving={false}
      canSave={canSave}
      onClose={onClose}
      onSave={() => void onSave(trimmed)}
      initialFocusRef={inputRef}
      bodyClassName="flex flex-col pb-4 pt-6 sm:min-h-[420px]"
    >
      <label htmlFor={inputId} className="sr-only">{heading}</label>
      <textarea
        ref={inputRef}
        id={inputId}
        value={value}
        maxLength={CHECK_IN_DETAILS_MAX_LENGTH}
        aria-describedby={noteId}
        onChange={(event) => setValue(event.target.value)}
        placeholder={t('checkInMethod.detailsPlaceholder')}
        className="min-h-[280px] w-full flex-1 resize-none border-0 bg-transparent p-0 text-[0.93427425rem] leading-7 text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-secondary)] placeholder:opacity-70"
      />
      <p id={noteId} className="mt-4 flex shrink-0 items-center gap-2 text-[0.72665775rem] text-[var(--color-text-secondary)]">
        <Clock3 className="h-4 w-4 shrink-0 fill-current text-[var(--color-text-secondary)] [&>*:not(:first-child)]:stroke-[var(--color-surface)]" strokeWidth={2} aria-hidden="true" />
        {t('checkInMethod.sharedBefore')}
      </p>
    </EditorBottomSheet>
  );
}
