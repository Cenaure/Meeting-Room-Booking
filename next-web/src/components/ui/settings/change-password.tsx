"use client"

import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import Button from "@/components/ui/_shared/button/button";
import TextInput from "@/components/ui/_shared/inputs/text-input";
import {ChangePasswordFormValues, changePasswordSchema} from "@/lib/schemas/change-password.schema";
import {changePassword} from "@/app/settings/actions";

export default function ChangePasswordComponent() {
  const {
    register,
    handleSubmit,
    reset,
    formState: {errors, isSubmitting},
    setError,
    clearErrors,
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  async function onSubmit(values: ChangePasswordFormValues) {
    clearErrors();

    const result = await changePassword(values.oldPassword, values.newPassword);

    if (!result.ok) {
      setError("root", {message: result.message});
      return;
    }

    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-1">
      <h2 className="font-semibold">Зміна паролю</h2>

      <TextInput
        label="Поточний пароль"
        type="password"
        placeholder="******"
        {...register("oldPassword")}
        error={errors.oldPassword?.message}
      />

      <TextInput
        label="Новий пароль"
        type="password"
        placeholder="******"
        {...register("newPassword")}
        error={errors.newPassword?.message}
      />

      <TextInput
        label="Підтвердіть новий пароль"
        type="password"
        placeholder="******"
        {...register("confirmNewPassword")}
        error={errors.confirmNewPassword?.message}
      />

      <p className="text-red-500 text-sm min-h-6 w-full">
        {errors.root?.message ?? " "}
      </p>

      <Button type="submit" loading={isSubmitting}>
        Зберегти новий пароль
      </Button>
    </form>
  );
}