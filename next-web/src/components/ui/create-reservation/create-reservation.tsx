"use client"

import {useCalendar} from "@/stores/calendar.store";
import {useCreateReservation} from "@/stores/create-reservation.store";
import CreateReservationTime from "@/components/ui/create-reservation/create-reservation-time";
import {ArrowsHorizontalIcon} from "@phosphor-icons/react/ssr";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {
  CreateReservationInput,
  CreateReservationOutput,
  createReservationZodSchema,
} from "@/lib/schemas/create-reservation.zod.schema";
import Button from "@/components/ui/_shared/button/button";
import TextInput from "@/components/ui/_shared/inputs/text-input";
import RadioGroup from "@/components/ui/_shared/inputs/radio-group";
import toast from "react-hot-toast";
import Toast from "@/components/ui/_shared/toast/toast";
import {DateTime} from "luxon";
import {createSingleReservation} from "@/app/(misc)/actions/reservations/createSingleReservation";
import React from "react";
import {capitalizeFirst} from "@/utils/capitalize-first";
import {createReservationSeries} from "@/app/(misc)/actions/reservations/createReservationSeries";

export default function CreateReservation() {
  const selectedRoom = useCalendar(state => state.selectedRoom)

  const timeStart = useCreateReservation(state => state.timeStart)
  const timeEnd = useCreateReservation(state => state.timeEnd)

  const refreshReservations = useCalendar(state => state.refreshReservations)

  const isInPast = timeStart ? timeStart.toMillis() < DateTime.now().toMillis() : false;

  const {
    register,
    handleSubmit,
    formState: {errors, isSubmitting},
    setError,
    clearErrors,
    reset
  } = useForm<CreateReservationInput, unknown, CreateReservationOutput>({
    resolver: zodResolver(createReservationZodSchema),
    defaultValues: {
      title: "",
      allow_partial: false
    }
  });

  async function onSubmit(values: CreateReservationOutput) {
    clearErrors();

    const isSingle = values.repeats === undefined;

    let result;
    if (isSingle) {
      result = await createSingleReservation({
        timeStart: timeStart?.setZone("UTC").toISO()!,
        timeEnd: timeEnd?.setZone("UTC").toISO()!,
        title: values.title,
        roomId: selectedRoom?.id || -1
      })
    } else {
      result = await createReservationSeries({
        timeStart: timeStart?.setZone("UTC").toISO()!,
        timeEnd: timeEnd?.setZone("UTC").toISO()!,
        title: values.title,
        roomId: selectedRoom?.id || -1,
        repeats: values.repeats!,
        allowPartial: values.allow_partial
      });
    }

    if (!result.ok) {
      setError("root", {message: result.message});
      return;
    }

    refreshReservations()

    toast.custom((t) => (
      <Toast t={t} title={"Бронювання успішно створено"} type={"success"} />
    ), {removeDelay: 200})

    reset()
  }

  return (
    <div className="space-y-4">
      <div>
        <h2>Бронювання кімнати</h2>
        <p className="text-foreground/60">Оберіть кімнату зліва та виділіть бажаний час на сітці</p>
      </div>

      {selectedRoom && timeStart && timeEnd && (
        <div className="overflow-y-auto px-px max-h-[calc(90vh)] space-y-4">
          <h6 className="font-medium">{capitalizeFirst(timeStart.toFormat("EEEE dd.MM.yyyy", {locale: "uk"}))}</h6>

          <div className="flex items-center gap-2 w-full">
            <CreateReservationTime value={timeStart}/>
            <ArrowsHorizontalIcon size={20} className="text-foreground/40"/>
            <CreateReservationTime value={timeEnd}/>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <TextInput
              label="Введіть назву бронювання"
              type="text"
              placeholder="Наприклад: обговорення бюджету"
              error={errors.title?.message}
              {...register("title")}
            />

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">
                  Повторюване бронювання
                </span>
                <span className="text-sm text-foreground/60">
                  Необов'язково. Залиште порожнім, щоб створити одне бронювання.
                </span>
              </div>

              <TextInput
                label="Кількість тижнів"
                type="number"
                min={1}
                max={12}
                placeholder="Напр. 4"
                className="w-full"
                error={errors.repeats?.message}
                {...register("repeats")}
              />


              <RadioGroup
                label="Якщо частина дат зайнята"
                options={[
                  {
                    value: "true",
                    label: "Створити на вільні дати",
                    description: "Зайняті тижні буде пропущено",
                  },
                  {
                    value: "false",
                    label: "Скасувати всю серію",
                    description: "Бронювання не буде створено взагалі",
                  },
                ]}
                error={errors.allow_partial?.message}
                {...register("allow_partial")}
              />
            </div>

            {isInPast && (
              <p className="text-red-500">Час який ви обрали - у минулому, будь ласка, оберіть коректний час для бронювання</p>
            )}
            {errors.root?.message && <p className="text-red-500 text-sm min-h-10 w-full">
              {errors.root?.message ?? " "}
            </p>}
            <Button
              type="submit"
              fullWidth
              loading={isSubmitting}
              disabled={isInPast}
            >
              Створити бронювання
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}