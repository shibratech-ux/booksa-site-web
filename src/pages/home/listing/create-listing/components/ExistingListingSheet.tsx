import { ChevronRight, House } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/components/ui/Modal';
import type { ListingDraft } from '@/services/listing-draft.service';
import { formatDate } from '@/utils/formatters';

interface ExistingListingSheetProps {
  open: boolean;
  listings: ListingDraft[];
  isLoading: boolean;
  loadFailed: boolean;
  onClose: () => void;
  onSelect: (listing: ListingDraft) => void;
}

export function ExistingListingSheet({ open, listings, isLoading, loadFailed, onClose, onSelect }: ExistingListingSheetProps) {
  const { t, i18n } = useTranslation('dashboard');
  const { t: tCommon } = useTranslation('common');

  return (
    <Modal open={open} title={t('listingSetup.chooseListing')} onClose={onClose} variant="sheet">
      <div className="space-y-3 text-[var(--color-text-primary)]" aria-busy={isLoading}>
        {isLoading ? (
          <>
            <span role="status" className="sr-only">{tCommon('states.loading')}</span>
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} aria-hidden="true" className="h-[76px] animate-pulse rounded-card border border-[var(--color-border)] bg-[var(--color-surface-muted)] motion-reduce:animate-none" />
            ))}
          </>
        ) : loadFailed ? (
          <p role="alert" className="py-4 text-sm text-[var(--color-text-secondary)]">{t('listingSetup.loadError')}</p>
        ) : listings.length === 0 ? (
          <p role="status" className="py-4 text-sm text-[var(--color-text-secondary)]">{t('listingSetup.noInProgressListings')}</p>
        ) : listings.map((listing) => {
          const title = typeof listing.flowDraft?.listingTitle === 'string' && listing.flowDraft.listingTitle.trim()
            ? listing.flowDraft.listingTitle.trim()
            : t('listingSetup.listing');
          const createdAt = (listing.createdAt ?? listing.updatedAt)?.toDate();

          return (
            <button
              key={listing.id}
              type="button"
              onClick={() => onSelect(listing)}
              className="flex min-h-[76px] w-full items-center gap-3 rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-left transition hover:border-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-text-primary)]"
            >
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-[var(--color-surface-muted)]">
                <House className="h-5 w-5" fill="currentColor" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1 break-words text-sm font-semibold leading-5">
                {createdAt ? t('listingSetup.startedOn', {
                  listing: title,
                  date: formatDate(createdAt, i18n.resolvedLanguage, { dateStyle: 'long' })
                }) : title}
              </span>
              <ChevronRight className="h-5 w-5 shrink-0" aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
