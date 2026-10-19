import { getListingResumeTarget } from './listingResume';
import { useEffect, useState } from 'react';
import { ChevronRight, Copy, House, HousePlus } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import BooksaLogo from '@/components/layout/BooksaLogo';
import { ShimmerImage } from '@/components/ui/ShimmerImage';
import { ExistingListingSheet } from './components/ExistingListingSheet';
import { ListingAddressSetup } from './components/ListingAddressSetup';
import { useAuth } from '@/hooks/useAuth';
import {
  createCurrentUserDraft,
  listCurrentUserListings,
  type ListingDraft
} from '@/services/listing-draft.service';
import { ROUTES, STORAGE_KEYS } from '@/utils/constants';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/utils/formatters';

const listingActions = [
  { icon: HousePlus, labelKey: 'listingSetup.new', path: ROUTES.hostListingCreate },
  {
    icon: Copy,
    labelKey: 'listingSetup.fromExisting',
    path: ROUTES.hostListingCreateFromExisting
  }
] as const;

const VISIBLE_DRAFT_COUNT = 3;

const findImageUrl = (value: unknown): string | undefined => {
  if (typeof value === 'string') {
    return /^https?:\/\//i.test(value) ? value : undefined;
  }
  if (Array.isArray(value)) {
    return value.map(findImageUrl).find(Boolean);
  }
  if (!value || typeof value !== 'object') return undefined;

  const image = value as Record<string, unknown>;
  for (const key of ['coverImageUrl', 'url', 'downloadURL', 'src']) {
    const imageUrl = findImageUrl(image[key]);
    if (imageUrl) return imageUrl;
  }

  return Object.values(image).map(findImageUrl).find(Boolean);
};

const getListingCoverImage = (listing: ListingDraft) =>
  [
    listing.coverImageUrl,
    listing.coverImage,
    listing.images,
    listing.photos,
    listing.listingPhotos,
    listing.user?.listingPhotos
  ]
    .map(findImageUrl)
    .find(Boolean);

export default function ListingSetupPage() {
  const { t, i18n } = useTranslation('dashboard');
  const { t: tAuth } = useTranslation('auth');
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const { user } = useAuth();
  const [draftListings, setDraftListings] = useState<ListingDraft[]>([]);
  const [isLoadingDrafts, setIsLoadingDrafts] = useState(true);
  const [isCreatingListing, setIsCreatingListing] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [showAllDrafts, setShowAllDrafts] = useState(false);
  const [isExistingListingSheetOpen, setIsExistingListingSheetOpen] = useState(false);
  const [newListingId, setNewListingId] = useState<string | null>(null);
  const firstName = user?.name?.trim().split(/\s+/)[0] || 'hôte';

  useEffect(() => {
    let isActive = true;

    listCurrentUserListings()
      .then((drafts) => {
        if (isActive) setDraftListings(drafts.filter((listing) => listing.status === 'draft' || listing.status === 'in-progress'));
      })
      .catch((error) => {
        console.error('Unable to load listing drafts.', error);
        if (isActive) setLoadFailed(true);
      })
      .finally(() => {
        if (isActive) setIsLoadingDrafts(false);
      });

    return () => {
      isActive = false;
    };
  }, [t, newListingId]);

  const handleCreateListing = async () => {
    if (isCreatingListing) return;

    setIsCreatingListing(true);

    try {
      const listingId = await createCurrentUserDraft();
      window.sessionStorage.removeItem(STORAGE_KEYS.listingDraftLocation);
      window.sessionStorage.removeItem(STORAGE_KEYS.listingDraftFlow);
      setNewListingId(listingId);
    } catch (error) {
      console.error('Unable to create the listing draft.', error);
      toast.error(t('listingSetup.createError'));
    } finally {
      setIsCreatingListing(false);
    }
  };

  const handleResumeListing = (listing: ListingDraft) => {
    const { path: resumePath, page: initialPage } = getListingResumeTarget(listing.resumePage);

    if (listing.confirmedLocation) {
      window.sessionStorage.setItem(
        STORAGE_KEYS.listingDraftLocation,
        JSON.stringify(listing.confirmedLocation)
      );
    } else {
      window.sessionStorage.removeItem(STORAGE_KEYS.listingDraftLocation);
    }
    if (listing.flowDraft) {
      window.sessionStorage.setItem(
        STORAGE_KEYS.listingDraftFlow,
        JSON.stringify(listing.flowDraft)
      );
    } else {
      window.sessionStorage.removeItem(STORAGE_KEYS.listingDraftFlow);
    }

    navigate(resumePath, {
      state: {
        listingId: listing.id,
        initialPage,
        confirmedLocation: listing.confirmedLocation,
        flowDraft: listing.flowDraft
      }
    });
  };

  const visibleDrafts = showAllDrafts ? draftListings : draftListings.slice(0, VISIBLE_DRAFT_COUNT);
  const hasHiddenDrafts = draftListings.length > VISIBLE_DRAFT_COUNT;

  if (newListingId) {
    return <ListingAddressSetup listingId={newListingId} onClose={() => setNewListingId(null)} />;
  }

  return (
    <main className="min-h-dvh bg-[var(--color-background)] text-[var(--color-text-primary)]">
      <header className="mx-auto flex w-full max-w-[1280px] items-center justify-start px-6 pt-5 sm:justify-between sm:px-8 sm:py-7 lg:px-10">
        <button
          type="button"
          onClick={() => navigate(ROUTES.home)}
          aria-label={tCommon('accessibility.goHome')}
          className="hidden min-h-11 items-center rounded-button focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-text-primary)] sm:inline-flex"
        >
          <BooksaLogo className="h-10 w-[118.8px]" />
        </button>
        <button
          type="button"
          onClick={() => navigate(ROUTES.hostListings)}
          className="min-h-11 rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-5 text-sm font-medium transition hover:border-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-text-primary)]"
        >
          {tAuth('exit')}
        </button>
      </header>

      <motion.section
        initial={reduceMotion ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="mx-auto w-full max-w-[640px] px-6 pb-16 pt-14 sm:px-8 sm:pt-12"
      >
        <h1 className="text-2xl font-semibold leading-8 tracking-tight sm:text-3xl sm:leading-10">
          {t('listingSetup.welcomeBack', { name: firstName })}
        </h1>

        {isLoadingDrafts || loadFailed || draftListings.length > 0 ? (
          <section className="mt-5 sm:mt-8" aria-labelledby="finish-listing-heading">
            <h2 id="finish-listing-heading" className="text-xl font-semibold leading-7 tracking-tight sm:text-2xl sm:leading-8">
              {t('listingSetup.finish')}
            </h2>
            <div id="draft-listings" className="mt-3 space-y-3" aria-busy={isLoadingDrafts}>
              {isLoadingDrafts
                ? Array.from({ length: VISIBLE_DRAFT_COUNT }, (_, index) => (
                    <div
                      key={index}
                      aria-hidden="true"
                      className="h-[76px] animate-pulse rounded-card border border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] motion-reduce:animate-none"
                    />
                  ))
                : null}
              {loadFailed ? (
                <p role="alert" className="text-sm text-[var(--color-text-secondary)]">
                  {t('listingSetup.loadError')}
                </p>
              ) : null}
              {visibleDrafts.map((listing) => {
                const coverImage = getListingCoverImage(listing);

                return (
                  <button
                    key={listing.id}
                    type="button"
                    onClick={() => handleResumeListing(listing)}
                    className="flex min-h-[76px] w-full items-center gap-3 rounded-card border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-3 text-left transition hover:border-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-text-primary)] sm:px-4"
                  >
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-[var(--color-border-subtle)]">
                      {coverImage ? (
                        <ShimmerImage src={coverImage} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <House className="h-5 w-5" fill="currentColor" aria-hidden="true" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1 break-words text-md font-semibold leading-5">
                      {t('listingSetup.startedOn', {
                        listing:
                          typeof listing.flowDraft?.listingTitle === 'string' && listing.flowDraft.listingTitle.trim()
                            ? listing.flowDraft.listingTitle
                            : t('listingSetup.listing'),
                        date: formatDate(
                          (listing.createdAt ?? listing.updatedAt)?.toDate() ?? new Date(),
                          i18n.resolvedLanguage,
                          { dateStyle: 'long' }
                        )
                      })}
                    </span>
                  </button>
                );
              })}
            </div>
            {hasHiddenDrafts ? (
              <button
                type="button"
                onClick={() => setShowAllDrafts((value) => !value)}
                aria-expanded={showAllDrafts}
                aria-controls="draft-listings"
                className="mt-3 min-h-11 rounded-button text-sm font-semibold underline underline-offset-2 transition hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-text-primary)]"
              >
                {showAllDrafts ? t('listingSetup.showLess') : t('listingSetup.showAll')}
              </button>
            ) : null}
          </section>
        ) : null}

        <section className="mt-7 sm:mt-10" aria-labelledby="new-listing-heading">
          <h2 id="new-listing-heading" className="text-xl font-semibold leading-7 tracking-tight sm:text-2xl sm:leading-8">
            {t('listingSetup.startNew')}
          </h2>
          <div className="mt-4">
            {listingActions.map(({ icon: Icon, labelKey, path }) => {
              const createsNewListing = path === ROUTES.hostListingCreate;

              return (
                <button
                  key={labelKey}
                  type="button"
                  onClick={createsNewListing ? handleCreateListing : () => setIsExistingListingSheetOpen(true)}
                  aria-haspopup={createsNewListing ? undefined : 'dialog'}
                  disabled={createsNewListing && isCreatingListing}
                  aria-busy={createsNewListing && isCreatingListing}
                  className="group flex min-h-14 w-full items-center gap-4 rounded-button py-3 text-left transition hover:bg-[var(--color-surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-text-primary)] disabled:cursor-wait disabled:opacity-50"
                >
                  <Icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                  <span className="min-w-0 flex-1 break-words text-md sm:text-base">{t(labelKey)}</span>
                  <ChevronRight
                    className="h-4 w-4 shrink-0 text-[var(--color-text-secondary)]"
                    aria-hidden="true"
                  />
                </button>
              );
            })}
          </div>
        </section>
      </motion.section>
      <ExistingListingSheet
        open={isExistingListingSheetOpen}
        listings={draftListings}
        isLoading={isLoadingDrafts}
        loadFailed={loadFailed}
        onClose={() => setIsExistingListingSheetOpen(false)}
        onSelect={(listing) => {
          setIsExistingListingSheetOpen(false);
          handleResumeListing(listing);
        }}
      />
    </main>
  );
}
