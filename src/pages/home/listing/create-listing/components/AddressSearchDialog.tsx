import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronDown, LoaderCircle, MapPin, Navigation, SearchIcon, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BackButton } from '@/components/ui/BackButton';
import { IconButton } from '@/components/ui/IconButton';
import worldLocationsData from '@/data/worldLocations.json';

export type WorldLocation = {
  id: string;
  city: string;
  region?: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  timezone: string;
  administrativeType?: 'commune';
};

export type AddressDetails = {
  country: string;
  countryCode: string;
  streetAddress: string;
  apartment: string;
  city: string;
  region: string;
  postalCode: string;
};

type AddressFieldErrors = Partial<Record<keyof AddressDetails, string>>;

const worldLocations = worldLocationsData as WorldLocation[];
const countryNameOverrides: Record<string, string> = {
  CD: 'Democratic Republic of the Congo'
};
const countries = Array.from(
  new Map(
    worldLocations.map(({ country, countryCode }) => [
      countryCode,
      { country: countryNameOverrides[countryCode] ?? country, countryCode }
    ])
  ).values()
).sort((a, b) => a.country.localeCompare(b.country));

const validateAddressField = (field: keyof AddressDetails, details: AddressDetails) => {
  const value = details[field].trim();

  switch (field) {
    case 'country':
      return countries.some(({ countryCode }) => countryCode === details.countryCode)
        ? ''
        : 'Select a valid country.';
    case 'streetAddress':
      if (!value) return 'Street address is required.';
      if (value.length < 3 || !/[\p{L}\p{N}]/u.test(value)) return 'Enter a valid street address.';
      if (value.length > 120) return 'Street address is too long.';
      return '';
    case 'apartment':
      return value.length > 100 ? 'Apartment details are too long.' : '';
    case 'city':
      if (!value) return 'City is required.';
      if (value.length < 2 || !/\p{L}/u.test(value)) return 'Enter a valid city.';
      if (value.length > 80) return 'City name is too long.';
      return '';
    case 'region':
      if (!value) return '';
      if (!/\p{L}/u.test(value)) return 'Enter a valid province or state.';
      return value.length > 100 ? 'Province or state is too long.' : '';
    case 'postalCode':
      if (!value) return '';
      if (value.length > 20 || !/^[\p{L}\p{N}][\p{L}\p{N}\s-]*$/u.test(value)) {
        return 'Enter a valid postal code.';
      }
      return '';
    default:
      return '';
  }
};
const normalizeSearchValue = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase()
    .trim();

const getLocationSearchScore = (location: WorldLocation, query: string) => {
  const city = normalizeSearchValue(location.city);
  const region = normalizeSearchValue(location.region ?? '');
  const country = normalizeSearchValue(location.country);
  const countryCode = location.countryCode.toLocaleLowerCase();

  if (city === query) return 0;
  if (city.startsWith(query)) return 1;
  if (region.startsWith(query) || country.startsWith(query) || countryCode === query) return 2;
  if (city.includes(query)) return 3;
  if (region.includes(query) || country.includes(query)) return 4;
  return Number.POSITIVE_INFINITY;
};

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

// Snaps device coordinates to the closest catalog city so the details form starts with a known country and time zone.
const findNearestLocation = (latitude: number, longitude: number) => {
  let nearest: WorldLocation | null = null;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const location of worldLocations) {
    const deltaLatitude = toRadians(location.latitude - latitude);
    const deltaLongitude = toRadians(location.longitude - longitude);
    const haversine =
      Math.sin(deltaLatitude / 2) ** 2 +
      Math.cos(toRadians(latitude)) * Math.cos(toRadians(location.latitude)) * Math.sin(deltaLongitude / 2) ** 2;

    if (haversine < nearestDistance) {
      nearest = location;
      nearestDistance = haversine;
    }
  }

  return nearest;
};

function AddressDetailsForm({
  location,
  submitLabel,
  onSubmit
}: {
  location: WorldLocation;
  submitLabel: string;
  onSubmit: (details: AddressDetails) => void;
}) {
  const selectedCountry = countries.find(({ countryCode }) => countryCode === location.countryCode);
  const [details, setDetails] = useState<AddressDetails>(() => ({
    country: selectedCountry?.country ?? location.country,
    countryCode: location.countryCode,
    streetAddress: location.city,
    apartment: '',
    city: location.city,
    region: location.region ?? location.city,
    postalCode: ''
  }));
  const [errors, setErrors] = useState<AddressFieldErrors>({});
  const errorIdPrefix = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  // Move focus into the step without opening the on-screen keyboard over the prefilled fields.
  useEffect(() => {
    containerRef.current?.focus({ preventScroll: true });
  }, []);

  const setFieldError = (field: keyof AddressDetails, message: string) => {
    setErrors((current) => {
      if (current[field] === message) return current;
      const next = { ...current };
      if (message) next[field] = message;
      else delete next[field];
      return next;
    });
  };

  const updateDetail = (field: keyof AddressDetails, value: string) => {
    const next = { ...details, [field]: value };
    setDetails(next);
    if (errors[field]) setFieldError(field, validateAddressField(field, next));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const fields: (keyof AddressDetails)[] = [
      'country',
      'streetAddress',
      'apartment',
      'city',
      'region',
      'postalCode'
    ];
    const nextErrors = fields.reduce<AddressFieldErrors>((result, field) => {
      const message = validateAddressField(field, details);
      if (message) result[field] = message;
      return result;
    }, {});

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      window.requestAnimationFrame(() => {
        form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      });
      return;
    }

    onSubmit({
      ...details,
      streetAddress: details.streetAddress.trim(),
      apartment: details.apartment.trim(),
      city: details.city.trim(),
      region: details.region.trim(),
      postalCode: details.postalCode.trim()
    });
  };

  const fieldClassName =
    'h-14 w-full bg-transparent px-4 pb-1.5 pt-6 text-base leading-6 outline-none placeholder:text-transparent';
  const plainFieldClassName =
    'h-14 w-full bg-transparent px-4 text-base outline-none placeholder:text-[var(--color-text-secondary)]';
  const floatingLabelClassName =
    'pointer-events-none absolute left-4 top-2 text-xs leading-4 text-[var(--color-text-secondary)]';
  const rowClassName = 'relative block border-b border-[var(--color-border)] last:border-b-0';
  const invalidFieldClassName = 'z-10 ring-2 ring-inset ring-[var(--color-danger)]';
  const errorMessageClassName =
    'pointer-events-none absolute right-3 top-2 max-w-[48%] text-right text-xs font-medium leading-4 text-[var(--color-danger)]';

  return (
    <motion.div
      ref={containerRef}
      tabIndex={-1}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.18 }}
      className="flex min-h-full flex-col outline-none"
    >
      <form noValidate onSubmit={handleSubmit} className="flex flex-1 flex-col">
        <div className="flex-1 px-6 pb-6 pt-2">
          <label
            className={`relative block h-14 overflow-hidden rounded-card border border-[var(--color-text-secondary)] transition-colors focus-within:border-[var(--color-text-primary)] focus-within:ring-1 focus-within:ring-inset focus-within:ring-[var(--color-text-primary)] ${
              errors.country ? invalidFieldClassName : ''
            }`}
          >
            <span className={floatingLabelClassName}>Country / region</span>
            <select
              value={details.countryCode}
              onChange={(event) => {
                const selectedCountry = countries.find(({ countryCode }) => countryCode === event.target.value);
                if (!selectedCountry) return;
                const next = { ...details, ...selectedCountry };
                setDetails(next);
                if (errors.country) setFieldError('country', validateAddressField('country', next));
              }}
              aria-label="Country or region"
              aria-invalid={Boolean(errors.country)}
              aria-describedby={errors.country ? `${errorIdPrefix}-country-error` : undefined}
              className={`${fieldClassName} cursor-pointer appearance-none truncate pr-12`}
            >
              {countries.map(({ country, countryCode }) => (
                <option key={countryCode} value={countryCode}>
                  {country}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2"
              aria-hidden="true"
            />
            {errors.country ? (
              <span
                id={`${errorIdPrefix}-country-error`}
                className={`${errorMessageClassName} right-12`}
                role="alert"
              >
                {errors.country}
              </span>
            ) : null}
          </label>

          <div className="mt-4 overflow-hidden rounded-card border border-[var(--color-text-secondary)]">
            <label className={`${rowClassName} ${errors.streetAddress ? invalidFieldClassName : ''}`}>
              <span className={floatingLabelClassName}>Street address</span>
              <input
                required
                autoComplete="address-line1"
                value={details.streetAddress}
                onChange={(event) => updateDetail('streetAddress', event.target.value)}
                aria-invalid={Boolean(errors.streetAddress)}
                aria-describedby={errors.streetAddress ? `${errorIdPrefix}-streetAddress-error` : undefined}
                className={fieldClassName}
              />
              {errors.streetAddress ? (
                <span id={`${errorIdPrefix}-streetAddress-error`} className={errorMessageClassName} role="alert">
                  {errors.streetAddress}
                </span>
              ) : null}
            </label>

            <label className={`${rowClassName} ${errors.apartment ? invalidFieldClassName : ''}`}>
              <span className="sr-only">Apartment, floor, or building</span>
              <input
                autoComplete="address-line2"
                value={details.apartment}
                onChange={(event) => updateDetail('apartment', event.target.value)}
                aria-invalid={Boolean(errors.apartment)}
                aria-describedby={errors.apartment ? `${errorIdPrefix}-apartment-error` : undefined}
                placeholder="Apt, floor, bldg (if applicable)"
                className={plainFieldClassName}
              />
              {errors.apartment ? (
                <span id={`${errorIdPrefix}-apartment-error`} className={errorMessageClassName} role="alert">
                  {errors.apartment}
                </span>
              ) : null}
            </label>

            <label className={`${rowClassName} ${errors.city ? invalidFieldClassName : ''}`}>
              <span className={floatingLabelClassName}>City / town / village</span>
              <input
                required
                autoComplete="address-level2"
                value={details.city}
                onChange={(event) => updateDetail('city', event.target.value)}
                aria-invalid={Boolean(errors.city)}
                aria-describedby={errors.city ? `${errorIdPrefix}-city-error` : undefined}
                className={fieldClassName}
              />
              {errors.city ? (
                <span id={`${errorIdPrefix}-city-error`} className={errorMessageClassName} role="alert">
                  {errors.city}
                </span>
              ) : null}
            </label>

            <label className={`${rowClassName} ${errors.region ? invalidFieldClassName : ''}`}>
              <span className={floatingLabelClassName}>Province / state / territory (if applicable)</span>
              <input
                autoComplete="address-level1"
                value={details.region}
                onChange={(event) => updateDetail('region', event.target.value)}
                aria-invalid={Boolean(errors.region)}
                aria-describedby={errors.region ? `${errorIdPrefix}-region-error` : undefined}
                className={fieldClassName}
              />
              {errors.region ? (
                <span id={`${errorIdPrefix}-region-error`} className={errorMessageClassName} role="alert">
                  {errors.region}
                </span>
              ) : null}
            </label>

            <label className={`${rowClassName} ${errors.postalCode ? invalidFieldClassName : ''}`}>
              <span className="sr-only">Postal code</span>
              <input
                autoComplete="postal-code"
                value={details.postalCode}
                onChange={(event) => updateDetail('postalCode', event.target.value)}
                aria-invalid={Boolean(errors.postalCode)}
                aria-describedby={errors.postalCode ? `${errorIdPrefix}-postalCode-error` : undefined}
                placeholder="Postal code (if applicable)"
                className={plainFieldClassName}
              />
              {errors.postalCode ? (
                <span id={`${errorIdPrefix}-postalCode-error`} className={errorMessageClassName} role="alert">
                  {errors.postalCode}
                </span>
              ) : null}
            </label>
          </div>
        </div>

        <div className="sticky bottom-0 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-6 pb-[max(16px,env(safe-area-inset-bottom))] pt-4">
          <button
            type="submit"
            className="h-12 w-full rounded-button bg-[var(--color-text-primary)] text-base font-semibold text-[var(--color-surface)] transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-text-primary)] active:scale-[0.99]"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

export function AddressSearchDialog({
  open,
  initialQuery,
  onClose,
  onSelect
}: {
  open: boolean;
  initialQuery: string;
  onClose: () => void;
  onSelect: (location: WorldLocation, details: AddressDetails) => void;
}) {
  const { t } = useTranslation('dashboard');
  const reducedMotion = useReducedMotion();
  const [query, setQuery] = useState(initialQuery);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [selectedLocation, setSelectedLocation] = useState<WorldLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const locationRequestRef = useRef(0);
  const onCloseRef = useRef(onClose);
  const titleId = useId();
  const listboxId = useId();
  const locationErrorId = useId();

  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    setQuery(initialQuery);
    setActiveIndex(-1);
    setSelectedLocation(null);
    setIsLocating(false);
    setLocationError('');
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current();
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      // Ignore a geolocation answer that arrives after the sheet closed.
      locationRequestRef.current += 1;
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [initialQuery, open]);

  // Steps swap with mode="wait", so the search field focuses itself whenever it mounts.
  const searchInputRef = useCallback((node: HTMLInputElement | null) => {
    inputRef.current = node;
    node?.focus({ preventScroll: true });
  }, []);

  const normalizedQuery = normalizeSearchValue(query);
  const filteredSuggestions = normalizedQuery
    ? worldLocations
        .map((location) => ({ location, score: getLocationSearchScore(location, normalizedQuery) }))
        .filter(({ score }) => Number.isFinite(score))
        .sort((a, b) => a.score - b.score || a.location.city.localeCompare(b.location.city))
        .slice(0, 8)
        .map(({ location }) => location)
    : [];

  const selectLocation = (location: WorldLocation) => {
    setSelectedLocation(location);
  };

  const locateCurrentPosition = () => {
    if (isLocating) return;
    if (!('geolocation' in navigator)) {
      setLocationError(t('addressSearch.locationUnsupported'));
      return;
    }

    const requestId = ++locationRequestRef.current;
    setIsLocating(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (requestId !== locationRequestRef.current) return;
        setIsLocating(false);
        const nearest = findNearestLocation(coords.latitude, coords.longitude);
        if (!nearest) {
          setLocationError(t('addressSearch.locationError'));
          return;
        }
        selectLocation({ ...nearest, latitude: coords.latitude, longitude: coords.longitude });
      },
      (error) => {
        if (requestId !== locationRequestRef.current) return;
        setIsLocating(false);
        setLocationError(
          error.code === error.PERMISSION_DENIED ? t('addressSearch.locationDenied') : t('addressSearch.locationError')
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[120] flex items-end justify-center bg-black/45 sm:items-center sm:px-4 sm:py-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.2 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 32 }}
            transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 360, damping: 34, mass: 0.8 }}
            className="relative mt-3 flex h-[calc(100dvh-12px)] w-full flex-col overflow-hidden rounded-t-dialog bg-[var(--color-surface)] text-[var(--color-text-primary)] sm:shadow-[var(--shadow-xl)] sm:mt-0 sm:h-[min(720px,calc(100dvh-48px))] sm:max-w-[568px] sm:rounded-dialog"
          >
            <header className="relative flex min-h-16 shrink-0 items-center justify-center px-16">
              <AnimatePresence initial={false}>
                {selectedLocation ? (
                  <motion.div
                    key="back"
                    className="absolute left-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <BackButton label={t('addressSearch.back')} onClick={() => setSelectedLocation(null)} />
                  </motion.div>
                ) : null}
              </AnimatePresence>
              <h2 id={titleId} className="text-center text-base font-semibold leading-5">
                {selectedLocation ? t('addressSearch.confirmTitle') : t('addressSearch.title')}
              </h2>
              <IconButton
                icon={<X className="h-5 w-5" aria-hidden="true" />}
                label={t('addressSearch.close')}
                variant="plain"
                onClick={onClose}
                className="absolute right-3"
              />
            </header>

            <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <AnimatePresence initial={false} mode="wait">
                {selectedLocation ? (
                  <AddressDetailsForm
                    key={selectedLocation.id}
                    location={selectedLocation}
                    submitLabel={t('addressSearch.next')}
                    onSubmit={(details) => {
                      onSelect(selectedLocation, details);
                      onClose();
                    }}
                  />
                ) : (
                  <motion.div
                    key="address-search"
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.18 }}
                    className="px-6 pb-[max(24px,env(safe-area-inset-bottom))] pt-2"
                  >
                    <div className="relative">
                      <SearchIcon
                        className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2"
                        aria-hidden="true"
                      />
                      <input
                        ref={searchInputRef}
                        type="text"
                        inputMode="search"
                        enterKeyHint="search"
                        autoComplete="off"
                        value={query}
                        onChange={(event) => {
                          setQuery(event.target.value);
                          setActiveIndex(-1);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'ArrowDown' && filteredSuggestions.length > 0) {
                            event.preventDefault();
                            setActiveIndex((current) => Math.min(current + 1, filteredSuggestions.length - 1));
                          }
                          if (event.key === 'ArrowUp' && filteredSuggestions.length > 0) {
                            event.preventDefault();
                            setActiveIndex((current) => (current <= 0 ? filteredSuggestions.length - 1 : current - 1));
                          }
                          if (event.key === 'Enter' && activeIndex >= 0 && filteredSuggestions[activeIndex]) {
                            event.preventDefault();
                            selectLocation(filteredSuggestions[activeIndex]);
                          }
                        }}
                        placeholder={t('addressSearch.placeholder')}
                        aria-label={t('addressSearch.searchLabel')}
                        aria-controls={listboxId}
                        aria-expanded={filteredSuggestions.length > 0}
                        aria-autocomplete="list"
                        aria-activedescendant={activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
                        className="h-14 w-full rounded-search border-[1.5px] border-[var(--color-text-primary)] bg-[var(--color-surface)] pl-14 pr-14 text-base outline-none placeholder:text-[var(--color-text-secondary)] focus-visible:ring-1 focus-visible:ring-[var(--color-text-primary)]"
                      />
                      {query ? (
                        <IconButton
                          icon={<X className="h-4 w-4" aria-hidden="true" />}
                          label={t('addressSearch.clear')}
                          variant="plain"
                          onClick={() => {
                            setQuery('');
                            setActiveIndex(-1);
                            inputRef.current?.focus();
                          }}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2"
                        />
                      ) : null}
                    </div>

                    {normalizedQuery ? (
                      <>
                        <p className="mt-6 text-sm font-medium text-[var(--color-text-secondary)]">
                          {t('addressSearch.suggestions')}
                        </p>
                        <div id={listboxId} className="-mx-3 mt-2" role="listbox" aria-label={t('addressSearch.suggestions')}>
                          {filteredSuggestions.length ? (
                            filteredSuggestions.map((location, index) => (
                              <button
                                id={`${listboxId}-option-${index}`}
                                key={location.id}
                                type="button"
                                role="option"
                                aria-selected={activeIndex === index}
                                onMouseEnter={() => setActiveIndex(index)}
                                onClick={() => selectLocation(location)}
                                className={`flex min-h-[72px] w-full items-center gap-4 rounded-button px-3 py-3 text-left transition hover:bg-[var(--color-surface-muted)] focus:bg-[var(--color-surface-muted)] ${
                                  activeIndex === index ? 'bg-[var(--color-surface-muted)]' : ''
                                }`}
                              >
                                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-button bg-[var(--color-surface-muted)]">
                                  <MapPin className="h-5 w-5" aria-hidden="true" />
                                </span>
                                <span className="min-w-0">
                                  <span className="block truncate text-base">{location.city}</span>
                                  <span className="block truncate text-sm leading-5 text-[var(--color-text-secondary)]">
                                    {[location.region, location.country].filter(Boolean).join(', ')}
                                  </span>
                                </span>
                              </button>
                            ))
                          ) : (
                            <p className="px-3 py-8 text-center text-sm text-[var(--color-text-secondary)]">
                              {t('addressSearch.noResults')}
                            </p>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="mt-5 border-b border-[var(--color-border)] pb-3">
                        <button
                          type="button"
                          onClick={locateCurrentPosition}
                          disabled={isLocating}
                          aria-busy={isLocating}
                          aria-describedby={locationError ? locationErrorId : undefined}
                          className="-mx-3 flex min-h-[72px] w-[calc(100%+24px)] items-center gap-4 rounded-button px-3 py-3 text-left transition hover:bg-[var(--color-surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-text-primary)] disabled:cursor-wait"
                        >
                          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-button bg-[var(--color-surface-muted)]">
                            {isLocating ? (
                              <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
                            ) : (
                              <Navigation className="h-5 w-5" aria-hidden="true" />
                            )}
                          </span>
                          <span className="text-base">
                            {isLocating ? t('addressSearch.locating') : t('addressSearch.useCurrentLocation')}
                          </span>
                        </button>
                        {locationError ? (
                          <p id={locationErrorId} role="alert" className="mt-1 text-sm leading-5 text-[var(--color-danger)]">
                            {locationError}
                          </p>
                        ) : null}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
