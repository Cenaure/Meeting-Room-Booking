"use client"

import dynamic from "next/dynamic";
import Drawer from "@/components/ui/shared/drawer/drawer";
import Button from "@/components/ui/shared/button/button";
import {useState} from "react";
import {ListIcon} from "@phosphor-icons/react";
import MenuContent from "@/components/ui/header/mobile/menu-content";
import {useCalendar} from "@/stores/calendar.store";
import {Info} from "luxon";
import {capitalizeFirst} from "@/utils/capitalize-first";
import {CaretDownIcon} from "@phosphor-icons/react/ssr";
import MonthCalendarBody from "@/components/ui/aside-navigation/calendar/calendar-components/month-calendar-body";
import CalendarWeekDayLabels
  from "@/components/ui/aside-navigation/calendar/calendar-components/calendar-week-day-labels";

const GoToToday = dynamic(() => import("@/components/ui/header/mobile/go-to-today"), {ssr: false})

export default function MobileHeaderComponent() {
  const currentDate = useCalendar(state => state.currentDate);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  }

  return (
    <div className="flex flex-col gap-4 lg:hidden bg-surface-2 px-4 py-2 rounded-b-md mb-2">
      <div className="flex justify-between items-center">
        <div className="space-x-4 flex">
          <Button
            variant="ghost"
            size="auto"
            className="aspect-square w-8 flex justify-center items-center"
            onClick={() => setIsDrawerOpen(true)}
          >
            <ListIcon size={32} weight="bold"/>
          </Button>

          <div
            className={`flex items-center gap-1 rounded-md transition-colors px-2 ${isCalendarOpen && "bg-lavender-200/60 dark:bg-lavender-600/20"}`}
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
          >
            <h1 className="text-2xl! font-bold">
              {capitalizeFirst(Info.months("long", {locale: "uk"})[currentDate.month - 1])}
            </h1>

            <Button variant="ghost" size="auto">
              <CaretDownIcon size={14} weight="bold"
                             className={`${isCalendarOpen ? "-rotate-180" : ""} transition-all`}/>
            </Button>
          </div>
        </div>

        <div>
          <GoToToday/>
        </div>
      </div>

      {/*
        There is no animation on safari and firefox, because they don't support interpolate-size :(
        I'm to lazy to create a detached complicated component for it
      */}
      <div className="flex lg:hidden flex-col">
        <div
          className="grid grid-cols-7 overflow-hidden duration-300 ease-out transition-[height] h-5 data-[state=open]:h-auto
              supports-[not_(interpolate-size:allow-keywords)]:transition-none"
          data-state={isCalendarOpen ? "open" : "closed"}
        >
          <CalendarWeekDayLabels/>
          <MonthCalendarBody isMobile={true}/>
        </div>
      </div>

      {isDrawerOpen && (
        <Drawer side="left" onClose={handleDrawerClose}>
          <MenuContent onClose={handleDrawerClose}/>
        </Drawer>
      )}
    </div>
  )
}