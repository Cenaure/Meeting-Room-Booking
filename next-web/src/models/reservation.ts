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