import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { IconButton } from '@/components/ui/IconButton';
import { ShimmerImage } from '@/components/ui/ShimmerImage';
import { getLoggedInUserProfile } from '@/services/user.service';
import type { ListingDraft } from '@/services/listing-draft.service';
import { IDENTITY_REVIEW_DELAY_MS, readIdentityVerification, type IdentityVerificationState } from '@/domain/identity-verification';
import { completeSimulatedIdentityReview } from '@/services/identity-verification.service';
import { useAuthStore } from '@/store/auth.store';
import { formatDate } from '@/utils/formatters';
import completeStepImage from '@/assets/images/complete_step.png';
import { readVerifiedPhone } from '@/domain/phone-verification';
import { ListingPhoneVerificationPage } from './ListingPhoneVerificationPage';

const object = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};

export function ListingPublishStepsPage({ listing, selfieSubmitted, onClose, onGetStarted }: {
  listing: ListingDraft;
  selfieSubmitted: boolean;
  onClose: () => void;
  onGetStarted: () => void;
}) {
  const { t, i18n } = useTranslation('dashboard');
  const userId = useAuthStore(state => state.user?.id);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [identity, setIdentity] = useState<IdentityVerificationState>({ status: 'not-started' });
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [savedPhone, setSavedPhone] = useState<string>();
  const [phoneConfirmed, setPhoneConfirmed] = useState(false);
  const phoneTriggerRef = useRef<HTMLButtonElement>(null);
  // `selfieSubmitted` covers a submission made in this session before the profile reloads.
  const identityStatus = identity.status === 'not-started' && selfieSubmitted ? 'selfie-submitted' : identity.status;
  const pendingReviewAt = identity.status === 'pending' ? identity.reviewAt : null;
  let startedDate: string | undefined;
  const createdAt = listing.createdAt?.toMillis();
  if (createdAt !== undefined && Number.isFinite(createdAt)) {
    const timezone = object(listing.confirmedLocation?.location).timezone;
    try {
      startedDate = formatDate(createdAt, i18n.language, { dateStyle: 'long', timeZone: typeof timezone === 'string' ? timezone : 'UTC' });
    } catch {
      startedDate = formatDate(createdAt, i18n.language, { dateStyle: 'long', timeZone: 'UTC' });
    }
  }

  useEffect(() => { headingRef.current?.focus(); }, []);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setFailed(false);
    setIdentity({ status: 'not-started' });
    setPhoneConfirmed(false);
    setSavedPhone(undefined);
    const load = async () => {
      try {
        if (!userId) throw new Error('No current account.');
        const profile = await getLoggedInUserProfile(userId);
        if (!active) return;
        setIdentity(readIdentityVerification(profile, userId));
        setSavedPhone(typeof profile.phoneNumber === 'string' ? profile.phoneNumber : undefined);
        setPhoneConfirmed(readVerifiedPhone(profile) !== null);
      } catch {
        if (active) setFailed(true);
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [userId, attempt]);

  // Simulated review: once the stored review time passes, mark the identity verified.
  useEffect(() => {
    if (!userId || pendingReviewAt === null) return;
    let active = true;
    const timer = window.setTimeout(() => {
      completeSimulatedIdentityReview(userId)
        .then(next => { if (active) setIdentity(next); })
        .catch(() => { if (active) setFailed(true); });
    }, Math.max(0, pendingReviewAt - Date.now()));
    return () => { active = false; window.clearTimeout(timer); };
  }, [userId, pendingReviewAt]);

  const returnFromPhone = () => {
    setPhoneOpen(false);
    setAttempt(value => value + 1);
    requestAnimationFrame(() => phoneTriggerRef.current?.focus());
  };
  if (phoneOpen) return <ListingPhoneVerificationPage initialPhone={savedPhone} onBack={returnFromPhone} onComplete={returnFromPhone} />;

  return (
    <section aria-labelledby="listing-publish-steps-title" className="min-h-dvh bg-[var(--color-surface-muted)] text-[var(--color-text-primary)]">
      <header className="sticky top-0 z-10 bg-[var(--color-surface)]">
        <div className="mx-auto grid min-h-16 w-full max-w-[600px] grid-cols-[44px_minmax(0,1fr)_44px] items-center px-4 sm:min-h-20">
          <span aria-hidden="true" />
          <h1 id="listing-publish-steps-title" ref={headingRef} tabIndex={-1} className="text-center text-base font-semibold outline-none">{t('listingPublishSteps.title')}</h1>
          <IconButton label={t('listingPublishSteps.close')} variant="plain" onClick={onClose} icon={<ChevronDown className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />} />
        </div>
      </header>

      <div aria-busy={loading} className="mx-auto grid w-full max-w-[600px] gap-4 px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-5 sm:px-8 sm:pt-8">
        {loading ? <p role="status" className="text-sm text-[var(--color-text-secondary)]">{t('listingPublishSteps.loading')}</p> : null}
        {failed ? (
          <div role="alert" className="rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm leading-6">
            <p>{t('listingPublishSteps.loadError')}</p>
            <button type="button" onClick={() => setAttempt(current => current + 1)} className="mt-2 min-h-11 rounded-button px-2 font-semibold underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">{t('listingPublishSteps.retry')}</button>
          </div>
        ) : null}

        <article className="rounded-dialog bg-[var(--color-surface)] p-5 shadow-[var(--shadow-md)] dark:border dark:border-[var(--color-border)] sm:p-6">
          {startedDate ? <p className="text-xs leading-5 text-[var(--color-text-secondary)]">{t('listingPublishSteps.started', { date: startedDate })}</p> : null}
          <h2 className="text-base font-semibold leading-6">{t('listingPublishSteps.identity')}</h2>
          <p className="mt-0.5 text-sm leading-5 text-[var(--color-text-secondary)]">{t(`listingPublishSteps.status.${identityStatus}`)}</p>

          <div className="mt-4 flex min-h-80 flex-col items-center justify-center rounded-card bg-[var(--color-surface-muted)] px-5 py-8 text-center">
            <ShimmerImage src={completeStepImage} alt="" width={128} height={128} className="h-32 w-32 object-contain" />
            <h3 className="mt-5 text-2xl font-semibold leading-tight tracking-tight">{t('listingPublishSteps.verifyTitle')}</h3>
            <p className="mt-3 max-w-xs text-sm leading-5 text-[var(--color-text-secondary)]">{t(`listingPublishSteps.statusDescription.${identityStatus}`, { seconds: IDENTITY_REVIEW_DELAY_MS / 1000 })}</p>
            {identityStatus === 'verified' ? (
              <CheckCircle2 className="mt-6 h-8 w-8 text-[var(--color-success)]" strokeWidth={1.5} aria-hidden="true" />
            ) : (
              <button type="button" onClick={onGetStarted} disabled={loading} className="mt-6 min-h-11 rounded-button bg-[var(--color-text-primary)] px-5 text-sm font-semibold text-[var(--color-surface)] enabled:hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-text-primary)] disabled:cursor-wait disabled:opacity-50">
                {t(identityStatus === 'not-started' ? 'identityVerification.getStarted' : 'listingPublishSteps.startAgain')}
              </button>
            )}
          </div>
        </article>

        <button ref={phoneTriggerRef} type="button" disabled={loading} onClick={() => setPhoneOpen(true)} className="flex min-h-24 w-full items-center justify-between gap-4 rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-50 sm:px-6">
          <span>
            {startedDate ? <span className="block text-xs leading-5 text-[var(--color-text-secondary)]">{t('listingPublishSteps.started', { date: startedDate })}</span> : null}
            <span className="block text-base font-semibold leading-6">{t('listingPublishSteps.phone')}</span>
            <span className="mt-0.5 block text-sm leading-5 text-[var(--color-text-secondary)]">{t(phoneConfirmed ? 'phoneVerification.completed' : 'listingPublishSteps.notStarted')}</span>
          </span>
          {phoneConfirmed ? <CheckCircle2 className="h-5 w-5 shrink-0 text-[var(--color-success)]" aria-hidden="true" /> : <ChevronRight className="h-5 w-5 shrink-0" aria-hidden="true" />}
        </button>
        <article className="rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4 sm:px-6">
          <h2 className="text-base font-semibold leading-6">{t('listingPublishSteps.birthDate')}</h2>
          {/* TODO(team): agree on date-of-birth confirmation fields with Flutter. */}
          <p className="mt-0.5 text-sm leading-5 text-[var(--color-text-secondary)]">{t('listingPublishSteps.notStarted')}</p>
        </article>
      </div>
    </section>
  );
}
