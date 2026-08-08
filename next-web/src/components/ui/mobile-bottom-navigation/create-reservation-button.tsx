import {PlusIcon} from "@phosphor-icons/react/ssr";

interface CreateReservationButtonProps {
  setIsDrawerOpen: (isOpen: boolean) => void;
}

export default function CreateReservationButton({setIsDrawerOpen}: CreateReservationButtonProps) {

  return (
    <div
      className="flex p-4 bg-surface-2 rounded-lg shadow-lg active:scale-90 transition-transform"
      onClick={() => setIsDrawerOpen(true)}
    >
      <PlusIcon size={24}/>
    </div>
  )
}