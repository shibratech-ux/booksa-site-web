import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import BooksaHeader from '@/components/layout/BooksaHeader';
import Footer from '@/components/layout/Footer';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { getPublishedListingDetail, type PublishedListingDetail } from '@/services/listing-catalog.service';
import { useAuthStore } from '@/store/auth.store';
import { ROUTES } from '@/utils/constants';
import {
  persistConfirmPayContext,
  persistPhotoTourContext,
  readPersistedListingContext
} from '@/utils/navigationPersistence';
import type { Listing } from './listing.types';
import { DesktopGallery, GalleryActions, MobileGallery } from './detail/DetailGallery';
import {
  AvailabilitySection,
  DescriptionSection,
  DetailHeader,
  HostAndHighlights,
  HostSection,
  LocationSection,
  SampleReviewsSection,
  SleepAndAmenities,
  ThingsToKnowSection
} from './detail/ListingDetailSections';
import { DesktopReserveCard, MobileReserveBar, useReserveSummary } from './detail/ReservePanel';
import { sampleGallery } from './detail/sampleListingContent';
import type { StayRange } from './detail/StayCalendar';
import { useListingDetailView, type ListingDetailView } from './detail/useListingDetailView';

// Firestore ids are URL-safe; sample cards use "<location>-<price>", which never matches.
const PUBLISHED_ID = /^[A-Za-z0-9_-]{1,128}$/;

type PublishedState =
  | { status: 'idle' | 'loading' | 'signed-out' | 'not-found' | 'error' }
  | { status: 'loaded'; listing: PublishedListingDetail };

function buildSampleFromUrl(listingId: string): Listing | null {
  const match = listingId.match(/^(.*?)-(?:CDF\s*)?([\d,]+)$/);
  if (!match) return null;
  const label = match[1].trim();
  return { image: sampleGallery[0], gallery: sampleGallery, location: label, title: label, price: `CDF ${match[2]}`, rating: '4.8' };
}

function usePublishedListing(listingId: string | null, userId: string | undefined, attempt: number): PublishedState {
  const [state, setState] = useState<PublishedState>({ status: listingId ? 'loading' : 'idle' });

  useEffect(() => {
    if (!listingId) { setState({ status: 'idle' }); return; }
    if (!userId) { setState({ status: 'signed-out' }); return; }
    let active = true;
    setState({ status: 'loading' });
    getPublishedListingDetail(listingId)
      .then(listing => { if (active) setState(listing ? { status: 'loaded', listing } : { status: 'not-found' }); })
      .catch(() => { if (active) setState({ status: 'error' }); });
    return () => { active = false; };
  }, [listingId, userId, attempt]);

  return state;
}

export default function ListingDetailPage() {
  const { t } = useTranslation('booking');
  const navigate = useNavigate();
  const location = useLocation();
  const { listingId: rawListingId = '' } = useParams<{ listingId: string }>();
  const listingId = decodeURIComponent(rawListingId);
  const publishedId = PUBLISHED_ID.test(listingId) ? listingId : null;
  const userId = useAuthStore(state => state.user?.id);
  const [attempt, setAttempt] = useState(0);
  const published = usePublishedListing(publishedId, userId, attempt);

  const stateListing = (location.state as { listing?: Listing } | null)?.listing;
  const persisted = readPersistedListingContext<Listing>();
  const sample = publishedId
    ? null
    : stateListing ?? (persisted && !persisted.id ? persisted : null) ?? buildSampleFromUrl(listingId);
  const view = useListingDetailView(published.status === 'loaded' ? published.listing : null, sample);

  if (publishedId && published.status !== 'loaded') {
    return (
      <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-text-primary)]">
        <div className="hidden md:block"><BooksaHeader /></div>
        <main className="mx-auto max-w-xl px-6 py-16">
          {published.status === 'loading' || published.status === 'idle' ? <LoadingScreen fullScreen={false} label={t('listingDetail.loading')} /> : null}
          {published.status === 'error' ? <ErrorState description={t('listingDetail.loadError')} onRetry={() => setAttempt(value => value + 1)} /> : null}
          {published.status === 'not-found' || published.status === 'signed-out' ? (
            <EmptyState
              title={t(published.status === 'signed-out' ? 'listingDetail.signIn' : 'listingDetail.notFound')}
              description={t(published.status === 'signed-out' ? 'listingDetail.signInHint' : 'listingDetail.notFoundHint')}
              actionLabel={t(published.status === 'signed-out' ? 'listingDetail.signInAction' : 'listingDetail.backToExplore')}
              onAction={() => navigate(published.status === 'signed-out' ? ROUTES.login : ROUTES.home)}
            />
          ) : null}
        </main>
      </div>
    );
  }

  if (!view) return <Navigate to={ROUTES.home} replace />;
  return <ListingDetailContent key={listingId} view={view} />;
}

function ListingDetailContent({ view }: { view: ListingDetailView }) {
  const { t } = useTranslation('booking');
  const navigate = useNavigate();
  const [range, setRange] = useState<StayRange>({ start: null, end: null });
  const [saved, setSaved] = useState(false);
  const summary = useReserveSummary(view, range);

  const openPhotos = () => {
    persistPhotoTourContext({ listing: view.contextListing });
    navigate(ROUTES.photoTour, { state: { listing: view.contextListing } });
  };
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: view.title, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success(t('listingDetail.linkCopied'));
      }
    } catch {
      // The share sheet was dismissed; nothing to report.
    }
  };
  // TODO(team): persist to wishlists once that collection exists; local only for now.
  const toggleSave = () => setSaved(value => !value);
  const reserve = () => {
    if (!summary.nights || !summary.total) {
      const section = document.getElementById('availability');
      section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      document.getElementById('availability-title')?.focus({ preventScroll: true });
      return;
    }
    const bookingState = {
      listing: view.contextListing,
      nights: summary.nights,
      range: {
        start: range.start ? new Date(`${range.start}T00:00:00`).toISOString() : null,
        end: range.end ? new Date(`${range.end}T00:00:00`).toISOString() : null
      },
      guestCounts: { adults: 1, children: 0, infants: 0, pets: 0 },
      total: summary.total
    };
    persistConfirmPayContext(bookingState);
    navigate(ROUTES.confirmPay, { state: bookingState });
  };

  const actions = <GalleryActions saved={saved} onBack={() => navigate(-1)} onShare={() => void share()} onToggleSave={toggleSave} />;

  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-text-primary)]">
      <div className="hidden md:block"><BooksaHeader /></div>

      <MobileGallery photos={view.photos} title={view.title} onOpen={openPhotos} actions={actions} />

      <main className="mx-auto w-full max-w-[1120px] pb-32 md:px-10 md:pt-6 lg:pb-16">
        <div className="hidden md:block">
          <GalleryActions saved={saved} onShare={() => void share()} onToggleSave={toggleSave} className="mb-4 justify-end" />
          <DesktopGallery photos={view.photos} title={view.title} onOpen={openPhotos} />
        </div>

        <div className="grid gap-16 md:mt-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0">
            <DetailHeader view={view} />
            <div className="mt-8 px-6 md:px-0">
              <HostAndHighlights view={view} />
              <DescriptionSection view={view} />
              <SampleReviewsSection view={view} />
              <SleepAndAmenities view={view} />
              <LocationSection view={view} />
              <AvailabilitySection view={view} range={range} onChange={setRange} nights={summary.nights} />
              <HostSection view={view} />
              <ThingsToKnowSection view={view} />
            </div>
          </div>
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <DesktopReserveCard summary={summary} onReserve={reserve} />
            </div>
          </aside>
        </div>
      </main>

      <MobileReserveBar summary={summary} onReserve={reserve} />
      <div className="hidden md:block"><Footer /></div>
    </div>
  );
}
