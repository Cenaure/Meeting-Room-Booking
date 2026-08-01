import {z} from "zod";

export const signInSchema = z.object({
  email: z.email({
    error: "Введіть коректну адресу електронної пошти",
  }),
  password: z
    .string()
    .nonempty({
      error: "Введіть пароль",
    })
    .min(8, {
      error: "Пароль повинен містити щонайменше 8 символів",
    })
    .max(72, {
      error: "Пароль не може містити більше ніж 72 символи",
    }),
});

export type SignInFormValues = z.infer<typeof signInSchema>;