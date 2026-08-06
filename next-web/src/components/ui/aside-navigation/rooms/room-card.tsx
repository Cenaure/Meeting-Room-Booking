import {Room} from "@/models/room";

interface RoomCardProps {
  room: Room;
  selectedRoomId: number | null;
  roomSelect: (roomId: number) => void;
}

export default function RoomCard({
                                   room,
                                   selectedRoomId,
                                   roomSelect,
                                 }: RoomCardProps) {
  return (
    <label className="block cursor-pointer">
      <input
        type="radio"
        value={room.id}
        checked={room.id === selectedRoomId}
        onChange={() => roomSelect(room.id)}
        className="sr-only peer"
      />

      <div
        className="
          w-full p-4 rounded-md border transition-colors bg-surface-1/40
          hover:border-lavender-300 hover:bg-lavender-500/10 dark:hover:border-lavender-600
          peer-checked:text-lavender-800 dark:peer-checked:text-lavender-50 peer-checked:bg-lavender-300 dark:peer-checked:bg-lavender-700/80
          peer-checked:hover:bg-lavender-300/90 dark:peer-checked:hover:bg-lavender-700/50
          peer-checked:border-lavender-400 dark:peer-checked:border-lavender-600
        "
      >
        <div className="flex items-baseline justify-between gap-2">
          <p className="font-medium">{room.title}</p>
          <span className="text-xs opacity-70">
            {room.floor} поверх
          </span>
        </div>

        <div className="mt-1 flex items-center gap-2 text-xs opacity-70">
          <span>Для {room.capacity} осіб,</span>
          <span>
            {room.working_hours_start.slice(0, 5)}-
            {room.working_hours_end.slice(0, 5)}
          </span>
        </div>
      </div>
    </label>
  );
}