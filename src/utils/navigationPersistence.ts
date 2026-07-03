const NAVIGATION_STORAGE_KEYS = {
  seeAllSection: 'booksa-navigation-seeall-section',
  listingDetail: 'booksa-navigation-listing-detail',
  photoTour: 'booksa-navigation-photo-tour',
  confirmPay: 'booksa-navigation-confirm-pay'
} as const;

function hasWindow() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readStoredValue<T>(key: string): T | null {
  if (!hasWindow()) {
    return null;
  }

  const rawValue = window.localStorage.getItem(key);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    return null;
  }
}

function writeStoredValue<T>(key: string, value: T) {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function persistSeeAllSectionTitle(sectionTitle: string) {
  writeStoredValue(NAVIGATION_STORAGE_KEYS.seeAllSection, sectionTitle);
}

export function readPersistedSeeAllSectionTitle() {
  return readStoredValue<string>(NAVIGATION_STORAGE_KEYS.seeAllSection);
}

export function persistListingContext<T>(context: T) {
  writeStoredValue(NAVIGATION_STORAGE_KEYS.listingDetail, context);
}

export function readPersistedListingContext<T>() {
  return readStoredValue<T>(NAVIGATION_STORAGE_KEYS.listingDetail);
}

export function persistPhotoTourContext<T>(context: T) {
  writeStoredValue(NAVIGATION_STORAGE_KEYS.photoTour, context);
}

export function readPersistedPhotoTourContext<T>() {
  return readStoredValue<T>(NAVIGATION_STORAGE_KEYS.photoTour);
}

export function persistConfirmPayContext<T>(context: T) {
  writeStoredValue(NAVIGATION_STORAGE_KEYS.confirmPay, context);
}

export function readPersistedConfirmPayContext<T>() {
  return readStoredValue<T>(NAVIGATION_STORAGE_KEYS.confirmPay);
}
