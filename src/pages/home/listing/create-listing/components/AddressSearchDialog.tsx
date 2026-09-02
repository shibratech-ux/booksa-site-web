import { useEffect, useId, useRef, useState, type FormEvent, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiArrowLeft, FiChevronDown, FiMapPin, FiSearch, FiX } from 'react-icons/fi';
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

function AddressDetailsForm({
  location,
  streetInputRef,
  onBack,
  onSubmit
}: {
  location: WorldLocation;
  streetInputRef: RefObject<HTMLInputElement>;
  onBack: () => void;
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
    'h-[66px] w-full bg-transparent px-4 pb-2 pt-6 text-base outline-none placeholder:text-transparent';
  const invalidFieldClassName = 'z-10 ring-2 ring-inset ring-[var(--color-danger)]';
  const errorMessageClassName =
    'pointer-events-none absolute right-3 top-2 max-w-[48%] text-right text-[11.76px] font-medium leading-3 text-[var(--color-danger)]';

  return (
    <motion.div
      key="address-details"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.18 }}
    >
      <button
        type="button"
        onClick={onBack}
        aria-label="Back to address search"
        className="absolute left-5 top-5 inline-flex h-9 w-9 items-center justify-center rounded-md transition hover:bg-[var(--color-surface-muted)]"
      >
        <FiArrowLeft className="h-5 w-5" aria-hidden="true" />
      </button>

      <form noValidate onSubmit={handleSubmit}>
        <div className="relative mt-11">
          <label
            className={`relative block h-[66px] overflow-hidden rounded-md border border-[var(--color-text-secondary)] focus-within:border-[var(--color-text-primary)] ${
              errors.country ? invalidFieldClassName : ''
            }`}
          >
            <span className="pointer-events-none absolute left-4 top-2.5 text-xs text-[var(--color-text-secondary)]">
              Country / region
            </span>
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
              className={`${fieldClassName} appearance-none pr-12`}
            >
              {countries.map(({ country, countryCode }) => (
                <option key={countryCode} value={countryCode}>
                  {country} - {countryCode}
                </option>
              ))}
            </select>
            <FiChevronDown
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

          <div className="mt-4 overflow-hidden rounded-md border border-[var(--color-text-secondary)] focus-within:border-[var(--color-text-primary)]">
            <label
              className={`relative block border-b border-[var(--color-border)] ${
                errors.streetAddress ? invalidFieldClassName : ''
              }`}
            >
              <span className="pointer-events-none absolute left-4 top-2.5 text-xs text-[var(--color-text-secondary)]">
                Street address
              </span>
              <input
                ref={streetInputRef}
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

            <label
              className={`relative block border-b border-[var(--color-border)] ${
                errors.apartment ? invalidFieldClassName : ''
              }`}
            >
              <span className="sr-only">Apartment, floor, or building</span>
              <input
                autoComplete="address-line2"
                value={details.apartment}
                onChange={(event) => updateDetail('apartment', event.target.value)}
                aria-invalid={Boolean(errors.apartment)}
                aria-describedby={errors.apartment ? `${errorIdPrefix}-apartment-error` : undefined}
                placeholder="Apt, floor, bldg (if applicable)"
                className="h-[66px] w-full bg-transparent px-4 text-base outline-none placeholder:text-[var(--color-text-secondary)]"
              />
              {errors.apartment ? (
                <span id={`${errorIdPrefix}-apartment-error`} className={errorMessageClassName} role="alert">
                  {errors.apartment}
                </span>
              ) : null}
            </label>

            <label
              className={`relative block border-b border-[var(--color-border)] ${
                errors.city ? invalidFieldClassName : ''
              }`}
            >
              <span className="pointer-events-none absolute left-4 top-2.5 text-xs text-[var(--color-text-secondary)]">
                City / town / village
              </span>
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

            <label
              className={`relative block border-b border-[var(--color-border)] ${
                errors.region ? invalidFieldClassName : ''
              }`}
            >
              <span className="pointer-events-none absolute left-4 top-2.5 text-xs text-[var(--color-text-secondary)]">
                Province / state / territory (if applicable)
              </span>
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

            <label className={`relative block ${errors.postalCode ? invalidFieldClassName : ''}`}>
              <span className="sr-only">Postal code</span>
              <input
                autoComplete="postal-code"
                value={details.postalCode}
                onChange={(event) => updateDetail('postalCode', event.target.value)}
                aria-invalid={Boolean(errors.postalCode)}
                aria-describedby={errors.postalCode ? `${errorIdPrefix}-postalCode-error` : undefined}
                placeholder="Postal code (if applicable)"
                className="h-[66px] w-full bg-transparent px-4 text-base outline-none placeholder:text-[var(--color-text-secondary)]"
              />
              {errors.postalCode ? (
                <span id={`${errorIdPrefix}-postalCode-error`} className={errorMessageClassName} role="alert">
                  {errors.postalCode}
                </span>
              ) : null}
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="mt-[83.6px] h-12 w-full rounded-md bg-[var(--color-text-primary)] text-base font-semibold text-[var(--color-surface)] transition hover:opacity-90"
        >
          Next
        </button>
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
  const [query, setQuery] = useState(initialQuery);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [selectedLocation, setSelectedLocation] = useState<WorldLocation | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const streetInputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const listboxId = useId();

  useEffect(() => {
    if (!open) return;
    setQuery(initialQuery);
    setActiveIndex(-1);
    setSelectedLocation(null);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [initialQuery, onClose, open]);

  useEffect(() => {
    if (!open) return;
    const animationFrame = window.requestAnimationFrame(() => {
      if (selectedLocation) streetInputRef.current?.focus();
      else inputRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(animationFrame);
  }, [open, selectedLocation]);

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

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[120] flex items-end justify-center bg-black/45 p-0 sm:items-center sm:px-4 sm:py-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onClose}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(event) => event.stopPropagation()}
            className="relative h-[92dvh] max-h-[792px] w-full max-w-[792px] overflow-y-auto rounded-lg bg-[var(--color-surface)] px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-14 text-[var(--color-text-primary)] shadow-[0_24px_80px_rgba(0,0,0,0.25)] sm:h-[730.4px] sm:max-h-[calc(100vh-48px)] sm:rounded-lg sm:px-7 sm:pb-6"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close address dialog"
              className="absolute right-5 top-5 inline-flex h-9 w-9 items-center justify-center rounded-md transition hover:bg-[var(--color-surface-muted)]"
            >
              <FiX className="h-5 w-5" aria-hidden="true" />
            </button>

            <h2 id={titleId} className="text-center text-[30.576px] font-semibold tracking-[-0.035em]">
              {selectedLocation ? 'Confirm your address' : 'Enter your address'}
            </h2>

            <AnimatePresence initial={false}>
              {selectedLocation ? (
                <AddressDetailsForm
                  key={selectedLocation.id}
                  location={selectedLocation}
                  streetInputRef={streetInputRef}
                  onBack={() => {
                    setSelectedLocation(null);
                  }}
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
                >
                  <div className="relative mt-6">
                    <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-2.5 w-2.5 -translate-y-1/2" aria-hidden="true" />
                    <input
                      ref={inputRef}
                      type="text"
                      inputMode="search"
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
                      placeholder="Enter your address"
                      aria-label="Search for an address"
                      aria-controls={listboxId}
                      aria-expanded={filteredSuggestions.length > 0}
                      aria-autocomplete="list"
                      aria-activedescendant={activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
                      className="h-14 w-full rounded-md border-2 border-[var(--color-text-primary)] bg-[var(--color-surface)] pl-12 pr-12 outline-none"
                    />
                    {query ? (
                      <button
                        type="button"
                        onClick={() => {
                          setQuery('');
                          inputRef.current?.focus();
                        }}
                        aria-label="Clear address search"
                        className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md"
                      >
                        <FiX className="h-4 w-4" aria-hidden="true" />
                      </button>
                    ) : null}
                  </div>

                  {normalizedQuery ? (
                    <>
                      <p className="mt-4 text-sm font-medium text-[var(--color-text-secondary)]">
                        Suggested destinations
                      </p>
                      <div id={listboxId} className="mt-3" role="listbox" aria-label="Suggested destinations">
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
                              className={`flex w-full items-center gap-4 rounded-md px-4 py-3 text-left transition hover:bg-[var(--color-surface-muted)] focus:bg-[var(--color-surface-muted)] ${
                                activeIndex === index ? 'bg-[var(--color-surface-muted)]' : ''
                              }`}
                            >
                              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-[var(--color-surface-muted)]">
                                <FiMapPin className="h-6 w-6" aria-hidden="true" />
                              </span>
                              <span className="min-w-0">
                                <span className="block text-base font-medium">{location.city}</span>
                                <span className="block text-sm leading-5 text-[var(--color-text-secondary)]">
                                  {[location.region, location.country].filter(Boolean).join(', ')}
                                </span>
                              </span>
                            </button>
                          ))
                        ) : (
                          <p className="px-4 py-8 text-center text-sm text-[var(--color-text-secondary)]">
                            No suggested addresses found.
                          </p>
                        )}
                      </div>
                    </>
                  ) : null}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
