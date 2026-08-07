"use client"

import {capitalizeFirst} from "@/utils/capitalize-first";
import {useMemo} from "react";
import {Info} from "luxon";

export default function CalendarWeekDayLabels() {
  const dayLabels = useMemo(() => Info.weekdays("short", {locale: "uk"}), []);

  return (
    <>
      {dayLabels.map((label) => (
        <div key={label} className="text-center text-xs text-foreground/60 mb-1">
          {capitalizeFirst(label)}
        </div>
      ))}
    </>
  )
}