"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";

import { useUserStore } from "@/stores/user-store";
import { ApiError, SESSION_EXPIRED_EVENT, fetchMe } from "@/lib/api";
import { AUTH_STORAGE_KEY } from "@/lib/auth";
import { sessionScopeChanged } from "@/lib/session-scope";
import { rememberReturn } from "@/lib/lens";
import { ALL_NAV_ITEMS, firstAllowedPath } from "@/config/nav";
import { SetPasswordGate } from "@/features/auth/components/set-password";
import { Button } from "@/components/ui/button";

/**
 * Protects the dashboard. Once the persisted session is rehydrated it sends the JWT to
 * `/auth/me`: no session or a rejected one lands the user back on the landing page,
 * and a valid one refreshes the store identity (shop renames show up without a
 * re-login). Dashboard data only ever renders behind a verified session.
 *
 * Sessiya SAHIFA ALMASHGANDA QAYTA tekshirilmaydi — faqat ilova ochilganda va
 * token o'zgarganda. Ilgari `pathname` bog'liqlikda turardi va har bosishda
 * butun kabinet yiqilib "Sessiya tekshirilmoqda..." ekrani chiqib ketardi:
 * bir sahifadan ikkinchisiga o'tish qorayib ko'rinardi va har o'tishda ortiqcha
 * `/auth/me` so'rovi ketardi.
 */
//: Magazini yo'q foydalanuvchi shu yerga tushadi — Uzum tokeni shu yerda.
const SETUP_PATH = "/integrations";
//: Kengaytmani ulash do'kon talab qilmaydi (bozor tahlili hamma uchun).
const EXTENSION_PATH = "/extension/";

/** Shu manzilni ochadigan ruxsat kodi (menyu ta'rifidan). */
function actionFor(pathname: string): string | undefined {
  const item = ALL_NAV_ITEMS.filter((nav) =>
    pathname === nav.href || pathname.startsWith(`${nav.href}/`)
  )
    // Eng aniq moslik: `/warehouse` va `/warehouse/x` bo'lsa
    // uzunrog'i to'g'ri javob.
    .sort((a, b) => String(b.href).length - String(a.href).length)[0];
  return item?.action;
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const accessToken = useUserStore((s) => s.accessToken);
  const hydrated = useUserStore((s) => s.hydrated);
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);
  const signOut = useUserStore((s) => s.signOut);
  const [checked, setChecked] = React.useState(false);

  React.useEffect(() => {
    if (!hydrated) return;

    if (!accessToken) {
      // Landing emas, kirish sahifasi: bu odam allaqachon kabinetga
      // kirmoqchi bo'lgan, unga mahsulotni qaytadan tanishtirish emas,
      // kirish formasini ko'rsatish kerak.
      // Kengaytmani ulash sahifasi kirgandan keyin o'ziga QAYTADI —
      // aks holda `state` yo'qolib, sotuvchi ulashni boshidan boshlardi.
      rememberReturn(`${window.location.pathname}${window.location.search}`);
      router.replace("/login");
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
          signOut();
          router.replace("/login");
          return;
        }
      }
      if (active) setChecked(true);
    })();

    return () => {
      active = false;
    };
  }, [hydrated, accessToken, router, setUser, signOut]);

  // Ish davomida istalgan so'rov 401 olsa — sessiya tugagan: chiqarib,
  // kirish sahifasiga. Token o'chgach keyingi so'rovlar tokensiz ketadi va
  // hodisa qayta yuborilmaydi, ya'ni sikl bo'lmaydi.
  React.useEffect(() => {
    const onExpired = () => {
      if (!useUserStore.getState().accessToken) return;
      signOut();
      router.replace("/login");
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, [router, signOut]);

  // Boshqa oynada do'kon/hisob almashsa, chiqilsa yoki boshqa odam kirsa:
  // localStorage umumiy, ya'ni shu oynaning keyingi so'rovlari YANGI
  // `X-Shop-Id` bilan ketadi, ekranda esa ESKI do'kon ma'lumoti (qoralama,
  // forma) turibdi — saqlash boshqa do'konga yozilib ketardi. Shu sabab
  // oyna to'liq qayta yuklanadi (shop-switcher bilan bir xil yo'l).
  React.useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.storageArea !== window.localStorage) return;
      // `key === null` — localStorage.clear().
      if (event.key !== null && event.key !== AUTH_STORAGE_KEY) return;
      if (sessionScopeChanged(event.oldValue, event.newValue)) window.location.reload();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

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
  // `null` — bu hisobda birorta ham bo'lim ochiq emas: yo'naltiradigan
  // joy yo'q, quyida "ruxsat yo'q" ekrani chiqadi.
  const firstAllowed = React.useMemo(
    () => firstAllowedPath(user?.actions ?? []),
    [user?.actions]
  );

  React.useEffect(() => {
    if (checked && !allowed && firstAllowed) {
      router.replace(firstAllowed as Parameters<typeof router.replace>[0]);
    }
  }, [checked, allowed, firstAllowed, router]);

  // Birinchi Google kirishidan keyin parol MAJBURIY: kabinet o'rniga
  // shu ekran. `hasPassword === undefined` — eski backend, so'ralmaydi;
  // emailsiz (Telegram orqali kirgan) a'zo parol bilan kira olmaydi.
  if (checked && user?.email && user.hasPassword === false) {
    return <SetPasswordGate />;
  }

  // Hech qaysi bo'lim ochiq emas. Spinner o'rniga tushunarli ekran:
  // topbar chizilmaydi, ya'ni chiqish va hisob almashtirish shu yerda
  // bo'lmasa odam bu holatdan umuman chiqa olmasdi.
  if (checked && accessToken && user && !allowed && firstAllowed === null) {
    return <NoAccess />;
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

/** Joriy hisobda birorta ham ruxsat yo'q a'zo uchun ekran. */
function NoAccess() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const setWorkspace = useUserStore((s) => s.setWorkspace);
  const signOut = useUserStore((s) => s.signOut);
  const others = (user?.workspaces ?? []).filter((ws) => ws.id !== user?.workspace?.id);

  return (
    <div className="flex h-svh items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-4 text-center">
        <h1 className="text-lg font-semibold">Bu hisobda ruxsatingiz yo&apos;q</h1>
        <p className="text-sm text-muted-foreground">
          {user?.workspace?.name ? `«${user.workspace.name}» hisobida` : "Bu hisobda"} sizga
          birorta ham bo&apos;lim ochilmagan. Hisob egasidan ruxsat berishini so&apos;rang.
        </p>
        {others.length > 0 ? (
          <div className="space-y-2">
            {others.map((ws) => (
              <Button
                key={ws.id}
                variant="outline"
                className="w-full"
                onClick={() => {
                  setWorkspace(ws.id);
                  // Topbar'dagi almashtirgich bilan bir xil yo'l: to'liq
                  // qayta yuklash, AuthGuard yangi hisob ruxsatiga qarab
                  // yo'naltiradi.
                  window.location.assign("/warehouse");
                }}
              >
                «{ws.name}» hisobiga o&apos;tish
              </Button>
            ))}
          </div>
        ) : null}
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => {
            signOut();
            router.push("/");
          }}
        >
          Chiqish
        </Button>
      </div>
    </div>
  );
}
