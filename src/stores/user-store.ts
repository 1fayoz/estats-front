"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { AUTH_STORAGE_KEY } from "@/lib/auth";
import type { Me, Shop } from "@/lib/types";

interface AuthState {
  /** Backend-issued JWT — the only credential kept on this device. */
  accessToken: string | null;
  storeName: string | null;
  /** Every Uzum shop the seller's token covers. */
  shops: Shop[];
  userId: number | null;
  /** True once persisted state has been read back (avoids an SSR/hydration flash). */
  hydrated: boolean;

  signIn: (accessToken: string, user: Me) => void;
  setUser: (user: Me) => void;
  signOut: () => void;
  setHydrated: (value: boolean) => void;
}

export const useUserStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      storeName: null,
      shops: [],
      userId: null,
      hydrated: false,

      signIn: (accessToken, user) =>
        set({
          accessToken,
          storeName: user.storeName,
          shops: user.shops,
          userId: user.id,
        }),
      setUser: (user) =>
        set({ storeName: user.storeName, shops: user.shops, userId: user.id }),
      signOut: () => set({ accessToken: null, storeName: null, shops: [], userId: null }),
      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      // `hydrated` is runtime-only and must never come back from storage as `true`.
      partialize: (state) => ({
        accessToken: state.accessToken,
        storeName: state.storeName,
        shops: state.shops,
        userId: state.userId,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

/** Reactive helper: is there a session? */
export const useIsAuthenticated = () => useUserStore((s) => Boolean(s.accessToken));
