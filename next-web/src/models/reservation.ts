import {Room} from "@/models/room";

export const reservationStatuses = {
  cancelled: "cancelled",
  active: "active",
}
export type ReservationStatus = keyof typeof reservationStatuses

export type Reservation = {
  id: string;
  title: string
  reserved_by: number,
  reserver_username: string,
  room_id: number,
  time_start: string;
  time_end: string;
  created_at: string,
  status: ReservationStatus,
  reservation_series_id?: string,
  room?: Room
}

export const ReservationFilter = {
  PAST: "past",     // that are finished
  FUTURE: "future", // that are not finished yet
} as const
export type ReservationFilters = (typeof ReservationFilter)[keyof typeof ReservationFilter]