import {ReactNode} from "react";
import ModalPagesLayout from "@/components/ui/_shared/modal-pages-layout/modal-pages-layout";

export default function SettingsLayout({children}: { children: ReactNode }) {
  return <ModalPagesLayout>
    {children}
  </ModalPagesLayout>
}