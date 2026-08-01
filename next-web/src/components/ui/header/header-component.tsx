import Button from "@/components/ui/shared/button/button";
import {GearIcon, UserIcon} from "@phosphor-icons/react/ssr";

export default function HeaderComponent() {

  return (
    <div className="py-1 flex justify-end">
      <Button>
        <UserIcon size={18} weight="bold"/>
        Увійти до акаунту
      </Button>

      <Button variant="ghost" size="auto" className="ml-2 aspect-square w-8 group">
        <GearIcon size={20} weight="regular"
                  className="text-foreground/90 group-hover:rotate-90 duration-200 transition-all"/>
      </Button>
    </div>
  )
}