import {useUser} from "@/stores/user.store";
import {redirect} from "next/navigation";
import serverLogout from "@/app/(misc)/actions/user/server-logout";


const logout = async () => {
  const setUser = useUser.getState().setUser

  await serverLogout()

  setUser(null);

  return redirect("/")
}

export default logout