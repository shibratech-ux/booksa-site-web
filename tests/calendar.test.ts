import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addDays, addMonths, EMPTY_STAY, isSelectableStayDay, isWeekendNight, isWithinStay, monthGrid, monthRange, nightlyPrice, nightsBetween, resolveListingPricing, selectStayDate, todayKey, weekendNightlyPrice } from '../src/domain/calendar';
import { currencySymbol, formatCompactAmount } from '../src/utils/compactAmount';

test('month grid starts on Sunday with leading blanks', () => {
  const october2026 = monthGrid({ year: 2026, month: 9 });
  assert.deepEqual(october2026.slice(0, 5), [null, null, null, null, '2026-10-01']);
  assert.equal(october2026.length, 4 + 31);
  assert.equal(october2026.at(-1), '2026-10-31');
  assert.equal(monthGrid({ year: 2024, month: 1 }).filter(Boolean).length, 29);
  assert.equal(monthGrid({ year: 2026, month: 1 }).filter(Boolean).length, 28);
});

test('weekday mapping does not depend on the runtime time zone', () => {
  assert.equal(isWeekendNight('2026-10-16'), true); // Friday
  assert.equal(isWeekendNight('2026-10-17'), true); // Saturday
  assert.equal(isWeekendNight('2026-10-18'), false); // Sunday
  assert.equal(isWeekendNight('2026-10-15'), false); // Thursday
});

test('today is resolved in the listing time zone', () => {
  const instant = new Date('2026-10-15T23:30:00Z');
  assert.equal(todayKey('Africa/Kinshasa', instant), '2026-10-16');
  assert.equal(todayKey('America/Los_Angeles', instant), '2026-10-15');
  assert.match(todayKey('Not/AZone', instant), /^\d{4}-\d{2}-\d{2}$/);
});

test('month arithmetic rolls over years in both directions', () => {
  assert.deepEqual(addMonths({ year: 2026, month: 11 }, 1), { year: 2027, month: 0 });
  assert.deepEqual(addMonths({ year: 2026, month: 0 }, -1), { year: 2025, month: 11 });
  assert.deepEqual(monthRange({ year: 2026, month: 9 }, 1, 3), [
    { year: 2026, month: 8 },
    { year: 2026, month: 9 },
    { year: 2026, month: 10 }
  ]);
});

test('nightly price applies the weekend adjustment only on weekend nights, rounded to whole units', () => {
  assert.equal(nightlyPrice(12_500, 10, '2026-10-15'), 12_500);
  assert.equal(nightlyPrice(12_500, 10, '2026-10-16'), 13_750);
  assert.equal(nightlyPrice(12_345, 3, '2026-10-17'), 12_715); // 12715.35
  assert.equal(nightlyPrice(12_500, -20, '2026-10-17'), 10_000);
  assert.equal(nightlyPrice(12_500, 0, '2026-10-17'), 12_500);
  assert.ok(Number.isInteger(nightlyPrice(9_999, 7, '2026-10-16')));
  assert.equal(weekendNightlyPrice(12_500, -99), 125);
  assert.equal(weekendNightlyPrice(12_500, 99), 24_875);
  assert.equal(weekendNightlyPrice(12_345, 3), nightlyPrice(12_345, 3, '2026-10-17'));
});

test('listing pricing prefers the wizard draft and ignores invalid values', () => {
  assert.deepEqual(resolveListingPricing({ flowDraft: { basePrice: 15_000, weekendAdjustment: 10 }, basePrice: 12_500, generatedSummary: { basePrice: 11_000, currency: 'CDF' } }), { basePrice: 15_000, weekendAdjustment: 10, currency: 'CDF' });
  assert.equal(resolveListingPricing({ flowDraft: { basePrice: 1.5 }, basePrice: 12_500 }).basePrice, 12_500);
  assert.equal(resolveListingPricing({ flowDraft: {}, generatedSummary: { basePrice: 11_000 } }).basePrice, 11_000);
  assert.equal(resolveListingPricing({ flowDraft: { basePrice: 0 } }).basePrice, undefined);
  assert.equal(resolveListingPricing({ flowDraft: { basePrice: 10_000_000 } }).basePrice, undefined);
  assert.equal(resolveListingPricing({ flowDraft: { basePrice: '12500' } }).basePrice, undefined);
  assert.equal(resolveListingPricing({ flowDraft: { weekendAdjustment: 150 } }).weekendAdjustment, 0);
  assert.equal(resolveListingPricing({ generatedSummary: { currency: 'usd' } }).currency, 'CDF');
  assert.deepEqual(resolveListingPricing(null), { basePrice: undefined, weekendAdjustment: 0, currency: 'CDF' });
});

test('compact amounts shorten values from four digits up', () => {
  assert.equal(formatCompactAmount(999), '999');
  assert.equal(formatCompactAmount(1_000), '1k');
  assert.equal(formatCompactAmount(1_500), '1.5k');
  assert.equal(formatCompactAmount(1_049), '1k');
  assert.equal(formatCompactAmount(9_999), '10k');
  assert.equal(formatCompactAmount(12_500), '12.5k');
  assert.equal(formatCompactAmount(125_000), '125k');
  assert.equal(formatCompactAmount(999_960), '1M');
  assert.equal(formatCompactAmount(1_250_000), '1.3M');
  assert.equal(formatCompactAmount(9_999_999), '10M');
  assert.equal(formatCompactAmount(-1_500), '-1.5k');
  assert.equal(formatCompactAmount(12_500, 'fr-CD'), '12,5k');
  assert.equal(formatCompactAmount(Number.NaN), '');
  assert.equal(currencySymbol('CDF'), 'FC');
  assert.equal(currencySymbol('USD'), '$');
});

test('stay day math crosses months, years and leap days', () => {
  assert.equal(addDays('2026-10-31', 1), '2026-11-01');
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(addDays('2028-02-28', 1), '2028-02-29');
  assert.equal(nightsBetween('2026-10-20', '2026-10-23'), 3);
  assert.equal(nightsBetween('2026-10-30', '2026-11-02'), 3);
  assert.equal(nightsBetween('2026-10-23', '2026-10-20'), -3);
});

test('stay selection picks check-in, then a valid checkout, and restarts otherwise', () => {
  const rules = { minNights: 2, maxNights: 5 };
  const picked = selectStayDate(EMPTY_STAY, '2026-10-20', rules);
  assert.deepEqual(picked, { checkIn: '2026-10-20', checkOut: null });
  assert.deepEqual(selectStayDate(picked, '2026-10-23', rules), { checkIn: '2026-10-20', checkOut: '2026-10-23' });
  // Same day, earlier day, too short or too long: restart from the clicked day.
  assert.deepEqual(selectStayDate(picked, '2026-10-20', rules), { checkIn: '2026-10-20', checkOut: null });
  assert.deepEqual(selectStayDate(picked, '2026-10-18', rules), { checkIn: '2026-10-18', checkOut: null });
  assert.deepEqual(selectStayDate(picked, '2026-10-21', rules), { checkIn: '2026-10-21', checkOut: null });
  assert.deepEqual(selectStayDate(picked, '2026-10-26', rules), { checkIn: '2026-10-26', checkOut: null });
  // A complete stay starts over on the next click.
  assert.deepEqual(selectStayDate({ checkIn: '2026-10-20', checkOut: '2026-10-23' }, '2026-10-28', rules), { checkIn: '2026-10-28', checkOut: null });
  // Minimum below one night still requires one night.
  assert.deepEqual(selectStayDate({ checkIn: '2026-10-20', checkOut: null }, '2026-10-21', { minNights: 0, maxNights: 365 }), { checkIn: '2026-10-20', checkOut: '2026-10-21' });
});

test('stay days are half-open and selectable days respect today and the stay length', () => {
  const stay = { checkIn: '2026-10-20', checkOut: '2026-10-23' };
  assert.equal(isWithinStay(stay, '2026-10-20'), false);
  assert.equal(isWithinStay(stay, '2026-10-21'), true);
  assert.equal(isWithinStay(stay, '2026-10-23'), false);
  assert.equal(isWithinStay({ checkIn: '2026-10-20', checkOut: null }, '2026-10-21'), false);
  const rules = { minNights: 2, maxNights: 5 };
  const choosingCheckout = { checkIn: '2026-10-20', checkOut: null };
  assert.equal(isSelectableStayDay(EMPTY_STAY, '2026-10-16', '2026-10-17', rules), false);
  assert.equal(isSelectableStayDay(EMPTY_STAY, '2026-10-17', '2026-10-17', rules), true);
  assert.equal(isSelectableStayDay(choosingCheckout, '2026-10-21', '2026-10-17', rules), false);
  assert.equal(isSelectableStayDay(choosingCheckout, '2026-10-22', '2026-10-17', rules), true);
  assert.equal(isSelectableStayDay(choosingCheckout, '2026-10-25', '2026-10-17', rules), true);
  assert.equal(isSelectableStayDay(choosingCheckout, '2026-10-26', '2026-10-17', rules), false);
  assert.equal(isSelectableStayDay(choosingCheckout, '2026-10-18', '2026-10-17', rules), true);
});
