import { ArrowLeft, Copy, House } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import BooksaLogo from '@/components/layout/BooksaLogo';
import { ROUTES } from '@/utils/constants';
import { useTranslation } from 'react-i18next';
import { ListingAddressSetup } from './components/ListingAddressSetup';

const existingListings = [
  { id: 'unique-space', labelKey: 'listingSetup.uniqueSpace' },
  { id: 'bed-breakfast', labelKey: 'listingSetup.bedBreakfast' },
  { id: 'listing', labelKey: 'listingSetup.listing' }
] as const;

export default function CreateListingPage() {
  const navigate = useNavigate();
  const { pathname, state } = useLocation();
  const routeState = state as { listingId?: string } | null;
  const listingId = routeState?.listingId;
  const { t } = useTranslation('dashboard');
  const { t: tCommon } = useTranslation('common');
  const isCreatingFromExisting = pathname === ROUTES.hostListingCreateFromExisting;

  if (isCreatingFromExisting) {
    return (
      <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)]">
        <header className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-5 py-7 sm:px-8 lg:px-10">
          <BooksaLogo className="h-10 w-[118.8px]" />
          <button
            type="button"
            onClick={() => navigate(ROUTES.hostListingSetup)}
            className="rounded-button border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-2.5 text-sm font-semibold"
          >
            {tCommon('actions.back')}
          </button>
        </header>

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="mx-auto w-full max-w-3xl px-5 pb-16 pt-8 sm:px-6 sm:pt-14"
        >
          <button
            type="button"
            onClick={() => navigate(ROUTES.hostListingSetup)}
            aria-label={tCommon('actions.back')}
            className="mb-8 inline-flex h-10 max-sm:h-11 max-sm:w-11 w-10 items-center justify-center rounded-full border border-[var(--color-border)]"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="flex items-center gap-4">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-sm bg-[var(--color-surface-muted)]">
              <Copy className="h-6 w-6" aria-hidden="true" />
            </span>
            <h1 className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
              {t('listingSetup.fromExisting')}
            </h1>
          </div>
          <div className="mt-10 space-y-3">
            {existingListings.map((listing) => (
              <button
                key={listing.id}
                type="button"
                className="flex min-h-[90.2px] w-full items-center gap-4 rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] px-5 text-left transition hover:border-[var(--color-text-primary)]"
              >
                <House className="h-6 w-6 shrink-0" aria-hidden="true" />
                <span className="font-semibold">{t(listing.labelKey)}</span>
              </button>
            ))}
          </div>
        </motion.section>
      </main>
    );
  }

  return (
    <ListingAddressSetup
      listingId={listingId}
      onClose={() => navigate(ROUTES.hostListingSetup)}
    />
  );
}
