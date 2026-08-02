import {z} from "zod";

export const signUpSchema = z.object({
  username: z.string().min(2, {
    error: "Ім'я не може бути коротшим за 2 символи"
  }).max(32, {
    error: "Ім'я не може містити більше ніж 32 символи"
  }),
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
  confirmPassword: z.string().nonempty({
    error: "Підтвердіть пароль",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Паролі не співпадають",
  path: ["confirmPassword"],
});

export type SignUpFormValues = z.infer<typeof signUpSchema>;