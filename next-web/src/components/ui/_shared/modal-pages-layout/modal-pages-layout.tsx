import {ReactNode} from "react";
import Link from "next/link";
import {ArrowBendDownLeftIcon} from "@phosphor-icons/react/ssr";

export default function ModalPagesLayout({children}: { children: ReactNode }) {
  return (
    <div className="relative flex flex-col items-center justify-center h-screen">
      <Link
        href="/"
        className="md:absolute left-4 top-4 z-50 gap-4 flex items-center justify-center rounded-md p-2 hover:bg-surface-2/80 transition-colors"
        aria-label="Закрити"
      >
        <ArrowBendDownLeftIcon size={20} weight="bold"/>
        Перейти на головну
      </Link>
      {children}
    </div>
  );
}