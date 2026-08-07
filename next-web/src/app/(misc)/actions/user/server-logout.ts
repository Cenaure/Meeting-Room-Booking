"use server"

import createInstance from "@/utils/http";
import {cookies} from "next/headers";

export default async function serverLogout() {
  "use server"

  const cookieStore = await cookies();

  const instance = await createInstance();

  await instance.post(`/auth/logout`);

  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");

  return
}