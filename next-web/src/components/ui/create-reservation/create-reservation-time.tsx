"use client"
import {DateTime} from "luxon";

interface TimePickerMenuProps {
  value: DateTime;
}

export default function CreateReservationTime({
                                         value,
                                       }: TimePickerMenuProps) {

  return (
    <div className="flex flex-col gap-1.5 flex-1">
      <div className="flex w-full items-center justify-between rounded-md border px-3 py-2">
        <p className="text-center w-full dark:text-lavender-50">
          {value.toFormat("HH:mm")}
        </p>
      </div>
    </div>
  );
}