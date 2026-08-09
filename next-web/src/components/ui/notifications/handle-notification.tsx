import {Notification, NotificationType} from "@/models/notifications";
import toast from "react-hot-toast";
import Toast from "@/components/ui/_shared/toast/toast";
import {DateTime} from "luxon";
import {markNotificationAsRead} from "@/app/(misc)/actions/notifications/mark-notification-as-read";

export default async function handleNotification(notification: Notification) {
  switch (notification.type) {
    case NotificationType.ReservationEndingSoon:
      const freeBeforeDate = DateTime.fromISO(notification.body.free_before_date).toLocal();

      if (freeBeforeDate < DateTime.now())
        await markNotificationAsRead({notificationId: notification.id})

      toast.custom((t) => (
        <Toast
          t={t}
          title={"Ваше бронювання скоро завершиться"}
          message={`Зверніть увагу, що Ваше бронювання скоро завершиться, будь ласка, звільніть кімнату до ${freeBeforeDate.toFormat("HH:mm")}`}
          type={"warning"}
          invoke={() => markNotificationAsRead({notificationId: notification.id})}
        />
      ), {
        duration: Infinity,
        position: "bottom-center",
        removeDelay: 200
      })
      break;

    // Website as a server can be easily modified to handle any other type of notification
    // case NotificationType ... : ...
  }
}