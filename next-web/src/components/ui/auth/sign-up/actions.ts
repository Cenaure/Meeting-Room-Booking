"use server";
import setTokenCookies from "@/lib/auth/set-token-cookies";
import {User} from "@/models/user";
import createInstance from "@/utils/http";
import {failure, parseApiError, success} from "@/lib/errors/api-errors-handler";

export async function signUp(
  username: string,
  email: string,
  password: string
) {
  try {
    const instance = await createInstance();
    const response = await instance.post(`/auth/sign-up`, {username, email, password});
    console.log(response.data)
    if (response.data.accessToken) await setTokenCookies(response.data);

    return success<{ accessToken: string; refreshToken: string, user: User }>(response.data);
  } catch (err: any) {
    const message = parseApiError(err)
    return failure(message);
  }
}