"use server"

import {cookies} from "next/headers";
import COOKIE_BASE from "@/lib/auth/cookie-base";

export default async function setTokenCookies(data: { accessToken: string; refreshToken: string }) {
  const {accessToken, refreshToken} = data;
  const cookieStore = await cookies();
  // accessToken
  cookieStore.set({
    name: "access_token",
    value: accessToken,
    maxAge: 1800, // 30 m
    ...COOKIE_BASE,
  });

  // refreshToken
  cookieStore.set({
    name: "refresh_token",
    value: refreshToken,
    maxAge: 60 * 60 * 24 * 30, // 30 d
    ...COOKIE_BASE,
  });

  return
}