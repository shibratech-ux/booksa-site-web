import {
  DEFAULT_LANGUAGE,
  isSupportedLanguage,
  normalizeLanguage,
  type LocalizedText,
  type SupportedLanguage
} from '@/i18n/types';

export function getLocalizedText(
  value: LocalizedText | undefined,
  language: SupportedLanguage | string,
  fallbackLanguage: SupportedLanguage = DEFAULT_LANGUAGE
): string {
  if (!value) return '';

  const requestedLanguage = normalizeLanguage(language);
  const requestedValue = value[requestedLanguage]?.trim();
  const fallbackValue = value[fallbackLanguage]?.trim();

  if (requestedValue) return requestedValue;
  if (fallbackValue) return fallbackValue;

  return Object.entries(value).find(
    (entry): entry is [SupportedLanguage, string] =>
      isSupportedLanguage(entry[0]) && typeof entry[1] === 'string' && Boolean(entry[1].trim())
  )?.[1] ?? '';
}
