"use client"

import {useUser} from "@/stores/user.store";
import {GearIcon, GearSixIcon} from "@phosphor-icons/react/ssr";
import {useRouter} from "next/navigation";
import {appearance_route, profile_route, sign_in_route} from "@/lib/routes";
import Button from "@/components/ui/_shared/button/button";
import MyReservationsAsideButton from "@/components/ui/aside-navigation/my-reservations-button";

export default function MenuContent({onClose}: { onClose: () => void }) {
  const user = useUser(state => state.user);
  const isLoaded = useUser(state => state.isLoaded);

  const router = useRouter();

  const handleToProfile = () => {
    onClose()
    router.push(profile_route)
  }

  const handleToSignIn = () => {
    onClose()
    router.push(sign_in_route)
  }

  const handleToSettings = () => {
    onClose()
    router.push(appearance_route)
  }

  return (
    <div className="p-4 divide-y space-y-4">

      {user && (
        <div className="w-full p-2 bg-lavender-200/40 dark:bg-lavender-400/10 rounded-md flex items-center gap-2"
             onClick={handleToProfile}>
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full text-lavender-50 bg-lavender-500 font-semibold transition hover:bg-lavender-600">
            {user.username.charAt(0)}
          </span>
          <div className="flex flex-col justify-center gap-1 flex-1">
            <p className="text-xs! font-medium leading-[0.75rem]!">{user.username}</p>
            <p className="text-xs! leading-[0.75rem]! text-foreground/60">{user.email}</p>
          </div>
          <div className="w-4.5 h-4.5">
            <GearSixIcon size={18} weight="bold" className="text-foreground/60"/>
          </div>
        </div>
      )}

      {!user && isLoaded && (
        <>
          <Button fullWidth onClick={handleToSignIn}>
            Вхід до акаунту
          </Button>

          <p className="text-foreground/60">Увійдіть будь ласка до акаунту, щоб бронювати переговорні</p>
        </>
      )}

      {user && (
        <div className="border-t pt-4 space-y-2">
          <MyReservationsAsideButton/>

          <Button fullWidth variant="outline" className="font-normal!" onClick={handleToSettings}>
            <GearIcon size={18} className="mr-2"/>
            <p className="flex-1">Налаштування</p>
          </Button>
        </div>

      )}
    </div>
  )
}