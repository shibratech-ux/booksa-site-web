export const restaurantPreviewPaymentMethods = [
  'card', 'mpesa', 'airtelMoney', 'orangeMoney', 'paypal', 'googlePay', 'applePay', 'cash'
] as const;

export type RestaurantPreviewPaymentMethod = typeof restaurantPreviewPaymentMethods[number];

// Visual examples only. Replace with restaurant availability once its contract is defined.
export const restaurantPreviewSlots = [
  { start: '12:00', service: 'lunch', soldOut: false },
  { start: '12:30', service: 'lunch', soldOut: true },
  { start: '19:00', service: 'dinner', soldOut: false },
  { start: '19:30', service: 'dinner', soldOut: false }
] as const;

export type RestaurantBookingSelection = {
  date: string;
  time: string;
  adults: number;
  children: number;
  paymentMethod: RestaurantPreviewPaymentMethod;
};

/** URL context for the simulated restaurant booking page; this is never a booking record. */
export function buildRestaurantBookingSearch(selection: RestaurantBookingSelection): string {
  return new URLSearchParams({
    date: selection.date,
    time: selection.time,
    adults: String(selection.adults),
    children: String(selection.children),
    payment: selection.paymentMethod
  }).toString();
}

/** Reject malformed or altered selections before showing a reservation preview. */
export function parseRestaurantBookingSearch(search: string): RestaurantBookingSelection | null {
  const params = new URLSearchParams(search);
  const values = ['date', 'time', 'adults', 'children', 'payment'].map(key => params.getAll(key));
  if (values.some(value => value.length !== 1)) return null;
  const [date, time, adultsText, childrenText, payment] = values.map(value => value[0]);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const instant = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(instant.getTime()) || !instant.toISOString().startsWith(date)) return null;
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return null;
  if (!restaurantPreviewSlots.some(slot => slot.start === time && !slot.soldOut)) return null;
  if (!/^(0|[1-9]\d*)$/.test(adultsText) || !/^(0|[1-9]\d*)$/.test(childrenText)) return null;
  const adults = Number(adultsText);
  const children = Number(childrenText);
  if (!Number.isSafeInteger(adults) || !Number.isSafeInteger(children) || adults < 1 || adults + children > 100) return null;
  if (!restaurantPreviewPaymentMethods.some(method => method === payment)) return null;
  return { date, time, adults, children, paymentMethod: payment as RestaurantPreviewPaymentMethod };
}
