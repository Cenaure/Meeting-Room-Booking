"use client";

import {ReactNode, useEffect, useState} from "react";
import {useSearchParams} from "next/navigation";
import {CheckCircleIcon, CircleNotchIcon, XCircleIcon} from "@phosphor-icons/react/ssr";
import {activateEmail} from "@/app/email-activation/actions";
import {useUser} from "@/stores/user.store";
import ButtonLink from "@/components/ui/_shared/button/button-link";

type ActivationState = "loading" | "success" | "error" | "invalid";

export default function EmailActivationPage() {
  const searchParams = useSearchParams();
  const activationLink = searchParams.get("activate");

  const updateUser = useUser((state) => state.updateUser);

  const [state, setState] = useState<ActivationState>("loading");

  useEffect(() => {
    let cancelled = false;

    async function activate() {
      if (!activationLink) {
        setState("invalid");
        return;
      }

      const result = await activateEmail(activationLink);
      if (cancelled) return;

      if (result.ok) {
        await updateUser();
        if (!cancelled) setState("success");
      } else {
        setState("error");
      }
    }

    activate();

    return () => {
      cancelled = true;
    };
  }, [activationLink]);

  const content: Record<
    Exclude<ActivationState, "loading">,
    { icon: ReactNode; title: string; description: string }
  > = {
    success: {
      icon: <CheckCircleIcon size={48} weight="fill" className="text-emerald-500"/>,
      title: "Пошту успішно підтверджено",
      description: "Тепер ви можете використовувати всі можливості сервісу та бронювати кімнати.",
    },
    invalid: {
      icon: <XCircleIcon size={48} weight="fill" className="text-red-500"/>,
      title: "Недійсне посилання",
      description: "Посилання для підтвердження відсутнє або має некоректний формат.",
    },
    error: {
      icon: <XCircleIcon size={48} weight="fill" className="text-red-500"/>,
      title: "Помилка підтвердження",
      description: "Не вдалося підтвердити пошту. Можливо, термін дії посилання закінчився або воно вже було використане.",
    },
  };

  if (state === "loading") {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
        <CircleNotchIcon size={24} className="animate-spin"/>
      </div>
    );
  }

  const {icon, title, description} = content[state];

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
      <div
        className="animate-in fade-in slide-in-from-bottom-5 flex max-w-sm flex-col items-center text-center duration-500">
        {icon}
        <h1 className="mt-4 text-xl font-medium ">{title}</h1>
        <p className="mt-2 text-sm text-foreground/60">{description}</p>

        <ButtonLink
          href="/"
          className="mt-4"
        >
          На головну
        </ButtonLink>
      </div>
    </div>
  );
}