import {PlusIcon} from "@phosphor-icons/react/ssr";

export default function CreateReservationButton() {

  return (
    <div
      className="flex p-4 bg-surface-2 rounded-lg shadow-lg active:scale-90 transition-transform"
    >
      <PlusIcon size={24}/>
    </div>
  )
}