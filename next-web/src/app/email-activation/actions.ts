"use server"

import createInstance from "@/utils/http";
import {parseApiError, success} from "@/lib/errors/api-errors-handler";

export async function activateEmail(activationLink: string) {
  const instance = await createInstance()

  try {
    const response = await instance.get("/auth/activate/" + activationLink);
    return success(response.data)
  } catch (error) {
    return parseApiError(error)
  }
}