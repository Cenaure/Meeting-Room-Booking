"use client"

import {GearIcon, SidebarSimpleIcon, UserIcon} from "@phosphor-icons/react/ssr";
import ButtonLink from "@/components/ui/shared/button/button-link";
import {appearance_route, sign_in_route} from "@/lib/routes";
import {useUser} from "@/stores/user.store";
import AccountDropdown from "@/components/ui/header/account-dropdown";
import {useAside} from "@/stores/aside.store";
import Hint from "@/components/ui/shared/hint/hint";
import Button from "@/components/ui/shared/button/button";

export default function HeaderComponent() {
  const user = useUser((state) => state.user);
  const isLoaded = useUser((state) => state.isLoaded);

  const isActive = useAside(state => state.isActive);
  const setIsActive = useAside(state => state.setIsActive);

  return (
    <div className="py-2 flex justify-between">
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
          <GearIcon size={20} weight="regular"
                    className="text-foreground/90 group-hover:rotate-90 duration-200 transition-all"/>
        </ButtonLink>
      </div>
    </div>
  )
}