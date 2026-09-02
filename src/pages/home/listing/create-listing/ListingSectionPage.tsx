import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import BooksaLogo from '@/components/layout/BooksaLogo';
import { Button } from '@/components/ui/Button';
import { ShimmerImage } from '@/components/ui/ShimmerImage';
import { ROUTES, STORAGE_KEYS } from '@/utils/constants';
import { ListingBasicsStep, type ListingBasics } from './components/ListingBasicsStep';
import { AmenitiesStep } from './components/AmenitiesStep';
import { LocationMapStep, type ConfirmedListingLocation } from './components/LocationMapStep';
import { PlaceAccessStep } from './components/PlaceAccessStep';
import { MINIMUM_PHOTOS, PhotoUploadStep } from './components/PhotoUploadStep';
import { PropertyTypeStep } from './components/PropertyTypeStep';
import { ListingTitleStep } from './components/ListingTitleStep';
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
import { getListingSection, listingSections } from './listingSections';
import {
  generateCurrentUserListing,
  updateCurrentUserDraft
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

type ListingFlowDraft = {
  listingCategory?: string;
  listingOption?: string;
  placeAccess?: string;
  listingBasics?: ListingBasics;
  amenityIds?: string[];
  listingTitle?: string;
  highlightIds?: string[];
  listingDescription?: string;
  bookingSetting?: BookingSetting;
  basePrice?: number;
  weekendAdjustment?: number;
  selectedDiscountIds?: DiscountId[];
  hostingType?: HostingType;
  selectedSafetyDetailIds?: SafetyDetailId[];
};

const discountIds = new Set<DiscountId>(DEFAULT_SELECTED_DISCOUNT_IDS);
const safetyDetailIds = new Set<SafetyDetailId>(['exterior-camera', 'noise-monitor', 'weapons']);

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

const isListingFlowDraft = (value: unknown): value is ListingFlowDraft => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<ListingFlowDraft>;
  return Boolean(
    (candidate.listingCategory === undefined || typeof candidate.listingCategory === 'string') &&
    (candidate.listingOption === undefined || typeof candidate.listingOption === 'string') &&
    (candidate.placeAccess === undefined || typeof candidate.placeAccess === 'string') &&
    (candidate.listingBasics === undefined ||
      (candidate.listingBasics && typeof candidate.listingBasics === 'object')) &&
    (candidate.amenityIds === undefined ||
      (Array.isArray(candidate.amenityIds) &&
        candidate.amenityIds.every((amenityId) => typeof amenityId === 'string'))) &&
    (candidate.listingTitle === undefined ||
      (typeof candidate.listingTitle === 'string' && candidate.listingTitle.length <= 50)) &&
    (candidate.highlightIds === undefined ||
      (Array.isArray(candidate.highlightIds) &&
        candidate.highlightIds.length <= 2 &&
        candidate.highlightIds.every((highlightId) => typeof highlightId === 'string'))) &&
    (candidate.listingDescription === undefined ||
      (typeof candidate.listingDescription === 'string' && candidate.listingDescription.length <= 500)) &&
    (candidate.bookingSetting === undefined ||
      candidate.bookingSetting === 'review-first' ||
      candidate.bookingSetting === 'instant-book') &&
    (candidate.basePrice === undefined ||
      (Number.isFinite(candidate.basePrice) && candidate.basePrice >= 1 && candidate.basePrice <= 9999999)) &&
    (candidate.weekendAdjustment === undefined ||
      (Number.isFinite(candidate.weekendAdjustment) &&
        candidate.weekendAdjustment >= -99 &&
        candidate.weekendAdjustment <= 99)) &&
    (candidate.selectedDiscountIds === undefined ||
      (Array.isArray(candidate.selectedDiscountIds) &&
        candidate.selectedDiscountIds.every(
          (discountId) => typeof discountId === 'string' && discountIds.has(discountId as DiscountId)
        ))) &&
    (candidate.hostingType === undefined ||
      candidate.hostingType === 'individual' ||
      candidate.hostingType === 'business') &&
    (candidate.selectedSafetyDetailIds === undefined ||
      (Array.isArray(candidate.selectedSafetyDetailIds) &&
        candidate.selectedSafetyDetailIds.every(
          (detailId) => typeof detailId === 'string' && safetyDetailIds.has(detailId as SafetyDetailId)
        )))
  );
};

export default function ListingSectionPage() {
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const { sectionId } = useParams<{ sectionId: string }>();
  const section = getListingSection(sectionId);
  const routeState = routeLocation.state as ListingSectionRouteState | null;
  const listingId = routeState?.listingId;
  const [initialFlowDraft] = useState<ListingFlowDraft | null>(() => {
    if (isListingFlowDraft(routeState?.flowDraft)) return routeState.flowDraft;
    if (typeof window === 'undefined') return null;

    try {
      const storedFlow = window.sessionStorage.getItem(STORAGE_KEYS.listingDraftFlow);
      if (!storedFlow) return null;
      const parsedFlow: unknown = JSON.parse(storedFlow);
      return isListingFlowDraft(parsedFlow) ? parsedFlow : null;
    } catch {
      return null;
    }
  });
  const [currentPage, setCurrentPage] = useState<ListingPage>(() => routeState?.initialPage ?? 'introduction');
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
    initialFlowDraft?.basePrice === 146
      ? DEFAULT_LISTING_BASE_PRICE
      : initialFlowDraft?.basePrice ?? DEFAULT_LISTING_BASE_PRICE
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

  const getCurrentFlowDraft = (): ListingFlowDraft => ({
    ...(listingCategory ? { listingCategory } : {}),
    ...(listingOption ? { listingOption } : {}),
    ...(placeAccess ? { placeAccess } : {}),
    listingBasics,
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
  });

  useEffect(() => {
    if (!listingId) return;

    const saveTimer = window.setTimeout(() => {
      const flowDraft = getCurrentFlowDraft();
      window.sessionStorage.setItem(STORAGE_KEYS.listingDraftFlow, JSON.stringify(flowDraft));

      void updateCurrentUserDraft(listingId, {
        resumePath: routeLocation.pathname,
        resumePage: currentPage,
        ...(confirmedLocation ? { confirmedLocation } : {}),
        flowDraft
      }).catch((error) => {
        console.error('Unable to autosave the listing draft.', error);
      });
    }, 600);

    return () => window.clearTimeout(saveTimer);
  }, [
    basePrice,
    bookingSetting,
    confirmedLocation,
    currentPage,
    listingBasics,
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

  const handleSaveAndExit = async () => {
    const flowDraft = getCurrentFlowDraft();
    window.sessionStorage.setItem(STORAGE_KEYS.listingDraftFlow, JSON.stringify(flowDraft));

    if (!listingId) {
      navigate(ROUTES.hostListings);
      return;
    }

    setIsSavingDraft(true);
    try {
      await updateCurrentUserDraft(listingId, {
        resumePath: routeLocation.pathname,
        resumePage: currentPage,
        ...(confirmedLocation ? { confirmedLocation } : {}),
        flowDraft
      });
      navigate(ROUTES.hostListings);
    } catch (error) {
      console.error('Unable to save the listing draft.', error);
      toast.error('We could not save your listing. Please try again.');
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
      window.sessionStorage.setItem(STORAGE_KEYS.listingDraftFlow, JSON.stringify(flowDraft));
      await generateCurrentUserListing(
        listingId,
        flowDraft as Record<string, unknown>,
        confirmedLocation as unknown as Record<string, unknown>
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

  return (
    <main className="flex h-[100dvh] min-h-[572px] flex-col overflow-hidden bg-[var(--color-surface)] text-[var(--color-text-primary)] sm:min-h-[704px]">
      <header className="mx-auto flex h-16 w-full max-w-[1584px] shrink-0 items-center justify-between border-b border-[var(--color-border)] px-4 sm:h-24 sm:border-b-0 sm:px-10 lg:px-14">
        <BooksaLogo className="h-8 w-[105.6px] sm:h-9 sm:w-[123.2px]" />
        <div className="flex items-center gap-2 sm:gap-3">
          {!isIntroductionPage || section.step > 1 ? (
            <Button variant="secondary" size="sm" className="hidden rounded-md px-5 sm:inline-flex">
              Questions?
            </Button>
          ) : null}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSaveAndExit}
            loading={isSavingDraft}
            className="rounded-md px-3 sm:px-5"
          >
            {isSafetyDetailsPage ? 'Exit' : 'Save & exit'}
          </Button>
        </div>
      </header>

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
            listingTypeLabel={selectedListingOption.label}
            value={placeAccess}
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
            listingTypeLabel={selectedListingOption.label}
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
            listingTypeLabel={selectedListingOption.label}
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
            selectedDiscountIds={selectedDiscountIds}
            onChange={setSelectedDiscountIds}
          />
        ) : isSafetyDetailsPage && section.step === 3 ? (
          <ListingSafetyDetailsStep
            key="safety-details"
            hostingType={hostingType}
            selectedSafetyDetailIds={selectedSafetyDetailIds}
            onHostingTypeChange={setHostingType}
            onSafetyDetailsChange={setSelectedSafetyDetailIds}
          />
        ) : (
          <motion.section
            key={`${section.id}-introduction`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="mx-auto grid min-h-0 w-full max-w-[1232px] flex-1 content-start items-center gap-5 overflow-y-auto px-5 py-6 sm:gap-10 sm:px-10 sm:py-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(400px,0.92fr)] lg:content-center lg:px-6 lg:py-6"
          >
            <div className="max-w-[616px] lg:pb-4">
              <p className="text-sm font-semibold text-[var(--color-text-secondary)] sm:text-xl">
                Step {section.step}
              </p>
              <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-tight text-[var(--color-text-primary)] sm:mt-4 sm:text-5xl">
                {section.title}
              </h1>
              <p className="mt-3 max-w-[610.5px] text-sm leading-relaxed text-[var(--color-text-secondary)] sm:mt-6 sm:text-xl">
                {section.description}
              </p>
            </div>

            <div className="flex min-h-[198px] items-center justify-center sm:min-h-[352px] lg:min-h-[528px]">
              {section.image ? (
                <ShimmerImage
                  src={section.image}
                  alt={section.imageAlt ?? ''}
                  className="max-h-[32dvh] w-full max-w-[572px] object-contain mix-blend-multiply sm:max-h-none"
                />
              ) : (
                <div
                  className="flex aspect-square w-full max-w-[462px] items-center justify-center rounded-sm bg-[var(--color-surface-muted)] text-8xl font-semibold text-[var(--color-text-secondary)]"
                  aria-hidden="true"
                >
                  {section.step}
                </div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <footer className="z-10 shrink-0 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-0 pb-[max(8px,env(safe-area-inset-bottom))] shadow-[0_-6px_20px_rgba(0,0,0,0.04)] sm:border-t-0 sm:pb-4 sm:shadow-none">
        <div className="grid grid-cols-3 gap-1.5" aria-label={`Step ${section.step} of ${listingSections.length}`}>
          {listingSections.map(({ id, step }) => (
            <span key={id} className="h-1 overflow-hidden bg-[var(--color-border)]" aria-hidden="true">
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
                            ? 'w-[82%]'
                            : isPhotosPage
                              ? 'w-[60%]'
                              : isAmenitiesPage
                                ? 'w-[35%]'
                                : isBasicsPage
                                  ? 'w-[65%]'
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
        <div className="flex h-[66px] items-center justify-between px-4 sm:h-[83.6px] sm:items-end sm:px-10 lg:px-12">
          {!isIntroductionPage || section.step > 1 ? (
            <button
              type="button"
              onClick={() => {
                if (isIntroductionPage && section.step > 1) {
                  const flowDraft =
                    listingCategory && listingOption && placeAccess
                      ? {
                          listingCategory,
                          listingOption,
                          placeAccess,
                          listingBasics,
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
                        }
                      : undefined;
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
              className="min-h-11 px-2 py-3 text-base font-semibold text-[var(--color-text-primary)] underline-offset-4 hover:underline"
            >
              Back
            </button>
          ) : (
            <span />
          )}
          <Button
            size="md"
            loading={isSafetyDetailsPage && isCreatingListing}
            disabled={
              (isPropertyTypePage && !listingOption) ||
              (isPlaceAccessPage && !placeAccess) ||
              (isLocationPage && !confirmedLocation) ||
              (isPhotosPage && photoFiles.length < MINIMUM_PHOTOS) ||
              (isTitlePage && !listingTitle.trim()) ||
              (isDescriptionPage && !listingDescription.trim()) ||
              (isIntroductionPage && section.step === 2 && !selectedCategory)
            }
            onClick={() => {
              if (isSafetyDetailsPage) {
                void handleCreateListing();
                return;
              }
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
                const flowDraft = {
                  listingCategory,
                  listingOption,
                  placeAccess,
                  listingBasics,
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
                };
                window.sessionStorage.setItem(STORAGE_KEYS.listingDraftFlow, JSON.stringify(flowDraft));
                navigate(ROUTES.hostListingSecondSection, {
                  state: { listingId, confirmedLocation: confirmedLocation ?? undefined, flowDraft }
                });
              }
              if (isAmenitiesPage && listingCategory && listingOption && placeAccess) {
                const flowDraft = {
                  listingCategory,
                  listingOption,
                  placeAccess,
                  listingBasics,
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
                };
                window.sessionStorage.setItem(STORAGE_KEYS.listingDraftFlow, JSON.stringify(flowDraft));
                setCurrentPage('photos');
              }
              if (
                isPhotosPage &&
                photoFiles.length >= MINIMUM_PHOTOS &&
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
                const flowDraft = {
                  listingCategory,
                  listingOption,
                  placeAccess,
                  listingBasics,
                  amenityIds: selectedAmenities,
                  listingTitle: listingTitle.trim(),
                  highlightIds: selectedHighlights,
                  listingDescription: listingDescription.trim(),
                  bookingSetting,
                  basePrice,
                  weekendAdjustment,
                  selectedDiscountIds,
                  hostingType,
                  selectedSafetyDetailIds
                };
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
                const flowDraft = {
                  listingCategory,
                  listingOption,
                  placeAccess,
                  listingBasics,
                  amenityIds: selectedAmenities,
                  listingTitle: listingTitle.trim(),
                  highlightIds: selectedHighlights,
                  listingDescription: listingDescription.trim(),
                  bookingSetting,
                  basePrice,
                  weekendAdjustment,
                  selectedDiscountIds,
                  hostingType,
                  selectedSafetyDetailIds
                };
                window.sessionStorage.setItem(STORAGE_KEYS.listingDraftFlow, JSON.stringify(flowDraft));
                setCurrentPage('pricing');
              }
              if (isPricingPage && listingCategory && listingOption && placeAccess) {
                const flowDraft = {
                  listingCategory,
                  listingOption,
                  placeAccess,
                  listingBasics,
                  amenityIds: selectedAmenities,
                  listingTitle: listingTitle.trim(),
                  highlightIds: selectedHighlights,
                  listingDescription: listingDescription.trim(),
                  bookingSetting,
                  basePrice,
                  weekendAdjustment,
                  selectedDiscountIds,
                  hostingType,
                  selectedSafetyDetailIds
                };
                window.sessionStorage.setItem(STORAGE_KEYS.listingDraftFlow, JSON.stringify(flowDraft));
                setCurrentPage('discounts');
              }
              if (isDiscountsPage && listingCategory && listingOption && placeAccess) {
                const flowDraft = {
                  listingCategory,
                  listingOption,
                  placeAccess,
                  listingBasics,
                  amenityIds: selectedAmenities,
                  listingTitle: listingTitle.trim(),
                  highlightIds: selectedHighlights,
                  listingDescription: listingDescription.trim(),
                  bookingSetting,
                  basePrice,
                  weekendAdjustment,
                  selectedDiscountIds,
                  hostingType,
                  selectedSafetyDetailIds
                };
                window.sessionStorage.setItem(STORAGE_KEYS.listingDraftFlow, JSON.stringify(flowDraft));
                setCurrentPage('safety-details');
              }
            }}
            className="min-w-[123.2px] rounded-md bg-[var(--color-text-primary)] px-7 text-[var(--color-surface)]"
          >
            {isSafetyDetailsPage ? 'Create listing' : 'Next'}
          </Button>
        </div>
      </footer>
    </main>
  );
}
