import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { IconButton } from '@/components/ui/IconButton';
import { IDENTITY_REVIEW_DELAY_MS } from '@/domain/identity-verification';

export function ListingVerificationSubmittedPage({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation('dashboard');
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { headingRef.current?.focus(); }, []);

  return (
    <section className="flex min-h-dvh flex-col bg-[var(--color-surface)] text-[var(--color-text-primary)]">
      <div className="mx-auto w-full max-w-[600px] flex-1 px-6 pt-4 sm:pt-8">
        <IconButton label={t('identitySelfieSubmission.close')} icon={<X className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />} variant="plain" onClick={onDone} className="-ml-3" />
        <h1 ref={headingRef} tabIndex={-1} className="mt-3 text-2xl font-semibold leading-tight tracking-tight outline-none sm:mt-6 sm:text-[32px]">{t('identitySelfieSubmission.title')}</h1>
        <p className="mt-2 text-base leading-5 text-[var(--color-text-secondary)] sm:leading-6">{t('identitySelfieSubmission.description', { seconds: IDENTITY_REVIEW_DELAY_MS / 1000 })}</p>
      </div>
      <footer className="sticky bottom-0 border-t border-[var(--color-border-subtle)] bg-[var(--color-surface)] pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto w-full max-w-[600px] px-6 py-3">
          <button type="button" onClick={onDone} className="min-h-12 w-full rounded-button bg-[var(--color-text-primary)] px-6 font-semibold text-[var(--color-surface)] hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-text-primary)]">{t('identitySelfieSubmission.done')}</button>
        </div>
      </footer>
    </section>
  );
}
