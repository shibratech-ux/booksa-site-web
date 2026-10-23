import { getListingResumeTarget } from './create-listing/listingResume';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Bookmark,
  Bell,
  BookOpen,
  Calendar,
  ChevronRight,
  Clipboard,
  PenLine,
  LayoutGrid,
  Globe,
  CircleHelp,
  House,
  List,
  MenuIcon,
  MessageSquare,
  Plus,
  LogOut,
  RefreshCw,
  SearchIcon,
  Settings,
  UserPlus,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import BooksaLogo from '@/components/layout/BooksaLogo';
import { HostAccountDrawer, hostOnboardingImages } from '@/components/layout/HostAccountDrawer';
import { ShimmerImage } from '@/components/ui/ShimmerImage';
import { ThreeDIcon } from '@/components/ui/ThreeDIcon';
import { MessagesInbox } from '@/components/messages/MessagesInbox';
import todayReservationsImage from '@/assets/images/today_reservations.png';
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
import { CurrentListingEditor } from './components/CurrentListingEditor';
import { HostCalendar, type CalendarListing } from './calendar/HostCalendar';
import { resolveListingPricing } from '@/domain/calendar';
import { getListingCoverUrl } from '@/domain/listing-photos';

const hostNavigation = [
  { id: 'today', labelKey: 'nav.today' },
  { id: 'calendar', labelKey: 'nav.calendar' },
  { id: 'listings', labelKey: 'nav.listings' },
  { id: 'messages', labelKey: 'nav.messages' }
] as const;

const mobileHostNavigation = [
  { id: 'today', labelKey: 'nav.today', Icon: Bookmark },
  { id: 'calendar', labelKey: 'nav.calendar', Icon: Calendar },
  { id: 'listings', labelKey: 'nav.listings', Icon: Clipboard },
  { id: 'messages', labelKey: 'nav.messages', Icon: MessageSquare }
] as const;
type ReservationView = 'today' | 'upcoming';
type HostSection = (typeof hostNavigation)[number]['id'] | 'menu';



const getStatusDetails = (status: ListingDraft['status']) => {
  if (status === 'active') return { label: 'Active', color: 'bg-[var(--color-success)]' };
  if (status === 'published') return { label: 'Published', color: 'bg-[var(--color-success)]' };
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
  if (listing.generatedSummary) return listing.generatedSummary;

  const flowDraft = listing.flowDraft ?? {};
  const confirmedLocation = listing.confirmedLocation ?? {};
  const address =
    confirmedLocation.address && typeof confirmedLocation.address === 'object'
      ? (confirmedLocation.address as Record<string, unknown>)
      : {};
  const locationParts = [address.city, address.region, address.country].filter(
    (part): part is string => typeof part === 'string' && Boolean(part.trim())
  );
  const coverImageUrl = getListingCoverUrl(listing);

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
  const imageUrl = getListingCoverUrl(listing);
  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => setHasImageError(false), [imageUrl]);

  if (!imageUrl || hasImageError) {
    if (layout === 'mobile') {
      return <span className="inline-flex h-14 w-14 shrink-0 rounded-[calc(var(--radius-photo)*0.7)] bg-[var(--color-border)]" aria-label="No listing cover available" />;
    }

    if (layout === 'grid') {
      return (
        <div className="flex aspect-[4/3] items-center justify-center bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]">
          <House className="h-9 w-9" aria-label="No listing cover available" />
        </div>
      );
    }

    if (layout === 'dialog') {
      return <House className="h-10 w-10 text-[var(--color-text-secondary)]" aria-label="No listing cover available" />;
    }

    return (
      <span className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-[calc(var(--radius-photo)*0.7)] bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]">
        <House className="h-6 w-6" aria-label="No listing cover available" />
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
      <span className="inline-flex h-14 w-14 shrink-0 overflow-hidden rounded-[calc(var(--radius-photo)*0.7)] bg-[var(--color-border)]">
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
    <span className="inline-flex h-16 w-16 shrink-0 overflow-hidden rounded-[calc(var(--radius-photo)*0.7)] bg-[var(--color-border)]">
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

function MobileAttentionCard({ onClick, className = '', compactText = false }: { onClick: () => void; className?: string; compactText?: boolean }) {
  const { t } = useTranslation('dashboard');

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-20 items-center gap-3 rounded-t-2xl border-t border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-4 text-left shadow-[0_-4px_16px_rgba(0,0,0,0.04)] ${className}`}
    >
      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center">
        <span className="text-2xl" aria-hidden="true">📅</span>
        <ThreeDIcon name="attentionCalendar" sourceSize={60} className="absolute inset-0 h-full w-full object-contain" />
        <span className={`absolute -left-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-neutral-900 px-1 font-bold text-white ${compactText ? 'text-[10.8px]' : 'text-xs'}`}>4</span>
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block font-semibold leading-5 ${compactText ? 'text-[13.5px]' : 'text-[15px]'}`}>{t('attention.title')}</span>
        <span className={`mt-0.5 block leading-5 text-[var(--color-text-secondary)] ${compactText ? 'text-[12.6px]' : 'text-sm'}`}>{t('attention.subtitle')}</span>
      </span>
    </button>
  );
}

function ListingsView({ createdListingId, onOpenCalendar }: { createdListingId?: string; onOpenCalendar: () => void }) {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { t } = useTranslation('dashboard');
  const [listings, setListings] = useState<ListingDraft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [layout, setLayout] = useState<'list' | 'grid'>('list');
  const [isManageMode, setIsManageMode] = useState(false);
  const [selectedListing, setSelectedListing] = useState<ListingDraft | null>(null);
  const [actionRequiredListing, setActionRequiredListing] = useState<ListingDraft | null>(null);
  const handleListingChange = useCallback((updated: ListingDraft) => {
    setListings((current) => current.map((listing) => listing.id === updated.id ? updated : listing));
  }, []);
  const [openingListingId, setOpeningListingId] = useState<string | null>(null);
  const [isRemovingListing, setIsRemovingListing] = useState(false);
  const mobileActionRequiredRef = useRef<HTMLDivElement>(null);
  // Keeps the sheet's content while it animates closed after `selectedListing` is cleared.
  const lastSelectedListing = useRef<ListingDraft | null>(null);
  if (selectedListing) lastSelectedListing.current = selectedListing;
  const sheetListing = selectedListing ?? lastSelectedListing.current;

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
  // "Ready for guests" listings reopen in the same editor so hosts can keep improving them (photos, title, price…).
  const isReadyForGuests = (listing: ListingDraft) => listing.status === 'published';
  const isListingInteractive = (listing: ListingDraft) =>
    isInProgress(listing) || isActionRequired(listing) || isReadyForGuests(listing);
  // Deployed from the listing editor (`action-required → published`).
  const readyListings = visibleListings.filter(isReadyForGuests);
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
        className={`flex min-w-0 gap-3 rounded-card text-left transition ${layout === 'grid' ? 'flex-col items-start border border-[var(--color-border)] p-3' : 'items-center py-1'} ${interactive ? 'cursor-pointer active:bg-[var(--color-surface-muted)]' : ''} ${openingListingId === listing.id ? 'animate-pulse' : ''}`}
      >
        <div className={layout === 'grid' ? 'w-full overflow-hidden rounded-[calc(var(--radius-photo)*0.7)]' : 'shrink-0'}>
          <ListingCover listing={listing} layout={layout === 'grid' ? 'grid' : 'mobile'} />
        </div>
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-semibold leading-4">{getMobileListingTitle(listing)}</span>
          <span className="mt-0.5 line-clamp-2 block text-xs leading-[1.45] text-[var(--color-text-secondary)]">{summary.location}</span>
        </span>
        {isManageMode ? <ChevronRight className="h-4 w-4 shrink-0 text-[var(--color-text-secondary)]" aria-hidden="true" /> : null}
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
      } else if (isActionRequired(currentListing) || isReadyForGuests(currentListing)) {
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
      window.sessionStorage.setItem(STORAGE_KEYS.listingDraftFlow, JSON.stringify(listing.flowDraft));
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
      <CurrentListingEditor
        listingId={actionRequiredListing.id}
        onListingChange={handleListingChange}
        onBack={() => setActionRequiredListing(null)}
        onOpenCalendar={onOpenCalendar}
      />
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="min-h-[calc(100dvh-72px-env(safe-area-inset-bottom))] bg-[var(--color-surface)] md:min-h-[calc(100vh-95px)]"
    >
      <div className="hidden h-32 border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] md:block" />

      <div className="md:hidden">
        <div className="sticky top-0 z-20 bg-[var(--color-surface)] px-4 pb-4 pt-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-[28px] font-semibold leading-[1.05] tracking-[-0.04em]">Your listings</h1>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSearchOpen((current) => !current)}
                aria-label="Search listings"
                aria-expanded={isSearchOpen}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-surface-muted)] active:scale-95"
              >
                <SearchIcon className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setLayout((current) => (current === 'list' ? 'grid' : 'list'))}
                aria-label={layout === 'list' ? 'Use grid layout' : 'Use list layout'}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-surface-muted)] active:scale-95"
              >
                {layout === 'list' ? <LayoutGrid className="h-4 w-4" aria-hidden="true" /> : <List className="h-4 w-4" aria-hidden="true" />}
              </button>
              <button
                type="button"
                onClick={() => navigate(ROUTES.hostListingSetup)}
                aria-label="Create another listing"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-surface-muted)] active:scale-95"
              >
                <Plus className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label={isManageMode ? 'Finish managing listings' : 'Manage listings'}
                aria-pressed={isManageMode}
                onClick={() => setIsManageMode((current) => !current)}
                className={`inline-flex h-11 w-11 items-center justify-center rounded-full active:scale-95 ${isManageMode ? 'bg-[var(--color-text-primary)] text-[var(--color-surface)]' : 'bg-[var(--color-surface-muted)]'}`}
              >
                <PenLine className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {isSearchOpen ? (
            <label className="mt-4 flex h-12 items-center gap-2 rounded-field border border-[var(--color-border)] px-4">
              <SearchIcon className="h-5 w-5 text-[var(--color-text-secondary)]" aria-hidden="true" />
              <span className="sr-only">Search your listings</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                autoFocus
                placeholder="Search listings"
                className="h-full min-w-0 flex-1 bg-transparent text-base sm:text-sm outline-none"
              />
            </label>
          ) : null}
        </div>

        <div className="px-4 pb-[calc(168px+env(safe-area-inset-bottom))] pt-8">
          {isLoading ? (
            <div className="grid gap-3">
              {[0, 1, 2].map((item) => <div key={item} className="h-16 animate-pulse rounded-card bg-[var(--color-surface-muted)]" />)}
            </div>
          ) : visibleListings.length === 0 ? (
            <div className="py-20 text-center">
              <h2 className="text-base font-semibold">No listings found</h2>
              <p className="mx-auto mt-2 max-w-[286px] text-sm leading-5 text-[var(--color-text-secondary)]">Create a listing or change your search to see results here.</p>
            </div>
          ) : (
            <div className="space-y-9">
              {readyListings.length ? (
                <div>
                  <h2 className="mb-4 text-lg font-semibold tracking-[-0.02em]">{t('listingPublishReady.sectionTitle')}</h2>
                  <div className={layout === 'grid' ? 'grid grid-cols-2 gap-3' : 'grid gap-2.5'}>{readyListings.map(renderMobileListing)}</div>
                </div>
              ) : null}

              {actionRequiredListings.length ? (
                <div ref={mobileActionRequiredRef}>
                  <h2 className="mb-4 text-lg font-semibold tracking-[-0.02em]">Action required</h2>
                  <div className={layout === 'grid' ? 'grid grid-cols-2 gap-3' : 'grid gap-2.5'}>{actionRequiredListings.map(renderMobileListing)}</div>
                </div>
              ) : null}

              {inProgressListings.length ? (
                <div>
                  <h2 className="mb-4 text-lg font-semibold tracking-[-0.02em]">In progress</h2>
                  <div className={layout === 'grid' ? 'grid grid-cols-2 gap-3' : 'grid gap-2.5'}>{inProgressListings.map(renderMobileListing)}</div>
                </div>
              ) : null}

              {activeListings.length ? (
                <div>
                  <h2 className="mb-4 text-lg font-semibold tracking-[-0.02em]">Published</h2>
                  <div className={layout === 'grid' ? 'grid grid-cols-2 gap-3' : 'grid gap-2.5'}>{activeListings.map(renderMobileListing)}</div>
                </div>
              ) : null}
            </div>
          )}
        </div>

        <MobileAttentionCard
          onClick={() => mobileActionRequiredRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          className="fixed inset-x-0 bottom-[calc(72px+env(safe-area-inset-bottom))] z-30"
        />
      </div>

      <div className="mx-auto hidden w-full max-w-[1280px] px-8 py-8 md:block lg:px-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold tracking-tight">Your listings</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSearchOpen((current) => !current)}
              aria-label="Search listings"
              aria-expanded={isSearchOpen}
              className="inline-flex h-10 max-sm:h-11 max-sm:w-11 w-10 items-center justify-center rounded-full bg-[var(--color-surface-muted)] transition hover:brightness-95"
            >
              <SearchIcon className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setLayout((current) => (current === 'list' ? 'grid' : 'list'))}
              aria-label={layout === 'list' ? 'Use grid layout' : 'Use list layout'}
              className="inline-flex h-10 max-sm:h-11 max-sm:w-11 w-10 items-center justify-center rounded-full bg-[var(--color-surface-muted)] transition hover:brightness-95"
            >
              {layout === 'list' ? <LayoutGrid className="h-5 w-5" aria-hidden="true" /> : <List className="h-5 w-5" aria-hidden="true" />}
            </button>
            <button
              type="button"
              onClick={() => navigate(ROUTES.hostListingSetup)}
              aria-label="Create another listing"
              className="inline-flex h-10 max-sm:h-11 max-sm:w-11 w-10 items-center justify-center rounded-full bg-[var(--color-surface-muted)] transition hover:brightness-95"
            >
              <Plus className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {isSearchOpen ? (
          <label className="mt-5 flex h-11 max-w-md items-center gap-2 rounded-field border border-[var(--color-border)] px-4">
            <SearchIcon className="h-5 w-5 text-[var(--color-text-secondary)]" aria-hidden="true" />
            <span className="sr-only">Search your listings</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              autoFocus
              placeholder="Search by title, type, or location"
              className="h-full min-w-0 flex-1 bg-transparent text-base sm:text-sm outline-none"
            />
          </label>
        ) : null}

        {isLoading ? (
          <div className="mt-10 h-24 animate-pulse rounded-card bg-[var(--color-surface-muted)]" />
        ) : visibleListings.length === 0 ? (
          <div className="mt-12 rounded-card border border-dashed border-[var(--color-border)] p-10 text-center">
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
                  className={`overflow-hidden rounded-card rounded-t-[calc(var(--radius-card)*0.7)] border bg-[var(--color-surface)] shadow-[var(--shadow-sm)] ${
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
                      <span className={`h-3 w-3 rounded-full ${status.color}`} />
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
                      className={`grid min-h-[96.8px] grid-cols-[minmax(280px,1.4fr)_160px_minmax(260px,1fr)_190px_24px] items-center gap-4 rounded-card px-4 transition ${
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
                        <span className={`h-3 w-3 rounded-full ${status.color}`} />
                        {status.label}
                      </span>
                      {isListingInteractive(listing) ? <ChevronRight className="h-5 w-5" aria-hidden="true" /> : <span />}
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
      {sheetListing ? (
        <InProgressListingDialog
          open={selectedListing !== null}
          title={`Your ${getListingSummary(sheetListing).type} listing started ${formatDate(
            (sheetListing.createdAt ?? sheetListing.updatedAt)?.toDate() ?? new Date(),
            i18n.resolvedLanguage
          )}`}
          location={getListingSummary(sheetListing).location}
          cover={<ListingCover listing={sheetListing} layout="dialog" />}
          isRemoving={isRemovingListing}
          onClose={() => setSelectedListing(null)}
          onEdit={() => resumeListing(sheetListing)}
          onRemove={() => void removeListing(sheetListing)}
        />
      ) : null}
    </motion.section>
  );
}

const toCalendarListing = (listing: ListingDraft): CalendarListing => {
  const location = listing.confirmedLocation?.location as Record<string, unknown> | undefined;
  return {
    id: listing.id,
    title: getListingSummary(listing).title,
    coverImageUrl: getListingCoverUrl(listing),
    ...resolveListingPricing(listing),
    timeZone: typeof location?.timezone === 'string' ? location.timezone : undefined
  };
};

function CalendarView({ onOpenListings }: { onOpenListings: () => void }) {
  const { t } = useTranslation('dashboard');
  const [listings, setListings] = useState<CalendarListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    listCurrentUserListings()
      .then((result) => {
        if (isActive) setListings(result.map(toCalendarListing));
      })
      .catch((error) => {
        console.error('Unable to load calendar listings.', error);
        if (isActive) toast.error(t('calendar.loadError'));
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [t]);

  return (
    <div className="flex h-[calc(100dvh-72px-env(safe-area-inset-bottom))] flex-col md:mx-auto md:h-[calc(100dvh-96px)] md:max-w-3xl">
      <HostCalendar listings={listings} isLoading={isLoading} onOpenListings={onOpenListings} className="flex-1" />
      <MobileAttentionCard onClick={onOpenListings} className="shrink-0 md:hidden" compactText />
    </div>
  );
}

const mobileMenuItems = [
  { label: 'Account settings', Icon: Settings, path: ROUTES.hostAccountSettings },
  { label: 'Languages & currency', Icon: Globe, path: ROUTES.hostAccountSettings, section: 'languages-currency' },
  { label: 'Hosting resources', Icon: BookOpen },
  { label: 'Get help', Icon: CircleHelp },
  { label: 'Find a co-host', Icon: UserPlus },
  { label: 'Create a new listing', Icon: Plus, path: ROUTES.hostListingSetup },
  { label: 'Refer a host', Icon: Users }
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
      className="min-h-[calc(100dvh-72px-env(safe-area-inset-bottom))] bg-[var(--color-surface)] px-4 pb-[calc(176px+env(safe-area-inset-bottom))] pt-5 md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          aria-label="Notifications"
          onClick={() => toast('You have no new notifications.')}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-surface-muted)] active:scale-95"
        >
          <Bell className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label={`Profile for ${user?.name ?? 'Booksa'}`}
          onClick={() => navigate(ROUTES.hostProfile)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-pink-100 text-sm font-semibold text-pink-700 active:scale-95"
        >
          {initial}
        </button>
      </div>

      <h1 className="mt-5 text-3xl font-semibold tracking-[-0.045em]">{t('drawer.title')}</h1>

      <section className="mt-7 rounded-card bg-[var(--color-surface-muted)] px-5 pb-5 pt-4 text-center">
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
                className="absolute h-[108.24px] w-[129.36px] rounded-photo border-[3px] border-[var(--color-surface-muted)] object-cover shadow-md"
                style={{ left: position.left, top: position.top, rotate: position.rotate, zIndex: position.zIndex }}
              />
            );
          })}
        </div>
        <h2 className="text-lg font-semibold">{t('drawer.newToBooksa')}</h2>
        <p className="mx-auto mt-1 max-w-[264px] text-[13px] leading-[1.45] text-[var(--color-text-secondary)]">
          {t('drawer.onboarding')}
        </p>
        <button
          type="button"
          onClick={() => navigate(ROUTES.hostListingSetup)}
          className="mt-5 h-10 w-full rounded-button border border-[var(--color-text-primary)] bg-[var(--color-surface)] text-[13px] font-semibold active:scale-[0.99]"
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
            className="flex min-h-12 w-full items-center gap-4 rounded-button py-2 text-left active:bg-[var(--color-surface-muted)]"
          >
            <item.Icon className="h-5 w-5 shrink-0 stroke-[1.5]" aria-hidden="true" />
            <span className="min-w-0 flex-1 text-md">{item.label}</span>
            <ChevronRight className="h-4 w-4 shrink-0 text-[var(--color-text-secondary)]" aria-hidden="true" />
          </button>
        ))}
      </nav>

      <div className="mt-4 border-y border-[var(--color-border)] py-4">
        <button
          type="button"
          onClick={() => void logout()}
          className="flex min-h-12 w-full items-center gap-4 rounded-button py-2 text-left active:bg-[var(--color-surface-muted)]"
        >
          <LogOut className="h-5 w-5 shrink-0 stroke-[1.5]" aria-hidden="true" />
          <span className="min-w-0 flex-1 text-md">Log out</span>
          <ChevronRight className="h-4 w-4 shrink-0 text-[var(--color-text-secondary)]" aria-hidden="true" />
        </button>
      </div>

      <button
        type="button"
        onClick={() => toast('The Booksa app download is coming soon.')}
        className="mt-7 h-11 w-full rounded-button border border-[var(--color-text-primary)] text-md font-semibold active:scale-[0.99]"
      >
        Download the app
      </button>

      <div className="mt-8 text-center text-xs text-[var(--color-text-secondary)]">
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
          className="inline-flex h-12 items-center gap-2 rounded-button bg-neutral-900 px-7 text-md font-semibold text-white active:scale-95"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Switch to traveling
        </button>
      </div>

      <MobileAttentionCard onClick={onOpenAttention} className="fixed inset-x-0 bottom-[calc(72px+env(safe-area-inset-bottom))] z-30" />
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
    <main className="min-h-dvh bg-[var(--color-surface)] pb-[calc(72px+env(safe-area-inset-bottom))] text-[var(--color-text-primary)] [&_button:focus-visible]:outline [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-4 [&_button:focus-visible]:outline-[var(--color-text-primary)] md:pb-0">
      <header className="hidden border-b border-[var(--color-border)] bg-[var(--color-surface)] md:block">
        <div className="mx-auto grid h-24 max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-8 lg:px-12 xl:px-20">
          <button
            type="button"
            onClick={() => setActiveSection('today')}
            aria-label={t('accessibility.hostHome')}
            className="w-fit rounded-button"
          >
            <BooksaLogo className="h-8 w-[110px]" />
          </button>

          <nav aria-label={t('nav.host')} className="flex h-full items-center gap-1 lg:gap-2">
            {hostNavigation.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigation(item)}
                aria-current={item.id === activeSection ? 'page' : undefined}
                className={`relative inline-flex h-12 items-center rounded-full px-4 text-sm font-semibold transition-colors hover:bg-[var(--color-surface-muted)] ${
                  item.id === activeSection
                    ? 'text-[var(--color-text-primary)] after:absolute after:inset-x-4 after:bottom-1 after:h-0.5 after:rounded-full after:bg-[var(--color-text-primary)]'
                    : 'text-[var(--color-text-secondary)]'
                }`}
              >
                <span className={item.id === 'calendar' ? 'text-[0.85em]' : undefined}>{t(item.labelKey)}</span>
              </button>
            ))}
          </nav>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => navigate(ROUTES.home)}
              className="hidden min-h-11 items-center rounded-full px-4 text-sm font-semibold transition-colors hover:bg-[var(--color-surface-muted)] xl:inline-flex"
            >
              {t('nav.travelerMode')}
            </button>

            <button
              type="button"
              onClick={() => navigate(ROUTES.hostProfile)}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-100)] text-sm font-semibold text-[var(--color-primary-700)] transition hover:brightness-95"
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
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-muted)] transition hover:brightness-95"
              >
                <MenuIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </header>
      <HostAccountDrawer open={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {activeSection === 'menu' ? (
        <MobileHostMenu onOpenAttention={() => setActiveSection('listings')} />
      ) : activeSection === 'messages' ? (
        <MessagesInbox
          mobileFooter={
            <MobileAttentionCard
              onClick={() => setActiveSection('listings')}
              className="fixed inset-x-0 bottom-[calc(72px+env(safe-area-inset-bottom))] z-30"
            />
          }
        />
      ) : activeSection === 'listings' ? (
        <ListingsView createdListingId={routeState?.createdListingId} onOpenCalendar={() => setActiveSection('calendar')} />
      ) : activeSection === 'calendar' ? (
        <CalendarView onOpenListings={() => setActiveSection('listings')} />
      ) : (
        <>
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex min-h-[calc(100dvh-72px-env(safe-area-inset-bottom))] flex-col bg-[var(--color-surface)] text-center md:hidden"
          >
            <div className="flex shrink-0 justify-center gap-3 px-6 pb-6 pt-8">
              <button
                type="button"
                onClick={() => setReservationView('today')}
                aria-pressed={reservationView === 'today'}
                className={`min-h-11 rounded-full px-5 text-sm font-semibold transition-colors ${
                  reservationView === 'today'
                    ? 'bg-[var(--color-text-primary)] text-[var(--color-surface)]'
                    : 'bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] hover:brightness-95'
                }`}
              >
                {t('nav.today')}
              </button>
              <button
                type="button"
                onClick={() => setReservationView('upcoming')}
                aria-pressed={reservationView === 'upcoming'}
                className={`min-h-11 rounded-full px-5 text-sm font-semibold transition-colors ${
                  reservationView === 'upcoming'
                    ? 'bg-[var(--color-text-primary)] text-[var(--color-surface)]'
                    : 'bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] hover:brightness-95'
                }`}
              >
                {t('reservations.upcoming')}
              </button>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center px-6 py-10">
              <img
                src={todayReservationsImage}
                alt=""
                aria-hidden="true"
                decoding="async"
                className="h-44 w-44 select-none object-contain drop-shadow-md"
              />
              <h1 className="mt-4 max-w-[280px] text-balance text-[22px] font-semibold leading-[1.2] tracking-[-0.02em]">
                {t('reservations.empty')}
              </h1>
              <p className="mt-3 max-w-[300px] text-balance text-[15px] leading-[1.4] text-[var(--color-text-secondary)]">
                {t('reservations.emptyHelp')}
              </p>
              <button
                type="button"
                onClick={() => navigate(ROUTES.hostListingSetup)}
                className="mt-10 min-h-12 rounded-md bg-[var(--color-surface-muted)] px-6 py-3 text-[15px] font-semibold transition hover:brightness-95 active:scale-[0.98]"
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
            className="mx-auto hidden min-h-[calc(100dvh-96px)] max-w-3xl flex-col items-center px-8 pb-20 pt-10 text-center md:flex"
          >
            <div className="inline-flex gap-1 rounded-full bg-[var(--color-surface-muted)] p-1.5">
              <button type="button" onClick={() => setReservationView('today')} aria-pressed={reservationView === 'today'} className={`min-h-11 rounded-full px-6 py-3 text-sm font-semibold transition-colors ${reservationView === 'today' ? 'bg-[var(--color-surface)] shadow-[var(--shadow-sm)]' : 'text-[var(--color-text-secondary)]'}`}>
                {t('nav.today')}
              </button>
              <button type="button" onClick={() => setReservationView('upcoming')} aria-pressed={reservationView === 'upcoming'} className={`min-h-11 rounded-full px-6 py-3 text-sm font-semibold transition-colors ${reservationView === 'upcoming' ? 'bg-[var(--color-surface)] shadow-[var(--shadow-sm)]' : 'text-[var(--color-text-secondary)]'}`}>
                {t('reservations.upcoming')}
              </button>
            </div>
            <div className="flex w-full max-w-md flex-1 flex-col items-center justify-center py-16">
              <img src={todayReservationsImage} alt="" aria-hidden="true" decoding="async" className="h-52 w-52 select-none object-contain drop-shadow-md" />
              <h1 className="mt-6 max-w-sm text-balance text-[32px] font-semibold leading-tight tracking-[-0.03em]">{t('reservations.empty')}</h1>
              <p className="mt-4 max-w-sm text-balance text-base leading-6 text-[var(--color-text-secondary)]">{t('reservations.emptyHelp')}</p>
              <button type="button" onClick={() => navigate(ROUTES.hostListingSetup)} className="mt-10 min-h-12 rounded-md bg-[var(--color-surface-muted)] px-6 py-3 text-[15px] font-semibold transition hover:brightness-95 active:scale-[0.98]">{t('reservations.finishListing')}</button>
            </div>
          </motion.section>
        </>
      )}

      <nav
        aria-label={t('nav.hostMobile')}
        className="fixed inset-x-0 bottom-0 z-40 grid h-[calc(72px+env(safe-area-inset-bottom))] grid-cols-5 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-1 pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {mobileHostNavigation.map(({ id, labelKey, Icon }) => {
          const isActive = activeSection === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => handleNavigation(hostNavigation.find((item) => item.id === id)!)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center gap-1.5 rounded-button text-[11px] font-medium transition-colors hover:bg-[var(--color-surface-muted)] ${isActive ? 'font-semibold text-[var(--color-primary-500)]' : 'text-[var(--color-text-secondary)]'}`}
            >
              <Icon className="h-5 w-5 stroke-[1.5]" aria-hidden="true" />
              <span className={id === 'calendar' ? 'text-[0.85em]' : undefined}>{t(labelKey)}</span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setActiveSection('menu')}
          aria-current={activeSection === 'menu' ? 'page' : undefined}
          className={`flex flex-col items-center justify-center gap-1.5 rounded-button text-[11px] font-medium transition-colors hover:bg-[var(--color-surface-muted)] ${activeSection === 'menu' ? 'font-semibold text-[var(--color-primary-500)]' : 'text-[var(--color-text-secondary)]'}`}
        >
          <MenuIcon className="h-5 w-5 stroke-[1.5]" aria-hidden="true" />
          <span>Menu</span>
        </button>
      </nav>
    </main>
  );
}
