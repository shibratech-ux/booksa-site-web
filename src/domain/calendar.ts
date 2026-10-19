/**
 * Host calendar date and nightly-price helpers. Pure functions, no Firebase or UI imports.
 *
 * Dates are calendar days identified by `YYYY-MM-DD` keys, independent of the viewer's time zone.
 * "Today" is resolved in the listing's IANA time zone (confirmedLocation.location.timezone).
 */

export type DateKey = string;

export type CalendarMonth = { year: number; month: number };

/** Nights whose price uses the weekend adjustment. TODO(team): confirm Friday + Saturday nights. */
export const WEEKEND_NIGHTS: ReadonlySet<number> = new Set([5, 6]);

const pad = (value: number) => String(value).padStart(2, '0');

export function toDateKey(year: number, month: number, day: number): DateKey {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

/** Day of week (0 = Sunday) for a calendar day, computed in UTC so the viewer's zone never shifts it. */
export function dayOfWeek(year: number, month: number, day: number): number {
  return new Date(Date.UTC(year, month, day)).getUTCDay();
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

/** Today's calendar day in `timeZone`; falls back to the runtime zone when it is missing or invalid. */
export function todayKey(timeZone?: string, now: Date = new Date()): DateKey {
  const format = (zone?: string) =>
    new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  try {
    return format(timeZone || undefined);
  } catch {
    return format(undefined);
  }
}

export function parseDateKey(key: DateKey): { year: number; month: number; day: number } {
  const [year, month, day] = key.split('-').map(Number);
  return { year, month: month - 1, day };
}

export function addMonths({ year, month }: CalendarMonth, offset: number): CalendarMonth {
  const index = year * 12 + month + offset;
  return { year: Math.floor(index / 12), month: ((index % 12) + 12) % 12 };
}

/** `count` consecutive months starting `before` months ahead of `anchor`. */
export function monthRange(anchor: CalendarMonth, before: number, count: number): CalendarMonth[] {
  return Array.from({ length: count }, (_, index) => addMonths(anchor, index - before));
}

/** Sunday-first grid for one month: `null` for leading blanks, then a key per day. */
export function monthGrid({ year, month }: CalendarMonth): Array<DateKey | null> {
  const leading = dayOfWeek(year, month, 1);
  return [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: daysInMonth(year, month) }, (_, index) => toDateKey(year, month, index + 1))
  ];
}

export function isWeekendNight(key: DateKey): boolean {
  const { year, month, day } = parseDateKey(key);
  return WEEKEND_NIGHTS.has(dayOfWeek(year, month, day));
}

export type ListingPricing = {
  /** Whole currency units; undefined when the listing has no valid price yet. */
  basePrice?: number;
  weekendAdjustment: number;
  currency: string;
};

const DEFAULT_CURRENCY = 'CDF';
const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
/** Same bounds as flowSchema in domain/listing.ts. */
const isValidBasePrice = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 9_999_999;
const isValidAdjustment = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= -99 && value <= 99;

/**
 * Reads pricing from an `annonceslisting` document. `flowDraft` is what the wizard edits, so it
 * wins over the top-level `basePrice` and the `generatedSummary` snapshot written at finalization.
 * Invalid values are ignored rather than displayed.
 */
export function resolveListingPricing(listing: unknown): ListingPricing {
  const document = asRecord(listing);
  const flowDraft = asRecord(document.flowDraft);
  const summary = asRecord(document.generatedSummary);
  const basePrice = [flowDraft.basePrice, document.basePrice, summary.basePrice].find(isValidBasePrice);
  const currency = typeof summary.currency === 'string' && /^[A-Z]{3}$/.test(summary.currency) ? summary.currency : DEFAULT_CURRENCY;

  return {
    basePrice,
    weekendAdjustment: isValidAdjustment(flowDraft.weekendAdjustment) ? flowDraft.weekendAdjustment : 0,
    currency
  };
}

/**
 * Nightly price in the listing's currency units (integer). Weekend nights apply
 * `weekendAdjustmentPercent` (−99…99, from flowDraft) and round to the nearest unit,
 * matching ListingPricingStep and ActionRequiredListingEditor.
 */
export function weekendNightlyPrice(basePrice: number, weekendAdjustmentPercent: number): number {
  return Math.round(basePrice * (1 + weekendAdjustmentPercent / 100));
}

export function nightlyPrice(basePrice: number, weekendAdjustmentPercent: number, key: DateKey): number {
  if (!isWeekendNight(key) || !weekendAdjustmentPercent) return basePrice;
  return weekendNightlyPrice(basePrice, weekendAdjustmentPercent);
}

// Stay ranges are half-open [checkIn, checkOut): the checkout day is not a night of the stay.
export type StayRange = { checkIn: DateKey | null; checkOut: DateKey | null };
export type StayRules = { minNights: number; maxNights: number };

export const EMPTY_STAY: StayRange = { checkIn: null, checkOut: null };

export function addDays(key: DateKey, days: number): DateKey {
  const { year, month, day } = parseDateKey(key);
  const date = new Date(Date.UTC(year, month, day + days));
  return toDateKey(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

/** Nights between two calendar days (negative when `checkOut` is before `checkIn`). */
export function nightsBetween(checkIn: DateKey, checkOut: DateKey): number {
  const start = parseDateKey(checkIn);
  const end = parseDateKey(checkOut);
  return Math.round((Date.UTC(end.year, end.month, end.day) - Date.UTC(start.year, start.month, start.day)) / 86_400_000);
}

export function isValidCheckOut(checkIn: DateKey, checkOut: DateKey, { minNights, maxNights }: StayRules): boolean {
  const nights = nightsBetween(checkIn, checkOut);
  return nights >= Math.max(1, minNights) && nights <= maxNights;
}

/**
 * Airbnb-style click handling: the first click (or any click once both dates are set) picks the check-in;
 * the next click on a day that satisfies the min/max nights picks the checkout; a click on or before the
 * check-in, or on a day outside the allowed stay length, restarts from that day.
 */
export function selectStayDate(range: StayRange, key: DateKey, rules: StayRules): StayRange {
  if (!range.checkIn || range.checkOut) return { checkIn: key, checkOut: null };
  if (key > range.checkIn && isValidCheckOut(range.checkIn, key, rules)) return { checkIn: range.checkIn, checkOut: key };
  return { checkIn: key, checkOut: null };
}

/** Days strictly between check-in and checkout (the highlighted band). */
export function isWithinStay({ checkIn, checkOut }: StayRange, key: DateKey): boolean {
  return Boolean(checkIn && checkOut && key > checkIn && key < checkOut);
}

/**
 * Whether a day can be clicked: never before today; while a checkout is being chosen, days after the
 * check-in that would make the stay too short or too long are blocked (earlier days restart the selection).
 */
export function isSelectableStayDay(range: StayRange, key: DateKey, today: DateKey, rules: StayRules): boolean {
  if (key < today) return false;
  if (range.checkIn && !range.checkOut && key > range.checkIn) return isValidCheckOut(range.checkIn, key, rules);
  return true;
}
