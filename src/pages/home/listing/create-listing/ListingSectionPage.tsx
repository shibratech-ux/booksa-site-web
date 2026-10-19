import { normalizeFlowDraft, validateListing, type BathroomTypes, type FlowDraft } from '@/domain/listing';
import { getCurrentUserListing } from '@/services/listing-draft.service';
import { firebaseAuth } from '@/services/firebase';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import BooksaLogo from '@/components/layout/BooksaLogo';
import { ShimmerImage } from '@/components/ui/ShimmerImage';
import { ROUTES, STORAGE_KEYS } from '@/utils/constants';
import { ListingBasicsStep, type ListingBasics } from './components/ListingBasicsStep';
import { AmenitiesStep } from './components/AmenitiesStep';
import { LocationMapStep, type ConfirmedListingLocation } from './components/LocationMapStep';
import { PlaceAccessStep } from './components/PlaceAccessStep';
import { MINIMUM_PHOTOS, PhotoUploadStep } from './components/PhotoUploadStep';
import { PropertyTypeStep } from './components/PropertyTypeStep';
import { ListingTitleStep } from './components/ListingTitleStep';
import { FinishAndPublishIntroduction } from './components/FinishAndPublishIntroduction';
import { ListingHighlightsStep } from './components/ListingHighlightsStep';
import {
  createListingDescription,
  ListingDescriptionStep
} from './components/ListingDescriptionStep';
import {
  BookingSettingsStep,
  type BookingSetting
} from './components/BookingSettingsStep';
import {
  DEFAULT_LISTING_BASE_PRICE,
  ListingPricingStep
} from './components/ListingPricingStep';
import {
  DEFAULT_SELECTED_DISCOUNT_IDS,
  ListingDiscountsStep,
  type DiscountId
} from './components/ListingDiscountsStep';
import {
  ListingSafetyDetailsStep,
  type HostingType,
  type SafetyDetailId
} from './components/ListingSafetyDetailsStep';
import { getListingCategory } from './listingCategories';
import { resolveRemovedListingPage } from './listingResume';
import { getListingSection, listingSections } from './listingSections';
import {
  generateCurrentUserListing,
  queueCurrentUserDraftUpdate
} from '@/services/listing-draft.service';

type ListingSectionRouteState = {
  listingId?: string;
  confirmedLocation?: ConfirmedListingLocation;
  initialPage?: ListingPage;
  flowDraft?: ListingFlowDraft;
  photoFiles?: File[];
};

type ListingPage =
  | 'introduction'
  | 'property-type'
  | 'place-access'
  | 'location'
  | 'basics'
  | 'amenities'
  | 'photos'
  | 'title'
  | 'highlights'
  | 'description'
  | 'booking-settings'
  | 'pricing'
  | 'discounts'
  | 'safety-details';

type ListingFlowDraft = Partial<FlowDraft>;

const isConfirmedListingLocation = (value: unknown): value is ConfirmedListingLocation => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<ConfirmedListingLocation>;
  return Boolean(
    candidate.address &&
      candidate.location &&
      typeof candidate.address.city === 'string' &&
      typeof candidate.location.latitude === 'number' &&
      typeof candidate.location.longitude === 'number'
  );
};

const isListingFlowDraft = (value: unknown): value is ListingFlowDraft => Boolean(value && typeof value === 'object');

export default function ListingSectionPage() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const { state } = useLocation();
  const listingId = (state as ListingSectionRouteState | null)?.listingId;

  return <ListingSectionEditor key={`${listingId ?? 'new'}:${sectionId}`} />;
}

function ListingSectionEditor() {
  const { t } = useTranslation('booking');
  const { t: tSafety } = useTranslation('dashboard');
  const pendingAutosave = useRef<(() => Promise<void>) | null>(null);
  const autosaveTimer = useRef<number | null>(null);
  const advancingRef = useRef(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const { sectionId } = useParams<{ sectionId: string }>();
  const section = getListingSection(sectionId);
  const routeState = routeLocation.state as ListingSectionRouteState | null;
  const listingId = routeState?.listingId;
  const [initialFlowDraft] = useState<ListingFlowDraft | null>(() => {
    if (isListingFlowDraft(routeState?.flowDraft)) return normalizeFlowDraft(routeState.flowDraft) as ListingFlowDraft;
    if (typeof window === 'undefined') return null;

    try {
      const storedFlow = window.sessionStorage.getItem(STORAGE_KEYS.listingDraftFlow);
      if (!storedFlow) return null;
      const parsedFlow: unknown = JSON.parse(storedFlow);
      return isListingFlowDraft(parsedFlow) ? normalizeFlowDraft(parsedFlow) as ListingFlowDraft : null;
    } catch {
      return null;
    }
  });
  const [currentPage, setCurrentPage] = useState<ListingPage>(() => (resolveRemovedListingPage(routeState?.initialPage) ?? 'introduction') as ListingPage);
  const [listingCategory, setListingCategory] = useState<string | null>(
    initialFlowDraft?.listingCategory ?? null
  );
  const [listingOption, setListingOption] = useState<string | null>(initialFlowDraft?.listingOption ?? null);
  const [placeAccess, setPlaceAccess] = useState<string | null>(initialFlowDraft?.placeAccess ?? null);
  const [listingBasics, setListingBasics] = useState<ListingBasics>(initialFlowDraft?.listingBasics ?? {});
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(initialFlowDraft?.amenityIds ?? []);
  const [listingTitle, setListingTitle] = useState(initialFlowDraft?.listingTitle ?? '');
  const [selectedHighlights, setSelectedHighlights] = useState<string[]>(
    initialFlowDraft?.highlightIds ?? []
  );
  const [listingDescription, setListingDescription] = useState(
    initialFlowDraft?.listingDescription ?? ''
  );
  const [bookingSetting, setBookingSetting] = useState<BookingSetting>(
    initialFlowDraft?.bookingSetting ?? 'review-first'
  );
  const [basePrice, setBasePrice] = useState(
    initialFlowDraft?.basePrice ?? DEFAULT_LISTING_BASE_PRICE
  );
  const [weekendAdjustment, setWeekendAdjustment] = useState(
    initialFlowDraft?.weekendAdjustment ?? 0
  );
  const [selectedDiscountIds, setSelectedDiscountIds] = useState<DiscountId[]>(
    initialFlowDraft?.selectedDiscountIds ?? [...DEFAULT_SELECTED_DISCOUNT_IDS]
  );
  const [hostingType, setHostingType] = useState<HostingType>(
    initialFlowDraft?.hostingType ?? 'business'
  );
  const [selectedSafetyDetailIds, setSelectedSafetyDetailIds] = useState<SafetyDetailId[]>(
    initialFlowDraft?.selectedSafetyDetailIds ?? []
  );
  const [bathroomTypes] = useState<BathroomTypes>(initialFlowDraft?.bathroomTypes ?? { privateAttachedBathrooms: 0, dedicatedBathrooms: 0, sharedBathrooms: 0 });
  const [whoElseIds] = useState<string[]>(initialFlowDraft?.whoElseIds ?? []);
  const [everyBedroomHasLock, setEveryBedroomHasLock] = useState<boolean | null>(initialFlowDraft?.everyBedroomHasLock ?? null);
  const [photoCount, setPhotoCount] = useState(0);
  const [pendingPhotos, setPendingPhotos] = useState(false);
  useEffect(() => { if (listingId) void getCurrentUserListing(listingId).then(d => setPhotoCount(Object.keys(d.listingPhotos ?? {}).length)).catch(() => {}); }, [listingId]);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isCreatingListing, setIsCreatingListing] = useState(false);
  const [photoFiles, setPhotoFiles] = useState<File[]>(() =>
    Array.isArray(routeState?.photoFiles) &&
    routeState.photoFiles.every((file) => typeof File !== 'undefined' && file instanceof File)
      ? routeState.photoFiles
      : []
  );
  const [confirmedLocation] = useState<ConfirmedListingLocation | null>(() => {
    if (isConfirmedListingLocation(routeState?.confirmedLocation)) return routeState.confirmedLocation;
    if (typeof window === 'undefined') return null;

    try {
      const storedLocation = window.sessionStorage.getItem(STORAGE_KEYS.listingDraftLocation);
      if (!storedLocation) return null;
      const parsedLocation: unknown = JSON.parse(storedLocation);
      return isConfirmedListingLocation(parsedLocation) ? parsedLocation : null;
    } catch {
      return null;
    }
  });
  const isPropertyTypePage = currentPage === 'property-type';
  const isPlaceAccessPage = currentPage === 'place-access';
  const isLocationPage = currentPage === 'location';
  const isBasicsPage = currentPage === 'basics';
  const isAmenitiesPage = currentPage === 'amenities';
  const isPhotosPage = currentPage === 'photos';
  const isTitlePage = currentPage === 'title';
  const isHighlightsPage = currentPage === 'highlights';
  const isDescriptionPage = currentPage === 'description';
  const isBookingSettingsPage = currentPage === 'booking-settings';
  const isPricingPage = currentPage === 'pricing';
  const isDiscountsPage = currentPage === 'discounts';
  const isSafetyDetailsPage = currentPage === 'safety-details';
  const isIntroductionPage = currentPage === 'introduction';
  const selectedCategory = getListingCategory(listingCategory);
  const selectedListingOption = selectedCategory?.options.find(({ id }) => id === listingOption);

  const getCurrentFlowDraft = (): ListingFlowDraft => normalizeFlowDraft({
    ...(listingCategory ? { listingCategory } : {}),
    ...(listingOption ? { listingOption } : {}),
    ...(placeAccess ? { placeAccess } : {}),
    listingBasics,
    bathroomTypes, whoElseIds, everyBedroomHasLock,
    amenityIds: selectedAmenities,
    listingTitle,
    highlightIds: selectedHighlights,
    listingDescription,
    bookingSetting,
    basePrice,
    weekendAdjustment,
    selectedDiscountIds,
    hostingType,
    selectedSafetyDetailIds
  }) as ListingFlowDraft;

  useEffect(() => {
    if (!listingId || isCreatingListing || isSavingDraft || isAdvancing) {
      pendingAutosave.current = null;
      return;
    }

    const save = () => {
      pendingAutosave.current = null;
      const flowDraft = getCurrentFlowDraft();
      window.sessionStorage.setItem(STORAGE_KEYS.listingDraftFlow, JSON.stringify(flowDraft));

      return queueCurrentUserDraftUpdate(listingId, {
        resumePath: '/host/listing/create',
        resumePage: currentPage === 'introduction' ? (section.step === 1 ? 'setup' : section.step === 2 ? 'make-it-stand-out-introduction' : 'finish-and-publish-introduction') : currentPage,
        ...(confirmedLocation ? { confirmedLocation } : {}),
        flowDraft
      });
    };
    pendingAutosave.current = save;
    autosaveTimer.current = window.setTimeout(() => {
      void save().catch((error) => {
        console.error('Unable to autosave the listing draft.', error);
        toast.error(t('listingProgress.saveError'), { id: 'listing-autosave-error' });
      });
    }, 600);

    return () => { if (autosaveTimer.current !== null) window.clearTimeout(autosaveTimer.current); };
  }, [
    isAdvancing,
    isCreatingListing,
    isSavingDraft,
    t,
    basePrice,
    bookingSetting,
    confirmedLocation,
    currentPage,
    listingBasics,
    bathroomTypes, whoElseIds, everyBedroomHasLock,
    listingCategory,
    listingDescription,
    listingId,
    listingOption,
    listingTitle,
    placeAccess,
    routeLocation.pathname,
    selectedAmenities,
    selectedHighlights,
    weekendAdjustment,
    selectedDiscountIds,
    hostingType,
    selectedSafetyDetailIds
  ]);

  // Flush the latest pending snapshot when navigation unmounts this section.
  // Keep this separate from the debounce cleanup so typing still batches writes.
  useEffect(() => () => {
    void pendingAutosave.current?.().catch((error) => {
      console.error('Unable to save listing progress before navigation.', error);
      toast.error(t('listingProgress.saveError'), { id: 'listing-autosave-error' });
    });
  }, [listingId, t]);

  const handleSaveAndExit = async () => {
    const flowDraft = getCurrentFlowDraft();
    window.sessionStorage.setItem(STORAGE_KEYS.listingDraftFlow, JSON.stringify(flowDraft));

    if (!listingId) {
      navigate(ROUTES.hostListings);
      return;
    }

    setIsSavingDraft(true);
    try {
      await queueCurrentUserDraftUpdate(listingId, {
        resumePath: '/host/listing/create',
        resumePage: currentPage === 'introduction' ? (section.step === 1 ? 'setup' : section.step === 2 ? 'make-it-stand-out-introduction' : 'finish-and-publish-introduction') : currentPage,
        ...(confirmedLocation ? { confirmedLocation } : {}),
        flowDraft
      });
      navigate(ROUTES.hostListings);
    } catch (error) {
      console.error('Unable to save the listing draft.', error);
      toast.error(t('listingProgress.saveError'));
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleCreateListing = async () => {
    if (isCreatingListing) return;
    if (!listingId || !confirmedLocation) {
      toast.error('We could not create your listing. Please review its location and try again.');
      return;
    }

    const flowDraft = getCurrentFlowDraft();
    setIsCreatingListing(true);
    try {
      const snapshot = await getCurrentUserListing(listingId).catch(() => null);
      const validation = validateListing({ ...snapshot, flowDraft, confirmedLocation, pendingPhotos: pendingPhotos ? [true] : [] }, firebaseAuth?.currentUser?.uid ?? '', true);
      if (!validation.valid) {
        toast.error('Please check your listing details, location, bedroom locks and at least 5 uploaded photos before creating your Booksa listing.');
        return;
      }
      window.sessionStorage.setItem(STORAGE_KEYS.listingDraftFlow, JSON.stringify(flowDraft));
      await generateCurrentUserListing(
        listingId,
        flowDraft as Record<string, unknown>,
        confirmedLocation as unknown as Record<string, unknown>,
        pendingPhotos ? [true] : []
      );
      window.sessionStorage.removeItem(STORAGE_KEYS.listingDraftFlow);
      window.sessionStorage.removeItem(STORAGE_KEYS.listingDraftLocation);
      navigate(ROUTES.hostListings, {
        replace: true,
        state: { section: 'listings', createdListingId: listingId }
      });
    } catch (error) {
      console.error('Unable to generate the listing.', error);
      toast.error('We could not create your listing. Please try again.');
    } finally {
      setIsCreatingListing(false);
    }
  };

  const advanceToNextPage = () => {
    if (isIntroductionPage && section.step === 1) setCurrentPage('property-type');
    if (isIntroductionPage && section.step === 2 && selectedCategory) setCurrentPage('amenities');
    if (isIntroductionPage && section.step === 3 && selectedCategory) {
      setCurrentPage('booking-settings');
    }
    if (isPropertyTypePage && listingOption) setCurrentPage('place-access');
    if (isPlaceAccessPage && placeAccess) {
      if (confirmedLocation) setCurrentPage('location');
      else navigate(ROUTES.hostListingCreate, { state: { listingId } });
    }
    if (isLocationPage && confirmedLocation) setCurrentPage('basics');
    if (isBasicsPage && listingCategory && listingOption && placeAccess) {
      if (['private-room', 'private-suite'].includes(placeAccess) && everyBedroomHasLock === null) {
        // Older drafts may have skipped the relocated required question.
        toast.error(t('placeAccessStep.bedroomLock.hint'));
        setCurrentPage('place-access');
        return;
      }
      const flowDraft = getCurrentFlowDraft();
      window.sessionStorage.setItem(STORAGE_KEYS.listingDraftFlow, JSON.stringify(flowDraft));
      navigate(ROUTES.hostListingSecondSection, {
        state: { listingId, confirmedLocation: confirmedLocation ?? undefined, flowDraft }
      });
    }
    if (isAmenitiesPage && listingCategory && listingOption && placeAccess) {
      const flowDraft = getCurrentFlowDraft();
      window.sessionStorage.setItem(STORAGE_KEYS.listingDraftFlow, JSON.stringify(flowDraft));
      setCurrentPage('photos');
    }
    if (
      isPhotosPage &&
      photoCount >= MINIMUM_PHOTOS &&
      listingCategory &&
      listingOption &&
      placeAccess
    ) {
      setCurrentPage('title');
    }
    if (
      isTitlePage &&
      listingTitle.trim() &&
      listingCategory &&
      listingOption &&
      placeAccess
    ) {
      setCurrentPage('highlights');
    }
    if (
      isHighlightsPage &&
      selectedCategory &&
      selectedListingOption &&
      placeAccess
    ) {
      if (!listingDescription.trim()) {
        setListingDescription(
          createListingDescription({
            category: selectedCategory,
            listingTypeLabel: selectedListingOption.label,
            accessType: placeAccess,
            highlightIds: selectedHighlights
          })
        );
      }
      setCurrentPage('description');
    }
    if (
      isDescriptionPage &&
      listingDescription.trim() &&
      listingCategory &&
      listingOption &&
      placeAccess
    ) {
      const flowDraft = getCurrentFlowDraft();
      window.sessionStorage.setItem(STORAGE_KEYS.listingDraftFlow, JSON.stringify(flowDraft));
      navigate(ROUTES.hostListingThirdSection, {
        state: { listingId, confirmedLocation: confirmedLocation ?? undefined, flowDraft, photoFiles }
      });
    }
    if (
      isBookingSettingsPage &&
      listingCategory &&
      listingOption &&
      placeAccess
    ) {
      const flowDraft = getCurrentFlowDraft();
      window.sessionStorage.setItem(STORAGE_KEYS.listingDraftFlow, JSON.stringify(flowDraft));
      setCurrentPage('pricing');
    }
    if (isPricingPage && listingCategory && listingOption && placeAccess) {
      const flowDraft = getCurrentFlowDraft();
      window.sessionStorage.setItem(STORAGE_KEYS.listingDraftFlow, JSON.stringify(flowDraft));
      setCurrentPage('discounts');
    }
    if (isDiscountsPage && listingCategory && listingOption && placeAccess) {
      const flowDraft = getCurrentFlowDraft();
      window.sessionStorage.setItem(STORAGE_KEYS.listingDraftFlow, JSON.stringify(flowDraft));
      setCurrentPage('safety-details');
    }
  };

  const handleNext = async () => {
    if (advancingRef.current || isSavingDraft || isCreatingListing || pendingPhotos) return;
    if (isSafetyDetailsPage) {
      await handleCreateListing();
      return;
    }
    advancingRef.current = true;
    setIsAdvancing(true);
    if (autosaveTimer.current !== null) window.clearTimeout(autosaveTimer.current);
    pendingAutosave.current = null;
    try {
      if (!listingId) throw new Error('Missing listing draft.');
      const flowDraft = getCurrentFlowDraft();
      await queueCurrentUserDraftUpdate(listingId, {
        resumePath: '/host/listing/create',
        resumePage: currentPage === 'introduction' ? (section.step === 1 ? 'setup' : section.step === 2 ? 'make-it-stand-out-introduction' : 'finish-and-publish-introduction') : currentPage,
        ...(confirmedLocation ? { confirmedLocation } : {}),
        flowDraft
      });
      toast.dismiss('listing-autosave-error');
      advanceToNextPage();
    } catch (error) {
      console.error('Unable to save listing progress before continuing.', error);
      toast.error(t('listingProgress.saveError'), { id: 'listing-autosave-error' });
    } finally {
      advancingRef.current = false;
      setIsAdvancing(false);
    }
  };

  const isCompactHeader = isTitlePage || isHighlightsPage || isDescriptionPage || isBookingSettingsPage || isPricingPage || isDiscountsPage || isSafetyDetailsPage;
  const isFinishIntroduction = isIntroductionPage && section.step === 3;
  const isLogoHidden = (isIntroductionPage && section.step <= 2) || isPropertyTypePage || isPlaceAccessPage || isLocationPage || isBasicsPage || isAmenitiesPage || isPhotosPage || isTitlePage || isHighlightsPage || isDescriptionPage || isBookingSettingsPage || isPricingPage || isDiscountsPage || isSafetyDetailsPage;

  return (
    <main className="flex h-dvh min-h-0 flex-col overflow-hidden bg-[var(--color-surface)] text-[var(--color-text-primary)] [&_button:focus-visible]:outline [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-4 [&_button:focus-visible]:outline-[var(--color-text-primary)]">
      <header
        className={`mx-auto flex h-20 w-full max-w-[1440px] shrink-0 items-center gap-4 px-6 sm:h-24 sm:px-10 lg:px-12 xl:px-20 ${
          isLogoHidden ? 'justify-start sm:justify-end' : 'justify-between'
        }`}
      >
        {isLogoHidden ? null : <BooksaLogo className={`h-8 w-[110px] ${isFinishIntroduction ? 'max-sm:hidden' : ''}`} />}
        <div className={`flex items-center gap-2 sm:gap-3 ${isCompactHeader || isFinishIntroduction ? 'w-full justify-between sm:w-auto' : ''}`}>
          {!isIntroductionPage || section.step > 1 ? (
            <button
              type="button"
              className={`${isCompactHeader || isFinishIntroduction ? 'order-2 inline-flex sm:order-none' : 'hidden sm:inline-flex'} h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-[var(--color-border)] px-4 text-sm font-semibold transition-colors hover:bg-[var(--color-surface-muted)]`}
            >
              {isCompactHeader || isFinishIntroduction ? t('listingTitleStep.questions') : 'Questions?'}
            </button>
          ) : null}
          <button
            type="button"
            onClick={handleSaveAndExit}
            disabled={isSavingDraft || isAdvancing || isCreatingListing}
            aria-busy={isSavingDraft || undefined}
            className="inline-flex h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-[var(--color-border)] px-5 text-sm font-semibold transition-colors hover:bg-[var(--color-surface-muted)] disabled:cursor-wait disabled:opacity-50"
          >
            {isSafetyDetailsPage ? isSavingDraft ? t('listingTitleStep.saving') : tSafety('listingSafetyStep.exit') : isCompactHeader || isFinishIntroduction ? t(isSavingDraft ? 'listingTitleStep.saving' : 'listingTitleStep.saveAndExit') : isSavingDraft ? 'Saving…' : 'Save & exit'}
          </button>
        </div>
      </header>

      <fieldset disabled={isAdvancing} className="m-0 flex min-h-0 min-w-0 flex-1 flex-col border-0 p-0">
      <AnimatePresence mode="wait" initial={false}>
        {isPropertyTypePage ? (
          <PropertyTypeStep
            key="property-type"
            categoryValue={listingCategory}
            optionValue={listingOption}
            onCategoryChange={(category) => {
              if (category !== listingCategory) {
                setListingOption(null);
                setPlaceAccess(null);
                setListingBasics({});
                setSelectedAmenities([]);
                setPhotoFiles([]);
                setListingTitle('');
                setSelectedHighlights([]);
                setListingDescription('');
                setBookingSetting('review-first');
                setBasePrice(DEFAULT_LISTING_BASE_PRICE);
                setWeekendAdjustment(0);
                setSelectedDiscountIds([...DEFAULT_SELECTED_DISCOUNT_IDS]);
                setHostingType('business');
                setSelectedSafetyDetailIds([]);
              }
              setListingCategory(category);
            }}
            onOptionChange={(option) => {
              if (option !== listingOption) {
                setPlaceAccess(null);
                setListingBasics({});
                setSelectedAmenities([]);
                setPhotoFiles([]);
                setListingTitle('');
                setSelectedHighlights([]);
                setListingDescription('');
                setBookingSetting('review-first');
                setBasePrice(DEFAULT_LISTING_BASE_PRICE);
                setWeekendAdjustment(0);
                setSelectedDiscountIds([...DEFAULT_SELECTED_DISCOUNT_IDS]);
                setHostingType('business');
                setSelectedSafetyDetailIds([]);
              }
              setListingOption(option);
            }}
          />
        ) : isPlaceAccessPage && selectedCategory && selectedListingOption ? (
          <PlaceAccessStep
            key="place-access"
            category={selectedCategory}
            listingOption={selectedListingOption}
            value={placeAccess}
            everyBedroomHasLock={everyBedroomHasLock}
            onBedroomLockChange={setEveryBedroomHasLock}
            onChange={(accessType) => {
              if (accessType !== placeAccess) {
                setListingBasics({});
                setSelectedAmenities([]);
                setPhotoFiles([]);
                setListingTitle('');
                setSelectedHighlights([]);
                setListingDescription('');
                setBookingSetting('review-first');
                setBasePrice(DEFAULT_LISTING_BASE_PRICE);
                setWeekendAdjustment(0);
                setSelectedDiscountIds([...DEFAULT_SELECTED_DISCOUNT_IDS]);
                setHostingType('business');
                setSelectedSafetyDetailIds([]);
              }
              setPlaceAccess(accessType);
            }}
          />
        ) : isLocationPage && confirmedLocation ? (
          <LocationMapStep key="location" confirmedLocation={confirmedLocation} />
        ) : isBasicsPage && selectedCategory && selectedListingOption && placeAccess ? (
          <ListingBasicsStep
            key="basics"
            category={selectedCategory}
            listingOption={selectedListingOption}
            accessType={placeAccess}
            values={listingBasics}
            onChange={(counterId, value) =>
              setListingBasics((current) => ({ ...current, [counterId]: value }))
            }
          />
        ) : isAmenitiesPage && section.step === 2 && selectedCategory ? (
          <AmenitiesStep
            key={`amenities-${selectedCategory.id}`}
            category={selectedCategory}
            selectedAmenities={selectedAmenities}
            onToggle={(amenityId) =>
              setSelectedAmenities((current) =>
                current.includes(amenityId)
                  ? current.filter((currentId) => currentId !== amenityId)
                  : [...current, amenityId]
              )
            }
          />
        ) : isPhotosPage && section.step === 2 && selectedListingOption ? (
          <PhotoUploadStep
            key="photos"
            listingTypeLabel={selectedListingOption.label}
            listingId={listingId}
            files={photoFiles}
            onChange={setPhotoFiles}
              onPhotoCount={setPhotoCount}
              onPendingChange={setPendingPhotos}
          />
        ) : isTitlePage && section.step === 2 && selectedListingOption ? (
          <ListingTitleStep
            key="title"
            listingTypeLabel={selectedListingOption.label}
            value={listingTitle}
            onChange={setListingTitle}
          />
        ) : isHighlightsPage && section.step === 2 && selectedCategory && selectedListingOption ? (
          <ListingHighlightsStep
            key="highlights"
            category={selectedCategory}
            listingTypeLabel={selectedListingOption.label}
            accessType={placeAccess}
            selectedHighlights={selectedHighlights}
            onChange={setSelectedHighlights}
          />
        ) : isDescriptionPage && section.step === 2 && selectedCategory ? (
          <ListingDescriptionStep
            key="description"
            category={selectedCategory}
            value={listingDescription}
            onChange={setListingDescription}
          />
        ) : isBookingSettingsPage && section.step === 3 && selectedCategory && selectedListingOption ? (
          <BookingSettingsStep
            key="booking-settings"
            category={selectedCategory}
            value={bookingSetting}
            onChange={setBookingSetting}
          />
        ) : isPricingPage && section.step === 3 && selectedCategory ? (
          <ListingPricingStep
            key="pricing"
            category={selectedCategory}
            basePrice={basePrice}
            weekendAdjustment={weekendAdjustment}
            onBasePriceChange={setBasePrice}
            onWeekendAdjustmentChange={setWeekendAdjustment}
          />
        ) : isDiscountsPage && section.step === 3 ? (
          <ListingDiscountsStep
            key="discounts"
            categoryId={selectedCategory?.id}
            selectedDiscountIds={selectedDiscountIds}
            onChange={setSelectedDiscountIds}
          />
        ) : isSafetyDetailsPage && section.step === 3 ? (
          <ListingSafetyDetailsStep
            key="safety-details"
            categoryId={selectedCategory?.id}
            hostingType={hostingType}
            selectedSafetyDetailIds={selectedSafetyDetailIds}
            onHostingTypeChange={setHostingType}
            onSafetyDetailsChange={setSelectedSafetyDetailIds}
          />
        ) : isFinishIntroduction ? (
          <FinishAndPublishIntroduction key="finish-and-publish-introduction" />
        ) : (
          <motion.section
            key={`${section.id}-introduction`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="mx-auto grid min-h-0 w-full max-w-[1280px] flex-1 content-start items-center gap-6 overflow-y-auto overscroll-contain px-6 pb-8 pt-2 sm:gap-12 sm:px-10 sm:py-12 lg:grid-cols-2 lg:content-center lg:gap-16 lg:px-12 lg:py-8"
          >
            <div className="max-w-xl">
              <p className="text-base font-semibold text-[var(--color-text-primary)] sm:text-lg">
                Step {section.step}
              </p>
              <h1 className="mt-2 text-[32px] font-semibold leading-[1.15] tracking-[-0.03em] text-[var(--color-text-primary)] sm:mt-4 sm:text-[40px] lg:text-5xl">
                {section.title}
              </h1>
              <p className="mt-3 max-w-lg text-base leading-6 text-[var(--color-text-primary)] sm:mt-5 sm:text-[1.06875rem] sm:leading-8 lg:text-[var(--color-text-secondary)]">
                {section.description}
              </p>
            </div>

            <div className="flex min-w-0 items-center justify-center max-lg:order-first">
              {section.image ? (
                <ShimmerImage
                  src={section.image}
                  alt={section.imageAlt ?? ''}
                  fetchPriority="high"
                  className="aspect-[4/3] max-h-[42dvh] w-full max-w-[520px] object-contain mix-blend-multiply sm:aspect-auto sm:max-h-[48dvh] lg:max-h-[60dvh]"
                />
              ) : (
                <div
                  className="flex aspect-square w-full max-w-[462px] items-center justify-center rounded-photo bg-[var(--color-surface-muted)] text-8xl font-semibold text-[var(--color-text-secondary)]"
                  aria-hidden="true"
                >
                  {section.step}
                </div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>
      </fieldset>

      <footer className="z-10 shrink-0 bg-[var(--color-surface)] pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-3 gap-1.5" role="group" aria-label={isFinishIntroduction ? t('finishPublishIntro.step', { current: section.step, total: listingSections.length }) : `Step ${section.step} of ${listingSections.length}`}>
          {listingSections.map(({ id, step }) => (
            <span key={id} className="h-1.5 overflow-hidden bg-[var(--color-border)]" aria-hidden="true">
              {step <= section.step ? (
                <span
                  className={`block h-full bg-[var(--color-text-primary)] transition-[width] duration-300 ${
                    step < section.step
                      ? 'w-full'
                      : isSafetyDetailsPage
                        ? 'w-[92%]'
                      : isDiscountsPage
                        ? 'w-[62%]'
                      : isPricingPage
                        ? 'w-[42%]'
                        : isBookingSettingsPage
                          ? 'w-1/5'
                        : isDescriptionPage
                        ? 'w-full'
                        : isHighlightsPage
                          ? 'w-[94%]'
                          : isTitlePage
                            ? 'w-[60%]'
                            : isPhotosPage
                              ? 'w-[60%]'
                              : isAmenitiesPage
                                ? 'w-[35%]'
                                : isBasicsPage
                                  ? 'w-full'
                                  : isLocationPage
                                    ? 'w-1/2'
                                    : isPlaceAccessPage
                                      ? 'w-[35%]'
                                      : isPropertyTypePage
                                        ? 'w-1/5'
                                        : section.step === 1
                                          ? 'w-[8%]'
                                          : 'w-0'
                  }`}
                />
              ) : null}
            </span>
          ))}
        </div>
        <div className="mx-auto flex min-h-20 w-full max-w-[1440px] items-center justify-between gap-6 px-6 py-4 sm:min-h-24 sm:py-5 sm:px-10 lg:px-12 xl:px-20">
          {!isIntroductionPage || section.step > 1 ? (
            <button
              type="button"
              disabled={isAdvancing || isSavingDraft || isCreatingListing}
              onClick={() => {
                if (isIntroductionPage && section.step > 1) {
                  const flowDraft = getCurrentFlowDraft();
                  navigate(
                    section.step === 3 ? ROUTES.hostListingSecondSection : ROUTES.hostListingFirstSection,
                    {
                      state: {
                        listingId,
                        confirmedLocation: confirmedLocation ?? undefined,
                        initialPage: section.step === 3 ? 'description' : 'basics',
                        flowDraft,
                        photoFiles
                      }
                    }
                  );
                } else if (isSafetyDetailsPage) {
                  setCurrentPage('discounts');
                } else if (isDiscountsPage) {
                  setCurrentPage('pricing');
                } else if (isPricingPage) {
                  setCurrentPage('booking-settings');
                } else if (isBookingSettingsPage) {
                  setCurrentPage('introduction');
                } else if (isDescriptionPage) {
                  setCurrentPage('highlights');
                } else if (isHighlightsPage) {
                  setCurrentPage('title');
                } else if (isTitlePage) {
                  setCurrentPage('photos');
                } else if (isPhotosPage) {
                  setCurrentPage('amenities');
                } else if (isAmenitiesPage) {
                  setCurrentPage('introduction');
                } else if (isBasicsPage) setCurrentPage('location');
                else if (isLocationPage) setCurrentPage('place-access');
                else if (isPlaceAccessPage) setCurrentPage('property-type');
                else setCurrentPage('introduction');
              }}
              className="-ml-3 inline-flex min-h-12 items-center justify-center rounded-button px-3 py-3 text-base font-semibold text-[var(--color-text-primary)] underline underline-offset-4 transition-colors hover:bg-[var(--color-surface-muted)]"
            >
              {isCompactHeader || isFinishIntroduction ? t('listingTitleStep.back') : 'Back'}
            </button>
          ) : (
            <span className="hidden sm:block" />
          )}
          <button
            type="button"
            aria-busy={isAdvancing || (isSafetyDetailsPage && isCreatingListing) || undefined}
            disabled={
              isAdvancing || isSavingDraft || isCreatingListing || pendingPhotos ||
              (isPlaceAccessPage && ['private-room', 'private-suite'].includes(placeAccess ?? '') && everyBedroomHasLock === null) ||
              (isPropertyTypePage && !listingOption) ||
              (isPlaceAccessPage && !placeAccess) ||
              (isLocationPage && !confirmedLocation) ||
              (isPhotosPage && photoCount < MINIMUM_PHOTOS) ||
              (isTitlePage && !listingTitle.trim()) ||
              (isDescriptionPage && !listingDescription.trim()) ||
              (isIntroductionPage && section.step === 2 && !selectedCategory)
            }
            onClick={() => void handleNext()}
            className={`inline-flex h-12 min-w-28 shrink-0 items-center justify-center rounded-button bg-[var(--color-text-primary)] px-8 ${
              isIntroductionPage && section.step === 1 ? 'max-sm:w-full' : ''
            } text-base font-semibold text-[var(--color-surface)] transition hover:brightness-90 enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[var(--color-border)] disabled:text-[var(--color-text-secondary)] motion-reduce:transform-none motion-reduce:transition-none`}
          >
            {isAdvancing ? t('listingProgress.saving') : isCreatingListing ? tSafety('listingSafetyStep.creating') : isSafetyDetailsPage ? tSafety('listingSafetyStep.create') : isCompactHeader || isFinishIntroduction ? t('listingTitleStep.next') : 'Next'}
          </button>
        </div>
      </footer>
    </main>
  );
}
