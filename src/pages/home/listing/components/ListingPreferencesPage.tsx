import { useEffect, useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BackButton } from '@/components/ui/BackButton';
import { getLanguageOption, normalizeLanguage, type SupportedLanguage } from '@/i18n/types';
import { ListingGuestRequirementsSheet } from './ListingGuestRequirementsSheet';
import { ListingRemoveSheet } from './ListingRemoveSheet';
import { ListingTaxesSheet } from './ListingTaxesSheet';
import { ListingLanguagesPreference } from './ListingLanguagesPreference';

const PREFERENCE_IDS = ['languages', 'guestRequirements', 'localLaws', 'taxes', 'communityStays', 'removeListing'] as const;
type PreferenceId = (typeof PREFERENCE_IDS)[number];

export function ListingPreferencesPage({ onBack, onOpenListings }: {
  onBack: () => void;
  onOpenListings: () => void;
}) {
  const { t, i18n } = useTranslation('dashboard');
  const [selected, setSelected] = useState<PreferenceId | null>(null);
  // TODO(team): listings have no languages field yet; these choices live only in this page's state.
  const [defaultLanguage] = useState<SupportedLanguage>(() => normalizeLanguage(i18n.resolvedLanguage));
  const [languages, setLanguages] = useState<SupportedLanguage[]>([]);
  const [taxesOpen, setTaxesOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [guestRequirementsOpen, setGuestRequirementsOpen] = useState(false);
  const [requireProfilePhoto, setRequireProfilePhoto] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const rowRefs = useRef<Partial<Record<PreferenceId, HTMLButtonElement | null>>>({});

  useEffect(() => { headingRef.current?.focus(); }, [selected]);

  const back = () => {
    if (!selected) {
      onBack();
      return;
    }
    const previous = selected;
    setSelected(null);
    requestAnimationFrame(() => rowRefs.current[previous]?.focus());
  };

  return (
    <section aria-labelledby="listing-preferences-heading" className="min-h-[calc(100dvh-96px)] bg-[var(--color-surface)] text-[var(--color-text-primary)] [&_button:focus-visible]:outline [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-2 [&_button:focus-visible]:outline-[var(--color-text-primary)]">
      <div className="mx-auto w-full max-w-2xl px-5 pb-28 pt-5 sm:px-10 sm:pt-8 md:pb-10">
        <header className="grid grid-cols-[44px_minmax(0,1fr)_44px] items-center">
          <BackButton onClick={back} label={selected ? t('listingPreferences.backToPreferences') : t('listingPreferences.back')} className="-ml-3" />
          {selected === 'languages' ? <span aria-hidden="true" /> : (
            <h1 id="listing-preferences-heading" ref={headingRef} tabIndex={-1} className="min-w-0 text-center text-lg font-semibold leading-snug outline-none">
              {selected ? t(`listingPreferences.rows.${selected}.label`) : t('listingPreferences.heading')}
            </h1>
          )}
          <span aria-hidden="true" />
        </header>

        {selected === 'languages' ? (
          <ListingLanguagesPreference
            headingId="listing-preferences-heading"
            headingRef={headingRef}
            defaultLanguage={defaultLanguage}
            languages={languages}
            onAdd={language => setLanguages(current => [...current, language])}
            onRemove={language => setLanguages(current => current.filter(code => code !== language))}
          />
        ) : selected ? (
          // TODO(design): replace this informational view when each preference's editing flow is designed.
          <div className="mt-10">
            <p className="text-base leading-7 text-[var(--color-text-secondary)]">{t(`listingPreferences.rows.${selected}.help`)}</p>
            <p role="status" className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]">{t('listingPreferences.unavailable')}</p>
          </div>
        ) : (
          <ul className="mt-6">
            {PREFERENCE_IDS.map(id => (
              <li key={id}>
                <button
                  type="button"
                  ref={element => { rowRefs.current[id] = element; }}
                  onClick={() => {
                    if (id === 'guestRequirements') setGuestRequirementsOpen(true);
                    else if (id === 'taxes') setTaxesOpen(true);
                    else if (id === 'removeListing') setRemoveOpen(true);
                    else setSelected(id);
                  }}
                  aria-haspopup={id === 'guestRequirements' || id === 'taxes' || id === 'removeListing' ? 'dialog' : undefined}
                  className="flex min-h-24 w-full items-start justify-between gap-4 rounded-button py-6 text-left transition hover:bg-[var(--color-surface-muted)]"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-base leading-6">{t(`listingPreferences.rows.${id}.label`)}</span>
                    <span className="mt-0.5 block text-sm leading-5 text-[var(--color-text-secondary)]">{id === 'languages'
                      ? [defaultLanguage, ...languages].map(code => getLanguageOption(code).label).join(', ')
                      : id === 'guestRequirements' && requireProfilePhoto ? t('guestRequirementsSheet.enabledPreview') : t(`listingPreferences.rows.${id}.summary`)}</span>
                  </span>
                  <ChevronRight className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-text-secondary)]" strokeWidth={1.5} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <ListingTaxesSheet open={taxesOpen} onClose={() => setTaxesOpen(false)} />
      <ListingRemoveSheet open={removeOpen} onClose={() => setRemoveOpen(false)} onOpenListings={onOpenListings} />
      <ListingGuestRequirementsSheet
        open={guestRequirementsOpen}
        requireProfilePhoto={requireProfilePhoto}
        onClose={() => setGuestRequirementsOpen(false)}
        onSave={(value) => {
          setRequireProfilePhoto(value);
          setGuestRequirementsOpen(false);
        }}
      />
    </section>
  );
}
