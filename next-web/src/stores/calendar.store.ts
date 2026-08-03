import {create} from "zustand";
import {DateTime} from "luxon";

interface CalendarStore {
  currentDate: DateTime;
  setCurrentDate: (date: DateTime) => void;
}

export const useCalendar = create<CalendarStore>((set) => ({
  currentDate: DateTime.local(),
  setCurrentDate: (date: DateTime) => set({currentDate: date}),
}))
