import { useRef, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ShimmerImage } from '@/components/ui/ShimmerImage';
import { ListingPublishError, publishCurrentUserListing, type ListingPublishErrorCode } from '@/services/listing-draft.service';
import completeStepImage from '@/assets/images/complete_step.png';
import { EditorBottomSheet } from './EditorBottomSheet';

const primaryButton = 'min-h-12 w-full rounded-button bg-[var(--color-text-primary)] px-6 text-[0.830466rem] font-semibold text-[var(--color-surface)] transition enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50';
const secondaryButton = 'min-h-12 w-full rounded-button border border-[var(--color-text-primary)] bg-[var(--color-surface)] px-6 text-[0.830466rem] font-semibold transition enabled:hover:bg-[var(--color-surface-muted)] disabled:cursor-not-allowed disabled:opacity-50';

/** Shown from the "Verify your identity" card once the phone and identity are both verified. */
export function ListingPublishReadySheet({ open, listingId, published, onClose, onPublished }: {
  open: boolean;
  listingId: string;
  published: boolean;
  onClose: () => void;
  onPublished: () => void;
}) {
  const { t } = useTranslation('dashboard');
  const deployRef = useRef<HTMLButtonElement>(null);
  const continueRef = useRef<HTMLButtonElement>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState<ListingPublishErrorCode | null>(null);
  const deployingRef = useRef(false);

  const close = () => {
    if (deployingRef.current) return;
    setError(null);
    onClose();
  };
  const deploy = async () => {
    if (deployingRef.current || published) return;
    deployingRef.current = true;
    setIsDeploying(true);
    setError(null);
    try {
      await publishCurrentUserListing(listingId);
      onPublished();
    } catch (failure) {
      setError(failure instanceof ListingPublishError ? failure.code : 'generic');
    } finally {
      deployingRef.current = false;
      setIsDeploying(false);
    }
  };

  return (
    <EditorBottomSheet
      open={open}
      heading={t(published ? 'listingPublishReady.publishedTitle' : 'listingPublishReady.title')}
      headingVisuallyHidden
      closeLabel={t('listingPublishReady.close')}
      isSaving={isDeploying}
      canSave={!published}
      onClose={close}
      onSave={() => void deploy()}
      initialFocusRef={published ? continueRef : deployRef}
      compact
      showFooter={false}
      bodyClassName="pb-[max(24px,env(safe-area-inset-bottom))] pt-2"
    >
      <ShimmerImage src={completeStepImage} alt="" width={96} height={96} className="h-24 w-24 object-contain" />
      <p className="mt-4 text-2xl font-semibold leading-tight tracking-tight" aria-hidden="true">
        {t(published ? 'listingPublishReady.publishedTitle' : 'listingPublishReady.title')}
      </p>
      <p className="mt-2 text-[0.93427425rem] leading-6 text-[var(--color-text-secondary)]">
        {t(published ? 'listingPublishReady.publishedDescription' : 'listingPublishReady.description')}
      </p>

      <ul className="mt-6 divide-y divide-[var(--color-border-subtle)] border-y border-[var(--color-border-subtle)]">
        {(['phone', 'identity'] as const).map(item => (
          <li key={item} className="flex min-h-14 items-center gap-3 text-[0.830466rem]">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-[var(--color-success)]" strokeWidth={1.5} aria-hidden="true" />
            {t(`listingPublishReady.checks.${item}`)}
          </li>
        ))}
      </ul>

      {error ? (
        <p role="alert" className="mt-4 rounded-card bg-[var(--color-surface-muted)] p-4 text-[0.830466rem] leading-6">
          {t(`listingPublishReady.errors.${error}`)}
        </p>
      ) : null}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {published ? null : (
          <button ref={deployRef} type="button" onClick={() => void deploy()} disabled={isDeploying} aria-busy={isDeploying} className={`${primaryButton} sm:order-2`}>
            {t(isDeploying ? 'listingPublishReady.deploying' : 'listingPublishReady.deploy')}
          </button>
        )}
        <button ref={continueRef} type="button" onClick={close} disabled={isDeploying} className={`${secondaryButton} ${published ? 'sm:col-span-2' : 'sm:order-1'}`}>
          {t('listingPublishReady.continue')}
        </button>
      </div>
    </EditorBottomSheet>
  );
}
