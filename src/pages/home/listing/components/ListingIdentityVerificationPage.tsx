import { useEffect, useId, useRef, useState } from 'react';
import { CarFront, Globe2, IdCard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BackButton } from '@/components/ui/BackButton';
import { Modal } from '@/components/ui/Modal';
import { SelectField } from '@/components/ui/SelectField';
import worldLocations from '@/data/worldLocations.json';
import { ListingIdentityUploadPage } from './ListingIdentityUploadPage';

const issuingCountries = [...new Map(worldLocations.map(({ countryCode, country }) => [countryCode, country])).entries()];
const documentTypes = [
  { id: 'drivers-license', Icon: CarFront },
  { id: 'passport', Icon: Globe2 },
  { id: 'identity-card', Icon: IdCard }
] as const;
type DocumentType = typeof documentTypes[number]['id'];

export function ListingIdentityVerificationPage({ onBack, onComplete = onBack }: { onBack: () => void; onComplete?: () => void }) {
  const { t, i18n } = useTranslation('dashboard');
  const id = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [countryCode, setCountryCode] = useState('CD');
  const [documentType, setDocumentType] = useState<DocumentType | null>(null);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const regionNames = new Intl.DisplayNames([i18n.resolvedLanguage ?? 'fr'], { type: 'region' });
  const countries = issuingCountries.map(([code, fallback]) => ({
    code,
    name: code === 'CD' ? t('identityVerification.congo') : regionNames.of(code) ?? fallback
  }))
    .sort((first, second) => first.name.localeCompare(second.name, i18n.language));

  useEffect(() => { if (!showUpload) headingRef.current?.focus(); }, [showUpload]);

  if (showUpload && documentType) {
    return <ListingIdentityUploadPage countryCode={countryCode} documentType={documentType} onBack={() => setShowUpload(false)} onComplete={onComplete} />;
  }

  return (
    <section className="min-h-dvh bg-[var(--color-surface)] text-[var(--color-text-primary)]">
      <div className="mx-auto w-full max-w-[600px] px-6 pt-4 sm:pt-8">
        <BackButton label={t('identityVerification.back')} onClick={onBack} className="-ml-3" />
        <h1 ref={headingRef} tabIndex={-1} className="mt-3 text-2xl font-semibold leading-tight tracking-tight outline-none sm:mt-6 sm:text-[32px]">
          {t('identityVerification.title')}
        </h1>

        <div className="relative mt-3">
          <label htmlFor={`${id}-country`} className="pointer-events-none absolute left-4 top-2 z-10 text-xs text-[var(--color-text-secondary)]">
            {t('identityVerification.issuingCountry')}
          </label>
          <SelectField
            id={`${id}-country`}
            value={countryCode}
            onChange={(event) => setCountryCode(event.target.value)}
            className="h-16 rounded-field border-[var(--color-text-secondary)] pb-2 pl-4 pt-6 text-base sm:text-base"
          >
            {countries.map(({ code, name }) => <option key={code} value={code}>{name}</option>)}
          </SelectField>
        </div>

        <div role="radiogroup" aria-label={t('identityVerification.title')} className="mt-5 grid gap-3">
          {documentTypes.map(({ id: type, Icon }) => (
            <label key={type} className="relative block cursor-pointer">
              <input
                type="radio"
                name={`${id}-document-type`}
                value={type}
                checked={documentType === type}
                onChange={() => setDocumentType(type)}
                className="peer sr-only"
              />
              <span className="flex min-h-[72px] items-center gap-3 rounded-card border border-[var(--color-text-secondary)] px-6 py-5 transition-colors hover:bg-[var(--color-surface-muted)] peer-checked:border-[var(--color-text-primary)] peer-checked:bg-[var(--color-surface-muted)] peer-checked:ring-1 peer-checked:ring-[var(--color-text-primary)] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-[var(--color-text-primary)]">
                <Icon className="h-6 w-6 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                <span className="text-base font-semibold">{t(`identityVerification.types.${type}`)}</span>
              </span>
            </label>
          ))}
        </div>

        <p className="mt-3 text-sm leading-6">
          {t('identityVerification.privacyLead')}{' '}
          <button type="button" onClick={() => setPrivacyOpen(true)} className="-my-2 inline-flex min-h-11 items-center rounded-button font-semibold underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
            {t('identityVerification.privacyPolicy')}
          </button>{' '}
          {t('identityVerification.privacyTail')}
        </p>
      </div>

      <footer className="mt-5 border-t border-[var(--color-border-subtle)] pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex w-full max-w-[600px] items-center justify-between gap-6 px-6 py-3">
          <button type="button" onClick={onBack} className="-ml-3 min-h-11 rounded-button px-3 font-semibold underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
            {t('identityVerification.backLabel')}
          </button>
          <button
            type="button"
            disabled={!documentType || !countryCode}
            onClick={() => setShowUpload(true)}
            className="min-h-12 rounded-button bg-[var(--color-text-primary)] px-6 font-semibold text-[var(--color-surface)] transition-colors enabled:hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-text-primary)] disabled:cursor-not-allowed disabled:bg-[var(--color-surface-muted)] disabled:text-[var(--color-text-secondary)]"
          >
            {t('identityVerification.continue')}
          </button>
        </div>
      </footer>

      <Modal open={privacyOpen} onClose={() => setPrivacyOpen(false)} title={t('identityVerification.privacyPolicy')}>
        {/* TODO(team): link the approved Booksa identity policy before collecting documents. */}
        <p className="text-sm leading-6 text-[var(--color-text-secondary)]">{t('identityVerification.privacyUnavailable')}</p>
      </Modal>
    </section>
  );
}
