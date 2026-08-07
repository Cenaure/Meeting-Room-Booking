"use client"

import {useCancelReservation} from "@/stores/cancel-reservation.store";
import {DateTime} from "luxon";
import Button from "@/components/ui/_shared/button/button";
import {XIcon} from "@phosphor-icons/react/ssr";
import {cancelReservation} from "@/app/my-reservations/actions";
import {useState} from "react";
import toast from "react-hot-toast";
import Toast from "@/components/ui/_shared/toast/toast";

export default function CancelReservationApproval() {
  const [isLoading, setIsLoading] = useState(false);

  const show = useCancelReservation(state => state.show);
  const setShow = useCancelReservation(state => state.setShow);

  const reservation = useCancelReservation(state => state.reservation);
  const setReservation = useCancelReservation(state => state.setReservation);

  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  if (!show || !reservation) return null;


  const dateTimeStart = DateTime.fromISO(reservation.time_start).setZone(zone);

  const handleClose = () => {
    setReservation(null)
    setShow(false)
  }

  const handleCancelReservation = async () => {
    setIsLoading(true)
    const response = await cancelReservation(reservation.id)

    if (!response.ok) {
      setIsLoading(false)
      toast.custom((t) => (
        <Toast t={t} title={"Виникла помилка"} message={response.message} type={"error"}/>
      ), {duration: 2000, position: "bottom-center", removeDelay: 200})
      return;
    }

    setIsLoading(false)
    setReservation(null)
    setShow(false)
    toast.custom((t) => (
      <Toast t={t} title={"Бронювання було успішно скасовано"} type={"success"}/>
    ), {duration: 2000, position: "bottom-center", removeDelay: 200})

  }

  return (
    <div
      className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-surface-0/50 backdrop-blur-sm z-80">
      <div className="bg-surface-0 p-4 rounded-md space-y-2 shadow-md ring-2 ring-border relative">
        <h2>Скасувати бронювання</h2>

        <Button
          variant="ghost"
          size="auto"
          className="absolute right-1 top-1 aspect-square w-8"
        >
          <XIcon size={18} onClick={handleClose}/>
        </Button>

        <div>
          <p>Ви впевнені, що хочете скасувати бронювання на <span
            className="text-lavender-300">{dateTimeStart.toFormat("HH:mm dd.MM.yyyy")}</span> ?</p>
          <p>Ця дія незворотня</p>
        </div>


        <div className="flex justify-end gap-2">
          <Button onClick={handleClose}>
            Ні, повернутися
          </Button>
          <Button variant="destructive" onClick={() => handleCancelReservation()} loading={isLoading}>
            Так, скасувати
          </Button>
        </div>

      </div>
    </div>
  )
}