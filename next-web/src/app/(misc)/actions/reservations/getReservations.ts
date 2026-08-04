"use server";
import {Reservation} from "@/models/reservation";
import {parseApiError, success} from "@/lib/errors/api-errors-handler";
import serverFetch from "@/utils/serverFetch";

interface GetReservationsDto {
  roomId: number;
  startDate: string;
  endDate: string;
}

export async function getReservations(dto: GetReservationsDto) {
  try {
    const params = new URLSearchParams({
      room_id: dto.roomId.toString(),
      start_date: dto.startDate!,
      end_date: dto.endDate!,
    });

    const result = await serverFetch<Reservation[]>(`/reservations?${params.toString()}`, {
      revalidate: 3600,
      tags: ["reservations", `reservations-room-${dto.roomId}`],
    });

    return success<Reservation[]>(result);
  } catch (error) {
    return parseApiError(error);
  }
}