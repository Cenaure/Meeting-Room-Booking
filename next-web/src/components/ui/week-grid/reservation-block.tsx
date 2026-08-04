"use client"

import {Reservation} from "@/models/reservation";
import {DateTime} from "luxon";
import {useUser} from "@/stores/user.store";

interface ReservationBlockProps {
  hourHeight: number;
  headerHeight: number;
  gridStart: number;
  reservation: Reservation;
}

export default function ReservationBlock({reservation, hourHeight, gridStart, headerHeight}: ReservationBlockProps) {
  if (reservation.status !== "active") return null;
  const user = useUser(state => state.user);

  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const dateTimeStart = DateTime.fromISO(reservation.time_start).setZone(zone);
  const dateTimeEnd = DateTime.fromISO(reservation.time_end).setZone(zone);

  const hoursStart = dateTimeStart.hour + dateTimeStart.minute / 60;
  const hoursEnd = dateTimeEnd.hour + dateTimeEnd.minute / 60;

  // when grid start is on the previous day
  const convertedHoursStart =
    hoursStart + gridStart <= 24 ? hoursStart - gridStart : 24 - gridStart + hoursStart;

  // handle reservations that cross midnight
  const convertedHoursEnd = hoursEnd >= hoursStart ? hoursEnd : hoursEnd + 24;

  const top = convertedHoursStart * hourHeight + headerHeight;
  const height = (convertedHoursEnd - hoursStart) * hourHeight;

  const timeLabel = `${dateTimeStart.toFormat("HH:mm")} - ${dateTimeEnd.toFormat("HH:mm")}`;

  const isUser = user?.user_id == reservation.reserved_by;

  return (
    <div
      className={`absolute z-10 inset-x-2 flex flex-col overflow-hidden rounded-md border-2 px-2 py-1 select-none 
        ${isUser ? "border-lavender-400/60 bg-lavender-200/50 dark:bg-lavender-700/50" : "border-border bg-surface-2/80 dark:bg-surface-2/20"}`
      }
      style={{top, height: `${height}px`}}
      title={`${reservation.title}\n${timeLabel}\n${reservation.reserver_username}`}
    >
      <p className="truncate font-medium text-lavender-800 dark:text-lavender-300">
        {reservation.title}
      </p>
      {height > 40 && (
        <>
          <p className="truncate text-xs! text-foreground/60 dark:text-foreground/60">
            {timeLabel}
          </p>
          <p className="truncate ">
            {reservation.reserver_username} {isUser && "(Ви)"}
          </p>
        </>
      )}
    </div>
  );
}