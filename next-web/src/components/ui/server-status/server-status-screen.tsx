"use client"

import Button from "../shared/button/button";
import {SmileySadIcon} from "@phosphor-icons/react/ssr";
import {ReactNode} from "react";
import {useServerStatus} from "@/stores/server-status.store";

export default function ServerStatusScreen({children}: { children: ReactNode }) {
  const isDown = useServerStatus(state => state.isDown);

  if (isDown) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-0">
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <SmileySadIcon size={32} className="text-foreground/60"/>
          <p className="text-sm font-medium">Застосунок тимчасово недоступний</p>
          <p className="max-w-sm text-xs text-foreground/60">
            Ми вже знаємо про проблему і працюємо над її вирішенням. Спробуйте оновити сторінку за кілька хвилин.
          </p>
          <Button onClick={() => window.location.reload()}>
            Спробувати ще раз
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}