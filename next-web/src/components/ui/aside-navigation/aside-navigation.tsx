"use client"

import MonthCalendar from "@/components/ui/aside-navigation/calendar/month-calendar";
import Button from "@/components/ui/shared/button/button";
import {useAside} from "@/stores/aside.store";
import {SidebarSimpleIcon} from "@phosphor-icons/react/ssr";
import Hint from "@/components/ui/shared/hint/hint";
import MyReservationsAsideButton from "@/components/ui/aside-navigation/my-reservations-button";
import RoomPickerComponent from "@/components/ui/aside-navigation/rooms/room-picker-component";

export default function AsideNavigation() {
  const isActive = useAside(state => state.isActive);
  const setIsActive = useAside(state => state.setIsActive);

  return (
    <aside className={`bg-surface-0 space-y-2 pt-2 border-r px-4 w-70 h-full ${!isActive ? "hidden" : ""}`}>
      <Hint content={"Сховати"}>
        <Button variant="ghost" className="" onClick={() => setIsActive(false)}>
          <SidebarSimpleIcon size={18} weight="bold" className="text-foreground/60"/>
        </Button>
      </Hint>

      <MonthCalendar/>

      <MyReservationsAsideButton/>

      <div className="mt-6">
        <RoomPickerComponent/>
      </div>
    </aside>
  )
}