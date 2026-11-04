"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";

import { useUserStore } from "@/stores/user-store";
import { ApiError, SESSION_EXPIRED_EVENT, fetchMe } from "@/lib/api";
import { rememberReturn } from "@/lib/lens";
import { ALL_NAV_ITEMS, visibleNav } from "@/config/nav";
import { LOGIN_PATH } from "@/config/private-routes";
import { SetPasswordGate } from "@/features/auth/components/set-password";
import { signOutEverywhere } from "@/features/auth/session";

/**
 * Protects the dashboard. `proxy.ts` already turns away requests without a session
 * cookie; here the next-auth session's JWT is checked against `/auth/me`: a rejected
 * or expired one ends the session and lands on the login page, and a valid one
 * refreshes the store identity (shop renames show up without a re-login). Dashboard
 * data only ever renders behind a verified session.
 *
 * Sessiya SAHIFA ALMASHGANDA QAYTA tekshirilmaydi — faqat ilova ochilganda va
 * token o'zgarganda. Ilgari `pathname` bog'liqlikda turardi va har bosishda
 * butun kabinet yiqilib "Sessiya tekshirilmoqda..." ekrani chiqib ketardi:
 * bir sahifadan ikkinchisiga o'tish qorayib ko'rinardi va har o'tishda ortiqcha
 * `/auth/me` so'rovi ketardi.
 */
//: Magazini yo'q foydalanuvchi shu yerga tushadi — Uzum tokeni shu yerda.
const SETUP_PATH = "/dashboard/integrations";
//: Kengaytmani ulash do'kon talab qilmaydi (bozor tahlili hamma uchun).
const EXTENSION_PATH = "/dashboard/extension/";

/** Shu manzilni ochadigan ruxsat kodi (menyu ta'rifidan). */
function actionFor(pathname: string): string | undefined {
  const item = ALL_NAV_ITEMS.filter((nav) =>
    pathname === nav.href || pathname.startsWith(`${nav.href}/`)
  )
    // Eng aniq moslik: `/dashboard/warehouse` va `/dashboard/warehouse/x` bo'lsa
    // uzunrog'i to'g'ri javob.
    .sort((a, b) => String(b.href).length - String(a.href).length)[0];
  return item?.action;
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const accessToken =
    status === "authenticated" && !session?.error ? session.accessToken : null;
  const hydrated = useUserStore((s) => s.hydrated);
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);
  const [checked, setChecked] = React.useState(false);

  const leave = React.useCallback(async () => {
    await signOutEverywhere();
    router.replace(LOGIN_PATH);
  }, [router]);

  React.useEffect(() => {
    if (!hydrated || status === "loading") return;

    if (!accessToken) {
      // Landing emas, kirish sahifasi: bu odam allaqachon kabinetga
      // kirmoqchi bo'lgan, unga mahsulotni qaytadan tanishtirish emas,
      // kirish formasini ko'rsatish kerak.
      // Kengaytmani ulash sahifasi kirgandan keyin o'ziga QAYTADI —
      // aks holda `state` yo'qolib, sotuvchi ulashni boshidan boshlardi.
      rememberReturn(`${window.location.pathname}${window.location.search}`);
      void leave();
      return;
    }

    let active = true;
    (async () => {
      try {
        const me = await fetchMe();
        if (!active) return;
        setUser(me);
      } catch (err) {
        if (!active) return;
        // A backend that's merely unreachable must not log the seller out — only an
        // actual rejection of the session does.
        if (err instanceof ApiError && err.isAuthError) {
          void leave();
          return;
        }
      }
      if (active) setChecked(true);
    })();

    return () => {
      active = false;
    };
  }, [hydrated, status, accessToken, leave, setUser]);

  // Ish davomida istalgan so'rov 401 olsa — sessiya tugagan: chiqarib,
  // kirish sahifasiga. Token o'chgach keyingi so'rovlar tokensiz ketadi va
  // hodisa qayta yuborilmaydi, ya'ni sikl bo'lmaydi.
  React.useEffect(() => {
    const onExpired = () => {
      if (!useUserStore.getState().accessToken) return;
      void leave();
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, [leave]);

  // Ruxsati yo'q sahifa. Menyudan yashiringan bo'lsa ham manzilni
  // qo'lda yozish yoki eski xatcho'p qolishi mumkin — u holda
  // 403 va bo'sh ekran o'rniga birinchi ochiq bo'limga olib boriladi.
  const needed = actionFor(pathname);
  const allowed =
    !checked ||
    user == null ||
    !needed ||
    user.actions === undefined ||
    user.actions.includes(needed);
  const firstAllowed = React.useMemo(() => {
    const groups = visibleNav(user?.actions ?? []);
    const firstGroupItem = groups[0]?.items[0];
    const target = firstGroupItem?.children?.[0]?.href ?? firstGroupItem?.href ?? "/dashboard/market";
    return target;
  }, [user?.actions]);

  React.useEffect(() => {
    if (checked && !allowed) {
      router.replace(firstAllowed as Parameters<typeof router.replace>[0]);
    }
  }, [checked, allowed, firstAllowed, router]);

  // Birinchi Google kirishidan keyin parol MAJBURIY: kabinet o'rniga
  // shu ekran. `hasPassword === undefined` — eski backend, so'ralmaydi;
  // emailsiz (Telegram orqali kirgan) a'zo parol bilan kira olmaydi.
  if (checked && user?.email && user.hasPassword === false) {
    return <SetPasswordGate />;
  }

  if (
    !hydrated ||
    !accessToken ||
    !checked ||
    !allowed
  ) {
    return (
      <div className="flex h-svh items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          Sessiya tekshirilmoqda...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
