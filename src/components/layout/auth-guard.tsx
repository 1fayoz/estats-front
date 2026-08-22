"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { useUserStore } from "@/stores/user-store";
import { ApiError, fetchMe } from "@/lib/api";

/**
 * Protects the dashboard. Once the persisted session is rehydrated it sends the JWT to
 * `/auth/me`: no session or a rejected one lands the user back on the landing page,
 * and a valid one refreshes the store identity (shop renames show up without a
 * re-login). Dashboard data only ever renders behind a verified session.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const accessToken = useUserStore((s) => s.accessToken);
  const hydrated = useUserStore((s) => s.hydrated);
  const setUser = useUserStore((s) => s.setUser);
  const signOut = useUserStore((s) => s.signOut);
  const [checked, setChecked] = React.useState(false);

  React.useEffect(() => {
    if (!hydrated) return;

    if (!accessToken) {
      router.replace("/");
      return;
    }

    let active = true;
    setChecked(false);
    (async () => {
      try {
        const me = await fetchMe();
        if (!active) return;
        setUser(me);
        setChecked(true);
      } catch (err) {
        if (!active) return;
        // A backend that's merely unreachable must not log the seller out — only an
        // actual rejection of the session does.
        if (err instanceof ApiError && err.isAuthError) {
          signOut();
          router.replace("/");
          return;
        }
        setChecked(true);
      }
    })();

    return () => {
      active = false;
    };
  }, [hydrated, accessToken, router, setUser, signOut]);

  if (!hydrated || !accessToken || !checked) {
    return (
      <div className="flex h-svh items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          Sessiya tekshirilmoqda...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
