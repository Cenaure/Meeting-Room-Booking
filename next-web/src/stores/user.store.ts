import {create} from "zustand";
import {User} from "@/models/user";
import {getMe} from "@/app/(misc)/actions/user/get-me";
import axios from "axios";

interface UserStore {
  user: User | null;
  setUser: (user: User | null) => void;
  initializeUser: () => Promise<void>;
  updateUser: () => Promise<void>;
  isLoaded: boolean;
}

export async function refreshUser(setUser: (user: User | null) => void) {
  try {
    await axios.post<{ accessToken: string }>(
      "/api/auth/refresh",
      null,
      {withCredentials: true},
    );

    const user = await getMe()
    return user.ok ? user.data : null;
  } catch (e) {
    setUser(null);
  }
}


export const useUser = create<UserStore>((set, get) => ({
  user: null,
  isLoaded: false,
  setUser: (user) => set({user}),

  updateUser: async () => {
    try {
      const response = await refreshUser(get().setUser);
      const user = response ?? null;

      if (!user) return set({user: null});

      set({user: user});
    } catch (error) {
      console.error("Error updating user:", error);
    }
  },

  initializeUser: async () => {
    if (get().isLoaded) return;

    try {
      const response = await getMe();

      const user = response.ok ? response.data : null;

      if (!user) {
        return get().updateUser();
      }

      set({user});
    } finally {
      set({isLoaded: true});
    }
  }
}));