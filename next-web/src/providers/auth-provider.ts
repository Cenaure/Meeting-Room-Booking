"use client"

import {ReactNode, useEffect} from "react";
import {useUser} from "@/stores/user.store";

export function AuthProvider({children}: { children: ReactNode }) {
  const initializeUser = useUser((store) => store.initializeUser);

  useEffect(() => {
    async function bootstrap() {
      await initializeUser();
    }

    bootstrap();
  }, []);

  return children;
}