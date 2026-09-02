import { useEffect, useState } from 'react';
import { FiChevronRight, FiCopy, FiHome, FiPlus } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { collection, doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import BooksaLogo from '@/components/layout/BooksaLogo';
import { ShimmerImage } from '@/components/ui/ShimmerImage';
import { useAuth } from '@/hooks/useAuth';
import { firebaseAuth, firebaseDb } from '@/services/firebase';
import {
  listCurrentUserDrafts,
  type ListingDraft
} from '@/services/listing-draft.service';
import { ROUTES, STORAGE_KEYS } from '@/utils/constants';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/utils/formatters';

const listingActions = [
  { icon: FiPlus, labelKey: 'listingSetup.new', path: ROUTES.hostListingCreate },
  {
    icon: FiCopy,
    labelKey: 'listingSetup.fromExisting',
    path: ROUTES.hostListingCreateFromExisting
  }
] as const;

const resumableListingPaths = new Set<string>([
  ROUTES.hostListingCreate,
  ROUTES.hostListingFirstSection,
  ROUTES.hostListingSecondSection,
  ROUTES.hostListingThirdSection
]);
const resumableListingPages = new Set([
  'introduction',
  'property-type',
  'place-access',
  'location',
  'basics',
  'amenities',
  'photos',
  'title',
  'highlights',
  'description',
  'booking-settings',
  'pricing',
  'discounts',
  'safety-details'
]);

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
  const { user } = useAuth();
  const [draftListings, setDraftListings] = useState<ListingDraft[]>([]);
  const [isLoadingDrafts, setIsLoadingDrafts] = useState(true);
  const [isCreatingListing, setIsCreatingListing] = useState(false);
  const firstName = user?.name?.trim().split(/\s+/)[0] || 'hôte';

  useEffect(() => {
    let isActive = true;

    listCurrentUserDrafts()
      .then((drafts) => {
        if (isActive) setDraftListings(drafts);
      })
      .catch((error) => {
        console.error('Unable to load listing drafts.', error);
        if (isActive) toast.error(t('listingSetup.loadError'));
      })
      .finally(() => {
        if (isActive) setIsLoadingDrafts(false);
      });

    return () => {
      isActive = false;
    };
  }, [t]);

  const handleCreateListing = async () => {
    if (isCreatingListing) return;

    const currentUser = firebaseAuth?.currentUser;
    if (!firebaseDb || !currentUser) {
      toast.error(t('listingSetup.createError'));
      return;
    }

    setIsCreatingListing(true);

    try {
      const userReference = doc(firebaseDb, 'users', currentUser.uid);
      const userSnapshot = await getDoc(userReference);

      if (!userSnapshot.exists()) {
        throw new Error(`No user profile exists for ${currentUser.uid}.`);
      }

      const userProfile = userSnapshot.data();
      const profileName = typeof userProfile.name === 'string' ? userProfile.name : null;
      const profileEmail = typeof userProfile.email === 'string' ? userProfile.email : null;
      const profilePhoneNumber =
        typeof userProfile.phoneNumber === 'string' ? userProfile.phoneNumber : null;

      const listingDocument = doc(collection(firebaseDb, 'annonceslisting'));
      await setDoc(listingDocument, {
        id: listingDocument.id,
        userUid: currentUser.uid,
        ownerUid: currentUser.uid,
        userRef: userReference,
        contact: {
          uid: currentUser.uid,
          name: currentUser.displayName ?? profileName,
          email: currentUser.email ?? profileEmail,
          phoneNumber: currentUser.phoneNumber ?? profilePhoneNumber,
          photoUrl: currentUser.photoURL ?? null
        },
        user: {
          ...userProfile,
          uid: currentUser.uid
        },
        status: 'draft',
        resumePath: ROUTES.hostListingCreate,
        resumePage: 'address',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      window.sessionStorage.removeItem(STORAGE_KEYS.listingDraftLocation);
      window.sessionStorage.removeItem(STORAGE_KEYS.listingDraftFlow);
      navigate(ROUTES.hostListingCreate, {
        state: { listingId: listingDocument.id }
      });
    } catch (error) {
      console.error('Unable to create the listing draft.', error);
      toast.error(t('listingSetup.createError'));
    } finally {
      setIsCreatingListing(false);
    }
  };

  const handleResumeListing = (listing: ListingDraft) => {
    const resumePath =
      listing.resumePath && resumableListingPaths.has(listing.resumePath)
        ? listing.resumePath
        : ROUTES.hostListingCreate;
    const initialPage =
      listing.resumePage && resumableListingPages.has(listing.resumePage)
        ? listing.resumePage
        : undefined;

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

  return (
    <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)]">
      <header className="mx-auto flex w-full max-w-[1496px] items-center justify-between border-b border-[var(--color-border)] px-5 py-4 sm:border-b-0 sm:px-8 sm:py-7 lg:px-10">
        <button type="button" onClick={() => navigate(ROUTES.home)} aria-label={tCommon('accessibility.goHome')}>
          <BooksaLogo className="h-8 w-[105.6px] sm:h-10 sm:w-[118.8px]" />
        </button>
        <button
          type="button"
          onClick={() => navigate(ROUTES.hostListings)}
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-2.5 text-sm font-semibold transition hover:bg-[var(--color-surface-muted)]"
        >
          {tAuth('exit')}
        </button>
      </header>

      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="mx-auto w-full max-w-[737px] px-5 pb-12 pt-6 sm:px-6 sm:pb-16 sm:pt-10"
      >
        <h1 className="text-[29.6352px] font-semibold tracking-[-0.035em] sm:text-[33.58656px]">
          {t('listingSetup.welcomeBack', { name: firstName })}
        </h1>
        

        <section className="mt-7" aria-labelledby="finish-listing-heading">
          <h2 id="finish-listing-heading" className="text-xl font-semibold sm:text-[21.73248px]">
            {t('listingSetup.finish')}
          </h2>
          <div className="mt-4 space-y-3" aria-busy={isLoadingDrafts}>
            {isLoadingDrafts ? (
              <div className="h-[103.4px] animate-pulse rounded-sm bg-[var(--color-surface-muted)]" />
            ) : null}
            {draftListings.map((listing) => {
              const coverImage = getListingCoverImage(listing);

              return (
                <button
                  key={listing.id}
                  type="button"
                  onClick={() => handleResumeListing(listing)}
                  className="group flex min-h-[90.2px] w-full items-center gap-3 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-left transition hover:border-[var(--color-text-primary)] hover:shadow-[var(--shadow-sm)] sm:min-h-[103.4px] sm:gap-4 sm:px-6"
                >
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-[var(--color-surface-muted)] sm:h-11 sm:w-11 sm:rounded-sm">
                  {coverImage ? (
                    <ShimmerImage src={coverImage} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <FiHome className="h-5 w-5" aria-hidden="true" />
                  )}
                </span>
                <span className="min-w-0 flex-1 text-[14.8176px] font-semibold leading-6 sm:text-base">
                  {t('listingSetup.startedOn', {
                    listing:
                      typeof listing.flowDraft?.listingTitle === 'string' && listing.flowDraft.listingTitle.trim()
                        ? listing.flowDraft.listingTitle
                        : t('listingSetup.listing'),
                    date: formatDate(
                      (listing.createdAt ?? listing.updatedAt)?.toDate() ?? new Date(),
                      i18n.resolvedLanguage
                    )
                  })}
                </span>
                <FiChevronRight className="h-5 w-5 shrink-0 opacity-60 transition group-hover:translate-x-1 group-hover:opacity-100 sm:opacity-0" aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-12 sm:mt-16" aria-labelledby="new-listing-heading">
          <h2 id="new-listing-heading" className="text-xl font-semibold sm:text-[21.73248px]">
            {t('listingSetup.create')}
          </h2>
          <div className="mt-5 divide-y divide-[var(--color-border)] border-b border-[var(--color-border)]">
            {listingActions.map(({ icon: Icon, labelKey, path }) => {
              const createsNewListing = path === ROUTES.hostListingCreate;

              return (
                <button
                  key={labelKey}
                  type="button"
                  onClick={createsNewListing ? handleCreateListing : () => navigate(path)}
                  disabled={createsNewListing && isCreatingListing}
                  aria-busy={createsNewListing && isCreatingListing}
                  className="group flex w-full items-center gap-4 py-5 text-left transition hover:opacity-70 disabled:cursor-wait disabled:opacity-50"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-[var(--color-text-primary)]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="flex-1 text-base">{t(labelKey)}</span>
                  <FiChevronRight className="h-5 w-5 transition group-hover:translate-x-1" aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </section>
      </motion.section>
    </main>
  );
}
