export const DEFAULT_LANGUAGE = 'fr' as const;

export const SUPPORTED_LANGUAGES = [
  { code: 'fr', label: 'Français', locale: 'fr-CD', direction: 'ltr' },
  { code: 'en', label: 'English', locale: 'en-US', direction: 'ltr' },
  { code: 'sw', label: 'Kiswahili', locale: 'sw-CD', direction: 'ltr' },
  { code: 'ln', label: 'Lingala', locale: 'ln-CD', direction: 'ltr' }
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]['code'];
export type LanguageOption = (typeof SUPPORTED_LANGUAGES)[number];
export type LocalizedText = Partial<Record<SupportedLanguage, string>>;

export const SUPPORTED_LANGUAGE_CODES = SUPPORTED_LANGUAGES.map(({ code }) => code);

export function isSupportedLanguage(value: unknown): value is SupportedLanguage {
  return typeof value === 'string' && SUPPORTED_LANGUAGE_CODES.includes(value as SupportedLanguage);
}

export function normalizeLanguage(value: unknown): SupportedLanguage {
  if (typeof value !== 'string') return DEFAULT_LANGUAGE;
  const baseLanguage = value.trim().toLowerCase().split(/[-_]/)[0];
  return isSupportedLanguage(baseLanguage) ? baseLanguage : DEFAULT_LANGUAGE;
}

export function getLanguageOption(value: unknown): LanguageOption {
  const language = normalizeLanguage(value);
  return SUPPORTED_LANGUAGES.find(({ code }) => code === language) ?? SUPPORTED_LANGUAGES[0];
}
