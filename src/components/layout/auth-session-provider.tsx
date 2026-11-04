"use client";

import * as React from "react";
import { SessionProvider, useSession } from "next-auth/react";

import { setAccessToken } from "@/lib/auth";
import { useUserStore } from "@/stores/user-store";

/**
 * Sessiyadagi JWT'ni API klientiga va store'ga uzatadi.
 *
 * `useLayoutEffect`: bolalarning `useEffect`laridan (masalan AuthGuard'ning
 * `/auth/me` so'rovi) OLDIN ishlaydi, ya'ni birinchi so'rov tokensiz ketmaydi.
 */
function SessionBridge() {
  const { data, status } = useSession();
  const token = status === "authenticated" && !data?.error ? data.accessToken : null;

  React.useLayoutEffect(() => {
    setAccessToken(token);
    useUserStore.setState({ accessToken: token });
  }, [token]);

  return null;
}

/** Kabinet va kirish sahifalari uchun — landing'da kerak emas. */
export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionBridge />
      {children}
    </SessionProvider>
  );
}
