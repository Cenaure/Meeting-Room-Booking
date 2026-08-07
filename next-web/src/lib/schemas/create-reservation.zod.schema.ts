import {z} from "zod";

// is used both for single reservations and reservation series
export const createReservationZodSchema = z
  .object({
    title: z.string().min(1, "Введіть, будь ласка, назву бронювання").max(100, "Введіть коротшу назву"),
    repeats: z
      .string()
      .transform((v) => (v === "" ? undefined : Number(v)))
      .pipe(
        z
          .number({ error: "Вкажіть число" })
          .int({ error: "Вкажіть ціле число" })
          .min(2, { error: "Вкажіть щонайменше 2 тижні" })
          .max(12, { error: "Бронювання не можна повторити більше ніж на 12 тижнів" })
          .optional(),
      ),
    allow_partial: z.coerce.boolean().default(false),
  })

export type CreateReservationInput = z.input<typeof createReservationZodSchema>;
export type CreateReservationOutput = z.output<typeof createReservationZodSchema>;