import {CircleNotchIcon} from "@phosphor-icons/react/ssr";

export default function Loader() {

  return (
    <div className="flex w-full h-full items-center justify-center">
      <CircleNotchIcon size={24} weight="bold" className="animate-spin"/>
    </div>
  )
}