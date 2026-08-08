"use server"

import createInstance from "@/utils/http";
import {parseApiError, success} from "@/lib/errors/api-errors-handler";

// Unused, was initially supposed to be used in the dedicated page,
// but I have only implemented the toaster notification as we only have one type of notification
export async function markAllNotificationsAsRead(){
  const instance = await createInstance();

  try {
    const {data} = await instance.post(`/notifications/mark-all-as-read/`);
    return success(data);
  } catch (error) {
    return parseApiError(error);
  }
}
