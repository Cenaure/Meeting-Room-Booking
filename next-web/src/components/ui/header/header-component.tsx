"use client"

import {GearIcon, UserIcon} from "@phosphor-icons/react/ssr";
import ButtonLink from "@/components/ui/shared/button/button-link";
import {appearance_route, sign_in_route} from "@/lib/routes";
import {useUser} from "@/stores/user.store";
import AccountDropdown from "@/components/ui/header/account-dropdown";

export default function HeaderComponent() {
  const user = useUser((state) => state.user);
  const isLoaded = useUser((state) => state.isLoaded);

  return (
    <div className="py-1 flex justify-end space-x-2">
      {isLoaded && (!user
          ? <ButtonLink href={sign_in_route}><UserIcon size={18} weight="bold"/>Увійти до акаунту</ButtonLink>
          : <AccountDropdown user={user}/>
      )
      }

      <ButtonLink href={appearance_route} variant="ghost" size="auto" className="aspect-square w-8 group">
        <GearIcon size={20} weight="regular"
                  className="text-foreground/90 group-hover:rotate-90 duration-200 transition-all"/>
      </ButtonLink>
    </div>
  )
}