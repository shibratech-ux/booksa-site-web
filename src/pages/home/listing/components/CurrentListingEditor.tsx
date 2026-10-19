import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { getOwnListingImageUrls } from '@/domain/listing-photos';
import { subscribeToCurrentUserListing, type ListingDraft } from '@/services/listing-draft.service';
import { useAuthStore } from '@/store/auth.store';
import { ActionRequiredListingEditor } from './ActionRequiredListingEditor';

type EditorState = {
  listingId: string;
  userId: string | undefined;
  listing?: ListingDraft;
  failed?: boolean;
};

export function CurrentListingEditor({ listingId, onListingChange, onBack, onOpenCalendar }: {
  listingId: string;
  onListingChange: (listing: ListingDraft) => void;
  onBack: () => void;
  onOpenCalendar: () => void;
}) {
  const { t } = useTranslation('dashboard');
  const userId = useAuthStore((state) => state.user?.id);
  const [state, setState] = useState<EditorState | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setState({ listingId, userId });
    return subscribeToCurrentUserListing(listingId, (listing) => {
      if (!['action-required', 'published', 'active'].includes(listing.status)) {
        setState({ listingId, userId, failed: true });
        return;
      }
      setState({ listingId, userId, listing });
      onListingChange(listing);
    }, () => setState({ listingId, userId, failed: true }));
  }, [listingId, userId, attempt, onListingChange]);

  const current = state?.listingId === listingId && state.userId === userId ? state : null;
  const listing = current?.listing;
  // Only photos stored on this annonceslisting document and owned by its host (All photos, photo tour, preview).
  const photoUrls = useMemo(() => listing ? getOwnListingImageUrls(listing) : [], [listing]);

  if (current?.failed || !userId) {
    return (
      <div className="p-5 sm:p-8">
        <ErrorState description={t('listingEditorSync.loadError')} onRetry={() => setAttempt((value) => value + 1)} />
        <button type="button" onClick={onBack} className="mt-4 min-h-11 rounded-button px-4 font-semibold underline">
          {t('listingEditorSync.back')}
        </button>
      </div>
    );
  }

  if (!listing) return <LoadingScreen fullScreen={false} />;

  return <ActionRequiredListingEditor key={`${userId}:${listingId}`} listing={listing} photoUrls={photoUrls} onBack={onBack} onOpenCalendar={onOpenCalendar} />;
}
