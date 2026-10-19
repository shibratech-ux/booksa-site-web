import { z } from 'zod';
import { Timestamp, type DocumentReference } from 'firebase/firestore';
import { getListingCategory } from '../pages/home/listing/create-listing/listingCategories';
import { getAccessContent } from '../pages/home/listing/create-listing/components/PlaceAccessStep';
import { getCounterContent } from '../pages/home/listing/create-listing/components/ListingBasicsStep';
import { getAmenityGroups } from '../pages/home/listing/create-listing/components/AmenitiesStep';
import { getHighlightContent } from '../pages/home/listing/create-listing/components/ListingHighlightsStep';

export const wizardSteps = ['setup', 'property-type', 'place-access', 'map-visibility', 'location', 'basics', 'bathroom-types', 'who-else', 'make-it-stand-out-introduction', 'amenities', 'photos', 'title', 'highlights', 'description', 'finish-and-publish-introduction', 'booking-settings', 'pricing', 'discounts', 'safety-details', 'completion'] as const;
export type WizardStep = typeof wizardSteps[number];
export type ListingStatus = 'draft' | 'action-required' | 'published' | 'active';
export const LISTING_DESCRIPTION_MAX_LENGTH = 500;
const bathroomSchema = z.object({ privateAttachedBathrooms: z.number().int().min(0).max(50), dedicatedBathrooms: z.number().int().min(0).max(50), sharedBathrooms: z.number().int().min(0).max(50) }).strict();
const flowSchema = z.object({
  listingCategory: z.enum(['hotel', 'restaurant', 'private-room']).nullable(),
  listingOption: z.string(), placeAccess: z.string(), listingBasics: z.record(z.string(), z.number().int()),
  bathroomTypes: bathroomSchema,
  whoElseIds: z.array(z.enum(['me', 'my-family', 'other-guests', 'roommates'])),
  everyBedroomHasLock: z.boolean().nullable(), amenityIds: z.array(z.string()),
  listingTitle: z.string().trim().max(50), highlightIds: z.array(z.string()).max(2),
  listingDescription: z.string().trim().max(LISTING_DESCRIPTION_MAX_LENGTH), bookingSetting: z.enum(['review-first', 'instant-book']),
  basePrice: z.number().int().min(1).max(9999999), weekendAdjustment: z.number().int().min(-99).max(99),
  selectedDiscountIds: z.array(z.enum(['new-listing', 'last-minute', 'weekly', 'monthly'])),
  hostingType: z.enum(['individual', 'business']), selectedSafetyDetailIds: z.array(z.enum(['exterior-camera', 'noise-monitor', 'weapons']))
}).strict();
export type FlowDraft = z.infer<typeof flowSchema>;
export const listingBasePriceSchema = flowSchema.shape.basePrice;
export const listingWeekendAdjustmentSchema = flowSchema.shape.weekendAdjustment;
export const LISTING_TITLE_MAX_LENGTH = 50;
export const listingTitleSchema = z.string().trim().min(1).max(LISTING_TITLE_MAX_LENGTH);
export const listingDescriptionSchema = flowSchema.shape.listingDescription.min(1);
export type BathroomTypes = FlowDraft['bathroomTypes'];
const countryCodes = new Set('AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW'.split(' '));
export const addressSchema = z.object({
  country: z.string().refine(v => v.trim().length > 0), countryCode: z.string().refine(v => countryCodes.has(v)),
  streetAddress: z.string().min(3).max(120).refine(v => v.trim().length >= 3), apartment: z.string().max(100).optional(),
  city: z.string().min(2).max(80).refine(v => v.trim().length >= 2), region: z.string().max(100).optional(), postalCode: z.string().max(20).optional()
}).strict();
export type AddressDraft = z.infer<typeof addressSchema>;
const locationSchema = z.object({ address: addressSchema, location: z.object({
  id: z.string().min(1), city: z.string(), region: z.string(), country: z.string(), countryCode: z.string(),
  latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180), timezone: z.string().min(1), administrativeType: z.enum(['commune']).nullable()
}).strict() }).strict();
export type ConfirmedLocation = z.infer<typeof locationSchema>;
export type MapPosition = { latitude: number; longitude: number };
const photoSchema = z.object({ id: z.string().min(1), url: z.string().refine(v => { try { const url = new URL(v); return url.protocol === 'https:' && ['firebasestorage.googleapis.com', 'storage.googleapis.com'].includes(url.hostname); } catch { return false; } }), storagePath: z.string(), originalName: z.string().min(1), contentType: z.string().regex(/^image\//), size: z.number().int().positive(), uploadedAt: z.instanceof(Timestamp), order: z.number().int().nonnegative() }).strict();
export type ListingPhoto = z.infer<typeof photoSchema>;
export type ListingPhotos = Record<string, ListingPhoto>;
export type ListingContact = { uid: string; name: string | null; email: string | null; phoneNumber: string | null; photoUrl: string | null };
export type GeneratedSummary = { title: string; type: string; location: string; basePrice: number; currency: 'CDF'; coverImageUrl: string };
export type ListingDocument = {
  id: string; userUid: string; ownerUid: string; userRef: DocumentReference;
  user: Record<string, unknown> & { uid: string }; contact: ListingContact; status: ListingStatus;
  createdAt: Timestamp; updatedAt: Timestamp; generatedAt?: Timestamp;
  resumePath: string; resumePage: WizardStep | 'address'; flowDraft?: FlowDraft; addressDraft?: AddressDraft;
  confirmedLocation?: ConfirmedLocation; mapPosition?: MapPosition; listingPhotos?: ListingPhotos;
  coverImageUrl?: string; photoCleanupPaths?: string[]; address?: string; countryRegion?: string; streetAddress?: string;
  generatedSummary?: GeneratedSummary; title?: string; description?: string; basePrice?: number; imageUrls?: string[];
};
export const record = (v: unknown): Record<string, unknown> => v && typeof v === 'object' && !Array.isArray(v) ? v as Record<string, unknown> : {};
export function parseListingAmenityIds(flowDraft: unknown, value: unknown): string[] | null {
  const parsed = flowSchema.shape.amenityIds.safeParse(value);
  const categoryId = record(flowDraft).listingCategory;
  const category = getListingCategory(typeof categoryId === 'string' ? categoryId : null);
  if (!parsed.success || !category || new Set(parsed.data).size !== parsed.data.length) return null;
  const allowed = new Set(getAmenityGroups(category).flatMap(group => group.amenities.map(amenity => amenity.id)));
  return parsed.data.every(id => allowed.has(id)) ? parsed.data : null;
}
export function getListingGuestLimits(value: unknown): { minimum: number; maximum: number } | null {
  const flow = record(value);
  const category = getListingCategory(typeof flow.listingCategory === 'string' ? flow.listingCategory : null);
  if (!category || !category.options.some(option => option.id === flow.listingOption)) return null;
  if (!getAccessContent(category, '').options.some(option => option.id === flow.placeAccess)) return null;
  const counter = getCounterContent(category, '', flow.placeAccess as string).counters.find(item => item.id === 'guests');
  return counter ? { minimum: counter.minimum, maximum: counter.maximum } : null;
}

export function isValidListingGuestCount(flow: unknown, guests: unknown): guests is number {
  const limits = getListingGuestLimits(flow);
  return Boolean(limits && z.number().int().min(limits.minimum).max(limits.maximum).safeParse(guests).success);
}
const ids = (v: unknown, allowed: string[]) => Array.isArray(v) ? [...new Set(v.filter((id): id is string => typeof id === 'string' && allowed.includes(id)))] : [];
export function normalizeFlowDraft(value: unknown): FlowDraft {
  const v = record(value), category = getListingCategory(typeof v.listingCategory === 'string' ? v.listingCategory : null);
  const access = category ? getAccessContent(category, '').options.map(o => o.id) : [];
  const pick = (v: unknown, allowed: string[], fallback: string) => typeof v === 'string' && allowed.includes(v) ? v : fallback;
  const counters = category ? getCounterContent(category, '', typeof v.placeAccess === 'string' ? v.placeAccess : '').counters : [];
  return {
    listingCategory: category?.id ?? null,
    listingOption: pick(v.listingOption, category?.options.map(o => o.id) ?? [], ''),
    placeAccess: pick(v.placeAccess, access, ''), listingBasics: { ...Object.fromEntries(counters.map(c => [c.id, c.initialValue])), ...record(v.listingBasics) } as Record<string, number>,
    bathroomTypes: { privateAttachedBathrooms: 0, dedicatedBathrooms: 0, sharedBathrooms: 0, ...record(v.bathroomTypes) } as BathroomTypes,
    whoElseIds: ids(v.whoElseIds, ['me', 'my-family', 'other-guests', 'roommates']) as FlowDraft['whoElseIds'],
    everyBedroomHasLock: typeof v.everyBedroomHasLock === 'boolean' ? v.everyBedroomHasLock : null,
    amenityIds: ids(v.amenityIds, category ? getAmenityGroups(category).flatMap(g => g.amenities.map(a => a.id)) : []),
    listingTitle: typeof v.listingTitle === 'string' ? v.listingTitle.trim() : '',
    highlightIds: ids(v.highlightIds, category ? getHighlightContent(category, '', null).options.map(o => o.id) : []).slice(0, 2),
    listingDescription: typeof v.listingDescription === 'string' ? v.listingDescription.trim() : '',
    bookingSetting: pick(v.bookingSetting, ['review-first', 'instant-book'], 'review-first') as FlowDraft['bookingSetting'],
    basePrice: (v.basePrice ?? 12500) as number, weekendAdjustment: (v.weekendAdjustment ?? 0) as number,
    selectedDiscountIds: ids(v.selectedDiscountIds, category?.id === 'restaurant' ? ['new-listing', 'last-minute'] : ['new-listing', 'last-minute', 'weekly', 'monthly']) as FlowDraft['selectedDiscountIds'],
    hostingType: pick(v.hostingType, ['individual', 'business'], 'business') as FlowDraft['hostingType'],
    selectedSafetyDetailIds: ids(v.selectedSafetyDetailIds, ['exterior-camera', 'noise-monitor', 'weapons']) as FlowDraft['selectedSafetyDetailIds']
  };
}
export const hasLegacyPhotoOrder = (photos: unknown) => Object.values(record(photos)).some(photo => record(photo).order === undefined);
// Photos uploaded before `order` existed are numbered after the ordered ones, oldest first.
function withLegacyPhotoOrder(photos: unknown): Record<string, unknown> {
  const stored = record(photos);
  if (!hasLegacyPhotoOrder(stored)) return stored;
  const orders = Object.values(stored).map(photo => record(photo).order).filter((order): order is number => Number.isInteger(order));
  const uploadedAt = (photo: unknown) => { const value = record(photo).uploadedAt; return value instanceof Timestamp ? value.toMillis() : 0; };
  const legacyIds = Object.keys(stored).filter(id => record(stored[id]).order === undefined)
    .sort((a, b) => uploadedAt(stored[a]) - uploadedAt(stored[b]) || a.localeCompare(b));
  const next = Math.max(-1, ...orders) + 1;
  return { ...stored, ...Object.fromEntries(legacyIds.map((id, index) => [id, { ...record(stored[id]), order: next + index }])) };
}
export type ValidationInput = { flowDraft?: unknown; addressDraft?: unknown; confirmedLocation?: unknown; listingPhotos?: unknown; coverImageUrl?: unknown; pendingPhotos?: unknown[]; resumePage?: unknown };
export function validateListing(input: ValidationInput, ownerUid: string, final = false) {
  const errors: string[] = [];
  if (input.flowDraft !== undefined && (!input.flowDraft || typeof input.flowDraft !== 'object' || Array.isArray(input.flowDraft))) errors.push('flowDraft');
  const raw = record(input.flowDraft), flowDraft = normalizeFlowDraft(raw);
  if (!flowSchema.partial().safeParse(raw).success) errors.push('flowDraft');
  if (!flowSchema.safeParse(flowDraft).success) errors.push('flowDraft');
  // Reject supplied invalid IDs instead of silently filtering them at the write boundary.
  for (const key of ['listingCategory', 'listingOption', 'placeAccess', 'amenityIds', 'whoElseIds', 'highlightIds', 'selectedDiscountIds', 'bookingSetting', 'hostingType', 'selectedSafetyDetailIds'] as const) {
    if (raw[key] !== undefined && JSON.stringify(raw[key]) !== JSON.stringify(flowDraft[key])) errors.push(key);
  }
  if (Object.keys(raw).some(k => !(k in flowDraft))) errors.push('flowDraft');
  if (raw.everyBedroomHasLock !== undefined && raw.everyBedroomHasLock !== null && typeof raw.everyBedroomHasLock !== 'boolean') errors.push('everyBedroomHasLock');
  const category = getListingCategory(flowDraft.listingCategory);
  if (final && (!category || !flowDraft.listingOption || !flowDraft.placeAccess || !flowDraft.listingTitle || !flowDraft.listingDescription)) errors.push('required');
  if (category) {
    const counters = getCounterContent(category, '', flowDraft.placeAccess).counters;
    if (Object.keys(flowDraft.listingBasics).some(k => !counters.some(c => c.id === k))) errors.push('listingBasics');
    for (const c of counters) {
      const n = flowDraft.listingBasics[c.id];
      if ((final || n !== undefined) && (!Number.isInteger(n) || n < c.minimum || n > c.maximum)) errors.push('listingBasics');
    }
  }
  if (final && ['private-room', 'private-suite'].includes(flowDraft.placeAccess) && flowDraft.everyBedroomHasLock === null) errors.push('everyBedroomHasLock');
  if (input.resumePage !== undefined && input.resumePage !== 'address' && !wizardSteps.includes(input.resumePage as WizardStep)) errors.push('resumePage');
  const suppliedLocation = record(input.confirmedLocation), location = record(suppliedLocation.location), suppliedAddress = record(suppliedLocation.address);
  // The confirmed address is the host's answer. Drafts saved before the address step synced it into
  // `location` keep the catalog names (e.g. "Congo (Dem. Rep.)"), so copy the address names over.
  const addressNames = Object.fromEntries((['city', 'region', 'country', 'countryCode'] as const).map(key => [key, typeof suppliedAddress[key] === 'string' ? suppliedAddress[key] : location[key] ?? '']));
  const normalizedLocation = { address: suppliedLocation.address, location: { ...location, ...addressNames, administrativeType: location.administrativeType ?? null } };
  const parsedLocation = locationSchema.safeParse(normalizedLocation);
  if ((final || input.confirmedLocation !== undefined) && !parsedLocation.success) errors.push('confirmedLocation');
  const confirmedLocation = parsedLocation.success ? parsedLocation.data : undefined;
  if (input.addressDraft !== undefined && (!addressSchema.safeParse(input.addressDraft).success || (confirmedLocation && Object.keys(confirmedLocation.address).some(k => record(input.addressDraft)[k] !== record(suppliedLocation.address)[k])))) errors.push('addressDraft');
  const listingPhotos: ListingPhotos = {};
  const paths = new Set<string>(), orders = new Set<number>();
  if (input.listingPhotos !== undefined && (Array.isArray(input.listingPhotos) || !input.listingPhotos || typeof input.listingPhotos !== 'object')) errors.push('listingPhotos');
  for (const [id, value] of Object.entries(withLegacyPhotoOrder(input.listingPhotos))) {
    const result = photoSchema.safeParse(value);
    if (!result.success) { errors.push('listingPhotos'); continue; }
    const p = result.data;
    if (id !== p.id || !p.storagePath.startsWith(`users/${ownerUid}/listing-photos/`) || paths.has(p.storagePath) || orders.has(p.order)) errors.push('listingPhotos');
    paths.add(p.storagePath); orders.add(p.order); listingPhotos[id] = p;
  }
  if (input.pendingPhotos !== undefined && !Array.isArray(input.pendingPhotos)) errors.push('pendingPhotos');
  if (final && (Object.keys(listingPhotos).length < 5 || input.pendingPhotos?.length)) errors.push('photos');
  if ((final || input.coverImageUrl) && !Object.values(listingPhotos).some(p => p.url === input.coverImageUrl)) errors.push('coverImageUrl');
  return { valid: errors.length === 0, errors: [...new Set(errors)], flowDraft, confirmedLocation, listingPhotos };
}
export const LOCK_REQUIRED_ACCESS = ['private-room', 'private-suite'];
export type PropertyTypeChange = { listingOption: string; placeAccess: string; everyBedroomHasLock: boolean | null };
// Applies an editor change to a finalized flowDraft. The category is fixed after finalization.
export function applyPropertyTypeChange(flowDraft: unknown, change: PropertyTypeChange) {
  const merged = { ...record(flowDraft), ...change };
  const { errors } = validateListing({ flowDraft: merged }, '', false);
  if (!change.listingOption || !change.placeAccess) errors.push('required');
  if (LOCK_REQUIRED_ACCESS.includes(change.placeAccess) && change.everyBedroomHasLock === null) errors.push('everyBedroomHasLock');
  return { valid: errors.length === 0, errors: [...new Set(errors)], flowDraft: merged };
}
// Top-level `houseRules` map on annonceslisting. null = the host hasn't answered yet.
// TODO(team): confirm this shape with the Flutter app before merge.
export const HOUSE_RULE_IDS = ['petsAllowed', 'eventsAllowed', 'smokingAllowed', 'quietHours', 'commercialPhotographyAllowed'] as const;
export type HouseRuleId = typeof HOUSE_RULE_IDS[number];
export const houseRulesSchema = z.object({
  petsAllowed: z.boolean().nullable(), eventsAllowed: z.boolean().nullable(), smokingAllowed: z.boolean().nullable(),
  quietHours: z.boolean().nullable(), commercialPhotographyAllowed: z.boolean().nullable()
}).strict();
export type HouseRules = z.infer<typeof houseRulesSchema>;
export function readHouseRules(value: unknown): HouseRules {
  const v = record(value);
  return Object.fromEntries(HOUSE_RULE_IDS.map(id => [id, typeof v[id] === 'boolean' ? v[id] : null])) as HouseRules;
}
