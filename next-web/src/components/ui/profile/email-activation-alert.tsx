"use client"

import {useEffect, useRef, useState} from "react";
import Button from "@/components/ui/shared/button/button";
import {MailboxIcon} from "@phosphor-icons/react/ssr";
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
      className="flex items-center justify-between gap-4 rounded-md border border-amber-400/40 bg-amber-400/10 px-4 py-3">
      <div className="flex items-center gap-2 text-sm">
        <MailboxIcon size={18} className="shrink-0 text-amber-500"/>
        <span>
          Ваша пошта не активована.{" "}
          {error && <span className="text-red-500">{error}</span>}
        </span>
      </div>

      <Button
        size="sm"
        variant="outline"
        type="button"
        loading={isSending}
        disabled={secondsLeft > 0 || isSending}
        onClick={handleResend}
      >
        {secondsLeft > 0 ? `Повторно через ${secondsLeft}с` : "Надіслати лист"}
      </Button>
    </div>
  );
}