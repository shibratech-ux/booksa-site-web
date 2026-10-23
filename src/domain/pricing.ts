import { z } from 'zod';

// Shared stay pricing. Amounts are integers in the listing currency (CDF); stays are half-open
// [checkIn, checkOut) calendar dates. Fees, taxes and discounts are not modelled yet.
// TODO(team): confirm whether `basePrice` is whole francs or minor units, and the official fee rates.

export const MAX_STAY_NIGHTS = 365;
const calendarDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
});
const listingPriceSchema = z.number().int().min(1).max(9_999_999);

export type StayQuote = { nightlyPrice: number; nights: number; total: number; currency: 'CDF' };

/** Nights between two `YYYY-MM-DD` dates, or null when the range is invalid or too long. */
export function countStayNights(checkIn: string, checkOut: string): number | null {
  if (!calendarDateSchema.safeParse(checkIn).success || !calendarDateSchema.safeParse(checkOut).success) return null;
  const nights = Math.round((Date.parse(`${checkOut}T00:00:00Z`) - Date.parse(`${checkIn}T00:00:00Z`)) / 86_400_000);
  return nights >= 1 && nights <= MAX_STAY_NIGHTS ? nights : null;
}

/** `total = nightly × nights`. Returns null for invalid inputs instead of guessing. */
export function quoteStay(nightlyPrice: number, nights: number): StayQuote | null {
  if (!listingPriceSchema.safeParse(nightlyPrice).success) return null;
  if (!Number.isInteger(nights) || nights < 1 || nights > MAX_STAY_NIGHTS) return null;
  return { nightlyPrice, nights, total: nightlyPrice * nights, currency: 'CDF' };
}

export type RestaurantQuote = {
  perGuestPrice: number;
  adults: number;
  children: number;
  adultSubtotal: number;
  childSubtotal: number;
  total: number;
  currency: 'CDF';
};

/** Preview quote: each adult and child uses the published restaurant listing price. */
export function quoteRestaurantVisit(perGuestPrice: number, adults: number, children: number): RestaurantQuote | null {
  if (!listingPriceSchema.safeParse(perGuestPrice).success) return null;
  if (!Number.isSafeInteger(adults) || adults < 1 || !Number.isSafeInteger(children) || children < 0) return null;
  const adultSubtotal = perGuestPrice * adults;
  const childSubtotal = perGuestPrice * children;
  const total = adultSubtotal + childSubtotal;
  if (!Number.isSafeInteger(adultSubtotal) || !Number.isSafeInteger(childSubtotal) || !Number.isSafeInteger(total)) return null;
  return { perGuestPrice, adults, children, adultSubtotal, childSubtotal, total, currency: 'CDF' };
}
