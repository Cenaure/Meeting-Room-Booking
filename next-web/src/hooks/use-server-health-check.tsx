import {useServerStatus} from "@/stores/server-status.store";
import {useEffect} from "react";

export function useServerHealthCheck() {
  const isDown = useServerStatus(state => state.isDown);
  const setDown = useServerStatus(state => state.setIsDown);

  useEffect(() => {
    if (!isDown) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "/health", {cache: "no-store"});
        if (response.ok) setDown(false);
      } catch (e) {
        console.log(e);
      }
    }, 5000)

    return () => clearInterval(interval);
  }, [isDown, setDown]);
}