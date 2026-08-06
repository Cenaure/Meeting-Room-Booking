"use client";

import Button from "@/components/ui/shared/button/button";
import {useCalendar} from "@/stores/calendar.store";
import {DateTime} from "luxon";

export default function GoToToday() {
  const currentDate = useCalendar((state) => state.currentDate);
  const setCurrentDate = useCalendar((state) => state.setCurrentDate);
  const setSelectedDate = useCalendar((state) => state.setSelectedDate);

  const now = DateTime.now();

  const dayDifference = currentDate
    .startOf("day")
    .diff(now.startOf("day"), "days").days;

  const isToday = dayDifference === 0;
  const isFuture = dayDifference > 0;
  const isPast = dayDifference < 0;

  const goToToday = () => {
    const today = DateTime.now();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  return (
    <Button
      variant="ghost"
      className="relative"
      size="auto"
      onClick={goToToday}
    >
      <div
        className={`z-20 flex aspect-square w-8 items-center justify-center rounded-md transition-colors ${
          isToday ? "bg-surface-0!" : "text-lavender-50 bg-lavender-300 dark:bg-lavender-500"
        }`}
      >
        {now.day}
      </div>

      <div
        className={`absolute inset-0 transition-all duration-300 inset-y-1 flex items-center justify-center rounded-md bg-lavender-400/40 dark:bg-lavender-700/80 p-1 ${
          isFuture ? "-left-1" : ""
        } ${isPast ? "-right-1" : ""}`}
      />
    </Button>
  );
}