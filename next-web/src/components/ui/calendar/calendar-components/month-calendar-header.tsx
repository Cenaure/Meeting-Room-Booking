"use client"

import {useCalendar} from "@/stores/calendar.store";
import {DateTime, Info} from "luxon";
import {useEffect, useState} from "react";
import Button from "@/components/ui/shared/button/button";
import {capitalizeFirst} from "@/utils/capitalize-first";
import {ArrowUUpLeftIcon} from "@phosphor-icons/react";
import {CaretDownIcon, CaretUpIcon} from "@phosphor-icons/react/ssr";
import Hint from "@/components/ui/shared/hint/hint";

export default function MonthCalendarHeader() {
  const currentDate = useCalendar(state => state.currentDate);
  const setCurrentDate = useCalendar(state => state.setCurrentDate);

  const [monthLabel, setMonthLabel] = useState(Info.months("long", {locale: "uk"})[currentDate.month - 1]);

  const goToToday = () => {
    setCurrentDate(DateTime.now())
  }

  const goToNextMonth = () => {
    setCurrentDate(currentDate.plus({months: 1}))
  }

  const goToPrevMonth = () => {
    setCurrentDate(currentDate.minus({months: 1}))
  }

  useEffect(() => {
    setMonthLabel(Info.months("long", {locale: "uk"})[currentDate.month - 1]);
  }, [currentDate]);

  return (
    <div className="flex justify-between items-center">
      <p className="text-sm font-medium">{capitalizeFirst(monthLabel)} {currentDate.year}</p>

      <div>
        {!currentDate.hasSame(DateTime.now(), "month") && (
          <Hint content={"Повернутися до сьогодні"} position="top">
            <Button
              variant="ghost"
              size="sm"
              className="w-7 h-7 px-0!"
              onClick={goToToday}
            >
              <ArrowUUpLeftIcon size={16}/>
            </Button>
          </Hint>
        )}

        <Hint content={"Попередній місяць"} position="top">
          <Button
            variant="ghost"
            size="sm"
            className="w-7 h-7 px-0!"
            onClick={goToPrevMonth}
          >
            <CaretUpIcon size={16}/>
          </Button>
        </Hint>

        <Hint content={"Наступний місяць"} position="top">
          <Button
            variant="ghost"
            size="sm"
            className="w-7 h-7 px-0!"
            onClick={goToNextMonth}
          >
            <CaretDownIcon size={16}/>
          </Button>
        </Hint>
      </div>
    </div>
  )
}