import {DateTime} from "luxon";

export interface TimeAxisProps {
  hours: number[];
  hourHeight: number;
  headerHeight: number;
}

export default function TimeAxis({hours, hourHeight, headerHeight}: TimeAxisProps) {
  const timeZone = DateTime.local().toFormat("ZZZZ");

  return (
    <div className="sticky left-0 z-20 lg:z-0 lg:block">
      <div className="absolute lg:hidden inset-0 bg-surface-1 border-r -mr-[1px] "/>

      <div className="relative bg-surface-1">

        <span className="absolute right-2 text-xs text-foreground/50 select-none">
          {timeZone}
        </span>

        {hours.map((hour, index) => (
          <div
            key={hour}
            className="absolute right-2 -translate-y-1/2 text-xs text-foreground/50 select-none"
            style={{top: index * hourHeight + headerHeight}}
          >
            {hour}:00
          </div>
        ))}
      </div>

    </div>
  );
}