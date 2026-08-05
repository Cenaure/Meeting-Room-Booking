"use server";
import setTokenCookies from "@/lib/auth/set-token-cookies";
import {User} from "@/models/user";
import createInstance from "@/utils/http";
import {parseApiError, success} from "@/lib/errors/api-errors-handler";

export async function signUp(
  username: string,
  email: string,
  password: string
) {
  const instance = await createInstance();

  try {
    const response = await instance.post(`/auth/sign-up`, {username, email, password});
    if (response.data.accessToken) await setTokenCookies(response.data);

    return success<{ accessToken: string; refreshToken: string, user: User }>(response.data);
  } catch (error) {
    return parseApiError(error)
  }
}