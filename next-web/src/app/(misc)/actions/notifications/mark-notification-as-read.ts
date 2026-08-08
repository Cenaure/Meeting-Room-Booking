"use server"

import createInstance from "@/utils/http";
import {parseApiError, success} from "@/lib/errors/api-errors-handler";

export async function markNotificationAsRead({notificationId}: { notificationId: string}){
  const instance = await createInstance();

  try {
    const {data} = await instance.post(`/notifications/mark-as-read/${notificationId}`);
    return success(data);
  } catch (error) {
    return parseApiError(error);
  }
}
