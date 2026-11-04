"use client";

import { getSession, signIn, signOut } from "next-auth/react";

import { DASHBOARD_PREFIX } from "@/config/private-routes";
import { fetchMe } from "@/lib/api";
import { setAccessToken } from "@/lib/auth";
import type { Me } from "@/lib/types";
import { useUserStore } from "@/stores/user-store";

export type LoginProvider = "password" | "google" | "telegram";

const FALLBACK_ERROR = "Kirishda xatolik yuz berdi.";

/**
 * Kirish: next-auth sessiyasi ochiladi (JWT httpOnly cookie'da), keyin
 * profil yuklanadi va store'ga yoziladi. Xato bo'lsa backend xabari bilan
 * `Error` tashlaydi — forma uni shundayligicha ko'rsatadi.
 */
export async function signInWith(
  provider: LoginProvider,
  credentials: Record<string, string>
): Promise<Me> {
  const result = await signIn(provider, { ...credentials, redirect: false });
  if (!result || result.error) {
    throw new Error(
      !result?.error || result.error === "CredentialsSignin" ? FALLBACK_ERROR : result.error
    );
  }

  const session = await getSession();
  if (!session?.accessToken) throw new Error(FALLBACK_ERROR);

  setAccessToken(session.accessToken);
  const me = await fetchMe();
  useUserStore.getState().signIn(session.accessToken, me);
  return me;
}

/**
 * Proxy kirish sahifasiga qo'shgan `?next=` manzili — faqat kabinet ichidagi
 * yo'l qabul qilinadi (boshqa saytga ochiq yo'naltirish bo'lmasin).
 */
export function loginNext(): string | null {
  if (typeof window === "undefined") return null;
  const next = new URLSearchParams(window.location.search).get("next");
  return next && next.startsWith(`${DASHBOARD_PREFIX}/`) && !next.startsWith("//")
    ? next
    : null;
}

/** Chiqish: store tozalanadi va next-auth cookie'si o'chiriladi. */
export async function signOutEverywhere() {
  useUserStore.getState().signOut();
  await signOut({ redirect: false });
}
