import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { IconButton } from '@/components/ui/IconButton';
import { Modal } from '@/components/ui/Modal';
import { getLoggedInUserProfile } from '@/services/user.service';
import { useAuthStore } from '@/store/auth.store';
import type { IdentityDocumentDetails } from '@/domain/identity-verification';
import { ListingSelfieReviewPage } from './ListingSelfieReviewPage';

type NameDetails = { firstName: string; lastName: string; preferredFirstName: string };
const emptyDetails: NameDetails = { firstName: '', lastName: '', preferredFirstName: '' };

export function ListingLegalNamePage({ document, onClose, onComplete }: { document: IdentityDocumentDetails; onClose: () => void; onComplete: () => void }) {
  const { t } = useTranslation('dashboard');
  const userId = useAuthStore(state => state.user?.id);
  const id = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [details, setDetails] = useState<NameDetails>(emptyDetails);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [showSelfieReview, setShowSelfieReview] = useState(false);
  const [learnMoreOpen, setLearnMoreOpen] = useState(false);

  useEffect(() => { if (!showSelfieReview) headingRef.current?.focus(); }, [showSelfieReview]);

  useEffect(() => {
    let active = true;
    setDetails(emptyDetails);
    setShowSelfieReview(false);
    setIsLoading(true);
    setLoadError(false);
    const load = async () => {
      try {
        if (!userId) throw new Error('No current account.');
        const profile = await getLoggedInUserProfile(userId);
        if (!active) return;
        const text = (value: unknown) => typeof value === 'string' ? value.trim() : '';
        const nameParts = text(profile.name).split(/\s+/).filter(Boolean);
        setDetails({
          firstName: text(profile.firstName) || nameParts[0] || '',
          lastName: text(profile.lastName) || nameParts.slice(1).join(' '),
          preferredFirstName: text(profile.preferredFirstName)
        });
      } catch {
        if (active) setLoadError(true);
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [userId]);

  const update = (field: keyof NameDetails, value: string) => {
    setDetails(current => ({ ...current, [field]: value }));
  };
  const canConfirm = !isLoading && Boolean(details.firstName.trim() && details.lastName.trim());
  const confirm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canConfirm) return;
    setDetails(current => ({
      firstName: current.firstName.trim(),
      lastName: current.lastName.trim(),
      preferredFirstName: current.preferredFirstName.trim()
    }));
    setShowSelfieReview(true);
  };

  if (showSelfieReview) {
    return <ListingSelfieReviewPage details={{ ...document, legalName: details }} onClose={() => setShowSelfieReview(false)} onComplete={onComplete} />;
  }

  return (
    <form onSubmit={confirm} aria-labelledby={`${id}-title`} className="flex min-h-dvh flex-col bg-[var(--color-surface)] text-[var(--color-text-primary)]">
      <div className="mx-auto w-full max-w-[600px] flex-1 px-6 pb-8 pt-4 sm:pt-8">
        <IconButton label={t('identityLegalName.close')} icon={<X className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />} variant="plain" onClick={onClose} className="-ml-3" />
        <h1 id={`${id}-title`} ref={headingRef} tabIndex={-1} className="mt-3 text-2xl font-semibold leading-tight tracking-tight outline-none sm:mt-6 sm:text-[32px]">
          {t('identityLegalName.title')}
        </h1>
        <p className="mt-2 text-base leading-5 text-[var(--color-text-secondary)] sm:leading-6">{t('identityLegalName.intro')}</p>
        {isLoading ? <p role="status" className="mt-4 text-sm text-[var(--color-text-secondary)]">{t('identityLegalName.loading')}</p> : null}
        {loadError ? <p role="alert" className="mt-4 rounded-card bg-[var(--color-surface-muted)] p-4 text-sm leading-6">{t('identityLegalName.loadError')}</p> : null}

        <fieldset disabled={isLoading} aria-busy={isLoading} className="mt-6 min-w-0">
          <legend className="mb-3 text-base font-semibold">{t('identityLegalName.legalName')}</legend>
          <div className="overflow-hidden rounded-card border border-[var(--color-text-secondary)] divide-y divide-[var(--color-text-secondary)]">
            {(['firstName', 'lastName'] as const).map(field => (
              <label key={field} className="block px-4 pb-2 pt-2 focus-within:bg-[var(--color-surface-muted)]">
                <span className="block text-xs leading-5 text-[var(--color-text-secondary)]">{t(`identityLegalName.${field}`)}</span>
                <input
                  name={field}
                  autoComplete={field === 'firstName' ? 'given-name' : 'family-name'}
                  value={details[field]}
                  onChange={event => update(field, event.target.value)}
                  required
                  maxLength={100}
                  aria-describedby={`${id}-legal-help`}
                  className="block min-h-7 w-full bg-transparent text-base leading-6 outline-none focus-visible:underline focus-visible:decoration-[var(--color-text-secondary)] focus-visible:underline-offset-4 disabled:opacity-50"
                />
              </label>
            ))}
          </div>
          <p id={`${id}-legal-help`} className="mt-4 text-sm leading-5 text-[var(--color-text-secondary)]">{t('identityLegalName.legalHelp')}</p>
        </fieldset>

        <fieldset disabled={isLoading} className="mt-6 min-w-0">
          <legend className="mb-3 text-base font-semibold">{t('identityLegalName.preferredName')}</legend>
          <label className="block rounded-card border border-[var(--color-text-secondary)] px-4 pb-2 pt-2 focus-within:bg-[var(--color-surface-muted)]">
            <span className="block text-xs leading-5 text-[var(--color-text-secondary)]">{t('identityLegalName.preferredFirstName')}</span>
            <input
              name="preferredFirstName"
              autoComplete="nickname"
              value={details.preferredFirstName}
              onChange={event => update('preferredFirstName', event.target.value)}
              maxLength={100}
              aria-describedby={`${id}-preferred-help`}
              className="block min-h-7 w-full bg-transparent text-base leading-6 outline-none focus-visible:underline focus-visible:decoration-[var(--color-text-secondary)] focus-visible:underline-offset-4 disabled:opacity-50"
            />
          </label>
          <p id={`${id}-preferred-help`} className="mt-4 text-sm leading-5 text-[var(--color-text-secondary)]">
            {t('identityLegalName.preferredHelp')}{' '}
            <button type="button" onClick={() => setLearnMoreOpen(true)} className="-my-2 inline-flex min-h-11 items-center rounded-button underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
              {t('identityLegalName.learnMore')}
            </button>
          </p>
        </fieldset>
      </div>

      <footer className="sticky bottom-0 shrink-0 border-t border-[var(--color-border-subtle)] bg-[var(--color-surface)] pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto w-full max-w-[600px] px-6 py-3">
          <button type="submit" disabled={!canConfirm} className="min-h-12 w-full rounded-button bg-[var(--color-text-primary)] px-6 font-semibold text-[var(--color-surface)] enabled:hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-text-primary)] disabled:cursor-not-allowed disabled:bg-[var(--color-surface-muted)] disabled:text-[var(--color-text-secondary)]">
            {t('identityLegalName.confirm')}
          </button>
        </div>
      </footer>
      <Modal open={learnMoreOpen} onClose={() => setLearnMoreOpen(false)} title={t('identityLegalName.preferredName')}>
        <p className="text-sm leading-6 text-[var(--color-text-secondary)]">{t('identityLegalName.learnMoreText')}</p>
      </Modal>
    </form>
  );
}
