import { useRef, useState, type RefObject } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/components/ui/Modal';
import { SUPPORTED_LANGUAGES, getLanguageOption, type SupportedLanguage } from '@/i18n/types';

export function ListingLanguagesPreference({ headingId, headingRef, defaultLanguage, languages, onAdd, onRemove }: {
  headingId: string;
  headingRef: RefObject<HTMLHeadingElement>;
  defaultLanguage: SupportedLanguage;
  languages: SupportedLanguage[];
  onAdd: (language: SupportedLanguage) => void;
  onRemove: (language: SupportedLanguage) => void;
}) {
  const { t } = useTranslation('dashboard');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const available = SUPPORTED_LANGUAGES.filter(({ code }) => code !== defaultLanguage && !languages.includes(code));

  const remove = (language: SupportedLanguage) => {
    onRemove(language);
    setAnnouncement(t('listingPreferences.languages.removed', { language: getLanguageOption(language).label }));
    requestAnimationFrame(() => (addButtonRef.current ?? headingRef.current)?.focus());
  };

  const add = (language: SupportedLanguage) => {
    onAdd(language);
    setIsAddOpen(false);
    if (available.length === 1) requestAnimationFrame(() => headingRef.current?.focus());
    setAnnouncement(t('listingPreferences.languages.added', { language: getLanguageOption(language).label }));
  };

  return (
    <div className="mt-6">
      <h1 id={headingId} ref={headingRef} tabIndex={-1} className="text-[28px] font-semibold leading-tight outline-none">
        {t('listingPreferences.rows.languages.label')}
      </h1>
      <p className="mt-2 text-base leading-6 text-[var(--color-text-secondary)]">{t('listingPreferences.languages.description')}</p>

      <ul className="mt-6">
        <li className="flex min-h-20 items-center border-b border-[var(--color-border-subtle)] py-4 text-base leading-6">
          {t('listingPreferences.languages.default', { language: getLanguageOption(defaultLanguage).label })}
        </li>
        {languages.map(language => {
          const { label } = getLanguageOption(language);
          return (
            <li key={language} className="flex min-h-20 items-center justify-between gap-4 border-b border-[var(--color-border-subtle)] py-4">
              <span lang={language} className="min-w-0 text-base leading-6">{label}</span>
              <button
                type="button"
                onClick={() => remove(language)}
                aria-label={t('listingPreferences.languages.deleteLabel', { language: label })}
                className="-mr-3 flex min-h-11 shrink-0 items-center gap-1.5 rounded-button px-3 text-base font-semibold transition hover:bg-[var(--color-surface-muted)]"
              >
                <Trash2 className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                {t('listingPreferences.languages.delete')}
              </button>
            </li>
          );
        })}
      </ul>

      {available.length > 0 ? (
        <button
          type="button"
          ref={addButtonRef}
          onClick={() => setIsAddOpen(true)}
          className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-button border border-[var(--color-border)] px-6 text-base font-semibold transition hover:bg-[var(--color-surface-muted)]"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          {t('listingPreferences.languages.add')}
        </button>
      ) : (
        <p className="mt-6 text-sm leading-5 text-[var(--color-text-secondary)]">{t('listingPreferences.languages.allAdded')}</p>
      )}

      <p role="status" className="sr-only">{announcement}</p>

      <Modal open={isAddOpen} onClose={() => setIsAddOpen(false)} title={t('listingPreferences.languages.dialogTitle')} variant="sheet" sheetSize="compact">
        <ul>
          {available.map(({ code, label }) => (
            <li key={code}>
              <button
                type="button"
                lang={code}
                onClick={() => add(code)}
                className="flex min-h-14 w-full items-center rounded-button px-3 text-left text-base leading-6 transition hover:bg-[var(--color-surface-muted)]"
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </Modal>
    </div>
  );
}
