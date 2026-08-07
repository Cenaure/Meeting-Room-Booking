"use server"

import createInstance from "@/utils/http";
import {parseApiError, success} from "@/lib/errors/api-errors-handler";
import {Reservation} from "@/models/reservation";
import {revalidateTag} from "next/cache";

interface CreateReservationDto {
  roomId: number;
  timeStart: string;
  timeEnd: string;
  title: string;
}

export const createSingleReservation = async (dto: CreateReservationDto) => {
  const instance = await createInstance();

  try {
    const {data} = await instance.post(`/reservations`, {
      room_id: dto.roomId,
      time_start: dto.timeStart,
      time_end: dto.timeEnd,
      title: dto.title,
    });

    revalidateTag(`reservations-room-${dto.roomId}`, "max")
    return success<Reservation>(data);
  } catch (error) {
    return parseApiError(error);
  }
};
