"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserState {
  username: string | null;
  storeName: string | null;
  setUser: (data: { username: string; storeName?: string }) => void;
  signOut: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      username: null,
      storeName: null,
      setUser: ({ username, storeName }) =>
        set({ username, storeName: storeName ?? username }),
      signOut: () => set({ username: null, storeName: null }),
    }),
    { name: "mystats-user" }
  )
);
