import {useUser} from "@/stores/user.store";
import serverLogout from "@/app/(misc)/actions/user/server-logout";

const logout = async () => {
  const setUser = useUser.getState().setUser

  await serverLogout()

  setUser(null);
}

export default logout