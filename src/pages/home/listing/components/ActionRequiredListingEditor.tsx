import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  AlarmSmoke,
  ArrowLeft,
  BedDouble,
  CheckCircle2,
  ChevronRight,
  Copy,
  Clock3,
  ExternalLink,
  Eye,
  Home,
  Image,
  Plus,
  Settings,
  Users,
  X,
  Zap
} from 'lucide-react';
import type { ListingDraft } from '@/services/listing-draft.service';
import { updateCurrentUserListingDescription } from '@/services/listing-draft.service';
import { ListingDescriptionSheet } from './ListingDescriptionSheet';
import { updateCurrentUserListingBasePrice, updateCurrentUserListingGuestCount, updateCurrentUserListingHouseRules, updateCurrentUserListingPropertyType, updateCurrentUserListingTitle, updateCurrentUserListingWeekendAdjustment } from '@/services/listing-draft.service';
import { weekendNightlyPrice } from '@/domain/calendar';
import { readHouseRules, type PropertyTypeChange } from '@/domain/listing';
import { HouseRulesPage } from './HouseRulesPage';
import { ArrivalGuideDetails, ListingArrivalGuide, type ArrivalGuideSection } from './ListingArrivalGuide';
import { ListingCheckInMethodPage, type CheckInMethodId } from './ListingCheckInMethodPage';
import { ListingPreferencesPage } from './ListingPreferencesPage';
import { ListingAmenitiesPage } from './ListingAmenitiesPage';
import { ListingAccessibilityFeaturesPage, type AccessibilityFeatureId } from './ListingAccessibilityFeaturesPage';
import { updateCurrentUserListingAmenities } from '@/services/listing-draft.service';
import { ListingGuestCountSheet } from './ListingGuestCountSheet';
import { getListingCategory } from '../create-listing/listingCategories';
import { getAccessContent } from '../create-listing/components/PlaceAccessStep';
import { discountOptions } from '../create-listing/components/ListingDiscountsStep';
import { ListingTitleSheet } from './ListingTitleSheet';
import { PropertyTypeSheet } from './PropertyTypeSheet';
import { ListingPricingSection } from './ListingPricingSection';
import { ListingStayLengthSheet, type StayLengthField } from './ListingStayLengthSheet';
import { ListingAdvanceNoticeSheet, useAdvanceNoticeLabel, type AdvanceNoticeSetting } from './ListingAdvanceNoticeSheet';
import { ListingSameDayCutoffSheet, formatCutoffHour } from './ListingSameDayCutoffSheet';
import { ListingCheckInOutSheet, DEFAULT_CHECK_IN_OUT_TIMES, type CheckInOutTimes } from './ListingCheckInOutSheet';
import { ListingDirectionsSheet } from './ListingDirectionsSheet';
import { formatCurrency } from '@/utils/formatters';
import { ListingHostCard, type HostSummary } from './ListingHostCard';
import { HostProfileSheet } from './HostProfileSheet';
import { ListingPreviewPage } from './ListingPreviewPage';
import { ListingIdentityVerificationPage } from './ListingIdentityVerificationPage';
import { ListingPublishStepsPage } from './ListingPublishStepsPage';
import { ListingPublishReadySheet } from './ListingPublishReadySheet';
import { usePublishReadiness } from './usePublishReadiness';
import { useAuthStore } from '@/store/auth.store';
import { BackButton } from '@/components/ui/BackButton';
import {
  getPhotoTourRoomLabels,
  updateListingPhotoTour
} from '@/services/listing-photo.service';
import { AllPhotosManager } from './AllPhotosManager';
import { PHOTO_TOUR_PREVIEW_COUNT, PhotoTourStack } from './PhotoTourStack';
import { ShimmerImage } from '@/components/ui/ShimmerImage';
import { BooksaMap } from '@/components/maps/BooksaMap';
import { DEFAULT_MAP_VIEW } from '../seeAllMapDefaults';
import completeStepImage from '@/assets/images/complete_step.png';
import { buildPhotoTourRooms, expectedPhotoTourRooms } from './photoTourRooms';

type EditorSection = 'photos' | 'title' | 'sleeping' | 'pricing' | 'discounts' | 'availability' | 'description';

const toDisplayLabel = (value: unknown, fallback: string) => {
  if (typeof value !== 'string' || !value.trim()) return fallback;
  return value
    .trim()
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

// Elevated card: soft shadow in light mode, hairline border in dark mode where shadows disappear.
const editorCardClass =
  'block w-full rounded-card bg-[var(--color-surface)] p-5 text-left shadow-[var(--shadow-sm)] dark:border dark:border-[var(--color-border)]';
const editorCardButtonClass = `${editorCardClass} transition hover:shadow-[var(--shadow-md)] active:scale-[0.99]`;

function EditorCard({
  title,
  children
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className={editorCardClass}>
      <h2 className="text-[0.830466rem] font-semibold">{title}</h2>
      <div className="mt-1.5 break-words text-[0.72665775rem] leading-6 text-[var(--color-text-secondary)]">{children}</div>
    </section>
  );
}

export function ActionRequiredListingEditor({
  listing,
  photoUrls,
  onBack,
  onOpenCalendar
}: {
  listing: ListingDraft;
  photoUrls: string[];
  onBack: () => void;
  onOpenCalendar: () => void;
}) {
  const { t } = useTranslation('dashboard');
  const [editorTab, setEditorTab] = useState<'space' | 'arrival'>('space');
  const [arrivalSection, setArrivalSection] = useState<ArrivalGuideSection | null>(null);
  const [isCheckInOutOpen, setIsCheckInOutOpen] = useState(false);
  const [isDirectionsOpen, setIsDirectionsOpen] = useState(false);
  // TODO(team): agree on arrival-guide fields with Flutter before adding Firestore writes.
  const [localDirections, setLocalDirections] = useState<{ listingId: string; text: string } | null>(null);
  const directions = localDirections?.listingId === listing.id ? localDirections.text : '';
  const [localCheckInOut, setLocalCheckInOut] = useState<{ listingId: string; times: CheckInOutTimes } | null>(null);
  const checkInOutTimes = localCheckInOut?.listingId === listing.id ? localCheckInOut.times : undefined;
  const [isCheckInMethodOpen, setIsCheckInMethodOpen] = useState(false);
  const [localCheckInMethod, setLocalCheckInMethod] = useState<{ listingId: string; method: CheckInMethodId; details: string } | null>(null);
  const checkInMethod = localCheckInMethod?.listingId === listing.id ? localCheckInMethod.method : null;
  const checkInDetails = localCheckInMethod?.listingId === listing.id ? localCheckInMethod.details : '';
  const checkInMethodCardRef = useRef<HTMLButtonElement>(null);
  const tabRefs = useRef<Partial<Record<'space' | 'arrival', HTMLButtonElement | null>>>({});
  const editorHeaderRef = useRef<HTMLDivElement>(null);
  const editorScrollRef = useRef<HTMLDivElement>(null);
  const [isTitleSheetOpen, setIsTitleSheetOpen] = useState(false);
  const [isGuestCountOpen, setIsGuestCountOpen] = useState(false);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [isPropertyTypeSheetOpen, setIsPropertyTypeSheetOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<EditorSection>('photos');
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);
  const [isPhotoTourCreated, setIsPhotoTourCreated] = useState(() => Boolean(listing.photoTour));
  const [isCreatingPhotoTour, setIsCreatingPhotoTour] = useState(false);
  const [isAllPhotosOpen, setIsAllPhotosOpen] = useState(false);
  const [isHouseRulesOpen, setIsHouseRulesOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const [isAmenitiesOpen, setIsAmenitiesOpen] = useState(false);
  const amenitiesCardRef = useRef<HTMLButtonElement>(null);
  const [hostProfileSheet, setHostProfileSheet] = useState<HostSummary | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const viewButtonRef = useRef<HTMLButtonElement>(null);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  // TODO(team): local only until accessibility features have a shared Firestore field.
  const [localAccessibility, setLocalAccessibility] = useState<{ listingId: string; ids: AccessibilityFeatureId[] } | null>(null);
  const accessibilityCardRef = useRef<HTMLButtonElement>(null);
  const [stayLengthField, setStayLengthField] = useState<StayLengthField | null>(null);
  const [localStayLength, setLocalStayLength] = useState<{ listingId: string; minNights: number; maxNights: number } | null>(null);
  const [isAdvanceNoticeOpen, setIsAdvanceNoticeOpen] = useState(false);
  const [localAdvanceNotice, setLocalAdvanceNotice] = useState<{ listingId: string; setting: AdvanceNoticeSetting } | null>(null);
  const advanceNoticeLabel = useAdvanceNoticeLabel();
  const [isSameDayCutoffOpen, setIsSameDayCutoffOpen] = useState(false);
  const [localSameDayCutoff, setLocalSameDayCutoff] = useState<{ listingId: string; hour: number } | null>(null);
  const houseRulesCardRef = useRef<HTMLButtonElement>(null);
  const mobileBackRef = useRef<HTMLDivElement>(null);
  const selectedSectionRef = useRef<HTMLButtonElement>(null);
  const [showPhotoTourNotice, setShowPhotoTourNotice] = useState(false);
  const [isPublishStepsOpen, setIsPublishStepsOpen] = useState(false);
  const [isIdentityVerificationOpen, setIsIdentityVerificationOpen] = useState(false);
  const publishStepsTriggerRef = useRef<HTMLButtonElement>(null);
  const [selfieSubmitted, setSelfieSubmitted] = useState(false);
  const userId = useAuthStore(state => state.user?.id);
  const [readinessKey, setReadinessKey] = useState(0);
  const publishReadiness = usePublishReadiness(userId, readinessKey);
  const isPublishReady = publishReadiness.status === 'loaded' && publishReadiness.ready;
  const isPublished = listing.status === 'published' || listing.status === 'active';
  const [isPublishReadyOpen, setIsPublishReadyOpen] = useState(false);
  // Up to three photos for the "Showcase your photos" panel shown before the tour exists.
  const showcasePhotos = photoUrls.slice(0, PHOTO_TOUR_PREVIEW_COUNT);

  const selectTab = (tab: 'space' | 'arrival') => {
    setEditorTab(tab);
    setIsMobileDetailOpen(false);
    requestAnimationFrame(() => {
      editorScrollRef.current?.scrollTo({ top: 0 });
      if (window.matchMedia('(max-width: 1023px)').matches) editorHeaderRef.current?.scrollIntoView({ block: 'start' });
    });
  };

  useEffect(() => {
    if (isMobileDetailOpen && !isAllPhotosOpen && window.matchMedia('(max-width: 1023px)').matches) {
      mobileBackRef.current?.querySelector('button')?.focus();
    }
  }, [isMobileDetailOpen, isAllPhotosOpen]);

  const flowDraft: Record<string, unknown> = listing.flowDraft ?? {};
  const listingTitle =
    typeof flowDraft.listingTitle === 'string' && flowDraft.listingTitle.trim()
      ? flowDraft.listingTitle.trim()
      : listing.generatedSummary?.title ?? 'Untitled listing';
  const listingCategory = getListingCategory(typeof flowDraft.listingCategory === 'string' ? flowDraft.listingCategory : null);
  const listingOption = listingCategory?.options.find(({ id }) => id === flowDraft.listingOption);
  const propertyType = listingOption?.label ?? toDisplayLabel(flowDraft.listingOption ?? listing.generatedSummary?.type, 'Property');
  const accessOption = listingCategory
    ? getAccessContent(listingCategory, listingOption?.label ?? '').options.find(({ id }) => id === flowDraft.placeAccess)
    : undefined;
  const accessType = toDisplayLabel(flowDraft.placeAccess, 'Entire place');
  const accessTypeLabel = accessOption?.title ?? accessType;
  const basics =
    flowDraft.listingBasics && typeof flowDraft.listingBasics === 'object'
      ? (flowDraft.listingBasics as Record<string, unknown>)
      : {};
  const guestCount = typeof basics.guests === 'number' ? basics.guests : 1;
  const bedroomCount = typeof basics.bedrooms === 'number' ? basics.bedrooms : 0;
  const bedCount = typeof basics.beds === 'number' ? basics.beds : 0;
  const bathroomCount = typeof basics.bathrooms === 'number' ? basics.bathrooms : 0;
  const bedroomPhotoUrl = photoUrls[1] ?? photoUrls[0];
  const basePrice = typeof flowDraft.basePrice === 'number' ? flowDraft.basePrice : 0;
  const weekendAdjustment =
    typeof flowDraft.weekendAdjustment === 'number' ? flowDraft.weekendAdjustment : 0;
  const weekendPrice = weekendNightlyPrice(basePrice, weekendAdjustment);
  const selectedDiscountIds = Array.isArray(flowDraft.selectedDiscountIds)
    ? flowDraft.selectedDiscountIds
    : [];
  // Rates come from the wizard catalog, in catalog order; unknown IDs are dropped.
  const selectedDiscounts = discountOptions.filter(({ id }) => selectedDiscountIds.includes(id));
  const description =
    typeof flowDraft.listingDescription === 'string' && flowDraft.listingDescription.trim()
      ? flowDraft.listingDescription.trim()
      : t('descriptionSection.addDetails');
  // Only the listing description is stored today. TODO(team): the other sections need
  // flowDraft fields (flowSchema + normalizeFlowDraft + Flutter agreement) before they can be edited.
  const descriptionRows = [
    { id: 'listingDescription', label: t('descriptionSection.listingDescription'), value: description },
    { id: 'yourProperty', label: t('descriptionSection.yourProperty'), value: t('descriptionSection.addDetails') },
    { id: 'guestAccess', label: t('descriptionSection.guestAccess'), value: t('descriptionSection.addDetails') },
    { id: 'guestInteraction', label: t('descriptionSection.guestInteraction'), value: t('descriptionSection.addDetails') },
    { id: 'otherDetails', label: t('descriptionSection.otherDetails'), value: t('descriptionSection.addDetails') }
  ];
  const amenityIds = Array.isArray(flowDraft.amenityIds)
    ? flowDraft.amenityIds.filter((value): value is string => typeof value === 'string')
    : [];
  const amenityCount = amenityIds.length;
  const bookingSetting = flowDraft.bookingSetting === 'instant-book'
    ? 'Guests can book instantly.'
    : 'Your first 5 bookings require approval.';
  const confirmedLocation =
    listing.confirmedLocation && typeof listing.confirmedLocation === 'object'
      ? (listing.confirmedLocation as Record<string, unknown>)
      : {};
  const address =
    confirmedLocation.address && typeof confirmedLocation.address === 'object'
      ? (confirmedLocation.address as Record<string, unknown>)
      : {};
  const point =
    confirmedLocation.location && typeof confirmedLocation.location === 'object'
      ? (confirmedLocation.location as Record<string, unknown>)
      : {};
  const listingRecord = listing as Record<string, unknown>;
  const rawMapPosition =
    listingRecord.mapPosition && typeof listingRecord.mapPosition === 'object'
      ? (listingRecord.mapPosition as Record<string, unknown>)
      : undefined;

  const parseCoordinate = (value: unknown, min: number, max: number): number | null => {
    const numeric = typeof value === 'number' ? value : typeof value === 'string' && value.trim() ? Number(value) : NaN;
    return Number.isFinite(numeric) && numeric >= min && numeric <= max ? numeric : null;
  };

  const latitude =
    parseCoordinate(point.latitude, -90, 90) ??
    parseCoordinate(rawMapPosition?.latitude, -90, 90) ??
    parseCoordinate(confirmedLocation.latitude, -90, 90) ??
    parseCoordinate(point.lat, -90, 90) ??
    parseCoordinate((listing as Record<string, unknown>).latitude, -90, 90);

  const longitude =
    parseCoordinate(point.longitude, -180, 180) ??
    parseCoordinate(rawMapPosition?.longitude, -180, 180) ??
    parseCoordinate(confirmedLocation.longitude, -180, 180) ??
    parseCoordinate(point.lng, -180, 180) ??
    parseCoordinate(point.long, -180, 180) ??
    parseCoordinate((listing as Record<string, unknown>).longitude, -180, 180);

  const mapCenter =
    latitude !== null && longitude !== null
      ? { latitude, longitude }
      : DEFAULT_MAP_VIEW.center;

  const addressLabel =
    [address.streetAddress, address.city, address.region, address.country]
      .filter((part): part is string => typeof part === 'string' && Boolean(part.trim()))
      .join(', ') ||
    (typeof listing.generatedSummary?.location === 'string' && listing.generatedSummary.location.trim()
      ? listing.generatedSummary.location.trim()
      : '') ||
    (typeof listingRecord.address === 'string' && listingRecord.address.trim()
      ? listingRecord.address.trim()
      : '') ||
    (typeof listingRecord.countryRegion === 'string' && listingRecord.countryRegion.trim()
      ? listingRecord.countryRegion.trim()
      : '');

  const mapTitle = addressLabel
    ? `Map of ${addressLabel}`
    : `Map of ${DEFAULT_MAP_VIEW.label}`;
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
  // Photo tour cards: labelled rooms, rooms still missing photos (from room counts), then unassigned photos.
  const photoTourRooms = buildPhotoTourRooms(
    photoUrls,
    currentPhotoLabels,
    expectedPhotoTourRooms({ bedrooms: bedroomCount, bathrooms: bathroomCount, bathroomTypes: flowDraft.bathroomTypes && typeof flowDraft.bathroomTypes === 'object' ? flowDraft.bathroomTypes : undefined })
  );
  // Bedroom photos come from the photo tour labels, falling back to the editor's bedroom photo.
  const bedroomPhotoUrls = photoUrls.filter((_, index) => /bedroom|sleeping/i.test(currentPhotoLabels[index] ?? ''));
  // Bed types per room are not stored yet, so a single room shows the total bed count and
  // multiple rooms ask for beds. TODO(team): bed-type field in flowDraft + Flutter agreement.
  const sleepingRooms = bedroomCount > 0
    ? Array.from({ length: bedroomCount }, (_, index) => ({
        label: bedroomCount === 1
          ? t('sleepingArrangements.bedroom')
          : t('sleepingArrangements.bedroomNumbered', { number: index + 1 }),
        summary: bedroomCount === 1
          ? t('sleepingArrangements.beds', { count: bedCount })
          : t('sleepingArrangements.addBeds'),
        photoUrl: bedroomPhotoUrls[index] ?? (index === 0 ? bedroomPhotoUrl : undefined)
      }))
    : bedCount > 0
      ? [{
          label: t('sleepingArrangements.sleepingArea'),
          summary: t('sleepingArrangements.beds', { count: bedCount }),
          photoUrl: bedroomPhotoUrls[0] ?? bedroomPhotoUrl
        }]
      : [];

  useEffect(() => {
    setCurrentPhotoLabels(defaultPhotoLabels);
  }, [listing.id, listing.photoTour, photoUrls]);

  useEffect(() => {
    setIsPhotoTourCreated(Boolean(listing.photoTour));
  }, [listing.id, listing.photoTour]);



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

  const saveTitle = async (title: string) => {
    await updateCurrentUserListingTitle(listing.id, title);
    setIsTitleSheetOpen(false);
    toast.success(t('titleSheet.saved'));
  };

  const savePropertyType = async (change: PropertyTypeChange) => {
    await updateCurrentUserListingPropertyType(listing.id, change);
    setIsPropertyTypeSheetOpen(false);
    toast.success(t('propertyTypeSheet.saved'));
  };

  // Defaults until availability gets shared fields (see TODO in the availability section).
  // Min/max edits live in component state only and are lost on reload.
  const stayLength = localStayLength?.listingId === listing.id ? localStayLength : { minNights: 1, maxNights: 365 };
  const advanceNotice: AdvanceNoticeSetting =
    localAdvanceNotice?.listingId === listing.id ? localAdvanceNotice.setting : { days: 0, allowShorterNoticeRequests: true };
  const availability = { ...stayLength, sameDayCutoffHour: localSameDayCutoff?.listingId === listing.id ? localSameDayCutoff.hour : 24 };
  const availabilityRows: { id: string; label: string; value: string; emphasized: boolean; onOpen?: () => void }[] = [
    { id: 'minNights', label: t('availabilitySection.minNights'), value: String(availability.minNights), emphasized: true, onOpen: () => setStayLengthField('minNights') },
    { id: 'maxNights', label: t('availabilitySection.maxNights'), value: String(availability.maxNights), emphasized: true, onOpen: () => setStayLengthField('maxNights') },
    { id: 'advanceNotice', label: t('availabilitySection.advanceNotice'), value: advanceNoticeLabel(advanceNotice.days), emphasized: false, onOpen: () => setIsAdvanceNoticeOpen(true) },
    // The same-day cutoff only applies when guests can book for the same day.
    ...(advanceNotice.days === 0
      ? [{ id: 'sameDayCutoff', label: t('availabilitySection.sameDayNotice'), value: formatCutoffHour(availability.sameDayCutoffHour), emphasized: false, onOpen: () => setIsSameDayCutoffOpen(true) }]
      : [])
  ];

  const houseRules = readHouseRules(listing.houseRules);
  const closeHouseRules = () => {
    setIsHouseRulesOpen(false);
    requestAnimationFrame(() => houseRulesCardRef.current?.focus());
  };

  const accessibilityIds = localAccessibility?.listingId === listing.id ? localAccessibility.ids : [];

  if (isPublishStepsOpen) {
    return (
      <ListingPublishStepsPage
        listing={listing}
        selfieSubmitted={selfieSubmitted}
        onClose={() => {
          setIsPublishStepsOpen(false);
          // Verification may have changed while the steps were open.
          setReadinessKey(value => value + 1);
          requestAnimationFrame(() => publishStepsTriggerRef.current?.focus());
        }}
        onGetStarted={() => {
          setIsPublishStepsOpen(false);
          setIsIdentityVerificationOpen(true);
        }}
      />
    );
  }

  if (isIdentityVerificationOpen) {
    return (
      <ListingIdentityVerificationPage
        key={listing.id}
        onBack={() => {
          setIsIdentityVerificationOpen(false);
          setIsPublishStepsOpen(true);
        }}
        onComplete={() => {
          setSelfieSubmitted(true);
          setIsIdentityVerificationOpen(false);
          setIsPublishStepsOpen(true);
        }}
      />
    );
  }

  if (isCheckInMethodOpen) {
    const closeCheckInMethod = () => {
      setIsCheckInMethodOpen(false);
      requestAnimationFrame(() => checkInMethodCardRef.current?.focus());
    };
    return (
      <ListingCheckInMethodPage
        key={listing.id}
        selected={checkInMethod}
        details={checkInDetails}
        onBack={closeCheckInMethod}
        onSave={(method, details) => {
          // TODO(team): persist once shared check-in method + instructions fields are agreed with the Flutter app.
          setLocalCheckInMethod({ listingId: listing.id, method, details });
          toast(t('availabilitySheet.localOnly'), { id: 'check-in-method-local-only' });
          closeCheckInMethod();
        }}
      />
    );
  }

  if (isPreviewOpen) {
    const placeLabel =
      [address.city, address.country]
        .filter((part): part is string => typeof part === 'string' && Boolean(part.trim()))
        .join(', ') || addressLabel;
    return (
      <ListingPreviewPage
        key={listing.id}
        data={{
          title: listingTitle,
          photoUrls,
          propertyType,
          placeLabel,
          bedrooms: bedroomCount,
          beds: bedCount,
          bathrooms: bathroomCount,
          guests: guestCount,
          description: typeof flowDraft.listingDescription === 'string' && flowDraft.listingDescription.trim()
            ? flowDraft.listingDescription.trim()
            : null,
          categoryId: flowDraft.listingCategory,
          amenityIds,
          mapCenter,
          hasLocation: latitude !== null && longitude !== null,
          stayRules: { minNights: availability.minNights, maxNights: availability.maxNights },
          timeZone: typeof point.timezone === 'string' ? point.timezone : undefined
        }}
        onBack={() => {
          setIsPreviewOpen(false);
          requestAnimationFrame(() => viewButtonRef.current?.focus());
        }}
      />
    );
  }

  if (isPreferencesOpen) {
    return (
      <ListingPreferencesPage
        key={listing.id}
        onBack={() => {
          setIsPreferencesOpen(false);
          requestAnimationFrame(() => settingsButtonRef.current?.focus());
        }}
        onOpenListings={onBack}
      />
    );
  }

  if (isAccessibilityOpen) {
    return (
      <ListingAccessibilityFeaturesPage
        key={listing.id}
        selectedIds={accessibilityIds}
        onToggle={(id) => {
          setLocalAccessibility({
            listingId: listing.id,
            ids: accessibilityIds.includes(id) ? accessibilityIds.filter((value) => value !== id) : [...accessibilityIds, id]
          });
          toast(t('availabilitySheet.localOnly'), { id: 'accessibility-local-only' });
        }}
        onBack={() => {
          setIsAccessibilityOpen(false);
          requestAnimationFrame(() => accessibilityCardRef.current?.focus());
        }}
      />
    );
  }

  if (isAmenitiesOpen) {
    return (
      <ListingAmenitiesPage
        key={listing.id}
        amenityIds={amenityIds}
        categoryId={flowDraft.listingCategory}
        onBack={() => {
          setIsAmenitiesOpen(false);
          requestAnimationFrame(() => amenitiesCardRef.current?.focus());
        }}
        onSave={async (selected) => {
          await updateCurrentUserListingAmenities(listing.id, selected);
          toast.success(t('listingAmenities.saved'));
        }}
      />
    );
  }

  if (isHouseRulesOpen) {
    return (
      <HouseRulesPage
        key={listing.id}
        houseRules={houseRules}
        guests={guestCount}
        flowDraft={flowDraft}
        onBack={closeHouseRules}
        onSave={async (update) => {
          await updateCurrentUserListingHouseRules(listing.id, update);
          toast.success(t('houseRulesPage.saved'));
          closeHouseRules();
        }}
      />
    );
  }

  if (isAllPhotosOpen) {
    return (
      <AllPhotosManager
        listing={listing}
        onPhotoLabelsChange={setCurrentPhotoLabels}
        onBack={() => setIsAllPhotosOpen(false)}
      />
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative grid text-[0.830466rem] min-h-[calc(100dvh-96px)] bg-[var(--color-surface)] [&_button:focus-visible]:outline [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-4 [&_button:focus-visible]:outline-[var(--color-text-primary)] lg:h-[calc(100dvh-96px)] lg:min-h-0 lg:grid-cols-[360px_minmax(0,1fr)] lg:overflow-hidden xl:grid-cols-[400px_minmax(0,1fr)]"
    >
      <aside className={`${isMobileDetailOpen ? 'hidden' : 'block'} relative min-h-0 min-w-0 border-[var(--color-border)] lg:block lg:border-r`}>
        <div ref={editorScrollRef} className="h-full px-5 pb-44 pt-5 sm:px-8 md:pb-28 lg:overflow-y-auto lg:overscroll-contain lg:pt-8">
        <div className="mx-auto max-w-lg pb-6">
          <div ref={editorHeaderRef} className="sticky top-0 z-20 bg-[var(--color-surface)] pb-1">
          <div className="grid grid-cols-[44px_minmax(0,1fr)_44px] items-center">
            <button
              type="button"
              onClick={onBack}
              aria-label="Back to your listings"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-[var(--color-surface-muted)]"
            >
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <h1 className="truncate text-center text-[1.0380825rem] font-semibold tracking-[-0.02em]">Listing editor</h1>
            <button
              type="button"
              ref={settingsButtonRef}
              onClick={() => setIsPreferencesOpen(true)}
              aria-label={t('listingPreferences.open')}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-[var(--color-surface-muted)]"
            >
              <Settings className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div role="tablist" aria-label={t('arrivalGuide.tabsLabel')} className="mt-5 flex rounded-full bg-[var(--color-surface-muted)] p-1">
            {(['space', 'arrival'] as const).map(tab => (
              <button
                key={tab}
                ref={element => { tabRefs.current[tab] = element; }}
                id={`listing-editor-tab-${tab}`}
                type="button"
                role="tab"
                aria-selected={editorTab === tab}
                aria-controls="listing-editor-panel"
                tabIndex={editorTab === tab ? 0 : -1}
                onClick={() => selectTab(tab)}
                onKeyDown={event => {
                  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
                  event.preventDefault();
                  const next = event.key === 'Home' ? 'space' : event.key === 'End' ? 'arrival' : tab === 'space' ? 'arrival' : 'space';
                  selectTab(next);
                  tabRefs.current[next]?.focus();
                }}
                className={`min-h-11 flex-1 rounded-full px-3 text-sm font-semibold ${editorTab === tab ? 'bg-[var(--color-surface)] shadow-[var(--shadow-sm)]' : ''}`}
              >
                {tab === 'space' ? t('arrivalGuide.yourSpace') : t('arrivalGuide.tab')}
              </button>
            ))}
          </div>
          </div>

          <div id="listing-editor-panel" role="tabpanel" aria-labelledby={`listing-editor-tab-${editorTab}`} className="mt-6 grid gap-4">
            {editorTab === 'arrival' ? (
              <ListingArrivalGuide
                guests={guestCount}
                times={checkInOutTimes}
                directions={directions}
                checkInMethodLabel={checkInMethod ? t(`checkInMethod.methods.${checkInMethod}.title`) : undefined}
                checkInMethodButtonRef={checkInMethodCardRef}
                onOpenCheckInOut={() => setIsCheckInOutOpen(true)}
                houseRules={houseRules}
                cardClassName={editorCardButtonClass}
                selected={arrivalSection}
                selectedCardRef={selectedSectionRef}
                houseRulesButtonRef={houseRulesCardRef}
                onOpenHouseRules={() => setIsHouseRulesOpen(true)}
                onSelect={section => {
                  if (section === 'directions') {
                    setIsDirectionsOpen(true);
                    return;
                  }
                  if (section === 'checkInMethod') {
                    setIsCheckInMethodOpen(true);
                    return;
                  }
                  setArrivalSection(section);
                  setIsMobileDetailOpen(true);
                }}
              />
            ) : (
            <>
            <button
              type="button"
              // Both verifications done: offer Deploy/Continue; otherwise continue the verification steps.
              onClick={() => isPublishReady ? setIsPublishReadyOpen(true) : setIsPublishStepsOpen(true)}
              ref={publishStepsTriggerRef}
              aria-haspopup={isPublishReady ? 'dialog' : undefined}
              className={`${editorCardButtonClass} flex items-center gap-4 p-4`}
            >
              <span className="inline-flex h-[calc(var(--spacing)*19.2)] w-[calc(var(--spacing)*19.2)] shrink-0 items-center justify-center overflow-hidden rounded-[calc(var(--radius-xl)*0.85)] bg-[var(--color-surface-muted)]">
                <ShimmerImage src={completeStepImage} alt="" width={64} height={64} className="h-full w-full object-contain" />
              </span>
              <span className="min-w-0">
                <span className="block text-[0.830466rem] font-semibold">{t('listingPublishReady.cardTitle')}</span>
                <span className="mt-0.5 flex items-center gap-1 text-[0.72665775rem] text-[var(--color-text-secondary)]">
                  {isPublishReady ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[var(--color-success)]" strokeWidth={1.5} aria-hidden="true" /> : null}
                  {t(isPublished ? 'listingPublishReady.cardPublished' : isPublishReady ? 'listingPublishReady.cardReady' : 'listingPublishReady.cardRequired')}
                </span>
              </span>
            </button>
            <ListingPublishReadySheet
              open={isPublishReadyOpen}
              listingId={listing.id}
              published={isPublished}
              onClose={() => setIsPublishReadyOpen(false)}
              onPublished={() => {
                setIsPublishReadyOpen(false);
                toast.success(t('listingPublishReady.success'));
              }}
            />

            <button
              type="button"
              onClick={() => { setActiveSection('photos'); setIsMobileDetailOpen(true); }}
              ref={activeSection === 'photos' ? selectedSectionRef : undefined}
              aria-pressed={activeSection === 'photos'}
              className={`${editorCardButtonClass} ${activeSection === 'photos' ? 'lg:ring-2 lg:ring-[var(--color-text-primary)]' : ''}`}
            >
              <span className="block text-[0.830466rem] font-semibold">{isPhotoTourCreated ? 'Photo tour' : 'Photos'}</span>
              {isPhotoTourCreated ? (
                <span className="block">
                  <span className="mt-0.5 block text-[0.830466rem] text-[var(--color-text-secondary)]">
                    {bedroomCount} {bedroomCount === 1 ? 'bedroom' : 'bedrooms'} · {bedCount} {bedCount === 1 ? 'bed' : 'beds'} · {bathroomCount} {bathroomCount === 1 ? 'bath' : 'baths'}
                  </span>
                  <PhotoTourStack listing={listing} className="mt-7" />
                  <span className="mt-6 flex items-center gap-2.5 text-[0.72665775rem] font-medium">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-orange-600" aria-hidden="true" />
                    You have 2 tasks
                  </span>
                </span>
              ) : (
                <span className="mt-4 flex items-center gap-3 rounded-xl bg-[var(--color-surface-muted)] p-4">
                  <span className="inline-flex h-[calc(var(--spacing)*14.4)] w-[calc(var(--spacing)*14.4)] shrink-0 items-center justify-center overflow-hidden rounded-[calc(var(--radius-photo)*0.85)] bg-[var(--color-border)]">
                    {photoUrls[0] ? (
                      <ShimmerImage src={photoUrls[0]} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Image className="h-5 w-5" aria-hidden="true" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1 text-[0.72665775rem] font-semibold leading-snug">
                    Showcase your photos by room, instantly
                  </span>
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-text-primary)] text-[var(--color-surface)]">
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => { setActiveSection('title'); setIsTitleSheetOpen(true); }}
              aria-haspopup="dialog"
              ref={activeSection === 'title' ? selectedSectionRef : undefined}
              aria-pressed={activeSection === 'title'}
              className={`${editorCardButtonClass} ${activeSection === 'title' ? 'lg:ring-2 lg:ring-[var(--color-text-primary)]' : ''}`}
            >
              <span className="block text-[0.830466rem] font-semibold">{t('titleSheet.heading')}</span>
              <span className="mt-1 line-clamp-2 break-words text-[1.0380825rem] leading-7 text-[var(--color-text-secondary)]">{listingTitle}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPropertyTypeSheetOpen(true)}
              aria-haspopup="dialog"
              className={editorCardButtonClass}
            >
              <span className="block text-[0.830466rem] font-semibold">{t('propertyTypeSheet.heading')}</span>
              <span className="mt-1.5 block break-words text-[0.72665775rem] leading-6 text-[var(--color-text-secondary)]">
                {accessTypeLabel} · {propertyType}
              </span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveSection('sleeping'); setIsMobileDetailOpen(true); }}
              ref={activeSection === 'sleeping' ? selectedSectionRef : undefined}
              aria-pressed={activeSection === 'sleeping'}
              className={`${editorCardButtonClass} ${activeSection === 'sleeping' ? 'lg:ring-2 lg:ring-[var(--color-text-primary)]' : ''}`}
            >
              <span className="block text-[0.830466rem] font-semibold">{t('sleepingArrangements.heading')}</span>
              {bedroomCount || bedCount ? (
                <span className="mt-3 flex items-center gap-4">
                  <span className="inline-flex h-[calc(var(--spacing)*16.8)] w-[calc(var(--spacing)*16.8)] shrink-0 items-center justify-center overflow-hidden rounded-[calc(var(--radius-xl)*0.85)] bg-[var(--color-surface-muted)]">
                    {bedroomPhotoUrl ? (
                      <ShimmerImage src={bedroomPhotoUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <BedDouble className="h-6 w-6 text-[var(--color-text-primary)]" aria-hidden="true" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[0.830466rem] font-semibold text-[var(--color-text-primary)]">
                      {bedroomCount > 1
                        ? t('sleepingArrangements.bedrooms', { count: bedroomCount })
                        : bedroomCount === 1 ? t('sleepingArrangements.bedroom') : t('sleepingArrangements.sleepingArea')}
                    </span>
                    <span className="block text-[0.72665775rem] leading-snug text-[var(--color-text-secondary)]">
                      {t('sleepingArrangements.beds', { count: bedCount })}
                    </span>
                  </span>
                </span>
              ) : (
                <span className="mt-1.5 block text-[0.72665775rem] leading-6 text-[var(--color-text-secondary)]">
                  {t('sleepingArrangements.addDetails')}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => { setActiveSection('pricing'); setIsMobileDetailOpen(true); }}
              ref={activeSection === 'pricing' ? selectedSectionRef : undefined}
              aria-pressed={activeSection === 'pricing'}
              className={`${editorCardButtonClass} ${activeSection === 'pricing' ? 'lg:ring-2 lg:ring-[var(--color-text-primary)]' : ''}`}
            >
              <span className="block text-[0.830466rem] font-semibold">{t('listingPricing.heading')}</span>
              <span className="mt-1.5 block text-[0.72665775rem] leading-6 text-[var(--color-text-secondary)]">
                {formatCurrency(basePrice, 'CDF')}
                {weekendPrice !== basePrice ? ` – ${formatCurrency(weekendPrice, 'CDF')}` : ''} {t('listingPricing.perNight').toLocaleLowerCase()}
              </span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveSection('discounts'); setIsMobileDetailOpen(true); }}
              ref={activeSection === 'discounts' ? selectedSectionRef : undefined}
              aria-pressed={activeSection === 'discounts'}
              className={`${editorCardButtonClass} ${activeSection === 'discounts' ? 'lg:ring-2 lg:ring-[var(--color-text-primary)]' : ''}`}
            >
              <span className="block text-[0.830466rem] font-semibold">{t('discountsSection.heading')}</span>
              <span className="mt-1.5 grid gap-0.5 text-[0.72665775rem] leading-6 text-[var(--color-text-secondary)]">
                {selectedDiscounts.length > 0 ? (
                  selectedDiscounts.map(({ id, percentage }) => (
                    <span key={id}>{t(`discountsSection.summary_${id}`, { percent: percentage })}</span>
                  ))
                ) : (
                  <span>{t('discountsSection.addDetails')}</span>
                )}
              </span>
            </button>
            <EditorCard title="Booking settings">
              {bookingSetting}
              {flowDraft.bookingSetting !== 'instant-book' ? (
                <span className="mt-4 flex items-center gap-3 rounded-xl bg-[var(--color-surface-muted)] p-4 leading-snug text-[var(--color-text-primary)]">
                  <Zap className="h-7 w-7 shrink-0 fill-current text-[var(--color-warning)]" aria-hidden="true" />
                  Instant Book listings often get booked quicker.
                </span>
              ) : null}
            </EditorCard>

            <button
              type="button"
              onClick={() => { setActiveSection('availability'); setIsMobileDetailOpen(true); }}
              ref={activeSection === 'availability' ? selectedSectionRef : undefined}
              aria-pressed={activeSection === 'availability'}
              className={`${editorCardButtonClass} ${activeSection === 'availability' ? 'lg:ring-2 lg:ring-[var(--color-text-primary)]' : ''}`}
            >
              <span className="block text-[0.830466rem] font-semibold">{t('availabilitySection.heading')}</span>
              <span className="mt-1.5 block text-[0.72665775rem] leading-6 text-[var(--color-text-secondary)]">
                <span className="block">{t('availabilitySection.summaryNights', { min: availability.minNights, max: availability.maxNights })}</span>
                <span className="block">
                  {advanceNotice.days === 0
                    ? t('availabilitySection.sameDayNotice')
                    : t('advanceNoticeSheet.summary', { count: advanceNotice.days })}
                </span>
              </span>
            </button>

            <button type="button" onClick={() => setIsGuestCountOpen(true)} aria-haspopup="dialog" className={editorCardButtonClass}>
              <span className="block text-[0.830466rem] font-semibold">{t('guestCountSheet.heading')}</span>
              <span className="mt-1.5 block text-[0.72665775rem] leading-6 text-[var(--color-text-secondary)]">
                {t('guestCountSheet.guests', { count: guestCount })}
              </span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveSection('description'); setIsMobileDetailOpen(true); }}
              ref={activeSection === 'description' ? selectedSectionRef : undefined}
              aria-pressed={activeSection === 'description'}
              className={`${editorCardButtonClass} ${activeSection === 'description' ? 'lg:ring-2 lg:ring-[var(--color-text-primary)]' : ''}`}
            >
              <span className="block text-[0.830466rem] font-semibold">{t('descriptionSection.heading')}</span>
              <span className="mt-1.5 line-clamp-3 break-words text-[0.72665775rem] leading-6 text-[var(--color-text-secondary)]">{description}</span>
            </button>

            <button type="button" ref={amenitiesCardRef} onClick={() => setIsAmenitiesOpen(true)} className={editorCardButtonClass}>
              <span className="block text-[0.830466rem] font-semibold">{t('listingAmenities.heading')}</span>
              <span className="mt-1.5 block text-[0.72665775rem] leading-6 text-[var(--color-text-secondary)]">
                {amenityCount > 0 ? t('listingAmenities.selected', { count: amenityCount }) : t('descriptionSection.addDetails')}
              </span>
            </button>

            <button type="button" ref={accessibilityCardRef} onClick={() => setIsAccessibilityOpen(true)} className={editorCardButtonClass}>
              <span className="block text-[0.830466rem] font-semibold">{t('accessibilityFeatures.heading')}</span>
              <span className="mt-1.5 block text-[0.72665775rem] leading-6 text-[var(--color-text-secondary)]">
                {accessibilityIds.length > 0
                  ? t('accessibilityFeatures.added', { count: accessibilityIds.length })
                  : t('descriptionSection.addDetails')}
              </span>
            </button>

            <EditorCard title="Location">
              <BooksaMap
                center={mapCenter}
                initialZoom={15}
                title={mapTitle}
                interactive={false}
                showControls={false}
                className="mt-4 h-[184.8px] w-full border border-[var(--color-border)]"
              >
                <span className="pointer-events-none absolute left-1/2 top-1/2 inline-flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-text-primary)_22%,transparent)]">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-text-primary)] text-[var(--color-surface)] shadow-[var(--shadow-md)]">
                    <Home className="h-5 w-5" aria-hidden="true" />
                  </span>
                </span>
              </BooksaMap>
              <span className="mt-4 block">{addressLabel || 'Location not provided'}</span>
            </EditorCard>

            <ListingHostCard className={editorCardClass} onOpen={setHostProfileSheet} />

            <EditorCard title="Co-hosts">Add details</EditorCard>

            <button
              type="button"
              ref={houseRulesCardRef}
              onClick={() => setIsHouseRulesOpen(true)}
              className={editorCardButtonClass}
            >
              <span className="block text-[0.830466rem] font-semibold">{t('houseRulesPage.heading')}</span>
              <span className="mt-1.5 block text-[0.72665775rem] leading-6 text-[var(--color-text-secondary)]">
                <span className="mt-2 flex items-center gap-3 text-[var(--color-text-primary)]">
                  <Clock3 className="h-6 w-6 shrink-0" aria-hidden="true" /> {t('houseRulesPage.checkInOut.summary')}
                </span>
                <span className="mt-3 flex items-center gap-3 text-[var(--color-text-primary)]">
                  <Users className="h-6 w-6 shrink-0" aria-hidden="true" /> {guestCount} {guestCount === 1 ? 'guest' : 'guests'} maximum
                </span>
              </span>
            </button>

            <EditorCard title="Guest safety">
              {!amenityIds.includes('carbon-monoxide-alarm') ? (
                <span className="mt-2 flex items-center gap-3 leading-snug text-[var(--color-text-primary)]">
                  <AlarmSmoke className="h-6 w-6 shrink-0" aria-hidden="true" /> Carbon monoxide alarm not reported
                </span>
              ) : null}
              {!amenityIds.includes('smoke-alarm') ? (
                <span className="mt-3 flex items-center gap-3 leading-snug text-[var(--color-text-primary)]">
                  <AlarmSmoke className="h-6 w-6 shrink-0" aria-hidden="true" /> Smoke alarm not reported
                </span>
              ) : null}
              {amenityIds.includes('carbon-monoxide-alarm') && amenityIds.includes('smoke-alarm') ? 'Safety alarms reported' : null}
            </EditorCard>

            <EditorCard title="Cancellation policy">
              <span className="block">Flexible for short-term stays</span>
              <span className="block">Firm long term for long-term stays</span>
            </EditorCard>

            <EditorCard title="Custom link">Add details</EditorCard>
            </>
            )}
          </div>
        </div>
        </div>

        {/* Below lg the window scrolls, so the button is fixed to the viewport (above the host tab bar below md);
            from lg the sidebar scrolls on its own and the button stays centered at the bottom of that column. */}
        <button
          type="button"
          ref={viewButtonRef}
          onClick={() => setIsPreviewOpen(true)}
          className="fixed bottom-[calc(72px+20px+env(safe-area-inset-bottom))] left-1/2 z-30 flex md:bottom-[calc(20px+env(safe-area-inset-bottom))] lg:absolute lg:z-10 min-h-12 -translate-x-1/2 items-center gap-2 rounded-full bg-[var(--color-text-primary)] px-6 text-[0.830466rem] font-semibold text-[var(--color-surface)] shadow-[var(--shadow-lg)] transition active:scale-95"
        >
          <Eye className="h-5 w-5" aria-hidden="true" />
          {t('listingPreview.view')}
        </button>
      </aside>

      <div className={`${isMobileDetailOpen ? 'block' : 'hidden'} min-w-0 px-6 py-8 sm:px-10 lg:block lg:overflow-y-auto lg:overscroll-contain lg:px-12 lg:py-12 xl:px-16`}>
        <div className="mx-auto w-full max-w-[720px]">
          {/* Icon-only back on mobile, like the other editor pages; the wrapper carries the focus ref. */}
          <div ref={mobileBackRef} className="mb-8 lg:hidden">
            <BackButton
              label={t('listingPreview.back')}
              variant="muted"
              onClick={() => {
                setIsMobileDetailOpen(false);
                requestAnimationFrame(() => selectedSectionRef.current?.focus());
              }}
            />
          </div>
          {editorTab === 'arrival' ? <ArrivalGuideDetails section={arrivalSection} /> : activeSection === 'photos' ? (
            isPhotoTourCreated ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-5">
                  <div>
                    <h2 className="text-[1.660932rem] font-semibold tracking-tight">Photo tour</h2>
                    <p className="mt-3 max-w-[484px] text-[0.830466rem] leading-6 text-[var(--color-text-secondary)]">
                      Manage photos and add details. Guests will only see your tour if every room has a photo.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAllPhotosOpen(true)}
                      className="inline-flex h-12 items-center gap-2 rounded-full bg-[var(--color-surface-muted)] px-5 text-[0.72665775rem] font-semibold"
                    >
                      <Copy className="h-4 w-4" aria-hidden="true" />
                      All photos
                    </button>
                    <button
                      type="button"
                      aria-label="Add photo tour room"
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-surface-muted)] transition hover:brightness-95"
                    >
                      <Plus className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPublishStepsOpen(true)}
                  className="mt-8 flex min-h-16 w-full items-center gap-3 rounded-card bg-[var(--color-surface-muted)] px-6 text-left text-[0.830466rem] font-semibold"
                >
                  <span className="h-2 w-2 shrink-0 rounded-full bg-orange-600" aria-hidden="true" />
                  <span className="flex-1">View your tasks</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>

                <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 sm:gap-x-6">
                  {photoTourRooms.map((room) => {
                    const label = room.isAdditional ? t('photoTour.additionalPhotos') : room.label;
                    const coverUrl = room.photoUrls[0];
                    const summary = room.photoUrls.length > 0
                      ? t('photoTour.photos', { count: room.photoUrls.length })
                      : t('photoTour.addPhotos');
                    return (
                      <li key={room.id} className="min-w-0">
                        {/* Rooms are edited in All photos (assign photos to a room there). */}
                        <button
                          type="button"
                          onClick={() => setIsAllPhotosOpen(true)}
                          aria-label={`${label}, ${summary}`}
                          className="group block w-full rounded-[calc(var(--radius-photo)*1.25)] text-left"
                        >
                          <span className="flex aspect-square items-center justify-center overflow-hidden rounded-[calc(var(--radius-photo)*1.25)] bg-[var(--color-surface-muted)] transition group-hover:brightness-95">
                            {coverUrl ? (
                              <ShimmerImage src={coverUrl} alt="" className="h-full w-full object-cover" />
                            ) : room.illustrationUrl ? (
                              <ShimmerImage src={room.illustrationUrl} alt="" loading="lazy" decoding="async" className="h-full w-full object-contain p-[12%]" />
                            ) : (
                              <Image className="h-12 w-12 text-[var(--color-text-secondary)]" aria-hidden="true" />
                            )}
                          </span>
                          <span className="mt-3 block truncate text-[0.830466rem] font-semibold">{label}</span>
                          <span className="mt-0.5 block text-[0.72665775rem] text-[var(--color-text-secondary)] group-hover:underline">{summary}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : (
            <>
              <h2 className="text-[1.660932rem] font-semibold tracking-tight">Photos</h2>
              <div className="mt-8 flex flex-col items-center overflow-hidden rounded-dialog bg-[#f7f6f2] px-5 py-10 text-center text-[#222] dark:bg-[var(--color-surface-muted)] dark:text-[var(--color-text-primary)] sm:px-10 sm:py-12">
                <h3 className="max-w-md text-[23.253048px] font-semibold leading-tight tracking-[-0.03em] sm:text-[26.574912px]">
                  Showcase your photos<br />by room, instantly
                </h3>
                <div className="relative mt-8 h-[312px] w-[396px] max-w-full sm:h-[360px]">
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
                          className="absolute left-1/2 top-1/2 h-[calc(var(--spacing)*52.8)] w-[calc(var(--spacing)*43.2)] rounded-[calc(var(--radius-photo)*0.85)] sm:h-[calc(var(--spacing)*67.2)] sm:w-[calc(var(--spacing)*52.8)] object-cover shadow-[0_16px_32px_rgba(0,0,0,0.18)]"
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
                  className="mt-10 min-h-12 rounded-button bg-white px-6 py-3 text-[0.830466rem] font-semibold text-[#222] shadow-[var(--shadow-sm)] transition hover:shadow-[var(--shadow-md)] disabled:cursor-not-allowed disabled:opacity-70 dark:bg-[var(--color-surface)] dark:text-[var(--color-text-primary)]"
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
          ) : activeSection === 'pricing' ? (
            <ListingPricingSection
              key={listing.id}
              listing={{ ...listing, flowDraft }}
              onOpenCalendar={onOpenCalendar}
              onSavePrice={async (price) => {
                await updateCurrentUserListingBasePrice(listing.id, price);
                toast.success(t('nightlyPriceSheet.saved'));
              }}
              onSaveWeekendAdjustment={async (adjustment) => {
                await updateCurrentUserListingWeekendAdjustment(listing.id, adjustment);
                toast.success(t('weekendAdjustmentSheet.saved'));
              }}
            />
          ) : activeSection === 'description' ? (
            <>
              <h2 className="text-[1.660932rem] font-semibold leading-tight tracking-tight">{t('descriptionSection.pageHeading')}</h2>
              {/* TODO(team): additional description rows need agreed shared fields before editing is enabled. */}
              <ul className="mt-8 grid">
                {descriptionRows.map(({ id, label, value }) => (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => setIsDescriptionOpen(true)}
                      disabled={id !== 'listingDescription'}
                      aria-haspopup={id === 'listingDescription' ? 'dialog' : undefined}
                      className="flex min-h-11 w-full items-center gap-4 rounded-button py-5 text-left transition enabled:hover:bg-[var(--color-surface-muted)] disabled:cursor-default"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block text-[0.830466rem] font-medium">{label}</span>
                        <span className="mt-0.5 line-clamp-2 break-words text-[0.72665775rem] leading-snug text-[var(--color-text-secondary)]">{value}</span>
                      </span>
                      {id === 'listingDescription' ? <ChevronRight className="h-5 w-5 shrink-0 text-[var(--color-text-secondary)]" aria-hidden="true" /> : null}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : activeSection === 'discounts' ? (
            <>
              <h2 className="text-[1.660932rem] font-semibold leading-tight tracking-tight">{t('discountsSection.pageHeading')}</h2>
              {selectedDiscounts.length > 0 ? (
                <ul className="mt-8 grid gap-4">
                  {selectedDiscounts.map(({ id, percentage }) => (
                    <li key={id}>
                      {/* TODO(team): add the "Weekly/Monthly average is …" line once a shared pricing helper defines discounted stay totals. */}
                      <article className="rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                        <h3 className="text-[0.72665775rem] font-medium">
                          {t(`discountsSection.title_${id}`)}
                          <span className="font-normal text-[var(--color-text-secondary)]"> · {t(`discountsSection.condition_${id}`)}</span>
                        </h3>
                        <p className="mt-2 text-[1.245699rem] font-semibold tracking-tight">
                          {t('discountsSection.percent', { percent: percentage })}
                        </p>
                      </article>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-8 rounded-card border border-dashed border-[var(--color-border)] p-6 text-[0.72665775rem] leading-6 text-[var(--color-text-secondary)]">
                  {t('discountsSection.empty')}
                </p>
              )}
              <button
                type="button"
                onClick={onOpenCalendar}
                className="mt-8 flex min-h-16 w-full items-start gap-3 rounded-card bg-[var(--color-surface-muted)] px-5 py-5 text-left text-[0.830466rem] font-semibold leading-snug transition hover:brightness-95"
              >
                <ExternalLink className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                {t('discountsSection.calendarLink')}
              </button>
            </>
          ) : activeSection === 'availability' ? (
            <>
              <h2 className="text-[1.660932rem] font-semibold leading-tight tracking-tight">{t('availabilitySection.pageHeading')}</h2>
              <p className="mt-3 max-w-[484px] text-[0.830466rem] leading-6 text-[var(--color-text-secondary)]">
                {t('availabilitySection.subtitle')}
              </p>
              {/* TODO(team): availability settings have no shared Firestore fields yet; these cards show the defaults and become editable once the Flutter app agrees on a shape. */}
              <ul className="mt-8 grid gap-4">
                {availabilityRows.map(({ id, label, value, emphasized, onOpen }) => {
                  const content = (
                    <>
                      <span className="block text-[0.72665775rem] font-medium">{label}</span>
                      <span className={`mt-2 block ${emphasized ? 'text-[1.245699rem] font-semibold tracking-tight' : 'text-[0.830466rem]'}`}>
                        {value}
                      </span>
                    </>
                  );
                  return (
                    <li key={id}>
                      {onOpen ? (
                        <button
                          type="button"
                          aria-haspopup="dialog"
                          onClick={onOpen}
                          className="block w-full rounded-card border border-transparent bg-[var(--color-surface)] p-5 text-left shadow-[var(--shadow-sm)] transition hover:shadow-[var(--shadow-md)] active:scale-[0.99]"
                        >
                          {content}
                        </button>
                      ) : (
                        <div className="rounded-card border border-transparent bg-[var(--color-surface)] p-5 shadow-[var(--shadow-sm)]">{content}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
              <button
                type="button"
                onClick={onOpenCalendar}
                className="mt-8 flex min-h-16 w-full items-start gap-3 rounded-card bg-[var(--color-surface-muted)] px-5 py-5 text-left text-[0.830466rem] font-semibold leading-snug transition hover:brightness-95"
              >
                <ExternalLink className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                {t('availabilitySection.calendarLink')}
              </button>
            </>
          ) : activeSection === 'sleeping' ? (
            <>
              <h2 className="text-[1.660932rem] font-semibold leading-tight tracking-tight">{t('sleepingArrangements.pageHeading')}</h2>
              <p className="mt-3 max-w-[484px] text-[0.830466rem] leading-6 text-[var(--color-text-secondary)]">
                {t('sleepingArrangements.pageSubtitle')}
              </p>
              {sleepingRooms.length > 0 ? (
                <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                  {sleepingRooms.map(({ label, summary, photoUrl }) => (
                    <li key={label}>
                      {/* TODO(design): open a bed-type picker per room once bed types are stored. */}
                      <article className="flex items-center gap-4 rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                        <span className="inline-flex h-[calc(var(--spacing)*19.2)] w-[calc(var(--spacing)*19.2)] shrink-0 items-center justify-center overflow-hidden rounded-[calc(var(--radius-photo)*0.85)] bg-[var(--color-surface-muted)]">
                          {photoUrl ? (
                            <ShimmerImage src={photoUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <BedDouble className="h-6 w-6 text-[var(--color-text-secondary)]" aria-hidden="true" />
                          )}
                        </span>
                        <span className="min-w-0">
                          <h3 className="truncate text-[0.830466rem] font-semibold">{label}</h3>
                          <p className="mt-0.5 text-[0.72665775rem] leading-snug text-[var(--color-text-secondary)]">{summary}</p>
                        </span>
                      </article>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-8 rounded-card border border-dashed border-[var(--color-border)] p-6 text-[0.72665775rem] leading-6 text-[var(--color-text-secondary)]">
                  {t('sleepingArrangements.empty')}
                </p>
              )}
            </>
          ) : (
            <>
              <h2 className="text-[1.660932rem] font-semibold tracking-tight">{t('titleSheet.heading')}</h2>
              <div className="mt-8 rounded-card border border-[var(--color-border)] p-6 sm:p-8">
                <p className="text-[0.72665775rem] font-semibold">{t('titleSheet.fieldLabel')}</p>
                <button
                  type="button"
                  onClick={() => setIsTitleSheetOpen(true)}
                  aria-haspopup="dialog"
                  aria-label={t('titleSheet.edit')}
                  className="mt-3 flex min-h-14 w-full items-center justify-between gap-4 rounded-field border border-[var(--color-border)] bg-transparent px-4 py-3 text-left text-[0.830466rem] transition hover:bg-[var(--color-surface-muted)]"
                >
                  <span className="min-w-0 break-words">{listingTitle}</span>
                  <span className="inline-flex shrink-0 items-center gap-2 text-[0.72665775rem] font-semibold">
                    {t('titleSheet.edit')}
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </button>
                <p className="mt-3 text-[0.72665775rem] text-[var(--color-text-secondary)]">
                  {t('titleSheet.helper')}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
      <ListingDescriptionSheet
        key={`description-${listing.id}`}
        open={isDescriptionOpen}
        description={typeof flowDraft.listingDescription === 'string' ? flowDraft.listingDescription : ''}
        onClose={() => setIsDescriptionOpen(false)}
        onSave={async (description) => {
          await updateCurrentUserListingDescription(listing.id, description);
          setIsDescriptionOpen(false);
          toast.success(t('descriptionSheet.saved'));
        }}
      />
      <HostProfileSheet
        open={hostProfileSheet !== null}
        name={hostProfileSheet?.name ?? ''}
        avatarUrl={hostProfileSheet?.avatarUrl}
        onClose={() => setHostProfileSheet(null)}
      />
      <ListingDirectionsSheet
        key={`directions-${listing.id}`}
        open={isDirectionsOpen}
        directions={directions}
        onClose={() => setIsDirectionsOpen(false)}
        onSave={(text) => {
          setLocalDirections({ listingId: listing.id, text });
          setIsDirectionsOpen(false);
          toast(t('directionsSheet.localOnly'));
        }}
      />
      <ListingCheckInOutSheet
        key={`check-in-out-${listing.id}`}
        open={isCheckInOutOpen}
        times={checkInOutTimes ?? DEFAULT_CHECK_IN_OUT_TIMES}
        onClose={() => setIsCheckInOutOpen(false)}
        onSave={(times) => {
          setLocalCheckInOut({ listingId: listing.id, times });
          setIsCheckInOutOpen(false);
          toast(t('checkInOutSheet.localOnly'));
        }}
      />
      <ListingAdvanceNoticeSheet
        open={isAdvanceNoticeOpen}
        setting={advanceNotice}
        onClose={() => setIsAdvanceNoticeOpen(false)}
        onSave={(setting) => {
          // TODO(team): persist once availability fields are agreed with the Flutter app.
          setLocalAdvanceNotice({ listingId: listing.id, setting });
          setIsAdvanceNoticeOpen(false);
          toast(t('availabilitySheet.localOnly'));
        }}
      />
      <ListingSameDayCutoffSheet
        open={isSameDayCutoffOpen}
        hour={availability.sameDayCutoffHour}
        onClose={() => setIsSameDayCutoffOpen(false)}
        onSave={(hour) => {
          // TODO(team): persist once availability fields are agreed with the Flutter app.
          setLocalSameDayCutoff({ listingId: listing.id, hour });
          setIsSameDayCutoffOpen(false);
          toast(t('availabilitySheet.localOnly'));
        }}
      />
      <ListingStayLengthSheet
        open={stayLengthField !== null}
        field={stayLengthField ?? 'minNights'}
        minNights={availability.minNights}
        maxNights={availability.maxNights}
        onClose={() => setStayLengthField(null)}
        onSave={(nights) => {
          if (!stayLengthField) return;
          // TODO(team): persist once availability fields are agreed with the Flutter app.
          setLocalStayLength({ listingId: listing.id, ...stayLength, [stayLengthField]: nights });
          setStayLengthField(null);
          toast(t('availabilitySheet.localOnly'));
        }}
      />
      <ListingGuestCountSheet
        key={`guests-${listing.id}`}
        open={isGuestCountOpen}
        guests={guestCount}
        flowDraft={flowDraft}
        onClose={() => setIsGuestCountOpen(false)}
        onSave={async (guests) => {
          await updateCurrentUserListingGuestCount(listing.id, guests);
          setIsGuestCountOpen(false);
          toast.success(t('guestCountSheet.saved'));
        }}
      />
      <ListingTitleSheet
        key={listing.id}
        open={isTitleSheetOpen}
        title={listingTitle}
        onClose={() => setIsTitleSheetOpen(false)}
        onSave={saveTitle}
      />
      <PropertyTypeSheet
        key={`property-type-${listing.id}`}
        open={isPropertyTypeSheetOpen}
        flowDraft={flowDraft}
        onClose={() => setIsPropertyTypeSheetOpen(false)}
        onSave={savePropertyType}
      />
      {showPhotoTourNotice ? (
        <motion.aside
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          role="status"
          className="fixed bottom-[calc(88px+env(safe-area-inset-bottom))] left-1/2 z-[130] flex w-[min(400px,calc(100vw-32px))] -translate-x-1/2 items-start gap-3 rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4 text-left md:bottom-8 shadow-[0_16px_48px_rgba(0,0,0,0.2)]"
        >
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-success)]" fill="currentColor" aria-hidden="true" />
          <span className="min-w-0 flex-1">
            <span className="block font-semibold">Your photos are sorted</span>
            <span className="mt-1 block text-[0.72665775rem] leading-snug text-[var(--color-text-secondary)]">
              Check each room or space to confirm your photos are in the right place.
            </span>
          </span>
          <button
            type="button"
            onClick={() => setShowPhotoTourNotice(false)}
            aria-label="Dismiss photo tour confirmation"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-[var(--color-surface-muted)]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </motion.aside>
      ) : null}

    </motion.section>
  );
}
