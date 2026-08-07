import {Reservation} from "@/models/reservation";
import {create} from "zustand";

interface CancelReservationStore {
  reservation: Reservation | null
  show: boolean

  setReservation: (reservation: Reservation | null) => void
  setShow: (show: boolean) => void
}

export const useCancelReservation = create<CancelReservationStore>((set) => ({
  reservation: null,
  show: false,

  setReservation: (reservation) => set({reservation}),
  setShow: (show) => set({show}),
}))