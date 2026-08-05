"use client";
import {useEffect, useState} from "react";
import {useServerStatus} from "@/stores/server-status.store";
import {Room} from "@/models/room";
import getRooms from "@/app/(misc)/actions/rooms/getRooms";

interface UseRoomsParams {
  page: number;
  limit: number;
  search?: string;
  wishedCapacity?: number;
}

export function useRooms({page, limit, search, wishedCapacity}: UseRoomsParams) {
  const setIsDown = useServerStatus((state) => state.setIsDown);
  const [data, setData] = useState<{ items: Room[]; total: number }>({
    items: [],
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getRooms({page, limit, search, wishedCapacity})
      .then((result) => {
        if (cancelled) return;
        if (result.ok) {
          setData(result.data);
          setError(null);
        } else {
          if (result.isServerDown) setIsDown(true);
          setError(result.message);
        }
      })
      .catch(() => {
        if (!cancelled) setError("Не вдалося завантажити кімнати, спробуйте ще раз");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, limit, search, wishedCapacity, setIsDown]);

  return {data, loading, error};
}