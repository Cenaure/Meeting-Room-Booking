"use client"

import {useRouter} from "next/navigation";
import Modal, {ModalProps} from "@/components/ui/shared/modal/modal";

export default function RoutedModal({children, ...props}: Omit<ModalProps, "onClose">) {
  const router = useRouter();
  return <Modal onClose={() => router.back()} {...props}>{children}</Modal>
}