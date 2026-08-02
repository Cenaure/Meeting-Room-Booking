import {create} from "zustand";

interface ModalStore {
  close: boolean;
  setClose: (close: boolean) => void;
}

export const useModal = create<ModalStore>((set) => ({
  close: false,
  setClose: (close) => set({close}),
}))
