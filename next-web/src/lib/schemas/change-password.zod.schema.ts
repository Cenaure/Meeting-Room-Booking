import {z} from "zod";

export const changePasswordZodSchema = z
  .object({
    oldPassword: z.string().min(1, "Введіть поточний пароль"),
    newPassword: z.string().min(8, "Мінімум 8 символів"),
    confirmNewPassword: z.string().min(1, "Підтвердіть новий пароль"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Паролі не збігаються",
    path: ["confirmNewPassword"],
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: "Новий пароль має відрізнятись від поточного",
    path: ["newPassword"],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordZodSchema>;