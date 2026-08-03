import EmailActivationAlert from "@/components/ui/profile/email-activation-alert";
import ChangePasswordComponent from "@/components/ui/profile/change-password";
import Button from "@/components/ui/shared/button/button";
import {SignInIcon, SignOutIcon} from "@phosphor-icons/react/ssr";
import logout from "@/app/(misc)/actions/user/logout";
import {User} from "@/models/user";
import {sign_in_route} from "@/lib/routes";
import {useRouter} from "next/navigation";
import {useModal} from "@/stores/modal.store";

export default function ProfileTab({user}: { user: User | null }) {
  const router = useRouter();
  const setClose = useModal(state => state.setClose)

  if (!user) return (
    <button
      className="border w-full text-lg py-2 pr-8 pl-4 rounded-md hover:bg-surface-2/40 text-left flex gap-2 items-center"
      onClick={() => router.replace(sign_in_route)}
    >
      <SignInIcon size={20} weight="bold" className="mr-2"/>
      <div>
        <p>Ви не авторизовані</p>
        <p>Створіть акаунт або увійдіть у свій</p>
      </div>
    </button>
  )

  const handleLogout = async () => {
    router.replace("/");
    setClose(true)
    setTimeout(() => {
      logout()
    }, 200)
  }

  return (
    <>
      <div>
        <h2 className="text-xl font-bold mb-4">Керування персональним акаунтом</h2>
        <p className="font-semibold">{user.username}</p>
        <p className="text-sm text-mauve-400">{user.email}</p>
      </div>

      {!user.is_activated && <EmailActivationAlert/>}

      {!user.google_id && <ChangePasswordComponent/>}

      <div className="pt-2 border-t border-border">
        <Button
          variant="destructive"
          type="button"
          onClick={handleLogout}
          className="gap-2"
        >
          <SignOutIcon size={18}/>
          Вийти з акаунту
        </Button>
      </div>
    </>
  )
}