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

  const isWithinBounds = now.hour >= hourStart && now.hour < hourEnd;
  if (!isWithinBounds) return null;

  const minutesFromStart = (now.hour - hourStart) * 60 + now.minute;
  const top = (minutesFromStart / 60) * hourHeight + headerHeight;

  return (
    <div
      className="absolute left-0 right-0 z-10 pointer-events-none flex items-center"
      style={{top}}
    >
      <div
        className="absolute flex h-3 w-[80px] items-center justify-end z-20 bg-surface-1"
      >
        <p className="bg-surface-1 pr-2 text-xs! font-medium text-lavender-500">
          {now.toFormat("HH:mm")}
        </p>
      </div>

      <div className="h-[2px] w-full rounded-full bg-lavender-600/60"/>
    </div>
  );
}