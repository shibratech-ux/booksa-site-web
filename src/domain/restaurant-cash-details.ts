import { z } from 'zod';

const personName = z.string().trim().min(2).max(80).refine(value => /\p{L}/u.test(value) && !/[\p{C}<>]/u.test(value));
const addressText = (minimum: number) => z.string().trim().min(minimum).max(120).refine(value => !/[\p{C}<>]/u.test(value));

/** Local-only validation for the simulated cash checkout; no address is written to Firestore. */
export const restaurantCashDetailsSchema = z.object({
  firstName: personName,
  lastName: personName,
  streetAddress: addressText(3),
  apartment: z.string().trim().max(120),
  city: addressText(2),
  region: addressText(2),
  postalCode: z.string().trim().max(20).refine(value => !value || /^[\p{L}\p{N} -]+$/u.test(value)),
  countryCode: z.literal('CD')
}).strict();

export type RestaurantCashDetails = z.infer<typeof restaurantCashDetailsSchema>;
