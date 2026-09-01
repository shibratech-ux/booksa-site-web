import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import authEn from './locales/en/auth.json';
import commonEn from './locales/en/common.json';
import errorsEn from './locales/en/errors.json';
import navigationEn from './locales/en/navigation.json';
import settingsEn from './locales/en/settings.json';
import dashboardEn from './locales/en/dashboard.json';
import bookingEn from './locales/en/booking.json';
import authFr from './locales/fr/auth.json';
import commonFr from './locales/fr/common.json';
import errorsFr from './locales/fr/errors.json';
import navigationFr from './locales/fr/navigation.json';
import settingsFr from './locales/fr/settings.json';
import dashboardFr from './locales/fr/dashboard.json';
import bookingFr from './locales/fr/booking.json';
import authLn from './locales/ln/auth.json';
import commonLn from './locales/ln/common.json';
import errorsLn from './locales/ln/errors.json';
import navigationLn from './locales/ln/navigation.json';
import settingsLn from './locales/ln/settings.json';
import dashboardLn from './locales/ln/dashboard.json';
import bookingLn from './locales/ln/booking.json';
import authSw from './locales/sw/auth.json';
import commonSw from './locales/sw/common.json';
import errorsSw from './locales/sw/errors.json';
import navigationSw from './locales/sw/navigation.json';
import settingsSw from './locales/sw/settings.json';
import dashboardSw from './locales/sw/dashboard.json';
import bookingSw from './locales/sw/booking.json';
import {
  DEFAULT_LANGUAGE,
  getLanguageOption,
  normalizeLanguage,
  SUPPORTED_LANGUAGE_CODES
} from './types';
import { STORAGE_KEYS } from '@/utils/constants';

export const I18N_NAMESPACES = ['common', 'navigation', 'auth', 'settings', 'dashboard', 'booking', 'errors'] as const;

const resources = {
  fr: { common: commonFr, navigation: navigationFr, auth: authFr, settings: settingsFr, dashboard: dashboardFr, booking: bookingFr, errors: errorsFr },
  en: { common: commonEn, navigation: navigationEn, auth: authEn, settings: settingsEn, dashboard: dashboardEn, booking: bookingEn, errors: errorsEn },
  sw: { common: commonSw, navigation: navigationSw, auth: authSw, settings: settingsSw, dashboard: dashboardSw, booking: bookingSw, errors: errorsSw },
  ln: { common: commonLn, navigation: navigationLn, auth: authLn, settings: settingsLn, dashboard: dashboardLn, booking: bookingLn, errors: errorsLn }
} as const;

function updateDocumentLanguage(language: string): void {
  if (typeof document === 'undefined') return;
  const option = getLanguageOption(language);
  document.documentElement.lang = option.code;
  document.documentElement.dir = option.direction;
}

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: [...SUPPORTED_LANGUAGE_CODES],
    nonExplicitSupportedLngs: true,
    load: 'languageOnly',
    cleanCode: true,
    ns: [...I18N_NAMESPACES],
    defaultNS: 'common',
    fallbackNS: 'common',
    returnNull: false,
    initAsync: false,
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: STORAGE_KEYS.language,
      caches: ['localStorage'],
      convertDetectedLanguage: normalizeLanguage
    },
    react: { useSuspense: false }
  })
  .then(() => updateDocumentLanguage(i18n.resolvedLanguage ?? i18n.language));

i18n.on('languageChanged', updateDocumentLanguage);

export default i18n;
