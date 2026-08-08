"use client"

import {useEffect} from "react";
import {io, Socket} from "socket.io-client";
import getAccessToken from "@/utils/get-access-token";
import {Notification} from "@/models/notifications";
import {getUnreadNotifications} from "@/app/(misc)/actions/notifications/get-unread-notifications";
import handleNotification from "@/components/ui/notifications/handle-notification";

export default function Notifications() {

  // Real-time notifications
  useEffect(() => {
    let socket: Socket | null = null;
    let cancelled = false;

    (async () => {
      const accessToken = await getAccessToken();
      if (cancelled) return;

      socket = io(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
        auth: { token: accessToken },
        withCredentials: true,
        transports: ["websocket"],
      });

      socket.on("new", (notification: Notification) => {
        handleNotification(notification);
      });
    })();

    return () => {
      cancelled = true;
      socket?.disconnect();
    };
  }, []);

  // Load notifications that we might have missed,
  // We should get "reservation_ending_soon" notification even if it was sent 10 minutes before the next reservation,
  // and we opened an app 5 minutes before the next reservation
  useEffect(() => {
    async function load() {
      const response = await getUnreadNotifications()
      const unreadNotifications = response.ok ? response.data : [];

      for (const notification of unreadNotifications) await handleNotification(notification);
    }

    load()
  }, []);

  return null;
}