"use server"

import createInstance, {API_URL} from "@/utils/http";
import {failure, parseApiError, success} from "@/lib/errors/api-errors-handler";

export async function activateEmail(activationLink: string) {
  const instance = await createInstance()

  try {
    const response = await instance.get(API_URL + "/auth/activate/" + activationLink);
    return success(response.data)
  } catch (error) {
    console.log(error)
    const message = parseApiError(error)
    return failure(message);
  }
}