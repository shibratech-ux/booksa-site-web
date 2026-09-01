export const APP_NAME = 'Tableau de bord Booksa';

export const ROUTES = {
  home: '/',
  homes: '/homes',
  experiences: '/experiences',
  experienceDetail: '/experiences/:experienceId',
  services: '/services',
  serviceDetail: '/services/:serviceId',
  seeAll: '/see-all',
  photoTour: '/phototour',
  confirmPay: '/confirm-pay',
  listingDetail: '/listing/:listingId',
  messages: '/messages',
  trips: '/trips',
  hostListings: '/host/listings',
  hostListingSetup: '/host/listings/setup',
  hostListingCreate: '/host/listings/create',
  hostListingSections: '/host/listings/create/sections/:sectionId',
  hostListingFirstSection: '/host/listings/create/sections/about-your-place',
  hostListingSecondSection: '/host/listings/create/sections/make-it-stand-out',
  hostListingThirdSection: '/host/listings/create/sections/finish-and-publish',
  hostListingCreateFromExisting: '/host/listings/create-from-existing',
  hostProfile: '/host/profile',
  hostAccountSettings: '/host/account-settings',
  login: '/login',
} as const;

export const STORAGE_KEYS = {
  auth: 'booksa-dashboard-auth',
  app: 'booksa-dashboard-app',
  language: 'booksa-language',
  listingDraftLocation: 'booksa-listing-draft-location',
  listingDraftFlow: 'booksa-listing-draft-flow'
} as const;

export const NAV_ITEMS = [
  { labelKey: 'home', path: ROUTES.home },
  { labelKey: 'experiences', path: ROUTES.experiences },
  { labelKey: 'services', path: ROUTES.services }
] as const;
