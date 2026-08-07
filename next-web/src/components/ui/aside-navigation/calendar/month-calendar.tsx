import MonthCalendarHeader from "@/components/ui/aside-navigation/calendar/calendar-components/month-calendar-header";
import MonthCalendarBody from "@/components/ui/aside-navigation/calendar/calendar-components/month-calendar-body";

export default function MonthCalendar() {


  return (
    <div>
      <MonthCalendarHeader/>

      <div className="grid grid-cols-7">
        <MonthCalendarBody/>
      </div>
    </div>
  )
}