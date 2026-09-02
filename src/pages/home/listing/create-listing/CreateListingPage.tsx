import { useState } from 'react';
import { FiArrowLeft, FiCopy, FiHome, FiSearch } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import BooksaLogo from '@/components/layout/BooksaLogo';
import { ShimmerImage } from '@/components/ui/ShimmerImage';
import { ROUTES, STORAGE_KEYS } from '@/utils/constants';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { updateCurrentUserDraft } from '@/services/listing-draft.service';
import { AddressSearchDialog } from './components/AddressSearchDialog';

const existingListings = [
  { id: 'unique-space', labelKey: 'listingSetup.uniqueSpace' },
  { id: 'bed-breakfast', labelKey: 'listingSetup.bedBreakfast' },
  { id: 'listing', labelKey: 'listingSetup.listing' }
] as const;

const previewImage =
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1000&q=85';

export default function CreateListingPage() {
  const navigate = useNavigate();
  const { pathname, state } = useLocation();
  const routeState = state as { listingId?: string } | null;
  const listingId = routeState?.listingId;
  const { t } = useTranslation('dashboard');
  const { t: tCommon } = useTranslation('common');
  const [address, setAddress] = useState('');
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const isCreatingFromExisting = pathname === ROUTES.hostListingCreateFromExisting;

  if (isCreatingFromExisting) {
    return (
      <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)]">
        <header className="mx-auto flex w-full max-w-[1496px] items-center justify-between px-5 py-7 sm:px-8 lg:px-10">
          <BooksaLogo className="h-10 w-[118.8px]" />
          <button
            type="button"
            onClick={() => navigate(ROUTES.hostListingSetup)}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-2.5 text-sm font-semibold"
          >
            {tCommon('actions.back')}
          </button>
        </header>

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="mx-auto w-full max-w-[737px] px-5 pb-16 pt-8 sm:px-6 sm:pt-14"
        >
          <button
            type="button"
            onClick={() => navigate(ROUTES.hostListingSetup)}
            aria-label={tCommon('actions.back')}
            className="mb-8 inline-flex h-10 w-10 items-center justify-center rounded-md border border-[var(--color-border)]"
          >
            <FiArrowLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="flex items-center gap-4">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-sm bg-[var(--color-surface-muted)]">
              <FiCopy className="h-6 w-6" aria-hidden="true" />
            </span>
            <h1 className="text-[32.928px] font-semibold tracking-[-0.035em] sm:text-[39.984px]">
              {t('listingSetup.fromExisting')}
            </h1>
          </div>
          <div className="mt-10 space-y-3">
            {existingListings.map((listing) => (
              <button
                key={listing.id}
                type="button"
                className="flex min-h-[90.2px] w-full items-center gap-4 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-5 text-left transition hover:border-[var(--color-text-primary)]"
              >
                <FiHome className="h-6 w-6 shrink-0" aria-hidden="true" />
                <span className="font-semibold">{t(listing.labelKey)}</span>
              </button>
            ))}
          </div>
        </motion.section>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[var(--color-surface)] text-[var(--color-text-primary)]">
      <header className="mx-auto flex h-16 w-full max-w-[1584px] items-center border-b border-[var(--color-border)] px-5 sm:h-[110px] sm:border-b-0 sm:px-10 lg:px-14">
        <BooksaLogo className="h-8 w-[105.6px] sm:h-9 sm:w-[123.2px]" />
      </header>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="mx-auto grid min-h-[calc(100dvh-64px)] w-full max-w-[1584px] content-start items-center gap-8 px-5 pb-10 pt-10 sm:min-h-[calc(100vh-100px)] sm:content-center sm:gap-12 sm:px-10 sm:pt-0 lg:grid-cols-[minmax(420px,0.9fr)_minmax(500px,1.1fr)] lg:px-14"
      >
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08, ease: 'easeOut' }}
          className="mx-auto w-full max-w-[572px] text-left sm:text-center"
        >
          <h1 className="text-[39.984px] font-semibold leading-[1.02] tracking-[-0.045em] sm:text-[49.392px] lg:text-[75.264px]">
            Set up your
            <br />
            Booksa listing
          </h1>
          <p className="mt-4 max-w-[451px] text-base leading-6 text-[var(--color-text-secondary)] sm:mx-auto sm:mt-7 sm:text-lg">
            It’s easy to create a great listing—let’s start with your address.
          </p>

          <form
            className="relative mt-8 max-w-[484px] sm:mx-auto sm:mt-12"
            onSubmit={(event) => {
              event.preventDefault();
              setIsAddressDialogOpen(true);
            }}
            role="search"
          >
            <FiSearch
              className="pointer-events-none absolute left-4 top-1/2 h-2.5 w-2.5 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              type="search"
              value={address}
              readOnly
              onClick={() => setIsAddressDialogOpen(true)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setIsAddressDialogOpen(true);
                }
              }}
              placeholder="Enter your address"
              aria-label="Enter your address"
              autoComplete="street-address"
              className="h-[63.8px] w-full cursor-pointer rounded-md border border-[var(--color-text-secondary)] bg-[var(--color-surface)] pl-12 pr-5 outline-none transition placeholder:text-[var(--color-text-secondary)] focus:border-2 focus:border-[var(--color-text-primary)]"
            />
          </form>

          <p className="mt-6 text-sm text-[var(--color-text-secondary)] sm:mt-8 sm:text-base">
            Not listing a home? Host an{' '}
            <button type="button" className="font-semibold text-[var(--color-text-primary)] underline underline-offset-2">
              experience or service
            </button>
            .
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.16, ease: 'easeOut' }}
          className="mx-auto flex aspect-[1.05] w-full max-w-[649px] items-end justify-center overflow-hidden rounded-sm bg-[linear-gradient(135deg,#eefbf1_0%,#e4f2e4_100%)] px-7 pt-10 sm:rounded-sm sm:px-16 sm:pt-16 lg:px-20"
          aria-label="Example Booksa listing preview"
        >
          <article className="w-full max-w-[385px] translate-y-12 rounded-sm bg-white p-5 text-[#222] shadow-[0_16px_48px_rgba(15,23,42,0.12)] sm:p-6">
            <ShimmerImage
              src={previewImage}
              alt="Villa with a swimming pool"
              className="aspect-[1.1] w-full rounded-sm object-cover"
            />
            <h2 className="mt-6 text-[29.4px] font-semibold leading-7 tracking-[-0.035em]">
              Entire villa in
              <br />
              Kinshasa, DR Congo
            </h2>
            <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-5 text-sm font-semibold">
              <span>Hosted by Booksa</span>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-sm bg-[#385cff] text-xs font-bold text-white">
                B
              </span>
            </div>
          </article>
        </motion.div>
      </motion.section>

      <AddressSearchDialog
        open={isAddressDialogOpen}
        initialQuery={address}
        onClose={() => setIsAddressDialogOpen(false)}
        onSelect={async (location, details) => {
          setAddress(
            [
              details.streetAddress,
              details.apartment,
              details.city,
              details.region,
              details.country,
              details.postalCode
            ]
              .filter(Boolean)
              .join(', ')
          );
          const confirmedLocation = { address: details, location };
          window.sessionStorage.setItem(STORAGE_KEYS.listingDraftLocation, JSON.stringify(confirmedLocation));

          try {
            if (listingId) {
              await updateCurrentUserDraft(listingId, {
                confirmedLocation,
                resumePath: ROUTES.hostListingFirstSection,
                resumePage: 'introduction'
              });
            }

            navigate(ROUTES.hostListingFirstSection, {
              state: { listingId, confirmedLocation }
            });
          } catch (error) {
            console.error('Unable to save the listing address.', error);
            toast.error(t('listingSetup.createError'));
          }
        }}
      />
    </main>
  );
}
