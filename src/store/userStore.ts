import { create } from "zustand";
import { persist } from "zustand/middleware";
import { pickRandomColor } from "@/lib/utils";
import { Api } from "@/lib/api";

interface UserState {
  id: string | null;
  username: string | null;
  color: string | null;
  nextClaimAt: number;
  login: (username: string, color: string) => Promise<void>;
  setIdentity: (username: string, color: string, id: string) => void;
  clear: () => void;
  setNextClaimAt: (at: number) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      id: null,
      username: null,
      color: null,
      nextClaimAt: 0,

      login: async (username, color) => {
        try {
          const user = await Api.createUser(username, color);
          set({
            id: user.id,
            username: user.username,
            color: user.color,
          });
        } catch (error) {
          console.error("Login failed:", error);
          throw error;
        }
      },

      setIdentity: (username, color, id) =>
        set({
          id,
          username: username.trim(),
          color: color || pickRandomColor(),
        }),

      clear: () => set({ id: null, username: null, color: null, nextClaimAt: 0 }),
      setNextClaimAt: (at) => set({ nextClaimAt: at }),
    }),
    {
      name: "ltc.user",
      partialize: (s) => ({ id: s.id, username: s.username, color: s.color }),
    },
  ),
);
