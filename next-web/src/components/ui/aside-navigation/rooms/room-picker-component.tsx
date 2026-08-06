"use client"

import {useRooms} from "@/hooks/useRooms";
import {useSearchParams} from "next/navigation";
import {SmileySadIcon} from "@phosphor-icons/react/ssr";
import Loader from "@/components/ui/shared/loader/loader";
import RoomCard from "@/components/ui/aside-navigation/rooms/room-card";
import {useCalendar} from "@/stores/calendar.store";
import {WishedCapacityFilter} from "@/components/ui/aside-navigation/rooms/wished-capacity-filter";
import dynamic from "next/dynamic";

const Pagination = dynamic(() => import("@/components/ui/shared/pagination/pagination"), {ssr: false})

export default function RoomPickerComponent() {
  const selectedRoomId = useCalendar(state => state.selectedRoomId)
  const setSelectedRoomId = useCalendar(state => state.setSelectedRoomId)

  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || ""
  const wishedCapacity = Number(searchParams.get("wishedCapacity")) || undefined

  const {data, error, loading} = useRooms({
    page,
    limit: 5,
    search,
    wishedCapacity
  })

  const handleOnRoomSelect = (roomId: number) => {
    setSelectedRoomId(roomId)
  }

  return (
    <div className="space-y-4 flex flex-col">
      <h3>Кімнати для бронювання</h3>

      {error &&
          <div className="flex flex-col justify-center items-center gap-2 text-sm mt-4 text-center text-foreground/60">
              <SmileySadIcon className="text-foreground/40" size={24} weight={"bold"}/>
            {error}
          </div>
      }

      <div>
        <WishedCapacityFilter/>
      </div>

      <div className="relative space-y-2 overflow-y-auto max-h-[min(30vh,28rem)] pr-1">
        {loading && <Loader/>}

        {data.items.length > 0 && data.items.map(room => (
          <RoomCard key={room.id} room={room} selectedRoomId={selectedRoomId} roomSelect={handleOnRoomSelect}/>
        ))}

        {data.items.length === 0 && !loading && (
          <div className="flex flex-col justify-center items-center gap-2 text-sm mt-4 text-center text-foreground/60">
            <SmileySadIcon className="text-foreground/40" size={24} weight={"bold"}/>
            Схоже, жодних кімнат за Вашим запитом не знайдено
          </div>
        )}
      </div>

      <div>
        <Pagination currentPage={page} totalItems={data.total} limit={5}/>
      </div>
    </div>
  )
}