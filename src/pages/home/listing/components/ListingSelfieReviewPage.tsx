import { useEffect, useId, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { IconButton } from '@/components/ui/IconButton';
import { Modal } from '@/components/ui/Modal';
import type { IdentityDetails } from '@/domain/identity-verification';
import { ListingSelfieCapturePage } from './ListingSelfieCapturePage';

type ReviewMethod = 'manual' | 'automatic';
const reviewMethods: ReviewMethod[] = ['manual', 'automatic'];

export function ListingSelfieReviewPage({ details, onClose, onComplete }: { details: IdentityDetails; onClose: () => void; onComplete: () => void }) {
  const { t } = useTranslation('dashboard');
  const id = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [method, setMethod] = useState<ReviewMethod | null>(null);
  const [learnMoreOpen, setLearnMoreOpen] = useState(false);
  const [showCapture, setShowCapture] = useState(false);

  useEffect(() => { if (!showCapture) headingRef.current?.focus(); }, [showCapture]);

  if (showCapture) {
    return <ListingSelfieCapturePage details={details} onBack={() => setShowCapture(false)} onComplete={onComplete} />;
  }

  return (
    <section aria-labelledby={`${id}-title`} className="flex min-h-dvh flex-col bg-[var(--color-surface)] text-[var(--color-text-primary)]">
      <div className="mx-auto flex w-full max-w-[600px] flex-1 flex-col px-6 pt-4 sm:pt-8">
        <div>
          <IconButton
            label={t('identitySelfieReview.close')}
            icon={<X className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />}
            variant="plain"
            onClick={onClose}
            className="-ml-3"
          />
          <h1 id={`${id}-title`} ref={headingRef} tabIndex={-1} className="mt-3 text-2xl font-semibold leading-tight tracking-tight outline-none sm:mt-6 sm:text-[32px]">
            {t('identitySelfieReview.title')}
          </h1>
          <p className="mt-2 text-base leading-5 text-[var(--color-text-secondary)] sm:leading-6">{t('identitySelfieReview.intro')}</p>

          <fieldset className="mt-5 min-w-0 border-0 p-0">
            <legend className="mb-6 text-base leading-6 text-[var(--color-text-secondary)]">{t('identitySelfieReview.question')}</legend>
            <div className="grid gap-3">
              {reviewMethods.map(option => (
                <label key={option} className="relative block cursor-pointer">
                  <input
                    type="radio"
                    name={`${id}-review-method`}
                    value={option}
                    checked={method === option}
                    aria-describedby={`${id}-${option}-description`}
                    onChange={() => setMethod(option)}
                    className="peer sr-only"
                  />
                  <span className="flex min-h-[104px] flex-col justify-center rounded-card border border-[var(--color-border)] px-6 py-5 transition-colors hover:border-[var(--color-text-secondary)] peer-checked:border-[var(--color-text-primary)] peer-checked:bg-[var(--color-surface-muted)] peer-checked:ring-1 peer-checked:ring-[var(--color-text-primary)] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-[var(--color-text-primary)]">
                    <span className="text-base font-semibold leading-6">{t(`identitySelfieReview.methods.${option}.title`)}</span>
                    <span id={`${id}-${option}-description`} className="mt-1 text-sm leading-5 text-[var(--color-text-secondary)]">{t(`identitySelfieReview.methods.${option}.description`)}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="mt-auto pb-5 pt-24 sm:pt-16">
          <p className="text-sm leading-5">{t(`identitySelfieReview.notice.${method === 'manual' ? 'manual' : 'automatic'}`)}</p>
          <button
            type="button"
            onClick={() => setLearnMoreOpen(true)}
            className="-mb-2 -ml-2 inline-flex min-h-11 items-center rounded-button px-2 text-sm font-semibold underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {t('identitySelfieReview.learnMore')}
          </button>
        </div>
      </div>

      <footer className="sticky bottom-0 shrink-0 border-t border-[var(--color-border-subtle)] bg-[var(--color-surface)] pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto w-full max-w-[600px] px-6 py-3">
          <button
            type="button"
            disabled={!method}
            onClick={() => { if (method) setShowCapture(true); }}
            className="min-h-12 w-full rounded-button bg-[var(--color-text-primary)] px-6 font-semibold text-[var(--color-surface)] enabled:hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-text-primary)] disabled:cursor-not-allowed disabled:bg-[var(--color-surface-muted)] disabled:text-[var(--color-text-secondary)]"
          >
            {t('identitySelfieReview.continue')}
          </button>
        </div>
      </footer>

      <Modal open={learnMoreOpen} onClose={() => setLearnMoreOpen(false)} title={t('identitySelfieReview.learnMoreTitle')}>
        <p className="text-sm leading-6 text-[var(--color-text-secondary)]">{t('identitySelfieReview.learnMoreText')}</p>
      </Modal>
    </section>
  );
}
