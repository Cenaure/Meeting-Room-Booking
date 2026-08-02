"use client"

import {useRouter} from "next/navigation";
import Modal from "@/components/ui/shared/modal/modal";
import {ReactNode} from "react";

export default function RoutedModal({children}: { children: ReactNode }) {
  const router = useRouter();
  return <Modal onClose={() => router.back()}>{children}</Modal>;
}