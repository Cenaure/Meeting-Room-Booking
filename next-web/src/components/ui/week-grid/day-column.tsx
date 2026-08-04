import {useCalendar} from "@/stores/calendar.store";
import {capitalizeFirst} from "@/utils/capitalize-first";
import {DateTime, Info} from "luxon";

interface DayColumnProps {
  headerHeight: number;
  day: DateTime;
  hoursCount: number;
  hourHeight: number;
  hours: number[];
}

export default function DayColumn({
                                    day,
                                    headerHeight,
                                    hours,
                                    hourHeight,
                                    hoursCount,
                                  }: DayColumnProps) {
  const selectedDate = useCalendar(state => state.selectedDate);
  const setSelectedDate = useCalendar(state => state.setSelectedDate);

  return (
    <div
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
    </div>
  )
}