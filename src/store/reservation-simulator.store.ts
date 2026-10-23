import { create } from 'zustand';
import {
  EMPTY_RESERVATION_SIMULATION,
  simulateReservationRequest,
  simulateReservationTransition,
  type SimulatedReservation,
  type SimulatedReservationRequest
} from '@/domain/reservation-simulator';

type ReservationSimulatorStore = {
  reservations: SimulatedReservation[];
  submit: (request: SimulatedReservationRequest) => SimulatedReservation;
  cancel: (requestId: string) => void;
  reset: () => void;
};

/** Test-only state: it intentionally disappears on reload and never reaches Firebase or localStorage. */
export const useReservationSimulatorStore = create<ReservationSimulatorStore>((set, get) => ({
  reservations: [],
  submit: request => {
    const result = simulateReservationRequest(get(), request, new Date().toISOString());
    set({ reservations: result.state.reservations });
    return result.reservation;
  },
  cancel: requestId => {
    const result = simulateReservationTransition(get(), requestId, 'cancelled_by_guest', 'guest', new Date().toISOString());
    set({ reservations: result.reservations });
  },
  reset: () => set(EMPTY_RESERVATION_SIMULATION)
}));
