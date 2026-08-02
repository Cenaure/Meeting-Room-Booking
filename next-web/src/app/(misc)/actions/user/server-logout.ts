"use server"

import createInstance, {API_URL} from "@/utils/http";
import {cookies} from "next/headers";

export default async function serverLogout() {
  "use server"

  const cookieStore = await cookies();
  const instance = await createInstance();

  await instance.post(`${API_URL}/auth/logout`);

  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");

  return
}