"use client"

import {CaretLeftIcon, CaretRightIcon, GearIcon, SidebarSimpleIcon, UserIcon} from "@phosphor-icons/react/ssr";
import ButtonLink from "@/components/ui/shared/button/button-link";
import {appearance_route, sign_in_route} from "@/lib/routes";
import {useUser} from "@/stores/user.store";
import AccountDropdown from "@/components/ui/header/desktop/account-dropdown";
import {useAside} from "@/stores/aside.store";
import Hint from "@/components/ui/shared/hint/hint";
import Button from "@/components/ui/shared/button/button";
import {useCalendar} from "@/stores/calendar.store";

export default function HeaderComponent() {
  const user = useUser(state => state.user);
  const isLoaded = useUser(state => state.isLoaded);

  const setCurrentDate = useCalendar(state => state.setCurrentDate)
  const currentDate = useCalendar(state => state.currentDate)

  const isActive = useAside(state => state.isActive);
  const setIsActive = useAside(state => state.setIsActive);

  const goToNextWeek = () => {
    setCurrentDate(currentDate.plus({week: 1}))
  }

  const goToPrevWeek = () => {
    setCurrentDate(currentDate.minus({week: 1}))
  }

  return (
    <div className="py-2 hidden lg:flex justify-between">
      <div>
        {!isActive && (
          <Hint content={"Сховати"}>
            <Button variant="ghost" className="" onClick={() => setIsActive(true)}>
              <SidebarSimpleIcon size={18} weight="bold" className="text-foreground/60"/>
            </Button>
          </Hint>
        )}

      </div>

      <div className="space-x-2 flex">
        {isLoaded && (!user
            ? <ButtonLink href={sign_in_route}><UserIcon size={18} weight="bold"/>Увійти до акаунту</ButtonLink>
            : <AccountDropdown user={user}/>
        )}

        <ButtonLink href={appearance_route} variant="ghost" size="auto" className="aspect-square w-8 group">
          <GearIcon size={18} weight="regular"
                    className="text-foreground/90 group-hover:rotate-90 duration-200 transition-all"/>
        </ButtonLink>


        <div>
          <Hint content={"Попередній тиждень"}>
            <Button
              variant="ghost"
              size="auto"
              className="aspect-square w-8 text-foreground/90"
              onClick={goToPrevWeek}
            >
              <CaretLeftIcon size={16} weight="bold"/>
            </Button>
          </Hint>
          <Hint content={"Наступний тиждень"}>
            <Button
              variant="ghost"
              size="auto"
              className="aspect-square w-8 text-foreground/90"
              onClick={goToNextWeek}
            >
              <CaretRightIcon size={16} weight="bold"/>
            </Button>
          </Hint>
        </div>

      </div>
    </div>
  )
}