"use client";

import {useEffect, useState} from "react";
import {Reservation} from "@/models/reservation";
import {useCalendar} from "@/stores/calendar.store";
import {getReservations} from "@/app/(misc)/actions/reservations/getReservations";
import {useServerStatus} from "@/stores/server-status.store";

export function useReservations() {
  const selectedRoomId = useCalendar(state => state.selectedRoomId);
  const currentDate = useCalendar(state => state.currentDate);
  const setIsDown = useServerStatus(state => state.setIsDown)

  const startDate = currentDate?.startOf("week").toISO();
  const endDate = currentDate?.endOf("week").toISO();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedRoomId || !startDate || !endDate) return;

    let cancelled = false;

    const timeout = setTimeout(() => {
      setLoading(true);
      setError(null);

      getReservations({
        roomId: selectedRoomId,
        startDate,
        endDate,
      }).then((result) => {
        if (cancelled) return;

        if (result.ok) {
          setReservations(result.data);
        } else {
          if (result.isServerDown)
            setIsDown(true);

          setError(result.message);
        }

        setLoading(false);
      });
    }, 100);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [selectedRoomId, startDate, endDate]);

  return {reservations, loading, error};
}