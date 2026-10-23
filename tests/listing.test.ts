import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createInstance } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import bookingEn from '../src/i18n/locales/en/booking.json';
import bookingFr from '../src/i18n/locales/fr/booking.json';
import { ListingHighlightsStep, getHighlightContent } from '../src/pages/home/listing/create-listing/components/ListingHighlightsStep';
import { ListingPhotoGrid } from '../src/pages/home/listing/create-listing/components/PhotoUploadStep';
import { AmenitiesStep } from '../src/pages/home/listing/create-listing/components/AmenitiesStep';
import { ListingBasicsStep } from '../src/pages/home/listing/create-listing/components/ListingBasicsStep';
import { PlaceAccessStep } from '../src/pages/home/listing/create-listing/components/PlaceAccessStep';
import { getListingResumeTarget } from '../src/pages/home/listing/create-listing/listingResume';
import { ROUTES } from '../src/utils/constants';
import { formatCalendarDate } from '../src/utils/formatters';
import { getListingCategory } from '../src/pages/home/listing/create-listing/listingCategories';
import { test, beforeEach } from 'node:test';
import { completeSimulatedIdentityReview, submitCurrentUserIdentityVerification, submitCurrentUserSelfie, SelfieSubmissionError } from '../src/services/identity-verification.service';
import { IDENTITY_REVIEW_DELAY_MS, identityDetailsSchema, MAX_SELFIE_BYTES, readIdentityVerification, type IdentityDetails, type SelfieUploadInput } from '../src/domain/identity-verification';
import { createPhoneVerification, PhoneVerificationError } from '../src/services/phone-verification.service';
import { generatePhoneOtp, hashPhoneOtp, PHONE_OTP_MAX_ATTEMPTS, PHONE_OTP_RESEND_COOLDOWN_MS, PHONE_OTP_TTL_MS, phoneNumberSchema, readVerifiedPhone } from '../src/domain/phone-verification';
import { getCurrentUserListing, listCurrentUserDrafts, listCurrentUserListings, ListingPublishError, publishCurrentUserListing, queueCurrentUserDraftUpdate } from '../src/services/listing-draft.service';
import { readPublishReadiness } from '../src/domain/publish-readiness';
import { getPublishedListingDetail, listPublishedListings } from '../src/services/listing-catalog.service';
import { mostFrequentCity } from '../src/pages/home/listing/exploreCity';
import { groupExploreRails } from '../src/pages/home/listing/exploreRails';
import { countStayNights, MAX_STAY_NIGHTS, quoteRestaurantVisit, quoteStay } from '../src/domain/pricing';
import { EMPTY_RESERVATION_SIMULATION, ReservationSimulationError, simulateReservationRequest, simulateReservationTransition, type SimulatedReservationRequest } from '../src/domain/reservation-simulator';
import { buildRestaurantBookingSearch, parseRestaurantBookingSearch } from '../src/domain/restaurant-booking';
import { restaurantCashDetailsSchema } from '../src/domain/restaurant-cash-details';
import assert from 'node:assert/strict';
import { state, firebaseAuth, Timestamp, emitSnapshot, failSnapshot } from './listing-firebase.mock';
import { subscribeToCurrentUserListing } from '../src/services/listing-draft.service';
import { updateCurrentUserListingAmenities } from '../src/services/listing-draft.service';
import { parseListingAmenityIds } from '../src/domain/listing';
import { getPhotoTourDescriptions, getPhotoTourRoomLabels, removeListingPhotos, setListingCoverPhoto, updateListingPhotoTour, uploadListingPhotos } from '../src/services/listing-photo.service';
import { updateCurrentUserListingDescription } from '../src/services/listing-draft.service';
import { updateCurrentUserListingHouseRules } from '../src/services/listing-draft.service';
import { readHouseRules } from '../src/domain/listing';
import { getListingGuestLimits, isValidListingGuestCount, normalizeFlowDraft, validateListing } from '../src/domain/listing';
import { getListingCoverUrl, getListingImageUrls, getListingPhotoUrls, getOwnListingImageUrls } from '../src/domain/listing-photos';
import { createCurrentUserDraft, updateCurrentUserDraft, generateCurrentUserListing, updateCurrentUserListingTitle, updateCurrentUserListingPropertyType, updateCurrentUserListingBasePrice, updateCurrentUserListingWeekendAdjustment, updateCurrentUserListingGuestCount } from '../src/services/listing-draft.service';
const address = { country: 'Congo', countryCode: 'CD', city: 'Kinshasa', region: 'Kinshasa', streetAddress: '123 Avenue', apartment: '', postalCode: '' };
const confirmedLocation = { address, location: { id: 'kin', city: 'Kinshasa', region: 'Kinshasa', country: 'Congo', countryCode: 'CD', latitude: -4, longitude: 15, timezone: 'Africa/Kinshasa', administrativeType: null } };
const flow = () => normalizeFlowDraft({ listingCategory: 'hotel', listingOption: 'hotel', placeAccess: 'entire-place', listingTitle: ' My hotel ', listingDescription: ' A comfortable stay ' });
const photos = () => Object.fromEntries(Array.from({ length: 5 }, (_, order) => [`p${order}`, { id: `p${order}`, order, url: `https://firebasestorage.googleapis.com/p${order}`, storagePath: `users/owner/listing-photos/listing-${order}.jpg`, originalName: `${order}.jpg`, contentType: 'image/jpeg', size: 100, uploadedAt: Timestamp.now() }]));
const seed = () => { const data = { id: 'listing', userUid: 'owner', ownerUid: 'owner', status: 'draft', createdAt: 'original', user: { uid: 'owner' }, flowDraft: flow(), addressDraft: address, confirmedLocation, listingPhotos: photos(), coverImageUrl: photos().p0.url }; state.docs.set('annonceslisting/listing', data); return data; };
beforeEach(() => { state.docs.clear(); state.listeners.clear(); state.writes.length = 0; state.deletedStorage.length = 0; state.afterRead = null; state.storageUploads.length = 0; state.afterUpload = null; state.uploadError = null; firebaseAuth.currentUser = { uid: 'owner', displayName: 'Host', email: null, phoneNumber: null, photoURL: null }; });
test('listing queries return only documents with ownerUid matching the signed-in user', async () => {
 state.docs.set('annonceslisting/owned', { ownerUid: 'owner', userUid: 'legacy-user', status: 'draft' });
 state.docs.set('annonceslisting/published', { ownerUid: 'owner', userUid: 'owner', status: 'published' });
 state.docs.set('annonceslisting/foreign', { ownerUid: 'other', userUid: 'owner', status: 'draft' });
 state.docs.set('annonceslisting/missing-owner', { userUid: 'owner', status: 'draft' });
 state.docs.set('annonceslisting/null-owner', { ownerUid: null, userUid: 'owner', status: 'draft' });
 state.docs.set('users/owner', { ownerUid: 'owner', status: 'draft' });
 assert.deepEqual((await listCurrentUserListings()).map(listing => listing.id), ['owned', 'published']);
 assert.deepEqual((await listCurrentUserDrafts()).map(listing => listing.id), ['owned']);
 assert.equal(state.writes.length, 0);
});
test('listing queries reject signed-out users and session changes during retrieval', async () => {
 for (const list of [listCurrentUserListings, listCurrentUserDrafts]) {
  firebaseAuth.currentUser = null;
  await assert.rejects(list());
  for (const nextUser of [null, { uid: 'other' }, { uid: 'owner' }]) {
   firebaseAuth.currentUser = { uid: 'owner' };
   state.afterRead = () => { firebaseAuth.currentUser = nextUser; };
   await assert.rejects(list());
  }
 }
 assert.equal(state.writes.length, 0);
});
test('amenities validation accepts each catalog and rejects invalid selections', () => {
 for (const category of ['hotel', 'private-room', 'restaurant']) {
  assert.deepEqual(parseListingAmenityIds({ listingCategory: category }, []), []);
  assert.deepEqual(parseListingAmenityIds({ listingCategory: category }, ['wifi', 'air-conditioning']), ['wifi', 'air-conditioning']);
  for (const value of [null, {}, 'wifi', [1], ['unknown'], ['wifi', 'wifi']]) {
   assert.equal(parseListingAmenityIds({ listingCategory: category }, value), null);
  }
 }
 assert.deepEqual(parseListingAmenityIds({ listingCategory: 'hotel' }, ['front-desk', 'coffee-maker', 'cooking-basics', 'hot-water', 'tv']), ['front-desk', 'coffee-maker', 'cooking-basics', 'hot-water', 'tv']);
 assert.deepEqual(parseListingAmenityIds({ listingCategory: 'restaurant' }, ['table-service', 'card-payment']), ['table-service', 'card-payment']);
 assert.equal(parseListingAmenityIds({ listingCategory: 'restaurant' }, ['coffee-maker']), null);
 assert.equal(parseListingAmenityIds({ listingCategory: 'private-room' }, ['front-desk']), null);
 assert.equal(parseListingAmenityIds({ listingCategory: 'unknown' }, []), null);
 assert.equal(parseListingAmenityIds({}, []), null);
});
test('amenities saves target the current document and synchronize without changing other fields or lifecycle', async () => {
 for (const status of ['action-required', 'published', 'active']) {
  const data = seed(); data.status = status;
  const original = structuredClone(data);
  state.docs.set('annonceslisting/other', { unrelated: true });
  const received: any[] = [];
  const stop = subscribeToCurrentUserListing('listing', listing => received.push(listing), error => { throw error; });
  for (const amenityIds of [['coffee-maker', 'cooking-basics', 'hot-water', 'tv'], ['wifi'], []]) {
   await updateCurrentUserListingAmenities('listing', amenityIds);
   const saved = state.docs.get('annonceslisting/listing');
   assert.deepEqual(structuredClone(saved), { ...original, flowDraft: { ...original.flowDraft, amenityIds }, updatedAt: 'SERVER_TIMESTAMP' });
   assert.deepEqual(received.at(-1).flowDraft.amenityIds, amenityIds);
   assert.deepEqual(state.docs.get('annonceslisting/other'), { unrelated: true });
  }
  stop();
 }
});
test('amenities saves reject invalid catalogs, unsupported statuses, ownership and session changes without writes', async () => {
 seed().status = 'action-required';
 for (const value of [['unknown'], ['table-service'], ['wifi', 'wifi'], null, { ownerUid: 'other' }]) {
  await assert.rejects(updateCurrentUserListingAmenities('listing', value as any));
 }
 for (const status of ['draft', 'in-progress', 'unknown']) {
  seed().status = status; await assert.rejects(updateCurrentUserListingAmenities('listing', ['wifi']));
 }
 for (const identity of ['ownerUid', 'userUid'] as const) {
  const data = seed(); data.status = 'action-required'; data[identity] = 'other';
  await assert.rejects(updateCurrentUserListingAmenities('listing', ['wifi']));
 }
 seed().status = 'action-required';
 await assert.rejects(updateCurrentUserListingAmenities('missing', ['wifi']));
 state.afterRead = () => { firebaseAuth.currentUser = { uid: 'other' }; };
 await assert.rejects(updateCurrentUserListingAmenities('listing', ['wifi']));
 state.afterRead = null; firebaseAuth.currentUser = null;
 await assert.rejects(updateCurrentUserListingAmenities('listing', ['wifi']));
 assert.equal(state.writes.length, 0);
});
test('photo details and cover save together to the current document and preserve summary fields', async () => {
 const data = seed(); data.status = 'action-required';
 (data as any).generatedSummary = { title: 'My hotel', coverImageUrl: data.coverImageUrl, basePrice: 12500, currency: 'CDF' };
 state.docs.set('annonceslisting/other', { untouched: true });
 const urls = getListingPhotoUrls(data);
 await updateListingPhotoTour('listing', urls, urls.map(() => 'Bedroom'), urls.map(() => 'A room'), urls[1]);
 const saved = state.docs.get('annonceslisting/listing');
 assert.equal(state.writes.length, 1); assert.equal(getListingCoverUrl(saved), urls[1]);
 assert.equal(saved.photoTour.photoAssignments.p0.description, 'A room');
 assert.equal(saved.generatedSummary.title, 'My hotel'); assert.equal(saved.generatedSummary.basePrice, 12500);
 assert.equal(saved.ownerUid, 'owner'); assert.equal(saved.status, 'action-required');
 assert.deepEqual(state.docs.get('annonceslisting/other'), { untouched: true });
 await setListingCoverPhoto('listing', urls[2]);
 assert.equal(getListingCoverUrl(state.docs.get('annonceslisting/listing')), urls[2]);
});
test('photo mutations reject mismatched ownership, changed sessions and stale or foreign photo selections', async () => {
 const urls = getListingPhotoUrls(seed());
 const mutate = [
  () => updateListingPhotoTour('listing', urls, urls.map(() => 'Bedroom')),
  () => setListingCoverPhoto('listing', urls[1]),
  () => removeListingPhotos('listing', [urls[0]], urls.slice(1), urls.slice(1).map(() => 'Bedroom'), urls.slice(1).map(() => ''))
 ];
 for (const change of mutate) {
  for (const identity of ['ownerUid', 'userUid'] as const) {
   const data = seed(); data[identity] = 'other'; await assert.rejects(change());
  }
  seed(); state.afterRead = () => { firebaseAuth.currentUser = { uid: 'other' }; };
  await assert.rejects(change());
  state.afterRead = null; firebaseAuth.currentUser = { uid: 'owner' };
 }
 seed();
 await assert.rejects(setListingCoverPhoto('listing', 'https://firebasestorage.googleapis.com/foreign'));
 await assert.rejects(updateListingPhotoTour('listing', [...urls.slice(1), 'https://firebasestorage.googleapis.com/foreign'], urls.map(() => 'Bedroom')));
 await assert.rejects(updateListingPhotoTour('listing', urls.slice(1), urls.slice(1).map(() => 'Bedroom')));
 await assert.rejects(removeListingPhotos('listing', [urls[0]], urls.slice(2), ['Bedroom', 'Bedroom', 'Bedroom'], ['', '', '']));
 assert.equal(state.writes.length, 0); assert.equal(state.deletedStorage.length, 0);
});
test('photo writes use only the document own photos and ignore legacy or nested copies', async () => {
 const data = seed(); data.status = 'action-required';
 (data as any).imageUrls = ['https://firebasestorage.googleapis.com/legacy'];
 (data as any).user = { uid: 'owner', listingPhotos: { z: { url: 'https://firebasestorage.googleapis.com/other-listing', order: 0, storagePath: 'users/owner/listing-photos/z.jpg' } } };
 const own = getOwnListingImageUrls(data);
 assert.equal(own.length, 5);
 assert.equal(own.includes('https://firebasestorage.googleapis.com/legacy'), false);
 await updateListingPhotoTour('listing', own, own.map(() => 'Bedroom'));
 await setListingCoverPhoto('listing', own[1]);
 await assert.rejects(setListingCoverPhoto('listing', 'https://firebasestorage.googleapis.com/legacy'));
 await assert.rejects(updateListingPhotoTour('listing', [...own, 'https://firebasestorage.googleapis.com/legacy'], [...own, 'x'].map(() => 'Bedroom')));
 const afterCover = getOwnListingImageUrls(state.docs.get('annonceslisting/listing'));
 await removeListingPhotos('listing', [afterCover[0]], afterCover.slice(1), afterCover.slice(1).map(() => 'Bedroom'), afterCover.slice(1).map(() => ''));
 const saved = state.docs.get('annonceslisting/listing');
 assert.equal(getOwnListingImageUrls(saved).length, 4);
 assert.equal(saved.coverImageUrl, afterCover[1]);
});
test('removing a cover updates photos, tour and cover summary in one transaction', async () => {
 const data = seed(); data.status = 'action-required';
 (data as any).generatedSummary = { title: 'My hotel', coverImageUrl: data.coverImageUrl };
 const urls = getListingPhotoUrls(data);
 await removeListingPhotos('listing', [urls[0]], urls.slice(1), urls.slice(1).map(() => 'Bedroom'), urls.slice(1).map(() => ''));
 const saved = state.docs.get('annonceslisting/listing');
 assert.equal(state.writes.length, 1); assert.equal(saved.listingPhotos.p0, undefined);
 assert.equal(saved.photoTour.photoAssignments.p0, undefined); assert.equal(getListingCoverUrl(saved), urls[1]);
 assert.equal(saved.status, 'action-required'); assert.equal(saved.ownerUid, 'owner');
 assert.deepEqual(state.deletedStorage, [data.listingPhotos.p0.storagePath]);
});
test('photo uploads work for editable listing statuses and preserve the document lifecycle', async () => {
 for (const status of ['draft', 'action-required', 'published', 'active']) {
  const data = seed(); data.status = status;
  const uploaded = await uploadListingPhotos([{ name: 'room.jpg', type: 'image/jpeg', size: 100 } as File], undefined, 'listing');
  const saved = state.docs.get('annonceslisting/listing');
  const [photo] = Object.values(uploaded);
  assert.equal(Object.keys(saved.listingPhotos).length, 6); assert.equal(photo.order, 5);
  assert.equal(saved.status, status); assert.equal(saved.ownerUid, 'owner'); assert.equal(saved.coverImageUrl, data.coverImageUrl);
  assert.equal(photo.storagePath.startsWith('users/owner/listing-photos/listing-'), true);
 }
});
test('listing subscription follows the selected document and saved edits without touching another listing', async () => {
 const data = seed(); data.status = 'action-required';
 state.docs.set('annonceslisting/other', { ...structuredClone(data), id: 'other', title: 'Other listing' });
 const other = structuredClone(state.docs.get('annonceslisting/other'));
 const received: any[] = []; const errors: Error[] = [];
 const stop = subscribeToCurrentUserListing('listing', listing => received.push(listing), error => errors.push(error));
 assert.equal(received.length, 1);
 await updateCurrentUserListingTitle('listing', 'Updated title');
 assert.equal(received.at(-1).flowDraft.listingTitle, 'Updated title');
 assert.equal(received.at(-1).id, 'listing');
 assert.deepEqual(state.docs.get('annonceslisting/other'), other);
 state.docs.set('annonceslisting/listing', { ...state.docs.get('annonceslisting/listing'), id: 'forged', flowDraft: { ...data.flowDraft, listingTitle: 'Mobile edit' } });
 emitSnapshot('annonceslisting/listing');
 assert.equal(received.at(-1).flowDraft.listingTitle, 'Mobile edit');
 assert.equal(received.at(-1).id, 'listing');
 stop(); const count = received.length;
 emitSnapshot('annonceslisting/listing');
 assert.equal(received.length, count); assert.equal(errors.length, 0);
 assert.equal(state.listeners.get('annonceslisting/listing')?.size, 0);
});
test('listing subscription stops on deleted documents, ownership changes, session changes and listener errors', () => {
 for (const failure of ['deleted', 'ownerUid', 'userUid', 'signed-out', 'switched', 'same-uid-session', 'listener']) {
  const data = seed(); data.status = 'action-required'; firebaseAuth.currentUser = { uid: 'owner' };
  const received: any[] = []; const errors: Error[] = [];
  const stop = subscribeToCurrentUserListing('listing', listing => received.push(listing), error => errors.push(error));
  assert.equal(received.length, 1);
  if (failure === 'deleted') state.docs.delete('annonceslisting/listing');
  if (failure === 'ownerUid' || failure === 'userUid') data[failure] = 'other';
  if (failure === 'signed-out') firebaseAuth.currentUser = null;
  if (failure === 'switched') firebaseAuth.currentUser = { uid: 'other' };
  if (failure === 'same-uid-session') firebaseAuth.currentUser = { uid: 'owner' };
  if (failure === 'listener') failSnapshot('annonceslisting/listing');
  else emitSnapshot('annonceslisting/listing');
  emitSnapshot('annonceslisting/listing');
  assert.equal(received.length, 1); assert.equal(errors.length, 1);
  assert.equal(state.listeners.get('annonceslisting/listing')?.size, 0);
  stop();
 }
});
test('listing subscription rejects unavailable or unauthorized documents before exposing data', () => {
 for (const failure of ['missing', 'ownerUid', 'userUid', 'anonymous']) {
  const data = seed(); firebaseAuth.currentUser = { uid: 'owner' };
  if (failure === 'missing') state.docs.delete('annonceslisting/listing');
  if (failure === 'ownerUid' || failure === 'userUid') data[failure] = 'other';
  if (failure === 'anonymous') firebaseAuth.currentUser = null;
  const received: any[] = []; const errors: Error[] = [];
  const stop = subscribeToCurrentUserListing('listing', listing => received.push(listing), error => errors.push(error));
  assert.equal(received.length, 0); assert.equal(errors.length, 1);
  stop();
 }
});
test('description edits synchronize existing description fields and preserve listing data', async () => {
 for (const status of ['action-required', 'published', 'active']) {
  const data = seed(); data.status = status;
  (data as any).generatedSummary = { title: 'My hotel', basePrice: 12500, currency: 'CDF' };
  const originalFlow = structuredClone(data.flowDraft);
  for (const description of ['  A lovely stay.\nNear the river.  ', 'x', 'x'.repeat(500)]) {
   assert.equal(await updateCurrentUserListingDescription('listing', description), description.trim());
   const saved = state.docs.get('annonceslisting/listing');
   assert.equal(saved.description, description.trim()); assert.deepEqual(saved.flowDraft, { ...originalFlow, listingDescription: description.trim() });
   assert.deepEqual(saved.generatedSummary, (data as any).generatedSummary); assert.deepEqual(saved.listingPhotos, data.listingPhotos);
   assert.equal(saved.status, status); assert.equal(saved.ownerUid, 'owner'); assert.equal(saved.userUid, 'owner'); assert.equal(saved.createdAt, 'original'); assert.equal(saved.updatedAt, 'SERVER_TIMESTAMP');
  }
 }
});
test('description edits reject invalid content, unsupported statuses and unauthorized sessions without writes', async () => {
 seed().status = 'action-required';
 for (const description of ['', ' \n ', 'x'.repeat(501), null as any, 12 as any]) await assert.rejects(updateCurrentUserListingDescription('listing', description));
 for (const status of ['draft', 'in-progress', 'unknown']) { seed().status = status; await assert.rejects(updateCurrentUserListingDescription('listing', 'A lovely stay.')); }
 for (const identity of ['ownerUid', 'userUid'] as const) {
  const data = seed(); data.status = 'action-required'; data[identity] = 'other';
  await assert.rejects(updateCurrentUserListingDescription('listing', 'A lovely stay.'));
 }
 await assert.rejects(updateCurrentUserListingDescription('missing', 'A lovely stay.'));
 seed().status = 'action-required'; state.afterRead = () => { firebaseAuth.currentUser = { uid: 'other' }; };
 await assert.rejects(updateCurrentUserListingDescription('listing', 'A lovely stay.'));
 state.afterRead = null; firebaseAuth.currentUser = null;
 await assert.rejects(updateCurrentUserListingDescription('listing', 'A lovely stay.'));
 assert.equal(state.writes.length, 0);
});
test('guest count limits follow the listing category and access type', () => {
 for (const [listingCategory, listingOption, placeAccess, maximum] of [
  ['hotel', 'hotel', 'entire-place', 100], ['hotel', 'hotel', 'shared-room', 100],
  ['private-room', 'room-in-house', 'private-room', 16],
  ['restaurant', 'restaurant', 'entire-venue', 500], ['restaurant', 'restaurant', 'private-dining-area', 100], ['restaurant', 'restaurant', 'shared-dining-area', 50]
 ] as const) {
  const draft = { listingCategory, listingOption, placeAccess };
  assert.deepEqual(getListingGuestLimits(draft), { minimum: 1, maximum });
  assert.equal(isValidListingGuestCount(draft, 1), true); assert.equal(isValidListingGuestCount(draft, maximum), true);
  for (const value of [0, maximum + 1, 1.5, NaN, Infinity, '4', null]) assert.equal(isValidListingGuestCount(draft, value), false);
 }
 assert.equal(getListingGuestLimits({}), null);
 assert.equal(getListingGuestLimits({ ...flow(), listingOption: 'unknown' }), null);
 assert.equal(getListingGuestLimits({ ...flow(), placeAccess: 'entire-venue' }), null);
});
test('guest count edits preserve other listing basics, identity, status and pricing', async () => {
 for (const status of ['action-required', 'published', 'active']) {
  const data = seed(); data.status = status;
  const originalFlow = structuredClone(data.flowDraft);
  (data as any).generatedSummary = { title: 'My hotel', basePrice: 12500, currency: 'CDF' };
  for (const count of [1, 4, 100]) {
   assert.equal(await updateCurrentUserListingGuestCount('listing', count), count);
   const saved = state.docs.get('annonceslisting/listing');
   assert.deepEqual(saved.flowDraft, { ...originalFlow, listingBasics: { ...originalFlow.listingBasics, guests: count } });
   assert.deepEqual(saved.generatedSummary, (data as any).generatedSummary); assert.deepEqual(saved.listingPhotos, data.listingPhotos);
   assert.equal(saved.status, status); assert.equal(saved.ownerUid, 'owner'); assert.equal(saved.userUid, 'owner'); assert.equal(saved.createdAt, 'original'); assert.equal(saved.updatedAt, 'SERVER_TIMESTAMP');
  }
 }
});
test('guest count writes reject invalid counts, unauthorized sessions and unsupported statuses', async () => {
 seed().status = 'action-required';
 for (const count of [0, -1, 101, 1.5, NaN, Infinity, '4' as any, null as any]) await assert.rejects(updateCurrentUserListingGuestCount('listing', count));
 for (const status of ['draft', 'in-progress', 'unknown']) { seed().status = status; await assert.rejects(updateCurrentUserListingGuestCount('listing', 4)); }
 for (const identity of ['ownerUid', 'userUid'] as const) {
  const data = seed(); data.status = 'action-required'; data[identity] = 'other';
  await assert.rejects(updateCurrentUserListingGuestCount('listing', 4));
 }
 const privateRoom = seed(); privateRoom.status = 'action-required';
 privateRoom.flowDraft = normalizeFlowDraft({ listingCategory: 'private-room', listingOption: 'room-in-house', placeAccess: 'private-room' });
 await assert.rejects(updateCurrentUserListingGuestCount('listing', 17));
 const invalid = seed(); invalid.status = 'action-required'; (invalid.flowDraft as any).listingCategory = 'unknown';
 await assert.rejects(updateCurrentUserListingGuestCount('listing', 4));
 await assert.rejects(updateCurrentUserListingGuestCount('missing', 4));
 seed().status = 'action-required'; state.afterRead = () => { firebaseAuth.currentUser = { uid: 'other' }; };
 await assert.rejects(updateCurrentUserListingGuestCount('listing', 4));
 state.afterRead = null; firebaseAuth.currentUser = null;
 await assert.rejects(updateCurrentUserListingGuestCount('listing', 4));
 assert.equal(state.writes.length, 0);
});
test('weekend adjustment edits persist negative, zero and positive values while preserving listing data', async () => {
 for (const status of ['action-required', 'published', 'active']) {
  const data = seed(); data.status = status;
  const summary = { title: 'My hotel', currency: 'CDF', basePrice: 12500 };
  (data as any).generatedSummary = summary; (data as any).basePrice = 12500;
  for (const adjustment of [-99, -10, 0, 1, 99]) {
   assert.equal(await updateCurrentUserListingWeekendAdjustment('listing', adjustment), adjustment);
   const saved = state.docs.get('annonceslisting/listing');
   assert.deepEqual(saved.flowDraft, { ...flow(), weekendAdjustment: adjustment });
   assert.deepEqual(saved.generatedSummary, summary); assert.equal(saved.basePrice, 12500);
   assert.equal(saved.status, status); assert.equal(saved.ownerUid, 'owner'); assert.equal(saved.userUid, 'owner'); assert.equal(saved.createdAt, 'original'); assert.equal(saved.updatedAt, 'SERVER_TIMESTAMP');
   assert.deepEqual(saved.listingPhotos, data.listingPhotos); assert.deepEqual(saved.confirmedLocation, data.confirmedLocation);
  }
 }
});
test('weekend adjustment edits reject invalid values, unsupported statuses and unauthorized sessions without writes', async () => {
 seed().status = 'action-required';
 for (const adjustment of [-100, 100, 1.5, NaN, Infinity, '10' as any, null as any]) await assert.rejects(updateCurrentUserListingWeekendAdjustment('listing', adjustment));
 for (const status of ['draft', 'in-progress', 'unknown']) { seed().status = status; await assert.rejects(updateCurrentUserListingWeekendAdjustment('listing', 10)); }
 for (const identity of ['ownerUid', 'userUid'] as const) {
  const data = seed(); data.status = 'action-required'; data[identity] = 'other';
  await assert.rejects(updateCurrentUserListingWeekendAdjustment('listing', 10));
 }
 await assert.rejects(updateCurrentUserListingWeekendAdjustment('missing', 10));
 seed().status = 'action-required'; state.afterRead = () => { firebaseAuth.currentUser = { uid: 'other' }; };
 await assert.rejects(updateCurrentUserListingWeekendAdjustment('listing', 10));
 state.afterRead = null; firebaseAuth.currentUser = null;
 await assert.rejects(updateCurrentUserListingWeekendAdjustment('listing', 10));
 assert.equal(state.writes.length, 0);
});
test('nightly price edits synchronize existing price fields and preserve listing state', async () => {
 for (const status of ['action-required', 'published', 'active']) {
  const data = seed(); data.status = status;
  data.flowDraft.weekendAdjustment = 12;
  (data as any).generatedSummary = { title: 'My hotel', currency: 'CDF', basePrice: 100 };
  for (const price of [1, 25000, 9999999]) {
   assert.equal(await updateCurrentUserListingBasePrice('listing', price), price);
   const saved = state.docs.get('annonceslisting/listing');
   assert.equal(saved.basePrice, price); assert.equal(saved.flowDraft.basePrice, price); assert.equal(saved.generatedSummary.basePrice, price);
   assert.equal(saved.status, status); assert.equal(saved.ownerUid, 'owner'); assert.equal(saved.userUid, 'owner'); assert.equal(saved.createdAt, 'original'); assert.equal(saved.updatedAt, 'SERVER_TIMESTAMP');
   assert.equal(saved.flowDraft.weekendAdjustment, 12); assert.equal(saved.flowDraft.listingTitle, 'My hotel'); assert.equal(saved.generatedSummary.currency, 'CDF'); assert.equal(saved.generatedSummary.title, 'My hotel');
  }
 }
});
test('nightly price edits reject invalid amounts, protected access and unsupported statuses without writes', async () => {
 seed().status = 'action-required';
 for (const price of [0, -1, 1.5, 10000000, NaN, Infinity, '100' as any, null as any]) await assert.rejects(updateCurrentUserListingBasePrice('listing', price));
 for (const status of ['draft', 'in-progress', 'unknown']) { seed().status = status; await assert.rejects(updateCurrentUserListingBasePrice('listing', 25000)); }
 for (const identity of ['ownerUid', 'userUid'] as const) {
  const data = seed(); data.status = 'action-required'; data[identity] = 'other';
  await assert.rejects(updateCurrentUserListingBasePrice('listing', 25000));
 }
 await assert.rejects(updateCurrentUserListingBasePrice('missing', 25000));
 seed().status = 'action-required'; state.afterRead = () => { firebaseAuth.currentUser = { uid: 'other' }; };
 await assert.rejects(updateCurrentUserListingBasePrice('listing', 25000));
 state.afterRead = null; firebaseAuth.currentUser = null;
 await assert.rejects(updateCurrentUserListingBasePrice('listing', 25000));
 assert.equal(state.writes.length, 0);
});
test('creation uses authenticated identity, profile fallback and server timestamps', async () => {
 state.docs.set('users/owner', { uid: 'spoof', email: 'profile@example.com', extra: { kept: true } });
 const id = await createCurrentUserDraft(); const data = state.docs.get(`annonceslisting/${id}`);
 assert.equal(data.id, id); assert.equal(data.ownerUid, 'owner'); assert.equal(data.userUid, 'owner'); assert.equal(data.user.uid, 'owner'); assert.deepEqual(data.user.extra, { kept: true }); assert.equal(data.contact.email, 'profile@example.com'); assert.equal(data.userRef.path, 'users/owner'); assert.equal(data.status, 'draft'); assert.equal(data.resumePage, 'address'); assert.equal(data.createdAt, 'SERVER_TIMESTAMP'); assert.equal(state.writes[0].options.merge, true);
});
test('draft sync whitelists fields and replaces photo map', async () => {
 seed(); const next = photos(); delete next.p4;
 await updateCurrentUserDraft('listing', { ownerUid: 'attacker', user: {}, createdAt: 'spoof', listingPhotos: next, resumePage: 'photos' });
 const d = state.docs.get('annonceslisting/listing'); assert.equal(d.ownerUid, 'owner'); assert.equal(d.createdAt, 'original'); assert.deepEqual(d.user, { uid: 'owner' }); assert.equal(Object.keys(d.listingPhotos).length, 4); assert.equal(d.address, '123 Avenue, Kinshasa, Kinshasa, Congo');
});
test('protected statuses never regress to draft', async () => {
 for (const status of ['action-required', 'published', 'active']) { seed().status = status; await updateCurrentUserDraft('listing', { resumePage: 'photos' }); assert.equal(state.docs.get('annonceslisting/listing').status, status); }
 assert.equal(state.writes.length, 0);
});
test('ownership mismatch and authentication change reject writes', async () => {
 seed().ownerUid = 'other'; await assert.rejects(updateCurrentUserDraft('listing', {})); await assert.rejects(generateCurrentUserListing('listing', flow(), confirmedLocation));
 seed(); state.afterRead = () => { firebaseAuth.currentUser = { uid: 'other' }; }; await assert.rejects(updateCurrentUserDraft('listing', {})); assert.equal(state.writes.length, 0);
});
test('invalid canonical IDs, fractions, counters and steps are rejected', async () => {
 seed(); for (const patch of [{ listingOption: 'fake' }, { amenityIds: ['fake'] }, { basePrice: 1.5 }, { selectedDiscountIds: ['fake'] }, { listingBasics: { guests: 900 } }]) await assert.rejects(updateCurrentUserDraft('listing', { flowDraft: { ...flow(), ...patch } }));
 await assert.rejects(updateCurrentUserDraft('listing', { resumePage: 'fake' }));
 assert.deepEqual(normalizeFlowDraft({ listingCategory: 'restaurant', selectedDiscountIds: ['monthly', 'new-listing'] }).selectedDiscountIds, ['new-listing']);
});
test('photo constraints, pending uploads, cover and coordinates prevent finalization', async () => {
 const input = { flowDraft: flow(), confirmedLocation, listingPhotos: photos(), coverImageUrl: photos().p0.url };
 assert.equal(validateListing(input, 'owner', true).valid, true);
 for (const patch of [{ url: 'http://unsafe.test/a' }, { url: 'not a URL' }, { url: 'https://untrusted.test/a' }, { order: 1 }, { storagePath: photos().p1.storagePath }, { storagePath: 'users/other/listing-photos/a' }, { uploadedAt: {} }, { id: 'wrong' }, { size: 0 }]) assert.equal(validateListing({ ...input, listingPhotos: { ...photos(), p0: { ...photos().p0, ...patch } } }, 'owner', true).valid, false);
 assert.equal(validateListing({ ...input, pendingPhotos: [{}] }, 'owner', true).valid, false);
 assert.equal(validateListing({ ...input, coverImageUrl: 'https://other.test/a' }, 'owner', true).valid, false);
 assert.equal(validateListing({ ...input, confirmedLocation: { ...confirmedLocation, location: { ...confirmedLocation.location, latitude: 91 } } }, 'owner', true).valid, false);
 const d = seed(); delete d.listingPhotos.p4; await assert.rejects(generateCurrentUserListing('listing', flow(), confirmedLocation)); assert.equal(state.writes.length, 0);
});
test('finalization writes canonical summary, ordered images and completion', async () => {
 seed(); const summary = await generateCurrentUserListing('listing', flow(), confirmedLocation);
 const d = state.docs.get('annonceslisting/listing'); assert.equal(d.status, 'action-required'); assert.equal(d.resumePage, 'completion'); assert.equal(d.title, 'My hotel'); assert.equal(d.description, 'A comfortable stay'); assert.equal(summary.type, 'hotel'); assert.equal(summary.currency, 'CDF'); assert.deepEqual(d.generatedSummary, summary); assert.equal(d.generatedAt, 'SERVER_TIMESTAMP'); assert.deepEqual(d.imageUrls, Object.values(photos()).map(p => p.url)); assert.equal('generatedListing' in d, false);
});
test('private access requires an explicit lock answer', () => {
 const input = { flowDraft: { ...flow(), placeAccess: 'private-room' }, confirmedLocation, listingPhotos: photos(), coverImageUrl: photos().p0.url };
 assert.equal(validateListing(input, 'owner', true).valid, false);
 assert.equal(validateListing({ ...input, flowDraft: { ...input.flowDraft, everyBedroomHasLock: false } }, 'owner', true).valid, true);
});

test('invalid country codes and mismatched confirmed addresses reject writes', async () => {
 seed();
 await assert.rejects(updateCurrentUserDraft('listing', { confirmedLocation: { ...confirmedLocation, address: { ...address, countryCode: 'ZZ' } } }));
 await assert.rejects(updateCurrentUserDraft('listing', { addressDraft: { ...address, city: 'Another city' } }));
 assert.equal(state.writes.length, 0);
});

test('drafts saved with catalog location names keep saving and store the confirmed address names', async () => {
 const legacyLocation = { address: { ...address, country: 'Democratic Republic of the Congo' }, location: { id: 'africa-kinshasa', city: 'Kinshasa', country: 'Congo (Dem. Rep.)', countryCode: 'CD', latitude: -4.3, longitude: 15.3, timezone: 'Africa/Kinshasa' } };
 const data = seed(); data.confirmedLocation = legacyLocation as any; data.addressDraft = legacyLocation.address;
 await queueCurrentUserDraftUpdate('listing', { resumePath: '/host/listing/create', resumePage: 'title', confirmedLocation: legacyLocation, flowDraft: flow() });
 const saved = state.docs.get('annonceslisting/listing').confirmedLocation;
 assert.deepEqual([saved.location.country, saved.location.region, saved.location.administrativeType], ['Democratic Republic of the Congo', 'Kinshasa', null]);
});

test('drafts with photos uploaded before photo order existed keep saving and get stable orders', async () => {
 const legacy = (id: string, seconds: number) => { const { order: _order, ...photo } = { ...photos().p0, id, url: `https://firebasestorage.googleapis.com/${id}`, storagePath: `users/owner/listing-photos/${id}.jpg`, uploadedAt: new Timestamp(seconds, 0) }; return photo; };
 const data = seed(); data.listingPhotos = { ...photos(), late: legacy('late', 9), early: legacy('early', 2) } as any;
 await queueCurrentUserDraftUpdate('listing', { resumePath: '/host/listing/create', resumePage: 'title', flowDraft: flow() });
 const saved = state.docs.get('annonceslisting/listing').listingPhotos;
 assert.deepEqual([saved.early.order, saved.late.order, saved.p4.order], [5, 6, 4]);
 assert.equal(validateListing({ listingPhotos: { ...saved, p0: { ...saved.p0, order: 5 } } }, 'owner').valid, false);
});
test('listing photo helpers order photos, put the cover first and cap the preview', () => {
 const map = { b: { url: 'https://firebasestorage.googleapis.com/b', order: 2 }, a: { url: 'https://firebasestorage.googleapis.com/a', order: 0 }, c: { downloadURL: 'https://firebasestorage.googleapis.com/c', order: 1 }, bad: { url: 'not-a-url', order: 3 } };
 assert.deepEqual(getListingPhotoUrls({ listingPhotos: map }), ['https://firebasestorage.googleapis.com/a', 'https://firebasestorage.googleapis.com/c', 'https://firebasestorage.googleapis.com/b']);
 const listing = { listingPhotos: map, imageUrls: ['https://firebasestorage.googleapis.com/a', 'https://firebasestorage.googleapis.com/d'], coverImageUrl: 'https://firebasestorage.googleapis.com/b' };
 assert.deepEqual(getListingImageUrls(listing, 3), ['https://firebasestorage.googleapis.com/b', 'https://firebasestorage.googleapis.com/a', 'https://firebasestorage.googleapis.com/c']);
 assert.equal(getListingImageUrls(listing).length, 4);
 assert.equal(getListingCoverUrl({ ...listing, coverImageUrl: 'https://elsewhere.example/x' }), 'https://firebasestorage.googleapis.com/a');
 assert.deepEqual(getListingImageUrls({ imageUrls: ['https://storage.googleapis.com/only'] }, 3), ['https://storage.googleapis.com/only']);
 assert.deepEqual(getListingImageUrls({}, 3), []);
});
test('current listing photo totals follow document updates and exclude stale legacy and user copies', async () => {
 const data = seed(); data.status = 'action-required';
 (data as any).imageUrls = Array.from({ length: 20 }, (_, index) => `https://firebasestorage.googleapis.com/legacy-${index}`);
 data.user = { uid: 'owner', listingPhotos: photos() } as any;
 const other = { ...structuredClone(data), id: 'other', listingPhotos: { first: photos().p0 } };
 state.docs.set('annonceslisting/other', other);
 const totals: number[] = []; const previews: string[][] = [];
 const stop = subscribeToCurrentUserListing('listing', listing => {
  totals.push(getOwnListingImageUrls(listing).length);
  previews.push(getOwnListingImageUrls(listing, 3));
 }, error => { throw error; });
 assert.deepEqual(totals, [5]); assert.equal(previews[0].length, 3);
 const uploaded = await uploadListingPhotos([{ name: 'new-room.jpg', type: 'image/jpeg', size: 100 } as File], undefined, 'listing');
 assert.deepEqual(totals, [5, 6]); assert.equal(previews.at(-1)?.length, 3);
 const current = state.docs.get('annonceslisting/listing');
 const { p0: removed, ...remaining } = current.listingPhotos;
 state.docs.set('annonceslisting/listing', { ...current, listingPhotos: remaining });
 emitSnapshot('annonceslisting/listing');
 assert.deepEqual(totals, [5, 6, 5]);
 assert.equal(getOwnListingImageUrls(state.docs.get('annonceslisting/listing')).includes(removed.url), false);
 assert.equal(Object.keys(uploaded).length, 1);
 stop();
 const otherTotals: number[] = [];
 const stopOther = subscribeToCurrentUserListing('other', listing => otherTotals.push(getOwnListingImageUrls(listing).length), error => { throw error; });
 assert.deepEqual(otherTotals, [1]);
 emitSnapshot('annonceslisting/listing');
 assert.deepEqual(otherTotals, [1]); stopOther();
 state.docs.set('annonceslisting/listing', { ...current, listingPhotos: {} });
 assert.equal(getOwnListingImageUrls(state.docs.get('annonceslisting/listing')).length, 0);
});
test('all photos and their metadata come only from the selected document, even for the same owner', () => {
 const first = photos().p0;
 const second = { ...first, id: 'second', url: 'https://firebasestorage.googleapis.com/second-listing', storagePath: 'users/owner/listing-photos/second.jpg' };
 const photoTour = { photoAssignments: {
  first: { url: first.url, roomLabel: 'Bedroom', description: 'First listing bedroom' },
  second: { url: second.url, roomLabel: 'Kitchen', description: 'Second listing kitchen' }
 } };
 for (const [photo, foreign, room, description] of [
  [first, second, 'Bedroom', 'First listing bedroom'],
  [second, first, 'Kitchen', 'Second listing kitchen']
 ] as const) {
  const listing = { ownerUid: 'owner', listingPhotos: { current: photo }, photoTour,
   imageUrls: [foreign.url], images: [foreign.url], photos: [foreign.url],
   user: { listingPhotos: { foreign } }, coverImageUrl: foreign.url,
   generatedSummary: { coverImageUrl: foreign.url } };
  const urls = getOwnListingImageUrls(listing);
  assert.deepEqual(urls, [photo.url]);
  assert.deepEqual(getPhotoTourRoomLabels(listing.photoTour, urls), [room]);
  assert.deepEqual(getPhotoTourDescriptions(listing.photoTour, urls), [description]);
  assert.deepEqual(getOwnListingImageUrls({ ...listing, listingPhotos: {} }), []);
 }
});
test('own listing photos keep only the document owner photos on trusted hosts, cover first', () => {
 const own = (id: string, order: number, host = 'firebasestorage.googleapis.com', owner = 'owner') => ({ url: `https://${host}/${id}`, order, storagePath: `users/${owner}/listing-photos/${id}.jpg` });
 const listing = {
  ownerUid: 'owner',
  listingPhotos: { b: own('b', 1), a: own('a', 0), other: own('x', 2, 'firebasestorage.googleapis.com', 'someone-else'), untrusted: own('u', 3, 'evil.example'), nopath: { url: 'https://firebasestorage.googleapis.com/n', order: 4 } },
  imageUrls: ['https://firebasestorage.googleapis.com/legacy'],
  photos: ['https://firebasestorage.googleapis.com/legacy2'],
  user: { listingPhotos: { z: own('z', 0) } },
  coverImageUrl: 'https://firebasestorage.googleapis.com/b'
 };
 assert.deepEqual(getOwnListingImageUrls(listing), ['https://firebasestorage.googleapis.com/b', 'https://firebasestorage.googleapis.com/a']);
 assert.deepEqual(getOwnListingImageUrls(listing, 1), ['https://firebasestorage.googleapis.com/b']);
 assert.deepEqual(getOwnListingImageUrls({ ...listing, coverImageUrl: 'https://firebasestorage.googleapis.com/legacy' }), ['https://firebasestorage.googleapis.com/a', 'https://firebasestorage.googleapis.com/b']);
 assert.deepEqual(getOwnListingImageUrls({ ...listing, ownerUid: undefined }), []);
 assert.deepEqual(getOwnListingImageUrls({ ownerUid: 'owner', imageUrls: ['https://storage.googleapis.com/only'] }), []);
});
test('title edits on finalized listings update every title field and keep status and identity', async () => {
 for (const status of ['action-required', 'published', 'active']) {
  const data = seed(); data.status = status; (data as any).title = 'My hotel'; (data as any).generatedSummary = { title: 'My hotel', type: 'hotel', location: 'Kinshasa', basePrice: 10, currency: 'CDF', coverImageUrl: photos().p0.url };
  assert.equal(await updateCurrentUserListingTitle('listing', '  Gombe Hotel  '), 'Gombe Hotel');
  const d = state.docs.get('annonceslisting/listing');
  assert.equal(d.status, status); assert.equal(d.title, 'Gombe Hotel'); assert.equal(d.flowDraft.listingTitle, 'Gombe Hotel'); assert.equal(d.flowDraft.listingDescription, 'A comfortable stay');
  assert.equal(d.generatedSummary.title, 'Gombe Hotel'); assert.equal(d.generatedSummary.basePrice, 10); assert.equal(d.ownerUid, 'owner'); assert.equal(d.createdAt, 'original'); assert.equal(d.updatedAt, 'SERVER_TIMESTAMP');
 }
});
test('title edits reject drafts, invalid titles, other owners and session changes', async () => {
 seed(); await assert.rejects(updateCurrentUserListingTitle('listing', 'Gombe Hotel'));
 seed().status = 'action-required'; await assert.rejects(updateCurrentUserListingTitle('listing', '   ')); await assert.rejects(updateCurrentUserListingTitle('listing', 'x'.repeat(51)));
 const other = seed(); other.status = 'action-required'; other.ownerUid = 'other'; await assert.rejects(updateCurrentUserListingTitle('listing', 'Gombe Hotel'));
 seed().status = 'action-required'; state.afterRead = () => { firebaseAuth.currentUser = { uid: 'other' }; }; await assert.rejects(updateCurrentUserListingTitle('listing', 'Gombe Hotel'));
 await assert.rejects(updateCurrentUserListingTitle('missing', 'Gombe Hotel'));
 assert.equal(state.writes.length, 0);
});
test('property type edits keep the category and status and update the summary type', async () => {
 const data = seed(); data.status = 'action-required'; (data as any).generatedSummary = { title: 'My hotel', type: 'hotel', location: 'Kinshasa', basePrice: 10, currency: 'CDF', coverImageUrl: photos().p0.url };
 await updateCurrentUserListingPropertyType('listing', { listingOption: 'villa', placeAccess: 'private-room', everyBedroomHasLock: true, listingCategory: 'restaurant' } as any);
 const d = state.docs.get('annonceslisting/listing');
 assert.equal(d.status, 'action-required'); assert.equal(d.flowDraft.listingCategory, 'hotel'); assert.equal(d.flowDraft.listingOption, 'villa'); assert.equal(d.flowDraft.placeAccess, 'private-room'); assert.equal(d.flowDraft.everyBedroomHasLock, true);
 assert.equal(d.flowDraft.listingTitle, 'My hotel'); assert.equal(d.generatedSummary.type, 'villa'); assert.equal(d.generatedSummary.title, 'My hotel'); assert.equal(d.ownerUid, 'owner');
});
test('property type edits reject drafts, unknown IDs, missing lock answers, other owners and session changes', async () => {
 const valid = { listingOption: 'villa', placeAccess: 'entire-place', everyBedroomHasLock: null };
 seed(); await assert.rejects(updateCurrentUserListingPropertyType('listing', valid));
 seed().status = 'action-required'; await assert.rejects(updateCurrentUserListingPropertyType('listing', { ...valid, listingOption: 'cafe' }));
 await assert.rejects(updateCurrentUserListingPropertyType('listing', { ...valid, placeAccess: 'entire-venue' }));
 await assert.rejects(updateCurrentUserListingPropertyType('listing', { ...valid, placeAccess: 'private-room' }));
 const other = seed(); other.status = 'action-required'; other.ownerUid = 'other'; await assert.rejects(updateCurrentUserListingPropertyType('listing', valid));
 seed().status = 'action-required'; state.afterRead = () => { firebaseAuth.currentUser = { uid: 'other' }; }; await assert.rejects(updateCurrentUserListingPropertyType('listing', valid));
 assert.equal(state.writes.length, 0);
});
test('house rules save with the guest maximum in one write and keep status and identity', async () => {
 const data = seed(); data.status = 'published';
 const houseRules = { petsAllowed: false, eventsAllowed: true, smokingAllowed: null, quietHours: true, commercialPhotographyAllowed: false };
 assert.deepEqual(await updateCurrentUserListingHouseRules('listing', { houseRules, guests: 3 }), { houseRules, guests: 3 });
 const d = state.docs.get('annonceslisting/listing');
 assert.deepEqual(d.houseRules, houseRules); assert.equal(d.flowDraft.listingBasics.guests, 3); assert.equal(d.flowDraft.listingTitle, 'My hotel');
 assert.equal(d.status, 'published'); assert.equal(d.ownerUid, 'owner'); assert.equal(d.updatedAt, 'SERVER_TIMESTAMP'); assert.equal(state.writes.length, 1);
});
test('house rules reject drafts, extra or non-boolean rules, out-of-range guests, other owners and session changes', async () => {
 const houseRules = readHouseRules({ petsAllowed: true, unknown: true });
 assert.deepEqual(houseRules, { petsAllowed: true, eventsAllowed: null, smokingAllowed: null, quietHours: null, commercialPhotographyAllowed: null });
 seed(); await assert.rejects(updateCurrentUserListingHouseRules('listing', { houseRules, guests: 2 }));
 seed().status = 'action-required';
 await assert.rejects(updateCurrentUserListingHouseRules('listing', { houseRules: { ...houseRules, extra: true } as any, guests: 2 }));
 await assert.rejects(updateCurrentUserListingHouseRules('listing', { houseRules: { ...houseRules, petsAllowed: 'yes' } as any, guests: 2 }));
 await assert.rejects(updateCurrentUserListingHouseRules('listing', { houseRules, guests: 0 }));
 await assert.rejects(updateCurrentUserListingHouseRules('listing', { houseRules, guests: 2.5 }));
 const other = seed(); other.status = 'action-required'; other.ownerUid = 'other'; await assert.rejects(updateCurrentUserListingHouseRules('listing', { houseRules, guests: 2 }));
 seed().status = 'action-required'; state.afterRead = () => { firebaseAuth.currentUser = { uid: 'other' }; }; await assert.rejects(updateCurrentUserListingHouseRules('listing', { houseRules, guests: 2 }));
 assert.equal(state.writes.length, 0);
});

test('expanded property types survive draft normalization and reject cross-category selections', async () => {
 const optionsByCategory = {
  hotel: ['house', 'apartment', 'barn', 'bed-and-breakfast', 'boat', 'cabin', 'camper-rv', 'casa-particular', 'castle', 'cave', 'container', 'cycladic-home', 'dammuso', 'dome', 'earth-home', 'farm', 'guesthouse', 'hotel', 'houseboat', 'minsu', 'riad', 'ryokan', 'shepherds-hut', 'tent', 'tiny-home', 'tower', 'treehouse', 'trullo', 'windmill', 'yurt', 'boutique-hotel', 'hostel', 'lodge', 'resort', 'villa'],
  'private-room': ['bedroom', 'guest-suite', 'shared-room', 'room-in-apartment', 'room-in-house', 'room-in-guesthouse', 'room-in-hotel', 'room-in-hostel', 'room-in-villa', 'room-in-lodge', 'studio-room', 'serviced-room', 'room-on-farm', 'room-on-houseboat'],
  restaurant: ['restaurant', 'cafe', 'bar', 'bistro', 'diner', 'food-truck', 'bakery', 'pub', 'fast-food', 'brasserie', 'canteen', 'dessert-shop', 'fine-dining', 'market-stall', 'lounge', 'pizzeria', 'tea-house', 'tavern', 'snack-bar', 'buffet', 'rooftop', 'private-dining', 'pop-up']
 };
 for (const [listingCategory, options] of Object.entries(optionsByCategory)) {
  for (const listingOption of options) {
   seed();
   const draft = normalizeFlowDraft({ listingCategory, listingOption });
   assert.equal(draft.listingOption, listingOption);
   await updateCurrentUserDraft('listing', { flowDraft: draft });
   assert.equal(state.docs.get('annonceslisting/listing').flowDraft.listingOption, listingOption);
  }
  for (const listingOption of ['unknown', listingCategory === 'restaurant' ? 'cabin' : 'pizzeria']) {
   seed();
   const writesBefore = state.writes.length;
   await assert.rejects(updateCurrentUserDraft('listing', { flowDraft: { ...normalizeFlowDraft({ listingCategory }), listingOption } }));
   assert.equal(state.writes.length, writesBefore);
  }
 }
});

test('queued progress saves preserve the latest document fields and resume step when reopened', async () => {
 seed();
 state.docs.set('annonceslisting/unrelated', { untouched: true });
 const first = { ...flow(), listingOption: 'treehouse', listingTitle: 'First title' };
 const latest = { ...first, listingTitle: 'Updated title', listingDescription: 'Updated description', amenityIds: ['wifi'], bathroomTypes: { privateAttachedBathrooms: 1, dedicatedBathrooms: 0, sharedBathrooms: 1 } };
 const olderSave = queueCurrentUserDraftUpdate('listing', { flowDraft: first, resumePage: 'property-type' });
 const latestSave = queueCurrentUserDraftUpdate('listing', { flowDraft: latest, resumePage: 'description', resumePath: '/host/listing/create' });
 await Promise.all([olderSave, latestSave]);
 const reopened = await getCurrentUserListing('listing');
 assert.deepEqual(reopened.flowDraft, latest);
 assert.equal(reopened.resumePage, 'description');
 assert.equal(reopened.resumePath, '/host/listing/create');
 assert.equal(reopened.updatedAt, 'SERVER_TIMESTAMP');
 assert.equal(reopened.ownerUid, 'owner');
 assert.equal(reopened.status, 'draft');
 assert.deepEqual(state.docs.get('annonceslisting/unrelated'), { untouched: true });
 assert.deepEqual(state.writes.map(write => write.data.flowDraft.listingTitle), ['First title', 'Updated title']);
});
test('a failed progress save does not block later valid progress', async () => {
 seed();
 const invalid = queueCurrentUserDraftUpdate('listing', { flowDraft: { ...flow(), listingOption: 'unknown' } });
 const valid = queueCurrentUserDraftUpdate('listing', { flowDraft: { ...flow(), listingOption: 'cabin' }, resumePage: 'place-access' });
 await assert.rejects(invalid);
 await valid;
 assert.equal(state.writes.length, 1);
 assert.equal((await getCurrentUserListing('listing')).flowDraft?.listingOption, 'cabin');
});
test('retrying progress after a transaction failure saves the latest answers and preserves uploaded photos', async () => {
 const original = seed();
 const existingPhotos = original.listingPhotos;
 const latest = { ...flow(), listingTitle: 'Latest title', amenityIds: ['wifi'], listingDescription: 'Latest description' };
 const update = { flowDraft: latest, resumePage: 'title', resumePath: '/host/listing/create' };
 state.afterRead = () => { throw new Error('Temporary connection failure'); };
 await assert.rejects(queueCurrentUserDraftUpdate('listing', update));
 assert.equal(state.writes.length, 0);
 assert.equal(state.docs.get('annonceslisting/listing').flowDraft.listingTitle, original.flowDraft.listingTitle);
 state.afterRead = null;
 await queueCurrentUserDraftUpdate('listing', update);
 const saved = await getCurrentUserListing('listing');
 assert.deepEqual(saved.flowDraft, latest);
 assert.deepEqual(saved.listingPhotos, existingPhotos);
 assert.equal(saved.coverImageUrl, original.coverImageUrl);
 assert.equal(saved.resumePage, 'title');
 assert.equal(saved.ownerUid, 'owner');
 assert.equal(saved.status, 'draft');
 assert.equal(state.writes[0].ref.path, 'annonceslisting/listing');
});
test('queued progress saves reject changed sessions and never regress finalized listings', async () => {
 seed();
 const pending = queueCurrentUserDraftUpdate('listing', { flowDraft: flow(), resumePage: 'property-type' });
 firebaseAuth.currentUser = { uid: 'owner' };
 await assert.rejects(pending);
 assert.equal(state.writes.length, 0);
 for (const status of ['action-required', 'published', 'active']) {
  seed().status = status;
  await queueCurrentUserDraftUpdate('listing', { flowDraft: flow(), resumePage: 'property-type' });
  assert.equal(state.docs.get('annonceslisting/listing').status, status);
 }
 assert.equal(state.writes.length, 0);
});

test('guest access copy and choices follow the selected category and localized property type', async () => {
 const translations = createInstance();
 await translations.init({ lng: 'en', defaultNS: 'booking', resources: { en: { booking: bookingEn }, fr: { booking: bookingFr } }, interpolation: { escapeValue: false } });
 const cases = [
  { categoryId: 'hotel', optionId: 'house', accessId: 'entire-place', title: 'How will guests stay at your house?', description: 'Guests have this entire house to themselves.', labels: ['House', 'Maison'], expected: 'An entire place', absent: 'A private dining area' },
  { categoryId: 'private-room', optionId: 'bedroom', accessId: 'private-suite', title: 'What privacy will guests have in your bedroom?', description: 'Guests have this bedroom to themselves, plus access to shared areas.', labels: ['Bedroom', 'Chambre'], expected: 'A private suite', absent: 'An entire place' },
  { categoryId: 'restaurant', optionId: 'bistro', accessId: 'private-dining-area', title: 'How will guests dine at your bistro?', description: 'Guests have a dedicated room or section within your bistro.', labels: ['Bistro', 'Bistro'], expected: 'A private dining area', absent: 'A shared room' }
 ];
 for (const language of ['en', 'fr']) {
  await translations.changeLanguage(language);
  for (const sample of cases) {
   const category = getListingCategory(sample.categoryId)!;
   const listingOption = category.options.find(option => option.id === sample.optionId)!;
   const markup = renderToStaticMarkup(createElement(I18nextProvider, { i18n: translations }, createElement(PlaceAccessStep, { category, listingOption, value: sample.accessId, everyBedroomHasLock: null, onBedroomLockChange: () => {}, onChange: () => {} })));
   assert.ok(markup.includes(sample.labels[language === 'en' ? 0 : 1]));
   assert.equal((markup.match(/aria-pressed="true"/g) ?? []).length, 1);
   assert.equal((markup.match(/aria-pressed=/g) ?? []).length, 3);
   assert.ok(!markup.includes('{{'));
   if (language === 'en') {
    for (const expected of [sample.title, sample.description, sample.expected]) assert.ok(markup.includes(expected), expected);
    assert.ok(!markup.includes(sample.absent));
   } else {
    assert.ok(markup.includes('Votre choix :'));
   }
  }
 }
});

test('basics renders the right counters for every category and access type in English and French', async () => {
 const translations = createInstance();
 await translations.init({ lng: 'en', defaultNS: 'booking', resources: { en: { booking: bookingEn }, fr: { booking: bookingFr } }, interpolation: { escapeValue: false } });
 const cases = [
  { categoryId: 'hotel', optionId: 'house', accessType: 'entire-place', labels: ['Guests', 'Bedrooms', 'Beds', 'Bathrooms'], defaults: [4, 1, 1, 1] },
  { categoryId: 'hotel', optionId: 'hotel', accessType: 'private-room', labels: ['Guests', 'Guest rooms', 'Beds', 'Bathrooms'], defaults: [2, 1, 1, 1] },
  { categoryId: 'hotel', optionId: 'hostel', accessType: 'shared-room', labels: ['Guests', 'Shared rooms', 'Beds', 'Shared bathrooms'], defaults: [4, 1, 4, 1] },
  { categoryId: 'private-room', optionId: 'bedroom', accessType: 'private-room', labels: ['Guests', 'Bedrooms', 'Beds', 'Bathrooms'], defaults: [2, 1, 1, 1] },
  { categoryId: 'private-room', optionId: 'guest-suite', accessType: 'private-suite', labels: ['Guests', 'Private bedrooms', 'Beds', 'Private bathrooms'], defaults: [2, 1, 1, 1] },
  { categoryId: 'private-room', optionId: 'shared-room', accessType: 'shared-room', labels: ['Guests', 'Shared bedrooms', 'Beds', 'Shared bathrooms'], defaults: [4, 1, 4, 1] },
  { categoryId: 'restaurant', optionId: 'restaurant', accessType: 'entire-venue', labels: ['Total guest capacity', 'Tables', 'Indoor seats', 'Outdoor seats'], defaults: [20, 5, 20, 0] },
  { categoryId: 'restaurant', optionId: 'bistro', accessType: 'private-dining-area', labels: ['Private dining guests', 'Dining tables', 'Indoor seats', 'Outdoor seats'], defaults: [8, 2, 8, 0] },
  { categoryId: 'restaurant', optionId: 'cafe', accessType: 'shared-dining-area', labels: ['Guests per reservation', 'Reservable tables', 'Indoor reservable seats', 'Outdoor reservable seats'], defaults: [4, 1, 4, 0] }
 ];
 for (const language of ['en', 'fr']) {
  await translations.changeLanguage(language);
  for (const sample of cases) {
   const category = getListingCategory(sample.categoryId)!;
   const listingOption = category.options.find(option => option.id === sample.optionId)!;
   const render = (values: Record<string, number>) => renderToStaticMarkup(createElement(I18nextProvider, { i18n: translations }, createElement(ListingBasicsStep, { category, listingOption, accessType: sample.accessType, values, onChange: () => {} })));
   const markup = render({});
   assert.ok(!markup.includes('{{'));
   assert.equal((markup.match(/<button /g) ?? []).length, 8);
   assert.deepEqual([...markup.matchAll(/<output[^>]*>([^<]*)<\/output>/g)].map(match => Number(match[1])), sample.defaults);
   if (language === 'en') {
    for (const label of sample.labels) {
     assert.ok(markup.includes(`aria-label="Increase ${label}"`), `${sample.accessType}: ${label}`);
     assert.ok(markup.includes(`aria-label="Decrease ${label}"`));
    }
    if (sample.categoryId === 'restaurant') assert.ok(!markup.includes('>Beds<'));
    const restored = render({ guests: 7 });
    assert.ok(restored.includes('>7</output>'));
    const atMinimum = render({ guests: 1 });
    const decrease = (atMinimum.match(/<button [^>]*>/g) ?? []).find(button => button.includes(`aria-label="Decrease ${sample.labels[0]}"`));
    assert.ok(decrease?.includes('disabled=""'));
   }
  }
 }
});

test('drafts paused on removed step 1 pages resume at basics without losing saved answers', async () => {
 for (const resumePage of ['bathroom-types', 'who-else']) {
  seed();
  const savedFlow = { ...flow(), bathroomTypes: { privateAttachedBathrooms: 1, dedicatedBathrooms: 2, sharedBathrooms: 3 }, whoElseIds: ['me', 'other-guests'], everyBedroomHasLock: false };
  await updateCurrentUserDraft('listing', { flowDraft: savedFlow, resumePage });
  const reopened = await getCurrentUserListing('listing');
  assert.deepEqual(getListingResumeTarget(reopened.resumePage), { path: ROUTES.hostListingFirstSection, page: 'basics' });
  await queueCurrentUserDraftUpdate('listing', { flowDraft: reopened.flowDraft, resumePage: 'basics' });
  assert.deepEqual((await getCurrentUserListing('listing')).flowDraft, savedFlow);
 }
 assert.deepEqual(getListingResumeTarget('make-it-stand-out-introduction'), { path: ROUTES.hostListingSecondSection, page: 'introduction' });
});
test('the bedroom lock question is on guest access only for private rooms and suites', async () => {
 const translations = createInstance();
 await translations.init({ lng: 'en', defaultNS: 'booking', resources: { en: { booking: bookingEn } }, interpolation: { escapeValue: false } });
 const category = getListingCategory('private-room')!;
 const listingOption = category.options.find(option => option.id === 'bedroom')!;
 for (const value of ['private-room', 'private-suite', 'shared-room']) {
  for (const everyBedroomHasLock of [null, true, false]) {
   const markup = renderToStaticMarkup(createElement(I18nextProvider, { i18n: translations }, createElement(PlaceAccessStep, { category, listingOption, value, everyBedroomHasLock, onBedroomLockChange: () => {}, onChange: () => {} })));
   const needsAnswer = value !== 'shared-room';
   assert.equal(markup.includes('Does every bedroom have a lock?'), needsAnswer);
   const radios = (markup.match(/<input [^>]*>/g) ?? []).filter(input => input.includes('type="radio"'));
   assert.equal(radios.length, needsAnswer ? 2 : 0);
   assert.equal(radios.filter(input => input.includes('checked=""')).length, needsAnswer && everyBedroomHasLock !== null ? 1 : 0);
  }
 }
});

test('drafts paused on the removed location introduction resume at the location map', async () => {
 seed();
 await updateCurrentUserDraft('listing', { resumePage: 'map-visibility' });
 const reopened = await getCurrentUserListing('listing');
 assert.deepEqual(getListingResumeTarget(reopened.resumePage), { path: ROUTES.hostListingFirstSection, page: 'location' });
 await queueCurrentUserDraftUpdate('listing', { resumePage: 'location' });
 const saved = await getCurrentUserListing('listing');
 assert.equal(saved.resumePage, 'location');
 assert.deepEqual(saved.confirmedLocation, confirmedLocation);
 assert.deepEqual(saved.flowDraft, flow());
});

test('amenities renders localized category groups and restores selected cards and counts', async () => {
 const translations = createInstance();
 await translations.init({ lng: 'en', defaultNS: 'booking', resources: { en: { booking: bookingEn }, fr: { booking: bookingFr } }, interpolation: { escapeValue: false } });
 const cases = [
  { categoryId: 'hotel', selected: ['wifi', 'essentials', 'front-desk'], labels: ['24-hour front desk', 'Réception ouverte 24 h/24'], absent: 'Dining essentials' },
  { categoryId: 'private-room', selected: ['wifi', 'essentials'], labels: ['Towels, bed sheets, soap, and toilet paper', 'Serviettes, draps, savon et papier toilette'], absent: 'Hotel services' },
  { categoryId: 'restaurant', selected: ['wifi', 'table-service', 'vegetarian-options'], labels: ['Vegetarian options', 'Options végétariennes'], absent: 'Towels, bed sheets, soap, and toilet paper' }
 ];
 for (const language of ['en', 'fr']) {
  await translations.changeLanguage(language);
  for (const sample of cases) {
   const category = getListingCategory(sample.categoryId)!;
   const markup = renderToStaticMarkup(createElement(I18nextProvider, { i18n: translations }, createElement(AmenitiesStep, { category, selectedAmenities: sample.selected, onToggle: () => {} })));
   assert.equal((markup.match(/aria-pressed="true"/g) ?? []).length, sample.selected.length);
   assert.ok(markup.includes(translations.t('amenitiesStep.selected', { count: sample.selected.length })));
   assert.ok(markup.includes(sample.labels[language === 'en' ? 0 : 1]));
   assert.ok(markup.includes('role="status"'));
   assert.ok(!markup.includes('{{'));
   assert.ok(!markup.includes('undefined'));
   if (language === 'en') assert.ok(!markup.includes(sample.absent));
  }
 }
});

test('the photo gallery features the saved cover and keeps every photo action accessible', async () => {
 const translations = createInstance();
 await translations.init({ lng: 'en', defaultNS: 'booking', resources: { en: { booking: bookingEn }, fr: { booking: bookingFr } }, interpolation: { escapeValue: false } });
 const stored = photos();
 for (const language of ['en', 'fr']) {
  await translations.changeLanguage(language);
  const render = (busy: boolean) => renderToStaticMarkup(createElement(I18nextProvider, { i18n: translations }, createElement(ListingPhotoGrid, { photos: stored, cover: stored.p3.url, busy, onCover: () => {}, onRemove: () => {}, onAdd: () => {} })));
  const markup = render(false);
  const imageSources = [...markup.matchAll(/<img [^>]*src="([^"]+)"/g)].map(match => match[1]);
  assert.equal(imageSources.length, 5);
  assert.equal(imageSources[0], stored.p3.url);
  assert.equal(new Set(imageSources).size, 5);
  assert.equal((markup.match(/<button /g) ?? []).length, 6);
  assert.ok(markup.includes(translations.t('photoStep.cover')));
  for (let number = 1; number <= 5; number++) assert.ok(markup.includes(translations.t('photoStep.actions', { number })));
  assert.equal((render(true).match(/disabled=""/g) ?? []).length, 6);
  assert.equal((markup.match(/aria-haspopup="dialog"/g) ?? []).length, 5);
  assert.ok(!markup.includes('{{'));
 }
 assert.equal(stored.p3.order, 3);
});

test('highlights render localized category choices and restore the two selected answers', async () => {
 const translations = createInstance();
 await translations.init({ lng: 'en', defaultNS: 'booking', resources: { en: { booking: bookingEn }, fr: { booking: bookingFr } }, interpolation: { escapeValue: false } });
 for (const language of ['en', 'fr']) {
  await translations.changeLanguage(language);
  for (const categoryId of ['hotel', 'private-room', 'restaurant']) {
   const category = getListingCategory(categoryId)!;
   const options = getHighlightContent(category, category.options[0].label, 'private-room').options;
   const render = (selectedHighlights: string[]) => renderToStaticMarkup(createElement(I18nextProvider, { i18n: translations }, createElement(ListingHighlightsStep, { category, listingTypeLabel: category.options[0].label, accessType: 'private-room', selectedHighlights, onChange: () => {} })));
   const markup = render(options.slice(0, 2).map(option => option.id));
   assert.equal((markup.match(/aria-pressed="true"/g) ?? []).length, 2);
   assert.equal((markup.match(/aria-disabled="true"/g) ?? []).length, options.length - 2);
   assert.equal((render([]).match(/aria-disabled="true"/g) ?? []).length, 0);
   for (const option of options) assert.ok(markup.includes(translations.t(`listingHighlightsStep.options.${option.id}`)));
   assert.ok(markup.includes(translations.t('listingHighlightsStep.limitHint')));
   assert.ok(!markup.includes('{{'));
   assert.ok(!markup.includes('listingHighlightsStep.'));
  }
 }
});

const selfieInput = (): SelfieUploadInput => ({
 photoId: crypto.randomUUID(), expectedOwnerUid: 'owner',
 image: new Blob([new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 0xff, 0xd9])], { type: 'image/jpeg' }),
 width: 1280, height: 960
});
const selfieError = (code: string) => (error: unknown) => error instanceof SelfieSubmissionError && error.code === code;

test('selfie submission uploads an owned JPEG and merges metadata into users/auth.uid without changing profile or verification fields', async () => {
 const original = { name: 'Existing Host', role: 'user', identityVerification: 'Not started', identityVerificationSubmission: { otherStep: 'preserved' } };
 state.docs.set('users/owner', original);
 state.docs.set('users/another-user', { name: 'Other user' });
 const input = selfieInput();
 const photo = await submitCurrentUserSelfie(input);
 const saved = state.docs.get('users/owner');
 assert.equal(state.storageUploads.length, 1);
 assert.equal(state.storageUploads[0].path, 'users/owner/identity-verification/selfies/' + input.photoId + '.jpg');
 assert.equal(state.storageUploads[0].options.customMetadata.ownerUid, 'owner');
 assert.equal(saved.name, original.name);
 assert.equal(saved.role, original.role);
 assert.equal(saved.identityVerification, original.identityVerification);
 assert.equal(saved.identityVerificationSubmission.otherStep, 'preserved');
 assert.deepEqual(saved.identityVerificationSubmission.selfie, { ...photo, uploadedAt: 'SERVER_TIMESTAMP' });
 assert.equal(photo.id, input.photoId);
 assert.equal(photo.bucket, 'test-bucket');
 assert.equal(photo.size, input.image.size);
 assert.equal(photo.width, 1280);
 assert.equal(photo.height, 960);
 assert.match(photo.sha256, /^[a-f0-9]{64}$/);
 assert.equal('url' in photo, false);
 assert.deepEqual(state.docs.get('users/another-user'), { name: 'Other user' });
 assert.equal(state.writes.length, 1);
});

test('selfie submission creates the current uid profile when absent and retries a committed request without another upload or write', async () => {
 const input = selfieInput();
 const first = await submitCurrentUserSelfie(input);
 assert.ok(state.docs.has('users/owner'));
 assert.deepEqual(await submitCurrentUserSelfie(input), first);
 assert.equal(state.storageUploads.length, 1);
 assert.equal(state.writes.length, 1);
 const changed = { ...input, image: new Blob([new Uint8Array([0xff, 0xd8, 0xff, 3, 4, 5])], { type: 'image/jpeg' }) };
 await assert.rejects(submitCurrentUserSelfie(changed), selfieError('invalid-image'));
 assert.equal(state.storageUploads.length, 1);
});

test('selfie submission rejects signed-out users, another owner, invalid IDs, sizes, JPEG bytes and dimensions before uploading', async () => {
 const input = selfieInput();
 firebaseAuth.currentUser = null;
 await assert.rejects(submitCurrentUserSelfie(input), selfieError('unauthenticated'));
 firebaseAuth.currentUser = { uid: 'owner' };
 await assert.rejects(submitCurrentUserSelfie({ ...input, expectedOwnerUid: 'another-user' }), selfieError('session-changed'));
 for (const patch of [
  { photoId: '../unsafe' }, { width: 0 }, { height: 0.5 },
  { image: new Blob([], { type: 'image/jpeg' }) },
  { image: new Blob(['not a JPEG'], { type: 'image/jpeg' }) },
  { image: new Blob(['image'], { type: 'image/png' }) },
  { image: new Blob([new Uint8Array(MAX_SELFIE_BYTES + 1)], { type: 'image/jpeg' }) }
 ]) await assert.rejects(submitCurrentUserSelfie({ ...input, ...patch }), selfieError('invalid-image'));
 assert.equal(state.storageUploads.length, 0);
 assert.equal(state.writes.length, 0);
});

test('selfie submission stops after session changes during upload or the profile transaction, including a new session with the same uid', async () => {
 for (const stage of ['upload', 'transaction']) {
  for (const nextUser of [null, { uid: 'another-user' }, { uid: 'owner' }]) {
   firebaseAuth.currentUser = { uid: 'owner' };
   state.afterRead = null;
   state.afterUpload = () => {
    if (stage === 'upload') firebaseAuth.currentUser = nextUser;
    else state.afterRead = () => { firebaseAuth.currentUser = nextUser; };
   };
   await assert.rejects(submitCurrentUserSelfie(selfieInput()), selfieError('session-changed'));
   assert.equal(state.writes.length, 0);
  }
 }
});

test('selfie upload failures do not write profile metadata', async () => {
 state.uploadError = new Error('Storage rejected the upload');
 await assert.rejects(submitCurrentUserSelfie(selfieInput()), selfieError('upload-failed'));
 assert.equal(state.writes.length, 0);
 assert.equal(state.docs.has('users/owner'), false);
});

test('a failed selfie profile write can reuse uploaded metadata on retry without deleting an uncertain committed object', async () => {
 const input = selfieInput();
 state.afterUpload = () => { state.afterRead = () => { throw new Error('Firestore temporarily unavailable'); }; };
 await assert.rejects(submitCurrentUserSelfie(input), selfieError('save-failed'));
 assert.equal(state.storageUploads.length, 1);
 assert.equal(state.writes.length, 0);
 assert.equal(state.deletedStorage.length, 0);
 state.afterRead = null;
 state.afterUpload = null;
 const saved = await submitCurrentUserSelfie(input);
 assert.equal(saved.id, input.photoId);
 assert.equal(state.storageUploads.length, 1);
 assert.equal(state.writes.length, 1);
});

const documentImage = (seed: string) => ({ sha256: seed.repeat(64).slice(0, 64), contentType: 'image/jpeg' as const, size: 2048 });
const identityDetails = (): IdentityDetails => ({
 countryCode: 'CD',
 documentType: 'identity-card',
 documentImages: { front: documentImage('a'), back: documentImage('b') },
 legalName: { firstName: 'Amani', lastName: 'Kabila', preferredFirstName: '' }
});
let identityClock = 5_000_000;
const identityOptions = { now: () => identityClock };

test('identity details require a known document, matching sides, an ISO country and a legal name', () => {
 assert.equal(identityDetailsSchema.safeParse(identityDetails()).success, true);
 const passport = { ...identityDetails(), documentType: 'passport' as const, documentImages: { front: documentImage('c') } };
 assert.equal(identityDetailsSchema.safeParse(passport).success, true);
 for (const invalid of [
  { ...passport, documentImages: { front: documentImage('c'), back: documentImage('d') } },
  { ...identityDetails(), documentImages: { front: documentImage('a') } },
  { ...identityDetails(), documentType: 'library-card' },
  { ...identityDetails(), countryCode: 'cd' },
  { ...identityDetails(), legalName: { firstName: ' ', lastName: 'Kabila', preferredFirstName: '' } },
  { ...identityDetails(), documentImages: { front: { ...documentImage('a'), contentType: 'image/gif' }, back: documentImage('b') } },
  { ...identityDetails(), extra: true }
 ]) assert.equal(identityDetailsSchema.safeParse(invalid).success, false);
});

test('identity submission stores details and a pending simulated review on users/{uid} without uploading ID images', async () => {
 state.docs.set('users/owner', { name: 'Existing Host', identityVerification: 'Not started', phoneNumber: '+243812345678' });
 await assert.rejects(submitCurrentUserIdentityVerification({ ...identityDetails(), countryCode: '' }, selfieInput(), identityOptions), selfieError('invalid-details'));
 assert.equal(state.storageUploads.length, 0);
 assert.equal(state.writes.length, 0);
 const input = selfieInput();
 const result = await submitCurrentUserIdentityVerification(identityDetails(), input, identityOptions);
 assert.deepEqual(result, { status: 'pending', reviewAt: identityClock + IDENTITY_REVIEW_DELAY_MS });
 assert.deepEqual(state.storageUploads.map(upload => upload.path), [`users/owner/identity-verification/selfies/${input.photoId}.jpg`]);
 const saved = state.docs.get('users/owner');
 assert.equal(saved.name, 'Existing Host');
 assert.equal(saved.identityVerification, 'Not started');
 assert.equal(saved.phoneNumber, '+243812345678');
 const { selfie, reviewAt, ...submission } = saved.identityVerificationSubmission;
 assert.equal(selfie.id, input.photoId);
 assert.equal(reviewAt.toMillis(), result.reviewAt);
 assert.deepEqual(submission, { ...identityDetails(), status: 'pending', submittedAt: 'SERVER_TIMESTAMP', verifiedAt: null });
 assert.deepEqual(readIdentityVerification(saved, 'owner'), result);
 assert.deepEqual([...state.docs.keys()], ['users/owner']);
});

test('the simulated review verifies only after its review time and a verified identity cannot be resubmitted', async () => {
 await submitCurrentUserIdentityVerification(identityDetails(), selfieInput(), identityOptions);
 const writes = state.writes.length;
 const early = await completeSimulatedIdentityReview('owner', { now: () => identityClock + IDENTITY_REVIEW_DELAY_MS - 1 });
 assert.equal(early.status, 'pending');
 assert.equal(state.writes.length, writes);
 assert.deepEqual(await completeSimulatedIdentityReview('owner', { now: () => identityClock + IDENTITY_REVIEW_DELAY_MS }), { status: 'verified' });
 const saved = state.docs.get('users/owner');
 assert.equal(saved.identityVerificationSubmission.status, 'verified');
 assert.equal(saved.identityVerificationSubmission.verifiedAt, 'SERVER_TIMESTAMP');
 assert.equal(saved.identityVerificationSubmission.legalName.firstName, 'Amani');
 assert.deepEqual(readIdentityVerification(saved, 'owner'), { status: 'verified' });
 assert.deepEqual(await completeSimulatedIdentityReview('owner', identityOptions), { status: 'verified' });
 const uploads = state.storageUploads.length;
 await assert.rejects(submitCurrentUserIdentityVerification(identityDetails(), selfieInput(), identityOptions), selfieError('already-verified'));
 assert.equal(state.storageUploads.length, uploads);
 assert.equal(state.docs.get('users/owner').identityVerificationSubmission.status, 'verified');
});

test('identity state treats legacy selfie-only, foreign and malformed submissions safely', async () => {
 assert.deepEqual(readIdentityVerification({}, 'owner'), { status: 'not-started' });
 const photo = await submitCurrentUserSelfie(selfieInput());
 const legacy = state.docs.get('users/owner');
 assert.deepEqual(readIdentityVerification(legacy, 'owner'), { status: 'selfie-submitted' });
 assert.deepEqual(readIdentityVerification(legacy, 'another-user'), { status: 'not-started' });
 const forged = { identityVerificationSubmission: { ...legacy.identityVerificationSubmission, status: 'verified' } };
 assert.deepEqual(readIdentityVerification(forged, 'owner'), { status: 'selfie-submitted' });
 assert.equal(photo.id, legacy.identityVerificationSubmission.selfie.id);
 assert.deepEqual(await completeSimulatedIdentityReview('owner', identityOptions), { status: 'selfie-submitted' });
});

test('identity review completion rejects signed-out, mismatched and replaced sessions before writes', async () => {
 await submitCurrentUserIdentityVerification(identityDetails(), selfieInput(), identityOptions);
 const writes = state.writes.length;
 const due = { now: () => identityClock + IDENTITY_REVIEW_DELAY_MS };
 await assert.rejects(completeSimulatedIdentityReview('another-user', due), selfieError('session-changed'));
 state.afterRead = () => { firebaseAuth.currentUser = { uid: 'owner' }; };
 await assert.rejects(completeSimulatedIdentityReview('owner', due), selfieError('session-changed'));
 state.afterRead = null;
 firebaseAuth.currentUser = null;
 await assert.rejects(completeSimulatedIdentityReview('owner', due), selfieError('session-changed'));
 assert.equal(state.writes.length, writes);
 assert.equal(state.docs.get('users/owner').identityVerificationSubmission.status, 'pending');
});

let phoneClock = 1_000_000;
const phoneController = (uid = 'owner') => createPhoneVerification(uid, { now: () => phoneClock });
const phoneError = (code: string) => (error: unknown) => error instanceof PhoneVerificationError && error.code === code;
const wrongPin = (code: string) => String((Number(code) + 1) % 1_000_000).padStart(6, '0');
const pendingOtp = () => state.docs.get('users/owner')?.phoneVerification?.pending;

test('phone numbers normalize international formatting and reject invalid input before any write', async () => {
 assert.equal(phoneNumberSchema.parse('+243 (812) 345-678'), '+243812345678');
 const controller = phoneController();
 for (const phone of ['0812345678', '+012345678', '+243abc123', '+1', '+1234567890123456', '']) {
  await assert.rejects(controller.send(phone), phoneError('invalidPhone'));
 }
 assert.equal(state.writes.length, 0);
 controller.dispose();
});

test('simulated OTPs are uniform 6-digit codes and only a uid/phone-bound hash is stored', async () => {
 const values = [0xffff_ffff, 42];
 assert.equal(generatePhoneOtp(buffer => { buffer[0] = values.shift()!; return buffer; }), '000042');
 for (let index = 0; index < 50; index++) assert.match(generatePhoneOtp(), /^\d{6}$/);
 const hash = await hashPhoneOtp('owner', '+243812345678', '123456');
 assert.match(hash, /^[0-9a-f]{64}$/);
 assert.notEqual(hash, await hashPhoneOtp('other', '+243812345678', '123456'));
 assert.notEqual(hash, await hashPhoneOtp('owner', '+243812345679', '123456'));
});

test('sending a code writes a pending challenge on users/{uid} without touching other profile fields', async () => {
 state.docs.set('users/owner', { name: 'Host', phoneNumber: '+243999999999', identityVerificationSubmission: { selfie: { id: 'existing' } } });
 const controller = phoneController();
 const otp = await controller.send('+243 812 345 678');
 assert.equal(otp.phoneNumber, '+243812345678');
 assert.equal(otp.expiresAt, phoneClock + PHONE_OTP_TTL_MS);
 const profile = state.docs.get('users/owner');
 assert.equal(profile.name, 'Host');
 assert.equal(profile.phoneNumber, '+243999999999');
 assert.deepEqual(profile.identityVerificationSubmission, { selfie: { id: 'existing' } });
 assert.equal(profile.updatedAt, 'SERVER_TIMESTAMP');
 assert.equal(pendingOtp().phoneNumber, '+243812345678');
 assert.equal(pendingOtp().attempts, 0);
 assert.equal(pendingOtp().codeHash, await hashPhoneOtp('owner', '+243812345678', otp.code));
 assert.equal(pendingOtp().expiresAt.toMillis(), otp.expiresAt);
 assert.ok(!JSON.stringify(profile).includes(otp.code), 'the plain code is never persisted');
 assert.equal(readVerifiedPhone(profile), null);
 assert.deepEqual([...state.docs.keys()], ['users/owner']);
 controller.dispose();
});

test('a valid code confirms the number atomically; wrong codes count attempts and change nothing else', async () => {
 state.docs.set('users/owner', { name: 'Host', phoneNumber: '+243999999999' });
 const controller = phoneController();
 const otp = await controller.send('+243812345678');
 await assert.rejects(controller.confirm('123'), phoneError('invalidCode'));
 await assert.rejects(controller.confirm(wrongPin(otp.code)), phoneError('invalidCode'));
 assert.equal(pendingOtp().attempts, 1);
 assert.equal(state.docs.get('users/owner').phoneNumber, '+243999999999');
 assert.equal(await controller.confirm(otp.code), '+243812345678');
 const profile = state.docs.get('users/owner');
 assert.equal(profile.name, 'Host');
 assert.equal(profile.phoneNumber, '+243812345678');
 assert.deepEqual(profile.phoneVerification, { pending: null, verifiedPhoneNumber: '+243812345678', verifiedAt: 'SERVER_TIMESTAMP' });
 assert.equal(readVerifiedPhone(profile), '+243812345678');
 assert.equal(firebaseAuth.currentUser.uid, 'owner');
 // A consumed code cannot be replayed.
 await assert.rejects(controller.confirm(otp.code), phoneError('expired'));
 controller.dispose();
});

test('verification creates a missing profile and is lost once the profile number is edited elsewhere', async () => {
 const controller = phoneController();
 const otp = await controller.send('+243812345678');
 await controller.confirm(otp.code);
 assert.equal(readVerifiedPhone(state.docs.get('users/owner')), '+243812345678');
 assert.equal(readVerifiedPhone({ ...state.docs.get('users/owner'), phoneNumber: '+243999999999' }), null);
 assert.equal(readVerifiedPhone({ phoneNumber: '+243812345678' }), null);
 controller.dispose();
});

test('resends are throttled per account, and a new code invalidates the previous one', async () => {
 const controller = phoneController();
 const first = await controller.send('+243812345678');
 phoneClock += 15_000;
 await assert.rejects(controller.send('+243812345678'), (error: unknown) => phoneError('throttled')(error) && (error as PhoneVerificationError).retryAfterSeconds === 45);
 // The cooldown is stored in Firestore, so a reopened screen cannot bypass it.
 const reopened = phoneController();
 await assert.rejects(reopened.send('+243899999999'), phoneError('throttled'));
 reopened.dispose();
 phoneClock += PHONE_OTP_RESEND_COOLDOWN_MS;
 const second = await controller.send('+243812345678');
 if (first.code !== second.code) await assert.rejects(controller.confirm(first.code), phoneError('invalidCode'));
 assert.equal(await controller.confirm(second.code), '+243812345678');
 controller.dispose();
});

test('expired codes and exhausted attempts clear the challenge without confirming the number', async () => {
 state.docs.set('users/owner', { phoneNumber: '+243999999999' });
 const controller = phoneController();
 const expiring = await controller.send('+243812345678');
 phoneClock += PHONE_OTP_TTL_MS;
 await assert.rejects(controller.confirm(expiring.code), phoneError('expired'));
 assert.equal(pendingOtp(), null);
 phoneClock += PHONE_OTP_RESEND_COOLDOWN_MS;
 const otp = await controller.send('+243812345678');
 for (let attempt = 1; attempt < PHONE_OTP_MAX_ATTEMPTS; attempt++) {
  await assert.rejects(controller.confirm(wrongPin(otp.code)), phoneError('invalidCode'));
 }
 await assert.rejects(controller.confirm(wrongPin(otp.code)), phoneError('attempts'));
 assert.equal(pendingOtp(), null);
 await assert.rejects(controller.confirm(otp.code), phoneError('expired'));
 assert.equal(state.docs.get('users/owner').phoneNumber, '+243999999999');
 assert.equal(readVerifiedPhone(state.docs.get('users/owner')), null);
 controller.dispose();
});

test('a challenge replaced from another session is never confirmed by this one', async () => {
 const controller = phoneController();
 const otp = await controller.send('+243812345678');
 phoneClock += PHONE_OTP_RESEND_COOLDOWN_MS;
 const other = phoneController();
 await other.send('+243899999999');
 other.dispose();
 await assert.rejects(controller.confirm(otp.code), phoneError('expired'));
 assert.equal(state.docs.get('users/owner').phoneNumber, undefined);
 controller.dispose();
});

test('phone confirmation rejects unauthenticated, mismatched, replaced and disposed sessions before writes', async () => {
 firebaseAuth.currentUser = null;
 assert.throws(() => phoneController(), phoneError('session'));
 firebaseAuth.currentUser = { uid: 'other' };
 assert.throws(() => phoneController(), phoneError('session'));
 for (const phase of ['send', 'confirm']) {
  firebaseAuth.currentUser = { uid: 'owner' };
  const controller = phoneController();
  const otp = phase === 'confirm' ? await controller.send('+243812345678') : null;
  const writes = state.writes.length;
  state.afterRead = () => { firebaseAuth.currentUser = { uid: 'owner' }; };
  if (otp) await assert.rejects(controller.confirm(otp.code), phoneError('session'));
  else await assert.rejects(controller.send('+243812345678'), phoneError('session'));
  assert.equal(state.writes.length, writes);
  state.afterRead = null;
  controller.dispose();
  phoneClock += PHONE_OTP_RESEND_COOLDOWN_MS;
 }
 firebaseAuth.currentUser = { uid: 'owner' };
 const controller = phoneController();
 const otp = await controller.send('+243812345678');
 controller.dispose();
 const writes = state.writes.length;
 await assert.rejects(controller.confirm(otp.code), phoneError('session'));
 await assert.rejects(controller.send('+243812345678'), phoneError('session'));
 assert.equal(state.writes.length, writes);
});

const verifyHost = async ({ phone = true, identity = true } = {}) => {
 if (phone) {
  phoneClock += PHONE_OTP_RESEND_COOLDOWN_MS;
  const controller = phoneController();
  const otp = await controller.send('+243812345678');
  await controller.confirm(otp.code);
  controller.dispose();
 }
 if (identity) {
  await submitCurrentUserIdentityVerification(identityDetails(), selfieInput(), identityOptions);
  await completeSimulatedIdentityReview('owner', { now: () => identityClock + IDENTITY_REVIEW_DELAY_MS });
 }
};
const publishError = (code: string) => (error: unknown) => error instanceof ListingPublishError && error.code === code;

test('publish readiness requires both a confirmed phone and a verified identity', async () => {
 assert.equal(readPublishReadiness({}, 'owner').ready, false);
 await verifyHost({ identity: false });
 assert.deepEqual(readPublishReadiness(state.docs.get('users/owner'), 'owner'), { phoneVerified: true, identity: { status: 'not-started' }, ready: false });
 await verifyHost({ phone: false });
 assert.equal(readPublishReadiness(state.docs.get('users/owner'), 'owner').ready, true);
 assert.equal(readPublishReadiness({ ...state.docs.get('users/owner'), phoneNumber: '+243899999999' }, 'owner').ready, false);
});

test('deploy publishes an action-required listing once and keeps identity, content and other fields', async () => {
 await verifyHost();
 const data = seed(); data.status = 'action-required';
 const before = { ...state.docs.get('annonceslisting/listing') };
 assert.equal(await publishCurrentUserListing('listing'), 'published');
 const saved = state.docs.get('annonceslisting/listing');
 assert.deepEqual(saved, { ...before, status: 'published', publishedAt: 'SERVER_TIMESTAMP', updatedAt: 'SERVER_TIMESTAMP' });
 const profile = state.docs.get('users/owner');
 assert.deepEqual(profile.readyListings, { listing: { listingId: 'listing', status: 'ready', readyAt: 'SERVER_TIMESTAMP' } });
 assert.equal(profile.phoneNumber, '+243812345678');
 assert.equal(profile.identityVerificationSubmission.status, 'verified');
 const writes = state.writes.length;
 assert.equal(await publishCurrentUserListing('listing'), 'published');
 seed().status = 'active';
 assert.equal(await publishCurrentUserListing('listing'), 'active');
 assert.equal(state.writes.length, writes);
});

test('deploy rejects unverified hosts, unpublishable statuses, other owners and changed sessions without writes', async () => {
 seed().status = 'action-required';
 await verifyHost({ identity: false });
 await assert.rejects(publishCurrentUserListing('listing'), publishError('verification-required'));
 await verifyHost({ phone: false });
 for (const status of ['draft', 'in-progress', 'unknown']) {
  seed().status = status;
  await assert.rejects(publishCurrentUserListing('listing'), publishError('not-publishable'));
 }
 await assert.rejects(publishCurrentUserListing('missing'), publishError('not-publishable'));
 for (const identity of ['ownerUid', 'userUid'] as const) {
  const data = seed(); data.status = 'action-required'; data[identity] = 'other';
  await assert.rejects(publishCurrentUserListing('listing'), publishError('generic'));
 }
 seed().status = 'action-required';
 state.afterRead = () => { firebaseAuth.currentUser = { uid: 'owner' }; };
 await assert.rejects(publishCurrentUserListing('listing'), publishError('generic'));
 state.afterRead = null;
 firebaseAuth.currentUser = null;
 await assert.rejects(publishCurrentUserListing('listing'), publishError('generic'));
 assert.equal(state.docs.get('annonceslisting/listing').status, 'action-required');
 assert.equal(state.writes.filter(write => write.ref.path === 'annonceslisting/listing').length, 0);
 assert.equal(state.docs.get('users/owner').readyListings, undefined);
});

test('deploy keeps other ready listings and backfills the ready entry for an already published listing', async () => {
 await verifyHost();
 state.docs.set('users/owner', { ...state.docs.get('users/owner'), readyListings: { other: { listingId: 'other', status: 'ready', readyAt: 'earlier' } } });
 seed().status = 'published';
 assert.equal(await publishCurrentUserListing('listing'), 'published');
 assert.deepEqual(state.docs.get('users/owner').readyListings, {
  other: { listingId: 'other', status: 'ready', readyAt: 'earlier' },
  listing: { listingId: 'listing', status: 'ready', readyAt: 'SERVER_TIMESTAMP' }
 });
 assert.equal(state.docs.get('annonceslisting/listing').publishedAt, undefined);
 const writes = state.writes.length;
 for (const listingId of ['', 'a.b', 'a/b', 'x'.repeat(129)]) {
  await assert.rejects(publishCurrentUserListing(listingId), publishError('not-publishable'));
 }
 assert.equal(state.writes.length, writes);
});

const publishedListing = (id: string, overrides: { category?: string; status?: string; publishedAt?: number; owner?: string } = {}) => {
 const owner = overrides.owner ?? 'host-' + id;
 const listingPhotos = Object.fromEntries(Object.entries(photos()).map(([key, photo]) => [key, { ...photo, storagePath: photo.storagePath.replace('users/owner/', `users/${owner}/`) }]));
 state.docs.set(`annonceslisting/${id}`, {
  id, ownerUid: owner, userUid: owner, status: overrides.status ?? 'published',
  user: { uid: owner, email: `${owner}@example.com`, phoneNumber: '+243812345678' },
  contact: { uid: owner, email: `${owner}@example.com` },
  flowDraft: { ...flow(), listingCategory: overrides.category ?? 'hotel', basePrice: 25000 },
  generatedSummary: { title: 'My hotel', type: 'Hotel', location: 'Gombe, Kinshasa', basePrice: 25000, currency: 'CDF', coverImageUrl: 'https://firebasestorage.googleapis.com/p0' },
  listingPhotos,
  publishedAt: overrides.publishedAt === undefined ? undefined : Timestamp.fromMillis(overrides.publishedAt)
 });
};

test('explore lists only published listings, newest first, with their describe-your-place category', async () => {
 publishedListing('older-hotel', { publishedAt: 1_000 });
 publishedListing('room', { category: 'private-room', publishedAt: 3_000 });
 publishedListing('restaurant', { category: 'restaurant', publishedAt: 2_000 });
 for (const status of ['draft', 'action-required', 'active']) publishedListing(`not-${status}`, { status });
 const listings = await listPublishedListings();
 assert.deepEqual(listings.map(listing => [listing.id, listing.category]), [['room', 'private-room'], ['restaurant', 'restaurant'], ['older-hotel', 'hotel']]);
 assert.deepEqual(listings[2], {
  id: 'older-hotel', category: 'hotel', title: 'My hotel', location: 'Gombe, Kinshasa', city: null,
  coverImageUrl: 'https://firebasestorage.googleapis.com/p0', basePrice: 25000, currency: 'CDF', publishedAt: 1_000
 });
 // Host identity and contact details stored on the listing never reach guest-facing code.
 assert.ok(!JSON.stringify(listings).includes('@example.com'));
 assert.ok(!JSON.stringify(listings).includes('+243'));
});

test('explore headings use the most frequent confirmed city and keep display order for ties', async () => {
 for (const [id, city] of [['first', 'Goma'], ['second', ' Kinshasa '], ['third', 'kinshasa']]) {
  publishedListing(id, { category: 'private-room' });
  state.docs.get(`annonceslisting/${id}`).confirmedLocation = { address: { city } };
 }
 const listings = await listPublishedListings();
 assert.equal(listings[1].city, 'Kinshasa');
 assert.equal(mostFrequentCity(listings), 'Kinshasa');
 assert.equal(mostFrequentCity([{ city: 'Goma' }, { city: 'Kinshasa' }]), 'Goma');
 assert.equal(mostFrequentCity([{ city: null }, { city: ' ' }]), null);
 assert.equal(mostFrequentCity([]), null);
});

test('explore rails group by tag and city, biggest first, capped at 10 rails of 7 listings', () => {
 const listing = (id: string, category: string, city: string | null) => ({ id, category, city });
 const rails = groupExploreRails([
  listing('h1', 'hotel', 'Goma'), listing('r1', 'private-room', 'Kinshasa'), listing('h2', 'hotel', ' goma '),
  listing('r2', 'private-room', null), listing('r3', 'private-room', ' ')
 ]);
 assert.deepEqual(rails.map(rail => [rail.key, rail.city, rail.listings.map(item => item.id)]), [
  ['hotel:goma', 'Goma', ['h1', 'h2']],
  ['private-room:', null, ['r2', 'r3']],
  ['private-room:kinshasa', 'Kinshasa', ['r1']]
 ]);

 const many = Array.from({ length: 12 }, (_, city) => Array.from({ length: 9 }, (_, index) => listing(`${city}-${index}`, 'hotel', `City ${city}`))).flat();
 const capped = groupExploreRails(many);
 assert.equal(capped.length, 10);
 assert.ok(capped.every(rail => rail.listings.length === 7));
 assert.deepEqual(capped[0].listings.map(item => item.id), ['0-0', '0-1', '0-2', '0-3', '0-4', '0-5', '0-6']);
});

test('explore skips published listings with unknown categories, foreign photos or invalid prices', async () => {
 publishedListing('valid');
 publishedListing('unknown-category', { category: 'castle' });
 publishedListing('foreign-photos', { owner: 'attacker' });
 state.docs.get('annonceslisting/foreign-photos').ownerUid = 'someone-else';
 publishedListing('bad-price');
 state.docs.get('annonceslisting/bad-price').flowDraft.basePrice = 12.5;
 publishedListing('no-title');
 state.docs.get('annonceslisting/no-title').flowDraft.listingTitle = ' ';
 state.docs.get('annonceslisting/no-title').generatedSummary.title = '';
 assert.deepEqual((await listPublishedListings()).map(listing => listing.id), ['valid']);
});

test('explore requires a signed-in session and reports a generic error when the session changes', async () => {
 publishedListing('valid');
 firebaseAuth.currentUser = null;
 await assert.rejects(listPublishedListings(), /signed in/);
 firebaseAuth.currentUser = { uid: 'guest' };
 state.afterRead = () => { firebaseAuth.currentUser = { uid: 'guest' }; };
 await assert.rejects(listPublishedListings(), /could not load listings/);
 state.afterRead = null;
 assert.equal((await listPublishedListings()).length, 1);
});

test('stay pricing counts half-open nights and multiplies an integer nightly price', () => {
 assert.equal(countStayNights('2026-11-13', '2026-11-15'), 2);
 assert.equal(countStayNights('2026-02-28', '2026-03-01'), 1);
 assert.equal(countStayNights('2028-02-28', '2028-03-01'), 2);
 assert.equal(countStayNights('2026-03-28', '2026-03-30'), 2, 'DST changes do not shift calendar nights');
 for (const [checkIn, checkOut] of [['2026-11-15', '2026-11-15'], ['2026-11-15', '2026-11-13'], ['2026-02-30', '2026-03-02'], ['13/11/2026', '15/11/2026'], ['2026-01-01', '2027-01-02']]) {
  assert.equal(countStayNights(checkIn, checkOut), null);
 }
 assert.deepEqual(quoteStay(25000, 2), { nightlyPrice: 25000, nights: 2, total: 50000, currency: 'CDF' });
 assert.equal(quoteStay(25000, MAX_STAY_NIGHTS)?.total, 25000 * MAX_STAY_NIGHTS);
 for (const [nightly, nights] of [[0, 2], [12.5, 2], [10_000_000, 1], [25000, 0], [25000, 1.5], [25000, MAX_STAY_NIGHTS + 1]]) {
  assert.equal(quoteStay(nightly, nights), null);
 }
});

test('restaurant preview pricing multiplies the listed price by adults and children', () => {
 assert.deepEqual(quoteRestaurantVisit(25000, 3, 1), {
  perGuestPrice: 25000, adults: 3, children: 1,
  adultSubtotal: 75000, childSubtotal: 25000, total: 100000, currency: 'CDF'
 });
 assert.equal(quoteRestaurantVisit(25000, 1, 0)?.total, 25000);
 for (const [price, adults, children] of [[0, 1, 0], [12.5, 1, 0], [10_000_000, 1, 0], [25000, 0, 1], [25000, 1.5, 0], [25000, 1, -1], [9_999_999, Number.MAX_SAFE_INTEGER, 0]]) {
  assert.equal(quoteRestaurantVisit(price, adults, children), null);
 }
});

test('restaurant booking URL keeps the selected date, time, guests and preview method', () => {
 const selection = { date: '2026-12-04', time: '19:30', adults: 2, children: 1, paymentMethod: 'cash' } as const;
 assert.deepEqual(parseRestaurantBookingSearch(buildRestaurantBookingSearch(selection)), selection);
 for (const search of [
  '?date=2026-02-30&time=19%3A30&adults=2&children=1&payment=cash',
  '?date=2026-12-04&time=25%3A00&adults=2&children=1&payment=cash',
  '?date=2026-12-04&time=12%3A30&adults=2&children=1&payment=cash',
  '?date=2026-12-04&time=19%3A30&adults=0&children=1&payment=cash',
  '?date=2026-12-04&time=19%3A30&adults=2&children=101&payment=cash',
  '?date=2026-12-04&time=19%3A30&adults=2&children=1&payment=unknown',
  '?date=2026-12-04&date=2026-12-05&time=19%3A30&adults=2&children=1&payment=cash'
 ]) assert.equal(parseRestaurantBookingSearch(search), null);
});

test('cash checkout requires valid names and billing details before the preview continues', () => {
 const valid = {
  firstName: 'Amani', lastName: 'Kabeya', streetAddress: '12 Avenue Kasai', apartment: '',
  city: 'Kinshasa', region: 'Kinshasa', postalCode: '', countryCode: 'CD'
 };
 assert.deepEqual(restaurantCashDetailsSchema.parse(valid), valid);
 assert.equal(restaurantCashDetailsSchema.safeParse({ ...valid, firstName: '  ' }).success, false);
 assert.equal(restaurantCashDetailsSchema.safeParse({ ...valid, streetAddress: '  ' }).success, false);
 assert.equal(restaurantCashDetailsSchema.safeParse({ ...valid, city: 'X' }).success, false);
 assert.equal(restaurantCashDetailsSchema.safeParse({ ...valid, region: '' }).success, false);
 assert.equal(restaurantCashDetailsSchema.safeParse({ ...valid, postalCode: 'bad!' }).success, false);
 assert.equal(restaurantCashDetailsSchema.safeParse({ ...valid, countryCode: 'US' }).success, false);
 assert.equal(restaurantCashDetailsSchema.safeParse({ ...valid, cardNumber: '4111111111111111' }).success, false);
});

test('guest listing detail returns only published listings with a guest-safe projection', async () => {
 publishedListing('stay', { category: 'private-room', publishedAt: 1_000 });
 const listing = state.docs.get('annonceslisting/stay');
 listing.user = { uid: listing.ownerUid, name: 'Amani Kabila', email: 'amani@example.com', phoneNumber: '+243812345678' };
 listing.flowDraft.listingBasics = { guests: 2, bedrooms: 1, beds: 1, bathrooms: 1 };
 listing.flowDraft.amenityIds = ['wifi', 'tv'];
 listing.houseRules = { petsAllowed: false, smokingAllowed: null };
 listing.confirmedLocation = { address: { city: 'Kinshasa' }, location: { latitude: -4.3, longitude: 15.3, timezone: 'Africa/Kinshasa' } };
 const detail = await getPublishedListingDetail('stay');
 assert.ok(detail);
 assert.equal(detail.category, 'private-room');
 assert.equal(detail.hostFirstName, 'Amani');
 assert.equal(detail.isOwnedByCurrentUser, false);
 assert.deepEqual(detail.basics, { guests: 2, bedrooms: 1, beds: 1, bathrooms: 1 });
 assert.deepEqual(detail.amenityIds, ['wifi', 'tv']);
 assert.equal(detail.houseRules.petsAllowed, false);
 assert.equal(detail.houseRules.smokingAllowed, null);
 assert.deepEqual(detail.coordinates, { latitude: -4.3, longitude: 15.3 });
 assert.equal(detail.city, 'Kinshasa');
 assert.equal(detail.photoUrls.length, 5);
 const serialized = JSON.stringify(detail);
 for (const secret of ['amani@example.com', '+243812345678', 'Kabila', 'ownerUid']) assert.ok(!serialized.includes(secret), secret);

 for (const status of ['draft', 'action-required', 'active']) {
  publishedListing(`hidden-${status}`, { status });
  assert.equal(await getPublishedListingDetail(`hidden-${status}`), null);
 }
 assert.equal(await getPublishedListingDetail('missing'), null);
 assert.equal(await getPublishedListingDetail('Appartement à Gombe-CDF 438,245'), null);
 publishedListing('owned-stay', { owner: 'owner' });
 assert.equal((await getPublishedListingDetail('owned-stay'))?.isOwnedByCurrentUser, true);
 firebaseAuth.currentUser = null;
 await assert.rejects(getPublishedListingDetail('stay'), /signed in/);
});

test('reservation simulator quotes a stay, records transitions, and retries the same request once', () => {
 const request: SimulatedReservationRequest = {
  requestId: 'request-1', listingKey: 'listing-1', listingTitle: 'A stay', listingLocation: 'Kinshasa',
  imageUrl: 'https://example.com/photo.jpg', guestUid: 'guest-1', checkIn: '2026-11-06', checkOut: '2026-11-08',
  adults: 2, children: 0, totalLabel: 'CDF 50,000', nightlyPriceCdf: 25000, paymentTiming: 'now'
 };
 const first = simulateReservationRequest(EMPTY_RESERVATION_SIMULATION, request, '2026-10-23T12:00:00.000Z');
 assert.equal(first.reservation.nights, 2);
 assert.equal(first.reservation.totalCdf, 50000);
 assert.equal(first.reservation.status, 'confirmed');
 assert.deepEqual(first.reservation.events.map(event => [event.from, event.to, event.actor]), [
  [null, 'pending', 'guest'], ['pending', 'confirmed', 'system']
 ]);
 const retried = simulateReservationRequest(first.state, request, '2026-10-23T13:00:00.000Z');
 assert.equal(retried.state, first.state);
 assert.equal(retried.reservation, first.reservation);
 assert.throws(() => simulateReservationRequest(first.state, { ...request, listingKey: 'another-listing' }, '2026-10-23T13:00:00.000Z'),
  (error: unknown) => error instanceof ReservationSimulationError && error.code === 'invalid');
 assert.throws(() => simulateReservationRequest(first.state, { ...request, paymentTiming: 'later' }, '2026-10-23T13:00:00.000Z'),
  (error: unknown) => error instanceof ReservationSimulationError && error.code === 'invalid');
});

test('reservation simulator checks half-open overlaps and releases cancelled dates', () => {
 const request: SimulatedReservationRequest = {
  requestId: 'request-1', listingKey: 'listing-1', listingTitle: 'A stay', listingLocation: 'Kinshasa',
  imageUrl: '', guestUid: 'guest-1', checkIn: '2026-11-06', checkOut: '2026-11-08',
  adults: 1, children: 0, totalLabel: 'CDF 50,000', nightlyPriceCdf: 25000, paymentTiming: 'later'
 };
 const first = simulateReservationRequest(EMPTY_RESERVATION_SIMULATION, request, '2026-10-23T12:00:00.000Z');
 assert.throws(() => simulateReservationRequest(first.state, { ...request, requestId: 'request-2', checkIn: '2026-11-07', checkOut: '2026-11-09' }, '2026-10-23T12:01:00.000Z'),
  (error: unknown) => error instanceof ReservationSimulationError && error.code === 'unavailable');
 const adjacent = simulateReservationRequest(first.state, { ...request, requestId: 'request-3', checkIn: '2026-11-08', checkOut: '2026-11-09' }, '2026-10-23T12:01:00.000Z');
 assert.equal(adjacent.state.reservations.length, 2);
 const cancelled = simulateReservationTransition(first.state, request.requestId, 'cancelled_by_guest', 'guest', '2026-10-24T12:00:00.000Z');
 assert.equal(cancelled.reservations[0].events.at(-1)?.from, 'confirmed');
 assert.equal(cancelled.reservations[0].events.at(-1)?.actor, 'guest');
 const replacement = simulateReservationRequest(cancelled, { ...request, requestId: 'request-4' }, '2026-10-24T12:01:00.000Z');
 assert.equal(replacement.reservation.status, 'confirmed');
 assert.throws(() => simulateReservationTransition(cancelled, request.requestId, 'completed', 'system', '2026-10-24T12:02:00.000Z'),
  (error: unknown) => error instanceof ReservationSimulationError && error.code === 'transition');
});

test('reservation simulator rejects invalid requests before adding a record', () => {
 const request: SimulatedReservationRequest = {
  requestId: 'request-1', listingKey: 'listing-1', listingTitle: 'A stay', listingLocation: 'Kinshasa',
  imageUrl: '', guestUid: null, checkIn: '2026-11-08', checkOut: '2026-11-06',
  adults: 1, children: 0, totalLabel: 'CDF 50,000', nightlyPriceCdf: 25000, paymentTiming: 'now'
 };
 for (const invalid of [request, { ...request, checkIn: '2026-11-06', checkOut: '2026-11-08', adults: 0 },
  { ...request, checkIn: '2026-11-06', checkOut: '2026-11-08', nightlyPriceCdf: 0 },
  { ...request, checkIn: '2026-11-06', checkOut: '2026-11-08', adults: 2, guestCapacity: 1 }]) {
  assert.throws(() => simulateReservationRequest(EMPTY_RESERVATION_SIMULATION, invalid, '2026-10-23T12:00:00.000Z'),
   (error: unknown) => error instanceof ReservationSimulationError && error.code === 'invalid');
 }
 assert.equal(EMPTY_RESERVATION_SIMULATION.reservations.length, 0);
});

test('reservation simulator permits only the specified actor and status transitions', () => {
 const base: SimulatedReservationRequest = {
  requestId: 'request-1', listingKey: 'listing-1', listingTitle: 'A stay', listingLocation: 'Kinshasa',
  imageUrl: '', guestUid: 'guest-1', checkIn: '2026-11-06', checkOut: '2026-11-08',
  adults: 1, children: 0, totalLabel: 'CDF 50,000', paymentTiming: 'now'
 };
 const confirmed = simulateReservationRequest(EMPTY_RESERVATION_SIMULATION, base, '2026-10-23T12:00:00.000Z');
 assert.throws(() => simulateReservationTransition(confirmed.state, base.requestId, 'cancelled_by_host', 'guest', '2026-10-24T12:00:00.000Z'),
  (error: unknown) => error instanceof ReservationSimulationError && error.code === 'transition');
 const completed = simulateReservationTransition(confirmed.state, base.requestId, 'completed', 'system', '2026-11-09T12:00:00.000Z');
 assert.equal(completed.reservations[0].status, 'completed');
 assert.throws(() => simulateReservationTransition(completed, base.requestId, 'cancelled_by_guest', 'guest', '2026-11-10T12:00:00.000Z'),
  (error: unknown) => error instanceof ReservationSimulationError && error.code === 'transition');
 const pending = { reservations: [{ ...confirmed.reservation, status: 'pending' as const }] };
 assert.equal(simulateReservationTransition(pending, base.requestId, 'declined', 'host', '2026-10-24T12:00:00.000Z').reservations[0].status, 'declined');
 assert.equal(simulateReservationTransition(pending, base.requestId, 'expired', 'system', '2026-10-24T12:00:00.000Z').reservations[0].status, 'expired');
});

test('calendar date formatting preserves the selected day across viewer time zones', () => {
 assert.equal(formatCalendarDate('2026-11-06', 'en', { month: 'short', day: 'numeric', year: 'numeric' }), 'Nov 6, 2026');
 assert.equal(formatCalendarDate('2026-02-30', 'en'), '');
 assert.equal(formatCalendarDate('2026-11-06T00:00:00Z', 'en'), '');
});
