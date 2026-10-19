import { useEffect, useId, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { EditorBottomSheet } from './EditorBottomSheet';

export function ListingGuestRequirementsSheet({ open, requireProfilePhoto, onClose, onSave }: {
  open: boolean;
  requireProfilePhoto: boolean;
  onClose: () => void;
  onSave: (requireProfilePhoto: boolean) => void;
}) {
  const { t } = useTranslation('dashboard');
  const [value, setValue] = useState(requireProfilePhoto);
  const [showPhotoHelp, setShowPhotoHelp] = useState(false);
  const [showRequirementsHelp, setShowRequirementsHelp] = useState(false);
  const photoLabelId = useId();
  const photoDescriptionId = useId();
  const photoHelpId = useId();
  const requirementsHelpId = useId();

  useEffect(() => {
    if (!open) return;
    setValue(requireProfilePhoto);
    setShowPhotoHelp(false);
    setShowRequirementsHelp(false);
  }, [open, requireProfilePhoto]);

  return (
    <EditorBottomSheet
      open={open}
      heading={t('guestRequirementsSheet.heading')}
      closeLabel={t('guestRequirementsSheet.close')}
      isSaving={false}
      canSave={value !== requireProfilePhoto}
      onClose={onClose}
      onSave={() => { if (value !== requireProfilePhoto) onSave(value); }}
      compact
      bodyClassName="pb-6 pt-4"
    >
      <div className="rounded-card border border-[var(--color-border)] px-5 py-7 text-center">
        <h3 id={photoLabelId} className="text-base font-semibold">{t('guestRequirementsSheet.requirePhoto')}</h3>
        <p id={photoDescriptionId} className="mt-3 text-sm leading-snug text-[var(--color-text-secondary)]">
          {t('guestRequirementsSheet.photoDescription')}
        </p>
        <button
          type="button"
          aria-expanded={showPhotoHelp}
          aria-controls={photoHelpId}
          onClick={() => setShowPhotoHelp(current => !current)}
          className="min-h-11 rounded-button text-sm font-semibold text-[var(--color-text-secondary)] underline underline-offset-2"
        >
          {t('guestRequirementsSheet.learnMore')}
        </button>
        <p id={photoHelpId} hidden={!showPhotoHelp} className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
          {t('guestRequirementsSheet.photoHelp')}
        </p>
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            role="switch"
            aria-checked={value}
            aria-labelledby={photoLabelId}
            aria-describedby={photoDescriptionId}
            onClick={() => setValue(current => !current)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full"
          >
            <span aria-hidden="true" className={`inline-flex h-7 w-11 items-center rounded-full p-0.5 transition-colors ${value ? 'bg-[var(--color-text-primary)]' : 'bg-[var(--color-text-secondary)]'}`}>
              <span className={`h-6 w-6 rounded-full bg-[var(--color-surface)] shadow-xs transition-transform motion-reduce:transition-none ${value ? 'translate-x-4' : 'translate-x-0'}`} />
            </span>
          </button>
        </div>
      </div>

      <section className="mt-9" aria-label={t('guestRequirementsSheet.standardHeading')}>
        <h3 className="text-sm font-semibold">{t('guestRequirementsSheet.standardHeading')}</h3>
        <ul className="mt-3 list-disc space-y-2 pl-4 text-xs leading-relaxed text-[var(--color-text-secondary)] sm:text-sm">
          {(['contact', 'booking', 'rules'] as const).map(key => <li key={key}>{t(`guestRequirementsSheet.requirements.${key}`)}</li>)}
        </ul>
        <button
          type="button"
          aria-expanded={showRequirementsHelp}
          aria-controls={requirementsHelpId}
          onClick={() => setShowRequirementsHelp(current => !current)}
          className="mt-4 inline-flex min-h-11 items-center gap-1 rounded-button px-2 text-sm font-semibold"
        >
          {t('guestRequirementsSheet.learnMore')}
          <ChevronRight className={`h-4 w-4 transition-transform motion-reduce:transition-none ${showRequirementsHelp ? 'rotate-90' : ''}`} aria-hidden="true" />
        </button>
        <p id={requirementsHelpId} hidden={!showRequirementsHelp} className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
          {t('guestRequirementsSheet.requirementsHelp')}
        </p>
      </section>
      <p role="note" className="mt-3 text-xs leading-relaxed text-[var(--color-text-secondary)]">{t('guestRequirementsSheet.preview')}</p>
    </EditorBottomSheet>
  );
}
