import {create} from "zustand";

interface AsideStore {
  isActive: boolean;
  setIsActive: (active: boolean) => void;
}

export const useAside = create<AsideStore>((set) => ({
  isActive: true,
  setIsActive: (active) => set({isActive: active}),
}))
