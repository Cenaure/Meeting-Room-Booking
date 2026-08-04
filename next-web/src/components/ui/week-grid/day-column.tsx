import {useCalendar} from "@/stores/calendar.store";
import {capitalizeFirst} from "@/utils/capitalize-first";
import {DateTime, Info} from "luxon";
import ReservationBlock from "@/components/ui/week-grid/reservation-block";
import {Reservation} from "@/models/reservation";
import {useEffect, useRef} from "react";

interface DayColumnProps {
  headerHeight: number;
  day: DateTime;
  hoursCount: number;
  hourHeight: number;
  hours: number[];
  reservations: Reservation[];
}

export default function DayColumn({
                                    day,
                                    headerHeight,
                                    hours,
                                    hourHeight,
                                    hoursCount,
                                    reservations,
                                  }: DayColumnProps) {
  const selectedDate = useCalendar(state => state.selectedDate);
  const setSelectedDate = useCalendar(state => state.setSelectedDate);

  const columnRef = useRef<HTMLDivElement>(null);
  const isSelected = !!selectedDate && day.startOf("day").equals(selectedDate.startOf("day"));

  const dayReservations = reservations.filter((reservation) =>
    DateTime.fromISO(reservation.time_start).hasSame(day, "day")
  );

  // On mobile devices scrolls to this day when selected
  useEffect(() => {
    if (isSelected) {
      columnRef.current?.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [isSelected]);

  return (
    <div
      ref={columnRef}
      className={`flex flex-col relative`}
    >
      <div className={`absolute inset-0 z-2 rounded-lg
          ${selectedDate && day.startOf("day").equals(selectedDate.startOf("day")) && "rounded-md animate-wink"}
        `}
           onAnimationEnd={() => setSelectedDate(null)}
      >
      </div>

      <div
        className={`flex items-center justify-center text-xs text-foreground/60 select-none shrink-0`}
        style={{height: headerHeight + `px`}}
      >
        {capitalizeFirst(Info.weekdays("short", {locale: "uk"})[day.weekday - 1])}{" "}{day.day}
      </div>

      <div
        className="border-l flex flex-col relative"
        style={{height: (hoursCount - 1) * hourHeight + "px"}}
      >
        {hours.map((hour, index) => (
          <div
            key={hour}
            className="absolute left-0 right-0 border-t "
            style={{top: index * hourHeight}}
          />
        ))}
      </div>

      {dayReservations.map((reservation) => (
        <ReservationBlock
          key={reservation.id}
          reservation={reservation}
          hourHeight={hourHeight}
          headerHeight={headerHeight}
          gridStart={hours[0]}
        />
      ))}
    </div>
  )
}