"use server"

import createInstance from "@/utils/http";
import {parseApiError, success} from "@/lib/errors/api-errors-handler";
import {Notification} from "@/models/notifications";

export async function getUnreadNotifications(){
  const instance = await createInstance();

  try {
    const {data} = await instance.get(`/notifications/my`);
    return success<Notification[]>(data);
  } catch (error) {
    return parseApiError(error);
  }
}
