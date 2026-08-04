"use client"

import {useCalendar} from "@/stores/calendar.store";
import {capitalizeFirst} from "@/utils/capitalize-first";
import {useEffect, useMemo} from "react";
import {DateTime, Info} from "luxon";
import DayColumn from "@/components/ui/week-grid/day-column";

import dynamic from "next/dynamic";
import {useReservations} from "@/components/hooks/useReservations";
import TimeAxisWrapper from "@/components/ui/week-grid/time-axis-wrapper";

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
  useEffect(() => {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const now = DateTime.now();

    const kyivOffset = now.setZone("Europe/Kyiv").offset;
    const localOffset = now.setZone(zone).offset;
    const diffHours = (localOffset - kyivOffset) / 60;

    const mod24 = (h: number) => ((h + diffHours) % 24 + 24) % 24;

    const start = mod24(9);
    const end = mod24(19);

    setHourInterval(start, end);
  }, []);

  const {reservations, error} = useReservations();

  return (
    <div className="h-full flex flex-col">
      <p className="text-2xl! mb-4 font-medium px-4 shrink-0">
        {capitalizeFirst(monthLabel)} {currentDate.year}
      </p>
      <div className="min-h-0 flex-1 overflow-auto">

        <div className="grid grid-cols-[80px_repeat(7,1fr)] min-w-max relative">
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
            />
          ))}
        </div>
      </div>
    </div>
  )
}