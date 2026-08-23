"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { AUTH_STORAGE_KEY } from "@/lib/auth";
import type { Me, Shop } from "@/lib/types";

interface AuthState {
  /** Backend-issued JWT — the only credential kept on this device. */
  accessToken: string | null;
  user: Me | null;
  /**
   * The shop every request is about. Persisted, so a reload keeps you in the same
   * shop; validated against the user's shops on rehydrate so a stale id from a
   * deleted shop can't pin the app to nothing.
   */
  activeShopId: number | null;
  hydrated: boolean;

  signIn: (accessToken: string, user: Me) => void;
  setUser: (user: Me) => void;
  setActiveShop: (shopId: number) => void;
  signOut: () => void;
  setHydrated: (value: boolean) => void;
}

/** The stored shop if it still exists, else the default one, else the first. */
function resolveShop(shops: Shop[], preferred: number | null): number | null {
  if (!shops.length) return null;
  if (preferred && shops.some((s) => s.id === preferred)) return preferred;
  return (shops.find((s) => s.isDefault) ?? shops[0]).id;
}

export const useUserStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      activeShopId: null,
      hydrated: false,

      signIn: (accessToken, user) =>
        set({
          accessToken,
          user,
          activeShopId: resolveShop(user.shops, get().activeShopId),
        }),
      setUser: (user) =>
        set({ user, activeShopId: resolveShop(user.shops, get().activeShopId) }),
      setActiveShop: (shopId) => set({ activeShopId: shopId }),
      signOut: () => set({ accessToken: null, user: null, activeShopId: null }),
      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
        activeShopId: state.activeShopId,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

export const useIsAuthenticated = () => useUserStore((s) => Boolean(s.accessToken));
export const useShops = () => useUserStore((s) => s.user?.shops ?? []);

/** The shop currently in scope, or null before one is chosen. */
export const useActiveShop = (): Shop | null =>
  useUserStore((s) => s.user?.shops.find((x) => x.id === s.activeShopId) ?? null);
