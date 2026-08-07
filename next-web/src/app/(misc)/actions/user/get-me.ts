"use server"

import createInstance from "@/utils/http";
import {User} from "@/models/user";
import {parseApiError, success} from "@/lib/errors/api-errors-handler";

export const getMe = async () => {
  const instance = await createInstance();

  try {
    const {data} = await instance.get(`/auth/me`);
    return success<User>(data);
  } catch (error) {
    return parseApiError(error);
  }
};
