"use client"

import Image from "next/image";
import Button from "@/components/ui/shared/button/button";
import TextInput from "@/components/ui/shared/inputs/text-input";
import {SignInFormValues, signInSchema} from "@/lib/schemas/sign-in.zod.schema";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {signIn} from "@/components/ui/auth/sign-in/actions";
import React from "react";
import {useUser} from "@/stores/user.store";
import {useRouter} from "next/navigation";
import {useModal} from "@/stores/modal.store";
import {sign_up_route} from "@/lib/routes";

export default function SignInComponent() {
  const setUser = useUser(state => state.setUser);
  const setClose = useModal(state => state.setClose)

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: {errors, isSubmitting},
    setError,
    clearErrors
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
  });

  async function onSubmit(values: SignInFormValues) {
    clearErrors();

    const result = await signIn(values.email, values.password);

    if (!result.ok) {
      setError("root", {message: result.message});
      return;
    }

    setUser(result.data.user);

    setClose(true)

    router.back()
  }

  const handleContinueWithGoogle = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    window.location.href =
      process.env.NEXT_PUBLIC_API_URL + "/auth/google/sign-in";
  }

  return (
    <div
      className="md:grid md:grid-cols-2 md:max-w-4xl mx-auto relative bg-surface-0 md:rounded-md shadow-xs ring-2 ring-border">
      <form onSubmit={handleSubmit(onSubmit)} className="p-4 md:p-8 space-y-2 w-screen h-screen md:h-auto md:w-md">
        <h1 className="mb-8 w-full text-2xl font-bold text-center">
          Вхід до акаунту
        </h1>

        <TextInput
          label="Введіть Вашу пошту"
          type="email"
          placeholder="example@gmail.com"
          {...register("email")}
          error={errors.email?.message}
        />

        <TextInput
          label="Введіть Ваш пароль"
          type="password"
          placeholder="******"
          {...register("password")}
          error={errors.password?.message}
        />

        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-red-500 text-sm min-h-10 w-full">
              {errors.root?.message ?? " "}
            </p>

            <Button
              fullWidth
              size="lg"
              loading={isSubmitting}
              type="submit"
            >
              Вхід
            </Button>
          </div>

          <div className="relative">
            <div
              className="absolute inset-0 flex items-center"
            >
              <span className="w-full border-t"/>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-2 bg-surface-0">Або</span>
            </div>
          </div>

          <Button
            className="gap-2"
            variant="outline"
            size="lg"
            fullWidth
            type="button"
            onClick={(e) => handleContinueWithGoogle(e)}
          >
            <Image
              src="/auth/google-logo.webp"
              alt="Google"
              width={20}
              height={20}
            />
            Увійти за допомогою Google
          </Button>
        </div>

        <div className="mt-2 gap-2 text-sm flex items-center justify-center">
          <p className="text-foreground/60">Не маєте акаунту?</p>

          <button
            type="button"
            className="text-lavender-400 underline underline-offset-2 hover:text-lavender-500"
            onClick={() => router.replace(sign_up_route)}
          >
            Створити обліковий запис
          </button>
        </div>
      </form>

      <div className="hidden md:block">
        <div className="relative h-full w-full">
          <Image
            src="/auth/sign-in-fox.svg"
            alt="Cute fox looking at the sign in form"
            objectFit="cover"
            fill
            className="rounded-r-md object-contain"
            priority
          />
        </div>
      </div>
    </div>
  )
}