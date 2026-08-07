"use client";

import {useEffect, useRef, useState} from "react";
import Button from "@/components/ui/_shared/button/button";
import {EnvelopeSimpleIcon} from "@phosphor-icons/react/ssr";
import {resendActivation} from "@/app/settings/actions";

const COOLDOWN_SECONDS = 60;

export default function EmailActivationAlert() {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startCooldown = () => {
    setSecondsLeft(COOLDOWN_SECONDS);
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResend = async () => {
    setError(null);
    setIsSending(true);

    const result = await resendActivation();

    setIsSending(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    startCooldown();
  };

  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 rounded-md border border-amber-500/30 bg-amber-50 dark:bg-amber-950/30 p-4 text-amber-900 dark:text-amber-200 transition-all">
      <div className="flex items-start gap-3">
        <EnvelopeSimpleIcon
          size={20}
          className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
        />
        <div className="flex flex-col gap-0.5 text-sm">
          <span className="font-medium leading-snug">
            Вашу електронну пошту не підтверджено
          </span>
          <span className="text-xs text-amber-800/80 dark:text-amber-300/80">
            Ви не зможете бронювати кімнати, доки не підтвердите її.
          </span>
          {error && (
            <span className="mt-1 text-xs font-semibold text-red-600 dark:text-red-400">
              {error}
            </span>
          )}
        </div>
      </div>

      <Button
        size="auto"
        variant="none"
        type="button"
        loading={isSending}
        disabled={secondsLeft > 0 || isSending}
        onClick={handleResend}
        className="self-end sm:self-center shrink-0 whitespace-nowrap text-xs font-semibold text-amber-700 hover:text-amber-900 dark:text-amber-300 dark:hover:text-amber-100 underline decoration-amber-500/40 hover:decoration-amber-500 transition-colors disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
      >
        {secondsLeft > 0 ? `Повторно через ${secondsLeft}с` : "Надіслати лист"}
      </Button>
    </div>
  );
}