"use client";

import {DateTime} from "luxon";
import {useEffect} from "react";
import toast from "react-hot-toast";
import Button from "@/components/ui/_shared/button/button";
import {XIcon} from "@phosphor-icons/react/ssr";

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
        <div className={`flex max-w-lg items-start justify-between rounded-md border shadow-lg bg-surface-0 px-4 py-3 select-none
         ${t.visible
          ? "animate-in fade-in slide-in-from-bottom duration-300"
          : "animate-out fade-out slide-out-to-bottom duration-200"
        }`}
        >
          <div>
            <p className="text-sm font-medium">
              Часовий пояс відрізняється
            </p>

            <p className="mt-1 text-xs text-foreground/80">
              Ваш часовий пояс відрізняється від часового поясу нашого офісу
              (Київ). Усі дати й час автоматично відображаються у вашому
              локальному часовому поясі.
            </p>
          </div>

          <Button
            variant="ghost"
            onClick={() => {
              localStorage.setItem("zone-dismiss", "true");
              toast.dismiss(t.id)
            }}
          >
            <XIcon size={18}/>
          </Button>
        </div>
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