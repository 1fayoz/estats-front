"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { AUTH_STORAGE_KEY } from "@/lib/auth";
import type { Me, Shop, Workspace } from "@/lib/types";

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
  /**
   * Qaysi hisob ochiq — o'ziniki yoki taklif qilingan hisob.
   *
   * Saqlanadi, chunki sahifa yangilanganda odam o'sha hisobda
   * qolishi kerak. Server a'zolikni har so'rovda qaytadan
   * tekshiradi, ya'ni bu yerdagi son ma'lumotni TANLAYDI — ochib
   * bermaydi. Buzib yozilgan son 403 bilan qaytadi.
   */
  workspaceId: number | null;
  hydrated: boolean;

  signIn: (accessToken: string, user: Me) => void;
  setUser: (user: Me) => void;
  setActiveShop: (shopId: number) => void;
  setWorkspace: (workspaceId: number) => void;
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
      workspaceId: null,
      hydrated: false,

      signIn: (accessToken, user) =>
        set({
          accessToken,
          user,
          activeShopId: resolveShop(user.shops, get().activeShopId),
          workspaceId: user.workspace?.id ?? null,
        }),
      setUser: (user) =>
        set({
          user,
          activeShopId: resolveShop(user.shops, get().activeShopId),
          workspaceId: user.workspace?.id ?? get().workspaceId,
        }),
      setActiveShop: (shopId) => set({ activeShopId: shopId }),
      // Hisob almashganda do'kon tanlovi ham bekor qilinadi: eski
      // do'kon yangi hisobda umuman yo'q va u 404 berardi.
      setWorkspace: (workspaceId) => set({ workspaceId, activeShopId: null }),
      signOut: () =>
        set({
          accessToken: null,
          user: null,
          activeShopId: null,
          workspaceId: null,
        }),
      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
        activeShopId: state.activeShopId,
        workspaceId: state.workspaceId,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

export const useIsAuthenticated = () => useUserStore((s) => Boolean(s.accessToken));
//: Bo'sh ro'yxat — YAGONA nusxa.
//
// `?? []` har chaqiruvda YANGI massiv qaytaradi, `useSyncExternalStore`
// esa buni "holat o'zgardi" deb o'qiydi va cheksiz qayta render
// boshlanadi ("The result of getServerSnapshot should be cached").
// O'zgarmas nusxa bilan bunday bo'lmaydi.
const NO_SHOPS: Shop[] = [];
export const useShops = () => useUserStore((s) => s.user?.shops ?? NO_SHOPS);

/** The shop currently in scope, or null before one is chosen. */
export const useActiveShop = (): Shop | null =>
  useUserStore((s) => s.user?.shops.find((x) => x.id === s.activeShopId) ?? null);

/**
 * Shu hisobda ochiq ruxsatlar.
 *
 * Bo'sh ro'yxat — hech nima ocholmaydi. Hisob egasida backend
 * hamma kodni qaytaradi, ya'ni bu yerda "egasimi" degan alohida
 * shart kerak emas: ro'yxatning o'zi yetarli.
 */
/**
 * Ochiq ruxsatlar. `undefined` — backend ruxsat haqida gapirmayapti
 * (eski versiya): chaqiruvchilar buni "hammasi ochiq" deb o'qiydi.
 */
export const useActions = (): string[] | undefined =>
  useUserStore((s) => s.user?.actions);

/** Shu bo'limga ruxsat bormi. */
export function useCan(code: string | undefined): boolean {
  return useUserStore((s) => {
    if (!code) return true;
    const actions = s.user?.actions;
    return actions === undefined || actions.includes(code);
  });
}

export const useWorkspace = (): Workspace | null =>
  useUserStore((s) => s.user?.workspace ?? null);

export const useWorkspaces = (): Workspace[] =>
  useUserStore((s) => s.user?.workspaces ?? []);
