"use server"

import serverFetch from "@/utils/serverFetch";
import {Room} from "@/models/room";
import {parseApiError, success} from "@/lib/errors/api-errors-handler";

interface GetRoomsDto {
  page?: number;
  limit?: number;
  search?: string;
  wishedCapacity?: number;
}

export default async function getRooms({page, limit, search, wishedCapacity}: GetRoomsDto) {
  const params = new URLSearchParams({
    page: page?.toString() ?? "1",
    limit: limit?.toString() ?? "5",
    ...(search && {search}),
    ...(wishedCapacity && {wishedCapacity: wishedCapacity.toString()})
  });

  try {
    const result = await serverFetch<{ items: Room[], total: number }>(`/rooms?${params.toString()}`, {
      revalidate: 3600,
      tags: ["rooms"],
    });

    return success<{ items: Room[], total: number }>(result);
  } catch (error) {
    return parseApiError(error)
  }
}