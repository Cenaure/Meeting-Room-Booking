"use client"

import {Reservation} from "@/models/reservation";
import {DateTime} from "luxon";
import {BuildingsIcon, ClockIcon, RepeatIcon, XIcon,} from "@phosphor-icons/react/ssr";
import {useCalendar} from "@/stores/calendar.store";
import {useRouter} from "next/navigation";
import Button from "@/components/ui/_shared/button/button";
import Hint from "@/components/ui/_shared/hint/hint";
import {useCancelReservation} from "@/stores/cancel-reservation.store";

interface ReservationCardProps {
  reservation: Reservation;
}

export default function ReservationCard({reservation}: ReservationCardProps) {
  const setCurrentDate = useCalendar(state => state.setCurrentDate)
  const setSelectedDate = useCalendar(state => state.setSelectedDate)
  const router = useRouter();

  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const dateTimeStart = DateTime.fromISO(reservation.time_start).setZone(zone);
  const dateTimeEnd = DateTime.fromISO(reservation.time_end).setZone(zone);

  const isPast = dateTimeEnd < DateTime.now();

  const diffDays = dateTimeStart.diffNow("days").days;
  const dateDiffLabel = isPast
    ? ""
    : diffDays > 2
      ? `(Через ${Math.round(diffDays)} днів)`
      : `(Через ${Math.round(dateTimeStart.diffNow("hours").hours)} годин)`;

  const refToReservationDay = () => {
    setCurrentDate(dateTimeStart)
    setSelectedDate(dateTimeStart)
    router.back()
  }

  const setShow = useCancelReservation(state => state.setShow)
  const setReservation = useCancelReservation(state => state.setReservation)

  const handleCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setReservation(reservation);
    setShow(true);
  }

  return (
    <div
      className={`w-full max-w-md rounded-md border-2 p-2 transition-opacity cursor-pointer divide-y divide-lavender-400/20 
        border-lavender-400/60 bg-lavender-200/50 dark:bg-lavender-700/50`}
      onClick={refToReservationDay}
    >
      <div className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate font-semibold">{reservation.title}</p>

          {!isPast && <Hint content={"Скасувати"} position="right">
              <Button variant="ghost" size="auto" onClick={(e) => handleCancel(e)}
                      className="aspect-square w-6 hover:bg-red-500/10!">
                  <XIcon size={16} weight="bold" className="text-red-500"/>
              </Button>
          </Hint>}

        </div>

        <div
          className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-lavender-800/80 dark:text-lavender-200/80">
        <span className="flex items-center gap-1" suppressHydrationWarning>
          <ClockIcon size={12}/>
          {dateTimeStart.toFormat("HH:mm")} - {dateTimeEnd.toFormat("HH:mm")}
        </span>
          <span>{dateTimeStart.toFormat("dd.MM.yyyy")}</span>
          {dateDiffLabel}
          {reservation.reservation_series_id && (
            <span className="flex items-center gap-1">
            <RepeatIcon size={12}/>
            Серія
          </span>
          )}
        </div>
      </div>

      <div className="space-y-1 text-xs mt-2">
        {reservation.room && (
          <>
            <p className="flex items-center gap-1.5 truncate">
              <BuildingsIcon size={14} className="shrink-0 text-foreground/60"/>
              <span className="font-medium">Кімната: {reservation.room.title}</span>
              <span className="text-foreground/60">- {reservation.room.floor} поверх,</span>
              <span className="flex items-center gap-1.5 text-foreground/60">
                до {reservation.room.capacity} осіб
              </span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}