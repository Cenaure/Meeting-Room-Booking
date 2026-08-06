import {useCalendar} from "@/stores/calendar.store";
import {capitalizeFirst} from "@/utils/capitalize-first";
import {DateTime, Info} from "luxon";
import ReservationBlock from "@/components/ui/week-grid/reservation-block";
import {Reservation} from "@/models/reservation";
import {useEffect, useRef} from "react";
import {Draft} from "@/hooks/use-interval-selection";
import {useIntervalDrag} from "@/hooks/use-interval-drag";

interface DayColumnProps {
  headerHeight: number;
  day: DateTime;
  hoursCount: number;
  hourHeight: number;
  hours: number[];
  reservations: Reservation[];
  selection: {
    draft: Draft | null,
    startSelection: (y: number, day: DateTime) => void,
    expandSelection: (y: number, day: DateTime) => void,
    clearSelection: () => void,
  }
}

export default function DayColumn({
                                    day,
                                    headerHeight,
                                    hours,
                                    hourHeight,
                                    hoursCount,
                                    reservations,
                                    selection,
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

  //region: # Selection Rectangle
  const { isDragging, handlers } = useIntervalDrag(
    columnRef,
    (y) => selection.startSelection(y, day),
    (y) => selection.expandSelection(y, day),
  );

  const isActive = selection.draft?.day.equals(day);

  const formatDraftTime = (draft: Draft) => {
    const length = draft.endIndex - draft.startIndex + 1;

    const start = draft.day.startOf("day").plus({
      minutes: hours[0] * 60 + draft.startIndex * 30,
    });
    const end = start.plus({ minutes: length * 30 });

    return `${start.toFormat("HH:mm")} - ${end.toFormat("HH:mm")}`;
  }
  //region: # Selection Rectangle

  return (
    <div
      ref={columnRef}
      className={`flex flex-col relative ${isDragging ? "touch-none" : ""}`}
      {...handlers}
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

      {isActive && (
        <div
          className="absolute inset-x-2 z-10 rounded-md pointer-events-none
                     bg-lavender-500/25 border-2 border-lavender-300 dark:border-lavender-500"
          style={{
            top: headerHeight + selection.draft!.startIndex * (hourHeight / 2),
            height: (selection.draft!.endIndex - selection.draft!.startIndex + 1) * (hourHeight / 2),
          }}
        >
          <span className="p-2 text-xs font-medium text-lavender-700/80 dark:text-lavender-200/80 select-none">
            {formatDraftTime(selection.draft!)}
          </span>
        </div>
      )}
    </div>
  )
}