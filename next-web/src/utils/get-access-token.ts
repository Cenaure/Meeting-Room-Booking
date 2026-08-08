"use server"

import {cookies} from "next/headers";

export default async function getAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value;
}