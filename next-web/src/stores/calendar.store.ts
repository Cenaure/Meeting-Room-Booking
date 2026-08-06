import {create} from "zustand";
import {DateTime} from "luxon";
import {Room} from "@/models/room";

interface CalendarStore {
  selectedRoom: Room | null;
  setSelectedRoom: (room: Room) => void;

  currentDate: DateTime;
  setCurrentDate: (date: DateTime) => void;

  selectedDate: DateTime | null;
  setSelectedDate: (date: DateTime | null) => void;

  hourStart: number;
  hourEnd: number;
  setHourInterval: (start: number, end: number) => void;
}

export const useCalendar = create<CalendarStore>((set) => ({
  selectedRoom: null,
  setSelectedRoom: (room: Room) => set({selectedRoom: room}),

  currentDate: DateTime.now().set({hour: 14}),
  setCurrentDate: (date: DateTime) => set({currentDate: date}),

  selectedDate: null,
  setSelectedDate: (date: DateTime | null) => set({selectedDate: date}),

  hourStart: 0,
  hourEnd: 0,
  setHourInterval: (start: number, end: number) => set({hourStart: start, hourEnd: end}),
}))
