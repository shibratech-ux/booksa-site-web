/**
 * Short amounts for tight layouts: values from 1,000 up get a suffix and at most one decimal.
 * 999 → "999", 1000 → "1k", 1500 → "1.5k", 12_500 → "12.5k", 1_250_000 → "1.3M".
 * Rounds to the nearest tenth and rolls over to the next unit (999_960 → "1M", not "1000k").
 * The decimal separator follows `locale` ("12,5k" in French); suffixes are not translated.
 */
const UNITS = [
  { value: 1_000, suffix: 'k' },
  { value: 1_000_000, suffix: 'M' },
  { value: 1_000_000_000, suffix: 'B' }
] as const;

const roundToTenth = (value: number) => Math.round(value * 10) / 10;

export function formatCompactAmount(value: number, locale = 'en-US'): string {
  if (!Number.isFinite(value)) return '';

  const sign = value < 0 ? '-' : '';
  const absolute = Math.abs(value);
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 1, useGrouping: false });

  if (absolute < UNITS[0].value) return sign + number.format(Math.round(absolute));

  let unitIndex = absolute >= UNITS[2].value ? 2 : absolute >= UNITS[1].value ? 1 : 0;
  let scaled = roundToTenth(absolute / UNITS[unitIndex].value);
  if (scaled >= 1000 && unitIndex < UNITS.length - 1) {
    unitIndex += 1;
    scaled = roundToTenth(absolute / UNITS[unitIndex].value);
  }

  return `${sign}${number.format(scaled)}${UNITS[unitIndex].suffix}`;
}

/** Currency symbol for compact price labels; CDF uses "FC" as elsewhere in the host pages. */
export function currencySymbol(currency: string, locale = 'en-US'): string {
  if (currency === 'CDF') return 'FC';
  try {
    return (
      new Intl.NumberFormat(locale, { style: 'currency', currency, currencyDisplay: 'narrowSymbol' })
        .formatToParts(0)
        .find((part) => part.type === 'currency')?.value ?? currency
    );
  } catch {
    return currency;
  }
}
