"use client";

import {DateTime} from "luxon";
import {useEffect} from "react";
import toast from "react-hot-toast";
import Toast from "@/components/ui/_shared/toast/toast";

export default function TimezoneDiffersToast() {

  useEffect(() => {
    if (localStorage.getItem("zone-dismiss") === "true") return;

    const localOffset = DateTime.local().toFormat("ZZZZ");
    const kyivOffset = DateTime.local()
      .setZone("Europe/Kyiv")
      .toFormat("ZZZZ");

    if (localOffset === kyivOffset) return;

    toast.custom(
      (t) => (
        <Toast t={t} title={"Часовий пояс відрізняється"} type={"default"} message={
          "Ваш часовий пояс відрізняється від часового поясу нашого офісу (Київ). " +
          "Усі дати й час автоматично відображаються у вашому локальному часовому поясі."
        } invoke={() => {localStorage.setItem("zone-dismiss", "true")}} />
      ),
      {
        position: "bottom-center",
        duration: Infinity,
        removeDelay: 200
      }
    );
  }, []);

  return null;
}