"use client";
import {useEffect, useState} from "react";
import {DateTime} from "luxon";

interface CurrentTimeLineProps {
  hourStart: number;
  hourEnd: number;
  hourHeight: number;
  headerHeight: number;
}

export default function CurrentTimeLine({hourStart, hourEnd, hourHeight, headerHeight}: CurrentTimeLineProps) {
  const [now, setNow] = useState<DateTime>(DateTime.now());

  useEffect(() => {
    function update() {
      setNow(DateTime.now());
    }

    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, []);

  const nowMinutes = now.hour * 60 + now.minute;
  const startMinutes = hourStart * 60;
  const endMinutes = hourEnd * 60;

  const crossesMidnight = endMinutes <= startMinutes;

  const isWithinBounds = crossesMidnight
    ? nowMinutes >= startMinutes || nowMinutes < endMinutes
    : nowMinutes >= startMinutes && nowMinutes < endMinutes;

  if (!isWithinBounds) return null;

  const minutesFromStart = crossesMidnight
    ? nowMinutes >= startMinutes
      ? nowMinutes - startMinutes
      : 24 * 60 - startMinutes + nowMinutes
    : nowMinutes - startMinutes;

  const top = (minutesFromStart / 60) * hourHeight + headerHeight;

  return (
    <div
      className="absolute inset-x-0 z-10 flex items-center col-span-full"
      style={{top}}
    >
      <div
        className="absolute flex h-3 w-[60px] lg:w-[80px] items-center justify-end z-20 bg-surface-1"
      >
        <p className="bg-surface-1 pr-2 text-xs! font-medium text-lavender-500">
          {now.toFormat("HH:mm")}
        </p>
      </div>

      <div className="h-[2px] w-full rounded-full bg-lavender-600/60"/>
    </div>
  );
}