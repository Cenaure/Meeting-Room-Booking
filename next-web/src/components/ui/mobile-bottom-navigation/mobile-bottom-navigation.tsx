"use client"

import Drawer from "@/components/ui/_shared/drawer/drawer";
import {useState} from "react";
import RoomPickerComponent from "@/components/ui/aside-navigation/rooms/room-picker-component";
import OpenRoomsDrawerButton from "@/components/ui/mobile-bottom-navigation/open-rooms-drawer";
import CreateReservationButton from "@/components/ui/mobile-bottom-navigation/create-reservation-button";
import CreateReservation from "@/components/ui/create-reservation/create-reservation";

export default function MobileBottomNavigation() {
  const [isRoomDrawerOpen, setIsRoomDrawerOpen] = useState(false);
  const [isReservationDrawerOpen, setIsReservationDrawerOpen] = useState(false);


  return (
    <div className="fixed lg:hidden z-20 bottom-0 p-4 flex justify-between w-full">
      <OpenRoomsDrawerButton setIsDrawerOpen={setIsRoomDrawerOpen}/>

      <CreateReservationButton setIsDrawerOpen={setIsReservationDrawerOpen}/>


      {isRoomDrawerOpen && (
        <Drawer onClose={() => setIsRoomDrawerOpen(false)} side="right">
          <div className="p-4">
            <RoomPickerComponent/>
          </div>
        </Drawer>
      )}

      {isReservationDrawerOpen && (
        <Drawer onClose={() => setIsReservationDrawerOpen(false)} side="right">
          <div className="p-4">
            <CreateReservation />
          </div>
        </Drawer>
      )}
    </div>
  )
}