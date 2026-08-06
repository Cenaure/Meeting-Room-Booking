import {ListMagnifyingGlassIcon} from "@phosphor-icons/react/ssr";

interface OpenRoomsDrawerButtonProps {
  setIsDrawerOpen: (isOpen: boolean) => void;
}

export default function OpenRoomsDrawerButton({setIsDrawerOpen}: OpenRoomsDrawerButtonProps) {

  return (
    <div
      className="flex p-4 bg-surface-2 rounded-lg shadow-lg active:scale-90 transition-transform"
      onClick={() => setIsDrawerOpen(true)}
    >
      <ListMagnifyingGlassIcon size={24}/>
    </div>
  )
}