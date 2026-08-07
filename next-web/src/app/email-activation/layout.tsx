import {ReactNode} from "react";
import {Metadata} from "next";

export default function EmailActivationLayout({children}: { children: ReactNode }) {
  return <>{children}</>;
}

export const metadata: Metadata = {
  title: "Підтвердження пошти",
  robots: {
    index: false,
    follow: false,
  }
}