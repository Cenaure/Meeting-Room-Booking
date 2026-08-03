"use server"

import createInstance, {API_URL} from "@/utils/http";
import {failure, parseApiError, success} from "@/lib/errors/api-errors-handler";

export async function changePassword(
  oldPassword: string,
  newPassword: string,
) {
  try {
    const instance = await createInstance();
    const {data} = await instance.patch(`${API_URL}/auth/password`, {
      oldPassword,
      newPassword,
    });
    return success(data);
  } catch (error) {
    const errorMessage = parseApiError(error);
    return failure(errorMessage);
  }
}

export const resendActivation = async () => {
  try {
    const instance = await createInstance();
    const {data} = await instance.get(`${API_URL}/auth/activation-link`);
    return success(data);
  } catch (error) {
    const errorMessage = parseApiError(error);
    return failure(errorMessage);
  }
};