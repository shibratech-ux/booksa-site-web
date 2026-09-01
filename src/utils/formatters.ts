import i18n from '@/i18n';
import { getLanguageOption, normalizeLanguage, type SupportedLanguage } from '@/i18n/types';

type DateValue = string | number | Date;
type LanguageInput = SupportedLanguage | string;

function localeFor(language?: LanguageInput): string {
  return getLanguageOption(language ?? i18n.resolvedLanguage ?? i18n.language).locale;
}

function toDate(value: DateValue): Date {
  return value instanceof Date ? value : new Date(value);
}

export function formatCurrency(
  value: number,
  currency = 'USD',
  language?: LanguageInput,
  options: Omit<Intl.NumberFormatOptions, 'style' | 'currency'> = {}
): string {
  return new Intl.NumberFormat(localeFor(language), {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
    ...options
  }).format(value);
}

export function formatNumber(
  value: number,
  language?: LanguageInput,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(localeFor(language), options).format(value);
}

export function formatDate(
  value: DateValue,
  language?: LanguageInput,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }
): string {
  return new Intl.DateTimeFormat(localeFor(language), options).format(toDate(value));
}

export function formatDateTime(
  value: DateValue,
  language?: LanguageInput,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' }
): string {
  return new Intl.DateTimeFormat(localeFor(language), options).format(toDate(value));
}

export function formatTime(
  value: DateValue,
  language?: LanguageInput,
  options: Intl.DateTimeFormatOptions = { timeStyle: 'short' }
): string {
  return new Intl.DateTimeFormat(localeFor(language), options).format(toDate(value));
}

export function formatRelativeTime(value: DateValue, language?: LanguageInput): string {
  const deltaSeconds = (toDate(value).getTime() - Date.now()) / 1000;
  const intervals = [
    { unit: 'year', seconds: 31_536_000 },
    { unit: 'month', seconds: 2_592_000 },
    { unit: 'week', seconds: 604_800 },
    { unit: 'day', seconds: 86_400 },
    { unit: 'hour', seconds: 3_600 },
    { unit: 'minute', seconds: 60 },
    { unit: 'second', seconds: 1 }
  ] as const;
  const interval = intervals.find(({ seconds }) => Math.abs(deltaSeconds) >= seconds) ?? intervals.at(-1)!;
  const amount = Math.round(deltaSeconds / interval.seconds);
  return new Intl.RelativeTimeFormat(localeFor(normalizeLanguage(language ?? i18n.language)), {
    numeric: 'auto'
  }).format(amount, interval.unit);
}
