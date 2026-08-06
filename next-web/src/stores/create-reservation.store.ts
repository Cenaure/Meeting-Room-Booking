import {create} from "zustand";
import {DateTime} from "luxon";

interface CreateReservationStore {
  timeStart: DateTime | null;
  setTimeStart: (time: DateTime | null) => void;

  timeEnd: DateTime | null;
  setTimeEnd: (time: DateTime | null) => void;
}

export const useCreateReservation = create<CreateReservationStore>((set) => ({
  timeStart: null,
  timeEnd: null,

  setTimeStart: (t: DateTime | null) => set({timeStart: t}),
  setTimeEnd: (t: DateTime | null) => set({timeEnd: t}),
}))