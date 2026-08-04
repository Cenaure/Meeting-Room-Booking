"use server"

import createInstance, {API_URL} from "@/utils/http";
import {User} from "@/models/user";
import {failure, parseApiError, success} from "@/lib/errors/api-errors-handler";

export const getMe = async () => {
  try {
    const instance = await createInstance();

    const {data} = await instance.get(`${API_URL}/auth/me`);
    return success<User>(data);
  } catch (error) {
    const errorMessage = parseApiError(error);
    return failure(errorMessage);
  }
};
