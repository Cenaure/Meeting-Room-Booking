"use client"

import Drawer from "@/components/ui/_shared/drawer/drawer";
import {useState} from "react";
import RoomPickerComponent from "@/components/ui/aside-navigation/rooms/room-picker-component";
import OpenRoomsDrawerButton from "@/components/ui/mobile-bottom-navigation/open-rooms-drawer";
import CreateReservationButton from "@/components/ui/mobile-bottom-navigation/create-reservation-button";

export default function MobileBottomNavigation() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  }

  return (
    <div className="fixed lg:hidden z-20 bottom-0 p-4 flex justify-between w-full">
      <OpenRoomsDrawerButton setIsDrawerOpen={setIsDrawerOpen}/>

      <CreateReservationButton/>


      {isDrawerOpen && (
        <Drawer onClose={handleDrawerClose} side="right">
          <div className="p-4">
            <RoomPickerComponent/>
          </div>
        </Drawer>
      )}
    </div>
  )
}