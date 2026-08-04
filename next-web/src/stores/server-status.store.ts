import {create} from "zustand";

interface ServerStatusStore {
  isDown: boolean;
  setIsDown: (isDown: boolean) => void;
}

export const useServerStatus = create<ServerStatusStore>((set) => ({
  isDown: false,
  setIsDown: (isDown) => set({isDown}),
}))