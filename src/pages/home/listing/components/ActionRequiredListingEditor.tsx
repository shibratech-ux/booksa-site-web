import { useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  AlarmSmoke,
  ArrowLeft,
  BedDouble,
  CheckCircle2,
  ChevronRight,
  Copy,
  Clock3,
  Eye,
  Home,
  Image,
  Plus,
  Settings,
  Users,
  X
} from 'lucide-react';
import type { ListingDraft } from '@/services/listing-draft.service';
import { useAuth } from '@/hooks/useAuth';
import { getLoggedInUserProfile } from '@/services/user.service';
import {
  getPhotoTourDescriptions,
  getPhotoTourRoomLabels,
  updateListingPhotoTour
} from '@/services/listing-photo.service';
import { AllPhotosManager } from './AllPhotosManager';
import { ShimmerImage } from '@/components/ui/ShimmerImage';
import { ThreeDIcon } from '@/components/ui/ThreeDIcon';
import { BooksaMap } from '@/components/maps/BooksaMap';

type EditorSection = 'photos' | 'title';
const priceFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

const toDisplayLabel = (value: unknown, fallback: string) => {
  if (typeof value !== 'string' || !value.trim()) return fallback;
  return value
    .trim()
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const capitalizeFullName = (value: string) =>
  value
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0).toLocaleUpperCase() + part.slice(1).toLocaleLowerCase())
    .join(' ');

function EditorCard({
  title,
  children
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-[var(--color-surface)] p-6 shadow-[var(--shadow-md)]">
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="mt-2 text-base leading-relaxed text-[var(--color-text-secondary)]">{children}</div>
    </section>
  );
}

export function ActionRequiredListingEditor({
  listing,
  photoUrls,
  onBack
}: {
  listing: ListingDraft;
  photoUrls: string[];
  onBack: () => void;
}) {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<EditorSection>('photos');
  const [isPhotoTourCreated, setIsPhotoTourCreated] = useState(() => Boolean(listing.photoTour));
  const [isCreatingPhotoTour, setIsCreatingPhotoTour] = useState(false);
  const [isAllPhotosOpen, setIsAllPhotosOpen] = useState(false);
  const [showPhotoTourNotice, setShowPhotoTourNotice] = useState(false);
  const [isPublishDrawerOpen, setIsPublishDrawerOpen] = useState(false);
  const [connectedUserProfile, setConnectedUserProfile] = useState<Record<string, unknown> | null>(null);
  const showcasePhotos = photoUrls.slice(0, 3);

  useEffect(() => {
    let isActive = true;

    getLoggedInUserProfile()
      .then((profile) => {
        if (isActive) setConnectedUserProfile(profile);
      })
      .catch((error) => {
        console.error('Unable to retrieve the connected host profile.', error);
      });

    return () => {
      isActive = false;
    };
  }, [user?.id]);
  const flowDraft = listing.flowDraft ?? {};
  const listingTitle =
    typeof flowDraft.listingTitle === 'string' && flowDraft.listingTitle.trim()
      ? flowDraft.listingTitle.trim()
      : listing.generatedListing?.title ?? 'Untitled listing';
  const propertyType = listing.generatedListing?.type ?? toDisplayLabel(flowDraft.listingOption, 'Property');
  const accessType = toDisplayLabel(flowDraft.placeAccess, 'Entire place');
  const basics =
    flowDraft.listingBasics && typeof flowDraft.listingBasics === 'object'
      ? (flowDraft.listingBasics as Record<string, unknown>)
      : {};
  const guestCount = typeof basics.guests === 'number' ? basics.guests : 1;
  const bedroomCount = typeof basics.bedrooms === 'number' ? basics.bedrooms : 0;
  const bedCount = typeof basics.beds === 'number' ? basics.beds : 0;
  const basePrice = typeof flowDraft.basePrice === 'number' ? flowDraft.basePrice : 0;
  const weekendAdjustment =
    typeof flowDraft.weekendAdjustment === 'number' ? flowDraft.weekendAdjustment : 0;
  const weekendPrice = Math.round(basePrice * (1 + weekendAdjustment / 100));
  const selectedDiscountIds = Array.isArray(flowDraft.selectedDiscountIds)
    ? flowDraft.selectedDiscountIds
    : [];
  const description =
    typeof flowDraft.listingDescription === 'string' && flowDraft.listingDescription.trim()
      ? flowDraft.listingDescription.trim()
      : 'Add details';
  const amenityIds = Array.isArray(flowDraft.amenityIds)
    ? flowDraft.amenityIds.filter((value): value is string => typeof value === 'string')
    : [];
  const amenityCount = amenityIds.length;
  const bookingSetting = flowDraft.bookingSetting === 'instant-book'
    ? 'Guests can book instantly.'
    : 'Your first 5 bookings require approval.';
  const confirmedLocation = listing.confirmedLocation ?? {};
  const address =
    confirmedLocation.address && typeof confirmedLocation.address === 'object'
      ? (confirmedLocation.address as Record<string, unknown>)
      : {};
  const point =
    confirmedLocation.location && typeof confirmedLocation.location === 'object'
      ? (confirmedLocation.location as Record<string, unknown>)
      : {};
  const latitude = typeof point.latitude === 'number' ? point.latitude : null;
  const longitude = typeof point.longitude === 'number' ? point.longitude : null;
  const addressLabel = [address.streetAddress, address.city, address.region, address.country]
    .filter((part): part is string => typeof part === 'string' && Boolean(part.trim()))
    .join(', ');
  const hostName = capitalizeFullName(
    (typeof connectedUserProfile?.name === 'string' && connectedUserProfile.name) ||
    user?.name ||
    (typeof listing.contact?.name === 'string' && listing.contact.name) ||
    (typeof listing.user?.name === 'string' && listing.user.name) ||
    'Host'
  );
  const hostInitial = hostName.charAt(0).toUpperCase();
  const hostAvatarUrl =
    (typeof connectedUserProfile?.avatarUrl === 'string' && connectedUserProfile.avatarUrl) ||
    (typeof connectedUserProfile?.photoUrl === 'string' && connectedUserProfile.photoUrl) ||
    user?.avatarUrl;
  const profileCreatedAt = connectedUserProfile?.createdAt;
  const profileCreatedDate =
    typeof profileCreatedAt === 'string'
      ? new Date(profileCreatedAt)
      : profileCreatedAt &&
          typeof profileCreatedAt === 'object' &&
          'toDate' in profileCreatedAt &&
          typeof profileCreatedAt.toDate === 'function'
        ? profileCreatedAt.toDate()
        : null;
  const hostingYear =
    (profileCreatedDate && Number.isFinite(profileCreatedDate.getTime())
      ? profileCreatedDate.getFullYear()
      : null) ??
    (listing.createdAt ?? listing.updatedAt)?.toDate().getFullYear() ??
    new Date().getFullYear();
  const tourRooms = [
    { label: accessType || 'Main space', photoUrl: photoUrls[0] },
    { label: bedroomCount === 1 ? 'Bedroom' : 'Sleeping area', photoUrl: photoUrls[1] },
    { label: 'Full bathroom', photoUrl: photoUrls[2] }
  ];
  const savedPhotoLabels = getPhotoTourRoomLabels(listing.photoTour, photoUrls);
  const defaultPhotoLabels = photoUrls.map(
    (_, index) => savedPhotoLabels[index] ?? tourRooms[index]?.label ?? 'Unassigned'
  );
  const [currentPhotoLabels, setCurrentPhotoLabels] = useState(defaultPhotoLabels);
  const savedPhotoDescriptions = getPhotoTourDescriptions(listing.photoTour, photoUrls);

  useEffect(() => {
    setCurrentPhotoLabels(defaultPhotoLabels);
  }, [listing.id, listing.photoTour, photoUrls]);

  useEffect(() => {
    setIsPhotoTourCreated(Boolean(listing.photoTour));
  }, [listing.id, listing.photoTour]);

  useEffect(() => {
    if (!isPublishDrawerOpen) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsPublishDrawerOpen(false);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPublishDrawerOpen]);

  const createPhotoTour = async () => {
    if (isCreatingPhotoTour || isPhotoTourCreated) return;

    setIsCreatingPhotoTour(true);
    try {
      await updateListingPhotoTour(listing.id, photoUrls, currentPhotoLabels);
      setIsPhotoTourCreated(true);
      setActiveSection('photos');
      setShowPhotoTourNotice(true);
      toast.success('Photo tour created.');
    } catch (error) {
      console.error('Unable to create the listing photo tour.', error);
      toast.error(error instanceof Error ? error.message : 'The photo tour could not be created.');
    } finally {
      setIsCreatingPhotoTour(false);
    }
  };

  if (isAllPhotosOpen) {
    return (
      <AllPhotosManager
        photoUrls={photoUrls}
        photoLabels={currentPhotoLabels}
        photoDescriptions={savedPhotoDescriptions}
        coverPhotoUrl={
          typeof listing.coverImageUrl === 'string' ? listing.coverImageUrl : undefined
        }
        listingId={listing.id}
        onPhotoLabelsChange={setCurrentPhotoLabels}
        onBack={() => setIsAllPhotosOpen(false)}
      />
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid min-h-[calc(100vh-95px)] bg-[var(--color-surface)] lg:grid-cols-[44%_56%]"
    >
      <aside className="border-r border-[var(--color-border)] px-6 py-10 sm:px-10 lg:h-[calc(100vh-95px)] lg:overflow-y-auto lg:px-14">
        <div className="mx-auto max-w-[420px] pb-6">
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={onBack}
              aria-label="Back to your listings"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-muted)] transition hover:brightness-95"
            >
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <h1 className="text-3xl font-semibold tracking-tight">Listing editor</h1>
          </div>

          <div className="mt-14 flex items-center gap-2">
            <div className="flex min-w-0 flex-1 rounded-full bg-[var(--color-surface-muted)] p-1">
              <button
                type="button"
                className="flex-1 rounded-full bg-[var(--color-surface)] px-4 py-2.5 text-sm font-semibold shadow-[var(--shadow-sm)]"
              >
                Your space
              </button>
              <button
                type="button"
                className="flex-1 rounded-full px-4 py-2.5 text-sm font-semibold text-[var(--color-text-secondary)]"
              >
                Arrival guide
              </button>
            </div>
            <button
              type="button"
              aria-label="Listing settings"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-muted)]"
            >
              <Settings className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsPublishDrawerOpen(true)}
            aria-haspopup="dialog"
            className="mt-10 flex w-full items-center gap-4 rounded-2xl bg-[var(--color-surface)] px-5 py-5 text-left shadow-[var(--shadow-md)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]"
          >
            <span className="relative inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-surface-muted)]">
              <ThreeDIcon
                name="verification"
                sourceSize={100}
                className="h-10 w-10 object-contain"
              />
              <span className="absolute -left-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-text-primary)] px-1 text-[10px] font-bold text-[var(--color-surface)]">
                2
              </span>
            </span>
            <span>
              <span className="block text-base font-semibold">Complete steps to publish</span>
              <span className="mt-1 block text-sm text-[var(--color-text-secondary)]">Required to publish</span>
            </span>
          </button>

          <div className="mt-4 grid gap-4">
            <button
              type="button"
              onClick={() => setActiveSection('photos')}
              className={`rounded-2xl border-2 p-5 text-left transition ${
                activeSection === 'photos'
                  ? 'border-[var(--color-text-primary)]'
                  : 'border-transparent bg-[var(--color-surface-muted)]'
              }`}
            >
              <span className="text-base font-semibold">{isPhotoTourCreated ? 'Photo tour' : 'Photos'}</span>
              {isPhotoTourCreated ? (
                <span className="mt-1 block">
                  <span className="block text-sm text-[var(--color-text-secondary)]">
                    {bedroomCount} {bedroomCount === 1 ? 'bedroom' : 'bedrooms'} · {bedCount} {bedCount === 1 ? 'bed' : 'beds'} · {typeof basics.bathrooms === 'number' ? basics.bathrooms : 0} bath
                  </span>
                  <span className="relative mt-8 block h-[145px]">
                    {showcasePhotos.map((photoUrl, index) => (
                      <ShimmerImage
                        key={photoUrl}
                        src={photoUrl}
                        alt=""
                        className="absolute bottom-0 h-[125px] w-[105px] rounded-xl object-cover shadow-[var(--shadow-md)]"
                        style={{ left: `${index * 62 + 8}px`, zIndex: index + 1 }}
                      />
                    ))}
                    <span className="absolute left-1/2 top-2 z-10 -translate-x-1/2 rounded-full bg-[var(--color-surface)] px-3 py-2 text-xs font-semibold shadow-[var(--shadow-sm)]">
                      {photoUrls.length} photos
                    </span>
                  </span>
                  <span className="mt-4 flex items-center gap-2 text-sm font-semibold">
                    <span className="h-3 w-3 rounded-full bg-orange-600" aria-hidden="true" />
                    You have 2 tasks
                  </span>
                </span>
              ) : (
                <span className="mt-4 flex items-center gap-4 rounded-xl bg-[var(--color-surface-muted)] p-4">
                  <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[var(--color-border)]">
                    {photoUrls[0] ? (
                      <ShimmerImage src={photoUrls[0]} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Image className="h-5 w-5" aria-hidden="true" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1 text-sm font-semibold leading-snug">
                    Showcase your photos by room, instantly
                  </span>
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-text-primary)] text-[var(--color-surface)]">
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('title')}
              className={`rounded-2xl border-2 p-5 text-left transition ${
                activeSection === 'title'
                  ? 'border-[var(--color-text-primary)]'
                  : 'border-transparent bg-[var(--color-surface-muted)]'
              }`}
            >
              <span className="block text-base font-semibold">Title</span>
              <span className="mt-2 block truncate text-xl text-[var(--color-text-secondary)]">{listingTitle}</span>
            </button>

            <EditorCard title="Property type">
              {accessType} · {propertyType}
            </EditorCard>

            <EditorCard title="Sleeping arrangements">
              <div className="flex items-center justify-between gap-4 rounded-xl bg-[var(--color-surface-muted)] px-4 py-4 text-[var(--color-text-primary)]">
                <span className="flex items-center gap-3">
                  <BedDouble className="h-6 w-6" aria-hidden="true" />
                  {bedroomCount || bedCount
                    ? `${bedroomCount} ${bedroomCount === 1 ? 'bedroom' : 'bedrooms'} · ${bedCount} ${bedCount === 1 ? 'bed' : 'beds'}`
                    : 'Add sleeping arrangements'}
                </span>
                <ChevronRight className="h-5 w-5 shrink-0" aria-hidden="true" />
              </div>
            </EditorCard>

            <EditorCard title="Pricing">
              FC {priceFormatter.format(basePrice)}
              {weekendPrice !== basePrice ? ` – FC ${priceFormatter.format(weekendPrice)}` : ''} per night
            </EditorCard>

            <EditorCard title="Discounts">
              <div className="grid gap-0.5">
                {selectedDiscountIds.length > 0 ? (
                  selectedDiscountIds.map((discountId) => {
                    const discounts: Record<string, string> = {
                      'new-listing': '20% new listing promotion',
                      'last-minute': '16% last-minute discount',
                      weekly: '5% weekly discount',
                      monthly: '15% monthly discount'
                    };
                    return <span key={String(discountId)}>{discounts[String(discountId)] ?? toDisplayLabel(discountId, 'Discount')}</span>;
                  })
                ) : (
                  <span>Add details</span>
                )}
              </div>
            </EditorCard>

            <EditorCard title="Availability">
              <span className="block">1 – 365 night stays</span>
              <span className="block">Same day advance notice</span>
            </EditorCard>

            <EditorCard title="Number of guests">{guestCount} {guestCount === 1 ? 'guest' : 'guests'}</EditorCard>

            <EditorCard title="Description">{description}</EditorCard>

            <EditorCard title="Amenities">
              {amenityCount > 0 ? `${amenityCount} ${amenityCount === 1 ? 'amenity' : 'amenities'} selected` : 'Add details'}
            </EditorCard>

            <EditorCard title="Accessibility features">Add details</EditorCard>

            <EditorCard title="Location">
              {latitude !== null && longitude !== null ? (
                <BooksaMap
                    center={{ latitude, longitude }}
                    initialZoom={15}
                    title={`Map of ${addressLabel}`}
                    interactive={false}
                    showControls={false}
                    className="mt-4 h-[168px] rounded-xl"
                  >
                  <span className="absolute left-1/2 top-1/2 inline-flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--color-text-primary)] text-[var(--color-surface)] shadow-[var(--shadow-md)]">
                    <Home className="h-5 w-5" aria-hidden="true" />
                  </span>
                </BooksaMap>
              ) : null}
              <span className="mt-4 block">{addressLabel || 'Location not provided'}</span>
            </EditorCard>

            <EditorCard title="About the host">
              <div className="flex flex-col items-center py-5 text-center text-[var(--color-text-primary)]">
                <span className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-[var(--color-primary-100)] text-3xl font-semibold text-[var(--color-primary-700)]">
                  {hostAvatarUrl ? (
                    <ShimmerImage src={hostAvatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
                  ) : (
                    hostInitial
                  )}
                </span>
                <span className="mt-5 font-semibold">{hostName}</span>
                <span className="text-xs text-[var(--color-text-secondary)]">Started hosting in {hostingYear}</span>
              </div>
            </EditorCard>

            <EditorCard title="Co-hosts">Add details</EditorCard>

            <EditorCard title="Booking settings">{bookingSetting}</EditorCard>

            <EditorCard title="House rules">
              <span className="flex items-center gap-3 text-[var(--color-text-primary)]">
                <Clock3 className="h-6 w-6" aria-hidden="true" /> Check-in after 3:00 PM
              </span>
              <span className="mt-3 flex items-center gap-3 text-[var(--color-text-primary)]">
                <Users className="h-6 w-6" aria-hidden="true" /> {guestCount} guests maximum
              </span>
            </EditorCard>

            <EditorCard title="Guest safety">
              {!amenityIds.includes('carbon-monoxide-alarm') ? (
                <span className="flex items-center gap-3 text-[var(--color-text-primary)]">
                  <AlarmSmoke className="h-6 w-6" aria-hidden="true" /> Carbon monoxide alarm not reported
                </span>
              ) : null}
              {!amenityIds.includes('smoke-alarm') ? (
                <span className="mt-3 flex items-center gap-3 text-[var(--color-text-primary)]">
                  <AlarmSmoke className="h-6 w-6" aria-hidden="true" /> Smoke alarm not reported
                </span>
              ) : null}
              {amenityIds.includes('carbon-monoxide-alarm') && amenityIds.includes('smoke-alarm') ? 'Safety alarms reported' : null}
            </EditorCard>

            <EditorCard title="Cancellation policy">
              <span className="block">Flexible for short-term stays</span>
              <span className="block">Firm long term for long-term stays</span>
            </EditorCard>

            <EditorCard title="Custom link">Add details</EditorCard>
          </div>

          <button
            type="button"
            className="sticky bottom-5 z-10 mx-auto mt-5 flex items-center gap-2 rounded-full bg-[var(--color-text-primary)] px-7 py-3 text-base font-semibold text-[var(--color-surface)] shadow-[var(--shadow-lg)]"
          >
            <Eye className="h-5 w-5" aria-hidden="true" />
            View
          </button>
        </div>
      </aside>

      <div className="min-h-[680px] overflow-y-auto px-6 py-10 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-[610px]">
          {activeSection === 'photos' ? (
            isPhotoTourCreated ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-5">
                  <div>
                    <h2 className="text-3xl font-semibold tracking-tight">Photo tour</h2>
                    <p className="mt-5 max-w-[440px] text-base leading-snug text-[var(--color-text-secondary)]">
                      Manage photos and add details. Guests will only see your tour if every room has a photo.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAllPhotosOpen(true)}
                      className="inline-flex h-11 items-center gap-2 rounded-full bg-[var(--color-surface-muted)] px-5 text-sm font-semibold"
                    >
                      <Copy className="h-4 w-4" aria-hidden="true" />
                      All photos
                    </button>
                    <button
                      type="button"
                      aria-label="Add photo tour room"
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-surface-muted)]"
                    >
                      <Plus className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPublishDrawerOpen(true)}
                  className="mt-16 flex min-h-[70px] w-full items-center gap-3 rounded-xl bg-[var(--color-surface-muted)] px-6 text-left text-base font-semibold"
                >
                  <span className="h-3 w-3 rounded-full bg-orange-600" aria-hidden="true" />
                  <span className="flex-1">View your tasks</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>

                <div className="mt-6 grid gap-5 sm:grid-cols-3">
                  {tourRooms.map(({ label, photoUrl }, index) => (
                    <article key={`${label}-${index}`} className="min-w-0">
                      <div className="flex aspect-[0.88] items-center justify-center overflow-hidden rounded-xl bg-[var(--color-surface-muted)]">
                        {photoUrl ? (
                          <ShimmerImage src={photoUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          index === 1 ? <BedDouble className="h-12 w-12 text-[var(--color-text-secondary)]" /> : <Image className="h-12 w-12 text-[var(--color-text-secondary)]" />
                        )}
                      </div>
                      <h3 className="mt-3 truncate text-base font-semibold">{label}</h3>
                      <button type="button" className="mt-1 text-sm text-[var(--color-text-secondary)] hover:underline">
                        Add photos
                      </button>
                    </article>
                  ))}
                </div>
              </>
            ) : (
            <>
              <h2 className="text-3xl font-semibold tracking-tight">Photos</h2>
              <div className="mt-12 flex min-h-[540px] flex-col items-center rounded-2xl bg-[#f7f6f2] px-8 py-12 text-center text-[#222] dark:bg-[var(--color-surface-muted)] dark:text-[var(--color-text-primary)] sm:px-12">
                <h3 className="max-w-[390px] text-3xl font-semibold leading-tight tracking-tight">
                  Showcase your photos<br />by room, instantly
                </h3>
                <div className="relative mt-10 h-[260px] w-[300px] max-w-full">
                  {showcasePhotos.length > 0 ? (
                    showcasePhotos.map((photoUrl, index) => {
                      const layouts = showcasePhotos.length === 1
                        ? [{ x: 0, y: 20, rotation: 0, zIndex: 3 }]
                        : showcasePhotos.length === 2
                          ? [
                              { x: -38, y: 0, rotation: -6, zIndex: 1 },
                              { x: 34, y: 32, rotation: 4, zIndex: 2 }
                            ]
                          : [
                              { x: -45, y: -8, rotation: -6, zIndex: 1 },
                              { x: 48, y: 10, rotation: 6, zIndex: 2 },
                              { x: 0, y: 48, rotation: 0, zIndex: 3 }
                            ];
                      const photoLayout = layouts[index] ?? layouts[layouts.length - 1];

                      return (
                        <ShimmerImage
                          key={photoUrl}
                          src={photoUrl}
                          alt=""
                          className="absolute left-1/2 top-1/2 h-[205px] w-[165px] rounded-xl object-cover shadow-[0_16px_32px_rgba(0,0,0,0.18)]"
                          style={{
                            transform: `translate(-50%, -50%) translate(${photoLayout.x}px, ${photoLayout.y}px) rotate(${photoLayout.rotation}deg)`,
                            zIndex: photoLayout.zIndex
                          }}
                        />
                      );
                    })
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center rounded-2xl border border-dashed border-[var(--color-border)]">
                      <Image className="h-12 w-12 text-[var(--color-text-secondary)]" aria-label="No photos available" />
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => void createPhotoTour()}
                  disabled={isCreatingPhotoTour || isPhotoTourCreated}
                  className="mt-10 rounded-full bg-white px-7 py-3.5 text-base font-semibold text-[#222] shadow-[var(--shadow-sm)] transition hover:shadow-[var(--shadow-md)] disabled:cursor-not-allowed disabled:opacity-70 dark:bg-[var(--color-surface)] dark:text-[var(--color-text-primary)]"
                >
                  {isCreatingPhotoTour
                    ? 'Creating photo tour…'
                    : isPhotoTourCreated
                      ? 'Photo tour ready'
                      : 'Create your photo tour'}
                </button>
              </div>
            </>
            )
          ) : (
            <>
              <h2 className="text-3xl font-semibold tracking-tight">Title</h2>
              <div className="mt-12 rounded-2xl border border-[var(--color-border)] p-7">
                <label className="text-sm font-semibold" htmlFor="listing-editor-title">Listing title</label>
                <input
                  id="listing-editor-title"
                  value={listingTitle}
                  readOnly
                  className="mt-3 h-14 w-full rounded-xl border border-[var(--color-border)] bg-transparent px-4 text-base outline-none"
                />
                <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
                  Your title is saved with the listing details.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
      {showPhotoTourNotice ? (
        <motion.aside
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          role="status"
          className="fixed bottom-8 left-1/2 z-[130] flex w-[min(400px,calc(100vw-32px))] -translate-x-1/2 items-start gap-3 rounded-2xl bg-[var(--color-surface)] px-5 py-4 text-left shadow-[0_16px_48px_rgba(0,0,0,0.2)]"
        >
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-success)]" fill="currentColor" aria-hidden="true" />
          <span className="min-w-0 flex-1">
            <span className="block font-semibold">Your photos are sorted</span>
            <span className="mt-1 block text-sm leading-snug text-[var(--color-text-secondary)]">
              Check each room or space to confirm your photos are in the right place.
            </span>
          </span>
          <button
            type="button"
            onClick={() => setShowPhotoTourNotice(false)}
            aria-label="Dismiss photo tour confirmation"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-[var(--color-surface-muted)]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </motion.aside>
      ) : null}

      <AnimatePresence>
        {isPublishDrawerOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-black/35"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setIsPublishDrawerOpen(false);
            }}
          >
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-labelledby="steps-to-publish-title"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 330, damping: 34, mass: 0.9 }}
              onMouseDown={(event) => event.stopPropagation()}
              className="ml-auto flex h-full w-full max-w-[455px] flex-col overflow-hidden rounded-l-[30px] bg-[var(--color-surface)] shadow-[-18px_0_55px_rgba(0,0,0,0.18)]"
            >
              <header className="relative flex min-h-[92px] shrink-0 items-center justify-center border-b border-[var(--color-border-subtle)] px-16 text-center">
                <div>
                  <h2 id="steps-to-publish-title" className="text-lg font-semibold">Steps to publish</h2>
                  <p className="mt-1 max-w-[230px] truncate text-sm text-[var(--color-text-secondary)]">
                    {listingTitle}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPublishDrawerOpen(false)}
                  aria-label="Close steps to publish"
                  className="absolute right-5 inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-[var(--color-surface-muted)]"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-10 pt-7 sm:px-8">
                <article className="overflow-hidden rounded-[26px] bg-[var(--color-surface)] p-6 shadow-[0_10px_32px_rgba(15,23,42,0.10)] ring-1 ring-[var(--color-border-subtle)]">
                  <h3 className="text-lg font-semibold">Identity verification</h3>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Not started</p>

                  <div className="mt-6 flex min-h-[375px] flex-col items-center justify-center rounded-2xl bg-[var(--color-surface-muted)] px-6 py-8 text-center">
                    <ThreeDIcon
                      name="verification"
                      sourceSize={200}
                      className="h-32 w-32 object-contain"
                    />
                    <h4 className="mt-5 text-3xl font-semibold tracking-tight">Verify your identity</h4>
                    <p className="mt-4 max-w-[260px] text-base leading-snug text-[var(--color-text-secondary)]">
                      We’ll gather some information to help confirm you’re you.
                    </p>
                    <button
                      type="button"
                      className="mt-7 rounded-xl bg-[var(--color-text-primary)] px-6 py-3 text-base font-semibold text-[var(--color-surface)] transition hover:opacity-90"
                    >
                      Get started
                    </button>
                  </div>
                </article>

                <article className="mt-5 rounded-2xl bg-[var(--color-surface)] px-6 py-6 shadow-[0_10px_32px_rgba(15,23,42,0.10)] ring-1 ring-[var(--color-border-subtle)]">
                  <h3 className="text-lg font-semibold">Phone number confirmation</h3>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Not started</p>
                </article>
              </div>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.section>
  );
}
