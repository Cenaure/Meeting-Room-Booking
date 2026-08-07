"use client"

import {useCalendar} from "@/stores/calendar.store";
import {capitalizeFirst} from "@/utils/capitalize-first";
import {useEffect, useMemo} from "react";
import {DateTime, Info} from "luxon";
import DayColumn from "@/components/ui/week-grid/day-column";

import dynamic from "next/dynamic";
import {useReservations} from "@/hooks/use-reservations";
import TimeAxisWrapper from "@/components/ui/week-grid/time-axis-wrapper";
import {useCreateReservation} from "@/stores/create-reservation.store";
import useIntervalSelection from "@/hooks/use-interval-selection";

const CurrentTimeLine = dynamic(
  () => import("@/components/ui/week-grid/current-time-line"), {ssr: false}
)

const HOUR_PX = 74;
const HEADER_HEIGHT = 26;

export default function WeekGrid() {
  const currentDate = useCalendar(state => state.currentDate);

  const hourStart = useCalendar(state => state.hourStart);
  const hourEnd = useCalendar(state => state.hourEnd);
  const setHourInterval = useCalendar(state => state.setHourInterval);

  const selectedRoom = useCalendar(state => state.selectedRoom);

  const hours = useMemo(() => {
    const length = hourEnd > hourStart
      ? hourEnd - hourStart + 1
      : (24 - hourStart) + hourEnd;
    return Array.from({length}, (_, i) => (hourStart + i) % 24);
  }, [hourStart, hourEnd]);

  const thisWeekStart = useMemo(() => currentDate.startOf("week"), [currentDate]);
  const thisWeekEnd = useMemo(() => currentDate.endOf("week"), [currentDate]);
  const days = Array.from({length: thisWeekEnd.diff(thisWeekStart, "days").days + 1}, (_, i) => thisWeekStart.plus({days: i}));

  const monthLabel = useMemo(() => Info.months("long", {locale: "uk"})[currentDate.month - 1], [currentDate]);

  // Sets the start and end hours for the user's timezone
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    const now = DateTime.now();

    const kyivOffset = now.setZone("Europe/Kyiv").offset;
    const localOffset = now.setZone(zone).offset;
    const diffHours = (localOffset - kyivOffset) / 60;

    const mod24 = (h: number) => ((h + diffHours) % 24 + 24) % 24;

    const selectedRoomStart = Number(selectedRoom?.working_hours_start.split(":")[0])
    const selectedRoomEnd = Number(selectedRoom?.working_hours_end.split(":")[0])

    const start = mod24(selectedRoomStart || 9);
    const end = mod24(selectedRoomEnd || 19);

    setHourInterval(start, end);
  }, [selectedRoom]);

  const {reservations, error} = useReservations();


  //region: # Selection
  const setTimeStart = useCreateReservation(state => state.setTimeStart);
  const setTimeEnd = useCreateReservation(state => state.setTimeEnd);

  const isIntervalBlocked = (index: number, day: DateTime) => {
    const found = reservations.find(r => {
      const timeStart = DateTime.fromISO(r.time_start).setZone(zone);
      const timeEnd = DateTime.fromISO(r.time_end).setZone(zone);

      const indexTime = timeStart.startOf("day").plus({minutes: index * 30 + hourStart * 60});

      return (timeStart > day.startOf("day") && timeEnd < day.endOf("day")) && (indexTime >= timeStart && indexTime < timeEnd);
    })

    return found !== undefined;
  }

  const onSelectionClear = () => {
    setTimeStart(null);
    setTimeEnd(null);
  }

  const selection = useIntervalSelection({
    hoursCount: hours.length - 1,
    hourHeight: HOUR_PX,
    headerHeight: HEADER_HEIGHT,
    hourStart: hours[0],
    isIntervalBlocked,
    onClear: onSelectionClear
  })
  //endregion: # Selection

  return (
    <div className="h-full flex flex-col">
      <p className="text-2xl! mb-4 font-medium px-4 shrink-0 hidden lg:block">
        {capitalizeFirst(monthLabel)} {currentDate.year}
      </p>

      <div className="min-h-0 flex-1 overflow-auto">
        <div
          className="grid
                    grid-cols-[60px_repeat(7,calc((100vw-60px)/2))]
                    md:grid-cols-[60px_repeat(7,calc((100vw-60px)/4))]
                    lg:grid-cols-[80px_repeat(7,1fr)]
                    min-w-max relative
                    pb-25 lg:pb-0
          ">
          <CurrentTimeLine hourStart={hourStart} hourEnd={hourEnd} hourHeight={HOUR_PX} headerHeight={HEADER_HEIGHT}/>

          <TimeAxisWrapper hours={hours} hourHeight={HOUR_PX} headerHeight={HEADER_HEIGHT}/>

          {days.map((day) => (
            <DayColumn
              key={day.toISODate()}
              day={day}
              headerHeight={HEADER_HEIGHT}
              hoursCount={hours.length}
              hourHeight={HOUR_PX}
              hours={hours}
              reservations={reservations}
              selection={selection}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
