import { countStayNights, quoteStay } from './pricing';

export type SimulatedReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'declined'
  | 'expired'
  | 'cancelled_by_guest'
  | 'cancelled_by_host'
  | 'completed';

export type SimulatedReservationActor = 'guest' | 'host' | 'system';
export type SimulatedPaymentTiming = 'now' | 'later';

export type SimulatedReservationRequest = {
  requestId: string;
  listingKey: string;
  listingTitle: string;
  listingLocation: string;
  imageUrl: string;
  guestUid: string | null;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  guestCapacity?: number;
  totalLabel: string;
  nightlyPriceCdf?: number;
  paymentTiming: SimulatedPaymentTiming;
};

export type SimulatedReservationEvent = {
  from: SimulatedReservationStatus | null;
  to: SimulatedReservationStatus;
  actor: SimulatedReservationActor;
  at: string;
};

export type SimulatedReservation = SimulatedReservationRequest & {
  nights: number;
  totalCdf: number | null;
  status: SimulatedReservationStatus;
  events: SimulatedReservationEvent[];
};

export type ReservationSimulationState = { reservations: SimulatedReservation[] };
export const EMPTY_RESERVATION_SIMULATION: ReservationSimulationState = { reservations: [] };

export class ReservationSimulationError extends Error {
  constructor(public readonly code: 'invalid' | 'unavailable' | 'transition') {
    super(code);
  }
}

const transitions: Record<SimulatedReservationStatus, Partial<Record<SimulatedReservationStatus, SimulatedReservationActor>>> = {
  pending: { confirmed: 'system', declined: 'host', expired: 'system' },
  confirmed: { cancelled_by_guest: 'guest', cancelled_by_host: 'host', completed: 'system' },
  declined: {},
  expired: {},
  cancelled_by_guest: {},
  cancelled_by_host: {},
  completed: {}
};

const overlaps = (first: { checkIn: string; checkOut: string }, second: { checkIn: string; checkOut: string }) =>
  first.checkIn < second.checkOut && second.checkIn < first.checkOut;

/** Pure, in-memory test operation. It never checks live availability or writes to Firestore. */
export function simulateReservationRequest(
  state: ReservationSimulationState,
  request: SimulatedReservationRequest,
  at: string
): { state: ReservationSimulationState; reservation: SimulatedReservation } {
  const existing = state.reservations.find(item => item.requestId === request.requestId);
  if (existing) {
    if (existing.listingKey !== request.listingKey || existing.checkIn !== request.checkIn || existing.checkOut !== request.checkOut ||
      existing.guestUid !== request.guestUid || existing.adults !== request.adults || existing.children !== request.children ||
      existing.guestCapacity !== request.guestCapacity ||
      existing.paymentTiming !== request.paymentTiming || existing.nightlyPriceCdf !== request.nightlyPriceCdf) {
      throw new ReservationSimulationError('invalid');
    }
    return { state, reservation: existing };
  }

  const nights = countStayNights(request.checkIn, request.checkOut);
  if (!request.requestId.trim() || !request.listingKey.trim() || !request.listingTitle.trim() ||
    !request.totalLabel.trim() || !nights || !Number.isInteger(request.adults) || request.adults < 1 ||
    !Number.isInteger(request.children) || request.children < 0 ||
    (request.guestCapacity !== undefined && (!Number.isInteger(request.guestCapacity) || request.guestCapacity < 1 || request.adults + request.children > request.guestCapacity)) ||
    !['now', 'later'].includes(request.paymentTiming)) {
    throw new ReservationSimulationError('invalid');
  }
  const quote = request.nightlyPriceCdf === undefined ? null : quoteStay(request.nightlyPriceCdf, nights);
  if (request.nightlyPriceCdf !== undefined && !quote) throw new ReservationSimulationError('invalid');

  if (state.reservations.some(item => item.listingKey === request.listingKey && item.status === 'confirmed' && overlaps(item, request))) {
    throw new ReservationSimulationError('unavailable');
  }

  const reservation: SimulatedReservation = {
    ...request,
    nights,
    totalCdf: quote?.total ?? null,
    status: 'confirmed',
    events: [
      { from: null, to: 'pending', actor: 'guest', at },
      { from: 'pending', to: 'confirmed', actor: 'system', at }
    ]
  };
  return { state: { reservations: [reservation, ...state.reservations] }, reservation };
}

export function simulateReservationTransition(
  state: ReservationSimulationState,
  requestId: string,
  to: SimulatedReservationStatus,
  actor: SimulatedReservationActor,
  at: string
): ReservationSimulationState {
  const current = state.reservations.find(item => item.requestId === requestId);
  if (!current || transitions[current.status][to] !== actor) throw new ReservationSimulationError('transition');
  return {
    reservations: state.reservations.map(item => item.requestId === requestId
      ? { ...item, status: to, events: [...item.events, { from: current.status, to, actor, at }] }
      : item)
  };
}
