import { useEffect, useRef, useState } from 'react';
import {
  FiBookmark,
  FiBell,
  FiBookOpen,
  FiCalendar,
  FiChevronDown,
  FiChevronRight,
  FiClipboard,
  FiEdit3,
  FiGrid,
  FiGlobe,
  FiHelpCircle,
  FiHome,
  FiList,
  FiMenu,
  FiMessageSquare,
  FiPlus,
  FiLogOut,
  FiRefreshCw,
  FiSearch,
  FiSettings,
  FiUserPlus,
  FiUsers
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import BooksaLogo from '@/components/layout/BooksaLogo';
import { HostAccountDrawer, hostOnboardingImages } from '@/components/layout/HostAccountDrawer';
import { ShimmerImage } from '@/components/ui/ShimmerImage';
import { ThreeDIcon } from '@/components/ui/ThreeDIcon';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES, STORAGE_KEYS } from '@/utils/constants';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import {
  getCurrentUserListing,
  listCurrentUserListings,
  removeCurrentUserDraft,
  type ListingDraft
} from '@/services/listing-draft.service';
import { formatDate } from '@/utils/formatters';
import { InProgressListingDialog } from './components/InProgressListingDialog';
import { ActionRequiredListingEditor } from './components/ActionRequiredListingEditor';

const hostNavigation = [
  { id: 'today', labelKey: 'nav.today' },
  { id: 'calendar', labelKey: 'nav.calendar' },
  { id: 'listings', labelKey: 'nav.listings' },
  { id: 'messages', labelKey: 'nav.messages' }
] as const;

const mobileHostNavigation = [
  { id: 'today', labelKey: 'nav.today', Icon: FiBookmark },
  { id: 'calendar', labelKey: 'nav.calendar', Icon: FiCalendar },
  { id: 'listings', labelKey: 'nav.listings', Icon: FiClipboard },
  { id: 'messages', labelKey: 'nav.messages', Icon: FiMessageSquare }
] as const;
type ReservationView = 'today' | 'upcoming';
type HostSection = (typeof hostNavigation)[number]['id'] | 'menu';
type MessageFilter = 'all' | 'unread' | 'hosting' | 'traveling' | 'support';

const resumableListingPaths = new Set<string>([
  ROUTES.hostListingCreate,
  ROUTES.hostListingFirstSection,
  ROUTES.hostListingSecondSection,
  ROUTES.hostListingThirdSection
]);

const findListingPhotoUrl = (value: unknown): string | undefined => {
  if (typeof value === 'string') return /^https?:\/\//i.test(value) ? value : undefined;
  if (!value || typeof value !== 'object') return undefined;

  const listingPhoto = value as Record<string, unknown>;
  for (const key of [
    'url',
    'imageUrl',
    'photoUrl',
    'downloadURL',
    'downloadUrl'
  ]) {
    const candidate = listingPhoto[key];
    if (typeof candidate === 'string' && /^https?:\/\//i.test(candidate)) return candidate;
  }
  return undefined;
};

const getListingPhotoUrls = (listing: ListingDraft): string[] => {
  if (
    !listing.listingPhotos ||
    typeof listing.listingPhotos !== 'object' ||
    Array.isArray(listing.listingPhotos)
  ) return [];
  return [
    ...new Set(
      Object.values(listing.listingPhotos)
        .map(findListingPhotoUrl)
        .filter((photoUrl): photoUrl is string => Boolean(photoUrl))
    )
  ];
};

const getListingCoverImage = (listing: ListingDraft) => {
  const listingPhotoUrls = getListingPhotoUrls(listing);
  if (listingPhotoUrls.length === 0) return undefined;

  const listingPhotoUrlSet = new Set(listingPhotoUrls);
  const preferredCover = [
    listing.generatedListing?.coverImageUrl,
    listing.coverImageUrl,
    listing.coverImage
  ]
    .map(findListingPhotoUrl)
    .find((photoUrl) => photoUrl && listingPhotoUrlSet.has(photoUrl));

  return preferredCover ?? listingPhotoUrls[0];
};

const getListingImageUrls = (listing: ListingDraft) => {
  const listingPhotoUrls = getListingPhotoUrls(listing);
  const coverImageUrl = getListingCoverImage(listing);
  return [
    ...new Set([
      ...(coverImageUrl ? [coverImageUrl] : []),
      ...listingPhotoUrls
    ])
  ];
};

const getStatusDetails = (status: ListingDraft['status']) => {
  if (status === 'active') return { label: 'Active', color: 'bg-[var(--color-success)]' };
  if (status === 'draft' || status === 'in-progress') {
    return { label: 'In progress', color: 'bg-[var(--color-warning)]' };
  }
  return { label: 'Action required', color: 'bg-[var(--color-danger)]' };
};

const toDisplayLabel = (value: unknown, fallback: string) => {
  if (typeof value !== 'string' || !value.trim()) return fallback;
  return value
    .trim()
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const getListingSummary = (listing: ListingDraft) => {
  if (listing.generatedListing) return listing.generatedListing;

  const flowDraft = listing.flowDraft ?? {};
  const confirmedLocation = listing.confirmedLocation ?? {};
  const address =
    confirmedLocation.address && typeof confirmedLocation.address === 'object'
      ? (confirmedLocation.address as Record<string, unknown>)
      : {};
  const locationParts = [address.city, address.region, address.country].filter(
    (part): part is string => typeof part === 'string' && Boolean(part.trim())
  );
  const coverImageUrl = getListingCoverImage(listing);

  return {
    title:
      typeof flowDraft.listingTitle === 'string' && flowDraft.listingTitle.trim()
        ? flowDraft.listingTitle.trim()
        : 'Listing in progress',
    type: toDisplayLabel(flowDraft.listingOption, 'Property'),
    location: locationParts.join(', ') || 'Location not provided',
    basePrice:
      typeof flowDraft.basePrice === 'number' && Number.isFinite(flowDraft.basePrice)
        ? flowDraft.basePrice
        : 0,
    currency: 'CDF' as const,
    ...(coverImageUrl ? { coverImageUrl } : {})
  };
};

function ListingCover({
  listing,
  layout
}: {
  listing: ListingDraft;
  layout: 'list' | 'grid' | 'dialog' | 'mobile';
}) {
  const imageUrl = getListingCoverImage(listing);
  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => setHasImageError(false), [imageUrl]);

  if (!imageUrl || hasImageError) {
    if (layout === 'mobile') {
      return <span className="inline-flex h-14 w-14 shrink-0 rounded-sm bg-[var(--color-border)]" aria-label="No listing cover available" />;
    }

    if (layout === 'grid') {
      return (
        <div className="flex aspect-[4/3] items-center justify-center bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]">
          <FiHome className="h-9 w-9" aria-label="No listing cover available" />
        </div>
      );
    }

    if (layout === 'dialog') {
      return <FiHome className="h-10 w-10 text-[var(--color-text-secondary)]" aria-label="No listing cover available" />;
    }

    return (
      <span className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-sm bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]">
        <FiHome className="h-6 w-6" aria-label="No listing cover available" />
      </span>
    );
  }

  if (layout === 'dialog') {
    return (
      <ShimmerImage
        src={imageUrl}
        alt=""
        onError={() => setHasImageError(true)}
        className="h-full w-full object-cover"
      />
    );
  }

  if (layout === 'grid') {
    return (
      <div className="aspect-[4/3] bg-[var(--color-surface-muted)]">
        <ShimmerImage
          src={imageUrl}
          alt=""
          loading="lazy"
          onError={() => setHasImageError(true)}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  if (layout === 'mobile') {
    return (
      <span className="inline-flex h-14 w-14 shrink-0 overflow-hidden rounded-sm bg-[var(--color-border)]">
        <ShimmerImage
          src={imageUrl}
          alt=""
          loading="lazy"
          onError={() => setHasImageError(true)}
          className="h-full w-full object-cover"
        />
      </span>
    );
  }

  return (
    <span className="inline-flex h-16 w-16 shrink-0 overflow-hidden rounded-sm bg-[var(--color-border)]">
      <ShimmerImage
        src={imageUrl}
        alt=""
        loading="lazy"
        onError={() => setHasImageError(true)}
        className="h-full w-full object-cover"
      />
    </span>
  );
}

function MobileAttentionCard({ onClick, className = '' }: { onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-[74.8px] items-center gap-3 rounded-md border-t border-[var(--color-border)] bg-[var(--color-surface)] px-5 text-left shadow-[0_-8px_24px_rgba(15,23,42,0.06)] ${className}`}
    >
      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center">
        <span className="text-2xl" aria-hidden="true">📅</span>
        <ThreeDIcon name="attentionCalendar" sourceSize={60} className="absolute inset-0 h-full w-full object-contain" />
        <span className="absolute -left-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-sm bg-neutral-900 px-1 text-[10.584px] font-bold text-white">4</span>
      </span>
      <span className="min-w-0 flex-1 truncate text-[15.288px] font-semibold">Actions need your attention</span>
      <FiChevronRight className="h-4 w-4 shrink-0 text-[var(--color-text-secondary)]" aria-hidden="true" />
    </button>
  );
}

function ListingsView({ createdListingId }: { createdListingId?: string }) {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const [listings, setListings] = useState<ListingDraft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [layout, setLayout] = useState<'list' | 'grid'>('list');
  const [isManageMode, setIsManageMode] = useState(false);
  const [selectedListing, setSelectedListing] = useState<ListingDraft | null>(null);
  const [actionRequiredListing, setActionRequiredListing] = useState<ListingDraft | null>(null);
  const [openingListingId, setOpeningListingId] = useState<string | null>(null);
  const [isRemovingListing, setIsRemovingListing] = useState(false);
  const mobileActionRequiredRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isActive = true;

    listCurrentUserListings()
      .then((result) => {
        if (isActive) setListings(result);
      })
      .catch((error) => {
        console.error('Unable to load generated listings.', error);
        if (isActive) toast.error('We could not load your listings.');
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const normalizedSearch = search.trim().toLowerCase();
  const visibleListings = listings.filter((listing) => {
    if (!normalizedSearch) return true;
    const summary = getListingSummary(listing);
    return [summary.title, summary.type, summary.location].some((value) =>
      value.toLowerCase().includes(normalizedSearch)
    );
  });

  const isInProgress = (listing: ListingDraft) =>
    listing.status === 'draft' || listing.status === 'in-progress';

  const isActionRequired = (listing: ListingDraft) => listing.status === 'action-required';
  const isListingInteractive = (listing: ListingDraft) =>
    isInProgress(listing) || isActionRequired(listing);
  const actionRequiredListings = visibleListings.filter(isActionRequired);
  const inProgressListings = visibleListings.filter(isInProgress);
  const activeListings = visibleListings.filter((listing) => listing.status === 'active');

  const getMobileListingTitle = (listing: ListingDraft) => {
    const summary = getListingSummary(listing);
    if (!isInProgress(listing)) return summary.title;

    const timestamp = listing.createdAt ?? listing.updatedAt;
    return timestamp
      ? `Your ${summary.type.toLowerCase()} listing started ${formatDate(timestamp.toDate(), i18n.resolvedLanguage)}`
      : summary.title;
  };

  const renderMobileListing = (listing: ListingDraft) => {
    const summary = getListingSummary(listing);
    const interactive = isListingInteractive(listing);

    return (
      <article
        key={listing.id}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        aria-busy={openingListingId === listing.id}
        onClick={interactive ? () => void openListing(listing.id) : undefined}
        onKeyDown={(event) => {
          if (interactive && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            void openListing(listing.id);
          }
        }}
        className={`flex min-w-0 gap-3 rounded-sm text-left transition ${layout === 'grid' ? 'flex-col items-start border border-[var(--color-border)] p-3' : 'items-center py-1'} ${interactive ? 'cursor-pointer active:bg-[var(--color-surface-muted)]' : ''} ${openingListingId === listing.id ? 'animate-pulse' : ''}`}
      >
        <ListingCover listing={listing} layout="mobile" />
        <span className="min-w-0 flex-1">
          <span className="block text-[12.936px] font-semibold leading-4">{getMobileListingTitle(listing)}</span>
          <span className="mt-0.5 line-clamp-2 block text-[12.348px] leading-[1.45] text-[var(--color-text-secondary)]">{summary.location}</span>
        </span>
        {isManageMode ? <FiChevronRight className="h-4 w-4 shrink-0 text-[var(--color-text-secondary)]" aria-hidden="true" /> : null}
      </article>
    );
  };

  async function openListing(listingId: string) {
    if (openingListingId) return;

    setOpeningListingId(listingId);
    try {
      const currentListing = await getCurrentUserListing(listingId);
      setListings((existing) =>
        existing.map((candidate) => candidate.id === currentListing.id ? currentListing : candidate)
      );

      if (isInProgress(currentListing)) {
        setSelectedListing(currentListing);
      } else if (isActionRequired(currentListing)) {
        setActionRequiredListing(currentListing);
      } else {
        toast.error('This listing is no longer available for editing here.');
      }
    } catch (error) {
      console.error('Unable to retrieve the selected listing.', error);
      toast.error('We could not retrieve this listing.');
    } finally {
      setOpeningListingId(null);
    }
  }

  const resumeListing = (listing: ListingDraft) => {
    const resumePath =
      listing.resumePath && resumableListingPaths.has(listing.resumePath)
        ? listing.resumePath
        : ROUTES.hostListingCreate;

    if (listing.confirmedLocation) {
      window.sessionStorage.setItem(
        STORAGE_KEYS.listingDraftLocation,
        JSON.stringify(listing.confirmedLocation)
      );
    } else {
      window.sessionStorage.removeItem(STORAGE_KEYS.listingDraftLocation);
    }
    if (listing.flowDraft) {
      window.sessionStorage.setItem(STORAGE_KEYS.listingDraftFlow, JSON.stringify(listing.flowDraft));
    } else {
      window.sessionStorage.removeItem(STORAGE_KEYS.listingDraftFlow);
    }

    navigate(resumePath, {
      state: {
        listingId: listing.id,
        initialPage: listing.resumePage,
        confirmedLocation: listing.confirmedLocation,
        flowDraft: listing.flowDraft
      }
    });
  };

  const removeListing = async (listing: ListingDraft) => {
    if (!window.confirm('Remove this in-progress listing? This action cannot be undone.')) return;

    setIsRemovingListing(true);
    try {
      await removeCurrentUserDraft(listing.id);
      setListings((current) => current.filter(({ id }) => id !== listing.id));
      setSelectedListing(null);
      toast.success('Listing removed.');
    } catch (error) {
      console.error('Unable to remove the listing.', error);
      toast.error('We could not remove this listing.');
    } finally {
      setIsRemovingListing(false);
    }
  };

  if (actionRequiredListing) {
    return (
      <ActionRequiredListingEditor
        listing={actionRequiredListing}
        photoUrls={getListingImageUrls(actionRequiredListing)}
        onBack={() => setActionRequiredListing(null)}
      />
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="min-h-[calc(100dvh-66px)] bg-[var(--color-surface)] md:min-h-[calc(100vh-95px)]"
    >
      <div className="hidden h-32 border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] md:block" />

      <div className="md:hidden">
        <div className="sticky top-0 z-20 bg-[var(--color-surface)] px-4 pb-4 pt-6">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-[28.224px] font-semibold leading-[1.05] tracking-[-0.04em]">Your<br />listings</h1>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSearchOpen((current) => !current)}
                aria-label="Search listings"
                aria-expanded={isSearchOpen}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[var(--color-surface-muted)] active:scale-95"
              >
                <FiSearch className="h-2 w-2" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setLayout((current) => (current === 'list' ? 'grid' : 'list'))}
                aria-label={layout === 'list' ? 'Use grid layout' : 'Use list layout'}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[var(--color-surface-muted)] active:scale-95"
              >
                {layout === 'list' ? <FiGrid className="h-4 w-4" /> : <FiList className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => navigate(ROUTES.hostListingSetup)}
                aria-label="Create another listing"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[var(--color-surface-muted)] active:scale-95"
              >
                <FiPlus className="h-[19.8px] w-[19.8px]" aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label={isManageMode ? 'Finish managing listings' : 'Manage listings'}
                aria-pressed={isManageMode}
                onClick={() => setIsManageMode((current) => !current)}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-md active:scale-95 ${isManageMode ? 'bg-[var(--color-text-primary)] text-[var(--color-surface)]' : 'bg-[var(--color-surface-muted)]'}`}
              >
                <FiEdit3 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {isSearchOpen ? (
            <label className="mt-4 flex h-10 items-center gap-2 rounded-md border border-[var(--color-border)] px-4">
              <FiSearch className="h-2 w-2 text-[var(--color-text-secondary)]" aria-hidden="true" />
              <span className="sr-only">Search your listings</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                autoFocus
                placeholder="Search listings"
                className="min-w-0 flex-1 bg-transparent text-[14.112px] outline-none"
              />
            </label>
          ) : null}
        </div>

        <div className="px-4 pb-[calc(168px+env(safe-area-inset-bottom))] pt-8">
          {isLoading ? (
            <div className="grid gap-3">
              {[0, 1, 2].map((item) => <div key={item} className="h-16 animate-pulse rounded-sm bg-[var(--color-surface-muted)]" />)}
            </div>
          ) : visibleListings.length === 0 ? (
            <div className="py-20 text-center">
              <h2 className="text-base font-semibold">No listings found</h2>
              <p className="mx-auto mt-2 max-w-[286px] text-[14.112px] leading-5 text-[var(--color-text-secondary)]">Create a listing or change your search to see results here.</p>
            </div>
          ) : (
            <div className="space-y-9">
              {actionRequiredListings.length ? (
                <div ref={mobileActionRequiredRef}>
                  <h2 className="mb-4 text-[18.816px] font-semibold tracking-[-0.02em]">Action required</h2>
                  <div className={layout === 'grid' ? 'grid grid-cols-2 gap-3' : 'grid gap-2.5'}>{actionRequiredListings.map(renderMobileListing)}</div>
                </div>
              ) : null}

              {inProgressListings.length ? (
                <div>
                  <h2 className="mb-4 text-[18.816px] font-semibold tracking-[-0.02em]">In progress</h2>
                  <div className={layout === 'grid' ? 'grid grid-cols-2 gap-3' : 'grid gap-2.5'}>{inProgressListings.map(renderMobileListing)}</div>
                </div>
              ) : null}

              {activeListings.length ? (
                <div>
                  <h2 className="mb-4 text-[18.816px] font-semibold tracking-[-0.02em]">Published</h2>
                  <div className={layout === 'grid' ? 'grid grid-cols-2 gap-3' : 'grid gap-2.5'}>{activeListings.map(renderMobileListing)}</div>
                </div>
              ) : null}
            </div>
          )}
        </div>

        <MobileAttentionCard
          onClick={() => mobileActionRequiredRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          className="fixed inset-x-0 bottom-[72.6px] z-30"
        />
      </div>

      <div className="mx-auto hidden w-full max-w-[1408px] px-8 py-8 md:block lg:px-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold tracking-tight">Your listings</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSearchOpen((current) => !current)}
              aria-label="Search listings"
              aria-expanded={isSearchOpen}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[var(--color-surface-muted)] transition hover:brightness-95"
            >
              <FiSearch className="h-2.5 w-2.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setLayout((current) => (current === 'list' ? 'grid' : 'list'))}
              aria-label={layout === 'list' ? 'Use grid layout' : 'Use list layout'}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[var(--color-surface-muted)] transition hover:brightness-95"
            >
              {layout === 'list' ? <FiGrid className="h-5 w-5" /> : <FiList className="h-5 w-5" />}
            </button>
            <button
              type="button"
              onClick={() => navigate(ROUTES.hostListingSetup)}
              aria-label="Create another listing"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[var(--color-surface-muted)] transition hover:brightness-95"
            >
              <FiPlus className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {isSearchOpen ? (
          <label className="mt-5 flex h-11 max-w-md items-center gap-2 rounded-md border border-[var(--color-border)] px-4">
            <FiSearch className="h-2 w-2 text-[var(--color-text-secondary)]" aria-hidden="true" />
            <span className="sr-only">Search your listings</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              autoFocus
              placeholder="Search by title, type, or location"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
          </label>
        ) : null}

        {isLoading ? (
          <div className="mt-10 h-24 animate-pulse rounded-sm bg-[var(--color-surface-muted)]" />
        ) : visibleListings.length === 0 ? (
          <div className="mt-12 rounded-sm border border-dashed border-[var(--color-border)] p-10 text-center">
            <h2 className="text-lg font-semibold">No listings found</h2>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              Create a listing or change your search to see results here.
            </p>
          </div>
        ) : layout === 'grid' ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleListings.map((listing) => {
              const summary = getListingSummary(listing);
              const status = getStatusDetails(listing.status);
              return (
                <article
                  key={listing.id}
                  role={isListingInteractive(listing) ? 'button' : undefined}
                  tabIndex={isListingInteractive(listing) ? 0 : undefined}
                  aria-busy={openingListingId === listing.id}
                  onClick={isListingInteractive(listing) ? () => void openListing(listing.id) : undefined}
                  onKeyDown={(event) => {
                    if (isListingInteractive(listing) && (event.key === 'Enter' || event.key === ' ')) {
                      event.preventDefault();
                      void openListing(listing.id);
                    }
                  }}
                  className={`overflow-hidden rounded-sm border bg-[var(--color-surface)] shadow-[var(--shadow-sm)] ${
                    listing.id === createdListingId
                      ? 'border-[var(--color-text-primary)]'
                      : 'border-[var(--color-border)]'
                  } ${isListingInteractive(listing) ? 'cursor-pointer transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]' : ''} ${openingListingId === listing.id ? 'animate-pulse' : ''}`}
                >
                  <ListingCover listing={listing} layout="grid" />
                  <div className="p-5">
                    <h2 className="font-semibold">{summary.title}</h2>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{summary.location}</p>
                    <span className="mt-4 flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                      <span className={`h-3 w-3 rounded-sm ${status.color}`} />
                      {status.label}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-8 min-w-0 overflow-x-auto">
            <div className="min-w-[968px]">
              <div className="grid grid-cols-[minmax(280px,1.4fr)_160px_minmax(260px,1fr)_190px_24px] gap-4 px-4 py-4 text-sm font-semibold">
                <span>Listing</span><span>Type</span><span>Location</span><span>Status</span><span />
              </div>
              <div className="grid gap-1">
                {visibleListings.map((listing) => {
                  const summary = getListingSummary(listing);
                  const status = getStatusDetails(listing.status);
                  return (
                    <article
                      key={listing.id}
                      role={isListingInteractive(listing) ? 'button' : undefined}
                      tabIndex={isListingInteractive(listing) ? 0 : undefined}
                      aria-busy={openingListingId === listing.id}
                      onClick={isListingInteractive(listing) ? () => void openListing(listing.id) : undefined}
                      onKeyDown={(event) => {
                        if (isListingInteractive(listing) && (event.key === 'Enter' || event.key === ' ')) {
                          event.preventDefault();
                          void openListing(listing.id);
                        }
                      }}
                      className={`grid min-h-[96.8px] grid-cols-[minmax(280px,1.4fr)_160px_minmax(260px,1fr)_190px_24px] items-center gap-4 rounded-sm px-4 transition ${
                        listing.id === createdListingId ? 'bg-[var(--color-surface-muted)]' : ''
                      } ${isListingInteractive(listing) ? 'cursor-pointer hover:bg-[var(--color-surface-muted)]' : ''} ${openingListingId === listing.id ? 'animate-pulse' : ''}`}
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <ListingCover listing={listing} layout="list" />
                        <span className="truncate font-semibold">{summary.title}</span>
                      </div>
                      <span className="text-sm text-[var(--color-text-secondary)]">{summary.type}</span>
                      <span className="truncate text-sm text-[var(--color-text-secondary)]">{summary.location}</span>
                      <span className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                        <span className={`h-3 w-3 rounded-sm ${status.color}`} />
                        {status.label}
                      </span>
                      {isListingInteractive(listing) ? <FiChevronRight className="h-5 w-5" aria-hidden="true" /> : <span />}
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
      {selectedListing ? (
        <InProgressListingDialog
          open
          title={`Your ${getListingSummary(selectedListing).type} listing started ${formatDate(
            (selectedListing.createdAt ?? selectedListing.updatedAt)?.toDate() ?? new Date(),
            i18n.resolvedLanguage
          )}`}
          location={getListingSummary(selectedListing).location}
          cover={<ListingCover listing={selectedListing} layout="dialog" />}
          isRemoving={isRemovingListing}
          onClose={() => setSelectedListing(null)}
          onEdit={() => resumeListing(selectedListing)}
          onRemove={() => void removeListing(selectedListing)}
        />
      ) : null}
    </motion.section>
  );
}

function MessagesView({ onOpenAttention }: { onOpenAttention: () => void }) {
  const { t } = useTranslation('dashboard');
  const { t: tCommon } = useTranslation('common');
  const [filter, setFilter] = useState<MessageFilter>('all');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [search, setSearch] = useState('');

  const clearFilters = () => {
    setFilter('all');
    setSearch('');
    setIsSearchOpen(false);
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="min-h-[calc(100dvh-66px)] bg-[var(--color-surface)] md:min-h-[calc(100vh-95px)]"
    >
      <div className="min-h-[calc(100dvh-66px)] px-4 pb-[calc(150px+env(safe-area-inset-bottom))] pt-7 md:hidden">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-[28.224px] font-semibold tracking-[-0.035em]">{t('messages.title')}</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={t('messages.search')}
              aria-expanded={isSearchOpen}
              onClick={() => setIsSearchOpen((open) => !open)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--color-text-primary)] active:scale-95"
            >
              <FiSearch className="h-2 w-2" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label={t('messages.settings')}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--color-text-primary)] active:scale-95"
            >
              <FiSettings className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {isSearchOpen ? (
          <label className="mt-4 flex h-10 items-center gap-2 rounded-md border border-[var(--color-border)] px-4">
            <FiSearch className="h-2 w-2 text-[var(--color-text-secondary)]" aria-hidden="true" />
            <span className="sr-only">{tCommon('actions.search')}</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              autoFocus
              placeholder={tCommon('actions.search')}
              className="min-w-0 flex-1 bg-transparent text-[14.112px] outline-none placeholder:text-[var(--color-text-secondary)]"
            />
          </label>
        ) : null}

        <div className="-mx-4 mt-8 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max gap-2">
            {([
              ['all', 'All'],
              ['hosting', 'Hosting'],
              ['traveling', 'Traveling'],
              ['support', 'Support']
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                aria-pressed={filter === value}
                className={`h-9 rounded-md border px-4 text-[11.76px] font-semibold transition active:scale-95 ${
                  filter === value
                    ? 'border-[var(--color-text-primary)] bg-[var(--color-text-primary)] text-[var(--color-surface)]'
                    : 'border-[var(--color-text-primary)] bg-[var(--color-surface)]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-10 flex max-w-[308px] flex-col items-center text-center">
          <span className="relative inline-flex h-10 w-10 items-center justify-center" aria-hidden="true">
            <FiMessageSquare className="absolute left-1 top-1 h-7 w-7" />
            <FiMessageSquare className="absolute bottom-0 right-0 h-6 w-6 fill-[var(--color-surface)]" />
          </span>
          <h2 className="mt-5 text-[15.288px] font-semibold">You don&apos;t have any messages</h2>
          <p className="mt-2 text-[12.936px] leading-[1.5] text-[var(--color-text-secondary)]">
            When you receive a new message, it will appear here.
          </p>
        </div>

        <MobileAttentionCard onClick={onOpenAttention} className="fixed inset-x-0 bottom-[72.6px] z-30" />
      </div>

      <div className="hidden md:block">
        <div className="h-32 border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]" />
        <div className="flex min-h-[calc(100vh-223px)] bg-[var(--color-surface)]">
        <aside className="w-full border-r border-[var(--color-border)] px-5 py-7 sm:px-8 lg:w-[462px] lg:px-12">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-semibold tracking-tight">{t('messages.title')}</h1>
            <div className="flex gap-2">
              <button
                type="button"
                aria-label={t('messages.search')}
                aria-expanded={isSearchOpen}
                onClick={() => setIsSearchOpen((open) => !open)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[var(--color-surface-muted)] transition hover:brightness-95"
              >
                <FiSearch className="h-2.5 w-2.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label={t('messages.settings')}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[var(--color-surface-muted)] transition hover:brightness-95"
              >
                <FiSettings className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {isSearchOpen ? (
            <label className="mt-4 flex h-11 items-center gap-2 rounded-md border border-[var(--color-border)] px-4">
              <FiSearch className="h-2 w-2 text-[var(--color-text-secondary)]" aria-hidden="true" />
              <span className="sr-only">{tCommon('actions.search')}</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                autoFocus
                placeholder={tCommon('actions.search')}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--color-text-secondary)]"
              />
            </label>
          ) : null}

          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`inline-flex h-10 items-center gap-2 rounded-md px-5 text-sm font-semibold transition ${
                filter === 'all'
                  ? 'bg-[var(--color-text-primary)] text-[var(--color-surface)]'
                  : 'border border-[var(--color-text-primary)]'
              }`}
            >
              {t('messages.all')}
              <FiChevronDown className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={`h-10 rounded-md px-5 text-sm font-semibold transition ${
                filter === 'unread'
                  ? 'bg-[var(--color-text-primary)] text-[var(--color-surface)]'
                  : 'border border-[var(--color-text-primary)]'
              }`}
            >
              {t('messages.unread')}
            </button>
          </div>

          <div className="mx-auto mt-10 flex max-w-xs flex-col items-center text-center sm:mt-12">
            <FiMessageSquare className="h-9 w-9" aria-hidden="true" />
            <h2 className="mt-6 text-base font-semibold">{t('messages.empty')}</h2>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              {t('messages.emptyHelp')}
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-6 rounded-md border border-[var(--color-text-primary)] px-5 py-2.5 text-sm font-semibold transition hover:bg-[var(--color-surface-muted)]"
            >
              {t('messages.clearFilters')}
            </button>
          </div>
        </aside>
        <div className="hidden flex-1 bg-[var(--color-surface)] lg:block" aria-hidden="true" />
        </div>
      </div>
    </motion.section>
  );
}

const mobileMenuItems = [
  { label: 'Account settings', Icon: FiSettings, path: ROUTES.hostAccountSettings },
  { label: 'Languages & currency', Icon: FiGlobe, path: ROUTES.hostAccountSettings, section: 'languages-currency' },
  { label: 'Hosting resources', Icon: FiBookOpen },
  { label: 'Get help', Icon: FiHelpCircle },
  { label: 'Find a co-host', Icon: FiUserPlus },
  { label: 'Create a new listing', Icon: FiPlus, path: ROUTES.hostListingSetup },
  { label: 'Refer a host', Icon: FiUsers }
] as const;

function MobileHostMenu({ onOpenAttention }: { onOpenAttention: () => void }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useTranslation('dashboard');
  const initial = user?.name?.trim().charAt(0).toUpperCase() || 'H';

  const openMenuItem = (item: (typeof mobileMenuItems)[number]) => {
    if ('path' in item) {
      navigate(item.path, { state: 'section' in item ? { section: item.section } : undefined });
      return;
    }
    toast(`${item.label} is coming soon.`);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="h-[calc(100dvh-66px)] overflow-y-auto bg-[var(--color-surface)] px-4 pb-[calc(176px+env(safe-area-inset-bottom))] pt-5 md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          aria-label="Notifications"
          onClick={() => toast('You have no new notifications.')}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[var(--color-surface-muted)] active:scale-95"
        >
          <FiBell className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label={`Profile for ${user?.name ?? 'Booksa'}`}
          onClick={() => navigate(ROUTES.hostProfile)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-pink-100 text-[14.112px] font-semibold text-pink-700 active:scale-95"
        >
          {initial}
        </button>
      </div>

      <h1 className="mt-5 text-[32.928px] font-semibold tracking-[-0.045em]">{t('drawer.title')}</h1>

      <section className="mt-7 rounded-sm bg-[var(--color-surface-muted)] px-5 pb-5 pt-4 text-center">
        <div className="relative mx-auto h-[138.6px] max-w-[286px]" aria-hidden="true">
          {hostOnboardingImages.map((image, index) => {
            const positions = [
              { left: '8%', top: '38px', rotate: '-8deg', zIndex: 1 },
              { left: '33%', top: '12px', rotate: '2deg', zIndex: 2 },
              { left: '58%', top: '36px', rotate: '8deg', zIndex: 1 }
            ] as const;
            const position = positions[index];
            return (
              <ShimmerImage
                key={image}
                src={image}
                alt=""
                aria-hidden="true"
                className="absolute h-[90.2px] w-[107.8px] rounded-sm border-[3px] border-[var(--color-surface-muted)] object-cover shadow-md"
                style={{ left: position.left, top: position.top, rotate: position.rotate, zIndex: position.zIndex }}
              />
            );
          })}
        </div>
        <h2 className="text-[17.64px] font-semibold">{t('drawer.newToBooksa')}</h2>
        <p className="mx-auto mt-1 max-w-[264px] text-[12.936px] leading-[1.45] text-[var(--color-text-secondary)]">
          {t('drawer.onboarding')}
        </p>
        <button
          type="button"
          onClick={() => navigate(ROUTES.hostListingSetup)}
          className="mt-5 h-10 w-full rounded-md border border-[var(--color-text-primary)] bg-[var(--color-surface)] text-[12.936px] font-semibold active:scale-[0.99]"
        >
          Get started
        </button>
      </section>

      <nav aria-label="Host account menu" className="mt-5">
        {mobileMenuItems.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => openMenuItem(item)}
            className="flex min-h-12 w-full items-center gap-4 rounded-md py-2 text-left active:bg-[var(--color-surface-muted)]"
          >
            <item.Icon className="h-5 w-5 shrink-0 stroke-[1.6]" aria-hidden="true" />
            <span className="min-w-0 flex-1 text-[15.288px]">{item.label}</span>
            <FiChevronRight className="h-4 w-4 shrink-0 text-[var(--color-text-secondary)]" aria-hidden="true" />
          </button>
        ))}
      </nav>

      <div className="mt-4 border-y border-[var(--color-border)] py-4">
        <button
          type="button"
          onClick={() => void logout()}
          className="flex min-h-12 w-full items-center gap-4 rounded-md py-2 text-left active:bg-[var(--color-surface-muted)]"
        >
          <FiLogOut className="h-5 w-5 shrink-0 stroke-[1.6]" aria-hidden="true" />
          <span className="min-w-0 flex-1 text-[15.288px]">Log out</span>
          <FiChevronRight className="h-4 w-4 shrink-0 text-[var(--color-text-secondary)]" aria-hidden="true" />
        </button>
      </div>

      <button
        type="button"
        onClick={() => toast('The Booksa app download is coming soon.')}
        className="mt-7 h-11 w-full rounded-md border border-[var(--color-text-primary)] text-[15.288px] font-semibold active:scale-[0.99]"
      >
        Download the app
      </button>

      <div className="mt-8 text-center text-[10.584px] text-[var(--color-text-secondary)]">
        <p>
          <button type="button" className="underline underline-offset-2">Terms of Service</button>
          <span aria-hidden="true"> · </span>
          <button type="button" className="underline underline-offset-2">Privacy Policy</button>
        </p>
        <p className="mt-5">© 2026 Booksa, Inc. All rights reserved.</p>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={() => navigate(ROUTES.home)}
          className="inline-flex h-12 items-center gap-2 rounded-md bg-neutral-900 px-7 text-[15.288px] font-semibold text-white active:scale-95"
        >
          <FiRefreshCw className="h-4 w-4" aria-hidden="true" />
          Switch to traveling
        </button>
      </div>

      <MobileAttentionCard onClick={onOpenAttention} className="fixed inset-x-0 bottom-[72.6px] z-30" />
    </motion.section>
  );
}

export default function HostListingsPage() {
  const { t } = useTranslation('dashboard');
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [reservationView, setReservationView] = useState<ReservationView>('today');
  const routeState = location.state as {
    section?: HostSection;
    createdListingId?: string;
  } | null;
  const requestedSection = routeState?.section;
  const [activeSection, setActiveSection] = useState<HostSection>(
    hostNavigation.some(({ id }) => id === requestedSection) && requestedSection
      ? requestedSection
      : 'today'
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const initial = user?.name?.trim().charAt(0).toUpperCase() || 'H';

  const handleNavigation = (item: (typeof hostNavigation)[number]) => {
    setActiveSection(item.id);
    if (item.id === 'today') setReservationView('today');
    if (item.id === 'calendar') setReservationView('upcoming');
  };

  return (
    <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)]">
      <header className="hidden border-b border-[var(--color-border)] bg-[var(--color-surface)] md:block">
        <div className="mx-auto flex min-h-[103.4px] max-w-[1540px] items-center justify-between gap-5 px-5 sm:px-8 lg:px-12">
          <button
            type="button"
            onClick={() => setActiveSection('today')}
            aria-label={t('accessibility.hostHome')}
          >
            <BooksaLogo className="h-10 w-[118.8px]" />
          </button>

          <nav aria-label={t('nav.host')} className="hidden items-center gap-8 md:flex">
            {hostNavigation.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigation(item)}
                className={`border-b py-2 text-sm transition hover:opacity-70 ${
                  item.id === activeSection
                    ? 'border-[var(--color-text-primary)] font-semibold'
                    : 'border-transparent text-[var(--color-text-secondary)]'
                }`}
              >
                {t(item.labelKey)}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(ROUTES.home)}
              className="hidden text-sm font-semibold transition hover:opacity-70 sm:block"
            >
              {t('nav.travelerMode')}
            </button>
            
            
            <button
              type="button"
              onClick={() => navigate(ROUTES.hostProfile)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-[var(--color-primary-100)] text-sm font-semibold text-[var(--color-primary-700)]"
              aria-label={t('accessibility.hostAccount', { name: user?.name ?? 'Booksa' })}
            >
              {initial}
            </button>


            <div>
              <button
                type="button"
                aria-label={t('accessibility.accountMenu')}
                aria-expanded={isMenuOpen}
                onClick={() => setIsMenuOpen((open) => !open)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-[var(--color-surface-muted)] transition hover:opacity-75"
              >
                <FiMenu className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        <nav aria-label={t('nav.hostMobile')} className="flex justify-center gap-6 overflow-x-auto border-t border-[var(--color-border)] px-4 py-3 md:hidden">
          {hostNavigation.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavigation(item)}
              className={`shrink-0 border-b pb-1 text-sm ${
                item.id === activeSection
                  ? 'border-[var(--color-text-primary)] font-semibold'
                  : 'border-transparent text-[var(--color-text-secondary)]'
              }`}
            >
              {t(item.labelKey)}
            </button>
          ))}
        </nav>
      </header>
      <HostAccountDrawer open={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {activeSection === 'menu' ? (
        <MobileHostMenu onOpenAttention={() => setActiveSection('listings')} />
      ) : activeSection === 'messages' ? (
        <MessagesView onOpenAttention={() => setActiveSection('listings')} />
      ) : activeSection === 'listings' ? (
        <ListingsView createdListingId={routeState?.createdListingId} />
      ) : (
        <>
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex h-[calc(100dvh-66px)] flex-col overflow-hidden bg-[var(--color-surface)] text-center md:hidden"
          >
            <div className="flex shrink-0 justify-center gap-2 px-5 pt-6">
              <button
                type="button"
                onClick={() => setReservationView('today')}
                className={`h-7 rounded-md border px-3 text-[12.936px] font-semibold transition ${
                  reservationView === 'today'
                    ? 'border-[var(--color-text-primary)] bg-[var(--color-text-primary)] text-[var(--color-surface)] shadow-sm'
                    : 'border-[var(--color-text-primary)] bg-[var(--color-surface)]'
                }`}
              >
                {t('nav.today')}
              </button>
              <button
                type="button"
                onClick={() => setReservationView('upcoming')}
                className={`h-7 rounded-md border px-3 text-[12.936px] font-semibold transition ${
                  reservationView === 'upcoming'
                    ? 'border-[var(--color-text-primary)] bg-[var(--color-text-primary)] text-[var(--color-surface)] shadow-sm'
                    : 'border-[var(--color-text-primary)] bg-[var(--color-surface)]'
                }`}
              >
                {t('reservations.upcoming')}
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-8 pb-5">
              <div className="relative flex h-32 w-40 items-center justify-center">
                <span className="select-none text-[108.192px] leading-none" aria-hidden="true">📖</span>
                <ThreeDIcon
                  name="reservationNotebook"
                  sourceSize={200}
                  className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_10px_12px_rgba(15,23,42,0.15)]"
                />
              </div>
              <h1 className="mt-5 max-w-[275px] text-[23.52px] font-semibold leading-[1.12] tracking-[-0.035em]">
                {t('reservations.empty')}
              </h1>
              <p className="mt-3 max-w-[297px] text-[15.288px] leading-[1.45] text-[var(--color-text-secondary)]">
                {t('reservations.emptyHelp')}
              </p>
              <button
                type="button"
                onClick={() => navigate(ROUTES.hostListingSetup)}
                className="mt-7 rounded-md border border-[var(--color-text-primary)] px-3 py-2 text-[14.112px] font-semibold transition active:scale-95"
              >
                {t('reservations.finishListing')}
              </button>
            </div>

            <MobileAttentionCard onClick={() => setActiveSection('listings')} className="shrink-0" />
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="mx-auto hidden min-h-[calc(100vh-95px)] max-w-3xl flex-col items-center px-5 pb-16 pt-6 text-center md:flex"
          >
            <div className="inline-flex rounded-sm bg-[var(--color-surface-muted)] p-1.5">
              <button type="button" onClick={() => setReservationView('today')} className={`rounded-md px-6 py-3 text-sm font-semibold transition ${reservationView === 'today' ? 'bg-[var(--color-surface)] shadow-[var(--shadow-sm)]' : 'text-[var(--color-text-secondary)]'}`}>
                {t('nav.today')}
              </button>
              <button type="button" onClick={() => setReservationView('upcoming')} className={`rounded-md px-6 py-3 text-sm font-semibold transition ${reservationView === 'upcoming' ? 'bg-[var(--color-surface)] shadow-[var(--shadow-sm)]' : 'text-[var(--color-text-secondary)]'}`}>
                {t('reservations.upcoming')}
              </button>
            </div>
            <div className="mt-14 flex max-w-md flex-col items-center sm:mt-16">
              <span className="select-none text-[114.58944px] leading-none drop-shadow-sm" role="img" aria-label={t('reservations.calendarImage')}>📖</span>
              <h1 className="mt-8 text-[29.6352px] font-semibold leading-[1.08] tracking-[-0.035em] sm:text-[33.58656px]">{t('reservations.empty')}</h1>
              <p className="mt-5 max-w-sm text-base leading-6 text-[var(--color-text-secondary)] sm:text-lg">{t('reservations.emptyHelp')}</p>
              <button type="button" onClick={() => navigate(ROUTES.hostListingSetup)} className="mt-8 rounded-md bg-[var(--color-surface-muted)] px-7 py-3.5 text-base font-semibold transition hover:brightness-95">{t('reservations.finishListing')}</button>
            </div>
          </motion.section>
        </>
      )}

      <nav
        aria-label={t('nav.hostMobile')}
        className="fixed inset-x-0 bottom-0 z-40 grid h-[72.6px] grid-cols-5 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-1 pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {mobileHostNavigation.map(({ id, labelKey, Icon }) => {
          const isActive = activeSection === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => handleNavigation(hostNavigation.find((item) => item.id === id)!)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center gap-1 text-[10.584px] font-medium ${isActive ? 'font-semibold text-[#e9145f]' : 'text-[var(--color-text-secondary)]'}`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.3]' : 'stroke-[1.7]'}`} aria-hidden="true" />
              <span>{t(labelKey)}</span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setActiveSection('menu')}
          aria-current={activeSection === 'menu' ? 'page' : undefined}
          className={`flex flex-col items-center justify-center gap-1 text-[10.584px] font-medium ${activeSection === 'menu' ? 'font-semibold text-[#e9145f]' : 'text-[var(--color-text-secondary)]'}`}
        >
          <FiMenu className={`h-5 w-5 ${activeSection === 'menu' ? 'stroke-[2.3]' : 'stroke-[1.7]'}`} aria-hidden="true" />
          <span>Menu</span>
        </button>
      </nav>
    </main>
  );
}
