export const APP_NAME = 'Tableau de bord Booksa';

export const ROUTES = {
  home: '/',
  experiences: '/experiences',
  services: '/services',
  serviceDetail: '/services/:serviceId',
  seeAll: '/see-all',
  photoTour: '/phototour',
  confirmPay: '/confirm-pay',
  listingDetail: '/listing/:listingId',
  login: '/login',
} as const;

export const STORAGE_KEYS = {
  auth: 'booksa-dashboard-auth',
  app: 'booksa-dashboard-app'
} as const;

export const NAV_ITEMS = [
  { label: 'Logements', path: ROUTES.home },
  { label: 'Expériences', path: ROUTES.experiences },
  { label: 'Services', path: ROUTES.services }
] as const;
