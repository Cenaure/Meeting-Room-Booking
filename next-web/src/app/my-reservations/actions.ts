"use server"

import {Reservation, ReservationFilters} from "@/models/reservation";
import createInstance from "@/utils/http";
import {parseApiError, success} from "@/lib/errors/api-errors-handler";
import {revalidatePath} from "next/cache";

interface GetMyReservationsDto {
  filter?: ReservationFilters,
  page?: number,
  limit?: number,
}

export async function getMyReservations({filter, page, limit}: GetMyReservationsDto) {
  const params = new URLSearchParams();

  if (filter)
    params.append("filter", filter);

  if (page)
    params.append("page", page.toString());

  if (limit)
    params.append("limit", limit.toString());

  const instance = await createInstance();

  try {
    const result = await instance.get(`/reservations/my?${params.toString()}`);
    return success<{ items: Reservation[], total: number }>(result.data);
  } catch (error) {
    return parseApiError(error);
  }
}

export async function cancelReservation(reservationId: string) {
  const instance = await createInstance();

  try {
    await instance.patch(`/reservations/cancel/${reservationId}`);
    revalidatePath("/my-reservations");
    return success(null);
  } catch (error) {
    return parseApiError(error);
  }
}