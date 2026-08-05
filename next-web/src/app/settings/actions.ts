"use server"

import createInstance from "@/utils/http";
import {parseApiError, success} from "@/lib/errors/api-errors-handler";

export async function changePassword(
  oldPassword: string,
  newPassword: string,
) {
  const instance = await createInstance();

  try {
    const {data} = await instance.patch(`/auth/password`, {
      oldPassword,
      newPassword,
    });
    return success(data);
  } catch (error) {
    return parseApiError(error);
  }
}

export const resendActivation = async () => {
  const instance = await createInstance();
  
  try {
    const {data} = await instance.get(`/auth/activation-link`);
    return success(data);
  } catch (error) {
    return parseApiError(error);
  }
};