import 'i18next';
import type common from './locales/fr/common.json';
import type auth from './locales/fr/auth.json';
import type errors from './locales/fr/errors.json';
import type navigation from './locales/fr/navigation.json';
import type settings from './locales/fr/settings.json';
import type dashboard from './locales/fr/dashboard.json';
import type booking from './locales/fr/booking.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof common;
      navigation: typeof navigation;
      auth: typeof auth;
      settings: typeof settings;
      dashboard: typeof dashboard;
      booking: typeof booking;
      errors: typeof errors;
    };
  }
}
