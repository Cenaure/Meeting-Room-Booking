"use client";
import {DateTime} from "luxon";
import {useMemo} from "react";
import {useCalendar} from "@/stores/calendar.store";
import Button from "@/components/ui/_shared/button/button";
import CalendarWeekDayLabels
  from "@/components/ui/aside-navigation/calendar/calendar-components/calendar-week-day-labels";

interface CalendarDay {
  date: DateTime;
  isCurrentMonth: boolean;
}

export default function MonthCalendarBody({isMobile = false}: { isMobile?: boolean }) {
  const currentDate = useCalendar(state => state.currentDate);
  const setCurrentDate = useCalendar(state => state.setCurrentDate);
  // For wink animation
  const setSelectedDate = useCalendar(state => state.setSelectedDate);


  const now = DateTime.now();
  const thisWeekStart = useMemo(() => currentDate.startOf("week"), [currentDate]);

  const calendar = useMemo<CalendarDay[]>(() => {
    if (!currentDate) return [];

    const monthStart = currentDate.startOf("month");
    const gridStart = monthStart.startOf("week");
    const gridEnd = gridStart.plus({weeks: 6}).minus({days: 1});

    const days: CalendarDay[] = [];
    let cursor = gridStart;

    while (cursor <= gridEnd) {
      days.push({
        date: cursor,
        isCurrentMonth: cursor.hasSame(monthStart, "month"),
      });
      cursor = cursor.plus({days: 1});
    }

    return days;
  }, [currentDate]);

  function handleDayClick(date: DateTime) {
    setCurrentDate(date);
    setSelectedDate(date);
  }

  const commonDayClasses =
    "aspect-square flex items-center justify-center font-normal text-xs cursor-pointer select-none";
  const otherMonthDayClasses = "text-foreground/30";
  const todayClasses = "bg-lavender-300! text-lavender-50 font-medium ";
  const currentWeekRowClasses = "bg-lavender-200/60  dark:bg-lavender-600/20";

  return (
    <>
      {!isMobile && <CalendarWeekDayLabels/>}

      {calendar.map(({date, isCurrentMonth}) => {
        const isToday = date.hasSame(now, "day");
        const isInCurrentWeek = date.startOf("week").equals(thisWeekStart);

        return (
          <div
            key={date.toISODate()}
            className={isInCurrentWeek ? currentWeekRowClasses + " " + commonDayClasses : commonDayClasses}
          >
            <Button
              variant="ghost"
              size="auto"
              onClick={() => handleDayClick(date)}
              className={`w-full h-full hover:bg-lavender-200/60! dark:hover:bg-lavender-600/20!
                ${!isCurrentMonth && otherMonthDayClasses} 
                ${isToday && todayClasses} 
              `}
            >
              {date.day}
            </Button>
          </div>
        );
      })}
    </>
  );
}